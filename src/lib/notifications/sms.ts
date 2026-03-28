// File: /src/lib/notifications/sms.ts
// SMS/WhatsApp OTP delivery via Wablas

import { sendWhatsAppOTP } from "./whatsapp";

export async function sendSMSOTP(
  phone: string,
  otp: string,
  nama: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Wablas sends via WhatsApp (more reliable than SMS for Indonesian numbers)
    const result = await sendWhatsAppOTP(phone, otp, nama);

    if (result.success) {
      console.log(`✅ OTP sent via Wablas to ${phone}`);
      return {
        success: true,
        messageId: result.messageId,
      };
    }

    // Fallback: Simulation mode only if explicitly suppressed
    if (process.env.SKIP_WHATSAPP_OTP === "true") {
      console.log("📱 [SIMULATION] OTP akan dikirim ke:", phone);
      console.log(`🔐 Kode OTP: ${otp} untuk ${nama}`);
      return {
        success: true,
        messageId: `sim_${Date.now()}`,
      };
    }

    return {
      success: false,
      error: result.error || "Gagal mengirim OTP",
    };
  } catch (error: any) {
    console.error("❌ OTP send error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengirim OTP",
    };
  }
}
