import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 1. Get ALL deleted students
    const deletedStudents = await prisma.pendaftar.findMany({
      where: {
        NOT: { deleted_at: null }
      },
      select: {
        id: true,
        nama_lengkap: true,
        nomor_pendaftaran: true,
        deleted_at: true
      }
    });

    return NextResponse.json({
      message: `Found ${deletedStudents.length} deleted students`,
      data: deletedStudents
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
