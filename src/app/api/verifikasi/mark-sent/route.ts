// app/api/verifikasi/mark-sent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { otp_id, phone } = await request.json();

    if (!otp_id && !phone) {
      return NextResponse.json(
        { success: false, error: "OTP ID atau phone diperlukan" },
        { status: 400 },
      );
    }

    // Cari record yg akan diupdate
    // Prioritas otp_id, fallback ke phone (cari yg terbaru yg belum verified)
    let recordToUpdate;

    if (otp_id) {
      recordToUpdate = await prisma.otpVerification.findUnique({
        where: { id: otp_id },
      });
    } else {
      recordToUpdate = await prisma.otpVerification.findFirst({
        where: {
          phone: phone,
          verified_at: null,
          expires_at: { gt: new Date() },
        },
        orderBy: { created_at: "desc" },
      });
    }

    if (!recordToUpdate) {
      return NextResponse.json(
        { success: false, error: "OTP record not found or expired" },
        { status: 404 },
      );
    }

    // Update OTP status ke 'sent'
    const updated = await prisma.otpVerification.update({
      where: { id: recordToUpdate.id },
      data: {
        sent_at: new Date(),
        status: "sent",
      },
    });

    return NextResponse.json({
      success: true,
      message: "OTP sudah ditandai sebagai terkirim",
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
