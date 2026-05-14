import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DASHBOARD_ROUTES, ROLE_LABELS, UserRole } from "@/lib/access-control";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, chosen_role } = body;

    if (!profile_id || !chosen_role) {
      return NextResponse.json(
        { error: "profile_id dan chosen_role wajib diisi" },
        { status: 400 },
      );
    }

    // Fetch profile
    const profile = (await prisma.profile.findUnique({
      where: { id: profile_id },
    })) as any;

    if (!profile) {
      return NextResponse.json(
        { error: "Profil tidak ditemukan" },
        { status: 404 },
      );
    }

    // Validate chosen_role is one of the allowed roles for this profile
    const allowedRoles = [profile.role, ...(profile.secondary_roles || [])];
    if (!allowedRoles.includes(chosen_role)) {
      return NextResponse.json(
        { error: "Role tidak valid untuk akun ini" },
        { status: 403 },
      );
    }

    // Determine redirect based on chosen role using centralized config
    const role = chosen_role as UserRole;
    const redirectTo = DASHBOARD_ROUTES[role] || "/dashboard";

    // Set session cookie with chosen role
    const response = NextResponse.json({
      success: true,
      role: chosen_role,
      redirectTo,
    });

    response.cookies.set(
      "app_session",
      JSON.stringify({
        role: chosen_role,
        id: profile.id,
        full_name: profile.full_name,
      }),
      {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 90, // 90 Days for Staff
      },
    );

    return response;
  } catch (error: any) {
    console.error("Select role error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
