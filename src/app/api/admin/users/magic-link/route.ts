import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateMagicToken, generateShortLink } from "@/lib/utils/magic-link";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    // Only super admin or head of IT can generate magic links
    if (!["admin_super", "admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: Akses ditolak" },
        { status: 403 },
      );
    }

    const body = await request.json();
    console.log("Magic Link Request Body:", body);
    const { userId, user_id } = body;
    const finalUserId = userId || user_id;

    console.log(
      "Extracted userId:",
      userId,
      "user_id:",
      user_id,
      "finalUserId:",
      finalUserId,
    );

    if (!finalUserId) {
      console.log("Validation failed: User ID is missing");
      return NextResponse.json(
        { error: "User ID wajib diisi" },
        { status: 400 },
      );
    }

    const user = await prisma.profile.findUnique({
      where: { id: finalUserId },
      select: { id: true, role: true, full_name: true, phone: true, secondary_roles: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    // Enforce phone number verification for examiners/interviewers
    const isExaminerOrInterviewer = 
      ["penguji", "pewawancara_calsan", "pewawancara_cawalsan"].includes(user.role) ||
      (Array.isArray(user.secondary_roles) && user.secondary_roles.some((r: string) => 
        ["penguji", "pewawancara_calsan", "pewawancara_cawalsan"].includes(r)
      ));

    if (isExaminerOrInterviewer && (!user.phone || user.phone === "-" || user.phone.trim().length < 6)) {
      return NextResponse.json(
        { error: "Penguji/Pewawancara wajib memiliki nomor WhatsApp aktif untuk verifikasi PIN 4 digit terakhir. Silakan edit user untuk menambahkan nomor WhatsApp." },
        { status: 400 },
      );
    }

    // Generate token (valid for 24 hours)
    const token = generateMagicToken(user.id, user.role, user.full_name, 24);

    // Create full URL wrapper
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://demo-ppdb.vercel.app";
    const magicLinkUrl = `${baseUrl}/api/auth/magic?token=${token}`;

    // Generate automatic tinyurl for the magic link
    const shortLink = await generateShortLink(magicLinkUrl);

    return NextResponse.json({
      success: true,
      link: magicLinkUrl,
      shortLink,
    });
  } catch (error: any) {
    console.error("Generate Magic Link Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat magic link: " + error.message },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    // Only super admin or head of IT can see the bulk magic links
    if (!["admin_super", "admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: Akses ditolak" },
        { status: 403 },
      );
    }

    // Fetch all users that are examiners or interviewers (check role and secondary_roles)
    const examiners = await prisma.profile.findMany({
      where: {
        OR: [
          { role: { contains: "penguji", mode: "insensitive" } },
          { role: { contains: "pewawancara", mode: "insensitive" } },
          {
            secondary_roles: {
              hasSome: [
                "penguji_calsan",
                "pewawancara_calsan",
                "pewawancara_cawalsan",
                "penguji_umum",
              ],
            },
          },
        ],
      },
      select: { id: true, full_name: true, role: true, secondary_roles: true },
      orderBy: { full_name: "asc" },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://demo-ppdb.vercel.app";

    const results = await Promise.all(
      examiners.map(async (user) => {
        // Determine active role for input nilai (prioritize examiner/interviewer roles)
        const activeRole =
          user.role.includes("admin") && user.secondary_roles.length > 0
            ? user.secondary_roles.find(
                (r) => r.includes("penguji") || r.includes("pewawancara"),
              ) || user.role
            : user.role;

        const token = generateMagicToken(
          user.id,
          activeRole,
          user.full_name,
          48,
        ); // Valid for 48 hours for bulk view
        const magicLinkUrl = `${baseUrl}/api/auth/magic?token=${token}`;

        // Generate automatic tinyurl for the magic link
        const shortLink = await generateShortLink(magicLinkUrl);

        return {
          id: user.id,
          full_name: user.full_name,
          role: user.role,
          secondary_roles: user.secondary_roles,
          link: magicLinkUrl,
          shortLink,
        };
      }),
    );

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error("Bulk Magic Link Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar magic link: " + error.message },
      { status: 500 },
    );
  }
}
