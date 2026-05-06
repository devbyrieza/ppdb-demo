import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get cookie dari request (server-side bisa read httpOnly cookies!)
    const sessionCookie = request.cookies.get("app_session");

    if (!sessionCookie) {
      console.log("❌ [API /session] No app_session cookie found");
      return NextResponse.json({ session: null }, { status: 401 });
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      console.log(`✅ [API /session] Session found - Role: ${session.role}`);
      // Untuk pendaftar: id = pendaftar_id (supaya layout & API bisa pakai pendaftar_id)
      const pendaftar_id =
        session.role === "pendaftar" ? session.id : undefined;

      let availableRoles: string[] = [];
      if (session.role !== "pendaftar" && session.id) {
        const profile = await prisma.profile.findUnique({
          where: { id: session.id },
          select: { role: true, secondary_roles: true },
        });
        if (profile) {
          availableRoles = [...new Set([profile.role, ...(profile.secondary_roles || [])])];
        }
      }

      return NextResponse.json({ session, pendaftar_id, availableRoles });
    } catch (e) {
      console.log("❌ [API /session] Failed to parse session cookie");
      return NextResponse.json({ session: null }, { status: 401 });
    }
  } catch (error) {
    console.error("❌ [API /session] Error:", error);
    return NextResponse.json({ session: null }, { status: 500 });
  }
}
