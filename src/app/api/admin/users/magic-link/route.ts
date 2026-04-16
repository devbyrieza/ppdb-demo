import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { generateMagicToken, generateTinyUrl } from "@/lib/utils/magic-link";

/**
 * Administrative endpoint to generate magic links for users (examiners/staff).
 * Synchronized with Al-Imam stateless utility logic.
 */

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session || !["admin", "admin_super", "head_of_it"].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, expiresHours } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await prisma.profile.findUnique({
            where: { id: userId },
            select: { id: true, email: true, full_name: true, role: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Generate stateless token (Valid for X hours)
        const token = generateMagicToken(user.id, user.role, user.full_name, expiresHours || 24);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const rawUrl = `${baseUrl}/api/auth/magic?token=${token}`;

        // Generate automatic tinyurl for the magic link
        const shortUrl = await generateTinyUrl(rawUrl);

        console.log(`[magic-link] Generated stateless link for ${user.full_name} (${user.role}).`);

        return NextResponse.json({
            success: true,
            url: shortUrl,
            rawUrl: rawUrl,
        });

    } catch (error: any) {
        console.error("[magic-link] Error generating token:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
