import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie =
    cookieStore.get("al_session") || cookieStore.get("app_session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

// GET: List all exam participants assigned to this reviewer
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user_id || session.id;
  const full_name = session.full_name || session.name || "Reviewer";
  console.log(
    `🔍 [API /penguji/peserta] userId: ${userId} | name: ${full_name}`,
  );

  try {
    // Fetch user profile to see roles (we keep this for role injection if needed, but disable admin bypass)
    const userProfile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true, secondary_roles: true } });
    const allRoles = userProfile
      ? [userProfile.role, ...(userProfile.secondary_roles || [])]
      : [];
    const isAdmin = false; // Always false here to restrict view to own assigned participants

    let whereClause: any = {
      pendaftar: { deleted_at: null },
      OR: [
        { penguji_santri_id: userId }, // Seleksi Wawancara Calon Santri (or general Interview)
        { penguji_quran_id: userId }, // Tes Quran
        { penguji_ortu_id: userId }, // Seleksi Wawancara Orang Tua
        { penguji_hafalan_id: userId }, // Tes Hafalan (MA)
        { penguji_arab_id: userId }, // Tes Bahasa Arab (MA)
        { exam_session: { created_by: userId } }, // Sessions created by this penguji
      ]
    };

    const assigned = await prisma.jadwalUjian.findMany({
      where: whereClause,
      include: {
        pendaftar: {
          select: {
            id: true,
            nama_lengkap: true,
            nomor_pendaftaran: true,
            jenjang: true,
            nilai_ujian: true, // Fetch scores directly from pendaftar
            created_at: true } },
        exam_session: { select: { title: true, created_by: true } } },
      orderBy: { tanggal_ujian: "asc" } });

    // Fetch ALL jadwal records for the exam sessions we're dealing with
    // This is needed to properly match scores to their jadwal records
    const examSessionIds = [
      ...new Set(
        assigned
          .map((j) => j.exam_session_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const allJadwalInSessions =
      examSessionIds.length > 0
        ? await prisma.jadwalUjian.findMany({
            where: {
              exam_session_id: { in: examSessionIds } },
            select: {
              id: true,
              exam_session_id: true } })
        : [];

    // Helper to check if an object is effectively empty
    const isEmpty = (v: any) => {
      if (v == null || v === "") return true;
      if (typeof v === "object") {
        if (Array.isArray(v)) return v.length === 0;
        const keys = Object.keys(v);
        if (keys.length === 0) return true;
        return keys.every((key) => v[key] == null || v[key] === "");
      }
      return false;
    };

    // Build a map to deduplicate by pendaftar.id
    const pesertaMap = new Map<string, any>();

    for (const item of assigned) {
      const pendaftarId = item.pendaftar.id;

      // Helper to check if applicant is direct MA/SMA without IL
      const jenjangStr = item.pendaftar.jenjang || "";
      const cleanJenjang = jenjangStr.trim().toUpperCase();
      const isDirectNonIL = !(
        cleanJenjang === "IL" ||
        cleanJenjang.includes("IL ") ||
        cleanJenjang.includes(" IL") ||
        cleanJenjang.includes("(IL)") ||
        cleanJenjang.includes("I'DAD") ||
        cleanJenjang.includes("IDAD") ||
        cleanJenjang.includes("IDADIYAH") ||
        cleanJenjang.includes("SMP") ||
        cleanJenjang.includes("MTS") ||
        cleanJenjang.includes("TSANAWIYAH")
      ) && (
        cleanJenjang.includes("SMA") ||
        cleanJenjang.includes("MA") ||
        cleanJenjang.includes("ALIYAH") ||
        cleanJenjang.includes("SLTA")
      );

      // Determine roles for this jadwal record: Quran (Bacaan & Hafalan), Santri, Ortu for everyone; Arab ONLY for direct Non-IL
      const sessionTitle = (item.exam_session?.title || "").toLowerCase();
      const isSessionOrtu =
        sessionTitle.includes("cawalsan") ||
        sessionTitle.includes("ortu") ||
        sessionTitle.includes("orang") ||
        sessionTitle.includes("wali");
      const isSessionQuran =
        sessionTitle.includes("qur") ||
        sessionTitle.includes("quran") ||
        sessionTitle.includes("hafalan") ||
        sessionTitle.includes("bacaan");
      const isSessionSantri =
        (sessionTitle.includes("calsan") ||
        sessionTitle.includes("santri") ||
        sessionTitle.includes("wawancara")) && !isSessionOrtu;

      const userIsCawalsan = allRoles.includes("pewawancara_cawalsan");
      const userIsCalsan = allRoles.includes("pewawancara_calsan");

      const roles: string[] = [];
      if (isAdmin) {
        roles.push("wawancara", "quran", "ortu");
        if (isDirectNonIL) {
          roles.push("lisan_arab");
        }
      } else {
        if (item.penguji_ortu_id === userId) {
          roles.push("ortu");
        } else if (item.penguji_santri_id === userId) {
          if (isSessionOrtu || userIsCawalsan) {
            // Auto-heal: session was for Ortu/Cawalsan or reviewer is Cawalsan interviewer
            roles.push("ortu");
            if (!item.penguji_ortu_id) {
              prisma.jadwalUjian.update({
                where: { id: item.id },
                data: {
                  penguji_ortu_id: userId,
                  penguji_santri_id: null,
                  status_ortu: item.status_santri || item.status_ortu || "scheduled",
                  status_santri: null,
                },
              }).catch((e) => console.error("Auto-heal jadwal error:", e));
            }
          } else {
            roles.push("wawancara");
          }
        }

        if (item.penguji_santri_id === userId && !roles.includes("wawancara") && !isSessionOrtu && !userIsCawalsan) {
          roles.push("wawancara");
        }

        if (item.penguji_quran_id === userId || (item as any).penguji_hafalan_id === userId) {
          roles.push("quran");
        }
        if (isDirectNonIL && (item as any).penguji_arab_id === userId) {
          roles.push("lisan_arab");
        }

        if (roles.length === 0 && item.exam_session?.created_by === userId) {
          const hasNoExplicitExaminer =
            !item.penguji_quran_id &&
            !(item as any).penguji_hafalan_id &&
            !item.penguji_santri_id &&
            !item.penguji_ortu_id &&
            !(item as any).penguji_arab_id;

          const hasQuranMatch = isSessionQuran && !item.penguji_quran_id && !(item as any).penguji_hafalan_id;
          const hasOrtuMatch = isSessionOrtu && !item.penguji_ortu_id && !item.penguji_santri_id;
          const hasWawancaraMatch = isSessionSantri && !item.penguji_santri_id;
          const hasLisanArabMatch =
            isDirectNonIL &&
            (sessionTitle.includes("arab") || sessionTitle.includes("lisan")) &&
            !(item as any).penguji_arab_id;

          if (hasQuranMatch) roles.push("quran");
          if (hasWawancaraMatch) roles.push("wawancara");
          if (hasOrtuMatch) roles.push("ortu");
          if (hasLisanArabMatch) roles.push("lisan_arab");

          if (roles.length === 0 && !isSessionQuran && !isSessionSantri && !isSessionOrtu && hasNoExplicitExaminer) {
            if (userIsCawalsan) roles.push("ortu");
            else if (userIsCalsan) roles.push("wawancara");
            else {
              roles.push("quran");
              if (isDirectNonIL) roles.push("lisan_arab");
            }
          }
        }
      }

      if (roles.length === 0) continue;

      // Find ALL score records for this pendaftar
      const allScoresInPendaftar = item.pendaftar.nilai_ujian || [];

      // Define fields that are allowed to travel across sessions (Universal)
      const UNIVERSAL_FIELDS = [
        "nilai_tes_quran",
        "score_quran",
        "detail_quran",
        "catatan_quran",
        "input_at_quran",
        "input_by_quran",
        "nilai_wawancara_santri",
        "detail_wawancara",
        "catatan_santri",
        "input_at_santri",
        "input_by_santri",
        "nilai_wawancara_ortu",
        "detail_cawalsan",
        "catatan_ortu",
        "input_at_ortu",
        "input_at_hafalan",
        "input_at_arab",
        "input_by_arab",
        "nilai_arab_total",
        "score_arab",
        "detail_arab",
        "catatan_arab",
        "input_by_ortu",
        "score_wawancara",
        "nilai_tes_tertulis",
        "nilai_tes_tertulis_total",
        "detail_akademik",
      ];

      // Merge all scores found, but apply session-aware logic
      const mergedSessionScore: any = {};
      allScoresInPendaftar.forEach((s: any) => {
        // Determine if this score record belongs to the CURRENT exam session
        const scoreJadwal = s.jadwal_ujian_id
          ? allJadwalInSessions.find((j: any) => j.id === s.jadwal_ujian_id)
          : null;
        const isCurrentSession =
          scoreJadwal && scoreJadwal.exam_session_id === item.exam_session_id;

        Object.entries(s).forEach(([k, v]) => {
          if (!isEmpty(v)) {
            // Logic:
            // 1. If it's the current session, we take everything.
            // 2. If it's a different session (or orphan), we ONLY take Universal fields.
            if (isCurrentSession || UNIVERSAL_FIELDS.includes(k)) {
              // Prefer existing values if already set (merging strategy)
              if (
                mergedSessionScore[k] == null ||
                mergedSessionScore[k] === ""
              ) {
                mergedSessionScore[k] = v;
              }
            }
          }
        });
      });

      // Use merged session score, or empty object if none exists
      const scoreData: any =
        Object.keys(mergedSessionScore).length > 0 ? mergedSessionScore : {};

      if (pesertaMap.has(pendaftarId)) {
        const existing = pesertaMap.get(pendaftarId);
        for (const r of roles) {
          if (!existing.roles.includes(r)) existing.roles.push(r);
        }

        // Merge scores from the same exam session into existing map entry
        // This handles cases where a student has multiple jadwal records in the same session
        Object.entries(scoreData).forEach(([k, v]) => {
          if (!isEmpty(v) && isEmpty(existing[k])) {
            existing[k] = v;
          }
        });
      } else {
        pesertaMap.set(pendaftarId, {
          id: pendaftarId,
          nama_lengkap: item.pendaftar.nama_lengkap,
          nomor_pendaftaran: item.pendaftar.nomor_pendaftaran,
          jenjang: item.pendaftar.jenjang,
          jadwal_id: item.id,
          roles: roles,
          // Score fields - merged from ALL jadwal in the SAME exam session
          nilai_id: scoreData.id || null,
          nilai_wawancara_santri: scoreData.nilai_wawancara_santri,
          score_wawancara: scoreData.score_wawancara,
          nilai_tes_quran: scoreData.nilai_tes_quran,
          score_quran: scoreData.score_quran,
          nilai_tes_hafalan: scoreData.nilai_tes_hafalan,
          score_hafalan: scoreData.score_hafalan,
          nilai_tes_lisan_arab: scoreData.nilai_tes_lisan_arab,
          score_arab: scoreData.score_arab,
          nilai_wawancara_ortu: scoreData.nilai_wawancara_ortu,
          catatan_santri: scoreData.catatan_santri,
          catatan_quran: scoreData.catatan_quran,
          catatan_ortu: scoreData.catatan_ortu,
          detail_quran: scoreData.detail_quran,
          detail_wawancara: scoreData.detail_wawancara,
          detail_cawalsan: scoreData.detail_cawalsan,
          detail_lisan_arab: scoreData.detail_arab || scoreData.detail_lisan_arab,
          catatan_lisan_arab: scoreData.catatan_arab || scoreData.catatan_lisan_arab,
          input_at_quran: scoreData.input_at_quran,
          input_at_santri: scoreData.input_at_santri,
          input_at_ortu: scoreData.input_at_ortu,
          input_at_hafalan: scoreData.input_at_hafalan,
          input_at_arab: scoreData.input_at_arab,
          created_at: item.pendaftar.created_at });
      }
    }

    // Fetch participants assigned via detail_akademik JSON mapping (bypass payment status)
    const assignedByJSON = await prisma.nilaiUjian.findMany({
      where: {
        OR: [
          {
            detail_akademik: {
              path: ["assigned_examiners", "quran"],
              equals: userId } },
          {
            detail_akademik: {
              path: ["assigned_examiners", "wawancara_santri"],
              equals: userId } },
          {
            detail_akademik: {
              path: ["assigned_examiners", "wawancara_ortu"],
              equals: userId } },
          {
            detail_akademik: {
              path: ["assigned_examiners", "hafalan"],
              equals: userId } },
          {
            detail_akademik: {
              path: ["assigned_examiners", "lisan_arab"],
              equals: userId } },
        ] },
      include: {
        pendaftar: {
          select: {
            id: true,
            nama_lengkap: true,
            nomor_pendaftaran: true,
            jenjang: true,
            nilai_ujian: true,
            created_at: true } } } });

    for (const item of assignedByJSON) {
      if (!item.pendaftar) continue;
      const pendaftarId = item.pendaftar.id;

      const roles: string[] = [];
      const detailAkademik = (item.detail_akademik as any) || {};
      const assigned = detailAkademik.assigned_examiners || {};

      if (assigned.quran === userId) roles.push("quran");
      if (assigned.wawancara_santri === userId) roles.push("wawancara");
      if (assigned.wawancara_ortu === userId) roles.push("ortu");
      if (assigned.hafalan === userId) roles.push("hafalan");
      if (assigned.lisan_arab === userId) roles.push("lisan_arab");

      if (roles.length === 0) continue;

      const scoreData: any = item || {};

      if (pesertaMap.has(pendaftarId)) {
        const existing = pesertaMap.get(pendaftarId);
        for (const r of roles) {
          if (!existing.roles.includes(r)) existing.roles.push(r);
        }
        // Merge scoreData fields
        Object.entries(scoreData).forEach(([k, v]) => {
          if (!isEmpty(v) && isEmpty(existing[k])) {
            existing[k] = v;
          }
        });
      } else {
        pesertaMap.set(pendaftarId, {
          id: pendaftarId,
          nama_lengkap: item.pendaftar.nama_lengkap,
          nomor_pendaftaran: item.pendaftar.nomor_pendaftaran,
          jenjang: item.pendaftar.jenjang,
          jadwal_id: item.jadwal_ujian_id || null,
          roles: roles,
          nilai_id: item.id || null,
          nilai_wawancara_santri: scoreData.nilai_wawancara_santri,
          score_wawancara: scoreData.score_wawancara,
          nilai_tes_quran: scoreData.nilai_tes_quran,
          score_quran: scoreData.score_quran,
          nilai_tes_hafalan: scoreData.nilai_tes_hafalan,
          score_hafalan: scoreData.score_hafalan,
          nilai_tes_lisan_arab: scoreData.nilai_tes_lisan_arab,
          score_arab: scoreData.score_arab,
          nilai_wawancara_ortu: scoreData.nilai_wawancara_ortu,
          catatan_santri: scoreData.catatan_santri,
          catatan_quran: scoreData.catatan_quran,
          catatan_ortu: scoreData.catatan_ortu,
          detail_quran: scoreData.detail_quran,
          detail_wawancara: scoreData.detail_wawancara,
          detail_cawalsan: scoreData.detail_cawalsan,
          input_at_quran: scoreData.input_at_quran,
          input_at_santri: scoreData.input_at_santri,
          input_at_ortu: scoreData.input_at_ortu,
          input_at_hafalan: scoreData.input_at_hafalan,
          input_at_arab: scoreData.input_at_arab,
          created_at: item.pendaftar.created_at });
      }
    }

    const data = Array.from(pesertaMap.values());

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("GET penguji/peserta error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
