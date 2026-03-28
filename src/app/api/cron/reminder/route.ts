/**
 * Cron endpoint for H-1 reminders.
 * Called daily at 08:00 WIB by external cron.
 * Finds all jadwal with tes tomorrow and enqueues reminder if not already sent.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    enqueueWhatsapp,
    buildMessageReminderH1,
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
        // Calculate tomorrow's date range (in WIB = UTC+7)
        const now = new Date();
        // Tomorrow at 00:00 WIB
        const tomorrowStart = new Date(now);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        tomorrowStart.setHours(0, 0, 0, 0);

        // Tomorrow at 23:59 WIB
        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setHours(23, 59, 59, 999);

        // Find all jadwal_ujian scheduled for tomorrow
        const jadwalTomorrow = await prisma.jadwalUjian.findMany({
            where: {
                tanggal_ujian: {
                    gte: tomorrowStart,
                    lte: tomorrowEnd,
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
                        end_time: true,
                        location: true,
                    },
                },
                notif_reminders: true,
            },
        });

        let enqueued = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const jadwal of jadwalTomorrow) {
            // Check if reminder already sent for this jadwal+pendaftar
            const existingReminder = jadwal.notif_reminders.find(
                (r) => r.pendaftar_id === jadwal.pendaftar_id
            );

            if (existingReminder?.reminder_sent) {
                skipped++;
                continue;
            }

            if (!jadwal.pendaftar.no_hp) {
                errors.push(`${jadwal.pendaftar.nama_lengkap}: no phone number`);
                continue;
            }

            // Build reminder message
            const tanggal = new Date(jadwal.tanggal_ujian).toLocaleDateString(
                "id-ID",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                }
            );

            const waktu = jadwal.exam_session
                ? new Date(jadwal.exam_session.start_time).toLocaleTimeString(
                    "id-ID",
                    { hour: "2-digit", minute: "2-digit" }
                )
                : new Date(jadwal.waktu_mulai_santri).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                });

            const lokasi =
                jadwal.exam_session?.location || jadwal.tempat_santri || "Pesantren Al-Andalus Al-Imam";
            const jenisUjian = jadwal.exam_session?.title || "Seleksi Santri Baru";

            const message = buildMessageReminderH1(
                jadwal.pendaftar.nama_lengkap,
                tanggal,
                waktu,
                lokasi,
                jenisUjian
            );

            // Enqueue via queue system
            const result = await enqueueWhatsapp({
                pendaftarId: jadwal.pendaftar_id,
                phone: jadwal.pendaftar.no_hp,
                jenisNotif: "reminder_h1",
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
                        reminder_sent: false, // Will be set true after actually sent by queue
                    },
                });
                enqueued++;
            } else {
                skipped++;
            }
        }

        return NextResponse.json({
            success: true,
            totalJadwalTomorrow: jadwalTomorrow.length,
            enqueued,
            skipped,
            errors,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("❌ Cron Reminder error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
