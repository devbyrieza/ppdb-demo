import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { saveFileLocal } from "@/lib/storage/local";

// Konfigurasi upload bukti pembayaran
const UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: [
    "image/jpeg",
    "image/jpg", // WhatsApp photos often use this variant
    "image/png",
    "image/webp", // Modern photo formats
    "image/heic", // iPhone photos
    "image/heif",
    "application/pdf",
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

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File bukti transfer wajib diupload" },
        { status: 400 },
      );
    }

    // 3. Validasi ukuran file
    if (file.size > UPLOAD_CONFIG.maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Ukuran file terlalu besar! Maksimal ${formatFileSize(UPLOAD_CONFIG.maxSize)}`,
        },
        { status: 400 },
      );
    }

    // 4. Validasi tipe file — accept explicit list OR any image/* for mobile compatibility
    const safeFileType = file.type || "";
    const isAllowedType =
      UPLOAD_CONFIG.allowedTypes.includes(safeFileType) ||
      safeFileType.startsWith("image/");
    if (!isAllowedType) {
      return NextResponse.json(
        {
          success: false,
          error: `Format file tidak didukung! Gunakan JPG, PNG, PDF, atau WebP. (File Anda: ${safeFileType || "tidak dikenali"})`,
        },
        { status: 400 },
      );
    }

    // 5. Ambil data pendaftar & tahun ajaran
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: session.id },
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

    // Parse Jenis Pembayaran
    const keringananReason = formData.get("keringanan_reason") as string | null;
    const cicilanKe = formData.get("cicilan_ke") ? parseInt(formData.get("cicilan_ke") as string) : null;
    const jenisPembayaran =
      (formData.get("jenis_pembayaran") as string) || "PENDAFTARAN";
    let biaya = 0;
    let tipeCicilan = "LUNAS";

    // Logic khusus Daftar Ulang
    // Logic khusus Daftar Ulang (Uang Pangkal & SPP)
    if (jenisPembayaran === "DAFTAR_ULANG" || jenisPembayaran === "SPP") {
      // Cek kelulusan berdasarkan status_pendaftaran
      const ELIGIBLE_STATUSES = [
        "accepted",
        "enrolled",
        "sudah_daftar_ulang",
        "Sudah Daftar Ulang",
        "enrolled_full",
      ];
      const statusOk = ELIGIBLE_STATUSES.includes(
        pendaftar.status_pendaftaran ?? "",
      );
      if (!statusOk) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Anda belum dinyatakan DITERIMA, tidak bisa melakukan daftar ulang.",
          },
          { status: 400 },
        );
      }

      const inputJumlah = Number(formData.get("jumlah"));
      const minAmount = jenisPembayaran === "DAFTAR_ULANG" ? 500000 : 100000;
      if (!inputJumlah || inputJumlah < minAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `Nominal pembayaran tidak valid (Minimal Rp ${minAmount.toLocaleString("id-ID")})`,
          },
          { status: 400 },
        );
      }

      biaya = inputJumlah;

      // Ambil total pembayaran yang sudah diverifikasi sebelumnya untuk jenis ini
      const existingPayments = await prisma.pembayaran.findMany({
        where: {
          pendaftar_id: session.id,
          jenis_pembayaran: jenisPembayaran as any,
          status_pembayaran: "verified"
        }
      });
      const totalPaid = existingPayments.reduce((acc, p) => acc + Number(p.jumlah), 0);
      const totalAccumulated = totalPaid + biaya;

      let expectedTagihan = jenisPembayaran === "DAFTAR_ULANG" ? 7500000 : 1000000;
      let dataLengkap: any = {};
      if (pendaftar.data_lengkap) {
        try {
          dataLengkap = typeof pendaftar.data_lengkap === "string" ? JSON.parse(pendaftar.data_lengkap) : pendaftar.data_lengkap;
        } catch(e) {}
      }
      if (jenisPembayaran === "DAFTAR_ULANG" && dataLengkap?.keringanan_daftar_ulang?.nominal_potongan) {
        expectedTagihan -= Number(dataLengkap.keringanan_daftar_ulang.nominal_potongan);
      }

      // Tentukan Tipe Cicilan
      if (totalAccumulated >= expectedTagihan) {
        tipeCicilan = "LUNAS";
      } else if (jenisPembayaran === "DAFTAR_ULANG" && biaya >= (expectedTagihan / 2)) {
        tipeCicilan = "CICIL_50_LEBIH";
      } else if (jenisPembayaran === "DAFTAR_ULANG") {
        tipeCicilan = "CICIL_DIBAWAH_50";
      } else {
        tipeCicilan = "CICILAN";
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
        {
          success: false,
          error: "Pembayaran Anda sudah terverifikasi sebelumnya",
        },
        { status: 400 },
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

    // 8. Detect Real Mime Type via Magic Bytes
    const buffer = Buffer.from(await file.arrayBuffer());
    const hex = buffer.slice(0, 4).toString("hex").toUpperCase();
    let detectedType = file.type;

    if (hex.startsWith("FFD8FF")) detectedType = "image/jpeg";
    else if (hex === "89504E47") detectedType = "image/png";
    else if (hex === "25504446") detectedType = "application/pdf";

    // 9. Generate nama file & Save Local
    const timestamp = Date.now();
    const safeFileName = file.name || "bukti_tanpa_nama.bin";
    const originalExtension =
      safeFileName.split(".").pop()?.toLowerCase() || "bin";

    // Correct extension based on detected type
    let fileExtension = originalExtension;
    if (detectedType === "image/jpeg") fileExtension = "jpg";
    else if (detectedType === "image/png") fileExtension = "png";
    else if (detectedType === "application/pdf") fileExtension = "pdf";

    const fileName = `bukti-${jenisPembayaran.toLowerCase()}-${timestamp}.${fileExtension}`;

    // Save to storage_data/bukti-pembayaran/{pendaftar_id}/...
    const filePath = await saveFileLocal(
      buffer,
      "bukti-pembayaran",
      session.id,
      fileName,
    );

    const midtransJson = { base64_image: buffer.toString('base64'), mime_type: detectedType };

    // 12. Simpan atau update record pembayaran
    let pembayaranResult;
    if (existingPending) {
      pembayaranResult = await prisma.pembayaran.update({
        where: { id: existingPending.id },
        data: {
          jumlah: biaya,
          tipe_cicilan: tipeCicilan as any,
          keringanan_reason: keringananReason as any,
          cicilan_ke: cicilanKe,
          bukti_transfer_path: filePath,
          bukti_transfer_filename: safeFileName,
          status_pembayaran: "pending",
          catatan_verifikasi: null,
          midtrans_response_json: midtransJson !== null ? midtransJson : undefined,
          updated_at: new Date(),
        } as any,
      });
    } else {
      pembayaranResult = await prisma.pembayaran.create({
          data: {
          pendaftar_id: session.id,
          tahun_ajaran_id: pendaftar.tahun_ajaran_id,
          metode_pembayaran: "manual",
          jenis_pembayaran: jenisPembayaran as any,
          tipe_cicilan: tipeCicilan as any,
          cicilan_ke: cicilanKe,
          keringanan_reason: keringananReason as any,
          jumlah: biaya,
          total_tagihan: jenisPembayaran === "DAFTAR_ULANG" ? 7500000 : (jenisPembayaran === "SPP" ? 1000000 : biaya),
          bukti_transfer_path: filePath,
          bukti_transfer_filename: safeFileName,
          status_pembayaran: "pending",
          midtrans_response_json: midtransJson !== null ? midtransJson : undefined,
        } as any,
      });
    }

    // 13. Update status pendaftar (HANYA UNTUK PENDAFTARAN AWAL)
    // Untuk Daftar Ulang, status pendaftaran utama tidak berubah (tetap Lulus/Completed).
    if (jenisPembayaran === "PENDAFTARAN") {
      const allowedStatusForUpload = [
        "draft",
        "waiting_payment",
        "rejected",
        "payment_rejected",
      ];
      if (allowedStatusForUpload.includes(pendaftar.status_pendaftaran)) {
        await prisma.pendaftar.update({
          where: { id: session.id },
          data: {
            status_pendaftaran: "payment_verification",
            updated_at: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Bukti pembayaran berhasil diupload! Tim kami akan memverifikasi dalam 1x24 jam.",
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
      {
        success: false,
        error: "Terjadi kesalahan sistem saat mengupload bukti pembayaran",
      },
      { status: 500 },
    );
  }
}
