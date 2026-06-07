import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { saveFileLocal } from "@/lib/storage/local";

// Konfigurasi dokumen
const DOKUMEN_CONFIG: Record<
  string,
  {
    label: string;
    maxSize: number;
    allowedTypes: string[];
    required: boolean;
  }
> = {
  kartu_keluarga: {
    label: "Scan Kartu Keluarga",
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    required: true,
  },
  akta_kelahiran: {
    label: "Scan Akte Kelahiran",
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    required: true,
  },
  rapor_sem1: {
    label: "Scan Rapor Semester Ganjil Terakhir",
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    required: true,
  },
  rapor_sem2: {
    label: "Scan Rapor Semester Genap Terakhir",
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    required: true,
  },
  nisn: {
    label: "Scan NISN",
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    required: true,
  },
  foto_setengah_badan: {
    label: "Foto Setengah Badan",
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
    ],
    required: true,
  },
  surat_kesehatan: {
    label: "Surat Keterangan Sehat",
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    required: true,
  },
  pakta_integritas_santri: {
    label: "Scan Pakta Integritas Calon Santri",
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    required: true,
  },
  pakta_integritas_ortu: {
    label: "Scan Pakta Integritas Calon Orangtua/Wali Santri",
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    required: true,
  },
  pernyataan_bebas_negatif: {
    label: "Scan Pernyataan Bebas Perilaku Negatif",
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ],
    required: true,
  },
};

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

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jenisDokumen = formData.get("jenis_dokumen") as string | null;

    if (!file || !jenisDokumen) {
      return NextResponse.json(
        { success: false, error: "File dan jenis dokumen wajib diisi" },
        { status: 400 },
      );
    }

    // 3. Validasi jenis dokumen
    const config = DOKUMEN_CONFIG[jenisDokumen];
    if (!config) {
      return NextResponse.json(
        { success: false, error: "Jenis dokumen tidak valid" },
        { status: 400 },
      );
    }

    // 4. Validasi ukuran & tipe
    if (file.size > config.maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Ukuran file terlalu besar! Maksimal ${formatFileSize(config.maxSize)}`,
        },
        { status: 400 },
      );
    }
    // 5. Detect Real Mime Type via Magic Bytes
    const buffer = Buffer.from(await file.arrayBuffer());
    const hex = buffer.slice(0, 4).toString("hex").toUpperCase();
    let detectedType = file.type || "";

    if (hex.startsWith("FFD8FF")) detectedType = "image/jpeg";
    else if (hex === "89504E47") detectedType = "image/png";
    else if (hex === "25504446") detectedType = "application/pdf";
    else if (hex === "52494646") detectedType = "image/webp"; // RIFF
    else if (["00000018", "00000020", "0000001C"].includes(hex)) detectedType = "image/heic"; // ftyp

    const isImageAllowed = config.allowedTypes.includes("image/jpeg");
    const safeFileType = detectedType;
    const isAllowedType =
      config.allowedTypes.includes(safeFileType) ||
      (isImageAllowed && safeFileType.startsWith("image/"));

    if (!isAllowedType) {
      return NextResponse.json(
        {
          success: false,
          error: `Format file tidak didukung. File Anda: ${file.type || "tidak dikenali"}`,
        },
        { status: 400 },
      );
    }

    // 6. Ambil data pendaftar (Check existence)
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: session.id },
      select: { nomor_pendaftaran: true },
    });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    const timestamp = Date.now();
    const safeFileName = file.name || "berkas_tanpa_nama.bin";
    const originalExtension =
      safeFileName.split(".").pop()?.toLowerCase() || "bin";

    // Correct extension based on detected type
    let fileExtension = originalExtension;
    if (detectedType === "image/jpeg") fileExtension = "jpg";
    else if (detectedType === "image/png") fileExtension = "png";
    else if (detectedType === "application/pdf") fileExtension = "pdf";
    else if (detectedType === "image/heic") fileExtension = "heic";
    else if (detectedType === "image/webp") fileExtension = "webp";

    const fileName = `${jenisDokumen}-${pendaftar.nomor_pendaftaran}-${timestamp}.${fileExtension}`;

    // Save to storage_data/dokumen-pendaftaran/{pendaftar_id}/...
    const filePath = await saveFileLocal(
      buffer,
      "dokumen-pendaftaran",
      session.id,
      fileName,
    );

    // 10. Check Existing
    const existingDokumen = await prisma.dokumen.findFirst({
      where: {
        pendaftar_id: session.id,
        jenis_dokumen: jenisDokumen,
      },
    });

    if (existingDokumen) {
      await prisma.dokumen.update({
        where: { id: existingDokumen.id },
        data: {
          file_name: fileName,
          file_path: filePath,
          file_size: file.size,
          file_type: detectedType, // Use detected type
          is_verified: false,
          verified_by: null,
          verified_at: null,
          catatan: null,
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.dokumen.create({
        data: {
          pendaftar_id: session.id,
          jenis_dokumen: jenisDokumen,
          file_name: fileName,
          file_path: filePath,
          file_size: file.size,
          file_type: detectedType, // Use detected type
          is_verified: false,
        },
      });
    }

    // UPDATE STATUS PENDAFTAR: REMOVED AUTO UPDATE
    // Status will be updated manually via /api/pendaftar/submit-dokumen endpoint
    // to allow users to review multiple files before "Sending" them to admin.

    // const currentPendaftar = await prisma.pendaftar.findUnique({
    //   where: { id: session.id },
    //   select: { status_pendaftaran: true }
    // });

    // if (currentPendaftar?.status_pendaftaran === 'data_completed') {
    //   await prisma.pendaftar.update({
    //     where: { id: session.id },
    //     data: { status_pendaftaran: 'docs_uploaded' }
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: `${config.label} berhasil diupload`,
      data: {
        file_name: fileName,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat mengupload file" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DOKUMEN_CONFIG,
  });
}
