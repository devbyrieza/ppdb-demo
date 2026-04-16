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

Alhamdulillah, pendaftaran Anda di Pesantren Al-Andalus Demo telah berhasil!

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
    return `${pickOpening()} ${nama},

Terima kasih telah mendaftar di Pesantren Al-Andalus Demo.

Saat ini jadwal tes lanjutan (Tes Al-Qur'an, Wawancara Calsan, dan Wawancara Cawalsan Santri) belum tersedia. Mohon bersabar, kami akan menginformasikan kembali begitu jadwal sudah siap.

Untuk sementara, Anda sudah bisa mengerjakan tes online yang tersedia di dashboard:
- Kemampuan Dasar Akademik
- Identifikasi Kepribadian
- Tes Kesiapan

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
Panitia PPDB Al-Andalus Demo`;
}

export function buildMessageJadwalTersedia(nama: string): string {
    return `${pickOpening()} ${nama},
  
Alhamdulillah, jadwal tes lanjutan sudah tersedia!
  
Silakan login ke dashboard dan pilih jadwal yang sesuai untuk:
- Tes Al-Qur'an
- Wawancara Calsan
- Wawancara Cawalsan
  
Segera pilih jadwal sebelum kuota penuh.
  
Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi
  
Jazakumullahu khairan,
Panitia PPDB Al-Andalus Demo`;
}

export function buildMessageJadwalLangsungTersedia(nama: string): string {
    return `${pickOpening()} ${nama},
  
Terima kasih telah mencapai tahap Seleksi Pesantren Al-Andalus Demo.
  
Saat ini **jadwal tes lanjutan sudah tersedia dan bisa langsung Anda pilih**.
  
Silakan login ke dashboard dan pilih sesi jadwal untuk:
- Tes Al-Qur'an
- Wawancara Calsan
- Wawancara Cawalsan
  
Harap segera memilih jadwal sebelum rentang waktu habis atau kuota penuh. Jangan lupa juga untuk menyelesaikan Tes Online (Akademik & Kepribadian).
  
Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi
  
Jazakumullahu khairan,
Panitia PPDB Al-Andalus Demo`;
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

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
Panitia PPDB Al-Andalus Demo`;
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

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

Jazakumullahu khairan,
Panitia PPDB Al-Andalus Demo`;
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
Panitia PPDB Al-Andalus Demo`;
}

export function buildMessageHasilTes(nama: string): string {
    return `${pickOpening()} ${nama},
 
 Alhamdulillah, hasil tes seleksi Anda sudah tersedia.
 
 Silakan login ke dashboard untuk melihat hasil lengkap Anda.
 
 Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/pengumuman
 
 Jazakumullahu khairan,
 Panitia PPDB Al-Andalus Demo`;
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
 
 Panitia PPDB Al-Andalus Demo`;
    return msg;
}

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

Assalamu'alaikum *${namaSantri}*,

Kami menginformasikan bahwa jadwal *${jenisUjian}* Anda pada:

📅 *Tanggal:* ${tanggal}
⏰ *Waktu:* ${jam} WIB

Telah *DIBATALKAN* oleh Penguji karena alasan: *${alasan}*.

Mohon segera login ke Dashboard PPDB untuk memilih kembali jadwal pengganti yang tersedia di menu Undangan Seleksi.

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL}/dashboard/pendaftar/undangan-seleksi

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
