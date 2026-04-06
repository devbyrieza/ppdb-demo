// lib/verification/sms.ts
import { normalizePhone } from "./multi-channel";
import { sendMessage } from "@/lib/wablas";

export async function sendSms(
  to: string,
  otp: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const phone = normalizePhone(to);

    // Kirim via Wablas (WhatsApp message, lebih reliable dari SMS)
    const message = `Kode verifikasi PPDB Ponpes Al-Andalus Ulul Albaab: ${otp}`;
    const result = await sendMessage({ phone, message });

    if (result.status) {
      return { success: true, messageId: result.data?.id || `sms_${Date.now()}` };
    }

    // Fallback untuk development
    if (process.env.NODE_ENV === "development") {
      console.log(`📨 [DEV] SMS OTP ${otp} untuk ${phone}`);
      return { success: true, messageId: "dev-sms-" + Date.now() };
    }

    return { success: false, error: result.message || "SMS service error" };
  } catch (error: any) {
    console.error("SMS send error:", error);
    return { success: false, error: error.message };
  }
}
