import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { generateNomorPendaftaran } from "@/lib/utils/nomor-pendaftaran";
import { enqueueWhatsapp, buildMessageRegistrationSuccess } from "@/lib/whatsapp-queue";
import { normalizePhoneNumber, formatNamaLengkap } from "@/lib/validations/registration";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hanya admin yang bisa akses
    if (session.role === "pendaftar") {
      return NextResponse.json(
        { error: "Akses ditolak" },
        { status: 403 },
      );
    }

    const regData = await request.json();
    
    // Validasi basic
    if (!regData.nik || !regData.nama_lengkap || !regData.jenis_kelamin || !regData.jenjang || !regData.no_hp) {
      return NextResponse.json({ error: "Data wajib (NIK, Nama, Jenis Kelamin, Jenjang, No HP) tidak lengkap" }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(regData.no_hp);

    // Ambil Tahun Ajaran Aktif
    const activeTA = await prisma.tahunAjaran.findFirst({ where: { is_active: true } }) 
                  || await prisma.tahunAjaran.findFirst({ orderBy: { created_at: "desc" } });

    if (!activeTA) return NextResponse.json({ success: false, error: "Sistem belum siap: Tahun Ajaran tidak ditemukan" }, { status: 500 });

    // Cek duplikat NIK
    const existingPendaftar = await prisma.pendaftar.findFirst({
      where: { 
        nik: regData.nik,
        deleted_at: null 
      } });
    
    if (existingPendaftar) {
      return NextResponse.json({ 
        success: false, 
        error: "NIK ini sudah terdaftar. Gunakan NIK lain." 
      }, { status: 409 });
    }

    // Generate Nomor Pendaftaran Unik
    const nomorPendaftaran = await generateNomorPendaftaran(regData.jenjang, regData.jenis_kelamin);

    // PEMBUATAN AKUN (Profile & Pendaftar)
    const profileId = crypto.randomUUID();
    const pendaftarId = crypto.randomUUID();
    
    await prisma.$transaction([
      // A. Buat Profile untuk Login
      prisma.profile.create({
        data: { id: profileId, full_name: formatNamaLengkap(regData.nama_lengkap), phone: normalizedPhone, role: "pendaftar" } }),
      // B. Buat Data Pendaftaran Santri
      prisma.pendaftar.create({
        data: {
          id: pendaftarId,
          nik: regData.nik,
          nama_lengkap: formatNamaLengkap(regData.nama_lengkap),
          tempat_lahir: regData.tempat_lahir || undefined,
          tanggal_lahir: regData.tanggal_lahir ? new Date(regData.tanggal_lahir) : undefined,
          jenis_kelamin: regData.jenis_kelamin,
          jenjang: regData.jenjang,
          no_hp: normalizedPhone,
          email: regData.email || "",
          status_pendaftaran: "draft",
          user_id: profileId,
          tahun_ajaran_id: activeTA.id,
          nomor_pendaftaran: nomorPendaftaran,
          tipe_pendaftaran: regData.tipe_pendaftaran || "BARU",
          kelas_masuk: regData.kelas_masuk ? parseInt(regData.kelas_masuk) : undefined,
          asal_institusi: regData.asal_institusi || undefined,
          nisn: regData.nisn || undefined,
          npsn: regData.npsn || undefined,
          catatan_pindahan: regData.catatan_pindahan || undefined } }),
    ]);

    // Kirim Notifikasi Sukses via WhatsApp Queue
    await enqueueWhatsapp({
      pendaftarId: pendaftarId,
      phone: normalizedPhone,
      jenisNotif: "registration_success",
      messageContent: buildMessageRegistrationSuccess(regData.nama_lengkap, nomorPendaftaran, regData.jenjang) }).catch(e => console.error("WA Queue Error:", e.message));

    return NextResponse.json({
      success: true,
      message: "Pendaftaran Berhasil!",
      data: {
        nomor_pendaftaran: nomorPendaftaran,
        nama_lengkap: regData.nama_lengkap,
        nik: regData.nik,
        jenjang: regData.jenjang }
    });

  } catch (error: any) {
    console.error("ADMIN_TAMBAH_PENDAFTAR_ERROR:", error.message);
    return NextResponse.json({ success: false, error: error.message || "Gagal memproses pendaftaran" }, { status: 400 });
  }
}
