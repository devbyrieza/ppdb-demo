import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/utils/magic-link";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=Token_hilang", request.url),
      );
    }

    // 1. Verify token mathematically (stateless)
    const verification = verifyMagicToken(token);

    if (!verification.valid || !verification.data) {
      // Decode URI components for safe passage
      const errReason = encodeURIComponent(
        verification.reason || "Token_tidak_valid",
      );
      return NextResponse.redirect(
        new URL(`/login?error=${errReason}`, request.url),
      );
    }

    const { id, role, full_name, redirect } = verification.data;

    // 3. Check if user needs PIN (has phone number)
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.profile.findUnique({
      where: { id },
      select: { phone: true },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://demo-ppdb.vercel.app";

    // If user has a valid phone number, they MUST verify PIN
    if (user && user.phone && user.phone !== "-" && user.phone.length > 5) {
      const pinUrl = new URL("/auth/verify-pin", baseUrl);
      pinUrl.searchParams.set("token", token);
      return NextResponse.redirect(pinUrl);
    }

    // 4. Fallback: Build secure cookie directly if no PIN protection is active
    const targetUrl = redirect || "/dashboard/penguji/input-nilai";
    const response = NextResponse.redirect(new URL(targetUrl, baseUrl));

    response.cookies.set(
      "app_session",
      JSON.stringify({
        role: role,
        id: id,
        full_name: full_name,
      }),
      {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 Days Persistent Session
      },
    );

    return response;
  } catch (error) {
    console.error("Magic Link Error:", error);
    return NextResponse.redirect(
      new URL("/login?error=Terjadi_kesalahan_server", request.url),
    );
  }
}
