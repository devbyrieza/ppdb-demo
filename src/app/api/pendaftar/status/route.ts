/**
 * GET /api/pendaftar/status
 * Mengambil status pendaftaran untuk layout dashboard
 * Query: pendaftar_id (dari session)
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pendaftarId = searchParams.get("pendaftar_id");

    if (!pendaftarId) {
      return NextResponse.json(
        { error: "pendaftar_id is required" },
        { status: 400 },
      );
    }

    // Auth Check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Validate that the session user owns this data if they are a pendaftar
    // But this endpoint might be used by admins too?
    // Assuming simple read is fine if authenticated
    const session = JSON.parse(sessionCookie.value);

    // If role is pendaftar, ensure they only access their own data
    if (session.role === "pendaftar" && session.id !== pendaftarId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: {
        id: true,
        nama_lengkap: true,
        nomor_pendaftaran: true,
        status_pendaftaran: true,
        tipe_pendaftaran: true,
        updated_at: true,
        pembayaran: {
          where: { status_pembayaran: "verified" },
          take: 1,
        },
        pengumuman: {
          select: {
            status_kelulusan: true,
            catatan: true,
            surat_keputusan_url: true,
          },
        },
        ukuran_seragam_baju: true,
        ukuran_seragam_celana: true,
      },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Failed to fetch status" },
        { status: 404 },
      );
    }

    // AUTO-FIX: Sync status_pendaftaran if payment is verified
    let currentStatus = data.status_pendaftaran || "draft";
    const { getStatusIndex } = await import("@/lib/access-control");

    if (
      data.pembayaran.length > 0 &&
      getStatusIndex(currentStatus) < getStatusIndex("verified")
    ) {
      console.log(
        `[AutoFix] Upgrading ${data.nomor_pendaftaran} status to verified (payment found)`,
      );
      await prisma.pendaftar.update({
        where: { id: pendaftarId },
        data: { status_pendaftaran: "verified" },
      });
      currentStatus = "verified";
    }

    // Check if slots are available and pendaftar hasn't booked yet
    const sessions = await prisma.examSession.findMany({
      where: { is_active: true, start_time: { gte: new Date() } },
      include: { _count: { select: { bookings: true } } },
    });
    const totalAvailableSlots = sessions.reduce(
      (acc, s) => acc + Math.max(0, s.quota - s._count.bookings),
      0,
    );

    const existingBooking = await prisma.jadwalUjian.findFirst({
      where: { pendaftar_id: pendaftarId },
    });

    const schedules_available = totalAvailableSlots > 0 && !existingBooking;

    // select nilai_ujian status
    const dataWithNilai = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      include: {
        nilai_ujian: true,
      },
    });

    const nilai = dataWithNilai?.nilai_ujian[0];

    // 1. Check if they have done any online test (Grup A)
    const hasOnlineTest = dataWithNilai?.nilai_ujian?.some(
      (n) =>
        n.score_akademik != null ||
        n.score_kepribadian != null ||
        n.score_kesiapan != null ||
        n.detail_akademik != null ||
        n.detail_kepribadian != null ||
        n.detail_kesiapan != null,
    );

    // 2. Check if they have booked any schedule (Grup B)
    const hasBooking = await prisma.jadwalUjian.count({
      where: { pendaftar_id: pendaftarId },
    });

    if (
      currentStatus === "docs_verified" &&
      (hasOnlineTest || hasBooking > 0)
    ) {
      console.log(
        `[AutoFix] Upgrading ${data.nomor_pendaftaran} status to selection (tests/booking found)`,
      );
      await prisma.pendaftar.update({
        where: { id: pendaftarId },
        data: { status_pendaftaran: "selection" },
      });
      currentStatus = "selection";
    }

    // status_proses = status_pendaftaran (kompatibel dengan access-control)
    return NextResponse.json({
      id: data.id,
      nama_lengkap: data.nama_lengkap,
      nomor_pendaftaran: data.nomor_pendaftaran,
      status_proses: currentStatus,
      tipe_pendaftaran: data.tipe_pendaftaran,
      updated_at: data.updated_at,
      schedules_available: schedules_available,
      ukuran_seragam_baju: data.ukuran_seragam_baju,
      ukuran_seragam_celana: data.ukuran_seragam_celana,
      pengumuman: data.pengumuman,
      hasil_kelulusan: {
        status: (nilai as any)?.status_kelulusan || null,
        catatan: (nilai as any)?.catatan_kelulusan || null,
      },
    });
  } catch (error) {
    console.error("Error in status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
