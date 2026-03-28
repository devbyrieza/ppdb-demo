// File: /src/lib/notifications/multi-channel.ts
// Multi-channel OTP delivery system via Wablas

import { sendWhatsAppOTP } from "./whatsapp";
import { sendSMSOTP } from "./sms";

// Type definitions
export type OTPChannel = "whatsapp" | "sms";

export interface SendOTPRequest {
  channel: OTPChannel;
  identifier: string;
  otp: string;
  nama: string;
  data?: {
    phone?: string;
    email?: string;
  };
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  channel: OTPChannel;
  messageId?: string;
  retryChannels?: OTPChannel[];
}

export async function sendOTP(
  request: SendOTPRequest,
): Promise<SendOTPResponse> {
  const { channel, identifier, otp, nama } = request;

  // WhatsApp: Otomatis via Wablas API
  if (channel === "whatsapp") {
    let waError = "Unknown WhatsApp error";

    try {
      const result = await sendWhatsAppOTP(identifier, otp, nama);

      if (result.success) {
        return {
          success: true,
          message: "OTP berhasil dikirim via WhatsApp",
          channel: "whatsapp",
          messageId: result.messageId,
        };
      }
      waError = result.error || "Gagal mengirim via WhatsApp";
    } catch (error: any) {
      console.error("❌ WhatsApp failed:", error);
      waError = error.message || "Exception sending WhatsApp";
    }

    // Fallback ke SMS jika WhatsApp gagal
    try {
      const smsResult = await sendSMSOTP(identifier, otp, nama);
      if (smsResult.success) {
        return {
          success: true,
          message: "WhatsApp gagal, OTP dikirim via SMS sebagai fallback",
          channel: "sms",
          messageId: smsResult.messageId,
        };
      }
    } catch (error) {
      console.error("❌ SMS fallback also failed:", error);
    }

    return {
      success: false,
      message: `Gagal mengirim OTP: ${waError}`, // Return specific WhatsApp error
      channel: "whatsapp",
    };
  }

  // SMS channel (juga via Wablas WhatsApp)
  if (channel === "sms") {
    try {
      const result = await sendSMSOTP(identifier, otp, nama);

      if (result.success) {
        return {
          success: true,
          message: "OTP berhasil dikirim",
          channel: "sms",
          messageId: result.messageId,
        };
      }
    } catch (error) {
      console.error("❌ SMS failed:", error);
    }

    return {
      success: false,
      message: "Gagal mengirim OTP",
      channel: "sms",
    };
  }

  return {
    success: false,
    message: `Channel ${channel} tidak didukung`,
    channel: channel as OTPChannel,
  };
}

export function validateIdentifier(
  channel: OTPChannel,
  identifier: string,
): boolean {
  switch (channel) {
    case "whatsapp":
    case "sms":
      const phoneRegex = /^(08|628|\+628)\d{8,12}$/;
      return phoneRegex.test(identifier.replace(/[\s\-\(\)]/g, ""));
    default:
      return false;
  }
}
