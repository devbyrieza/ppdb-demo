import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "pendaftar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pengajuan = await prisma.pengajuanBeasiswa.findUnique({
      where: { pendaftar_id: session.id },
    });

    return NextResponse.json({ success: true, data: pengajuan });
  } catch (error: any) {
    console.error("GET pengajuan beasiswa error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "pendaftar") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: session.id },
      select: { tahun_ajaran_id: true }
    });

    if (!pendaftar) {
      return NextResponse.json({ error: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { 
      jenis_pengajuan, 
      alasan_pengajuan, 
      nominal_kesanggupan, 
      file_sktm_path, 
      file_slip_gaji_path, 
      file_ktp_path, 
      file_prestasi_path 
    } = body;

    if (!jenis_pengajuan || !alasan_pengajuan) {
      return NextResponse.json({ error: "Data pengajuan tidak lengkap" }, { status: 400 });
    }

    // Validasi Dokumen Wajib
    if (!file_sktm_path || !file_slip_gaji_path || !file_ktp_path) {
      return NextResponse.json({ error: "SKTM, Slip Gaji/Surat Penghasilan, dan KTP wajib diunggah" }, { status: 400 });
    }

    // Beasiswa prestasi wajib punya file prestasi
    if (jenis_pengajuan === "BEASISWA_PRESTASI" && !file_prestasi_path) {
      return NextResponse.json({ error: "Bukti Hafalan / Peringkat wajib diunggah untuk Beasiswa Prestasi" }, { status: 400 });
    }

    const pengajuan = await prisma.pengajuanBeasiswa.upsert({
      where: { pendaftar_id: session.id },
      update: {
        jenis_pengajuan,
        alasan_pengajuan,
        nominal_kesanggupan: nominal_kesanggupan ? Number(nominal_kesanggupan) : null,
        file_sktm_path,
        file_slip_gaji_path,
        file_ktp_path,
        file_prestasi_path,
        diajukan_oleh_id: session.id,
        diajukan_oleh_role: "PENDAFTAR",
        status: "PENDING",
        updated_at: new Date()
      },
      create: {
        pendaftar_id: session.id,
        tahun_ajaran_id: pendaftar.tahun_ajaran_id,
        jenis_pengajuan,
        alasan_pengajuan,
        nominal_kesanggupan: nominal_kesanggupan ? Number(nominal_kesanggupan) : null,
        file_sktm_path,
        file_slip_gaji_path,
        file_ktp_path,
        file_prestasi_path,
        diajukan_oleh_id: session.id,
        diajukan_oleh_role: "PENDAFTAR",
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, message: "Pengajuan berhasil dikirim", data: pengajuan });
  } catch (error: any) {
    console.error("POST pengajuan beasiswa error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
