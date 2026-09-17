import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || !["penguji", "pewawancara_calsan", "pewawancara_cawalsan", "penguji_hafalan", "penguji_bahasa_arab"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { jadwal_id, proposed_date, proposed_start, proposed_end, reason } = data;

    if (!jadwal_id || !proposed_date || !proposed_start || !proposed_end || !reason) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const jadwal = await prisma.jadwalUjian.findUnique({
      where: { id: jadwal_id }
    });

    if (!jadwal) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    const pengujiInfo = await prisma.profile.findUnique({
      where: { id: session.id },
      select: { full_name: true }
    });

    const reschedulePayload = {
      type: "RESCHEDULE_REQUEST",
      status: "pending",
      proposed_date,
      proposed_start,
      proposed_end,
      reason,
      penguji_id: session.id,
      penguji_name: pengujiInfo?.full_name || "Penguji",
      requested_at: new Date().toISOString()
    };

    // Construct new catatan, preserving existing non-JSON catatan if any
    let existingCatatan = jadwal.catatan || "";
    let finalCatatan = "";

    // Safely check if existing catatan is already JSON
    try {
      if (existingCatatan.includes('"RESCHEDULE_REQUEST"')) {
        // Just overwrite it if it's already a reschedule JSON
        finalCatatan = JSON.stringify(reschedulePayload);
      } else {
        // If it's a regular string, we probably shouldn't lose it.
        // Actually, let's just make it purely JSON for simplicity,
        // or embed the original note inside it.
        if (existingCatatan.trim().length > 0 && !existingCatatan.trim().startsWith("{")) {
          reschedulePayload["original_catatan"] = existingCatatan;
        }
        finalCatatan = JSON.stringify(reschedulePayload);
      }
    } catch (e) {
      finalCatatan = JSON.stringify(reschedulePayload);
    }

    await prisma.jadwalUjian.update({
      where: { id: jadwal_id },
      data: { catatan: finalCatatan }
    });

    return NextResponse.json({ success: true, message: "Pengajuan berhasil dikirim ke Admin." });
  } catch (error: any) {
    console.error("POST penguji/jadwal/reschedule error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
