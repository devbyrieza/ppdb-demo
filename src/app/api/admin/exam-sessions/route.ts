import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      !["admin", "admin_super", "admin_berkas", "penguji"].includes(
        session.role,
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.examSession.findMany({
      orderBy: { start_time: "asc" },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !["admin", "admin_super"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, start_time, end_time, quota, location, notes } =
      await req.json();

    const newSession = await prisma.examSession.create({
      data: {
        title,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        quota: parseInt(quota),
        location,
        notes,
        created_by: session.id,
      },
    });

    return NextResponse.json({ success: true, data: newSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
