import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    const { slot_ids, start_time, end_time, location, notes, changeTime, changeLocation, changeNotes } = body;

    if (!slot_ids || !Array.isArray(slot_ids) || slot_ids.length === 0) {
      return NextResponse.json({ error: "Pilih minimal 1 sesi untuk diubah" }, { status: 400 });
    }

    const isAdmin = ["admin_super", "admin", "head_of_it"].includes(session.role);
    const userId = session.user_id || session.id;

    // Fetch targets to verify ownership
    const targets = await prisma.examSession.findMany({
      where: { id: { in: slot_ids } },
    });

    if (!isAdmin) {
      const unauthorized = targets.some(t => t.created_by !== userId);
      if (unauthorized) {
        return NextResponse.json(
          { error: "Anda tidak memiliki akses untuk mengedit beberapa sesi yang dipilih" },
          { status: 403 }
        );
      }
    }

    let updatedCount = 0;

    const parseWIB = (dt: string) => {
      if (!dt) return new Date();
      if (dt.includes("Z") || dt.match(/[+-]\\d{2}(:?\\d{2})?$/)) return new Date(dt);
      return new Date(`${dt}+07:00`);
    };

    // Update sequentially to handle dates properly
    for (const target of targets) {
      const updateData: any = {};
      
      if (changeTime && start_time && end_time) {
        // We only replace the time portion of the existing date
        const targetDate = new Date(target.start_time);
        const yyyyMmDd = targetDate.toISOString().split("T")[0];
        
        const newStartDt = parseWIB(`${yyyyMmDd}T${start_time}:00`);
        const newEndDt = parseWIB(`${yyyyMmDd}T${end_time}:00`);
        
        if (newEndDt > newStartDt) {
          updateData.start_time = newStartDt;
          updateData.end_time = newEndDt;
        }
      }

      if (changeLocation && location !== undefined) {
        updateData.location = location;
      }

      if (changeNotes && notes !== undefined) {
        updateData.notes = notes;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.examSession.update({
          where: { id: target.id },
          data: updateData
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil memperbarui ${updatedCount} sesi terpilih.` 
    });

  } catch (error: any) {
    console.error("PUT exam-sessions bulk-edit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
