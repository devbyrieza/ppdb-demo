import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionCookie =
    cookieStore.get("al_session") || cookieStore.get("app_session");
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
    // Fetch profile to verify if admin
    const userProfile = userId
      ? await prisma.profile.findUnique({
          where: { id: userId },
          select: { role: true, secondary_roles: true },
        })
      : null;

    const allRoles = [
      session.role,
      ...(Array.isArray(session.secondary_roles) ? session.secondary_roles : []),
      ...(userProfile?.role ? [userProfile.role] : []),
      ...(Array.isArray(userProfile?.secondary_roles) ? userProfile.secondary_roles : []),
    ]
      .filter(Boolean)
      .map((r: string) => (r || "").toLowerCase().trim());

    const isSuper = allRoles.some((r) =>
      ["admin_super", "admin", "head_of_it"].includes(r),
    );

    if (!isSuper) {
      return NextResponse.json(
        { error: "Forbidden: Admin Super / Admin only" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { pendaftar_id, type, examiner_id } = body;

    if (!pendaftar_id || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Find NilaiUjian record or create it
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
      detailAkademik =
        typeof nilai.detail_akademik === "string"
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

    // 2. SINKRONISASI KE JADWAL UJIAN
    try {
      let jadwal = await prisma.jadwalUjian.findFirst({
        where: { pendaftar_id },
        orderBy: { created_at: "desc" },
      });

      const jadwalUpdate: any = {};
      if (type === "wawancara_ortu") jadwalUpdate.penguji_ortu_id = examiner_id || null;
      else if (type === "wawancara_santri") jadwalUpdate.penguji_santri_id = examiner_id || null;
      else if (type === "quran") jadwalUpdate.penguji_quran_id = examiner_id || null;
      else if (type === "hafalan") jadwalUpdate.penguji_hafalan_id = examiner_id || null;
      else if (type === "arab" || type === "lisan_arab") jadwalUpdate.penguji_arab_id = examiner_id || null;

      if (jadwal) {
        await prisma.jadwalUjian.update({
          where: { id: jadwal.id },
          data: jadwalUpdate,
        });
      } else if (examiner_id) {
        await prisma.jadwalUjian.create({
          data: {
            pendaftar_id,
            tanggal_ujian: new Date(),
            ...jadwalUpdate,
          },
        });
      }
    } catch (schedErr) {
      console.warn("[Assign Examiner] Non-fatal jadwal sync warning:", schedErr);
    }

    return NextResponse.json({
      success: true,
      detail_akademik: updated.detail_akademik,
    });
  } catch (error: any) {
    console.error("POST assign examiner error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
