import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (secret !== "ppdb-alimam-fix-tz-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 1. Shift ExamSession records
    // Prisma doesn't support direct interval subtraction in updateMany easily without raw SQL
    // We'll use raw SQL for surgical precision

    await prisma.$executeRaw`
            UPDATE exam_sessions 
            SET 
                start_time = start_time - INTERVAL '7 hours',
                end_time = end_time - INTERVAL '7 hours'
        `;

    // 2. Shift JadwalUjian records
    await prisma.$executeRaw`
            UPDATE jadwal_ujian 
            SET 
                waktu_mulai_santri = waktu_mulai_santri - INTERVAL '7 hours',
                waktu_selesai_santri = waktu_selesai_santri - INTERVAL '7 hours',
                waktu_mulai_ortu = waktu_mulai_ortu - INTERVAL '7 hours',
                waktu_selesai_ortu = waktu_selesai_ortu - INTERVAL '7 hours'
        `;

    return NextResponse.json({
      success: true,
      message: "All schedules successfully shifted by -7 hours to match WIB.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
