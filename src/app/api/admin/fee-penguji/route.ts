import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tahunAjaranId = searchParams.get("tahun_ajaran_id");

    // Fetch examiners
    const examiners = await prisma.profile.findMany({
      where: {
        OR: [
          {
            role: {
              in: [
                "penguji",
                "pewawancara_calsan",
                "pewawancara_cawalsan",
                "penguji_hafalan",
                "penguji_bahasa_arab",
              ],
            },
          },
          {
            secondary_roles: {
              hasSome: [
                "penguji",
                "pewawancara_calsan",
                "pewawancara_cawalsan",
                "penguji_hafalan",
                "penguji_bahasa_arab",
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        full_name: true,
        role: true,
        secondary_roles: true,
      },
      orderBy: {
        full_name: "asc",
      },
    });

    // We'll fetch all NilaiUjian optionally filtered by tahunAjaranId
    const whereClause: any = {};
    if (tahunAjaranId) {
      whereClause.pendaftar = { tahun_ajaran_id: tahunAjaranId };
    }

    const nilaiData = await prisma.nilaiUjian.findMany({
      where: whereClause,
      select: {
        input_by_quran: true,
        input_by_santri: true,
        input_by_ortu: true,
        input_by_hafalan: true,
        input_by_arab: true,
      },
    });

    // Tally up counts per examiner
    const tally: Record<
      string,
      {
        quran: number;
        santri: number;
        ortu: number;
        hafalan: number;
        arab: number;
        total: number;
      }
    > = {};

    for (const ex of examiners) {
      tally[ex.id] = {
        quran: 0,
        santri: 0,
        ortu: 0,
        hafalan: 0,
        arab: 0,
        total: 0,
      };
    }

    for (const nilai of nilaiData) {
      if (nilai.input_by_quran && tally[nilai.input_by_quran]) {
        tally[nilai.input_by_quran].quran++;
        tally[nilai.input_by_quran].total++;
      }
      if (nilai.input_by_santri && tally[nilai.input_by_santri]) {
        tally[nilai.input_by_santri].santri++;
        tally[nilai.input_by_santri].total++;
      }
      if (nilai.input_by_ortu && tally[nilai.input_by_ortu]) {
        tally[nilai.input_by_ortu].ortu++;
        tally[nilai.input_by_ortu].total++;
      }
      if (nilai.input_by_hafalan && tally[nilai.input_by_hafalan]) {
        tally[nilai.input_by_hafalan].hafalan++;
        tally[nilai.input_by_hafalan].total++;
      }
      if (nilai.input_by_arab && tally[nilai.input_by_arab]) {
        tally[nilai.input_by_arab].arab++;
        tally[nilai.input_by_arab].total++;
      }
    }

    const FEE_PER_SESSION = 10000;

    const result = examiners.map((ex) => {
      const stats = tally[ex.id];
      return {
        id: ex.id,
        nama: ex.full_name,
        role_utama: ex.role,
        role_tambahan: ex.secondary_roles,
        jumlah_quran: stats.quran,
        jumlah_santri: stats.santri,
        jumlah_ortu: stats.ortu,
        jumlah_hafalan: stats.hafalan,
        jumlah_arab: stats.arab,
        total_sesi: stats.total,
        total_fee: stats.total * FEE_PER_SESSION,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error fetching fee penguji:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
