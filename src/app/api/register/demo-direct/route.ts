import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nik,
      nama_lengkap,
      tanggal_lahir,
      no_hp,
      jenis_kelamin,
      jenjang,
      nomor_pendaftaran,
    } = body;

    // Validasi input
    if (
      !nik ||
      !nama_lengkap ||
      !tanggal_lahir ||
      !no_hp ||
      !jenis_kelamin ||
      !jenjang ||
      !nomor_pendaftaran
    ) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 },
      );
    }

    console.log(`\n🎭 MODE DEMO - Direct Registration (Bypass OTP)`);
    console.log(`════════════════════════════════════════════════`);
    console.log(`Nama: ${nama_lengkap}`);
    console.log(`NIK: ${nik}`);
    console.log(`Nomor: ${nomor_pendaftaran}`);
    console.log(`════════════════════════════════════════════════\n`);

    // 1. Get tahun ajaran aktif
    const tahunAjaranData = await prisma.tahunAjaran.findFirst({
      where: { is_active: true },
      select: { id: true },
    });

    if (!tahunAjaranData) {
      return NextResponse.json(
        { error: "Tahun ajaran aktif tidak ditemukan. Hubungi admin." },
        { status: 404 },
      );
    }

    const tahun_ajaran_id = tahunAjaranData.id;

    // 2. Cek apakah NIK sudah terdaftar di tahun ajaran ini
    const existingPendaftar = await prisma.pendaftar.findFirst({
      where: {
        nik: nik,
        tahun_ajaran_id: tahun_ajaran_id,
      },
      select: { nomor_pendaftaran: true },
    });

    if (existingPendaftar) {
      return NextResponse.json(
        {
          error: "NIK sudah terdaftar di tahun ajaran ini",
          nomor_pendaftaran: existingPendaftar.nomor_pendaftaran,
        },
        { status: 409 },
      );
    }

    // 3. Insert pendaftar langsung
    // NOTE: user_id is optional in Schema now.
    const pendaftarData = await prisma.pendaftar.create({
      data: {
        tahun_ajaran_id,
        nomor_pendaftaran,
        nik,
        nama_lengkap,
        tanggal_lahir: new Date(tanggal_lahir),
        no_hp,
        jenis_kelamin,
        jenjang,
        status_pendaftaran: "draft", // Status draft untuk mode demo
        // user_id left null for demo mode without auth user
        // password_hash is optional/null
      },
    });

    console.log(`✅ Pendaftaran sukses!`);
    console.log(`   ID: ${pendaftarData.id}`);
    console.log(`   Nomor: ${nomor_pendaftaran}`);
    console.log(`   Status: ${pendaftarData.status_pendaftaran}`);

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil (Mode Demo)",
      data: {
        id: pendaftarData.id,
        nomor_pendaftaran,
        nama_lengkap,
        nik,
        jenjang,
        jenis_kelamin,
        status_pendaftaran: pendaftarData.status_pendaftaran,
      },
    });
  } catch (error: any) {
    console.error("❌ Demo Registration Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat mendaftar" },
      { status: 500 },
    );
  }
}
