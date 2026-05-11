import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  calculateAkademikScore,
  calculateKepribadianScore,
  calculateKesiapanScore,
} from "@/lib/grading";
import { recalculateNilaiUjian } from "@/lib/scoring";

export async function POST(req: Request) {
  try {
    // 1. Auth Check (Server Session via cookie)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { error: "Session tidak valid" },
        { status: 401 },
      );
    }

    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const pendaftar_id =
      session.role === "pendaftar" ? session.id : body.pendaftar_id;
    const { type, answers, jenjang } = body;

    if (!pendaftar_id || !type || !answers) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // --- ACCESS GUARD: Check pendaftar status ---
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftar_id },
      select: { status_pendaftaran: true },
    });

    const ALLOWED_STATUSES = [
      "docs_verified",
      "scheduled",
      "tested",
      "announced",
      "accepted",
      "enrolled",
    ];
    if (
      !pendaftar ||
      !ALLOWED_STATUSES.includes(pendaftar.status_pendaftaran || "")
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Tahap seleksi belum diizinkan karena berkas belum diverifikasi.",
        },
        { status: 403 },
      );
    }

    // 2. Calculate Score
    let score = 0;
    let dbFieldScore = "";
    let dbFieldDetail = "";

    if (type === "akademik") {
      if (!jenjang)
        return NextResponse.json(
          { error: "Jenjang required for Akademik" },
          { status: 400 },
        );
      score = calculateAkademikScore(answers, jenjang); // answers: {1: 'A', 2: 'B', ...}
      dbFieldScore = "score_akademik";
      dbFieldDetail = "detail_akademik";
    } else if (type === "kepribadian") {
      score = calculateKepribadianScore(answers);
      dbFieldScore = "score_kepribadian";
      dbFieldDetail = "detail_kepribadian";
    } else if (type === "kesiapan") {
      score = calculateKesiapanScore(answers); // answers: {1: 5, 2: 4, ...}
      dbFieldScore = "score_kesiapan";
      dbFieldDetail = "detail_kesiapan";
    } else {
      return NextResponse.json({ error: "Invalid test type" }, { status: 400 });
    }

    // 3. Save to DB
    // Check if NilaiUjian exists
    let nilai = await prisma.nilaiUjian.findFirst({
      where: { pendaftar_id },
    });

    if (!nilai) {
      nilai = await prisma.nilaiUjian.create({
        data: { pendaftar_id },
      });
    }

    // Update specific fields
    const updated = await prisma.nilaiUjian.update({
      where: { id: nilai.id },
      data: {
        [dbFieldScore]: score,
        [dbFieldDetail]: answers,
        updated_at: new Date(),
      },
    });

    // 4. Trigger recalculation so total_score and status_kelulusan update
    await recalculateNilaiUjian(pendaftar_id);

    // 5. Update pendaftar status to 'selection' if currently 'docs_verified'
    if (pendaftar.status_pendaftaran === "docs_verified") {
      await prisma.pendaftar.update({
        where: { id: pendaftar_id },
        data: { status_pendaftaran: "selection" },
      });
    }

    return NextResponse.json({ success: true, score, type });
  } catch (error) {
    console.error("Submit API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
