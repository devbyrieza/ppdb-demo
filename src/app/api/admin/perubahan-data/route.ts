import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");
    if (!sessionCookie) return null;
    try {
        const session = JSON.parse(sessionCookie.value);
        if (["admin_super", "admin", "admin_berkas", "head_of_it"].includes(session.role)) {
            return session;
        }
    } catch { }
    return null;
}

export async function GET() {
    try {
        const session = await checkAdmin();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const requests = await prisma.dataPerubahanRequest.findMany({
            include: {
                pendaftar: {
                    select: {
                        nama_lengkap: true,
                        no_hp: true,
                        nik: true
                    }
                }
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ success: true, data: requests });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await checkAdmin();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { requestId, action, admin_note } = body;

        let newStatus = "";
        let completedAt = null;
        let approvedAt = null;

        if (action === 'approve') {
            newStatus = "approved_to_edit";
            approvedAt = new Date();
        } else if (action === 'reject') {
            newStatus = "rejected";
            completedAt = new Date();
        } else if (action === 'complete') {
            newStatus = "completed";
            completedAt = new Date();

            // If completed, make sure student status is back to data_completed
            const req = await prisma.dataPerubahanRequest.findUnique({
                where: { id: requestId }
            });
            if (req) {
                await prisma.pendaftar.update({
                    where: { id: req.pendaftar_id },
                    data: { status_pendaftaran: 'data_completed' }
                });
            }
        }

        const updated = await prisma.dataPerubahanRequest.update({
            where: { id: requestId },
            data: {
                status: newStatus,
                admin_note,
                approved_at: approvedAt,
                completed_at: completedAt,
                updated_at: new Date()
            }
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
