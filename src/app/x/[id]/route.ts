import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMagicToken } from "@/lib/utils/magic-link";

/**
 * Internal Short Link Redirector
 * Accessible via /x/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Find user by id
    const user = await prisma.profile.findUnique({
      where: { id },
      select: { id: true, role: true, full_name: true, secondary_roles: true },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=User_tidak_ditemukan", request.url));
    }

    // Determine active role for input nilai (prioritize examiner/interviewer roles)
    let activeRole = user.role;
    if (user.role.includes("admin") && Array.isArray(user.secondary_roles) && user.secondary_roles.length > 0) {
      const secRole = user.secondary_roles.find(
        (r: any) => typeof r === 'string' && (r.includes("penguji") || r.includes("pewawancara")),
      );
      if (secRole) {
        activeRole = secRole as string;
      }
    }

    const { searchParams } = new URL(request.url);
    const p = searchParams.get("p");
    const redirectPath = p
      ? `/dashboard/penguji/input-nilai?search=${encodeURIComponent(p)}`
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "/daftar";
    const targetUrl = `${baseUrl}/api/auth/magic?token=${token}`;

    return NextResponse.redirect(new URL(targetUrl, baseUrl));
  } catch (error: any) {
    console.error("Internal Short Link Error:", error);
    return NextResponse.redirect(new URL("/login?error=Terjadi_kesalahan", request.url));
  }
}
