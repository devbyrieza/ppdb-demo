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
 * Queue is processed by external cron calling GET /api/cron/whatsapp every 1 minute.
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
    force?: boolean;
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

const DEFAULT_APP_URL = 'https://demo-ppdb.vercel.app';

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
            if (flagValue) {
                console.log(
                    `🚫 [Layer 1] Duplicate blocked: ${jenisNotif} for ${pendaftarId} (flag already true)`
                );
                return true;
            }
        }
    }

    // For non-flag types (konfirmasi_jadwal, reminder_h1), check WhatsappLog
    // Added phone check & 48h limit to allow multiple examiners per student and re-tests
    const recentWindow = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const existingLog = await prisma.whatsappLog.findFirst({
        where: {
            pendaftar_id: pendaftarId,
            phone: phone, // Check phone too!
            jenis_notif: jenisNotif,
            status: { in: ["pending", "processing", "sent"] },
            created_at: { gte: recentWindow }
        },
    });

    if (existingLog) {
        console.log(
            `🚫 [Layer 1] Duplicate blocked: ${jenisNotif} for ${pendaftarId} (existing log: ${existingLog.status})`
        );
        return true;
    }

    return false;
}

// ============================================================================
// LAYER 3+4: Rate Limiting & Cooldown Check
// ============================================================================

/**
 * Check all rate limits before sending.
 * Returns { canSend, reason, waitMs }
 */
async function checkRateLimits(): Promise<{
    canSend: boolean;
    reason?: string;
    waitMs?: number;
}> {
    const now = new Date();

    // Ensure cooldown record exists
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

    // Layer 4: Check active cooldown
    if (cooldown.cooldown_until && cooldown.cooldown_until > now) {
        const waitMs = cooldown.cooldown_until.getTime() - now.getTime();
        console.log(
            `⏸️ [Layer 4] Global cooldown active, ${Math.round(waitMs / 1000)}s remaining`
        );
        return {
            canSend: false,
            reason: `Cooldown aktif, tunggu ${Math.round(waitMs / 60000)} menit`,
            waitMs,
        };
    }

    // Layer 3: Check hourly limit
    const hourlyReset = cooldown.hourly_reset || now;
    const hoursSinceReset =
        (now.getTime() - hourlyReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= 1) {
        // Reset hourly counter
        await prisma.whatsappCooldown.update({
            where: { id: "global" },
            data: { hourly_count: 0, hourly_reset: now },
        });
    } else if (cooldown.hourly_count >= MAX_MESSAGES_PER_HOUR) {
        const waitMs = (1 - hoursSinceReset) * 60 * 60 * 1000;
        console.log(
            `⏸️ [Layer 3] Hourly limit reached (${cooldown.hourly_count}/${MAX_MESSAGES_PER_HOUR})`
        );
        return {
            canSend: false,
            reason: `Limit ${MAX_MESSAGES_PER_HOUR} pesan/jam tercapai`,
            waitMs,
        };
    }

    // Layer 4: Check 10-minute window
    const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const recentSentCount = await prisma.whatsappLog.count({
        where: {
            status: "sent",
            sent_at: { gte: tenMinAgo },
        },
    });

    if (recentSentCount >= MAX_MESSAGES_PER_10MIN) {
        // Activate cooldown
        const cooldownUntil = new Date(
            now.getTime() + COOLDOWN_MINUTES * 60 * 1000
        );
        await prisma.whatsappCooldown.update({
            where: { id: "global" },
            data: {
                cooldown_until: cooldownUntil,
                sent_count_10m: recentSentCount,
            },
        });
        console.log(
            `⏸️ [Layer 4] 10-minute threshold hit (${recentSentCount}/${MAX_MESSAGES_PER_10MIN}), cooldown until ${cooldownUntil.toISOString()}`
        );
        return {
            canSend: false,
            reason: `${MAX_MESSAGES_PER_10MIN} pesan dalam 10 menit, cooldown ${COOLDOWN_MINUTES} menit`,
            waitMs: COOLDOWN_MINUTES * 60 * 1000,
        };
    }

    // Layer 3: Check minimum delay between messages
    if (cooldown.last_sent_at) {
        const timeSinceLastMs = now.getTime() - cooldown.last_sent_at.getTime();
        if (timeSinceLastMs < MIN_DELAY_MS) {
            return {
                canSend: false,
                reason: "Jeda minimal belum tercapai",
                waitMs: MIN_DELAY_MS - timeSinceLastMs,
            };
        }
    }

    return { canSend: true };
}

// ============================================================================
// LAYER 3: Random Jitter Delay
// ============================================================================

function getRandomDelay(): number {
    return Math.floor(
        Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS) + MIN_DELAY_MS
    );
}

async function waitRandomDelay(): Promise<void> {
    const delay = getRandomDelay();
    console.log(`⏳ [Layer 3] Random jitter delay: ${delay}ms`);
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
            created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24h
        },
    });

    if (failedCount >= MAX_RETRY_ATTEMPTS) {
        console.log(
            `🚫 [Layer 5] Number ${phone} blocked: ${failedCount} failures in 24h`
        );
        return true;
    }

    return false;
}

// ============================================================================
// MAIN: Enqueue WhatsApp Message
// ============================================================================

/**
 * Enqueue a WhatsApp notification with all Layer 1 checks.
 * Does NOT send immediately — the cron worker will process the queue.
 */
export async function enqueueWhatsapp(
    params: EnqueueParams
): Promise<{ queued: boolean; reason?: string; logId?: string }> {
    const { pendaftarId, phone, jenisNotif, messageContent, scheduledAt, force } =
        params;

    // Layer 1: Duplicate check (skip if force is true)
    const duplicate = !force && await isDuplicate(pendaftarId, jenisNotif, phone);
    if (duplicate) {
        return { queued: false, reason: "Notifikasi serupa sudah pernah dikirim/diantri" };
    }

    // Layer 5: Check if number is blocked
    const blocked = await isNumberBlocked(phone);
    if (blocked) {
        return {
            queued: false,
            reason: "Nomor bermasalah (gagal berulang), perlu review admin",
        };
    }

    // Create log entry (pending)
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

    console.log(
        `📥 [Enqueue] ${jenisNotif} for ${pendaftarId} queued as ${log.id}`
    );

    return { queued: true, logId: log.id };
}

// ============================================================================
// MAIN: Process Queue (called by cron)
// ============================================================================

/**
 * Process the next pending WhatsApp message in the queue.
 * Called by GET /api/cron/whatsapp every ~1 minute.
 * Processes ONE message per invocation for safety.
 */
export async function processWhatsappQueue(): Promise<{
    processed: boolean;
    logId?: string;
    status?: string;
    reason?: string;
}> {
    // Layer 3+4: Check rate limits
    const rateLimitCheck = await checkRateLimits();
    if (!rateLimitCheck.canSend) {
        return {
            processed: false,
            reason: rateLimitCheck.reason,
        };
    }

    // Layer 2: Pick ONE message, oldest first (sequential processing)
    const now = new Date();
    const pendingMessage = await prisma.whatsappLog.findFirst({
        where: {
            status: "pending",
            scheduled_at: { lte: now },
            attempt_count: { lt: MAX_RETRY_ATTEMPTS },
        },
        orderBy: { scheduled_at: "asc" },
    });

    if (!pendingMessage) {
        return { processed: false, reason: "Tidak ada pesan dalam antrian" };
    }

    // Check retry delay for previously failed messages
    if (
        pendingMessage.attempt_count > 0 &&
        pendingMessage.failed_at
    ) {
        const retryAfter = new Date(
            pendingMessage.failed_at.getTime() + RETRY_DELAY_MINUTES * 60 * 1000
        );
        if (now < retryAfter) {
            return {
                processed: false,
                reason: `Menunggu jeda retry ${RETRY_DELAY_MINUTES} menit`,
            };
        }
    }

    // Layer 5: Re-check number block status
    const blocked = await isNumberBlocked(pendingMessage.phone);
    if (blocked) {
        await prisma.whatsappLog.update({
            where: { id: pendingMessage.id },
            data: {
                status: "blocked",
                error_message: "Nomor diblokir: gagal berulang",
                updated_at: now,
            },
        });
        return {
            processed: true,
            logId: pendingMessage.id,
            status: "blocked",
            reason: "Nomor bermasalah",
        };
    }

    // Mark as processing
    await prisma.whatsappLog.update({
        where: { id: pendingMessage.id },
        data: {
            status: "processing",
            attempt_count: { increment: 1 },
            updated_at: now,
        },
    });

    // Layer 3: Add random jitter delay before sending
    await waitRandomDelay();

    try {
        // SEND via Wablas
        const result = await sendMessage({
            phone: pendingMessage.phone,
            message: pendingMessage.message_content || "",
        });

        if (result.status) {
            // SUCCESS — Update log and flags
            await prisma.whatsappLog.update({
                where: { id: pendingMessage.id },
                data: {
                    status: "sent",
                    sent_at: new Date(),
                    response_data: JSON.stringify(result.data),
                    updated_at: new Date(),
                },
            });

            // Update Pendaftar notification flags (Layer 1)
            if (pendingMessage.pendaftar_id) {
                await updateNotifFlag(
                    pendingMessage.pendaftar_id,
                    pendingMessage.jenis_notif as NotifType
                );
            }

            // Update cooldown counters
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

            console.log(`✅ [Sent] ${pendingMessage.jenis_notif} to ${pendingMessage.phone}`);

            return {
                processed: true,
                logId: pendingMessage.id,
                status: "sent",
            };
        } else {
            // FAILED — Wablas returned error
            await prisma.whatsappLog.update({
                where: { id: pendingMessage.id },
                data: {
                    status:
                        pendingMessage.attempt_count + 1 >= MAX_RETRY_ATTEMPTS
                            ? "failed"
                            : "pending",
                    failed_at: new Date(),
                    error_message: result.message,
                    response_data: JSON.stringify(result),
                    updated_at: new Date(),
                },
            });

            console.error(
                `❌ [Failed] ${pendingMessage.jenis_notif} to ${pendingMessage.phone}: ${result.message}`
            );

            return {
                processed: true,
                logId: pendingMessage.id,
                status: "failed",
                reason: result.message,
            };
        }
    } catch (error: any) {
        // NETWORK ERROR
        await prisma.whatsappLog.update({
            where: { id: pendingMessage.id },
            data: {
                status:
                    pendingMessage.attempt_count + 1 >= MAX_RETRY_ATTEMPTS
                        ? "failed"
                        : "pending",
                failed_at: new Date(),
                error_message: error.message,
                updated_at: new Date(),
            },
        });

        console.error(
            `❌ [Error] ${pendingMessage.jenis_notif} to ${pendingMessage.phone}: ${error.message}`
        );

        return {
            processed: true,
            logId: pendingMessage.id,
            status: "error",
            reason: error.message,
        };
    }
}

// ============================================================================
// HELPER: Update notification flag on Pendaftar
// ============================================================================

async function updateNotifFlag(
    pendaftarId: string,
    jenisNotif: NotifType
): Promise<void> {
    // Map Both types to the same DB column to prevent duplicate sending (if they got one, don't send the other)
    const flagMap: Partial<Record<NotifType, string>> = {
        jadwal_belum: "notif_belum_jadwal_terkirim",
        jadwal_tersedia: "notif_jadwal_tersedia_terkirim",
        jadwal_langsung_tersedia: "notif_jadwal_tersedia_terkirim",
        hasil_tes: "notif_hasil_tes_terkirim",
    };

    const flagColumn = flagMap[jenisNotif];
    if (!flagColumn) return; // konfirmasi_jadwal and reminder_h1 don't have persistent flags

    try {
        await prisma.pendaftar.update({
            where: { id: pendaftarId },
            data: { [flagColumn]: true },
        });
        console.log(
            `🏷️ [Flag] Set ${flagColumn} = true for ${pendaftarId}`
        );
    } catch (e) {
        console.error(`Failed to update flag ${flagColumn}:`, e);
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

export function buildMessageRegistrationSuccess(
    nama: string,
    nomor_pendaftaran: string,
    jenjang: string
): string {
    const jenjangStr = jenjang === 'MTs' ? 'Madrasah Tsanawiyah (MTs)' : "I'dad Lughowi (Setara SMA)";
    return `🎉 *Pendaftaran Berhasil!*

Assalamu'alaikum ${nama},

Alhamdulillah, pendaftaran Anda di Pesantren Sistem PPDB Modern telah berhasil!

📋 *Detail Pendaftaran:*
• Nomor Pendaftaran: ${nomor_pendaftaran}
• Jenjang: ${jenjangStr}
• Nama: ${nama}

📝 *Langkah Selanjutnya:*
1. Login ke dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar
   *(Gunakan Nomor Pendaftaran & NIK untuk Login)*
2. Lakukan Pembayaran Pendaftaran (Transfer)
3. Lengkapi biodata & upload dokumen (setelah pembayaran diverifikasi)

💡 *Butuh Bantuan?*
Hubungi kami di 0851-1152-4441

Jazakumullahu khairan,
Panitia PPDB Sistem PPDB Modern`;
}

export function buildMessageDocumentVerified(nama: string, dokumenList: string): string {
    return `✅ *Dokumen Diverifikasi*

Assalamu'alaikum ${nama},

Alhamdulillah, dokumen Anda telah diverifikasi dan *DITERIMA*.

📄 *Dokumen yang Diverifikasi:*
${dokumenList}

📝 *Langkah Selanjutnya:*
Silakan pilih jadwal tes masuk melalui dashboard Anda (Menu Jadwal Ujian).

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
Panitia PPDB Sistem PPDB Modern`;
}

export function buildMessageDocumentRejected(nama: string, dokumenList: string, catatan: string): string {
    return `❌ *Dokumen Perlu Diperbaiki*

Assalamu'alaikum ${nama},

Mohon maaf, dokumen Anda perlu diperbaiki.

📄 *Dokumen yang Ditolak:*
${dokumenList}

📝 *Catatan:*
${catatan}

🔄 *Langkah Selanjutnya:*
1. Login ke dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/upload-berkas
2. Upload ulang dokumen yang ditolak
3. Pastikan dokumen jelas dan sesuai ketentuan

💡 *Butuh Bantuan?*
Hubungi kami di 0851-1152-4441

Jazakumullahu khairan,
Panitia PPDB Sistem PPDB Modern`;
}

export function buildMessagePaymentVerified(nama: string, jumlah: string, metode: string, tanggal: string): string {
    return `✅ *Pembayaran Diterima*

Assalamu'alaikum ${nama},

Alhamdulillah, pembayaran Anda telah kami terima dan verifikasi.

💰 *Detail Pembayaran:*
* Jumlah: ${jumlah}
* Metode: ${metode}
* Tanggal: ${tanggal}

📝 *Langkah Selanjutnya:*
Silakan login ke dashboard untuk melengkapi Data Santri & Upload Berkas.
Setelah data lengkap, Anda bisa memilih jadwal tes.

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/kelengkapan-berkas

Jazakumullahu khairan,
Panitia PPDB Sistem PPDB Modern`;
}

export function buildMessagePaymentRejected(nama: string, catatan: string): string {
    return `❌ *Pembayaran Perlu Diperbaiki*

Assalamu'alaikum ${nama},

Mohon maaf, bukti pembayaran Anda perlu diperbaiki.

📝 *Catatan:*
${catatan}

🔄 *Langkah Selanjutnya:*
1. Login ke dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/pembayaran-pendaftaran
2. Upload ulang bukti pembayaran yang jelas
3. Pastikan nominal dan rekening tujuan sesuai

💡 *Butuh Bantuan?*
Hubungi kami di 0851-1152-4441

Jazakumullahu khairan,
Panitia PPDB Sistem PPDB Modern`;
}

export function buildMessageJadwalBelum(nama: string): string {
    return `${pickOpening()} ${nama},

Terima kasih telah mendaftar di Pesantren Sistem PPDB Modern.

Saat ini jadwal tes lanjutan (Tes Al-Qur'an, Wawancara Calsan, dan Wawancara Cawalsan Santri) belum tersedia. Mohon bersabar, kami akan menginformasikan kembali begitu jadwal sudah siap.

Untuk sementara, Anda sudah bisa mengerjakan tes online yang tersedia di dashboard:
- Kemampuan Dasar Akademik
- Identifikasi Kepribadian
- Tes Kesiapan

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://demo-ppdb.vercel.app'}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
Panitia PPDB PPDB`;
}

export function buildMessageJadwalTersedia(nama: string): string {
    return `${pickOpening()} ${nama},

Alhamdulillah, jadwal tes lanjutan sudah tersedia!

Silakan login ke dashboard dan pilih jadwal yang sesuai untuk:
- Tes Al-Qur'an
- Wawancara Calsan
- Wawancara Cawalsan

Segera pilih jadwal sebelum kuota penuh.

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://demo-ppdb.vercel.app'}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
Panitia PPDB PPDB`;
}

export function buildMessageJadwalLangsungTersedia(nama: string): string {
    return `${pickOpening()} ${nama},

Terima kasih telah mencapai tahap Seleksi Pesantren Sistem PPDB Modern.

Saat ini **jadwal tes lanjutan sudah tersedia dan bisa langsung Anda pilih**.

Silakan login ke dashboard dan pilih sesi jadwal untuk:
- Tes Al-Qur'an
- Wawancara Calsan
- Wawancara Cawalsan

Harap segera memilih jadwal sebelum rentang waktu habis atau kuota penuh. Jangan lupa juga untuk menyelesaikan Tes Online (Akademik & Kepribadian).

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
Panitia PPDB PPDB`;
}

export function buildMessageKonfirmasiJadwal(
    nama: string,
    tanggal: string,
    waktu: string,
    lokasi: string,
    jenisUjian: string
): string {
    return `${pickOpening()} ${nama},

Jadwal ${jenisUjian} Anda telah terkonfirmasi:

Tanggal: ${tanggal}
Waktu: ${waktu} WIB
Tempat: ${lokasi}

Persiapan:
- Hadir 30 menit sebelum waktu tes
- Berpakaian sopan dan rapi
- Bawa alat tulis

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://demo-ppdb.vercel.app'}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
Panitia PPDB PPDB`;
}

export function buildMessageReminderH1(
    nama: string,
    tanggal: string,
    waktu: string,
    lokasi: string,
    jenisUjian: string
): string {
    return `${pickOpening()} ${nama},

Pengingat jadwal ${jenisUjian} Anda:

📋 *${jenisUjian}*
📅 Tanggal: ${tanggal}
⏰ Waktu: ${waktu} WIB
📍 Tempat/Link: ${lokasi}

Mohon hadir tepat waktu dan persiapkan diri dengan baik. Semoga dimudahkan dan diberkahi.

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://demo-ppdb.vercel.app'}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
Panitia PPDB PPDB`;
}

export function buildMessageReminderH0(
    nama: string,
    waktu: string,
    lokasi: string,
    jenisUjian: string
): string {
    return `${pickOpening()} ${nama},

⏰ *PENGINGAT: ${jenisUjian} dimulai 1 jam lagi!*

🕐 Waktu: ${waktu} WIB
📍 Tempat/Link: ${lokasi}

Mohon segera bersiap. Pastikan koneksi internet stabil jika ujian dilakukan secara online.

Semoga dimudahkan dan diberkahi.

Jazakumullahu khairan,
Panitia PPDB PPDB`;
}

export function buildMessageHasilTes(nama: string): string {
    return `${pickOpening()}, *${nama}*.
 
 Alhamdulillah, hasil tes seleksi Ananda sudah tersedia.
 
 Silakan login ke dashboard untuk melihat hasil lengkap dan mengunduh *Surat Keterangan Lulus (SKL)* dalam format PDF.
 
 🔗 *Dashboard & Unduh Surat:*
 ${process.env.NEXT_PUBLIC_APP_URL || 'https://demo-ppdb.vercel.app'}/dashboard/pendaftar/pengumuman
 
 Jazakumullahu khairan.
 Panitia PPDB Demo Sistem PPDB Modern`;
}

/**
 * Build Message for Interviewer/Penguji
 */
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
    const opening = pickOpening();
    let msg = `${opening} ${title} ${namaInterviewer},
 
 Informasikan jadwal ${jenisUjian} baru untuk santri berikut:
 
 Nama Santri: ${namaSantri}
 Tanggal: ${tanggal}
 Waktu: ${waktu} WIB
 Tempat: ${lokasi}`;

    if (inputNilaiLink) {
        msg += `\n\n🔗 *Input Hasil:* ${inputNilaiLink}\n(PIN: 4 digit terakhir No. HP Anda)`;
    }

    msg += `\n\nMohon untuk bersiap di ruangan virtual/fisik tepat waktu. Syukran.
 
 Panitia PPDB PPDB`;
    return msg;
}

// ============================================================================
// UTILITY: Get queue stats
// ============================================================================

export async function getQueueStats() {
    const [pending, processing, sent, failed, blocked] = await Promise.all([
        prisma.whatsappLog.count({ where: { status: "pending" } }),
        prisma.whatsappLog.count({ where: { status: "processing" } }),
        prisma.whatsappLog.count({ where: { status: "sent" } }),
        prisma.whatsappLog.count({ where: { status: "failed" } }),
        prisma.whatsappLog.count({ where: { status: "blocked" } }),
    ]);

    const cooldown = await prisma.whatsappCooldown.findUnique({
        where: { id: "global" },
    });

    return {
        queue: { pending, processing, sent, failed, blocked },
        cooldown: cooldown
            ? {
                hourlyCount: cooldown.hourly_count,
                maxPerHour: MAX_MESSAGES_PER_HOUR,
                cooldownUntil: cooldown.cooldown_until,
                lastSentAt: cooldown.last_sent_at,
            }
            : null,
    };
}

/**
 * Template: Pengingat H-1 untuk Santri (H-1 Pukul 20.00 WIB)
 */
export function buildMessageReminderH1Santri(
    nama: string,
    hari: string,
    tanggal: string,
    jam: string,
    lokasi: string,
    jenisUjian: string
): string {
    // Robust deduplication for Time - remove any existing WIB and ensure single WIB at end
    let cleanJam = (jam || "").replace(/\s*WIB\s*/gi, " ").trim();
    cleanJam = cleanJam.replace(/\s+/g, " "); // collapse multiple spaces
    const finalJam = `${cleanJam} WIB`;

    // Robust deduplication for Day - handle various formats
    let cleanTanggal = (tanggal || "").trim();
    // Remove day name if it appears at the start (case insensitive, with or without comma)
    if (hari) {
        const dayPattern = new RegExp(`^${hari}\\s*,?\\s*`, "i");
        cleanTanggal = cleanTanggal.replace(dayPattern, "");
    }
    // Also remove any day name pattern at the start (e.g., "Kamis, ")
    cleanTanggal = cleanTanggal.replace(/^(?:senin|selasa|rabu|kamis|jumat|sabtu|ahad|minggu)\s*,?\s*/i, "");

    const finalHariTanggal = `${hari}, ${cleanTanggal}`;

    return `*PENGINGAT UJIAN SELEKSI*

Assalamu'alaikum *${nama}*,

Ini adalah pengingat bahwa Anda dijadwalkan mengikuti *${jenisUjian}* pada:

📅 *Hari/Tanggal:* ${finalHariTanggal}
⏰ *Waktu:* ${finalJam}
📍 *Lokasi/Link:* ${lokasi}

Mohon persiapkan diri dengan baik dan pastikan koneksi internet stabil jika ujian online. Sampai jumpa!

---
*Panitia PPDB Sistem PPDB Modern*`;
}

/**
 * Template: Pengingat H-1 untuk Penguji (H-1 Pukul 20.00 WIB)
 */
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
    const isWawancara = jenisUjian.toLowerCase().includes("wawancara");

    // Robust deduplication for Time - remove any existing WIB and ensure single WIB at end
    let cleanJam = (jam || "").replace(/\s*WIB\s*/gi, " ").trim();
    cleanJam = cleanJam.replace(/\s+/g, " "); // collapse multiple spaces
    const finalJam = `${cleanJam} WIB`;

    // Robust deduplication for Day - handle various formats
    let cleanTanggal = (tanggal || "").trim();
    // Remove day name if it appears at the start (case insensitive, with or without comma)
    if (hari) {
        const dayPattern = new RegExp(`^${hari}\\s*,?\\s*`, "i");
        cleanTanggal = cleanTanggal.replace(dayPattern, "");
    }
    // Also remove any day name pattern at the start (e.g., "Kamis, ")
    cleanTanggal = cleanTanggal.replace(/^(?:senin|selasa|rabu|kamis|jumat|sabtu|ahad|minggu)\s*,?\s*/i, "");

    const finalHariTanggal = `${hari}, ${cleanTanggal}`;

    const templateTitle = isWawancara ? "*REMINDER JADWAL WAWANCARA*" : "*REMINDER JADWAL MENGUJI*";
    const agendaText = isWawancara ? "Wawancara Calon Santri / Ortu" : jenisUjian;

    return `${templateTitle}

Assalamu'alaikum ${title} *${namaPenguji}*,

Mengingatkan jadwal ${isWawancara ? "wawancara" : "menguji"} Anda:

📝 *Agenda:* ${agendaText}
👤 *Nama Santri:* ${namaSantri}
📅 *Hari/Tanggal:* ${finalHariTanggal}    
⏰ *Waktu:* ${finalJam}
📍 *Link Meet:* ${lokasi}
🔗 *Input Hasil:* ${inputNilaiLink || "-"}

Mohon kehadirannya tepat waktu. Syukron.

---
*Sistem PPDB Sistem PPDB Modern*`;
}

export function buildMessagePembatalanJadwal(
    namaSantri: string,
    jenisUjian: string,
    tanggal: string,
    jam: string,
    alasan: string = "Ustadz Berhalangan Hadir"
): string {
    return `*PEMBATALAN JADWAL UJIAN*

Assalamu'alaikum *${namaSantri}*,

Kami menginformasikan bahwa jadwal *${jenisUjian}* Anda pada:

📅 *Tanggal:* ${tanggal}
⏰ *Waktu:* ${jam} WIB

Telah *DIBATALKAN* oleh Penguji karena alasan: *${alasan}*.

Mohon segera login ke Dashboard PPDB untuk memilih kembali jadwal pengganti yang tersedia di menu Undangan Seleksi.

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://demo-ppdb.vercel.app'}/dashboard/pendaftar/undangan-seleksi

---
*Panitia PPDB Sistem PPDB Modern*`;
}
