import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const confirm = searchParams.get("confirm");

    if (confirm !== "true") {
      return NextResponse.json({ 
        message: "This will restore ALL soft-deleted students. Please add ?confirm=true to the URL to execute." 
      });
    }

    const targetIds = [
      "ccab0426-d199-4f13-8908-9859cdf13727", // Nahla Ajwa Nursyifa
      "0b663546-ec68-4e87-8150-0c857eacb6b9", // Iklimah Mardhatillah
      "6d5c0aa1-b9aa-43a5-b6e8-27577ad20ad4"  // Hudzaifah Al fawwaz
    ];

    const result = await prisma.pendaftar.updateMany({
      where: {
        id: { in: targetIds }
      },
      data: {
        deleted_at: null
      }
    });

    return NextResponse.json({
      message: `Success! Restored ${result.count} specific students.`,
      restored_count: result.count
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
