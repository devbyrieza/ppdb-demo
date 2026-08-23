import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNomorPendaftaran } from "@/lib/utils/nomor-pendaftaran";
import {
  enqueueWhatsapp,
  buildMessageRegistrationSuccess } from "@/lib/whatsapp-queue";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otp_id } = body;

    if (!otp_id) {
      return NextResponse.json(
        { success: false, error: "OTP ID tidak valid" },
        { status: 400 },
      );
    }

    const otpRecord = await prisma.otpVerification.findUnique({
      where: { id: otp_id } });

    if (!otpRecord || !otpRecord.verified_at) {
      return NextResponse.json(
        { success: false, error: "OTP belum diverifikasi" },
        { status: 400 },
      );
    }

    const registrationData = (otpRecord.registration_data as any) || {};
    const {
      nik,
      nama_lengkap,
      tanggal_lahir,
      no_hp,
      jenis_kelamin,
      jenjang,
      email,
      telegram_username } = registrationData;

    const parseSafeDate = (val: any) => {
      if (!val) return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    };

    // Check if NIK already registered (ignore soft-deleted)
    const existing = await prisma.pendaftar.findFirst({
      where: { nik, deleted_at: null },
      select: { nomor_pendaftaran: true } });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `NIK sudah terdaftar dengan nomor ${existing.nomor_pendaftaran}` },
        { status: 409 },
      );
    }

    // Get active tahun ajaran (Robust logic)
    const tahunAjaran =
      (await prisma.tahunAjaran.findFirst({
        where: { is_active: true },
        select: { id: true } })) ||
      (await prisma.tahunAjaran.findFirst({
        orderBy: { created_at: "desc" },
        select: { id: true } }));

    if (!tahunAjaran) {
      console.error(
        "❌ Registration error: No academic year found in database.",
      );
      return NextResponse.json(
        {
          success: false,
          error: "Tahun ajaran tidak ditemukan. Hubungi admin." },
        { status: 500 },
      );
    }

    const nomorPendaftaran = await generateNomorPendaftaran(
      jenjang,
      jenis_kelamin,
    );

    const newPendaftar = await prisma.pendaftar.create({
      data: {
        nomor_pendaftaran: nomorPendaftaran,
        tahun_ajaran_id: tahunAjaran.id,
        nik,
        nama_lengkap,
        tanggal_lahir: parseSafeDate(tanggal_lahir),
        jenis_kelamin,
        jenjang,
        no_hp,
        email: email || null,
        verifikasi_channel: otpRecord.otp_channel || "sms",
        status_pendaftaran: "registered" } });

    // Send WhatsApp notification via Queue
    try {
      if (no_hp) {
        await enqueueWhatsapp({
          pendaftarId: newPendaftar.id,
          phone: no_hp,
          jenisNotif: "registration_success",
          messageContent: buildMessageRegistrationSuccess(
            nama_lengkap,
            nomorPendaftaran,
            jenjang,
          ),
          sendNow: true, // IMPORTANT: Bypass background queue for immediate UX
        });
      }
    } catch (error) {
      console.error("WhatsApp notification enqueue error:", error);
      // Don't fail registration if notification fails
    }

    // Delete OTP record
    await prisma.otpVerification.delete({ where: { id: otp_id } });

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil",
      data: {
        nomor_pendaftaran: nomorPendaftaran,
        nik,
        nama_lengkap,
        jenjang,
        jenis_kelamin } });
  } catch (error) {
    console.error("Complete registration error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
