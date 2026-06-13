import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin_super", "admin_keuangan", "admin"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Akses ditolak" }, { status: 403 });
    }

    const pendaftars = await prisma.pendaftar.findMany({
      select: {
        id: true,
        nomor_pendaftaran: true,
        nama_lengkap: true,
        status_pendaftaran: true,
        data_lengkap: true,
      },
      orderBy: { created_at: "desc" }
    });

    const reportData = pendaftars.map(p => {
      let dl = p.data_lengkap as any || {};
      if (typeof dl === "string") {
        try { dl = JSON.parse(dl); } catch(e) {}
      }

      const aktif = dl.keringanan_daftar_ulang;
      const pengajuan = dl.pengajuan_keringanan;

      // Filter hanya yang punya Keringanan Aktif ATAU Pengajuan
      if (!aktif && !pengajuan) return null;

      // Jika ada dua-duanya, yang ditampilkan sebagai "Tipe" utama adalah yang aktif, 
      // tetapi status pengajuan tetap ditampilkan.
      const tipeKeringanan = aktif?.jenis || pengajuan?.jenis || "-";
      const nominalPotongan = aktif?.nominal_potongan || pengajuan?.nominal_disetujui || 0;
      
      // Default Base Tagihan tergantung institusi. 
      // Karena ini laporan, kita akan biarkan Frontend / API yang mengatur. 
      // Untuk amannya, di laporan excel kita hanya berikan data potongan dan sisa jika disetujui.
      
      return {
        "No. Registrasi": p.nomor_pendaftaran,
        "Nama Pendaftar": p.nama_lengkap,
        "Status Kelulusan": p.status_pendaftaran,
        "Tipe Keringanan": tipeKeringanan,
        "Nominal Potongan": nominalPotongan,
        "Status Pengajuan": pengajuan ? pengajuan.status.toUpperCase() : "AKTIF (MANUAL)",
        "Kesanggupan Bayar (Pengajuan)": pengajuan?.kesanggupan_bayar || 0,
        "Alasan/Ket": pengajuan?.alasan || "-",
      };
    }).filter(item => item !== null);

    return NextResponse.json({
      success: true,
      data: reportData
    });

  } catch (error: any) {
    console.error("Error generating laporan keringanan:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
