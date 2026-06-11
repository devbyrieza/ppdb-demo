import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/notifications/multi-channel";
import { normalizePhoneNumber } from "@/lib/validations/registration";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * ─── REGISTER API: SEND OTP ───
 */

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp: string) => crypto.createHash("sha256").update(otp).digest("hex");

/** Demo mode: aktif jika SKIP_WHATSAPP_OTP=true ATAU jika ini environment vercel.app */
const isDemoMode = () => {
  if (process.env.SKIP_WHATSAPP_OTP === "true") return true;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";
  return appUrl.includes("vercel.app");
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { no_hp, otp_channel = "whatsapp", nama_lengkap } = body;
    const normalizedPhone = normalizePhoneNumber(no_hp);

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // ── Demo mode: simpan OTP ke DB langsung tanpa kirim WA ──
    if (isDemoMode()) {
      console.log(`📱 [DEMO MODE] OTP untuk ${nama_lengkap} (${normalizedPhone}): ${otp}`);

      await prisma.otpVerification.create({
        data: {
          phone: normalizedPhone,
          otp_hash: hashedOTP,
          expires_at: expiresAt,
          otp_channel: otp_channel,
          registration_data: body,
        },
      });

      return NextResponse.json({
        success: true,
        message: "OTP Sent Successfully",
        demo: true,
        otp, // hanya muncul di demo mode untuk kemudahan testing
      });
    }

    // ── Production mode: kirim via Wablas ──
    const otpResult = await sendOTP({
      channel: otp_channel as any,
      identifier: normalizedPhone,
      otp,
      nama: nama_lengkap,
    });

    if (!otpResult.success) {
      // Graceful fallback: jika Wablas gagal, tetap simpan OTP ke DB
      // supaya flow tidak putus; log error untuk debugging
      console.error("❌ OTP send failed, storing to DB anyway:", otpResult.message);

      await prisma.otpVerification.create({
        data: {
          phone: normalizedPhone,
          otp_hash: hashedOTP,
          expires_at: expiresAt,
          otp_channel: otp_channel,
          registration_data: body,
        },
      });

      return NextResponse.json({
        success: true,
        message: "OTP disimpan (pengiriman WA tertunda, coba verifikasi manual)",
        fallback: true,
      });
    }

    await prisma.otpVerification.create({
      data: {
        phone: normalizedPhone,
        otp_hash: hashedOTP,
        expires_at: expiresAt,
        otp_channel: otp_channel,
        registration_data: body,
      },
    });

    return NextResponse.json({ success: true, message: "OTP Sent Successfully" });
  } catch (error: any) {
    console.error("❌ send-otp error:", error?.message);
    return NextResponse.json({ success: false, error: "Registration process failed" }, { status: 500 });
  }
}
