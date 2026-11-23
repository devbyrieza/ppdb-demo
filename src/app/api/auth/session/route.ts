import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get cookie dari request (server-side bisa read httpOnly cookies!)
    const sessionCookie = request.cookies.get("al_session");

    if (!sessionCookie) {
      console.log("❌ [API /session] No al_session cookie found");
      return NextResponse.json({ session: null }, { status: 401 });
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      console.log(`✅ [API /session] Session found - Role: ${session.role}`);
      // Untuk pendaftar: id = pendaftar_id (supaya layout & API bisa pakai pendaftar_id)
      const pendaftar_id =
        session.role === "pendaftar" ? session.id : undefined;

      let availableRoles: string[] = [];
      const updatedSession = { ...session };
      let cookieNeedsUpdate = false;

      if (session.role !== "pendaftar" && session.id) {
        const profile = await prisma.profile.findUnique({
          where: { id: session.id },
          select: { role: true, secondary_roles: true, full_name: true, email: true, username: true }
        });
        if (profile) {
          availableRoles = [...new Set([profile.role, ...(profile.secondary_roles || [])].filter(Boolean))];

          // Auto-sync live profile data from DB into session so roles are never stale
          // Auto-sync live profile data from DB into session.
          // Only revert role to profile.role if the session's active role is NOT among allowed roles.
          const currentRoleLower = (session.role || "").toLowerCase();
          const isCurrentRoleAllowed = availableRoles.some(
            (r) => r.toLowerCase() === currentRoleLower
          );

          if (!isCurrentRoleAllowed && profile.role) {
            updatedSession.role = profile.role;
            cookieNeedsUpdate = true;
          }
          if (profile.full_name && session.full_name !== profile.full_name) {
            updatedSession.full_name = profile.full_name;
            cookieNeedsUpdate = true;
          }
          if (profile.username && session.username !== profile.username) {
            updatedSession.username = profile.username;
            cookieNeedsUpdate = true;
          }
        }
      }

      const response = NextResponse.json({ session: updatedSession, pendaftar_id, availableRoles });

      if (cookieNeedsUpdate) {
            const host = request.headers.get("host") || "";
    let baseDomain = undefined;
    if (host.includes("pesantren-alandalus-putra.com")) baseDomain = ".pesantren-alandalus-putra.com";
    else if (host.includes("pesantren-alandalus-putri.com")) baseDomain = ".pesantren-alandalus-putri.com";
    else if (host.includes("alandalus-ululalbaab.com")) baseDomain = ".alandalus-ululalbaab.com";
    else if (host.includes("pesantren-ululalbaab.com")) baseDomain = ".pesantren-ululalbaab.com";
    else if (host.includes("pesantren-alimam.com")) baseDomain = ".pesantren-alimam.com";

        response.cookies.set("al_session", JSON.stringify(updatedSession), {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          domain: baseDomain,
          maxAge: 60 * 60 * 24 * 90,
          expires: new Date(Date.now() + 60 * 60 * 24 * 90 * 1000),
        });
      }

      return response;
    } catch (e) {
      console.log("❌ [API /session] Failed to parse session cookie");
      return NextResponse.json({ session: null }, { status: 401 });
    }
  } catch (error) {
    console.error("❌ [API /session] Error:", error);
    return NextResponse.json({ session: null }, { status: 500 });
  }
}
