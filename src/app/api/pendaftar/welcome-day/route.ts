import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

/**
 * API untuk Konfirmasi Kehadiran Welcome Day
 * Menyimpan data ke model ReservasiPSB (reservasi_psb)
 */

export async function GET(req: Request) {
  try {
    const session = (await getServerSession()) as any;
    if (!session || !session.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pendaftarId = session.id;

    // Ambil data reservasi welcome day (kita asumsikan tanggal_kedatangan = 2026-07-18)
    const reservasi = await prisma.reservasiPSB.findFirst({
      where: {
        pendaftar_id: pendaftarId,
        catatan: {
          contains: "Welcome Day"
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: reservasi || null
    });
  } catch (error: any) {
    console.error("Error in GET /api/pendaftar/welcome-day:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = (await getServerSession()) as any;
    if (!session || !session.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pendaftarId = session.id;
    const body = await req.json();
    const { statusKehadiran, jumlahPendamping, totalPengantar, catatanTambahan, jumlahMobil = 0, jumlahMotor = 0 } = body;

    // Pastikan pendaftar ada dan sudah diterima/daftar ulang
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: { 
        status_pendaftaran: true,
        tahun_ajaran_id: true
      }
    });

    if (!pendaftar) {
      return NextResponse.json({ message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    if (!["accepted", "re_registered", "enrolled", "enrolled_full"].includes(pendaftar.status_pendaftaran)) {
      return NextResponse.json({ message: "Akses ditolak. Anda belum diterima." }, { status: 403 });
    }

    // Cari apakah sudah ada data konfirmasi sebelumnya
    const existing = await prisma.reservasiPSB.findFirst({
      where: {
        pendaftar_id: pendaftarId,
        catatan: {
          contains: "Welcome Day"
        }
      }
    });

    const dataJson = {
      statusKehadiran,
      jumlahPendamping,
      totalPengantar,
      catatanTambahan,
      jumlahMobil,
      jumlahMotor,
      confirmedAt: new Date().toISOString()
    };

    if (existing) {
      // Update data yang ada
      await prisma.reservasiPSB.update({
        where: { id: existing.id },
        data: {
          jumlah_penginap: jumlahPendamping, // Kita gunakan ini untuk jumlah pendamping di acara inti
          data_penginap: dataJson,
          status: "confirmed",
          catatan: "Konfirmasi Kehadiran Welcome Day"
        }
      });
    } else {
      // Buat baru
      await prisma.reservasiPSB.create({
        data: {
          pendaftar_id: pendaftarId,
          tahun_ajaran_id: pendaftar.tahun_ajaran_id,
          tanggal_kedatangan: new Date("2026-07-18"),
          jumlah_penginap: jumlahPendamping,
          data_penginap: dataJson,
          status: "confirmed",
          catatan: "Konfirmasi Kehadiran Welcome Day"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Konfirmasi kehadiran Welcome Day berhasil disimpan"
    });
  } catch (error: any) {
    console.error("Error in POST /api/pendaftar/welcome-day:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
