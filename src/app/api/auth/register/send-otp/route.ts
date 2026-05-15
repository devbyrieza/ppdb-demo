import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/notifications/multi-channel";
import type { OTPChannel } from "@/lib/notifications/multi-channel";
import { normalizePhoneNumber } from "@/lib/validations/registration";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { redis } from "@/lib/redis";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

const normalizePhone = normalizePhoneNumber;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function updateRateLimit(phone: string): void {
  const now = Date.now();
  const limit = rateLimitStore.get(phone);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(phone, { count: 1, resetTime: now + 60 * 60 * 1000 });
  } else {
    limit.count++;
  }
}

export async function POST(request: NextRequest) {
  try {
    // === REDIS IP RATE LIMITING (Anti-DDoS) ===
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown_ip";
    const rateLimitKey = `rate_limit_otp_${ip}`;
    
    const currentRequests = await redis.incr(rateLimitKey);
    if (currentRequests === 1) {
      await redis.expire(rateLimitKey, 3600); // Reset dalam 1 jam
    }
    
    // LIMIT: 20 request per IP per Jam
    if (currentRequests > 20) {
      console.log(`🛡️ [Security] Blocked IP ${ip} dari pengiriman OTP (Rate Limit Exceeded: ${currentRequests}/20)`);
      return NextResponse.json(
        {
          success: false,
          error: "Terlalu banyak percobaan pendaftaran dari jaringan Anda. Harap tunggu 1 jam.",
        },
        { status: 429 },
      );
    }
    // ==========================================

    const body = await request.json();
    const {
      nik,
      nama_lengkap,
      tanggal_lahir,
      no_hp,
      jenis_kelamin,
      jenjang,
      email,
      telegram_username,
      otp_channel = "whatsapp",
    } = body;

    if (!["whatsapp", "sms"].includes(otp_channel)) {
      return NextResponse.json(
        {
          success: false,
          error: "Channel OTP tidak valid. Pilih: whatsapp atau sms",
        },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizePhone(no_hp);

    // RATE LIMIT CHECK (Max 3 OTPs per hour per phone number)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await prisma.otpVerification.count({
      where: {
        phone: normalizedPhone,
        created_at: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentOtps >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Terlalu banyak permintaan OTP. Coba lagi dalam 1 jam.",
        },
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
      data: { phone: normalizedPhone, email },
    });

    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, error: otpResult.message || "Gagal mengirim OTP" },
        { status: 500 },
      );
    }

    await prisma.otpVerification.create({
      data: {
        phone: normalizedPhone,
        otp_hash: hashedOTP,
        expires_at: expiresAt,
        attempts: 0,
        otp_channel: otpResult.channel,
        registration_data: JSON.stringify({
          nik,
          nama_lengkap,
          tanggal_lahir,
          no_hp: normalizedPhone,
          jenis_kelamin,
          jenjang,
          email,
          telegram_username,
        }),
      },
    });

    // No need for updateRateLimit() anymore

    return NextResponse.json({
      success: true,
      message: otpResult.message,
      channel: otpResult.channel,
      identifier: normalizedPhone,
      is_fallback: otp_channel !== otpResult.channel,
      expires_in: 300,
      note:
        otpResult.channel === "sms" && otp_channel === "whatsapp"
          ? "WhatsApp gagal, dikirim via SMS sebagai fallback"
          : undefined,
    });
  } catch (error: any) {
    console.error("❌ ERROR in auth-send-otp API:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      code: error.code,
    });
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
