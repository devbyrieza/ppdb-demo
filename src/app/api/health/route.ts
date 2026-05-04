import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}

export const dynamic = "force-dynamic";
