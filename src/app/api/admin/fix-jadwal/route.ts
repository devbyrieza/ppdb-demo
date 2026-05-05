import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jadwals = await prisma.jadwalUjian.findMany({
      where: {
        exam_session_id: { not: null },
      },
      include: {
        exam_session: true,
      },
    });

    let updatedCount = 0;
    const updates = [];

    for (const jadwal of jadwals) {
      if (!jadwal.exam_session) continue;

      const session = jadwal.exam_session;
      let updateData: any = {};

      if (session.title === "Tes Al-Quran" && !jadwal.penguji_quran_id) {
        updateData.penguji_quran_id = session.created_by;
      } else if (
        (session.title === "Seleksi Wawancara Calon Santri" ||
          session.title === "Wawancara Calon Santri") &&
        !jadwal.penguji_santri_id
      ) {
        updateData.penguji_santri_id = session.created_by;
      } else if (
        (session.title === "Seleksi Wawancara Orang Tua" ||
          session.title === "Wawancara Orangtua/Wali") &&
        !jadwal.penguji_ortu_id
      ) {
        updateData.penguji_ortu_id = session.created_by;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.jadwalUjian.update({
          where: { id: jadwal.id },
          data: updateData,
        });
        updatedCount++;
        updates.push({ id: jadwal.id, ...updateData });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} records`,
      updates,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
