import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/debug
 * Debug endpoint to check session, database connection, and environment
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  
  let session = null;
  let sessionError = null;
  
  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch (e: any) {
      sessionError = e.message;
    }
  }

  let dbStatus = "not_tested";
  let dbError = null;
  let pendaftar = null;

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";

    // If session exists, try to fetch pendaftar
    if (session?.id && session?.role === "pendaftar") {
      pendaftar = await prisma.pendaftar.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          nomor_pendaftaran: true,
          nama_lengkap: true,
          status_pendaftaran: true,
        },
      });
    }
  } catch (e: any) {
    dbStatus = "error";
    dbError = e.message;
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "missing",
    },
    session: {
      exists: !!sessionCookie,
      parsed: session,
      error: sessionError,
    },
    database: {
      status: dbStatus,
      error: dbError,
    },
    pendaftar,
  });
}
