import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET: Fetch data pendaftar berdasarkan session
export async function GET(request: NextRequest) {
  try {
    // 1. Ambil session dari cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesi tidak ditemukan. Silakan login kembali.",
        },
        { status: 401 },
      );
    }

    // 2. Parse session data
    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid" },
        { status: 401 },
      );
    }

    // 3. Validasi role
    if (session.role !== "pendaftar") {
      return NextResponse.json(
        { success: false, error: "Akses tidak diizinkan" },
        { status: 403 },
      );
    }

    // 4. Fetch data pendaftar dari database
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: session.id },
      include: {
        orang_tua: true,
        dokumen: true,
      },
    });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Data pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    // 5. Return data
    return NextResponse.json({
      success: true,
      data: pendaftar,
      isDummy: false,
    });
  } catch (error: any) {
    console.error("Error in pendaftar-data API:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
