import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { notifyDataComplete } from "@/lib/wablas";

/**
 * POST /api/pendaftar/konfirmasi-data
 * Mengunci data pendaftaran dan mengubah status menjadi 'data_completed'
 */
export async function POST() {
  try {
    // 1. Validasi session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan" },
        { status: 401 },
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid" },
        { status: 401 },
      );
    }

    if (session.role !== "pendaftar") {
      return NextResponse.json(
        { success: false, error: "Akses tidak diizinkan" },
        { status: 403 },
      );
    }

    const pendaftarId = session.id;

    // 2. Ambil data pendaftar
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId } });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Data pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    // 3. Update status pendaftaran menjadi 'data_completed'
    // Hanya update jika status saat ini 'verified' (pembayaran lunas)
    // atau jika mereka sedang dalam 'payment_verification' (mungkin lunas tapi admin telat?
    // tapi SOP-nya harus 'verified' baru bisa isi data lengkap)

    await prisma.pendaftar.update({
      where: { id: pendaftarId },
      data: {
        status_pendaftaran: "data_completed",
        updated_at: new Date() } });

    // Send Data Complete Notification
    if (pendaftar.no_hp) {
      try {
        await notifyDataComplete({
          phone: pendaftar.no_hp,
          nama: pendaftar.nama_lengkap });
      } catch (e) {
        console.error("Failed to send data complete notification", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Data berhasil dikonfirmasi dan dikunci." });
  } catch (error: any) {
    console.error("Error in POST /api/pendaftar/konfirmasi-data:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat mengonfirmasi data" },
      { status: 500 },
    );
  }
}
