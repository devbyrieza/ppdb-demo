import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/notifications/multi-channel";
import type { OTPChannel } from "@/lib/notifications/multi-channel";
import { normalizePhoneNumber } from "@/lib/validations/registration";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

const normalizePhone = normalizePhoneNumber;

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_OTP_ATTEMPTS = 5; // Max 5 OTPs per hour per number

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(phone: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(phone);

  if (!limit) {
    return true; // No record, allowed
  }

  if (now > limit.resetTime) {
    rateLimitStore.delete(phone); // Expired, allowed
    return true;
  }

  return limit.count < MAX_OTP_ATTEMPTS;
}

function updateRateLimit(phone: string): void {
  const now = Date.now();
  const limit = rateLimitStore.get(phone);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(phone, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    limit.count++;
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      telegram_username,
      no_hp,
      otp_channel = "whatsapp",
      nik,
      nama_lengkap,
      jenis_kelamin,
      jenjang,
      tanggal_lahir,
    } = await request.json();

    const validChannels: OTPChannel[] = ["whatsapp", "sms"];
    if (!otp_channel || !validChannels.includes(otp_channel as OTPChannel)) {
      return NextResponse.json(
        { success: false, error: "Channel tidak valid. Pilih: whatsapp atau sms" },
        { status: 400 },
      );
    }

    if (!no_hp) {
      return NextResponse.json(
        { success: false, error: "Nomor HP diperlukan" },
        { status: 400 },
      );
    }

    // Normalization
    const normalizePhone = normalizePhoneNumber;
    const normalizedPhone = normalizePhone(no_hp);

    // Rate Limiting Check
    if (!checkRateLimit(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak permintaan OTP. Coba lagi nanti." },
        { status: 429 },
      );
    }

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otpResult = await sendOTP({
      channel: otp_channel as OTPChannel,
      identifier: normalizedPhone,
      otp,
      nama: nama_lengkap,
    });

    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, error: otpResult.message || "Gagal memproses OTP" },
        { status: 500 },
      );
    }

    await prisma.otpVerification.create({
      data: {
        phone: normalizedPhone,
        otp_hash: hashedOTP,
        expires_at: expiresAt,
        attempts: 0,
        otp_channel: otp_channel,
        registration_data: {
          nik,
          nama_lengkap,
          tanggal_lahir,
          no_hp: normalizedPhone,
          jenis_kelamin,
          jenjang,
          email,
        } as any,
      },
    });

    updateRateLimit(normalizedPhone);

    const response: any = {
      success: true,
      message: otpResult.message,
      channel: otp_channel,
      identifier: normalizedPhone,
      expires_in: 300,
      mode: "auto",
    };

    if (process.env.NODE_ENV === "development") {
      response.debugOtp = otp;
      response.phone = normalizedPhone;
    }

    // Temporary: return OTP for self-verification when WhatsApp not available
    if (process.env.SKIP_WHATSAPP_OTP === "true") {
      response.simulation_code = otp;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("❌ ERROR in send-otp API:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      code: error.code // Prisma or Node error code
    });
    return NextResponse.json(
      {
        success: false,
        error: `Server Error: ${error.message}`,
        debug: error.stack
      },
      { status: 500 },
    );
  }
}
