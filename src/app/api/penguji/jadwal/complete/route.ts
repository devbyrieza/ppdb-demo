import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { markExamComponentAsComplete } from "@/lib/exam-status";

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

  const userId = session.user_id || session.id;

  try {
    const body = await request.json();
    const { jadwal_id } = body;

    if (!jadwal_id) {
      return NextResponse.json(
        { error: "Jadwal ID is required" },
        { status: 400 },
      );
    }

    // Use the shared utility
    const result = await markExamComponentAsComplete({
      jadwalId: jadwal_id,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menandai ${result.updatedField} selesai.`,
      isAllDone: result.isAllDone,
    });
  } catch (error: any) {
    console.error("POST /api/penguji/jadwal/complete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
