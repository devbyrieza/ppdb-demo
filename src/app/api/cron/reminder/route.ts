/**
 * Cron endpoint for 4-hour reminders.
 * Called every 15 minutes by external cron.
 * Finds all jadwal with exams starting in exactly 4 hours and sends reminders immediately.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    enqueueWhatsapp,
    buildMessageReminderH1Santri,
    buildMessageReminderH1Penguji,
} from "@/lib/whatsapp-queue";
import { generateMagicToken, generateTinyUrl, getManualTinyUrl, getSlugByName, getPermanentAuthUrl } from "@/lib/utils/magic-link";

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
        // Calculate 4-hour window from now
        const now = new Date();
        const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        const fourHoursPlus15Min = new Date(now.getTime() + 4 * 60 * 60 * 1000 + 15 * 60 * 1000); // 15 min buffer

        // Find all jadwal_ujian with exams starting in the 4-hour window
        const jadwalIn4Hours = await prisma.jadwalUjian.findMany({
            where: {
                exam_session: {
                    start_time: {
                        gte: fourHoursFromNow,
                        lte: fourHoursPlus15Min,
                    },
                },
            },
            include: {
                pendaftar: {
                    include: {
                        orang_tua: true,
                    }
                },
                exam_session: true,
                penguji_santri: true,
                penguji_quran: true,
                penguji_ortu: true,
                notif_reminders: true,
            },
        });

        let enqueuedSantri = 0;
        let enqueuedPenguji = 0;

        for (const jadwal of jadwalIn4Hours) {
            // Format details
            const dateObj = new Date(jadwal.tanggal_ujian);
            const hari = dateObj.toLocaleDateString("id-ID", { weekday: "long" }).replace("Minggu", "Ahad");
            
            // Explicitly format to avoid machine-specific weekday prefix in some environments
            const tanggalStr = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
            
            const timeObj = jadwal.exam_session ? new Date(jadwal.exam_session.start_time) : new Date(jadwal.waktu_mulai_santri);
            const jam = timeObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

            const jenisUjian = jadwal.exam_session?.title || "Seleksi Santri Baru";

            // Calculate Start Time accurately
            const startTime = jadwal.exam_session 
                ? new Date(jadwal.exam_session.start_time) 
                : (() => {
                    const d = new Date(jadwal.tanggal_ujian);
                    const t = new Date(jadwal.waktu_mulai_santri);
                    d.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds());
                    return d;
                })();

            // Send immediately since we're already at the 4-hour mark
            const finalScheduledAt = now;

            const googleMeetLink = 
                jadwal.google_meet_link ||
                jadwal.penguji_santri?.google_meet_link || 
                jadwal.penguji_quran?.google_meet_link || 
                jadwal.penguji_ortu?.google_meet_link;

            const lokasi = googleMeetLink 
                ? (googleMeetLink.startsWith("http") ? googleMeetLink : `${jadwal.exam_session?.location || "Online"} (${googleMeetLink})`)
                : (jadwal.exam_session?.location || "Pesantren Sistem PPDB Modern");

            // 1. Enqueue for Santri / Parents
            const isOrangTua = jenisUjian.toLowerCase().includes("cawalsan") || (jadwal.exam_session?.title || "").toLowerCase().includes("cawalsan");
            
            if (isOrangTua) {
                // Send to parents
                const parentPhone = jadwal.pendaftar.orang_tua?.no_hp_ayah || jadwal.pendaftar.orang_tua?.no_hp_ibu || jadwal.pendaftar.no_hp;
                if (parentPhone) {
                    const { buildMessageReminderH1OrangTua } = await import("@/lib/whatsapp-queue");
                    const msgOrangTua = buildMessageReminderH1OrangTua(
                        jadwal.pendaftar.nama_lengkap,
                        hari,
                        tanggalStr,
                        jam,
                        lokasi
                    );

                    const result = await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: parentPhone,
                        jenisNotif: "reminder_h1",
                        messageContent: msgOrangTua,
                        scheduledAt: finalScheduledAt,
                    });
                    if (result.queued) enqueuedSantri++;
                }
            } else {
                // Send to santri
                if (jadwal.pendaftar.no_hp) {
                    const msgSantri = buildMessageReminderH1Santri(
                        jadwal.pendaftar.nama_lengkap,
                        hari,
                        tanggalStr,
                        jam,
                        lokasi,
                        jenisUjian
                    );

                    const result = await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: jadwal.pendaftar.no_hp,
                        jenisNotif: "reminder_h1",
                        messageContent: msgSantri,
                        scheduledAt: finalScheduledAt,
                    });

                    if (result.queued) enqueuedSantri++;
                }
            }

            // 2. Enqueue for Examiners (if assigned)
            const examinersToNotify = [
                { profile: jadwal.penguji_santri, type: "Seleksi Wawancara Calon Santri (Santri)" },
                { profile: jadwal.penguji_quran, type: "Seleksi Al Qur'an" },
                { profile: jadwal.penguji_ortu, type: "Seleksi Wawancara Orang Tua/Wali (Orang Tua/Ortu)" },
            ];

            for (const { profile, type } of examinersToNotify) {
                if (profile && profile.phone) {
                    // Generate Magic Link for this examiner
                    // Redirect to input-nilai page and pre-select this student via search param
                    const redirectPath = `/dashboard/penguji/input-nilai?search=${encodeURIComponent(jadwal.pendaftar.nomor_pendaftaran)}`;
                    const token = generateMagicToken(
                        profile.id,
                        profile.role || "penguji",
                        profile.full_name,
                        48, // 48 hours expiry
                        redirectPath
                    );
                    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://demo-ppdb.vercel.app'}/api/auth/magic?token=${token}`;

                    // Use intelligent shortlink system:
                    // 1. Get the permanent slug for the examiner
                    // 2. Build the auth url with pendaftar number param
                    // 3. Shorten that URL with TinyURL
                    const slug = getSlugByName(profile.full_name);
                    const manualTinyUrl = getManualTinyUrl(profile.full_name);
                    
                    let shortUrl = manualTinyUrl || "";
                    if (!shortUrl && slug) {
                        const dynamicAuthUrl = getPermanentAuthUrl(slug, jadwal.pendaftar.nomor_pendaftaran);
                        shortUrl = await generateTinyUrl(dynamicAuthUrl);
                    } else if (!shortUrl) {
                        // Fallback to old magic link if no slug/manual tinyurl exists
                        shortUrl = await generateTinyUrl(magicLink);
                    }

                    const gender = (profile.full_name.match(/halimah|maryani|fatimah|azzahra|putri|utami/i)) ? "P" : "L";

                    const msgPenguji = buildMessageReminderH1Penguji(
                        profile.full_name,
                        jadwal.pendaftar.nama_lengkap,
                        hari,
                        tanggalStr,
                        jam,
                        profile.google_meet_link || "Menyesuaikan",
                        type,
                        gender,
                        shortUrl
                    );

                    const result = await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: profile.phone,
                        jenisNotif: "reminder_h1_penguji", // Mapping to existing H1 type in DB for now
                        messageContent: msgPenguji,
                        scheduledAt: finalScheduledAt,
                    });

                    if (result.queued) enqueuedPenguji++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            totalJadwalIn4Hours: jadwalIn4Hours.length,
            enqueuedSantri,
            enqueuedPenguji,
            timestamp: now.toISOString(),
        });
    } catch (error: any) {
        console.error("❌ Cron Reminder error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
