import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recalculateNilaiUjian } from "@/lib/scoring";
import { gradeToScore } from "@/lib/grading";
import { markExamComponentAsComplete } from "@/lib/exam-status";

async function getSession() {
  const { cookies } = await import("next/headers");
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

export async function POST(req: Request) {
  try {
    // 1. Auth Check (Admins/Examiners only)
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user_id || session.id;

    // Fetch user profile to check primary and secondary roles
    const userProfile = userId
      ? await prisma.profile.findUnique({
          where: { id: userId },
          select: { role: true, secondary_roles: true },
        })
      : null;

    const allUserRoles = [
      session.role,
      ...(Array.isArray(session.secondary_roles) ? session.secondary_roles : []),
      ...(userProfile?.role ? [userProfile.role] : []),
      ...(Array.isArray(userProfile?.secondary_roles) ? userProfile.secondary_roles : []),
    ]
      .filter(Boolean)
      .map((r: string) => (r || "").toLowerCase().trim());

    const isSuper = allUserRoles.some((r) =>
      ["admin_super", "admin", "head_of_it"].includes(r),
    );

    const body = await req.json();
    const { pendaftar_id, type } = body;
    const { score, details, examiner_id, grade } = body;

    const effectiveExaminerId = examiner_id || userId;

    if (!pendaftar_id || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!details?.catatan || !details.catatan.trim()) {
      return NextResponse.json(
        { error: "Catatan/komentar evaluasi wajib diisi untuk keperluan rapat pleno." },
        { status: 400 },
      );
    }

    // RBAC Validation (Bypassed if user is Admin / Admin Super)
    if (!isSuper) {
      const allowedRolesForType: Record<string, string[]> = {
        quran: ["penguji", "penguji_calsan", "penguji_quran", "penguji_hafalan"],
        hafalan: ["penguji", "penguji_calsan", "penguji_quran", "penguji_hafalan"],
        arab: ["penguji", "penguji_bahasa_arab", "penguji_arab"],
        lisan_arab: ["penguji", "penguji_bahasa_arab", "penguji_arab"],
        wawancara_santri: ["pewawancara_calsan", "pewawancara", "penguji_calsan"],
        wawancara_ortu: ["pewawancara_cawalsan", "pewawancara", "penguji_cawalsan"],
      };

      const allowedRoles = allowedRolesForType[type] || [];
      const hasAllowedRole = allUserRoles.some((r) => allowedRoles.includes(r));

      if (!hasAllowedRole) {
        return NextResponse.json(
          { error: `Forbidden: Role Anda (${allUserRoles.join(", ")}) tidak diizinkan untuk input nilai tipe ${type}` },
          { status: 403 },
        );
      }

      // Check if this examiner is explicitly assigned to this student for this exam type
      const nilai = await prisma.nilaiUjian.findFirst({
        where: { pendaftar_id },
        select: { detail_akademik: true },
      });

      let isAssigned = false;
      if (nilai && nilai.detail_akademik) {
        const da =
          typeof nilai.detail_akademik === "string"
            ? JSON.parse(nilai.detail_akademik)
            : nilai.detail_akademik;
        if (
          da.assigned_examiners &&
          da.assigned_examiners[type] === userId
        ) {
          isAssigned = true;
        }
      }

      if (!isAssigned) {
        const pendaftar = await prisma.pendaftar.findUnique({
          where: { id: pendaftar_id },
          select: { status_pendaftaran: true },
        });

        const ALLOWED_STATUSES = [
          "docs_verified",
          "scheduled",
          "tested",
          "announced",
          "accepted",
          "enrolled",
        ];
        if (
          !pendaftar ||
          !ALLOWED_STATUSES.includes(pendaftar.status_pendaftaran || "")
        ) {
          return NextResponse.json(
            {
              error:
                'Forbidden: Input nilai ditolak karena pendaftar belum berstatus "Terverifikasi Berkas".',
            },
            { status: 403 },
          );
        }
      }
    }

    // Determine numeric score to save
    let numericScore = score;
    if (grade && (score === undefined || score === null)) {
      numericScore = gradeToScore(grade);
    }

    // 2. Prepare Data to Update
    const updateData: any = { updated_at: new Date() };
    let componentTypeForSchedule: "santri" | "quran" | "ortu" | "hafalan" | "arab" | "lisan_arab" | undefined = undefined;

    if (type === "quran") {
      updateData.score_quran = numericScore;
      updateData.nilai_tes_quran = numericScore;
      updateData.catatan_quran = details?.catatan;
      if (details) updateData.detail_quran = details;
      updateData.input_by_quran = effectiveExaminerId;
      updateData.input_at_quran = new Date();
      componentTypeForSchedule = "quran";
    } else if (type === "hafalan") {
      updateData.score_hafalan = numericScore;
      updateData.nilai_hafalan_total = numericScore;
      updateData.catatan_hafalan = details?.catatan;
      if (details) updateData.detail_hafalan = details;
      updateData.input_by_hafalan = effectiveExaminerId;
      updateData.input_at_hafalan = new Date();
      componentTypeForSchedule = "hafalan";
    } else if (type === "arab" || type === "lisan_arab") {
      updateData.score_arab = numericScore;
      updateData.nilai_arab_total = numericScore;
      updateData.catatan_arab = details?.catatan;
      if (details) updateData.detail_arab = details;
      updateData.input_by_arab = effectiveExaminerId;
      updateData.input_at_arab = new Date();
      componentTypeForSchedule = "lisan_arab";
    } else if (type === "wawancara_santri") {
      updateData.nilai_wawancara_santri = numericScore;
      updateData.score_wawancara = numericScore;
      updateData.catatan_santri = details?.catatan;
      if (details) updateData.detail_wawancara = details;
      updateData.input_by_santri = effectiveExaminerId;
      updateData.input_at_santri = new Date();
      componentTypeForSchedule = "santri";
    } else if (type === "wawancara_ortu") {
      updateData.nilai_wawancara_ortu = numericScore;
      updateData.catatan_ortu = details?.catatan;
      if (details) updateData.detail_cawalsan = details;
      updateData.input_by_ortu = effectiveExaminerId;
      updateData.input_at_ortu = new Date();
      componentTypeForSchedule = "ortu";
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // 3. Update DB NilaiUjian
    let nilai = await prisma.nilaiUjian.findFirst({ where: { pendaftar_id } });
    if (!nilai) {
      nilai = await prisma.nilaiUjian.create({ data: { pendaftar_id } });
    }

    const updated = await prisma.nilaiUjian.update({
      where: { id: nilai.id },
      data: updateData,
    });

    // 4. Trigger Recalculation
    await recalculateNilaiUjian(pendaftar_id);

    // 5. SINKRONISASI KE JADWAL UJIAN
    try {
      let jadwal = await prisma.jadwalUjian.findFirst({
        where: { pendaftar_id },
        orderBy: { created_at: "desc" },
      });

      const jadwalUpdate: any = {};
      if (type === "wawancara_ortu") jadwalUpdate.penguji_ortu_id = effectiveExaminerId;
      else if (type === "wawancara_santri") jadwalUpdate.penguji_santri_id = effectiveExaminerId;
      else if (type === "quran") jadwalUpdate.penguji_quran_id = effectiveExaminerId;
      else if (type === "hafalan") jadwalUpdate.penguji_hafalan_id = effectiveExaminerId;
      else if (type === "arab" || type === "lisan_arab") jadwalUpdate.penguji_arab_id = effectiveExaminerId;

      if (!jadwal) {
        jadwal = await prisma.jadwalUjian.create({
          data: {
            pendaftar_id,
            tanggal_ujian: new Date(),
            ...jadwalUpdate,
          },
        });
      } else {
        jadwal = await prisma.jadwalUjian.update({
          where: { id: jadwal.id },
          data: jadwalUpdate,
        });
      }

      if (jadwal && componentTypeForSchedule) {
        await markExamComponentAsComplete({
          jadwalId: jadwal.id,
          userId: effectiveExaminerId,
          componentType: componentTypeForSchedule,
        });
      }
    } catch (schedErr) {
      console.warn("[Penilaian Submit] Non-fatal jadwal sync warning:", schedErr);
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Examiner Submit Error:", error);
    return NextResponse.json(
      { error: (error as any).message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
