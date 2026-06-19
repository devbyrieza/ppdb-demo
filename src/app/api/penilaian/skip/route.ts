import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recalculateNilaiUjian } from "@/lib/scoring";

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
    // 1. Auth Check (Admin Super only)
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin_super") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Admin Super yang dapat menskip/meluluskan seleksi secara paksa" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { pendaftar_id, skipped_stages } = body;

    if (!pendaftar_id || !Array.isArray(skipped_stages)) {
      return NextResponse.json({ error: "Missing fields or invalid format" }, { status: 400 });
    }

    // 2. Ambil NilaiUjian atau buat baru jika belum ada
    let nilai = await prisma.nilaiUjian.findFirst({ where: { pendaftar_id } });
    if (!nilai) {
      nilai = await prisma.nilaiUjian.create({ data: { pendaftar_id } });
    }

    // Parse detail_akademik yang sudah ada
    let detailAkademik: any = nilai.detail_akademik || {};
    if (typeof detailAkademik === "string") {
      try {
        detailAkademik = JSON.parse(detailAkademik);
      } catch (e) {
        detailAkademik = {};
      }
    }

    // Set array skipped_stages ke dalam detail_akademik
    detailAkademik.skipped_stages = skipped_stages;

    // 3. Update database
    await prisma.nilaiUjian.update({
      where: { id: nilai.id },
      data: {
        detail_akademik: detailAkademik,
        updated_at: new Date()
      }
    });

    // 4. Hitung ulang total nilai
    const updatedRecord = await recalculateNilaiUjian(pendaftar_id);

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error: any) {
    console.error("Skip stage API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
