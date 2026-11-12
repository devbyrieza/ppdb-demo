import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import {
  enqueueWhatsapp,
  buildMessagePenugasanPenguji,
  buildMessagePengalihanJadwalPengujiLama,
} from "@/lib/whatsapp-queue";
import { BRANDING } from "@/config/branding";

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

function isJenjangLangsungNonIL(jenjang?: string | null): boolean {
  if (!jenjang) return false;
  const clean = jenjang.trim().toUpperCase();
  if (
    clean === "IL" ||
    clean.includes("IL ") ||
    clean.includes(" IL") ||
    clean.includes("(IL)") ||
    clean.includes("I'DAD") ||
    clean.includes("IDAD") ||
    clean.includes("IDADIYAH")
  ) {
    return false;
  }
  if (
    clean.includes("SMP") ||
    clean.includes("MTS") ||
    clean.includes("TSANAWIYAH")
  ) {
    return false;
  }
  if (
    clean.includes("SMA") ||
    clean.includes("MA") ||
    clean.includes("ALIYAH") ||
    clean.includes("SLTA")
  ) {
    return true;
  }
  return false;
}

function buildFullDateTime(datePart?: Date | string | null, timePart?: Date | string | null): string | null {
  if (!datePart && !timePart) return null;
  if (datePart) {
    const d = new Date(datePart);
    if (!isNaN(d.getTime()) && d.getFullYear() > 2000) {
      if (timePart) {
        const t = new Date(timePart);
        if (!isNaN(t.getTime())) {
          d.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), 0);
        }
      }
      return d.toISOString();
    }
  }
  if (timePart) {
    const t = new Date(timePart);
    if (!isNaN(t.getTime()) && t.getFullYear() > 2000) return t.toISOString();
  }
  return null;
}

function formatHariTanggalWIB(date: Date): string {
  const hari = date
    .toLocaleDateString("id-ID", { weekday: "long", timeZone: "Asia/Jakarta" })
    .replace(/Minggu/gi, "Ahad");
  const tgl = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  return `${hari}, ${tgl}`;
}

function formatWaktuRangeWIB(startDate?: Date | null, endDate?: Date | null): string {
  if (!startDate || isNaN(startDate.getTime())) return "-";
  const startJam = startDate
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
      hour12: false,
    })
    .replace(":", ".");

  if (endDate && !isNaN(endDate.getTime()) && endDate.getTime() !== startDate.getTime()) {
    const endJam = endDate
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
        hour12: false,
      })
      .replace(":", ".");
    return `${startJam} - ${endJam} WIB`;
  }
  return `${startJam} WIB`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all JadwalUjian with relations (filtering out deleted students)
        const { getAdminWhereClause } = await import("@/lib/utils/admin");
    const pendaftarWhere = await getAdminWhereClause();

    const schedules = await prisma.jadwalUjian.findMany({
      where: {
        pendaftar: pendaftarWhere,
      },
      include: {
        pendaftar: {
          select: {
            id: true,
            nomor_pendaftaran: true,
            nama_lengkap: true,
            jenjang: true,
            no_hp: true,
            created_at: true,
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
      const isLangsungNonIL = isJenjangLangsungNonIL(s.pendaftar?.jenjang);
      const hafalanName = null;
      const arabName = isLangsungNonIL ? (s.penguji_arab?.full_name || null) : null;

      return {
        id: s.id,
        created_at: s.created_at,
        updated_at: s.updated_at,
        pendaftar: {
          id: s.pendaftar.id,
          nomor: s.pendaftar.nomor_pendaftaran,
          nama: s.pendaftar.nama_lengkap,
          jenjang: s.pendaftar.jenjang,
          no_hp: s.pendaftar.no_hp,
          created_at: s.pendaftar.created_at,
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
          hafalan: "-",
          arab: arabName || "-",
        },
        ustadz_id: {
          quran: s.penguji_quran_id || (fallbackQuran ? creator?.id : null),
          santri: s.penguji_santri_id || (fallbackSantri ? creator?.id : null),
          ortu: s.penguji_ortu_id || (fallbackOrtu ? creator?.id : null),
          hafalan: null,
          arab: isLangsungNonIL ? (s.penguji_arab_id || null) : null,
        },
        is_assigned: {
          quran: !!quranName,
          santri: !!santriName,
          ortu: !!ortuName,
          hafalan: false,
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
      status_quran,
      status_santri,
      status_ortu,
      status_hafalan,
      status_arab,
      allow_conflict,
      new_session_id,
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
        pendaftar: {
          select: {
            id: true,
            nama_lengkap: true,
            nomor_pendaftaran: true,
            jenjang: true,
          },
        },
        exam_session: {
          select: {
            id: true,
            title: true,
            location: true,
            start_time: true,
            end_time: true,
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
      },
    });

    if (!currentJadwal) {
      return NextResponse.json(
        { error: "Jadwal ujian tidak ditemukan" },
        { status: 404 },
      );
    }

    // Resolve previous examiners BEFORE update (direct column first, fallback to exam_session.creator matching GET logic)
    const oldCreator = currentJadwal.exam_session?.creator;
    const oldSessionTitle = (currentJadwal.exam_session?.title || "").toLowerCase();
    const oldCreatorIsExaminer = Boolean(
      oldCreator &&
        (oldCreator.role === "penguji" ||
          oldCreator.role?.includes("quran") ||
          oldCreator.role?.includes("santri") ||
          oldCreator.role?.includes("ortu") ||
          oldCreator.role?.includes("hafalan") ||
          oldCreator.role?.includes("arab") ||
          oldCreator.role?.includes("calsan") ||
          oldCreator.role?.includes("cawalsan")),
    );

    let fallbackOldQuranId: string | null = null;
    let fallbackOldSantriId: string | null = null;
    let fallbackOldOrtuId: string | null = null;
    let fallbackOldArabId: string | null = null;

    if (oldCreatorIsExaminer && oldCreator) {
      if (oldSessionTitle.includes("qur") || oldCreator.role?.includes("quran")) {
        fallbackOldQuranId = oldCreator.id;
      } else if (
        oldSessionTitle.includes("ortu") ||
        oldSessionTitle.includes("cawalsan") ||
        oldSessionTitle.includes("orang") ||
        oldSessionTitle.includes("wali") ||
        oldCreator.role?.includes("ortu") ||
        oldCreator.role?.includes("cawalsan")
      ) {
        fallbackOldOrtuId = oldCreator.id;
      } else if (
        oldSessionTitle.includes("santri") ||
        oldSessionTitle.includes("calsan") ||
        oldCreator.role?.includes("santri") ||
        oldCreator.role?.includes("calsan")
      ) {
        fallbackOldSantriId = oldCreator.id;
      } else if (
        oldSessionTitle.includes("arab") ||
        oldSessionTitle.includes("lisan") ||
        oldCreator.role?.includes("arab")
      ) {
        fallbackOldArabId = oldCreator.id;
      }
    }

    const oldExaminers = {
      quran: currentJadwal.penguji_quran_id || fallbackOldQuranId || currentJadwal.penguji_hafalan_id || null,
      santri: currentJadwal.penguji_santri_id || fallbackOldSantriId || null,
      ortu: currentJadwal.penguji_ortu_id || fallbackOldOrtuId || null,
      arab: currentJadwal.penguji_arab_id || fallbackOldArabId || null,
    };

    // Prepare update data
    const updateData: any = {};

    let targetStartTime: Date | null = currentJadwal.exam_session?.start_time || null;
    let targetEndTime: Date | null = currentJadwal.exam_session?.end_time || null;

    if (!targetStartTime && currentJadwal.tanggal_ujian && currentJadwal.waktu_mulai_santri) {
      const fullStart = buildFullDateTime(currentJadwal.tanggal_ujian, currentJadwal.waktu_mulai_santri);
      if (fullStart) targetStartTime = new Date(fullStart);
      const fullEnd = currentJadwal.waktu_selesai_santri
        ? buildFullDateTime(currentJadwal.tanggal_ujian, currentJadwal.waktu_selesai_santri)
        : null;
      if (fullEnd) targetEndTime = new Date(fullEnd);
    }

    const oldStartTime: Date | null = targetStartTime ? new Date(targetStartTime) : (currentJadwal.tanggal_ujian ? new Date(currentJadwal.tanggal_ujian) : null);
    const oldEndTime: Date | null = targetEndTime ? new Date(targetEndTime) : null;

    let effectiveSession = currentJadwal.exam_session;
    let sessionChanged = false;

    if (new_session_id) {
      const newSession = await prisma.examSession.findUnique({
        where: { id: new_session_id },
      });
      if (newSession) {
        targetStartTime = newSession.start_time;
        targetEndTime = newSession.end_time;
        if (new_session_id !== currentJadwal.exam_session_id) {
          sessionChanged = true;
          effectiveSession = {
            ...newSession,
            created_by: newSession.created_by,
            creator: null,
          } as any;
          updateData.exam_session_id = newSession.id;
          updateData.tanggal_ujian = (newSession as any).date || new Date(newSession.start_time);
          updateData.waktu_mulai_santri = newSession.start_time;
          updateData.waktu_selesai_santri = newSession.end_time;
          updateData.waktu_mulai_ortu = newSession.start_time;
          updateData.waktu_selesai_ortu = newSession.end_time;
          if (newSession.location) {
            updateData.tempat_santri = newSession.location;
            updateData.tempat_ortu = newSession.location;
          }
        }
      }
    }

    // Conflict Guard: Check conflicting schedules on same date & overlapping time
    const newExaminerIds = [
      penguji_quran_id,
      penguji_santri_id,
      penguji_ortu_id,
      penguji_hafalan_id,
      penguji_arab_id,
    ].filter(Boolean);

    if (newExaminerIds.length > 0 && targetStartTime && !allow_conflict) {
      const targetStartMs = new Date(targetStartTime).getTime();
      const targetEndMs = targetEndTime
        ? new Date(targetEndTime).getTime()
        : targetStartMs + 30 * 60 * 1000;

      const candidateSchedules = await prisma.jadwalUjian.findMany({
        where: {
          id: { not: jadwal_id },
          pendaftar_id: { not: currentJadwal.pendaftar_id },
          pendaftar: { deleted_at: null },
          OR: [
            { penguji_quran_id: { in: newExaminerIds } },
            { penguji_santri_id: { in: newExaminerIds } },
            { penguji_ortu_id: { in: newExaminerIds } },
            { penguji_hafalan_id: { in: newExaminerIds } },
            { penguji_arab_id: { in: newExaminerIds } },
          ],
        },
        include: {
          pendaftar: { select: { nama_lengkap: true, nomor_pendaftaran: true } },
          exam_session: { select: { start_time: true, end_time: true } },
        },
      });

      const conflictingSchedules = candidateSchedules.filter((cs) => {
        let csStartMs: number | null = null;
        let csEndMs: number | null = null;

        if (cs.exam_session?.start_time) {
          csStartMs = new Date(cs.exam_session.start_time).getTime();
          csEndMs = cs.exam_session.end_time
            ? new Date(cs.exam_session.end_time).getTime()
            : csStartMs + 30 * 60 * 1000;
        } else if (cs.tanggal_ujian && cs.waktu_mulai_santri) {
          const fullStart = buildFullDateTime(cs.tanggal_ujian, cs.waktu_mulai_santri);
          if (fullStart) {
            csStartMs = new Date(fullStart).getTime();
            const fullEnd = cs.waktu_selesai_santri
              ? buildFullDateTime(cs.tanggal_ujian, cs.waktu_selesai_santri)
              : null;
            csEndMs = fullEnd ? new Date(fullEnd).getTime() : csStartMs + 30 * 60 * 1000;
          }
        }

        if (!csStartMs || !csEndMs || isNaN(csStartMs) || isNaN(csEndMs)) return false;

        // Overlapping interval check on exact full date-time:
        // [targetStartMs, targetEndMs) overlaps with [csStartMs, csEndMs)
        return targetStartMs < csEndMs && targetEndMs > csStartMs;
      });

      if (conflictingSchedules.length > 0) {
        const details = conflictingSchedules.map(
          (cs) => `${cs.pendaftar.nama_lengkap} (${cs.pendaftar.nomor_pendaftaran})`
        );
        return NextResponse.json(
          {
            conflict: true,
            message: `Terdeteksi bentrokan jadwal: Penguji yang Anda pilih sudah memiliki jadwal ujian lain dengan ${details.join(", ")} pada tanggal dan jam yang sama.`,
            conflictingWith: details,
          },
          { status: 409 }
        );
      }
    }

    // Determine if online
    const effectiveLocationStr =
      updateData.tempat_santri ||
      effectiveSession?.location ||
      currentJadwal.tempat_santri ||
      "";
    const loc = effectiveLocationStr.toLowerCase();
    const isOnline =
      currentJadwal.metode_ujian === "online" ||
      loc.includes("online") ||
      loc.includes("meet") ||
      loc.includes("http") ||
      loc.includes("zoom");

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
      // Hafalan is unified under Quran test in Al-Andalus, clear separate hafalan ID
      updateData.penguji_hafalan_id = null;
      if (isOnline) {
        updateData.zoom_link_quran = await getMeetLink(penguji_quran_id);
        updateData.zoom_link_hafalan = null;
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

    if (status_quran !== undefined) updateData.status_quran = status_quran;
    if (status_santri !== undefined) updateData.status_santri = status_santri;
    if (status_ortu !== undefined) updateData.status_ortu = status_ortu;
    if (status_hafalan !== undefined) updateData.status_hafalan = status_hafalan;
    if (status_arab !== undefined) updateData.status_arab = status_arab;

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

    // Dispatch immediate WhatsApp notifications for changed / reassigned / rescheduled examiners
    const notifSummary: {
      sent: Array<{ name: string; role: string; kind: "new_examiner" | "previous_examiner" }>;
      skipped: Array<{ name: string; role: string; reason: string }>;
      failed: Array<{ name: string; role: string; reason: string }>;
    } = { sent: [], skipped: [], failed: [] };

    try {
      const newExaminers = {
        quran: penguji_quran_id !== undefined ? (updated.penguji_quran_id || null) : oldExaminers.quran,
        santri: penguji_santri_id !== undefined ? (updated.penguji_santri_id || null) : oldExaminers.santri,
        ortu: penguji_ortu_id !== undefined ? (updated.penguji_ortu_id || null) : oldExaminers.ortu,
        arab: penguji_arab_id !== undefined ? (updated.penguji_arab_id || null) : oldExaminers.arab,
      };

      const effectiveStatuses = {
        quran: (updated.status_quran || "scheduled").toLowerCase(),
        santri: (updated.status_santri || "scheduled").toLowerCase(),
        ortu: (updated.status_ortu || "scheduled").toLowerCase(),
        arab: (updated.status_arab || "scheduled").toLowerCase(),
      };

      const roleConfigs: Array<{ key: "quran" | "santri" | "ortu" | "arab"; label: string }> = [
        { key: "quran", label: "Tes Al-Qur'an" },
        { key: "santri", label: "Wawancara Calon Santri" },
        { key: "ortu", label: "Wawancara Calon Orang Tua/Wali Santri" },
        { key: "arab", label: "Tes Lisan Bahasa Arab" },
      ];

      const tasksToNew: Array<{ roleKey: string; roleLabel: string; newId: string; oldId: string | null; isRescheduled: boolean }> = [];
      const tasksToOld: Array<{ roleKey: string; roleLabel: string; oldId: string; newId: string | null }> = [];
      const profileIdsNeeded = new Set<string>();

      for (const rc of roleConfigs) {
        const oldId = oldExaminers[rc.key];
        const newId = newExaminers[rc.key];
        const status = effectiveStatuses[rc.key];

        if (status === "completed" || status === "absent") {
          continue;
        }

        const examinerChanged = oldId !== newId;
        if (examinerChanged) {
          if (newId) {
            tasksToNew.push({
              roleKey: rc.key,
              roleLabel: rc.label,
              newId,
              oldId,
              isRescheduled: sessionChanged,
            });
            profileIdsNeeded.add(newId);
          }
          if (oldId) {
            tasksToOld.push({
              roleKey: rc.key,
              roleLabel: rc.label,
              oldId,
              newId,
            });
            profileIdsNeeded.add(oldId);
          }
        } else if (sessionChanged && newId) {
          tasksToNew.push({
            roleKey: rc.key,
            roleLabel: rc.label,
            newId,
            oldId: null,
            isRescheduled: true,
          });
          profileIdsNeeded.add(newId);
        }
      }

      if (profileIdsNeeded.size > 0 && currentJadwal.pendaftar) {
        const profiles = await prisma.profile.findMany({
          where: { id: { in: Array.from(profileIdsNeeded) } },
          select: {
            id: true,
            full_name: true,
            phone: true,
            jenis_kelamin: true,
            google_meet_link: true,
          },
        });
        const profileMap = new Map(profiles.map((p) => [p.id, p]));

        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
        const proto = request.headers.get("x-forwarded-proto") || "https";
        const isLocalHost =
          !host ||
          host.startsWith("localhost") ||
          host.startsWith("127.0.0.1") ||
          host.startsWith("0.0.0.0");
        const envAppUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXT_PUBLIC_WEBSITE_URL ||
          BRANDING.websiteUrl ||
          "https://ppdb-demo.vercel.app";
        const rawBaseUrl = !isLocalHost ? `${proto}://${host}` : envAppUrl;
        const appBaseUrl = rawBaseUrl.startsWith("http")
          ? rawBaseUrl.replace(/\/$/, "")
          : (BRANDING.websiteUrl || "https://ppdb-demo.vercel.app");

        const newStart = targetStartTime
          ? new Date(targetStartTime)
          : updated.tanggal_ujian
            ? new Date(updated.tanggal_ujian)
            : new Date();
        const newEnd = targetEndTime ? new Date(targetEndTime) : null;
        const newHariTanggal = formatHariTanggalWIB(newStart);
        const newWaktu = formatWaktuRangeWIB(newStart, newEnd);

        const prevStart = oldStartTime || newStart;
        const prevEnd = oldEndTime;
        const prevHariTanggal = formatHariTanggalWIB(prevStart);
        const prevWaktu = formatWaktuRangeWIB(prevStart, prevEnd);

        const effectiveLocLabel = effectiveLocationStr || (isOnline ? "Online" : "Pesantren");

        // 1. Send notifications to new / reassigned / rescheduled examiners
        for (const t of tasksToNew) {
          const newProfile = profileMap.get(t.newId);
          const oldProfile = t.oldId ? profileMap.get(t.oldId) : null;
          if (!newProfile) continue;

          if (!newProfile.phone || newProfile.phone.trim() === "" || newProfile.phone.trim() === "-") {
            console.warn(`⚠️ [Monitoring WA] Nomor WA kosong untuk penguji baru: ${newProfile.full_name} (${t.roleLabel})`);
            notifSummary.skipped.push({
              name: newProfile.full_name,
              role: t.roleLabel,
              reason: "Nomor WhatsApp tidak tersedia",
            });
            continue;
          }

          try {
            const nomor = (currentJadwal.pendaftar.nomor_pendaftaran || "").trim();
            const inputLink = `${appBaseUrl}/x/${newProfile.id}${nomor ? `?p=${encodeURIComponent(nomor)}` : ""}`;
            const meetLink = isOnline
              ? (newProfile.google_meet_link && newProfile.google_meet_link !== "-"
                  ? newProfile.google_meet_link
                  : effectiveLocLabel.startsWith("http")
                    ? effectiveLocLabel
                    : null)
              : null;

            const msg = buildMessagePenugasanPenguji({
              namaPenguji: newProfile.full_name,
              gender: newProfile.jenis_kelamin,
              jenisUjian: t.roleLabel,
              namaSantri: currentJadwal.pendaftar.nama_lengkap,
              jenjang: currentJadwal.pendaftar.jenjang,
              hariTanggal: newHariTanggal,
              waktu: newWaktu,
              googleMeetLink: meetLink,
              lokasi: effectiveLocLabel,
              linkInputNilai: inputLink,
              namaPengujiLama: oldProfile?.full_name || null,
              genderPengujiLama: oldProfile?.jenis_kelamin || null,
              isRescheduled: t.isRescheduled,
            });

            const waRes = await enqueueWhatsapp({
              pendaftarId: currentJadwal.pendaftar_id,
              phone: newProfile.phone,
              jenisNotif: `penugasan_penguji_${t.roleKey}`,
              messageContent: msg,
              force: true,
              sendNow: true,
            });

            if (waRes.queued) {
              notifSummary.sent.push({
                name: newProfile.full_name,
                role: t.roleLabel,
                kind: "new_examiner",
              });
            } else {
              notifSummary.failed.push({
                name: newProfile.full_name,
                role: t.roleLabel,
                reason: waRes.reason || "Gagal mengirim WA",
              });
            }
          } catch (err: any) {
            console.error(`❌ [Monitoring WA] Error notifying new examiner ${newProfile.full_name}:`, err);
            notifSummary.failed.push({
              name: newProfile.full_name,
              role: t.roleLabel,
              reason: err?.message || "Gagal mengirim WA",
            });
          }
        }

        // 2. Send handover / cancellation notices to previous examiners
        for (const t of tasksToOld) {
          const oldProfile = profileMap.get(t.oldId);
          const newProfile = t.newId ? profileMap.get(t.newId) : null;
          if (!oldProfile) continue;

          if (!oldProfile.phone || oldProfile.phone.trim() === "" || oldProfile.phone.trim() === "-") {
            console.warn(`⚠️ [Monitoring WA] Nomor WA kosong untuk penguji lama: ${oldProfile.full_name} (${t.roleLabel})`);
            notifSummary.skipped.push({
              name: oldProfile.full_name,
              role: t.roleLabel,
              reason: "Nomor WhatsApp tidak tersedia",
            });
            continue;
          }

          try {
            const msg = buildMessagePengalihanJadwalPengujiLama({
              namaPengujiLama: oldProfile.full_name,
              genderPengujiLama: oldProfile.jenis_kelamin,
              jenisUjian: t.roleLabel,
              namaSantri: currentJadwal.pendaftar.nama_lengkap,
              jenjang: currentJadwal.pendaftar.jenjang,
              hariTanggal: prevHariTanggal,
              waktu: prevWaktu,
              namaPengujiBaru: newProfile?.full_name || null,
              genderPengujiBaru: newProfile?.jenis_kelamin || null,
            });

            const waRes = await enqueueWhatsapp({
              pendaftarId: currentJadwal.pendaftar_id,
              phone: oldProfile.phone,
              jenisNotif: `pengalihan_jadwal_penguji_${t.roleKey}`,
              messageContent: msg,
              force: true,
              sendNow: true,
            });

            if (waRes.queued) {
              notifSummary.sent.push({
                name: oldProfile.full_name,
                role: t.roleLabel,
                kind: "previous_examiner",
              });
            } else {
              notifSummary.failed.push({
                name: oldProfile.full_name,
                role: t.roleLabel,
                reason: waRes.reason || "Gagal mengirim WA",
              });
            }
          } catch (err: any) {
            console.error(`❌ [Monitoring WA] Error notifying previous examiner ${oldProfile.full_name}:`, err);
            notifSummary.failed.push({
              name: oldProfile.full_name,
              role: t.roleLabel,
              reason: err?.message || "Gagal mengirim WA",
            });
          }
        }
      }
    } catch (waOuterErr: any) {
      console.error("❌ [Monitoring WA] Unexpected notification error:", waOuterErr);
    }

    return NextResponse.json({
      success: true,
      message: "Penguji berhasil diperbarui",
      data: updated,
      notifications: notifSummary,
    });
  } catch (error: any) {
    console.error("PATCH Monitoring API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
