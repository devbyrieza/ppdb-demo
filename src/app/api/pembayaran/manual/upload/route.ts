import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { saveFileLocal } from "@/lib/storage/local";

// Konfigurasi upload bukti pembayaran
const UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: [
    "image/jpeg",
    "image/jpg",       // WhatsApp photos often use this variant
    "image/png",
    "image/webp",      // Modern photo formats
    "image/heic",      // iPhone photos
    "image/heif",
    "application/pdf"
  ],
};

// Helper function untuk format ukuran file
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validasi session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid" },
        { status: 401 }
      );
    }

    if (session.role !== "pendaftar") {
      return NextResponse.json(
        { success: false, error: "Akses tidak diizinkan" },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File bukti transfer wajib diupload" },
        { status: 400 }
      );
    }

    // 3. Validasi ukuran file
    if (file.size > UPLOAD_CONFIG.maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Ukuran file terlalu besar! Maksimal ${formatFileSize(UPLOAD_CONFIG.maxSize)}`,
        },
        { status: 400 }
      );
    }

    // 4. Validasi tipe file — accept explicit list OR any image/* for mobile compatibility
    const safeFileType = file.type || '';
    const isAllowedType = UPLOAD_CONFIG.allowedTypes.includes(safeFileType) || safeFileType.startsWith("image/");
    if (!isAllowedType) {
      return NextResponse.json(
        {
          success: false,
          error: `Format file tidak didukung! Gunakan JPG, PNG, PDF, atau WebP. (File Anda: ${safeFileType || 'tidak dikenali'})`,
        },
        { status: 400 }
      );
    }

    // 5. Ambil data pendaftar & tahun ajaran & nilai ujian (untuk cek kelulusan)
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: session.id },
      include: {
        tahun_ajaran: true,
        nilai_ujian: true,
      },
    });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Data pendaftar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Parse Jenis Pembayaran
    const jenisPembayaran = (formData.get("jenis_pembayaran") as string) || "PENDAFTARAN";
    let biaya = 0;
    let tipeCicilan = "LUNAS";

    // Logic khusus Daftar Ulang
    if (jenisPembayaran === "DAFTAR_ULANG") {
      // Cek kelulusan
      const nilai = pendaftar.nilai_ujian[0] as any;
      if (!nilai || nilai.status_kelulusan !== "LULUS") {
        return NextResponse.json(
          { success: false, error: "Anda belum dinyatakan LULUS, tidak bisa melakukan daftar ulang." },
          { status: 400 }
        );
      }

      const inputJumlah = Number(formData.get("jumlah"));
      if (!inputJumlah || inputJumlah < 1000000) { // Minimal 1jt
        return NextResponse.json(
          { success: false, error: "Nominal pembayaran tidak valid (Minimal Rp 1.000.000)" },
          { status: 400 }
        );
      }

      biaya = inputJumlah;

      // Tentukan Tipe Cicilan
      if (biaya >= 8500000) {
        tipeCicilan = "LUNAS";
      } else if (biaya >= 4250000) {
        tipeCicilan = "CICIL_50_LEBIH";
      } else {
        tipeCicilan = "CICIL_DIBAWAH_50";
      }

    } else {
      // Default PENDAFTARAN
      biaya = Number(pendaftar.tahun_ajaran.biaya_pendaftaran);
      tipeCicilan = "LUNAS";
    }

    // 6. Cek pembayaran verified (sesuai jenis)
    const existingVerified = await prisma.pembayaran.findFirst({
      where: {
        pendaftar_id: session.id,
        status_pembayaran: "verified",
        jenis_pembayaran: jenisPembayaran as any, // Cast to enum
      },
    });

    if (existingVerified && jenisPembayaran === "PENDAFTARAN") {
      // Untuk pendaftaran, cuma boleh sekali bayar verified.
      // Untuk Daftar Ulang, mungkin boleh nyicil berkali-kali?
      // User request imply: "WAJIB MEMBAYAR CICILAN PERTAMA SAAT DI DAFTAR ULANG ONLINE INI".
      // So this endpoint is for the FIRST payment/commitment.
      // Future payments might be manual offline? Or repeated uploads?
      // Currently assume logic handles the first upload.
      // If existing verified daftar ulang, maybe block or allow topup?
      // Let's block for now to keep it simple, or user can contact admin.
      return NextResponse.json(
        { success: false, error: "Pembayaran Anda sudah terverifikasi sebelumnya" },
        { status: 400 }
      );
    }

    // 7. Cek pembayaran pending/rejected
    const existingPending = await prisma.pembayaran.findFirst({
      where: {
        pendaftar_id: session.id,
        status_pembayaran: { in: ["pending", "rejected"] },
        jenis_pembayaran: jenisPembayaran as any,
        metode_pembayaran: "manual",
      },
    });

    // 9. Generate nama file & Save Local
    const timestamp = Date.now();
    const safeFileName = file.name || "bukti_tanpa_nama.bin";
    const fileExtension = safeFileName.split(".").pop()?.toLowerCase() || "bin";
    const fileName = `bukti-${jenisPembayaran.toLowerCase()}-${timestamp}.${fileExtension}`;

    // Save to storage_data/bukti-pembayaran/{pendaftar_id}/...
    const filePath = await saveFileLocal(file, 'bukti-pembayaran', session.id, fileName);

    // 12. Simpan atau update record pembayaran
    let pembayaranResult;
    if (existingPending) {
      pembayaranResult = await prisma.pembayaran.update({
        where: { id: existingPending.id },
        data: {
          jumlah: biaya,
          tipe_cicilan: tipeCicilan as any,
          bukti_transfer_path: filePath,
          bukti_transfer_filename: safeFileName,
          status_pembayaran: "pending",
          catatan_verifikasi: null,
          updated_at: new Date(),
        }
      });
    } else {
      pembayaranResult = await prisma.pembayaran.create({
        data: {
          pendaftar_id: session.id,
          tahun_ajaran_id: pendaftar.tahun_ajaran_id,
          metode_pembayaran: "manual",
          jenis_pembayaran: jenisPembayaran as any,
          tipe_cicilan: tipeCicilan as any,
          jumlah: biaya,
          total_tagihan: jenisPembayaran === "DAFTAR_ULANG" ? 8500000 : biaya,
          bukti_transfer_path: filePath,
          bukti_transfer_filename: safeFileName,
          status_pembayaran: "pending",
        }
      });
    }

    // 13. Update status pendaftar (HANYA UNTUK PENDAFTARAN AWAL)
    // Untuk Daftar Ulang, status pendaftaran utama tidak berubah (tetap Lulus/Completed).
    if (jenisPembayaran === "PENDAFTARAN") {
      const allowedStatusForUpload = ["draft", "waiting_payment", "rejected", "payment_rejected"];
      if (allowedStatusForUpload.includes(pendaftar.status_pendaftaran)) {
        await prisma.pendaftar.update({
          where: { id: session.id },
          data: {
            status_pendaftaran: "payment_verification",
            updated_at: new Date(),
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Bukti pembayaran berhasil diupload! Tim kami akan memverifikasi dalam 1x24 jam.",
      data: {
        pembayaran_id: pembayaranResult.id,
        file_path: filePath,
        file_name: safeFileName,
        file_size: file.size,
        status: "pending",
      },
    });

  } catch (error: any) {
    console.error("Error in POST /api/pembayaran/manual/upload:", error);
    return NextResponse.json(
      { success: false, error: "DEBUG: " + (error?.message || "Unknown error") + " STACK: " + (error?.stack?.split('\n')[1] || "") },
      { status: 500 }
    );
  }
}
