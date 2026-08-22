import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/pembayaran/history
 * Mengambil riwayat pembayaran pendaftar yang sedang login
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const pendaftarId = session.id;
    const searchParams = request.nextUrl.searchParams;
    const jenis = searchParams.get("jenis");

    const where: any = { pendaftar_id: pendaftarId };
    if (jenis) {
      where.jenis_pembayaran = jenis;
    }

    const history = await prisma.pembayaran.findMany({
      where,
      orderBy: { created_at: "asc" }, // Ascending so we can count sequence
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
