/**
 * Wablas WhatsApp API Service
 * 
 * This service handles all WhatsApp notifications via Wablas API
 * Documentation: https://wablas.com/docs
 */

// Types
export interface WablasResponse {
    status: boolean;
    message: string;
    data?: any;
}

export interface SendMessageParams {
    phone: string;
    message: string;
}

export interface SendTemplateParams {
    phone: string;
    templateId: string;
    variables?: Record<string, string>;
}

// Configuration
const WABLAS_DOMAIN = process.env.WABLAS_DOMAIN || '';
const WABLAS_TOKEN = process.env.WABLAS_TOKEN || '';
const WABLAS_SECRET_KEY = process.env.WABLAS_SECRET_KEY || '';

if (!WABLAS_DOMAIN || !WABLAS_TOKEN) {
    console.warn('⚠️ Wablas credentials not configured. WhatsApp notifications will be disabled.');
}

/**
 * Format phone number to international format
 * Input: 081234567890 or +6281234567890
 * Output: 6281234567890
 */
function formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 62
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }

    // If doesn't start with 62, add it
    if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }

    return cleaned;
}

/**
 * Send a simple text message via Wablas
 */
export async function sendMessage({ phone, message }: SendMessageParams): Promise<WablasResponse> {
    if (!WABLAS_DOMAIN || !WABLAS_TOKEN) {
        console.error('Wablas not configured');
        return { status: false, message: 'Wablas not configured' };
    }

    try {
        const formattedPhone = formatPhoneNumber(phone);

        // Ensure domain has protocol
        const domain = WABLAS_DOMAIN.startsWith('http') ? WABLAS_DOMAIN : `https://${WABLAS_DOMAIN}`;

        // Wablas API - POST with Authorization header: token.secret_key
        const url = `${domain}/api/send-message`;

        // Build Authorization header with token and secret key
        const authToken = WABLAS_SECRET_KEY
            ? `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`
            : WABLAS_TOKEN;

        // Build form data for POST body
        const formData = new URLSearchParams();
        formData.append('phone', formattedPhone);
        formData.append('message', message);

        console.log(`📡 Sending Wablas to ${formattedPhone} via ${WABLAS_DOMAIN}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        const rawText = await response.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            console.error('❌ Wablas Non-JSON Response:', rawText);
            return { status: false, message: `Wablas Error: ${response.status} ${response.statusText}` };
        }

        if (!response.ok || !data.status) {
            console.error('❌ Wablas API Error:', data);
            return { status: false, message: data.message || `Wablas Failed: ${response.status}` };
        }

        return { status: true, message: 'Message sent successfully', data };
    } catch (error: any) {
        console.error('❌ Wablas Network Error:', error);
        return { status: false, message: `Network Error: ${error.message}` };
    }
}

/**
 * Send message using template (for consistent formatting)
 */
export async function sendTemplate({ phone, templateId, variables = {} }: SendTemplateParams): Promise<WablasResponse> {
    const template = TEMPLATES[templateId];

    if (!template) {
        console.error(`Template ${templateId} not found`);
        return { status: false, message: 'Template not found' };
    }

    // Replace variables in template
    let message = template;
    Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return sendMessage({ phone, message });
}

/**
 * Send broadcast message to multiple recipients
 */
export async function sendBroadcast(phones: string[], message: string): Promise<WablasResponse[]> {
    const results = await Promise.all(
        phones.map(phone => sendMessage({ phone, message }))
    );

    return results;
}

// ============================================
// MESSAGE TEMPLATES
// ============================================

const TEMPLATES: Record<string, string> = {
    // Pendaftaran berhasil
    'registration_success': `🎉 *Pendaftaran Berhasil!*

Assalamu'alaikum {{nama}},

Alhamdulillah, pendaftaran Anda di Pesantren Al-Andalus Ulul Albaab telah berhasil!

📋 *Detail Pendaftaran:*
• Nomor Pendaftaran: {{nomor_pendaftaran}}
• Jenjang: {{jenjang}}
• Nama: {{nama}}

📝 *Langkah Selanjutnya:*
1. Login ke dashboard: {{dashboard_url}}
   *(Gunakan Nomor Pendaftaran & NIK untuk Login)*
2. Lakukan Pembayaran Pendaftaran (Transfer)
3. Lengkapi biodata & upload dokumen (setelah pembayaran diverifikasi)

💡 *Butuh Bantuan?*
Hubungi kami di {{kontak}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Dokumen diverifikasi - Approved
    'document_verified': `✅ *Dokumen Diverifikasi*

Assalamu'alaikum {{nama}},

Alhamdulillah, dokumen Anda telah diverifikasi dan *DITERIMA*.

📄 *Dokumen yang Diverifikasi:*
{{dokumen_list}}

📝 *Langkah Selanjutnya:*
Silakan pilih jadwal tes masuk melalui dashboard Anda (Menu Jadwal Ujian).

Dashboard: {{dashboard_url}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Dokumen ditolak
    'document_rejected': `❌ *Dokumen Perlu Diperbaiki*

Assalamu'alaikum {{nama}},

Mohon maaf, dokumen Anda perlu diperbaiki.

📄 *Dokumen yang Ditolak:*
{{dokumen_list}}

📝 *Catatan:*
{{catatan}}

🔄 *Langkah Selanjutnya:*
1. Login ke dashboard: {{dashboard_url}}
2. Upload ulang dokumen yang ditolak
3. Pastikan dokumen jelas dan sesuai ketentuan

💡 *Butuh Bantuan?*
Hubungi kami di {{kontak}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Pembayaran diverifikasi - Approved
    'payment_verified': `✅ *Pembayaran Diterima*

Assalamu'alaikum {{nama}},

Alhamdulillah, pembayaran Anda telah kami terima dan verifikasi.

💰 *Detail Pembayaran:*
* Jumlah: {{jumlah}}
* Metode: {{metode}}
* Tanggal: {{tanggal}}

📝 *Langkah Selanjutnya:*
Silakan login ke dashboard untuk melengkapi Data Santri & Upload Berkas.
Setelah data lengkap, Anda bisa memilih jadwal tes.

Dashboard: {{dashboard_url}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Pembayaran ditolak
    'payment_rejected': `❌ *Pembayaran Perlu Diperbaiki*

Assalamu'alaikum {{nama}},

Mohon maaf, bukti pembayaran Anda perlu diperbaiki.

📝 *Catatan:*
{{catatan}}

🔄 *Langkah Selanjutnya:*
1. Login ke dashboard: {{dashboard_url}}
2. Upload ulang bukti pembayaran yang jelas
3. Pastikan nominal dan rekening tujuan sesuai

💡 *Butuh Bantuan?*
Hubungi kami di {{kontak}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Reminder deadline
    'deadline_reminder': `⏰ *Pengingat Deadline*

Assalamu'alaikum {{nama}},

Ini adalah pengingat bahwa deadline {{jenis_deadline}} akan berakhir pada:

📅 *{{tanggal_deadline}}*

📝 *Status Anda:*
{{status}}

🔄 *Yang Perlu Dilakukan:*
{{action_needed}}

Dashboard: {{dashboard_url}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Jadwal tes masuk
    'test_schedule': `📅 *Jadwal Tes Masuk*

Assalamu'alaikum {{nama}},

Berikut jadwal tes masuk Anda:

📅 *Tanggal:* {{tanggal}}
🕐 *Waktu:* {{waktu}}
📍 *Tempat:* {{tempat}}

📝 *Persiapan:*
• Kartu peserta (download di dashboard)
• Alat tulis

⚠️ *Penting:*
• Hadir 30 menit sebelum tes
• Berpakaian sopan dan rapi
• Berdoa dan persiapkan diri

Dashboard: {{dashboard_url}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Pengumuman kelulusan - Diterima
    'announcement_accepted': `🎉 *SELAMAT! Anda DITERIMA*

Assalamu'alaikum {{nama}},

Alhamdulillah, kami dengan senang hati mengumumkan bahwa Anda *DITERIMA* di Pesantren Al-Andalus Ulul Albaab!

📋 *Detail:*
• Jenjang: {{jenjang}}
• Tahun Ajaran: {{tahun_ajaran}}

📝 *Langkah Selanjutnya:*
1. Daftar ulang (info di dashboard)
2. Persiapan masuk pesantren
3. Orientasi santri baru

Dashboard: {{dashboard_url}}

Selamat bergabung di keluarga besar Ulul Albaab! 🎓

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Pengumuman kelulusan - Cadangan
    'announcement_reserve': `📋 *PENGUMUMAN HASIL SELEKSI*

Assalamu'alaikum {{nama}},

Berdasarkan hasil seleksi PPDB Pesantren Al-Andalus Ulul Albaab, kami informasikan bahwa Anda dinyatakan *CADANGAN*.

📋 *Detail:*
• Jenjang: {{jenjang}}
• Tahun Ajaran: {{tahun_ajaran}}

📝 *Informasi Selanjutnya:*
Anda berada dalam daftar cadangan. Kami akan menghubungi Anda jika ada kuota yang tersedia.
Pantau terus dashboard Anda untuk update terbaru.

Dashboard: {{dashboard_url}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Pengumuman kelulusan - Ditolak
    'announcement_rejected': `📋 *PENGUMUMAN HASIL SELEKSI*

Assalamu'alaikum {{nama}},

Berdasarkan hasil seleksi PPDB Pesantren Al-Andalus Ulul Albaab, kami informasikan bahwa Anda *BELUM DITERIMA* pada periode ini.

📋 *Detail:*
• Jenjang: {{jenjang}}
• Tahun Ajaran: {{tahun_ajaran}}

Kami mengapresiasi semangat dan usaha Anda. Semoga dimudahkan jalannya untuk menuntut ilmu di manapun.

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Google Form Link
    'google_form_link': `📝 *LINK FORMULIR TAMBAHAN*

Assalamu'alaikum {{nama}},

Silakan lengkapi formulir berikut sebagai kelengkapan data {{keterangan}}:

🔗 *Link Formulir:*
{{form_link}}

⏰ *Batas Waktu:* {{batas_waktu}}

Pastikan mengisi dengan data yang benar dan lengkap.

Dashboard: {{dashboard_url}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Zoom/Online Meeting Link
    'zoom_meeting': `🎥 *UNDANGAN TES ONLINE*

Assalamu'alaikum {{nama}},

Berikut jadwal {{jenis_ujian}} secara online:

📅 *Tanggal:* {{tanggal}}
🕐 *Waktu:* {{waktu}}
🔗 *Link Zoom:* {{zoom_link}}

📝 *Persiapan:*
• Pastikan koneksi internet stabil
• Gunakan perangkat dengan kamera dan mikrofon
• Bergabung 10 menit sebelum waktu tes
• Berpakaian sopan dan rapi

Dashboard: {{dashboard_url}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Data Lengkap -> Unlock Upload Berkas
    'data_complete': `✅ *DATA LENGKAP*

Assalamu'alaikum {{nama}},

Alhamdulillah, data diri Anda sudah lengkap.

🔓 *Tahap Selanjutnya Terbuka:*
Anda sekarang bisa melanjutkan ke tahap *Upload Berkas*.

Silakan login ke dashboard dan unggah dokumen yang diperlukan (KK, Akta, dll).

Dashboard: {{dashboard_url}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,

    // Semua Ujian Selesai
    'all_exams_complete': `🎉 *RANGKAIAN SELEKSI SELESAI*

Assalamu'alaikum {{nama}},

Alhamdulillah, Anda telah menyelesaikan seluruh rangkaian ujian/seleksi masuk Pesantren Al-Andalus Ulul Albaab.

🔐 *Status Terkini:*
Halaman Pengumuman Hasil Seleksi kini telah terbuka di dashboard Anda.

⚠️ *Catatan:*
Pengumuman kelulusan belum tersedia saat ini. Mohon menunggu update selanjutnya dari panitia. Kami akan mengirimkan notifikasi saat hasil seleksi diumumkan.

Dashboard: {{dashboard_url}}

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`,
};

// ============================================
// NOTIFICATION HELPERS
// ============================================

/**
 * Send registration success notification
 */
export async function notifyRegistrationSuccess(data: {
    phone: string;
    nama: string;
    nomor_pendaftaran: string;
    jenjang: string;
}) {
    return sendTemplate({
        phone: data.phone,
        templateId: 'registration_success',
        variables: {
            nama: data.nama,
            nomor_pendaftaran: data.nomor_pendaftaran,
            jenjang: data.jenjang === 'MTs' ? 'Madrasah Tsanawiyah (MTs)' : "I'dad Lughowi (Setara SMA)",
            dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/dashboard/pendaftar`,
            kontak: '0888-0993-4970',
        },
    });
}

/**
 * Send document verification notification
 */
export async function notifyDocumentVerified(data: {
    phone: string;
    nama: string;
    dokumen_list: string;
    status: 'verified' | 'rejected';
    catatan?: string;
}) {
    const templateId = data.status === 'verified' ? 'document_verified' : 'document_rejected';

    return sendTemplate({
        phone: data.phone,
        templateId,
        variables: {
            nama: data.nama,
            dokumen_list: data.dokumen_list,
            catatan: data.catatan || '',
            dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/dashboard/pendaftar/${data.status === 'verified' ? 'undangan-seleksi' : 'upload-berkas'}`,
            kontak: '0888-0993-4970',
        },
    });
}

/**
 * Send payment verification notification
 */
export async function notifyPaymentVerified(data: {
    phone: string;
    nama: string;
    jumlah: string;
    metode: string;
    tanggal: string;
    status: 'verified' | 'rejected';
    catatan?: string;
}) {
    const templateId = data.status === 'verified' ? 'payment_verified' : 'payment_rejected';

    return sendTemplate({
        phone: data.phone,
        templateId,
        variables: {
            nama: data.nama,
            jumlah: data.jumlah,
            metode: data.metode,
            tanggal: data.tanggal,
            catatan: data.catatan || '',
            dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/dashboard/pendaftar/${data.status === 'verified' ? 'kelengkapan-berkas' : 'pembayaran-pendaftaran'}`,
            kontak: '0888-0993-4970',
        },
    });
}

/**
 * Send deadline reminder
 */
export async function notifyDeadlineReminder(data: {
    phone: string;
    nama: string;
    jenis_deadline: string;
    tanggal_deadline: string;
    status: string;
    action_needed: string;
}) {
    return sendTemplate({
        phone: data.phone,
        templateId: 'deadline_reminder',
        variables: data,
    });
}

/**
 * Send test schedule notification
 */
export async function notifyTestSchedule(data: {
    phone: string;
    nama: string;
    tanggal: string;
    waktu: string;
    tempat: string;
    meeting_link?: string;
}) {
    let message = TEMPLATES['test_schedule'];

    // Replace standard variables
    const variables = {
        nama: data.nama,
        tanggal: data.tanggal,
        waktu: data.waktu,
        tempat: data.tempat,
        dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/dashboard/pendaftar/undangan-seleksi`,
    };

    Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    // Append meeting link if available
    if (data.meeting_link) {
        message = message.replace(
            /📍 \*Tempat:\* .*/,
            `📍 *Tempat:* ${data.tempat}\n🔗 *Link Meeting:* ${data.meeting_link}`
        );
        // Fallback if regex fails or just append
        if (!message.includes(data.meeting_link)) {
            message += `\n\n🔗 *Link Meeting:* ${data.meeting_link}`;
        }
    }

    return sendMessage({
        phone: data.phone,
        message,
    });
}

/**
 * Send announcement notification (supports all 3 statuses)
 */
export async function notifyStatusChange(data: {
    phone: string;
    nama: string;
    status: 'accepted' | 'reserve' | 'rejected';
    jenjang?: string;
    tahun_ajaran?: string;
    dashboard_url?: string;
}) {
    const templateMap: Record<string, string> = {
        accepted: 'announcement_accepted',
        reserve: 'announcement_reserve',
        rejected: 'announcement_rejected',
    };

    const templateId = templateMap[data.status];
    if (!templateId) return { status: false, message: 'Template not found' };

    return sendTemplate({
        phone: data.phone,
        templateId,
        variables: {
            nama: data.nama,
            jenjang: data.jenjang || '-',
            tahun_ajaran: data.tahun_ajaran || '2025/2026',
            dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/dashboard/pendaftar/${data.status === 'accepted' ? 'daftar-ulang' : 'pengumuman'}`,
        },
    });
}

// ============================================
// DOCUMENT & LINK MESSAGE FUNCTIONS
// ============================================

/**
 * Kirim pesan WhatsApp dengan attachment dokumen (PDF/gambar)
 * Menggunakan Wablas send-document API
 */
export async function sendDocumentMessage(params: {
    phone: string;
    message: string;
    documentUrl: string;
}): Promise<WablasResponse> {
    if (!WABLAS_DOMAIN || !WABLAS_TOKEN) {
        console.error('Wablas not configured');
        return { status: false, message: 'Wablas not configured' };
    }

    try {
        const formattedPhone = formatPhoneNumber(params.phone);
        const domain = WABLAS_DOMAIN.startsWith('http') ? WABLAS_DOMAIN : `https://${WABLAS_DOMAIN}`;
        const url = `${domain}/api/send-document`;
        const authToken = WABLAS_SECRET_KEY
            ? `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`
            : WABLAS_TOKEN;

        const formData = new URLSearchParams();
        formData.append('phone', formattedPhone);
        formData.append('document', params.documentUrl);
        formData.append('caption', params.message);

        console.log(`📎 Sending document to ${formattedPhone} via Wablas`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        const rawText = await response.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch {
            console.error('❌ Wablas Non-JSON Response:', rawText);
            return { status: false, message: `Wablas Error: ${response.status}` };
        }

        if (!response.ok || !data.status) {
            console.error('❌ Wablas send-document Error:', data);
            return { status: false, message: data.message || 'Failed to send document' };
        }

        return { status: true, message: 'Document sent successfully', data };
    } catch (error: any) {
        console.error('❌ Wablas send-document Network Error:', error);
        return { status: false, message: `Network Error: ${error.message}` };
    }
}

/**
 * Kirim pesan WhatsApp dengan link/URL (misal Google Form)
 * Wablas akan auto-generate preview link
 */
export async function sendButtonMessage(params: {
    phone: string;
    message: string;
    buttonText: string;
    buttonUrl: string;
}): Promise<WablasResponse> {
    // Wablas tidak support button secara native di semua device,
    // jadi kita append link ke message sebagai fallback universal
    const fullMessage = `${params.message}\n\n🔗 *${params.buttonText}:*\n${params.buttonUrl}`;

    return sendMessage({
        phone: params.phone,
        message: fullMessage,
    });
}

// ============================================
// BLAST WITH QUEUE (Rate Limited)
// ============================================

export interface BlastRecipient {
    phone: string;
    nama: string;
}

export interface BlastResult {
    total: number;
    success: number;
    failed: number;
    errors: Array<{ phone: string; error: string }>;
}

/**
 * Blast pesan ke banyak penerima dengan rate limiter.
 * Delay default 2 detik antar pesan untuk menghindari ban.
 * 
 * @param params.recipients - Daftar penerima
 * @param params.messageBuilder - Function untuk build pesan per penerima
 * @param params.documentUrl - Opsional: URL dokumen lampiran (PDF surat keputusan)
 * @param params.buttonUrl - Opsional: URL link (Google Form)
 * @param params.buttonText - Opsional: Label untuk link
 * @param params.delayMs - Delay antar pesan (default: 2000ms)
 * @param params.onProgress - Callback progress
 */
export async function blastWithQueue(params: {
    recipients: BlastRecipient[];
    messageBuilder: (recipient: BlastRecipient) => string;
    documentUrl?: string;
    buttonUrl?: string;
    buttonText?: string;
    delayMs?: number;
    onProgress?: (sent: number, total: number) => void;
}): Promise<BlastResult> {
    const {
        recipients,
        messageBuilder,
        documentUrl,
        buttonUrl,
        buttonText,
        delayMs = 2000,
        onProgress,
    } = params;

    const result: BlastResult = {
        total: recipients.length,
        success: 0,
        failed: 0,
        errors: [],
    };

    console.log(`📢 Starting blast to ${recipients.length} recipients (delay: ${delayMs}ms)`);

    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        try {
            const message = messageBuilder(recipient);
            let response: WablasResponse;

            if (documentUrl) {
                // Kirim dokumen + pesan
                response = await sendDocumentMessage({
                    phone: recipient.phone,
                    message,
                    documentUrl,
                });
            } else if (buttonUrl && buttonText) {
                // Kirim pesan dengan link
                response = await sendButtonMessage({
                    phone: recipient.phone,
                    message,
                    buttonText,
                    buttonUrl,
                });
            } else {
                // Kirim pesan teks biasa
                response = await sendMessage({
                    phone: recipient.phone,
                    message,
                });
            }

            if (response.status) {
                result.success++;
            } else {
                result.failed++;
                result.errors.push({
                    phone: recipient.phone,
                    error: response.message,
                });
            }
        } catch (error: any) {
            result.failed++;
            result.errors.push({
                phone: recipient.phone,
                error: error.message || 'Unknown error',
            });
        }

        // Progress callback
        if (onProgress) {
            onProgress(i + 1, recipients.length);
        }

        // Delay antar pesan (kecuali pesan terakhir)
        if (i < recipients.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    console.log(`📢 Blast completed: ${result.success} success, ${result.failed} failed out of ${result.total}`);
    return result;
}

// ============================================
// SELECTION ANNOUNCEMENT HELPERS
// ============================================

/**
 * Kirim notifikasi pengumuman seleksi per santri
 */
export async function notifySelectionResult(data: {
    phone: string;
    nama: string;
    status: 'DITERIMA' | 'CADANGAN' | 'DITOLAK';
    jenjang?: string;
    tahun_ajaran?: string;
    suratPath?: string;
}) {
    const statusMap: Record<string, 'accepted' | 'reserve' | 'rejected'> = {
        DITERIMA: 'accepted',
        CADANGAN: 'reserve',
        DITOLAK: 'rejected',
    };

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/dashboard/pendaftar/${data.status === 'DITERIMA' ? 'daftar-ulang' : 'pengumuman'}`;

    // Kirim pesan notifikasi
    const notifResult = await notifyStatusChange({
        phone: data.phone,
        nama: data.nama,
        status: statusMap[data.status] || 'rejected',
        jenjang: data.jenjang,
        tahun_ajaran: data.tahun_ajaran,
        dashboard_url: dashboardUrl,
    });

    // Jika ada surat keputusan, kirim juga sebagai dokumen
    if (data.suratPath) {
        const suratUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/api/files/${data.suratPath}`;
        await sendDocumentMessage({
            phone: data.phone,
            message: `📄 Surat Keputusan Hasil Seleksi — ${data.nama}`,
            documentUrl: suratUrl,
        });
    }

    return notifResult;
}

/**
 * Kirim link Google Form ke santri
 */
export async function notifyGoogleFormLink(data: {
    phone: string;
    nama: string;
    formLink: string;
    keterangan?: string; // misal: "Tes Online", "Survey Tambahan"
    batasWaktu?: string;
}) {
    return sendTemplate({
        phone: data.phone,
        templateId: 'google_form_link',
        variables: {
            nama: data.nama,
            form_link: data.formLink,
            keterangan: data.keterangan || 'pendaftaran',
            batas_waktu: data.batasWaktu || 'Sesuai instruksi panitia',
            dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/dashboard/pendaftar`,
        },
    });
}

/**
 * Kirim link Zoom meeting ke santri (untuk tes online)
 */
export async function notifyZoomMeeting(data: {
    phone: string;
    nama: string;
    jenisUjian: string;   // "Tes Al-Qur'an", "Wawancara Calsan", "Wawancara Cawalsan"
    tanggal: string;
    waktu: string;
    zoomLink: string;
}) {
    return sendTemplate({
        phone: data.phone,
        templateId: 'zoom_meeting',
        variables: {
            nama: data.nama,
            jenis_ujian: data.jenisUjian,
            tanggal: data.tanggal,
            waktu: data.waktu,
            zoom_link: data.zoomLink,
            dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/dashboard/pendaftar`,
        },
    });
}

/**
 * Send Data Complete Notification
 */
export async function notifyDataComplete(data: {
    phone: string;
    nama: string;
}) {
    return sendTemplate({
        phone: data.phone,
        templateId: 'data_complete',
        variables: {
            nama: data.nama,
            dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/dashboard/pendaftar/upload-berkas`,
        },
    });
}

/**
 * Send All Exams Complete Notification
 */
export async function notifyAllExamsComplete(data: {
    phone: string;
    nama: string;
}) {
    return sendTemplate({
        phone: data.phone,
        templateId: 'all_exams_complete',
        variables: {
            nama: data.nama,
            dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pesantren-ululalbaab.com'}/dashboard/pendaftar/pengumuman`,
        },
    });
}
