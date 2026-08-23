import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
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
              ] } },
          {
            secondary_roles: {
              hasSome: [
                "penguji",
                "pewawancara_calsan",
                "pewawancara_cawalsan",
                "penguji_hafalan",
                "penguji_bahasa_arab",
              ] } },
        ] },
      select: {
        id: true,
        full_name: true,
        role: true,
        secondary_roles: true },
      orderBy: {
        full_name: "asc" } });

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
        nilai_tes_quran: true,
        nilai_wawancara_santri: true,
        nilai_wawancara_ortu: true,
        score_hafalan: true,
        score_arab: true,
        jadwal_ujian: {
          select: {
            penguji_quran_id: true,
            penguji_santri_id: true,
            penguji_ortu_id: true,
            penguji_hafalan_id: true,
            penguji_arab_id: true }
        },
        detail_akademik: true } });

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
        total: 0 };
    }

    for (const nilai of nilaiData) {
      const getAssignedFromJson = (key: string) => {
        if (nilai.detail_akademik && typeof nilai.detail_akademik === 'object') {
          const detail = nilai.detail_akademik as any;
          if (detail.assigned_examiners && detail.assigned_examiners[key]) {
            return detail.assigned_examiners[key];
          }
        }
        return null;
      };

      let quran_ex = nilai.jadwal_ujian?.penguji_quran_id || getAssignedFromJson('quran') || nilai.input_by_quran;
      if (quran_ex && tally[quran_ex] && nilai.nilai_tes_quran !== null) {
        tally[quran_ex].quran++;
        tally[quran_ex].total++;
      }

      let santri_ex = nilai.jadwal_ujian?.penguji_santri_id || getAssignedFromJson('wawancara_santri') || nilai.input_by_santri;
      if (santri_ex && tally[santri_ex] && nilai.nilai_wawancara_santri !== null) {
        tally[santri_ex].santri++;
        tally[santri_ex].total++;
      }

      let ortu_ex = nilai.jadwal_ujian?.penguji_ortu_id || getAssignedFromJson('wawancara_ortu') || nilai.input_by_ortu;
      if (ortu_ex && tally[ortu_ex] && nilai.nilai_wawancara_ortu !== null) {
        tally[ortu_ex].ortu++;
        tally[ortu_ex].total++;
      }

      let hafalan_ex = nilai.jadwal_ujian?.penguji_hafalan_id || nilai.input_by_hafalan;
      if (hafalan_ex && tally[hafalan_ex] && nilai.score_hafalan !== null) {
        tally[hafalan_ex].hafalan++;
        tally[hafalan_ex].total++;
      }

      let arab_ex = nilai.jadwal_ujian?.penguji_arab_id || nilai.input_by_arab;
      if (arab_ex && tally[arab_ex] && nilai.score_arab !== null) {
        tally[arab_ex].arab++;
        tally[arab_ex].total++;
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
        total_fee: stats.total * FEE_PER_SESSION };
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
