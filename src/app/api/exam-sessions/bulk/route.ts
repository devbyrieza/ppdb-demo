import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedRoles = [
    "admin_super",
    "admin",
    "penguji",
    "pewawancara_calsan",
    "pewawancara_cawalsan",
      "penguji_hafalan",
      "penguji_bahasa_arab",
    ];
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      startDate, // ISO String (e.g. 2026-04-01)
      endDate, // ISO String (e.g. 2026-04-30)
      daysOfWeek, // Legacy: Array of numbers [0..6]
      timeSlots, // Legacy: Array of { start: "HH:mm", end: "HH:mm" }
      daySlots, // New: Record<number, { start: string, end: string }[]>
      title,
      location,
      notes,
    } = body;

    if (!startDate || !endDate || (!daySlots && (!daysOfWeek || !timeSlots))) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const requestCreatorId = body.creator_id;
    let creatorId = session.user_id || session.id;
    let creatorRole = session.role;

    // If admin_super provides a specific creator_id, impersonate them
    if (requestCreatorId && ["admin_super", "admin"].includes(session.role)) {
      creatorId = requestCreatorId;
      // Fetch the role of the impersonated creator so we can assign the correct title
      const creatorProfile = await prisma.profile.findUnique({
        where: { id: creatorId },
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
      } else if (role === "pewawancara_calsan") {
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

    const sessionsToCreate = [];
    let currentDate = new Date(start);

    // Standardize time handling: We want to generate slots for each selected day in range
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();

      // Logic for day-specific slots
      let currentDaySlots = [];
      if (daySlots && daySlots[dayOfWeek]) {
        currentDaySlots = daySlots[dayOfWeek];
      } else if (daysOfWeek && daysOfWeek.includes(dayOfWeek) && timeSlots) {
        // Backward compatibility
        currentDaySlots = timeSlots;
      }

      if (currentDaySlots.length > 0) {
        // Formatting date part: YYYY-MM-DD
        const dateStr = currentDate.toISOString().split("T")[0];

        for (const slot of currentDaySlots) {
          // Combine dateStr + slot.start to create full ISO in WIB (+07:00)
          const startISO = `${dateStr}T${slot.start}:00+07:00`;
          const endISO = `${dateStr}T${slot.end}:00+07:00`;

          sessionsToCreate.push({
            title: finalTitle,
            start_time: new Date(startISO),
            end_time: new Date(endISO),
            quota: 1, // Default to 1 (Private/1-on-1)
            location: location || "Online",
            notes: notes || "",
            created_by: creatorId,
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (sessionsToCreate.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada jadwal yang cocok dengan kriteria" },
        { status: 400 },
      );
    }

    // Use transaction to create all
    const result = await prisma.$transaction(
      sessionsToCreate.map((data) => prisma.examSession.create({ data })),
    );

    return NextResponse.json({
      success: true,
      message: `Berhasil membuat ${result.length} sesi jadwal.`,
      count: result.length,
    });
  } catch (error: any) {
    console.error("Bulk Create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
