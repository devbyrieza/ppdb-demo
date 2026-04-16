/**
 * Cron endpoint for 4-hour reminders.
 * Called every 15 minutes by external cron.
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
    const authHeader = request.headers.get("authorization");
    const urlSecret = new URL(request.url).searchParams.get("secret");
    const secret = authHeader?.replace("Bearer ", "") || urlSecret;

    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        const fourHoursPlus15Min = new Date(now.getTime() + 4 * 60 * 60 * 1000 + 15 * 60 * 1000);

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
                pendaftar: true,
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
            const dateObj = new Date(jadwal.tanggal_ujian);
            const hari = dateObj.toLocaleDateString("id-ID", { weekday: "long" }).replace("Minggu", "Ahad");
            const tanggalStr = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
            const timeObj = jadwal.exam_session ? new Date(jadwal.exam_session.start_time) : new Date(jadwal.waktu_mulai_santri);
            const jam = timeObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
            const jenisUjian = jadwal.exam_session?.title || "Seleksi Santri Baru";

            const googleMeetLink = 
                jadwal.penguji_santri?.google_meet_link || 
                jadwal.penguji_quran?.google_meet_link || 
                jadwal.penguji_ortu?.google_meet_link || 
                jadwal.google_meet_link;

            const lokasi = googleMeetLink 
                ? `${jadwal.exam_session?.location || "Online"} (Link: ${googleMeetLink})` 
                : (jadwal.exam_session?.location || "Pesantren Al-Andalus Demo");

            if (jadwal.pendaftar.no_hp) {
                const msgSantri = buildMessageReminderH1Santri(jadwal.pendaftar.nama_lengkap, hari, tanggalStr, jam, lokasi, jenisUjian);
                await enqueueWhatsapp({
                    pendaftarId: jadwal.pendaftar_id,
                    phone: jadwal.pendaftar.no_hp,
                    jenisNotif: "reminder_h1",
                    messageContent: msgSantri,
                });
                enqueuedSantri++;
            }

            const examinersToNotify = [
                { profile: jadwal.penguji_santri, type: "Wawancara Calon Santri (Calsan)" },
                { profile: jadwal.penguji_quran, type: "Tes Al-Qur'an" },
                { profile: jadwal.penguji_ortu, type: "Wawancara Calon Wali Santri (Cawalsan/Ortu)" },
            ];

            for (const { profile, type } of examinersToNotify) {
                if (profile && profile.phone) {
                    const redirectPath = `/dashboard/penguji/input-nilai?search=${encodeURIComponent(jadwal.pendaftar.nomor_pendaftaran || jadwal.pendaftar_id)}`;
                    const token = generateMagicToken(profile.id, profile.role || "penguji", profile.full_name, 48, redirectPath);
                    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ppdb-demo.com'}/api/auth/magic?token=${token}`;

                    const slug = getSlugByName(profile.full_name);
                    const manualTinyUrl = getManualTinyUrl(profile.full_name);
                    
                    let shortUrl = manualTinyUrl || "";
                    if (!shortUrl && slug) {
                        const dynamicAuthUrl = getPermanentAuthUrl(slug, jadwal.pendaftar.nomor_pendaftaran || jadwal.pendaftar_id);
                        shortUrl = await generateTinyUrl(dynamicAuthUrl);
                    } else if (!shortUrl) {
                        shortUrl = await generateTinyUrl(magicLink);
                    }

                    const msgPenguji = buildMessageReminderH1Penguji(profile.full_name, jadwal.pendaftar.nama_lengkap, hari, tanggalStr, jam, profile.google_meet_link || "Menyesuaikan", type, shortUrl);
                    await enqueueWhatsapp({
                        pendaftarId: jadwal.pendaftar_id,
                        phone: profile.phone,
                        jenisNotif: "reminder_h1_penguji",
                        messageContent: msgPenguji,
                    });
                    enqueuedPenguji++;
                }
            }
        }

        return NextResponse.json({ success: true, enqueuedSantri, enqueuedPenguji });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
