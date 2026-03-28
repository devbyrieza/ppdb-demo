import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateMagicToken } from "@/lib/utils/magic-link";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("app_session");

        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);

        // Only super admin or head of IT can generate magic links
        if (!["admin_super", "head_of_it", "tim_it", "admin"].includes(session.role)) {
            return NextResponse.json({ error: "Forbidden: Akses ditolak" }, { status: 403 });
        }

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID wajib diisi" }, { status: 400 });
        }

        const user = await prisma.profile.findUnique({
            where: { id: userId },
            select: { id: true, role: true, full_name: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
        }

        // Generate token (valid for 24 hours)
        const token = generateMagicToken(user.id, user.role, user.full_name, 24);

        // Create full URL wrapper
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pesantren-alimam.com";
        const magicLinkUrl = `${baseUrl}/api/auth/magic?token=${token}`;

        return NextResponse.json({ success: true, link: magicLinkUrl });

    } catch (error: any) {
        console.error("Generate Magic Link Error:", error);
        return NextResponse.json(
            { error: "Gagal membuat magic link: " + error.message },
            { status: 500 }
        );
    }
}
