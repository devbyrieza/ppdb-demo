import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/utils/magic-link";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(new URL("/login?error=Token_hilang", request.url));
        }

        // 1. Verify token mathematically (stateless)
        const verification = verifyMagicToken(token);

        if (!verification.valid || !verification.data) {
            // Decode URI components for safe passage
            const errReason = encodeURIComponent(verification.reason || "Token_tidak_valid");
            return NextResponse.redirect(new URL(`/login?error=${errReason}`, request.url));
        }

        const { id, role, full_name } = verification.data;

        // 2. Build secure cookie directly based on the token's authenticated payload
        // To minimize database lookups, we trust the HMAC-SHA256 valid signature.
        const response = NextResponse.redirect(new URL("/dashboard/penguji/input-nilai", request.url));

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
            }
        );

        return response;

    } catch (error) {
        console.error("Magic Link Error:", error);
        return NextResponse.redirect(new URL("/login?error=Terjadi_kesalahan_server", request.url));
    }
}
