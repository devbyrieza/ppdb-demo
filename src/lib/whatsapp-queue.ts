/**
 * WhatsApp Queue Service — 6-Layer Anti-BAN Protection
 *
 * Layer 1: Database flag check (anti-duplicate)
 * Layer 2: Sequential queue via DB (anti-spike)
 * Layer 3: Rate limiting with random jitter (anti-flood)
 * Layer 4: Global cooldown via DB (anti-overload)
 * Layer 5: Log & audit every attempt
 * Layer 6: Natural message templates with personalization
 *
 * Queue is processed by internal cron calling GET /api/cron/whatsapp every 1 minute.
 */

import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/wablas";

// ============================================================================
// TYPES
// ============================================================================

export type NotifType =
    | "jadwal_belum"
    | "jadwal_tersedia"
    | "jadwal_langsung_tersedia"
    | "konfirmasi_jadwal"
    | "konfirmasi_jadwal_interviewer"
    | "reminder_h1"
    | "reminder_h1_penguji"
    | "reminder_h0"
    | "hasil_tes"
    | "registration_success"
    | "document_verified"
    | "document_rejected"
    | "payment_verified"
    | "payment_rejected"
    | "broadcast"
    | "pembatalan_jadwal";

export interface EnqueueParams {
    pendaftarId: string;
    phone: string;
    jenisNotif: NotifType;
    messageContent: string;
    scheduledAt?: Date;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_MESSAGES_PER_HOUR = 120;
const MAX_MESSAGES_PER_10MIN = 30;
const COOLDOWN_MINUTES = 5;
const MIN_DELAY_MS = 3000;
const MAX_DELAY_MS = 7000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MINUTES = 5;

const DEFAULT_APP_URL = 'https://ppdb-demo.com';

// ============================================================================
// LAYER 1: Anti-Duplicate — Check flag before enqueue
// ============================================================================

async function isDuplicate(
    pendaftarId: string,
    jenisNotif: NotifType,
    phone: string
): Promise<boolean> {
    const flagMap: Partial<Record<NotifType, string>> = {
        jadwal_belum: "notif_belum_jadwal_terkirim",
        jadwal_tersedia: "notif_jadwal_tersedia_terkirim",
        jadwal_langsung_tersedia: "notif_jadwal_tersedia_terkirim",
        hasil_tes: "notif_hasil_tes_terkirim",
    };

    const flagColumn = flagMap[jenisNotif];
    if (flagColumn) {
        const pendaftar = await prisma.pendaftar.findUnique({
            where: { id: pendaftarId },
            select: {
                notif_belum_jadwal_terkirim: true,
                notif_jadwal_tersedia_terkirim: true,
                notif_hasil_tes_terkirim: true,
            },
        });

        if (pendaftar) {
            const flagValue =
                pendaftar[flagColumn as keyof typeof pendaftar] as boolean;
            if (flagValue) return true;
        }
    }

    const recentWindow = new Date(Date.now() - 48 * 60 * 60 * 1000); 

    const existingLog = await prisma.whatsappLog.findFirst({
        where: {
            pendaftar_id: pendaftarId,
            phone: phone,
            jenis_notif: jenisNotif,
            status: { in: ["pending", "processing", "sent"] },
            created_at: { gte: recentWindow }
        },
    });

    return !!existingLog;
}

// ============================================================================
// LAYER 3+4: Rate Limiting & Cooldown Check
// ============================================================================

async function checkRateLimits(): Promise<{
    canSend: boolean;
    reason?: string;
    waitMs?: number;
}> {
    const now = new Date();

    let cooldown = await prisma.whatsappCooldown.findUnique({
        where: { id: "global" },
    });

    if (!cooldown) {
        cooldown = await prisma.whatsappCooldown.create({
            data: {
                id: "global",
                sent_count_10m: 0,
                hourly_count: 0,
                hourly_reset: now,
            },
        });
    }

    if (cooldown.cooldown_until && cooldown.cooldown_until > now) {
        const waitMs = cooldown.cooldown_until.getTime() - now.getTime();
        return { canSend: false, reason: "Cooldown aktif", waitMs };
    }

    const hourlyReset = cooldown.hourly_reset || now;
    const hoursSinceReset = (now.getTime() - hourlyReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= 1) {
        await prisma.whatsappCooldown.update({
            where: { id: "global" },
            data: { hourly_count: 0, hourly_reset: now },
        });
    } else if (cooldown.hourly_count >= MAX_MESSAGES_PER_HOUR) {
        const waitMs = (1 - hoursSinceReset) * 60 * 60 * 1000;
        return { canSend: false, reason: "Limit per jam tercapai", waitMs };
    }

    return { canSend: true };
}

// ============================================================================
// LAYER 3: Random Jitter Delay
// ============================================================================

function getRandomDelay(): number {
    return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS) + MIN_DELAY_MS);
}

async function waitRandomDelay(): Promise<void> {
    const delay = getRandomDelay();
    await new Promise((resolve) => setTimeout(resolve, delay));
}

// ============================================================================
// LAYER 5: Check if number is problematic
// ============================================================================

async function isNumberBlocked(phone: string): Promise<boolean> {
    const failedCount = await prisma.whatsappLog.count({
        where: {
            phone,
            status: "failed",
            created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
    });
    return failedCount >= MAX_RETRY_ATTEMPTS;
}

// ============================================================================
// MAIN: Enqueue & Process
// ============================================================================

export async function enqueueWhatsapp(
    params: EnqueueParams
): Promise<{ queued: boolean; reason?: string; logId?: string }> {
    const { pendaftarId, phone, jenisNotif, messageContent, scheduledAt } = params;

    if (await isDuplicate(pendaftarId, jenisNotif, phone)) {
        return { queued: false, reason: "Duplicate" };
    }

    if (await isNumberBlocked(phone)) {
        return { queued: false, reason: "Nomor bermasalah" };
    }

    const log = await prisma.whatsappLog.create({
        data: {
            pendaftar_id: pendaftarId,
            phone,
            jenis_notif: jenisNotif,
            status: "pending",
            message_content: messageContent,
            scheduled_at: scheduledAt || new Date(),
        },
    });

    return { queued: true, logId: log.id };
}

export async function processWhatsappQueue(): Promise<{
    processed: boolean;
    logId?: string;
    status?: string;
    reason?: string;
}> {
    const rateLimitCheck = await checkRateLimits();
    if (!rateLimitCheck.canSend) return { processed: false, reason: rateLimitCheck.reason };

    const now = new Date();
    const pendingMessage = await prisma.whatsappLog.findFirst({
        where: {
            status: "pending",
            scheduled_at: { lte: now },
            attempt_count: { lt: MAX_RETRY_ATTEMPTS },
        },
        orderBy: { scheduled_at: "asc" },
    });

    if (!pendingMessage) return { processed: false, reason: "Antrian kosong" };

    await prisma.whatsappLog.update({
        where: { id: pendingMessage.id },
        data: {
            status: "processing",
            attempt_count: { increment: 1 },
            updated_at: now,
        },
    });

    await waitRandomDelay();

    try {
        const result = await sendMessage({
            phone: pendingMessage.phone,
            message: pendingMessage.message_content || "",
        });

        if (result.status) {
            await prisma.whatsappLog.update({
                where: { id: pendingMessage.id },
                data: {
                    status: "sent",
                    sent_at: new Date(),
                    response_data: JSON.stringify(result.data),
                    updated_at: new Date(),
                },
            });

            if (pendingMessage.pendaftar_id) {
                await updateNotifFlag(pendingMessage.pendaftar_id, pendingMessage.jenis_notif as NotifType);
            }

            await prisma.whatsappCooldown.upsert({
                where: { id: "global" },
                update: {
                    last_sent_at: new Date(),
                    hourly_count: { increment: 1 },
                    updated_at: new Date(),
                },
                create: {
                    id: "global",
                    last_sent_at: new Date(),
                    hourly_count: 1,
                    hourly_reset: new Date(),
                },
            });

            return { processed: true, logId: pendingMessage.id, status: "sent" };
        } else {
            await prisma.whatsappLog.update({
                where: { id: pendingMessage.id },
                data: {
                    status: pendingMessage.attempt_count + 1 >= MAX_RETRY_ATTEMPTS ? "failed" : "pending",
                    failed_at: new Date(),
                    error_message: result.message,
                    updated_at: new Date(),
                },
            });

            return { processed: true, logId: pendingMessage.id, status: "failed", reason: result.message };
        }
    } catch (error: any) {
        await prisma.whatsappLog.update({
            where: { id: pendingMessage.id },
            data: { status: "failed", failed_at: new Date(), error_message: error.message, updated_at: new Date() },
        });
        return { processed: true, logId: pendingMessage.id, status: "error", reason: error.message };
    }
}

async function updateNotifFlag(
    pendaftarId: string,
    jenisNotif: NotifType
): Promise<void> {
    const flagMap: Partial<Record<NotifType, string>> = {
        jadwal_belum: "notif_belum_jadwal_terkirim",
        jadwal_tersedia: "notif_jadwal_tersedia_terkirim",
        jadwal_langsung_tersedia: "notif_jadwal_tersedia_terkirim",
        hasil_tes: "notif_hasil_tes_terkirim",
    };

    const flagColumn = flagMap[jenisNotif];
    if (!flagColumn) return;

    try {
        await prisma.pendaftar.update({
            where: { id: pendaftarId },
            data: { [flagColumn]: true },
        });
    } catch (e) {
        console.error(`Failed to update flag ${flagColumn}:`, e);
    }
}

// ============================================================================
// LAYER 6: Natural Message Builders
// ============================================================================

const OPENINGS = ["Assalamu'alaikum Warahmatullahi Wabarakatuh"];

function pickOpening(): string {
    return OPENINGS[Math.floor(Math.random() * OPENINGS.length)];
}

export function buildMessageRegistrationSuccess(
    nama: string,
    nomor: string,
    jenjang: string
): string {
    return `🎉 *Pendaftaran Berhasil!*

Assalamu'alaikum ${nama},

Alhamdulillah, pendaftaran Anda di Proyek Al-Andalus (Demo) telah berhasil!

📋 *Detail Pendaftaran:*
• Nomor Pendaftaran: ${nomor}
• Jenjang: ${jenjang}
• Nama: ${nama}

📝 *Langkah Selanjutnya:*
Login ke dashboard untuk melengkapi biodata & upload dokumen.

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar

Jazakumullahu khairan,
Panitia PPDB Al-Andalus Demo`;
}

export function buildMessageDocumentVerified(nama: string, dokumenList: string): string {
    return `✅ *Dokumen Diverifikasi*

Assalamu'alaikum ${nama},

Alhamdulillah, dokumen Anda telah diverifikasi dan *DITERIMA*.

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
Panitia PPDB Al-Andalus Demo`;
}

export function buildMessageDocumentRejected(nama: string, dokumenList: string, catatan: string): string {
    return `❌ *Dokumen Perlu Diperbaiki*

Assalamu'alaikum ${nama}, mohon maaf dokumen Anda perlu diperbaiki.

📝 *Catatan:* ${catatan}

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/upload-berkas

Jazakumullahu khairan,
Panitia PPDB Al-Andalus Demo`;
}

export function buildMessagePaymentVerified(nama: string, jumlah: string, metode: string, tanggal: string): string {
    return `✅ *Pembayaran Diterima*

Assalamu'alaikum ${nama}, Alhamdulillah pendaftaran Anda telah diverifikasi.

Jazakumullahu khairan,
Panitia PPDB Al-Andalus Demo`;
}

export function buildMessagePaymentRejected(nama: string, catatan: string): string {
    return `❌ *Pembayaran Perlu Diperbaiki*

📝 *Catatan:* ${catatan}

Jazakumullahu khairan,
Panitia PPDB Al-Andalus Demo`;
}

export function buildMessageJadwalBelum(nama: string): string {
    return `${pickOpening()} ${nama}, jadwal tes belum tersedia. Mohon bersabar.`;
}

export function buildMessageJadwalTersedia(nama: string): string {
    return `${pickOpening()} ${nama}, jadwal tes sudah tersedia! Silakan pilih di dashboard.`;
}

export function buildMessageJadwalLangsungTersedia(nama: string): string {
    return `${pickOpening()} ${nama}, jadwal tes sudah tersedia dan bisa langsung Anda pilih.`;
}

export function buildMessageKonfirmasiJadwal(
    nama: string,
    tanggal: string,
    waktu: string,
    lokasi: string,
    jenisUjian: string
): string {
    return `${pickOpening()} ${nama}, Jadwal ${jenisUjian} Anda telah terkonfirmasi: ${tanggal} ${waktu} WIB.`;
}

export function buildMessageReminderH1(
    nama: string,
    tanggal: string,
    waktu: string,
    lokasi: string,
    jenisUjian: string
): string {
    return `${pickOpening()} ${nama}, Pengingat jadwal ${jenisUjian} Anda: ${tanggal} ${waktu} WIB.`;
}

export function buildMessageReminderH0(
    nama: string,
    waktu: string,
    lokasi: string,
    jenisUjian: string
): string {
    return `${pickOpening()} ${nama}, ⏰ *PENGINGAT: ${jenisUjian} dimulai 1 jam lagi!*`;
}

export function buildMessageHasilTes(nama: string): string {
    return `${pickOpening()} ${nama}, Hasil tes seleksi Anda sudah tersedia. Silakan cek dashboard.`;
}

export function buildMessageKonfirmasiJadwalInterviewer(
    namaInterviewer: string,
    namaSantri: string,
    tanggal: string,
    waktu: string,
    lokasi: string,
    jenisUjian: string,
    inputNilaiLink?: string
): string {
    const title = (namaInterviewer || "").toLowerCase().includes("ustadzah") ? "Ustadzah" : "Ustadz";
    return `${pickOpening()} ${title} ${namaInterviewer}, Jadwal ${jenisUjian} baru untuk santri ${namaSantri}: ${tanggal} ${waktu} WIB. Link: ${inputNilaiLink || "-"}`;
}

export function buildMessageReminderH1Santri(
    nama: string,
    hari: string,
    tanggal: string,
    jam: string,
    lokasi: string,
    jenisUjian: string
): string {
    const finalJam = (jam || "").toLowerCase().includes("wib") ? jam : `${jam} WIB`;
    const finalHari = (tanggal || "").toLowerCase().includes(hari.toLowerCase()) ? "" : `${hari}, `;

    return `*PENGINGAT UJIAN SELEKSI*

Assalamu'alaikum *${nama}*,

📅 *Hari/Tanggal:* ${finalHari}${tanggal}
⏰ *Waktu:* ${finalJam}

---
*Panitia PPDB Al-Andalus Demo*`;
}

export function buildMessageReminderH1Penguji(
    namaPenguji: string,
    namaSantri: string,
    hari: string,
    tanggal: string,
    jam: string,
    lokasi: string,
    jenisUjian: string,
    inputNilaiLink?: string
): string {
    const title = (namaPenguji || "").toLowerCase().includes("ustadzah") ? "Ustadzah" : "Ustadz";
    const finalJam = (jam || "").toLowerCase().includes("wib") ? jam : `${jam} WIB`;
    const finalHari = (tanggal || "").toLowerCase().includes(hari.toLowerCase()) ? "" : `${hari}, `;

    return `*REMINDER JADWAL WAWANCARA*

Assalamu'alaikum ${title} *${namaPenguji}*,

👤 *Nama Santri:* ${namaSantri}
📅 *Hari/Tanggal:* ${finalHari}${tanggal}
⏰ *Waktu:* ${finalJam}
📍 *Link Meet:* ${lokasi}
🔗 *Input Hasil:* ${inputNilaiLink || "-"}

---
*Sistem PPDB Al-Andalus Demo*`;
}

export function buildMessagePembatalanJadwal(
    namaSantri: string,
    jenisUjian: string,
    tanggal: string,
    jam: string,
    alasan: string = "Ustadz Berhalangan Hadir"
): string {
    return `*PEMBATALAN JADWAL UJIAN*

Jadwal ${jenisUjian} Anda pada ${tanggal} ${jam} WIB dibatalkan karena: ${alasan}.

---
*Panitia PPDB Al-Andalus Demo*`;
}

export async function getQueueStats() {
    const [pending, processing, sent, failed, blocked] = await Promise.all([
        prisma.whatsappLog.count({ where: { status: "pending" } }),
        prisma.whatsappLog.count({ where: { status: "processing" } }),
        prisma.whatsappLog.count({ where: { status: "sent" } }),
        prisma.whatsappLog.count({ where: { status: "failed" } }),
        prisma.whatsappLog.count({ where: { status: "blocked" } }),
    ]);
    return { queue: { pending, processing, sent, failed, blocked } };
}
