import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyStatusChange } from "@/lib/wablas";
import { enqueueWhatsapp, buildMessageHasilTes } from "@/lib/whatsapp-queue";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 2. Check Role: Only Super Admin (and maybe Head of IT/Admin) can publish
        const allowedRoles = ["admin_super", "head_of_it", "admin"];
        if (!allowedRoles.includes(session.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 3. Get Params
        const body = await request.json();
        const { pendaftar_ids, new_status, announcement_message } = body;

        if (!pendaftar_ids || !Array.isArray(pendaftar_ids) || pendaftar_ids.length === 0) {
            return NextResponse.json({ error: "No pendaftar selected" }, { status: 400 });
        }

        if (!new_status || !["accepted", "rejected"].includes(new_status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // 4. Bulk Update
        const result = await prisma.pendaftar.updateMany({
            where: {
                id: { in: pendaftar_ids },
            },
            data: {
                status_pendaftaran: new_status,
                updated_at: new Date(),
            },
        });

        // Logging audit action
        logAdminAction({
            action: 'PUBLISH_ANNOUNCEMENT',
            adminId: session.id || 'system',
            adminName: session.full_name || session.name || 'Admin',
            targetId: 'multiple',
            details: { count: result.count, new_status, pendaftar_ids }
        });

        // 5. Enqueue Notifications to Server-Side Queue
        const updatedUsers = await prisma.pendaftar.findMany({
            where: { id: { in: pendaftar_ids } },
            select: { id: true, nama_lengkap: true, no_hp: true, jenjang: true }
        });
        
        let queuedCount = 0;
        for (const user of updatedUsers) {
            if (user.no_hp) {
                await enqueueWhatsapp({
                    pendaftarId: user.id,
                    phone: user.no_hp,
                    jenisNotif: "hasil_tes",
                    messageContent: buildMessageHasilTes(user.nama_lengkap),
                });
                queuedCount++;
            }
        }
        
        return NextResponse.json({
            success: true,
            updated: result.count,
            queued: queuedCount,
            message: `${queuedCount} pengumuman telah masuk antrean pengiriman.`
        });

    } catch (error: any) {
        console.error("Error publishing announcement:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
