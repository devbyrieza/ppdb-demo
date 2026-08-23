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

// GET: List exam sessions
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
    const whereClause: any = {};

    // Pendaftar Restriction: Must be active + future
    if (isPendaftar) {
      whereClause.is_active = true;
      whereClause.start_time = { gte: new Date() };

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

    if (creator_id && ["admin_super", "admin"].includes(session.role)) {
      finalCreatorId = creator_id;
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
export async function PATCH(request: Request) {
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
    const isAdmin = ["admin_super", "admin"].includes(session.role);
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
    console.error("PATCH exam-sessions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
