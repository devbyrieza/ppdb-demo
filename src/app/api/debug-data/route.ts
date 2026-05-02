import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const statusDistribution = await prisma.pendaftar.groupBy({
      by: ['status_pendaftaran'],
      _count: true
    });

    const jenjangDistribution = await prisma.pendaftar.groupBy({
      by: ['jenjang'],
      _count: true
    });

    const genderDistribution = await prisma.pendaftar.groupBy({
      by: ['jenis_kelamin'],
      _count: true
    });

    return NextResponse.json({
      message: "Production Debug Audit",
      total_records: await prisma.pendaftar.count(),
      statusDistribution,
      jenjangDistribution,
      genderDistribution
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
