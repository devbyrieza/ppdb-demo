import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMagicToken } from "@/lib/utils/magic-link";

/**
 * API for verifying the 4-digit PIN (last 4 digits of phone number)
 * POST /api/auth/verify-pin
 */
export async function POST(request: NextRequest) {
    try {
        const { token, pin } = await request.json();

        if (!token || !pin) {
            return NextResponse.json({ error: "Token dan PIN wajib diisi" }, { status: 400 });
        }

        // 1. Verify Magic Token
        const verification = verifyMagicToken(token);
        if (!verification.valid || !verification.data) {
            return NextResponse.json({ error: verification.reason || "Token tidak valid" }, { status: 401 });
        }

        const { id, role, full_name, redirect } = verification.data;

        // 2. Fetch User Profile to check Phone Number
        const user = await prisma.profile.findUnique({
            where: { id },
            select: { phone: true }
        });

        if (!user || !user.phone || user.phone === "-") {
            return NextResponse.json({ error: "Verifikasi PIN tidak tersedia untuk akun ini" }, { status: 400 });
        }

        // 3. Extract last 4 digits of phone number
        // Clean phone number from whitespace or non-digit characters if any
        const cleanPhone = user.phone.replace(/\D/g, "");
        const expectedPin = cleanPhone.slice(-4);

        if (pin !== expectedPin) {
            return NextResponse.json({ error: "PIN yang Anda masukkan salah" }, { status: 401 });
        }

        // 4. Success! Create session cookie
        const targetUrl = redirect || "/dashboard/penguji/input-nilai";
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://demo-ppdb.vercel.app";
        const response = NextResponse.json({ 
            success: true, 
            redirect: new URL(targetUrl, baseUrl).toString() 
        });

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
                maxAge: 60 * 60 * 24 * 30, // 30 Days
            }
        );

        return response;

    } catch (error: any) {
        console.error("Verify PIN Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}
