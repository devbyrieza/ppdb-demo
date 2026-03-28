import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNomorPendaftaran } from "@/lib/utils/nomor-pendaftaran";
import { notifyRegistrationSuccess } from "@/lib/wablas";
import crypto from "crypto";

function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

import { normalizePhoneNumber } from "@/lib/validations/registration";

export async function POST(request: NextRequest) {
  try {
    const { no_hp, otp_code } = await request.json();

    if (!no_hp || !otp_code) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizePhoneNumber(no_hp);
    const hashedOTP = hashOTP(otp_code);

    // Verify OTP
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        otp_hash: hashedOTP,
        expires_at: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "Kode OTP salah atau kadaluarsa" },
        { status: 400 },
      );
    }

    const registrationData = (otpRecord.registration_data as any) || {};

    if (!registrationData) {
      return NextResponse.json(
        { success: false, error: "Data pendaftaran tidak ditemukan" },
        { status: 404 },
      );
    }

    // Get active tahun ajaran (Robust logic)
    const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { is_active: true },
      select: { id: true },
    });

    let tahunAjaranId = "";
    if (activeTahunAjaran) {
      tahunAjaranId = activeTahunAjaran.id;
    } else {
      // Fallback: Get the latest created tahun ajaran
      console.warn("⚠️ No active Tahun Ajaran found, falling back to latest created.");
      const latestTahunAjaran = await prisma.tahunAjaran.findFirst({
        orderBy: { created_at: "desc" },
        select: { id: true },
      });

      if (latestTahunAjaran) {
        tahunAjaranId = latestTahunAjaran.id;
      } else {
        return NextResponse.json(
          { success: false, error: "Sistem belum siap: Data Tahun Ajaran tidak ditemukan. Hubungi admin." },
          { status: 500 },
        );
      }
    }

    // Generate nomor pendaftaran
    const nomorPendaftaran = await generateNomorPendaftaran(
      registrationData.jenjang,
      registrationData.jenis_kelamin,
    );

    // Create profile for the pendaftar
    const profileId = crypto.randomUUID();
    await prisma.profile.create({
      data: {
        id: profileId,
        full_name: registrationData.nama_lengkap,
        phone: normalizedPhone,
        role: "pendaftar",
      },
    });

    // Insert pendaftar
    const pendaftar = await prisma.pendaftar.create({
      data: {
        nik: registrationData.nik,
        nama_lengkap: registrationData.nama_lengkap,
        tanggal_lahir: registrationData.tanggal_lahir
          ? new Date(registrationData.tanggal_lahir)
          : undefined,
        jenis_kelamin: registrationData.jenis_kelamin,
        jenjang: registrationData.jenjang,
        no_hp: registrationData.no_hp,
        email: registrationData.email || "",
        status_pendaftaran: "draft",
        user_id: profileId,
        tahun_ajaran_id: tahunAjaranId,
        nomor_pendaftaran: nomorPendaftaran,
      },
    });

    // Delete used OTP
    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    // Send WhatsApp Notification (Non-blocking)
    try {
      console.log(`📱 Sending registration success notification to ${registrationData.no_hp}`);
      await notifyRegistrationSuccess({
        phone: registrationData.no_hp,
        nama: registrationData.nama_lengkap,
        nomor_pendaftaran: nomorPendaftaran,
        jenjang: registrationData.jenjang,
      });
    } catch (waError) {
      console.error("❌ WhatsApp registration notification error:", waError);
      // We don't throw here to ensure the user still sees their registration was successful
    }

    return NextResponse.json({
      success: true,
      data: {
        nomor_pendaftaran: nomorPendaftaran,
        nama_lengkap: registrationData.nama_lengkap,
        jenjang: registrationData.jenjang,
        jenis_kelamin: registrationData.jenis_kelamin,
        nik: registrationData.nik,
        otp_id: otpRecord.id,
      },
    });
  } catch (error: any) {
    console.error("Verify API Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}
