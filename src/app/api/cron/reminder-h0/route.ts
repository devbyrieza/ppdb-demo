/**
 * Cron endpoint for H-0 reminders (1 hour before exam).
 * Called every 15 minutes by external cron.
 * Finds all jadwal with exams starting within the next 60-75 minutes
 * and enqueues reminder if not already sent.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    enqueueWhatsapp,
    buildMessageReminderH0,
} from "@/lib/whatsapp-queue";

const CRON_SECRET = process.env.CRON_SECRET || "ppdb-alimam-cron-2026";

export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const urlSecret = new URL(request.url).searchParams.get("secret");
    const secret = authHeader?.replace("Bearer ", "") || urlSecret;

    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find exams starting in the next 60-75 minutes
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const windowEnd = new Date(now.getTime() + 75 * 60 * 1000); // 15-min buffer for cron interval

        // Find all jadwal_ujian with exam sessions starting within the window
        const jadwalSoon = await prisma.jadwalUjian.findMany({
            where: {
                exam_session: {
                    start_time: {
                        gte: oneHourFromNow,
                        lte: windowEnd,
                    },
                },
            },
            include: {
                pendaftar: {
                    select: {
                        id: true,
                        nama_lengkap: true,
                        no_hp: true,
                    },
                },
                exam_session: {
                    select: {
                        title: true,
                        start_time: true,
                        location: true,
                    },
                },
                notif_reminders: true,
            },
        });

        let enqueued = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const jadwal of jadwalSoon) {
            // Check if reminder already sent
            const existingReminder = jadwal.notif_reminders.find(
                (r: any) => r.pendaftar_id === jadwal.pendaftar_id
            );

            if (existingReminder?.reminder_sent) {
                skipped++;
                continue;
            }

            if (!jadwal.pendaftar.no_hp) {
                errors.push(`${jadwal.pendaftar.nama_lengkap}: no phone number`);
                continue;
            }

            if (!jadwal.exam_session) {
                skipped++;
                continue;
            }

            const waktu = new Date(jadwal.exam_session.start_time).toLocaleTimeString(
                "id-ID",
                { hour: "2-digit", minute: "2-digit" }
            );

            const lokasi = jadwal.exam_session.location || "Pesantren Al-Andalus Al-Imam";
            const jenisUjian = jadwal.exam_session.title || "Seleksi Santri Baru";

            const message = buildMessageReminderH0(
                jadwal.pendaftar.nama_lengkap,
                waktu,
                lokasi,
                jenisUjian
            );

            // Enqueue via queue system
            const result = await enqueueWhatsapp({
                pendaftarId: jadwal.pendaftar_id,
                phone: jadwal.pendaftar.no_hp,
                jenisNotif: "reminder_h0",
                messageContent: message,
            });

            if (result.queued) {
                // Create/update reminder record
                await prisma.jadwalNotifReminder.upsert({
                    where: {
                        jadwal_ujian_id_pendaftar_id: {
                            jadwal_ujian_id: jadwal.id,
                            pendaftar_id: jadwal.pendaftar_id,
                        },
                    },
                    update: {},
                    create: {
                        jadwal_ujian_id: jadwal.id,
                        pendaftar_id: jadwal.pendaftar_id,
                        reminder_sent: false,
                    },
                });
                enqueued++;
            } else {
                skipped++;
            }
        }

        return NextResponse.json({
            success: true,
            totalJadwalSoon: jadwalSoon.length,
            enqueued,
            skipped,
            errors,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("❌ Cron H-0 Reminder error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
