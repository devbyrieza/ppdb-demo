import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, nama } = body;

    // Simpan ke database
    const data = await prisma.pendingSms.create({
      data: {
        phone,
        otp,
        nama,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      data: data,
      message: "SMS data saved for admin manual sending",
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
