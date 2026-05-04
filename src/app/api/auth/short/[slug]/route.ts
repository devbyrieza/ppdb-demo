import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMagicToken, PERMANENT_SLUGS } from "@/lib/utils/magic-link";

/**
 * Permanent Shortcut Auth Redirector
 * Accessible via /api/auth/short/[slug]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const nameQuery = PERMANENT_SLUGS[slug.toLowerCase()];

    if (!nameQuery) {
      return NextResponse.json(
        { error: "Shortcut tidak ditemukan" },
        { status: 404 },
      );
    }

    // Find user by name query
    const user = await prisma.profile.findFirst({
      where: {
        full_name: { contains: nameQuery, mode: "insensitive" },
      },
      select: { id: true, role: true, full_name: true, secondary_roles: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan di sistem" },
        { status: 404 },
      );
    }

    // Determine active role for input nilai (prioritize examiner/interviewer roles)
    const activeRole =
      user.role.includes("admin") && user.secondary_roles.length > 0
        ? user.secondary_roles.find(
            (r) => r.includes("penguji") || r.includes("pewawancara"),
          ) || user.role
        : user.role;

    const { searchParams } = new URL(request.url);
    const pendaftarNomor = searchParams.get("p");
    const redirectPath = pendaftarNomor
      ? `/dashboard/penguji/input-nilai?search=${encodeURIComponent(pendaftarNomor)}`
      : undefined;

    // Generate a fresh magic token (valid for 48 hours for short links)
    const token = generateMagicToken(
      user.id,
      activeRole,
      user.full_name,
      48,
      redirectPath,
    );

    // Redirect to the actual auth magic handler
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://demo-ppdb.vercel.app";
    const targetUrl = `${baseUrl}/api/auth/magic?token=${token}`;

    return NextResponse.redirect(new URL(targetUrl, baseUrl));
  } catch (error: any) {
    console.error("Short Auth Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses shortcut: " + error.message },
      { status: 500 },
    );
  }
}
