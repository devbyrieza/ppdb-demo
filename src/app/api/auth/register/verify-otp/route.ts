import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-\(\)]/g, "");

  if (normalized.startsWith("08")) {
    normalized = "+62" + normalized.slice(1);
  } else if (normalized.startsWith("628")) {
    normalized = "+" + normalized;
  } else if (!normalized.startsWith("+62")) {
    normalized = "+62" + normalized;
  }

  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { no_hp, otp_code } = body;

    if (!no_hp || !otp_code) {
      return NextResponse.json(
        { success: false, error: "Nomor HP dan kode OTP wajib diisi" },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(otp_code)) {
      return NextResponse.json(
        { success: false, error: "Kode OTP harus 6 digit angka" },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizePhone(no_hp);
    const hashedOTP = hashOTP(otp_code);

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { phone: normalizedPhone },
      orderBy: { created_at: "desc" } });

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Kode OTP tidak ditemukan. Silakan kirim ulang." },
        { status: 404 },
      );
    }

    const now = new Date();
    if (now > otpRecord.expires_at) {
      return NextResponse.json(
        {
          success: false,
          error: "Kode OTP sudah kadaluarsa. Silakan kirim ulang." },
        { status: 410 },
      );
    }

    if (otpRecord.attempts >= 3) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Terlalu banyak percobaan gagal. Silakan kirim ulang kode OTP." },
        { status: 429 },
      );
    }

    if (otpRecord.otp_hash !== hashedOTP) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 } });

      const remainingAttempts = 3 - (otpRecord.attempts + 1);
      return NextResponse.json(
        {
          success: false,
          error: `Kode OTP salah. Sisa percobaan: ${remainingAttempts}` },
        { status: 400 },
      );
    }

    const registrationData = (otpRecord.registration_data as any) || {};

    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified_at: new Date() } });

    return NextResponse.json({
      success: true,
      message: "Verifikasi berhasil",
      data: registrationData,
      otp_id: otpRecord.id });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
