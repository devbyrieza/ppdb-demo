import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Get active tahun ajaran
    const activeTA = await prisma.tahunAjaran.findFirst({
      where: { is_active: true }
    });

    // Count pendaftar
    const totalPendaftar = await prisma.pendaftar.count({
      where: {
        tahun_ajaran_id: activeTA?.id,
        deleted_at: null
      }
    });

    // Get pendaftar with status
    const pendaftar = await prisma.pendaftar.findMany({
      where: {
        tahun_ajaran_id: activeTA?.id,
        deleted_at: null
      },
      select: {
        id: true,
        nama_lengkap: true,
        status_pendaftaran: true,
        jenjang: true
      },
      take: 10
    });

    return NextResponse.json({
      active_tahun_ajaran: activeTA,
      totalPendaftar,
      sample_pendaftar: pendaftar
    });
  } catch (error) {
    console.error("Debug stats error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
