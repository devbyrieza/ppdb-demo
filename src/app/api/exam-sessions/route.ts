import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  enqueueWhatsapp,
  buildMessageJadwalTersedia } from "@/lib/whatsapp-queue";

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

function getExamCategory(title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("hafalan")) return "HAFALAN";
  if (t.includes("quran") || t.includes("qur'an") || t.includes("bacaan")) return "QURAN";
  if (t.includes("arab") || t.includes("lisan")) return "LISAN_ARAB";
  if (
    t.includes("cawalsan") ||
    t.includes("ortu") ||
    t.includes("orang tua") ||
    t.includes("orangtua") ||
    t.includes("wali")
  ) {
    return "W_ORTU";
  }
  if (t.includes("calsan") || t.includes("santri")) return "W_SANTRI";
  return "OTHER";
}

// GET: List exam sessions
// JADWAL H+1 s/d H+14 (Maksimal 2 Pekan):
// 1. Pendaftar hanya dapat memilih jadwal mulai BESOK (H+1). Jadwal hari ini tidak dapat dipilih.
// 2. Pendaftar hanya dapat memilih jadwal maksimal 14 hari (2 pekan) ke depan.
function getEarliestSelectableDate(): Date {
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
  return new Date(
    Date.UTC(
      nowWIB.getUTCFullYear(),
      nowWIB.getUTCMonth(),
      nowWIB.getUTCDate() + 1,
      0, 0, 0, 0
    ) - WIB_OFFSET_MS,
  );
}

function getLatestSelectableDate(): Date {
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
  return new Date(
    Date.UTC(
      nowWIB.getUTCFullYear(),
      nowWIB.getUTCMonth(),
      nowWIB.getUTCDate() + 14,
      23, 59, 59, 999
    ) - WIB_OFFSET_MS,
  );
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Permission Check
  const { searchParams } = new URL(request.url);
  const creator_id = searchParams.get("creator_id");
  const is_active = searchParams.get("is_active");

  const allowedRoles = [
    "admin_super",
    "admin",
    "head_of_it",
    "penguji",
    "admin_berkas",
    "pewawancara_calsan",
    "pewawancara_cawalsan",
    "penguji_hafalan",
    "penguji_bahasa_arab",
  ];
  const isAdminOrExaminer = allowedRoles.includes(session.role);
  const isPendaftar = session.role === "pendaftar";

  if (!isAdminOrExaminer && !isPendaftar) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const activeTa = await prisma.tahunAjaran.findFirst({
      where: { is_active: true },
      select: { tanggal_buka_pendaftaran: true }
    });

    const whereClause: any = {};
    
    // Filter old academic year schedules out
    if (activeTa?.tanggal_buka_pendaftaran) {
      // 30 days buffer before PPDB open date
      const limitDate = new Date(activeTa.tanggal_buka_pendaftaran);
      limitDate.setDate(limitDate.getDate() - 30);
      whereClause.start_time = { gte: limitDate };
    }

    // Pendaftar Restriction: Must be active + future
    if (isPendaftar) {
      whereClause.is_active = true;
      whereClause.start_time = {
        gte: getEarliestSelectableDate(),
        lte: getLatestSelectableDate(),
      };

      // Pendaftar cannot see other filters
      if (creator_id) {
        // ignore creator_id or return error? better ignore to prevent probing
      }
    } else {
      // Admin/Examiner Logic
      if (creator_id === "me") {
        whereClause.created_by = session.user_id || session.id;
      } else if (creator_id) {
        whereClause.created_by = creator_id;
      }

      if (is_active === "true") {
        whereClause.is_active = true;
        whereClause.start_time = { gte: new Date() };
      }
    }

    const sessions = await prisma.examSession.findMany({
      where: whereClause,
      include: {
        creator: isPendaftar ? { select: { jenis_kelamin: true } } : { select: { full_name: true, jenis_kelamin: true } },
        _count: { select: { bookings: true } } },
      orderBy: { start_time: "asc" } });

    if (isPendaftar) {
      const pendaftar = await prisma.pendaftar.findUnique({
         where: { id: session.id },
         select: { jenis_kelamin: true }
      });
      const jkPendaftar = pendaftar?.jenis_kelamin?.toUpperCase() || "";
      const isPendaftarPutra = jkPendaftar === "L" || jkPendaftar === "LAKI-LAKI" || jkPendaftar.includes("PUTRA");

      const availableSessions = sessions.filter((s) => {
        const creatorJk = s.creator?.jenis_kelamin?.toUpperCase() || "";
        let genderMatch = true;
        if (creatorJk) {
          const isCreatorPutra = creatorJk === "L" || creatorJk === "LAKI-LAKI" || creatorJk.includes("PUTRA");
          genderMatch = isCreatorPutra === isPendaftarPutra;
        }
        return genderMatch && (s._count?.bookings || 0) < s.quota;
      });

      const cleanSessions = availableSessions.map(s => {
         const { creator, ...rest } = s;
         return rest;
      });

      return NextResponse.json({ data: cleanSessions });
    }

    // Untuk Admin / Penguji: Enrich dengan status apakah penguji sedang sibuk di sesi lain
    if (sessions.length > 0) {
      const minStartTime = sessions[0].start_time;
      const maxEndTime = sessions[sessions.length - 1].end_time;

      const activeBookings = await prisma.jadwalUjian.findMany({
        where: {
          exam_session: {
            start_time: { gte: minStartTime, lte: maxEndTime },
          },
        },
        select: {
          penguji_quran_id: true,
          penguji_hafalan_id: true,
          penguji_santri_id: true,
          penguji_ortu_id: true,
          penguji_arab_id: true,
          exam_session: {
            select: { id: true, start_time: true, end_time: true },
          },
        },
      });

      const enrichedSessions = sessions.map((s) => {
        if (!s.created_by) return { ...s, is_busy_elsewhere: false };
        const sStart = new Date(s.start_time).getTime();
        const sEnd = new Date(s.end_time).getTime();

        const isBusyElsewhere = activeBookings.some((b) => {
          if (b.exam_session?.id === s.id) return false;
          const isThisExaminer =
            b.penguji_quran_id === s.created_by ||
            b.penguji_hafalan_id === s.created_by ||
            b.penguji_santri_id === s.created_by ||
            b.penguji_ortu_id === s.created_by ||
            b.penguji_arab_id === s.created_by;

          if (!isThisExaminer || !b.exam_session) return false;
          const bStart = new Date(b.exam_session.start_time).getTime();
          const bEnd = new Date(b.exam_session.end_time).getTime();
          return sStart < bEnd && sEnd > bStart;
        });

        return {
          ...s,
          is_busy_elsewhere: isBusyElsewhere,
        };
      });

      return NextResponse.json({ data: enrichedSessions });
    }

    return NextResponse.json({ data: sessions });
  } catch (error: any) {
    console.error("GET exam-sessions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create new exam session (Examiner/Admin)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permission: Any admin or examiner can create slots
  const allowedRoles = [
    "admin_super",
    "admin",
    "head_of_it",
    "penguji",
    "admin_berkas",
    "pewawancara_calsan",
    "pewawancara_cawalsan",
  ];
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, start_time, end_time, quota, location, notes, creator_id } = body;

    // Basic validation
    if (!start_time || !end_time || !quota) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let finalCreatorId = session.user_id || session.id;
    let creatorRole = session.role;

    // If admin_super provides a specific creator_id, impersonate them
    if (creator_id && ["admin_super", "admin"].includes(session.role)) {
      finalCreatorId = creator_id;
      // Fetch the role of the impersonated creator so we can assign the correct title
      const creatorProfile = await prisma.profile.findUnique({
        where: { id: finalCreatorId },
        select: { role: true }
      });
      if (creatorProfile) {
        creatorRole = creatorProfile.role;
      }
    }

    // Determine default title based on role if not provided
    let finalTitle = title;
    if (!finalTitle || finalTitle === "Sesi Ujian") {
      const role = creatorRole;
      if (role === "pewawancara_cawalsan") {
        finalTitle = "Seleksi Wawancara Orang Tua";
      } else if (role === "pewawancara_calsan" || role === "penguji_calsan") {
        finalTitle = "Seleksi Wawancara Calon Santri";
      } else if (role === "penguji_quran" || role === "penguji") {
        finalTitle = "Seleksi Al Qur'an";
      } else if (role === "penguji_hafalan") {
        finalTitle = "Tes Hafalan Al-Qur'an";
      } else if (role === "penguji_bahasa_arab") {
        finalTitle = "Tes Lisan Bahasa Arab";
      } else {
        finalTitle = title || "Sesi Ujian";
      }
    }

    // Helper to parse date with WIB fallback if no timezone provided
    const parseWIB = (dt: string) => {
      if (!dt) return new Date();
      // If it already has Z or + offset, use as is
      if (dt.includes("Z") || dt.match(/[+-]\d{2}(:?\d{2})?$/)) {
        return new Date(dt);
      }
      // Otherwise append WIB offset
      return new Date(`${dt}+07:00`);
    };

    // Conflict Guard: Check duplicate session for the same creator & category
    const startWIB = parseWIB(start_time);
    const endWIB = parseWIB(end_time);

    const overlapping = await prisma.examSession.findMany({
      where: {
        created_by: finalCreatorId,
        is_active: true,
        OR: [
          {
            AND: [
              { start_time: { lte: startWIB } },
              { end_time: { gt: startWIB } }
            ]
          },
          {
            AND: [
              { start_time: { lt: endWIB } },
              { end_time: { gte: endWIB } }
            ]
          },
          {
            AND: [
              { start_time: { gte: startWIB } },
              { end_time: { lte: endWIB } }
            ]
          }
        ]
      },
      include: {
        creator: { select: { full_name: true } }
      }
    });

    // Hanya tolak jika jam tumpang tindih DAN jenis/kategori ujiannya SAMA (duplikasi sesi identik)
    // Jika jenis ujian berbeda (misal Wawancara Santri vs Tes Lisan Bahasa Arab), DIPERBOLEHKAN
    // agar penguji multi-role bisa standby di jam yang sama (sesi lainnya otomatis terkunci begitu salah satu dibooking).
    const duplicateSameCategory = overlapping.find((ex) => {
      const exCat = getExamCategory(ex.title || "");
      const newCat = getExamCategory(finalTitle || "");
      return exCat === newCat || (ex.title && finalTitle && ex.title.trim().toLowerCase() === finalTitle.trim().toLowerCase());
    });

    if (duplicateSameCategory) {
      const creatorName = duplicateSameCategory.creator?.full_name || "Penguji ini";
      const startStr = new Date(duplicateSameCategory.start_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
      const endStr = new Date(duplicateSameCategory.end_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
      return NextResponse.json(
        { 
          error: `Duplikasi Sesi: ${creatorName} sudah memiliki sesi aktif untuk jenis ujian yang sama pada jam tersebut (${duplicateSameCategory.title || "Sesi Ujian"}: ${startStr} - ${endStr} WIB).` 
        },
        { status: 400 }
      );
    }

    const newSession = await prisma.examSession.create({
      data: {
        title: finalTitle,
        start_time: parseWIB(start_time),
        end_time: parseWIB(end_time),
        quota: parseInt(quota),
        location,
        notes,
        created_by: finalCreatorId, // Ensure correct ID usage
      } });

    // NOTE: Automatic notification blast removed to prevent WhatsApp bans.
    // Admins will now use the "Broadcast" button in the dashboard to send notifications manually.

    return NextResponse.json({ success: true, data: newSession });
  } catch (error: any) {
    console.error("POST exam-sessions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Cancel session
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    // Check if session exists and owned by user (or is admin)
    const targetSession = await prisma.examSession.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } } });

    if (!targetSession)
      return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Permission check
    const isAdmin = [
      "admin_super",
      "admin",
      "head_of_it",
      "penguji",
      "admin_berkas",
      "pewawancara_calsan",
      "pewawancara_cawalsan",
    ].includes(session.role);
    const isOwner =
      targetSession.created_by === (session.user_id || session.id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if bookings exist
    if (targetSession._count.bookings > 0) {
      return NextResponse.json(
        { error: "Cannot delete session with existing bookings" },
        { status: 400 },
      );
    }

    await prisma.examSession.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Edit exam session (owner or admin)
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const allowedRoles = [
    "admin_super",
    "admin",
    "head_of_it",
    "penguji",
    "admin_berkas",
    "pewawancara_calsan",
    "pewawancara_cawalsan",
  ];
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const targetSession = await prisma.examSession.findUnique({
      where: { id } });
    if (!targetSession)
      return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Only owner or admin_super/admin can edit
    const isAdmin = ["admin_super", "admin", "head_of_it"].includes(
      session.role,
    );
    const isOwner =
      targetSession.created_by === (session.user_id || session.id);
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk mengedit sesi ini" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { title, start_time, end_time, location, notes } = body;

    if (!start_time || !end_time) {
      return NextResponse.json(
        { error: "Waktu mulai dan selesai wajib diisi" },
        { status: 400 },
      );
    }

    const parseWIB = (dt: string) => {
      if (!dt) return new Date();
      if (dt.includes("Z") || dt.match(/[+-]\d{2}(:?\d{2})?$/))
        return new Date(dt);
      return new Date(`${dt}+07:00`);
    };

    const startDt = parseWIB(start_time);
    const endDt = parseWIB(end_time);

    if (endDt <= startDt) {
      return NextResponse.json(
        { error: "Jam selesai harus lebih besar dari jam mulai" },
        { status: 400 },
      );
    }

    const updated = await prisma.examSession.update({
      where: { id },
      data: {
        ...(title && { title }),
        start_time: startDt,
        end_time: endDt,
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { notes }) } });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT exam-sessions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

