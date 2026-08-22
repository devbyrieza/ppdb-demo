import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { recalculateNilaiUjian } from "@/lib/scoring";

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

// POST: Recalculate score for a single pendaftar
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["admin_super", "admin", "penguji"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: pendaftarId } = await params;
    if (!pendaftarId) {
      return NextResponse.json(
        { error: "pendaftar_id is required" },
        { status: 400 },
      );
    }

    let overrideStatus: string | undefined;
    try {
      const body = await _request.json();
      if (body && body.overrideStatus) {
        overrideStatus = body.overrideStatus;
      }
    } catch (e) {
      // Body might be empty or invalid JSON, ignore
    }

    const result = await recalculateNilaiUjian(pendaftarId, overrideStatus);

    return NextResponse.json({
      success: true,
      pendaftar_id: pendaftarId,
      nilai_total: result?.nilai_total ?? null,
      status_kelulusan: result?.status_kelulusan ?? null,
    });
  } catch (error: any) {
    console.error("Single recalculate error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
