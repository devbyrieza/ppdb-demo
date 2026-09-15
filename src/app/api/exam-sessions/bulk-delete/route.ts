import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(request: Request) {
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
    const { slot_ids } = body;

    if (!slot_ids || !Array.isArray(slot_ids) || slot_ids.length === 0) {
      return NextResponse.json({ error: "Pilih minimal 1 sesi untuk dihapus" }, { status: 400 });
    }

    const isAdmin = ["admin_super", "admin", "head_of_it"].includes(session.role);
    const userId = session.user_id || session.id;

    // Fetch targets to verify ownership and bookings
    const targets = await prisma.examSession.findMany({
      where: { id: { in: slot_ids } },
      include: {
        _count: { select: { bookings: true } }
      }
    });

    // Filter out sessions that have active bookings
    const deletableIds = targets
      .filter(t => t._count.bookings === 0)
      .filter(t => isAdmin || t.created_by === userId)
      .map(t => t.id);

    if (deletableIds.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada sesi yang bisa dihapus. Sesi mungkin sudah dibooking atau Anda tidak memiliki akses." },
        { status: 403 }
      );
    }

    const result = await prisma.examSession.deleteMany({
      where: { id: { in: deletableIds } }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil menghapus ${result.count} sesi. (${targets.length - deletableIds.length} sesi dilewati karena sudah dibooking).`
    });

  } catch (error: any) {
    console.error("DELETE exam-sessions bulk error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
