import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";

async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");

  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value);
    const allowedRoles = ["admin", "admin_super"];
    if (allowedRoles.includes(session.role)) {
      return session;
    }
  } catch {
    return null;
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all JadwalUjian with relations (filtering out deleted students)
    const schedules = await prisma.jadwalUjian.findMany({
      where: {
        pendaftar: {
          deleted_at: null,
        },
      },
      include: {
        pendaftar: {
          select: {
            id: true,
            nomor_pendaftaran: true,
            nama_lengkap: true,
            jenjang: true,
            no_hp: true,
          },
        },
        exam_session: {
          select: {
            id: true,
            title: true,
            start_time: true,
            end_time: true,
            location: true,
            created_by: true,
            creator: {
              select: {
                id: true,
                full_name: true,
                role: true,
              },
            },
          },
        },
        penguji_quran: {
          select: {
            id: true,
            full_name: true,
            google_meet_link: true,
          },
        },
        penguji_santri: {
          select: {
            id: true,
            full_name: true,
            google_meet_link: true,
          },
        },
        penguji_ortu: {
          select: {
            id: true,
            full_name: true,
            google_meet_link: true,
          },
        },
        penguji_hafalan: {
          select: {
            id: true,
            full_name: true,
            google_meet_link: true,
          },
        },
        penguji_arab: {
          select: {
            id: true,
            full_name: true,
            google_meet_link: true,
          },
        },
        nilai_ujian: {
          select: {
            detail_quran: true,
            detail_wawancara: true,
            detail_cawalsan: true,
          },
        },
      },
      orderBy: [{ tanggal_ujian: "desc" }, { waktu_mulai_santri: "asc" }],
    });

    const formatted = schedules.map((s) => {
      const hasScoreQuran = s.nilai_ujian.some((n) => {
        const q = n.detail_quran as any;
        return !!(q && typeof q === "object" && (q.rekomendasi || q.nama_penguji));
      });
      const hasScoreSantri = s.nilai_ujian.some((n) => {
        const w = n.detail_wawancara as any;
        return !!(w && typeof w === "object" && (w.rekomendasi || w.nama_penguji));
      });
      const hasScoreOrtu = s.nilai_ujian.some((n) => {
        const c = n.detail_cawalsan as any;
        return !!(c && typeof c === "object" && (c.rekomendasi || c.nama_penguji));
      });

      // Session creator fallback if examiner created the slot
      const creator = s.exam_session?.creator;
      const sessionTitle = (s.exam_session?.title || "").toLowerCase();

      // Check if creator can be used as fallback
      const creatorIsExaminer = creator && (
        creator.role === "penguji" ||
        creator.role?.includes("quran") ||
        creator.role?.includes("santri") ||
        creator.role?.includes("ortu") ||
        creator.role?.includes("hafalan") ||
        creator.role?.includes("arab")
      );

      let fallbackQuran: string | null = null;
      let fallbackSantri: string | null = null;
      let fallbackOrtu: string | null = null;

      if (creatorIsExaminer) {
        if (sessionTitle.includes("qur") || creator.role?.includes("quran")) {
          fallbackQuran = creator.full_name;
        } else if (sessionTitle.includes("santri") || creator.role?.includes("santri")) {
          fallbackSantri = creator.full_name;
        } else if (sessionTitle.includes("ortu") || creator.role?.includes("ortu")) {
          fallbackOrtu = creator.full_name;
        }
      }

      const quranName = s.penguji_quran?.full_name || fallbackQuran || null;
      const santriName = s.penguji_santri?.full_name || fallbackSantri || null;
      const ortuName = s.penguji_ortu?.full_name || fallbackOrtu || null;
      const hafalanName = s.penguji_hafalan?.full_name || null;
      const arabName = s.penguji_arab?.full_name || null;

      return {
        id: s.id,
        pendaftar: {
          id: s.pendaftar.id,
          nomor: s.pendaftar.nomor_pendaftaran,
          nama: s.pendaftar.nama_lengkap,
          jenjang: s.pendaftar.jenjang,
          no_hp: s.pendaftar.no_hp,
        },
        sesi: {
          id: s.exam_session?.id || null,
          title: s.exam_session?.title || "Sesi Ujian",
          start: s.exam_session?.start_time || s.waktu_mulai_santri,
          end: s.exam_session?.end_time || s.waktu_selesai_santri,
          location: s.exam_session?.location || s.tempat_santri,
          metode: s.metode_ujian || "offline",
        },
        ustadz: {
          quran: quranName || "-",
          santri: santriName || "-",
          ortu: ortuName || "-",
          hafalan: hafalanName || "-",
          arab: arabName || "-",
        },
        ustadz_id: {
          quran: s.penguji_quran_id || (fallbackQuran ? creator?.id : null),
          santri: s.penguji_santri_id || (fallbackSantri ? creator?.id : null),
          ortu: s.penguji_ortu_id || (fallbackOrtu ? creator?.id : null),
          hafalan: s.penguji_hafalan_id || null,
          arab: s.penguji_arab_id || null,
        },
        is_assigned: {
          quran: !!quranName,
          santri: !!santriName,
          ortu: !!ortuName,
          hafalan: !!hafalanName,
          arab: !!arabName,
        },
        status: {
          quran: hasScoreQuran ? "completed" : s.status_quran || "scheduled",
          santri: hasScoreSantri ? "completed" : s.status_santri || "scheduled",
          ortu: hasScoreOrtu ? "completed" : s.status_ortu || "scheduled",
          hafalan: s.status_hafalan || "scheduled",
          arab: s.status_arab || "scheduled",
        },
      };
    });

    const cleanedData = formatted.filter((s) => {
      const nama = s.pendaftar.nama.toLowerCase();
      return (
        !nama.includes("tes ") &&
        !nama.includes("test") &&
        !nama.endsWith("tes")
      );
    });

    return NextResponse.json({ data: cleanedData });
  } catch (error: any) {
    console.error("Monitoring API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      jadwal_id,
      penguji_quran_id,
      penguji_santri_id,
      penguji_ortu_id,
      penguji_hafalan_id,
      penguji_arab_id,
      allow_conflict,
    } = body;

    if (!jadwal_id) {
      return NextResponse.json(
        { error: "jadwal_id is required" },
        { status: 400 },
      );
    }

    const currentJadwal = await prisma.jadwalUjian.findUnique({
      where: { id: jadwal_id },
      include: {
        pendaftar: { select: { id: true, nama_lengkap: true } },
        exam_session: { select: { location: true, start_time: true } },
      },
    });

    if (!currentJadwal) {
      return NextResponse.json(
        { error: "Jadwal ujian tidak ditemukan" },
        { status: 404 },
      );
    }

    // Conflict Guard: Check conflicting schedules on same start_time
    const scheduleStartTime = currentJadwal.exam_session?.start_time || currentJadwal.waktu_mulai_santri;
    const newExaminerIds = [
      penguji_quran_id,
      penguji_santri_id,
      penguji_ortu_id,
      penguji_hafalan_id,
      penguji_arab_id,
    ].filter(Boolean);

    if (newExaminerIds.length > 0 && scheduleStartTime && !allow_conflict) {
      const conflictingSchedules = await prisma.jadwalUjian.findMany({
        where: {
          id: { not: jadwal_id },
          pendaftar: { deleted_at: null },
          OR: [
            { exam_session: { start_time: scheduleStartTime } },
            { waktu_mulai_santri: scheduleStartTime },
          ],
          AND: [
            {
              OR: [
                { penguji_quran_id: { in: newExaminerIds } },
                { penguji_santri_id: { in: newExaminerIds } },
                { penguji_ortu_id: { in: newExaminerIds } },
                { penguji_hafalan_id: { in: newExaminerIds } },
                { penguji_arab_id: { in: newExaminerIds } },
              ],
            },
          ],
        },
        include: {
          pendaftar: { select: { nama_lengkap: true, nomor_pendaftaran: true } },
        },
      });

      if (conflictingSchedules.length > 0) {
        const details = conflictingSchedules.map(
          (cs) => `${cs.pendaftar.nama_lengkap} (${cs.pendaftar.nomor_pendaftaran})`
        );
        return NextResponse.json(
          {
            conflict: true,
            message: `Terdeteksi bentrokan jadwal: Penguji yang Anda pilih sudah memiliki jadwal ujian lain dengan ${details.join(", ")} pada jam yang sama.`,
            conflictingWith: details,
          },
          { status: 409 }
        );
      }
    }

    // Determine if online
    const loc = (currentJadwal.exam_session?.location || currentJadwal.tempat_santri || "").toLowerCase();
    const isOnline =
      currentJadwal.metode_ujian === "online" ||
      loc.includes("online") ||
      loc.includes("meet") ||
      loc.includes("http");

    // Prepare update data
    const updateData: any = {};

    // Helper to fetch meet link
    const getMeetLink = async (profileId?: string | null) => {
      if (!profileId || !isOnline) return null;
      const p = await prisma.profile.findUnique({
        where: { id: profileId },
        select: { google_meet_link: true },
      });
      return p?.google_meet_link || null;
    };

    if (penguji_quran_id !== undefined) {
      updateData.penguji_quran_id = penguji_quran_id || null;
      if (isOnline) {
        updateData.zoom_link_quran = await getMeetLink(penguji_quran_id);
      }
    }

    if (penguji_santri_id !== undefined) {
      updateData.penguji_santri_id = penguji_santri_id || null;
      if (isOnline) {
        updateData.zoom_link_santri = await getMeetLink(penguji_santri_id);
      }
    }

    if (penguji_ortu_id !== undefined) {
      updateData.penguji_ortu_id = penguji_ortu_id || null;
      if (isOnline) {
        updateData.zoom_link_ortu = await getMeetLink(penguji_ortu_id);
      }
    }

    if (penguji_hafalan_id !== undefined) {
      updateData.penguji_hafalan_id = penguji_hafalan_id || null;
      if (isOnline) {
        updateData.zoom_link_hafalan = await getMeetLink(penguji_hafalan_id);
      }
    }

    if (penguji_arab_id !== undefined) {
      updateData.penguji_arab_id = penguji_arab_id || null;
      if (isOnline) {
        updateData.zoom_link_arab = await getMeetLink(penguji_arab_id);
      }
    }

    // If online, update main google_meet_link if any interviewer has one
    if (isOnline) {
      const anyMeet =
        updateData.zoom_link_santri ||
        updateData.zoom_link_ortu ||
        updateData.zoom_link_quran ||
        updateData.zoom_link_arab ||
        updateData.zoom_link_hafalan;
      if (anyMeet) {
        updateData.google_meet_link = anyMeet;
      }
    }

    const updated = await prisma.jadwalUjian.update({
      where: { id: jadwal_id },
      data: updateData,
    });

    logAdminAction({
      action: "ASSIGN_EXAM",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: currentJadwal.pendaftar_id,
      targetName: currentJadwal.pendaftar?.nama_lengkap,
      details: {
        action: "UPDATE_EXAMINERS_FROM_MONITORING",
        jadwal_id,
        updatedFields: updateData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Penguji berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH Monitoring API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

