import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { recalculateNilaiUjian } from "@/lib/scoring";
import { markExamComponentAsComplete } from "@/lib/exam-status";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

// PATCH: Update score (Upsert)
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
    const assignment = await prisma.jadwalUjian.findFirst({
      where: {
        pendaftar_id: pendaftarId,
        OR: [
          { penguji_santri_id: userId },
          { penguji_quran_id: userId },
          { penguji_ortu_id: userId },
          { exam_session: { created_by: userId } },
        ],
      },
      include: {
        exam_session: { select: { title: true, created_by: true } },
      },
    });

    // If examiner, only specific fields.
    const isWawancara = assignment?.penguji_santri_id === userId;
    const isQuran = assignment?.penguji_quran_id === userId;
    const isOrtu = assignment?.penguji_ortu_id === userId;
    const isHafalan = assignment?.penguji_hafalan_id === userId;
    const isLisanArab = assignment?.penguji_arab_id === userId;

    // Fetch user profile to see if they're actually an admin who switched roles
    const userProfile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true, secondary_roles: true },
    });
    const allRoles = userProfile
      ? [userProfile.role, ...(userProfile.secondary_roles || [])]
      : [];
    const isAdmin = allRoles.some((r) => ["admin_super", "admin"].includes(r));

    // Let admins bypass the assignment check
    if (!assignment && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Not assigned to this student" },
        { status: 403 },
      );
    }

    // Fallback: if matched via exam_session.created_by, derive role from session title
    let isWawancaraFallback = false;
    let isQuranFallback = false;
    let isOrtuFallback = false;
    let isHafalanFallback = false;
    let isLisanArabFallback = false;

    if (
      !isWawancara &&
      !isQuran &&
      !isOrtu && !isHafalan && !isLisanArab &&
      assignment &&
      assignment.exam_session &&
      assignment.exam_session.created_by === userId
    ) {
      const title = (assignment.exam_session.title || "").toLowerCase();
      const hasQuranMatch = title.includes("qur") || title.includes("quran");
      const hasWawancaraMatch =
        title.includes("calsan") ||
        title.includes("santri") ||
        title.includes("wawancara");
      const hasOrtuMatch =
        title.includes("cawalsan") ||
        title.includes("ortu") ||
        title.includes("orang");
      const hasHafalanMatch = title.includes("hafalan");
      const hasLisanArabMatch = title.includes("arab") || title.includes("lisan");

      // If the title is generic (e.g. "Tes PPDB 1"), grant access to all forms (matches frontend behavior roles: [])
      if (!hasQuranMatch && !hasWawancaraMatch && !hasOrtuMatch && !hasHafalanMatch && !hasLisanArabMatch) {
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

    // Unified permission flags using session role as final fallback
    const baseRole = session.role || "";
    const canEditQuran =
      isAdmin ||
      isQuran ||
      isQuranFallback ||
      baseRole.includes("quran") ||
      baseRole === "penguji";
    const canEditWawancara =
      isAdmin ||
      isWawancara ||
      isWawancaraFallback ||
      baseRole.includes("calsan") ||
      baseRole === "pewawancara_calsan";
    const canEditOrtu =
      isAdmin ||
      isOrtu ||
      isOrtuFallback ||
      baseRole.includes("cawalsan") ||
      baseRole === "pewawancara_cawalsan";
    const canEditHafalan =
      isAdmin ||
      isHafalan ||
      isHafalanFallback ||
      baseRole.includes("hafalan") ||
      baseRole === "penguji_hafalan";
    const canEditLisanArab =
      isAdmin ||
      isLisanArab ||
      isLisanArabFallback ||
      baseRole.includes("arab") ||
      baseRole === "penguji_bahasa_arab";

    // 0. Pre-fetch existing record to check timestamps
    const existing = await prisma.nilaiUjian.findFirst({
      where: { pendaftar_id: pendaftarId },
      orderBy: { created_at: "desc" },
    });

    const updateData: any = {};
    const now = new Date();
    const LOCK_TIME = 24 * 60 * 60 * 1000; // 24 hours in ms

    // 1. Quran Update
    if (canEditQuran && body.detail_quran !== undefined) {
      // Check Lock
      if (existing?.input_at_quran && !isAdmin) {
        const diff =
          now.getTime() - new Date(existing.input_at_quran).getTime();
        if (diff > LOCK_TIME) {
          return NextResponse.json(
            {
              error:
                "Masa edit (24 jam) untuk Tes Quran sudah habis. Silakan hubungi Admin Super.",
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
      if (!existing?.input_by_quran || !isAdmin) {
        updateData.input_by_quran = userId;
      }

      // Only set input_at if it's the first time
      if (!existing?.input_at_quran) {
        updateData.input_at_quran = now;
      }
    }

    // 2. Santri (Santri) Update
    if (canEditWawancara && body.detail_wawancara !== undefined) {
      // Check Lock
      if (existing?.input_at_santri && !isAdmin) {
        const diff =
          now.getTime() - new Date(existing.input_at_santri).getTime();
        if (diff > LOCK_TIME) {
          return NextResponse.json(
            {
              error:
                "Masa edit (24 jam) untuk Wawancara Calon Santri sudah habis. Silakan hubungi Admin Super.",
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

      // Only set input_at if it's the first time
      if (!existing?.input_at_santri) {
        updateData.input_at_santri = now;
      }
    }

    // 3. Ortu (Orang Tua) Update
    if (canEditOrtu && body.detail_cawalsan !== undefined) {
      // Check Lock
      if (existing?.input_at_ortu && !isAdmin) {
        const diff = now.getTime() - new Date(existing.input_at_ortu).getTime();
        if (diff > LOCK_TIME) {
          return NextResponse.json(
            {
              error:
                "Masa edit (24 jam) untuk Seleksi Wawancara Orang Tua/Wali sudah habis. Silakan hubungi Admin Super.",
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

      // Only set input_at if it's the first time
      if (!existing?.input_at_ortu) {
        updateData.input_at_ortu = now;
      }
    }

    
    // 4. Hafalan Update
    if (canEditHafalan && body.detail_hafalan !== undefined) {
      if (existing?.input_at_hafalan && !isAdmin) {
        const diff = now.getTime() - new Date(existing.input_at_hafalan).getTime();
        if (diff > LOCK_TIME) {
          return NextResponse.json(
            { error: "Masa edit (24 jam) untuk Tes Hafalan sudah habis." },
            { status: 403 },
          );
        }
      }

      if (body.nilai_tes_hafalan !== undefined) updateData.nilai_tes_hafalan = body.nilai_tes_hafalan;
      if (body.catatan_hafalan !== undefined) updateData.catatan_hafalan = body.catatan_hafalan;
      if (body.detail_hafalan !== undefined) updateData.detail_hafalan = body.detail_hafalan;
      if (body.score_hafalan !== undefined) updateData.score_hafalan = body.score_hafalan;
      if (!existing?.input_by_hafalan || !isAdmin) {
        updateData.input_by_hafalan = userId;
      }

      if (!existing?.input_at_hafalan) {
        updateData.input_at_hafalan = now;
      }
    }

    // 5. Lisan Arab Update
    if (canEditLisanArab && body.detail_lisan_arab !== undefined) {
      if (existing?.input_at_arab && !isAdmin) {
        const diff = now.getTime() - new Date(existing.input_at_arab).getTime();
        if (diff > LOCK_TIME) {
          return NextResponse.json(
            { error: "Masa edit (24 jam) untuk Tes Lisan Bahasa Arab sudah habis." },
            { status: 403 },
          );
        }
      }

      if (body.nilai_tes_lisan_arab !== undefined) updateData.nilai_tes_lisan_arab = body.nilai_tes_lisan_arab;
      if (body.catatan_lisan_arab !== undefined) updateData.catatan_lisan_arab = body.catatan_lisan_arab;
      if (body.detail_lisan_arab !== undefined) updateData.detail_lisan_arab = body.detail_lisan_arab;
      if (body.score_lisan_arab !== undefined) updateData.score_lisan_arab = body.score_lisan_arab;
      if (!existing?.input_by_arab || !isAdmin) {
        updateData.input_by_arab = userId;
      }

      if (!existing?.input_at_arab) {
        updateData.input_at_arab = now;
      }
    }

    // 6. Upsert Score - Link to the schedule being graded
    if (existing) {
      await prisma.nilaiUjian.update({
        where: { id: existing.id },
        data: {
          ...updateData,
          jadwal_ujian_id: assignment?.id, // Ensure the link is established/updated
          updated_at: now,
        },
      });
    } else {
      await prisma.nilaiUjian.create({
        data: {
          pendaftar_id: pendaftarId,
          jadwal_ujian_id: assignment?.id,
          ...updateData,
        },
      });
    }

    // 4. Trigger Recalculation
    await recalculateNilaiUjian(pendaftarId);

    // 5. AUTOMATION: Mark as finished if assignment exists
    if (assignment) {
      try {
        let componentType: "santri" | "quran" | "ortu" | undefined = undefined;
        if (body.detail_quran) componentType = "quran";
        else if (body.detail_wawancara) componentType = "santri";
        else if (body.detail_cawalsan) componentType = "ortu";
        else if (body.detail_hafalan) componentType = "hafalan" as any;
        else if (body.detail_lisan_arab) componentType = "lisan_arab" as any;

        if (componentType) {
          await markExamComponentAsComplete({
            jadwalId: assignment.id,
            userId,
            componentType,
          });
        }
      } catch (err) {
        console.error("Automation Error (Ignored):", err);
        // We ignore automation errors so the score save still succeeds
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH penguji/nilai error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

