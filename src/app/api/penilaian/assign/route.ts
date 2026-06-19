import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user_id || session.id;
    // Fetch profile to verify if admin_super
    const userProfile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true, secondary_roles: true },
    });

    const allRoles = userProfile
      ? [userProfile.role, ...(userProfile.secondary_roles || [])]
      : [];
    const isSuper = allRoles.includes("admin_super");

    if (!isSuper) {
      return NextResponse.json({ error: "Forbidden: Admin Super only" }, { status: 403 });
    }

    const body = await req.json();
    const { pendaftar_id, type, examiner_id } = body;

    if (!pendaftar_id || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find NilaiUjian record or create it
    let nilai = await prisma.nilaiUjian.findFirst({
      where: { pendaftar_id },
    });

    if (!nilai) {
      nilai = await prisma.nilaiUjian.create({
        data: { pendaftar_id },
      });
    }

    // Parse existing detail_akademik
    let detailAkademik: any = {};
    if (nilai.detail_akademik) {
      detailAkademik = typeof nilai.detail_akademik === "string"
        ? JSON.parse(nilai.detail_akademik)
        : nilai.detail_akademik;
    }

    if (!detailAkademik.assigned_examiners) {
      detailAkademik.assigned_examiners = {};
    }

    if (examiner_id) {
      detailAkademik.assigned_examiners[type] = examiner_id;
    } else {
      delete detailAkademik.assigned_examiners[type];
    }

    const updated = await prisma.nilaiUjian.update({
      where: { id: nilai.id },
      data: {
        detail_akademik: detailAkademik,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, detail_akademik: updated.detail_akademik });
  } catch (error: any) {
    console.error("POST assign examiner error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
