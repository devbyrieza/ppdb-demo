import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

        if (!new_status || !["accepted", "rejected", "cadangan"].includes(new_status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // 4. Bulk Update Status & Sync with Pengumuman table
        const statusMap: Record<string, string> = {
            accepted: "Lulus",
            rejected: "Tidak Lulus",
            cadangan: "Cadangan"
        };
        const displayStatus = statusMap[new_status] || new_status;

        // Fetch user data first to get their current Tahun Ajaran for Pengumuman table
        const updatedUsers = await prisma.pendaftar.findMany({
            where: { id: { in: pendaftar_ids } },
            select: { id: true, nama_lengkap: true, no_hp: true, jenjang: true, tahun_ajaran_id: true }
        });

        // Use transaction for consistency
        await prisma.$transaction(async (tx) => {
            // Bulk update status pendaftaran
            await tx.pendaftar.updateMany({
                where: { id: { in: pendaftar_ids } },
                data: {
                    status_pendaftaran: new_status,
                    updated_at: new Date(),
                },
            });

            // Upsert records in Pengumuman table so they appear in student dashboard
            for (const user of updatedUsers) {
                await tx.pengumuman.upsert({
                    where: { pendaftar_id: user.id },
                    update: {
                        status_kelulusan: displayStatus,
                        is_published: true,
                        published_at: new Date(),
                        published_by: session.id,
                        updated_at: new Date(),
                    },
                    create: {
                        pendaftar_id: user.id,
                        status_kelulusan: displayStatus,
                        is_published: true,
                        published_at: new Date(),
                        published_by: session.id,
                        tahun_ajaran_id: user.tahun_ajaran_id,
                    },
                });
            }
        });

        // Logging audit action
        logAdminAction({
            action: 'PUBLISH_ANNOUNCEMENT',
            adminId: session.id || 'system',
            adminName: session.full_name || session.name || 'Admin',
            targetId: 'multiple',
            details: { count: updatedUsers.length, new_status, pendaftar_ids }
        });

        // 5. Enqueue Notifications to Server-Side Queue
        let queuedCount = 0;
        let skippedCount = 0;
        const details: { id: string; name: string; status: string; reason?: string; logId?: string }[] = [];

        for (const user of updatedUsers) {
            if (!user.no_hp) {
                skippedCount++;
                details.push({ id: user.id, name: user.nama_lengkap, status: "skipped", reason: "Nomor HP kosong" });
                continue;
            }

            const message = announcement_message || buildMessageHasilTes(user.nama_lengkap);

            const resultEnq = await enqueueWhatsapp({
                pendaftarId: user.id,
                phone: user.no_hp,
                jenisNotif: "hasil_tes",
                messageContent: message,
                force: true, // Manual admin trigger should bypass Layer 1 deduplication
            });

            if (resultEnq.queued) {
                queuedCount++;
                details.push({ id: user.id, name: user.nama_lengkap, status: "queued", logId: resultEnq.logId });
            } else {
                skippedCount++;
                details.push({ id: user.id, name: user.nama_lengkap, status: "skipped", reason: resultEnq.reason });
            }
        }
        
        return NextResponse.json({
            success: true,
            updated: updatedUsers.length,
            queued: queuedCount,
            skipped: skippedCount,
            details,
            message: `${queuedCount} pengumuman telah masuk antrean pengiriman.${skippedCount > 0 ? ` (${skippedCount} dilewati, cek detail)` : ""}`
        });

    } catch (error: any) {
        console.error("Error publishing announcement:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
