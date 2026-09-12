import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !["admin", "admin_super"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      pendaftar_id,
      exam_session_id,
      tahun_ajaran_id,
      materi_tes,
      penguji_ortu_id,
      penguji_santri_id,
      penguji_quran_id,
      penguji_arab_id,
      penguji_hafalan_id,
      metode_ujian,
    } = await req.json();

    // Get session details
    const examSession = await prisma.examSession.findUnique({
      where: { id: exam_session_id },
    });

    if (!examSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (examSession.booked_count >= examSession.quota) {
      return NextResponse.json({ error: "Session is full" }, { status: 400 });
    }

    let finalTahunAjaranId = tahun_ajaran_id;
    if (!finalTahunAjaranId) {
      const p = await prisma.pendaftar.findUnique({
        where: { id: pendaftar_id },
        select: { tahun_ajaran_id: true },
      });
      finalTahunAjaranId = p?.tahun_ajaran_id;
    }
    if (!finalTahunAjaranId) {
      const activeTa = await prisma.tahunAjaran.findFirst({
        where: { is_active: true },
      });
      finalTahunAjaranId = activeTa?.id;
    }

    // Determine whether this session is online or offline
    const isOffline =
      metode_ujian === "offline" ||
      (!metode_ujian &&
        !(examSession.location || "").toLowerCase().includes("meet") &&
        !(examSession.location || "").toLowerCase().includes("http") &&
        !(examSession.location || "").toLowerCase().includes("online"));

    const metodeFinal = isOffline ? "offline" : "online";

    // Fetch Penguji Google Meet links ONLY if online
    let gmeetOrtu: string | null = null;
    let gmeetSantri: string | null = null;
    let gmeetQuran: string | null = null;
    let gmeetArab: string | null = null;
    let gmeetHafalan: string | null = null;

    if (!isOffline) {
      if (penguji_ortu_id) {
        const p = await prisma.profile.findUnique({
          where: { id: penguji_ortu_id },
          select: { google_meet_link: true },
        });
        if (p?.google_meet_link) gmeetOrtu = p.google_meet_link;
      }
      if (penguji_santri_id) {
        const p = await prisma.profile.findUnique({
          where: { id: penguji_santri_id },
          select: { google_meet_link: true },
        });
        if (p?.google_meet_link) gmeetSantri = p.google_meet_link;
      }
      if (penguji_quran_id) {
        const p = await prisma.profile.findUnique({
          where: { id: penguji_quran_id },
          select: { google_meet_link: true },
        });
        if (p?.google_meet_link) gmeetQuran = p.google_meet_link;
      }
      if (penguji_arab_id) {
        const p = await prisma.profile.findUnique({
          where: { id: penguji_arab_id },
          select: { google_meet_link: true },
        });
        if (p?.google_meet_link) gmeetArab = p.google_meet_link;
      }
      if (penguji_hafalan_id) {
        const p = await prisma.profile.findUnique({
          where: { id: penguji_hafalan_id },
          select: { google_meet_link: true },
        });
        if (p?.google_meet_link) gmeetHafalan = p.google_meet_link;
      }
    }

    const meetingLink = isOffline
      ? null
      : gmeetSantri ||
        gmeetOrtu ||
        gmeetQuran ||
        gmeetArab ||
        gmeetHafalan ||
        (examSession.location?.startsWith("http") ? examSession.location : null);

    const tempatFinal =
      examSession.location ||
      (isOffline ? "Kampus Pesantren (Ruang Penguji)" : "Online (Google Meet)");

    // Existing JadwalUjian check
    const existingJadwal = await prisma.jadwalUjian.findFirst({
      where: { pendaftar_id },
    });

    // Create or update JadwalUjian
    const result = await prisma.$transaction([
      prisma.jadwalUjian.upsert({
        where: {
          id: existingJadwal?.id || "00000000-0000-0000-0000-000000000000",
        },
        update: {
          exam_session_id,
          tanggal_ujian: examSession.start_time,
          waktu_mulai_santri: examSession.start_time,
          waktu_selesai_santri: examSession.end_time,
          metode_ujian: metodeFinal,
          google_meet_link: meetingLink,
          tempat_santri: tempatFinal,
          ...(penguji_ortu_id ? { penguji_ortu_id, zoom_link_ortu: isOffline ? null : gmeetOrtu } : {}),
          ...(penguji_santri_id ? { penguji_santri_id, zoom_link_santri: isOffline ? null : gmeetSantri } : {}),
          ...(penguji_quran_id ? { penguji_quran_id, zoom_link_quran: isOffline ? null : gmeetQuran, penguji_hafalan_id: null } : {}),
          ...(penguji_arab_id ? { penguji_arab_id, zoom_link_arab: isOffline ? null : gmeetArab } : {}),
          ...(penguji_hafalan_id ? { penguji_hafalan_id, zoom_link_hafalan: isOffline ? null : gmeetHafalan } : {}),
          waktu_mulai_ortu: examSession.start_time,
          waktu_selesai_ortu: examSession.end_time,
          tempat_ortu: tempatFinal,
          ...(materi_tes ? { catatan: `Materi: ${materi_tes}` } : {}),
          ...(materi_tes === "Tes Bacaan Al-Qur'an" ? { status_quran: "scheduled" } : {}),
          ...(materi_tes === "Wawancara Calon Santri" ? { status_santri: "scheduled" } : {}),
          ...(materi_tes === "Wawancara Calon Orangtua/Wali" ? { status_ortu: "scheduled" } : {}),
          ...(materi_tes === "Tes Hafalan Al-Qur'an" ? { status_hafalan: "scheduled" } : {}),
          ...(materi_tes === "Tes Lisan Bahasa Arab" ? { status_arab: "scheduled" } : {}),
        },
        create: {
          pendaftar_id,
          tahun_ajaran_id: finalTahunAjaranId,
          exam_session_id,
          tanggal_ujian: examSession.start_time,
          waktu_mulai_santri: examSession.start_time,
          waktu_selesai_santri: examSession.end_time,
          metode_ujian: metodeFinal,
          google_meet_link: meetingLink,
          tempat_santri: tempatFinal,
          penguji_ortu_id: penguji_ortu_id || undefined,
          penguji_santri_id: penguji_santri_id || undefined,
          penguji_quran_id: penguji_quran_id || undefined,
          penguji_arab_id: penguji_arab_id || undefined,
          penguji_hafalan_id: penguji_hafalan_id || undefined,
          zoom_link_ortu: isOffline ? null : gmeetOrtu,
          zoom_link_santri: isOffline ? null : gmeetSantri,
          zoom_link_quran: isOffline ? null : gmeetQuran,
          zoom_link_arab: isOffline ? null : gmeetArab,
          zoom_link_hafalan: isOffline ? null : gmeetHafalan,
          waktu_mulai_ortu: examSession.start_time,
          waktu_selesai_ortu: examSession.end_time,
          tempat_ortu: tempatFinal,
        },
      }),
      prisma.examSession.update({
        where: { id: exam_session_id },
        data: { booked_count: { increment: 1 } },
      }),
      // Also update pendaftar status to 'scheduled'
      prisma.pendaftar.update({
        where: { id: pendaftar_id },
        data: { status_pendaftaran: "scheduled" },
      }),
    ]);

    // Logging audit action
    logAdminAction({
      action: "ASSIGN_EXAM",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: pendaftar_id,
      details: {
        exam_session_id,
        session_title: examSession.title,
        metode: metodeFinal,
      },
    });

    // Send WhatsApp notification
    try {
      const pendaftar = await prisma.pendaftar.findUnique({
        where: { id: pendaftar_id },
        select: { nama_lengkap: true, no_hp: true },
      });

      if (pendaftar?.no_hp) {
        const { notifyTestSchedule } = await import("@/lib/wablas");
        await notifyTestSchedule({
          phone: pendaftar.no_hp,
          nama: pendaftar.nama_lengkap,
          tanggal: new Date(examSession.start_time).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          waktu: `${new Date(examSession.start_time).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${new Date(examSession.end_time).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })} WIB`,
          tempat: tempatFinal,
          meeting_link: isOffline ? undefined : meetingLink || undefined,
        });
      }
    } catch (waError) {
      console.error("WA Notification failed:", waError);
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error("Assignment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
