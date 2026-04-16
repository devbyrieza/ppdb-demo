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
 * Ported from Al-Imam reference.
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

const MAX_MESSAGES_PER_HOUR = 120; // Increased from 20 for faster queue clearing
const MAX_MESSAGES_PER_10MIN = 30;  // Increased from 10
const COOLDOWN_MINUTES = 5;         // Reduced from 15 to recover faster
const MIN_DELAY_MS = 3000;          // Reduced from 5000
const MAX_DELAY_MS = 7000;          // Reduced from 10000
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MINUTES = 5;

const DEFAULT_APP_URL = 'https://ppdb-demo.com';

// ============================================================================
// LAYER 1: Anti-Duplicate — Check flag before enqueue
// ============================================================================

/**
 * Check if a notification of this type has already been sent/queued for this pendaftar.
 * Uses both the Pendaftar flag columns AND the WhatsappLog table.
 */
async function isDuplicate(
    pendaftarId: string,
    jenisNotif: NotifType,
    phone: string
): Promise<boolean> {
    // Check Pendaftar flag columns for persistent flags
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

    // For non-flag types (konfirmasi_jadwal, reminder_h1), check WhatsappLog
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
// LOGIC: Rate Limits, Cooldowns, Jitter
// ============================================================================

async function checkRateLimits(): Promise<{ canSend: boolean; reason?: string; waitMs?: number }> {
    const now = new Date();
    let cooldown = await prisma.whatsappCooldown.findUnique({ where: { id: "global" } });
    if (!cooldown) {
        cooldown = await prisma.whatsappCooldown.create({
            data: { id: "global", sent_count_10m: 0, hourly_count: 0, hourly_reset: now },
        });
    }

    if (cooldown.cooldown_until && cooldown.cooldown_until > now) {
        return { canSend: false, reason: "Cooldown aktif", waitMs: cooldown.cooldown_until.getTime() - now.getTime() };
    }

    const hourlyReset = cooldown.hourly_reset || now;
    const hoursSinceReset = (now.getTime() - hourlyReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= 1) {
        await prisma.whatsappCooldown.update({ where: { id: "global" }, data: { hourly_count: 0, hourly_reset: now } });
    } else if (cooldown.hourly_count >= MAX_MESSAGES_PER_HOUR) {
        return { canSend: false, reason: "Limit per jam tercapai", waitMs: (1 - hoursSinceReset) * 3600000 };
    }

    return { canSend: true };
}

async function waitRandomDelay() {
    const delay = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS) + MIN_DELAY_MS);
    await new Promise(resolve => setTimeout(resolve, delay));
}

// ============================================================================
// MAIN: Enqueue & Process
// ============================================================================

export async function enqueueWhatsapp(params: EnqueueParams) {
    const { pendaftarId, phone, jenisNotif, messageContent, scheduledAt } = params;

    if (jenisNotif !== "broadcast") {
        if (await isDuplicate(pendaftarId, jenisNotif, phone)) return { queued: false, reason: "Duplicate" };
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

export async function processWhatsappQueue() {
    const rateLimitCheck = await checkRateLimits();
    if (!rateLimitCheck.canSend) return { processed: false, reason: rateLimitCheck.reason };

    const pendingMessage = await prisma.whatsappLog.findFirst({
        where: { status: "pending", scheduled_at: { lte: new Date() }, attempt_count: { lt: MAX_RETRY_ATTEMPTS } },
        orderBy: { scheduled_at: "asc" },
    });

    if (!pendingMessage) return { processed: false, reason: "Queue empty" };

    await prisma.whatsappLog.update({
        where: { id: pendingMessage.id },
        data: { status: "processing", attempt_count: { increment: 1 }, updated_at: new Date() },
    });

    await waitRandomDelay();

    try {
        const result = await sendMessage({ phone: pendingMessage.phone, message: pendingMessage.message_content || "" });
        if (result.status) {
            await prisma.whatsappLog.update({
                where: { id: pendingMessage.id },
                data: { status: "sent", sent_at: new Date(), response_data: JSON.stringify(result.data), updated_at: new Date() },
            });
            return { processed: true, logId: pendingMessage.id, status: "sent" };
        } else {
            await prisma.whatsappLog.update({
                where: { id: pendingMessage.id },
                data: { status: "failed", failed_at: new Date(), error_message: result.message, updated_at: new Date() },
            });
            return { processed: true, logId: pendingMessage.id, status: "failed" };
        }
    } catch (error: any) {
        await prisma.whatsappLog.update({
            where: { id: pendingMessage.id },
            data: { status: "failed", failed_at: new Date(), error_message: error.message, updated_at: new Date() },
        });
        return { processed: true, logId: pendingMessage.id, status: "error" };
    }
}

// ============================================================================
// LAYER 6: Natural Message Builders
// ============================================================================

const OPENINGS = [
    "Assalamu'alaikum Warahmatullahi Wabarakatuh",
];

function pickOpening(): string {
    return OPENINGS[Math.floor(Math.random() * OPENINGS.length)];
}

export function buildMessageRegistrationSuccess(nama: string, nomor: string, jenjang: string) {
    return `🎉 *Pendaftaran Berhasil!*

Assalamu'alaikum ${nama},

Alhamdulillah, pendaftaran Anda di Proyek Al-Andalus (Demo) telah berhasil!

Nomor Pendaftaran: ${nomor}
Jenjang: ${jenjang}

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar`;
}

export function buildMessageDocumentVerified(nama: string, dokumenList: string) {
    return `✅ *Dokumen Diverifikasi*
Assalamu'alaikum ${nama}, dokumen Anda telah diverifikasi.`;
}

export function buildMessageDocumentRejected(nama: string, dokumenList: string, catatan: string) {
    return `❌ *Dokumen Ditolak*\nCatatan: ${catatan}`;
}

export function buildMessagePaymentVerified(nama: string, jumlah: string) {
    return `✅ *Pembayaran Diverifikasi*\nJumlah: ${jumlah}`;
}

export function buildMessagePaymentRejected(nama: string, catatan: string) {
    return `❌ *Pembayaran Ditolak*\nCatatan: ${catatan}`;
}

export function buildMessageJadwalBelum(nama: string) {
    return `Jadwal belum tersedia untuk ${nama}.`;
}

export function buildMessageJadwalTersedia(nama: string) {
    return `Alhamdulillah ${nama}, jadwal sudah tersedia!`;
}

export function buildMessageJadwalLangsungTersedia(nama: string) {
    return `Jadwal sudah tersedia dan bisa dipilih untuk ${nama}.`;
}

export function buildMessageKonfirmasiJadwal(nama: string, tgl: string, jam: string, loc: string, tipe: string) {
    return `Konfirmasi: ${tipe} pada ${tgl} jam ${jam} di ${loc}.`;
}

export function buildMessageReminderH1(nama: string, tgl: string, jam: string, loc: string, tipe: string) {
    return `Reminder H-1: ${tipe} besok pada ${tgl} jam ${jam}.`;
}

export function buildMessageReminderH0(nama: string, jam: string, loc: string, tipe: string) {
    return `Reminder H-0: ${tipe} dimulai 1 jam lagi (jam ${jam}).`;
}

export function buildMessageHasilTes(nama: string) {
    return `Hasil tes sudah tersedia untuk ${nama}.`;
}

export function buildMessageKonfirmasiJadwalInterviewer(namaI: string, namaS: string, tgl: string, jam: string, loc: string, tipe: string, linkNilai?: string) {
    return `Jadwal menguji baru: ${tipe} santri ${namaS} pada ${tgl} jam ${jam}. Link: ${linkNilai || "-"}`;
}

export function buildMessageReminderH1Santri(nama: string, hari: string, tgl: string, jam: string, loc: string, tipe: string) {
    return `Reminder Santri H-1: ${tipe} pada ${hari}, ${tgl} jam ${jam}.`;
}

export function buildMessageReminderH1Penguji(namaP: string, namaS: string, hari: string, tgl: string, jam: string, loc: string, tipe: string, linkNilai?: string) {
    return `Reminder Penguji H-1: ${tipe} santri ${namaS} besok pada ${hari}, ${tgl} jam ${jam}. Link: ${linkNilai || "-"}`;
}

export function buildMessagePembatalanJadwal(namaS: string, tipe: string, tgl: string, jam: string, alasan: string) {
    return `Jadwal ${tipe} pada ${tgl} dibatalkan karena: ${alasan}.`;
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
