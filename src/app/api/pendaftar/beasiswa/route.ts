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
      file_ktp_ibu_path,
      file_prestasi_path,
      file_permohonan_path,
    } = body;

    if (!jenis_pengajuan || !alasan_pengajuan) {
      return NextResponse.json({ error: "Data pengajuan tidak lengkap" }, { status: 400 });
    }

    // Validasi Dokumen Wajib berdasarkan jenis
    if (!file_sktm_path) {
      return NextResponse.json({ error: "Surat Keterangan Tidak Mampu (SKTM) wajib diunggah" }, { status: 400 });
    }

    if (jenis_pengajuan === "BEASISWA_PRESTASI") {
      // Beasiswa: SKTM + Slip Gaji + KTP Ayah + KTP Ibu + Prestasi
      if (!file_slip_gaji_path || !file_ktp_path || !file_ktp_ibu_path || !file_prestasi_path) {
        return NextResponse.json({ error: "Beasiswa memerlukan: SKTM, Surat Keterangan Penghasilan, KTP Orangtua Ayah, KTP Orangtua Ibu, dan Bukti Hafalan/Prestasi" }, { status: 400 });
      }
    } else {
      // Keringanan: SKTM + Surat Permohonan
      if (!file_permohonan_path) {
        return NextResponse.json({ error: "Keringanan memerlukan: SKTM dan Surat Permohonan Keringanan Biaya" }, { status: 400 });
      }
    }

    const pengajuan = await prisma.pengajuanBeasiswa.upsert({
      where: { pendaftar_id: session.id },
      update: {
        jenis_pengajuan,
        alasan_pengajuan,
        nominal_kesanggupan: nominal_kesanggupan ? Number(nominal_kesanggupan) : null,
        file_sktm_path,
        file_slip_gaji_path: file_slip_gaji_path || null,
        file_ktp_path: file_ktp_path || null,
        file_ktp_ibu_path: file_ktp_ibu_path || null,
        file_prestasi_path: file_prestasi_path || null,
        file_permohonan_path: file_permohonan_path || null,
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
        file_slip_gaji_path: file_slip_gaji_path || null,
        file_ktp_path: file_ktp_path || null,
        file_ktp_ibu_path: file_ktp_ibu_path || null,
        file_prestasi_path: file_prestasi_path || null,
        file_permohonan_path: file_permohonan_path || null,
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
