import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { recalculateNilaiUjian } from "@/lib/scoring";
import { markExamComponentAsComplete } from "@/lib/exam-status";

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

// PATCH: Update score (Upsert)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: pendaftarId } = await params;
  const userId = session.user_id || session.id;

  try {
    const body = await request.json();

    // Check assignment authorization
    let assignment = await prisma.jadwalUjian.findFirst({
      where: {
        pendaftar_id: pendaftarId,
        OR: [
          { penguji_santri_id: userId },
          { penguji_quran_id: userId },
          { penguji_ortu_id: userId },
          { penguji_hafalan_id: userId },
          { penguji_arab_id: userId },
          { exam_session: { created_by: userId } },
        ],
      },
      include: {
        exam_session: { select: { title: true, created_by: true } },
      },
      orderBy: { created_at: "desc" },
    });

    // Fetch user profile to see all assigned roles and secondary roles
    const userProfile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true, secondary_roles: true },
    });

    const userRoles = [
      session.role,
      ...(Array.isArray(session.secondary_roles) ? session.secondary_roles : []),
      ...(userProfile?.role ? [userProfile.role] : []),
      ...(Array.isArray(userProfile?.secondary_roles) ? userProfile.secondary_roles : []),
    ].filter(Boolean) as string[];

    const isAdmin = userRoles.some((r) =>
      ["admin_super", "admin", "head_of_it"].includes(r.toLowerCase()),
    );

    // Let admins bypass the assignment check and grab any existing schedule if available
    if (!assignment && isAdmin) {
      assignment = await prisma.jadwalUjian.findFirst({
        where: { pendaftar_id: pendaftarId },
        include: {
          exam_session: { select: { title: true, created_by: true } },
        },
        orderBy: { created_at: "desc" },
      });
    }

    if (!assignment && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Not assigned to this student" },
        { status: 403 },
      );
    }

    // If examiner, only specific fields based on direct assignment
    const isWawancara = assignment?.penguji_santri_id === userId;
    const isQuran = assignment?.penguji_quran_id === userId;
    const isOrtu = assignment?.penguji_ortu_id === userId;
    const isHafalan = assignment?.penguji_hafalan_id === userId;
    const isLisanArab = assignment?.penguji_arab_id === userId;

    // Fallback: if matched via exam_session.created_by, derive role from session title
    let isWawancaraFallback = false;
    let isQuranFallback = false;
    let isOrtuFallback = false;
    let isHafalanFallback = false;
    let isLisanArabFallback = false;

    if (
      !isWawancara &&
      !isQuran &&
      !isOrtu &&
      !isHafalan &&
      !isLisanArab &&
      assignment &&
      assignment.exam_session &&
      assignment.exam_session.created_by === userId
    ) {
      const title = (assignment.exam_session.title || "").toLowerCase();
      const hasQuranMatch =
        title.includes("qur") ||
        title.includes("quran") ||
        title.includes("hafalan") ||
        title.includes("bacaan");
      const hasOrtuMatch =
        title.includes("cawalsan") ||
        title.includes("ortu") ||
        title.includes("orang") ||
        title.includes("wali");
      const hasWawancaraMatch =
        (title.includes("calsan") ||
          title.includes("santri") ||
          title.includes("wawancara")) &&
        !hasOrtuMatch;
      const hasHafalanMatch = title.includes("hafalan");
      const hasLisanArabMatch =
        title.includes("arab") || title.includes("lisan");

      // If the title is generic (e.g. "Tes PPDB 1"), grant access to all forms (matches frontend behavior roles: [])
      if (
        !hasQuranMatch &&
        !hasWawancaraMatch &&
        !hasOrtuMatch &&
        !hasHafalanMatch &&
        !hasLisanArabMatch
      ) {
        isQuranFallback = true;
        isWawancaraFallback = true;
        isOrtuFallback = true;
        isHafalanFallback = true;
        isLisanArabFallback = true;
      } else {
        isQuranFallback = hasQuranMatch;
        isWawancaraFallback = hasWawancaraMatch;
        isOrtuFallback = hasOrtuMatch;
        isHafalanFallback = hasHafalanMatch;
        isLisanArabFallback = hasLisanArabMatch;
      }
    }

    const hasRole = (predicate: (r: string) => boolean) =>
      userRoles.some((r) => predicate(r.toLowerCase()));

    const canEditQuran =
      isAdmin ||
      isQuran ||
      isQuranFallback ||
      hasRole(
        (r) =>
          r.includes("quran") ||
          r === "penguji" ||
          r === "penguji_quran",
      );

    const canEditWawancara =
      isAdmin ||
      isWawancara ||
      isWawancaraFallback ||
      hasRole(
        (r) =>
          r.includes("calsan") ||
          r.includes("wawancara") ||
          r === "pewawancara" ||
          r === "pewawancara_calsan" ||
          r === "penguji_calsan",
      );

    const canEditOrtu =
      isAdmin ||
      isOrtu ||
      isOrtuFallback ||
      hasRole(
        (r) =>
          r.includes("cawalsan") ||
          r.includes("ortu") ||
          r.includes("wawancara") ||
          r === "pewawancara" ||
          r === "pewawancara_cawalsan" ||
          r === "penguji_cawalsan",
      );

    const canEditHafalan =
      isAdmin ||
      isHafalan ||
      isHafalanFallback ||
      hasRole((r) => r.includes("hafalan") || r === "penguji_hafalan");

    const canEditLisanArab =
      isAdmin ||
      isLisanArab ||
      isLisanArabFallback ||
      hasRole(
        (r) =>
          r.includes("arab") ||
          r === "penguji_bahasa_arab" ||
          r === "penguji_arab",
      );

    // Pre-fetch existing record to check timestamps and update data
    const existing = await prisma.nilaiUjian.findFirst({
      where: { pendaftar_id: pendaftarId },
      orderBy: { created_at: "desc" },
    });

    const updateData: any = {};
    const now = new Date();
    const LOCK_TIME = Number.POSITIVE_INFINITY; // Kebijakan: penguji bebas edit nilai kapan saja (batas 24 jam dimatikan)

    // 1. Quran Update
    if (canEditQuran && body.detail_quran !== undefined) {
      if (existing?.input_at_quran && !isAdmin) {
        const diff =
          now.getTime() - new Date(existing.input_at_quran).getTime();
        if (diff > LOCK_TIME) {
          return NextResponse.json(
            {
              error:
                "Masa edit untuk Tes Quran sudah habis. Silakan hubungi Admin Super.",
            },
            { status: 403 },
          );
        }
      }

      if (body.nilai_tes_quran !== undefined)
        updateData.nilai_tes_quran = body.nilai_tes_quran;
      if (body.catatan_quran !== undefined)
        updateData.catatan_quran = body.catatan_quran;
      if (body.detail_quran !== undefined)
        updateData.detail_quran = body.detail_quran;
      if (body.score_quran !== undefined)
        updateData.score_quran = body.score_quran;
      if (body.nilai_tes_hafalan !== undefined)
        updateData.nilai_hafalan_total = body.nilai_tes_hafalan;
      if (body.score_hafalan !== undefined)
        updateData.score_hafalan = body.score_hafalan;
      if (body.detail_hafalan !== undefined)
        updateData.detail_hafalan = body.detail_hafalan;
      if (!existing?.input_by_quran || !isAdmin) {
        updateData.input_by_quran = userId;
      }

      if (!existing?.input_at_quran) {
        updateData.input_at_quran = now;
      }
    }

    // 2. Santri (Wawancara) Update
    if (canEditWawancara && body.detail_wawancara !== undefined) {
      if (existing?.input_at_santri && !isAdmin) {
        const diff =
          now.getTime() - new Date(existing.input_at_santri).getTime();
        if (diff > LOCK_TIME) {
          return NextResponse.json(
            {
              error:
                "Masa edit untuk Wawancara Calon Santri sudah habis. Silakan hubungi Admin Super.",
            },
            { status: 403 },
          );
        }
      }

      if (body.nilai_wawancara_santri !== undefined)
        updateData.nilai_wawancara_santri = body.nilai_wawancara_santri;
      if (body.catatan_santri !== undefined)
        updateData.catatan_santri = body.catatan_santri;
      if (body.detail_wawancara !== undefined)
        updateData.detail_wawancara = body.detail_wawancara;
      if (body.score_wawancara !== undefined)
        updateData.score_wawancara = body.score_wawancara;
      if (!existing?.input_by_santri || !isAdmin) {
        updateData.input_by_santri = userId;
      }

      if (!existing?.input_at_santri) {
        updateData.input_at_santri = now;
      }
    }

    // 3. Ortu (Cawalsan) Update
    if (canEditOrtu && body.detail_cawalsan !== undefined) {
      if (existing?.input_at_ortu && !isAdmin) {
        const diff =
          now.getTime() - new Date(existing.input_at_ortu).getTime();
        if (diff > LOCK_TIME) {
          return NextResponse.json(
            {
              error:
                "Masa edit untuk Seleksi Wawancara Orang Tua/Wali sudah habis. Silakan hubungi Admin Super.",
            },
            { status: 403 },
          );
        }
      }

      if (body.nilai_wawancara_ortu !== undefined)
        updateData.nilai_wawancara_ortu = body.nilai_wawancara_ortu;
      if (body.catatan_ortu !== undefined)
        updateData.catatan_ortu = body.catatan_ortu;
      if (body.detail_cawalsan !== undefined)
        updateData.detail_cawalsan = body.detail_cawalsan;
      if (!existing?.input_by_ortu || !isAdmin) {
        updateData.input_by_ortu = userId;
      }

      if (!existing?.input_at_ortu) {
        updateData.input_at_ortu = now;
      }
    }

    // 4. Hafalan Update
    if (canEditHafalan && body.detail_hafalan !== undefined) {
      if (existing?.input_at_hafalan && !isAdmin) {
        const diff =
          now.getTime() - new Date(existing.input_at_hafalan).getTime();
        if (diff > LOCK_TIME) {
          return NextResponse.json(
            { error: "Masa edit untuk Tes Hafalan sudah habis." },
            { status: 403 },
          );
        }
      }

      if (body.nilai_tes_hafalan !== undefined)
        updateData.nilai_hafalan_total = body.nilai_tes_hafalan;
      if (body.nilai_hafalan_total !== undefined)
        updateData.nilai_hafalan_total = body.nilai_hafalan_total;
      if (body.catatan_hafalan !== undefined)
        updateData.catatan_hafalan = body.catatan_hafalan;
      if (body.detail_hafalan !== undefined)
        updateData.detail_hafalan = body.detail_hafalan;
      if (body.score_hafalan !== undefined)
        updateData.score_hafalan = body.score_hafalan;
      if (!existing?.input_by_hafalan || !isAdmin) {
        updateData.input_by_hafalan = userId;
      }

      if (!existing?.input_at_hafalan) {
        updateData.input_at_hafalan = now;
      }
    }

    // 5. Lisan Arab Update
    const arabDetail =
      body.detail_lisan_arab !== undefined
        ? body.detail_lisan_arab
        : body.detail_arab;
    const arabScore =
      body.score_lisan_arab !== undefined
        ? body.score_lisan_arab
        : body.score_arab;
    const arabNilai =
      body.nilai_tes_lisan_arab !== undefined
        ? body.nilai_tes_lisan_arab
        : body.nilai_arab_total;
    const arabCatatan =
      body.catatan_lisan_arab !== undefined
        ? body.catatan_lisan_arab
        : body.catatan_arab;

    if (canEditLisanArab && arabDetail !== undefined) {
      if (existing?.input_at_arab && !isAdmin) {
        const diff =
          now.getTime() - new Date(existing.input_at_arab).getTime();
        if (diff > LOCK_TIME) {
          return NextResponse.json(
            {
              error: "Masa edit untuk Tes Lisan Bahasa Arab sudah habis.",
            },
            { status: 403 },
          );
        }
      }

      if (arabNilai !== undefined) updateData.nilai_arab_total = arabNilai;
      if (arabCatatan !== undefined) updateData.catatan_arab = arabCatatan;
      if (arabDetail !== undefined) updateData.detail_arab = arabDetail;
      if (arabScore !== undefined) updateData.score_arab = arabScore;
      if (!existing?.input_by_arab || !isAdmin) {
        updateData.input_by_arab = userId;
      }

      if (!existing?.input_at_arab) {
        updateData.input_at_arab = now;
      }
    }

    // Check if any component was actually allowed to be updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error:
            "Tidak ada komponen nilai yang diizinkan untuk disimpan dengan role Anda saat ini.",
        },
        { status: 403 },
      );
    }

    // 6. Upsert Score - Link to the schedule being graded
    if (existing) {
      await prisma.nilaiUjian.update({
        where: { id: existing.id },
        data: {
          ...updateData,
          ...(assignment?.id ? { jadwal_ujian_id: assignment.id } : {}),
          updated_at: now,
        },
      });
    } else {
      await prisma.nilaiUjian.create({
        data: {
          pendaftar_id: pendaftarId,
          ...(assignment?.id ? { jadwal_ujian_id: assignment.id } : {}),
          ...updateData,
        },
      });
    }

    // 7. Trigger Recalculation
    await recalculateNilaiUjian(pendaftarId);

    // 8. AUTOMATION: Mark as finished if assignment exists
    if (assignment) {
      try {
        let componentType:
          | "santri"
          | "quran"
          | "ortu"
          | "hafalan"
          | "arab"
          | "lisan_arab"
          | undefined = undefined;
        if (body.detail_quran) componentType = "quran";
        else if (body.detail_wawancara) componentType = "santri";
        else if (body.detail_cawalsan) componentType = "ortu";
        else if (body.detail_hafalan) componentType = "hafalan";
        else if (body.detail_lisan_arab || body.detail_arab)
          componentType = "lisan_arab";

        if (componentType) {
          await markExamComponentAsComplete({
            jadwalId: assignment.id,
            userId,
            componentType,
          });
        }
      } catch (err) {
        console.error("Automation Error (Ignored):", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH penguji/nilai error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
