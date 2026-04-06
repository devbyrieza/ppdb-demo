// lib/verification/whatsapp.ts
import { normalizePhone } from "./multi-channel";
import { sendMessage } from "@/lib/wablas";

export async function sendWhatsAppMessage(
  to: string,
  otp: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const phone = normalizePhone(to);

    // Create OTP message
    const message = `🔐 *Kode Verifikasi PPDB Ulul Albaab*

Kode OTP Anda adalah: *${otp}*

Kode ini berlaku selama 5 menit.

⚠️ Jangan berikan kode ini kepada siapapun!

Jazakumullahu khairan,
Panitia PPDB Ulul Albaab`;

    // Kirim via Wablas API
    const result = await sendMessage({ phone, message });

    if (result.status) {
      return { success: true, messageId: result.data?.id || `wa_${Date.now()}` };
    }

    // Fallback untuk development
    if (process.env.NODE_ENV === "development") {
      console.log(`📱 [DEV] WhatsApp OTP ${otp} untuk ${phone}`);
      return { success: true, messageId: "dev-" + Date.now() };
    }

    return { success: false, error: result.message || "WhatsApp service error" };
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    return { success: false, error: error.message };
  }
}
