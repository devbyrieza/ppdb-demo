import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Restore anyone deleted in the last 60 minutes
    const result = await prisma.pendaftar.updateMany({
      where: {
        deleted_at: { not: null } },
      data: { deleted_at: null } });

    return NextResponse.json({
      message: `Berhasil mengembalikan ${result.count} data pendaftar. Silakan refresh dashboard Anda.`,
      count: result.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
