import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pendaftar_id = searchParams.get("pendaftar_id");

        if (!pendaftar_id) {
            return NextResponse.json(
                { success: false, error: "Pendaftar ID is required" },
                { status: 400 }
            );
        }

        // 1. Validasi session manual
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("app_session");

        if (!sessionCookie) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);
        if (session.role === "pendaftar" && session.id !== pendaftar_id) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        // Get the latest ACTIVE request (not completed or rejected)
        const latestRequest = await prisma.dataPerubahanRequest.findFirst({
            where: {
                pendaftar_id: pendaftar_id,
                status: {
                    in: ["pending", "approved_to_edit", "submitted"],
                },
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json({
            success: true,
            data: latestRequest,
        });
    } catch (error: any) {
        console.error("Error fetching request:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pendaftar_id, reason } = body;

        if (!pendaftar_id || !reason) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 1. Validasi session manual
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("app_session");

        if (!sessionCookie) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);
        if (session.role === "pendaftar" && session.id !== pendaftar_id) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        // Check if there is already an active request
        const existingRequest = await prisma.dataPerubahanRequest.findFirst({
            where: {
                pendaftar_id: pendaftar_id,
                status: {
                    in: ["pending", "approved_to_edit", "submitted"],
                },
            },
        });

        if (existingRequest) {
            return NextResponse.json(
                { success: false, error: "Masih ada permintaan perubahan data yang sedang diproses." },
                { status: 400 }
            );
        }

        // Create new request
        const newRequest = await prisma.dataPerubahanRequest.create({
            data: {
                pendaftar_id,
                reason,
                status: "pending",
            },
        });

        return NextResponse.json({
            success: true,
            data: newRequest,
        });
    } catch (error: any) {
        console.error("Error creating request:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
