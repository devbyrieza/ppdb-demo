import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/pembayaran/status
 * Mengambil status pembayaran terbaru untuk pendaftar yang sedang login
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Validasi session (pendaftar pakai app_session cookie)
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

    // 2. Ambil data pendaftar beserta tahun ajaran
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      include: {
        tahun_ajaran: true,
      },
    });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Data pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    // 3. Ambil data pembayaran terbaru (jika ada)
    const pembayaran = await prisma.pembayaran.findFirst({
      where: { pendaftar_id: pendaftarId },
      orderBy: { created_at: "desc" },
    });

    // 4. Hitung deadline pembayaran
    const tahunAjaran = {
      id: pendaftar.tahun_ajaran.id,
      nama: pendaftar.tahun_ajaran.nama,
      biaya_pendaftaran: Number(pendaftar.tahun_ajaran.biaya_pendaftaran),
      tanggal_tutup_pendaftaran:
        pendaftar.tahun_ajaran.tanggal_tutup_pendaftaran,
    };

    const isExpired = false;

    // 5. Tentukan status pembayaran
    let paymentStatus:
      | "unpaid"
      | "pending"
      | "verified"
      | "rejected"
      | "expired" = "unpaid";

    if (pembayaran) {
      if (pembayaran.status_pembayaran === "verified") {
        paymentStatus = "verified";
      } else if (pembayaran.status_pembayaran === "rejected") {
        paymentStatus = "rejected";
      } else if (pembayaran.status_pembayaran === "pending") {
        paymentStatus = "pending";
      }
    }

    // 6. Return response
    return NextResponse.json({
      success: true,
      data: {
        pendaftar: {
          id: pendaftar.id,
          nomor_pendaftaran: pendaftar.nomor_pendaftaran,
          nama_lengkap: pendaftar.nama_lengkap,
          status_pendaftaran: pendaftar.status_pendaftaran,
        },
        tahun_ajaran: {
          // Convert Date to string for JSON serialization compatibility
          id: tahunAjaran.id,
          nama: tahunAjaran.nama,
          biaya_pendaftaran: tahunAjaran.biaya_pendaftaran,
          tanggal_tutup_pendaftaran: tahunAjaran.tanggal_tutup_pendaftaran,
        },
        pembayaran: pembayaran
          ? {
              id: pembayaran.id,
              metode_pembayaran: pembayaran.metode_pembayaran,
              jumlah: Number(pembayaran.jumlah),
              status_pembayaran: pembayaran.status_pembayaran,
              bukti_transfer_path: pembayaran.bukti_transfer_path,
              bukti_transfer_filename: pembayaran.bukti_transfer_filename,
              midtrans_order_id: pembayaran.midtrans_order_id,
              midtrans_payment_type: pembayaran.midtrans_payment_type,
              verified_at: pembayaran.verified_at,
              catatan_verifikasi: pembayaran.catatan_verifikasi,
              created_at: pembayaran.created_at,
              updated_at: pembayaran.updated_at,
            }
          : null,
        status: paymentStatus,
        deadline: tahunAjaran.tanggal_tutup_pendaftaran,
        is_deadline_passed: isExpired,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/pembayaran/status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat mengambil status pembayaran",
      },
      { status: 500 },
    );
  }
}
