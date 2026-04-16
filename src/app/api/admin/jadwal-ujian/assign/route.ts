import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session || !["admin", "admin_super"].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { pendaftar_id, exam_session_id, tahun_ajaran_id } = await req.json();

        // Get session details
        const examSession = await prisma.examSession.findUnique({
            where: { id: exam_session_id },
        });

        if (!examSession) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (examSession.booked_count >= examSession.quota) {
            return NextResponse.json({ error: "Session is full" }, { status: 400 });
        }

        // Create or update JadwalUjian
        const result = await prisma.$transaction([
            prisma.jadwalUjian.upsert({
                where: {
                    // This assumes unique constraint on pendaftar_id? No, JadwalUjian doesn't have it.
                    // I'll filter by pendaftar_id and tahun_ajaran_id.
                    id: (await prisma.jadwalUjian.findFirst({
                        where: { pendaftar_id, tahun_ajaran_id }
                    }))?.id || '00000000-0000-0000-0000-000000000000',
                },
                update: {
                    exam_session_id,
                    tanggal_ujian: examSession.start_time,
                    waktu_mulai_santri: examSession.start_time,
                    waktu_selesai_santri: examSession.end_time,
                    tempat_santri: examSession.location || "Pesantren Al-Andalus Al-Imam",
                    waktu_mulai_ortu: examSession.start_time,
                    waktu_selesai_ortu: examSession.end_time,
                    tempat_ortu: examSession.location || "Pesantren Al-Andalus Al-Imam",
                },
                create: {
                    pendaftar_id,
                    tahun_ajaran_id,
                    exam_session_id,
                    tanggal_ujian: examSession.start_time,
                    waktu_mulai_santri: examSession.start_time,
                    waktu_selesai_santri: examSession.end_time,
                    tempat_santri: examSession.location || "Pesantren Al-Andalus Al-Imam",
                    waktu_mulai_ortu: examSession.start_time,
                    waktu_selesai_ortu: examSession.end_time,
                    tempat_ortu: examSession.location || "Pesantren Al-Andalus Al-Imam",
                },
            }),
            prisma.examSession.update({
                where: { id: exam_session_id },
                data: { booked_count: { increment: 1 } },
            }),
            // Also update pendaftar status to 'scheduled'
            prisma.pendaftar.update({
                where: { id: pendaftar_id },
                data: { status_pendaftaran: 'scheduled' }
            })
        ]);

        // Logging audit action
        logAdminAction({
            action: 'ASSIGN_EXAM',
            adminId: session.id || 'system',
            adminName: session.full_name || session.name || 'Admin',
            targetId: pendaftar_id,
            details: { exam_session_id, session_title: examSession.title }
        });

        // NEW ENHANCEMENT: Send WhatsApp notification
        try {
            const pendaftar = await prisma.pendaftar.findUnique({
                where: { id: pendaftar_id },
                select: { nama_lengkap: true, no_hp: true }
            });

            if (pendaftar?.no_hp) {
                const { notifyTestSchedule } = await import("@/lib/wablas");
                await notifyTestSchedule({
                    phone: pendaftar.no_hp,
                    nama: pendaftar.nama_lengkap,
                    tanggal: new Date(examSession.start_time).toLocaleDateString("id-ID", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    waktu: `${new Date(examSession.start_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} - ${new Date(examSession.end_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}`,
                    tempat: examSession.location || "Pesantren Al-Andalus Al-Imam",
                });
            }
        } catch (waError) {
            console.error("WA Notification failed:", waError);
        }

        return NextResponse.json({ success: true, data: result[0] });
    } catch (error: any) {
        console.error("Assignment error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
