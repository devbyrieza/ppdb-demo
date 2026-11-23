import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { markExamComponentAsComplete } from "@/lib/exam-status";

async function getSession(request?: Request, bodyExaminer?: { id?: string }) {
  // 1. Next.js cookies()
  try {
    const cookieStore = await cookies();
    const sessionCookie =
      cookieStore.get("al_session") || cookieStore.get("app_session");
    if (sessionCookie?.value) {
      const parsed = JSON.parse(sessionCookie.value);
      if (parsed && (parsed.id || parsed.user_id)) return parsed;
    }
  } catch (e) {
    // Ignore and fallback
  }

  // 2. Raw Cookie header from Request
  if (request) {
    try {
      const rawCookies = request.headers.get("cookie") || "";
      const match = rawCookies.match(/(?:^|;\s*)(?:al_session|app_session)=([^;]+)/);
      if (match) {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded);
        if (parsed && (parsed.id || parsed.user_id)) return parsed;
      }
    } catch (e) {
      // Ignore and fallback
    }

    // 3. Custom examiner headers
    try {
      const xExaminerId = request.headers.get("x-examiner-id");
      if (xExaminerId) {
        const profile = await prisma.profile.findUnique({
          where: { id: xExaminerId },
          select: { id: true, role: true, secondary_roles: true, full_name: true }
        });
        if (profile) {
          return { id: profile.id, user_id: profile.id, role: profile.role, full_name: profile.full_name };
        }
      }
    } catch (e) {
      // Ignore and fallback
    }
  }

  // 4. Fallback from body
  if (bodyExaminer?.id) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { id: bodyExaminer.id },
        select: { id: true, role: true, secondary_roles: true, full_name: true }
      });
      if (profile) {
        return { id: profile.id, user_id: profile.id, role: profile.role, full_name: profile.full_name };
      }
    } catch (e) {
      // Ignore and fallback
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const session = await getSession(request, { id: body.examiner_id });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user_id || session.id;
    const { jadwal_id, component_type } = body;

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
      componentType: component_type,
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
