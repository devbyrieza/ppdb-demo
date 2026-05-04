import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (secret !== "ppdb-alimam-fix-tz-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const sessions = await prisma.examSession.findMany({
      take: 10,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        start_time: true,
        end_time: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      serverTime: new Date().toISOString(),
      sessions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
