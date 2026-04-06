// File: /src/lib/notifications/whatsapp.ts
/**
 * WhatsApp OTP Service using Wablas API
 */

import { sendMessage } from "@/lib/wablas";
import { prisma } from "@/lib/prisma";

export async function sendWhatsAppOTP(
  phone: string,
  otp: string,
  nama: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // OTP Message Template
    const message = `🔐 *Kode Verifikasi PPDB Ulul Albaab*

Assalamu'alaikum ${nama},

Kode OTP Anda adalah:

*${otp}*

Kode ini berlaku selama *5 menit*.

⚠️ *PENTING:*
• Jangan berikan kode ini kepada siapapun
• Tim Ulul Albaab tidak akan pernah meminta kode OTP Anda

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`;

    const result = await sendMessage({ phone, message });

    // Log success or error to database for auditing
    try {
      await prisma.whatsappLog.create({
        data: {
          phone,
          jenis_notif: "otp_verification",
          status: result.status ? "sent" : "failed",
          message_content: `Assalamu'alaikum ${nama}, Kode OTP Anda adalah: ${otp}`,
          sent_at: result.status ? new Date() : null,
          error_message: result.status ? null : result.message,
          response_data: JSON.stringify(result),
        },
      });
    } catch (dbError) {
      console.error("❌ Failed to log WhatsApp OTP to DB:", dbError);
    }

    if (result.status) {
      return {
        success: true,
        messageId: result.data?.id || `wa_${Date.now()}`,
      };
    }

    // Fallback: only if explicitly skipped
    if (process.env.SKIP_WHATSAPP_OTP === "true") {
      console.log("📱 [SKIP] WhatsApp OTP (Simulated):", otp, "untuk", phone);
      return {
        success: true,
        messageId: `wa_sim_${Date.now()}`,
      };
    }

    return {
      success: false,
      error: result.message || "Gagal mengirim WhatsApp OTP",
    };
  } catch (error: any) {
    console.error("❌ WhatsApp error:", error.message);

    // Also log exception to DB
    try {
      await prisma.whatsappLog.create({
        data: {
          phone,
          jenis_notif: "otp_verification",
          status: "failed",
          message_content: `Assalamu'alaikum ${nama}, Kode OTP Anda adalah: ${otp}`,
          error_message: error.message,
        },
      });
    } catch (dbError) { }

    // Fallback simulation only if explicitly requested
    if (process.env.SKIP_WHATSAPP_OTP === "true") {
      console.log("📱 [SKIP] WhatsApp gagal, mode simulasi");
      console.log(`OTP untuk ${nama} (${phone}): ${otp}`);
      return {
        success: true,
        messageId: `wa_fallback_${Date.now()}`,
        error: error.message,
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
}
