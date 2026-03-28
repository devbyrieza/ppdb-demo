// app/api/verifikasi/pending/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil OTP yang menunggu untuk dikirim (terutama WhatsApp manual)
    const pendingOTP = await prisma.otpVerification.findMany({
      where: {
        verified_at: null,
        expires_at: { gt: new Date() },
        otp_channel: "whatsapp",
        sent_at: null,
      },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      pending: pendingOTP,
      count: pendingOTP.length,
      message: `${pendingOTP.length} OTP menunggu untuk dikirim manual`,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
