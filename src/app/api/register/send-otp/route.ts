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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { no_hp, otp_channel = "whatsapp", nama_lengkap } = body;
    const normalizedPhone = normalizePhoneNumber(no_hp);

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otpResult = await sendOTP({
      channel: otp_channel as any,
      identifier: normalizedPhone,
      otp,
      nama: nama_lengkap,
    });

    if (!otpResult.success) return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 });

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
    return NextResponse.json({ success: false, error: "Registration process failed" }, { status: 500 });
  }
}
