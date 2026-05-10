import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { saveFileLocal } from "@/lib/storage/local";
import { notifyDocumentVerified } from "@/lib/wablas";

// Konfigurasi dokumen
const DOKUMEN_CONFIG: Record<
  string,
  {
    label: string;
    maxSize: number;
    allowedTypes: string[];
  }
> = {
  kartu_keluarga: {
    label: "Scan Kartu Keluarga",
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  akta_kelahiran: {
    label: "Scan Akte Kelahiran",
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  rapor_sem1: {
    label: "Scan Rapor Semester Ganjil Terakhir",
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  rapor_sem2: {
    label: "Scan Rapor Semester Genap Terakhir",
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  nisn: {
    label: "Scan NISN",
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  foto_setengah_badan: {
    label: "Foto Setengah Badan",
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png"],
  },
  surat_kesehatan: {
    label: "Surat Keterangan Sehat",
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  pakta_integritas_santri: {
    label: "Scan Pakta Integritas Calon Santri",
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  pakta_integritas_ortu: {
    label: "Scan Pakta Integritas Calon Orangtua/Wali Santri",
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  pernyataan_bebas_negatif: {
    label: "Scan Pernyataan Bebas Perilaku Negatif",
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export async function POST(request: NextRequest) {
  try {
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

    // Hanya admin yang bisa akses endpoint ini
    const allowedRoles = ["admin_berkas", "admin", "admin_super"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    let jenisDokumen = formData.get("jenis_dokumen") as string | null;
    const pendaftarId = formData.get("pendaftar_id") as string | null;

    // Normalisasi legacy key agar kompatibel dengan DOKUMEN_CONFIG modern
    if (jenisDokumen === "pakta_integritas") {
      jenisDokumen = "pakta_integritas_santri";
    }

    if (!file || !jenisDokumen || !pendaftarId) {
      return NextResponse.json(
        {
          success: false,
          error: "File, jenis dokumen, dan pendaftar ID wajib diisi",
        },
        { status: 400 },
      );
    }

    const config = DOKUMEN_CONFIG[jenisDokumen];
    if (!config) {
      return NextResponse.json(
        { success: false, error: "Jenis dokumen tidak valid" },
        { status: 400 },
      );
    }

    if (file.size > config.maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Ukuran file terlalu besar! Maksimal ${formatFileSize(config.maxSize)}`,
        },
        { status: 400 },
      );
    }

    if (!config.allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Format file tidak didukung" },
        { status: 400 },
      );
    }

    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: { nomor_pendaftaran: true },
    });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    // 5. Detect Real Mime Type via Magic Bytes
    const buffer = Buffer.from(await file.arrayBuffer());
    const hex = buffer.slice(0, 4).toString("hex").toUpperCase();
    let detectedType = file.type;

    if (hex.startsWith("FFD8FF")) detectedType = "image/jpeg";
    else if (hex === "89504E47") detectedType = "image/png";
    else if (hex === "25504446") detectedType = "application/pdf";

    const originalExtension =
      file.name.split(".").pop()?.toLowerCase() || "bin";

    // Correct extension based on detected type
    let fileExtension = originalExtension;
    if (detectedType === "image/jpeg") fileExtension = "jpg";
    else if (detectedType === "image/png") fileExtension = "png";
    else if (detectedType === "application/pdf") fileExtension = "pdf";

    const timestamp = Date.now();
    const fileName = `${pendaftar.nomor_pendaftaran}_${jenisDokumen}_admin_${timestamp}.${fileExtension}`;

    // Upload via helper function local storage
    const filePath = await saveFileLocal(
      buffer,
      "dokumen-pendaftaran",
      pendaftarId,
      fileName,
    );

    const existingDokumen = await prisma.dokumen.findFirst({
      where: {
        pendaftar_id: pendaftarId,
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
          is_verified: true, // admin mengupload otomatis verified
          verified_by: session.id,
          verified_at: new Date(),
          catatan: "Diubah dan disetujui oleh Admin",
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.dokumen.create({
        data: {
          pendaftar_id: pendaftarId,
          jenis_dokumen: jenisDokumen,
          file_name: fileName,
          file_path: filePath,
          file_size: file.size,
          file_type: detectedType, // Use detected type
          is_verified: true,
          verified_by: session.id,
          catatan: "Diunggah oleh Admin",
        },
      });
    }

    const updatedFilePath = filePath;

    // ============================================================
    // AUTO-UNLOCK & NOTIFY: Check if all required documents are now verified
    // ============================================================
    const REQUIRED_DOCS = [
      "kartu_keluarga",
      "akta_kelahiran",
      "rapor_sem1",
      "rapor_sem2",
      "nisn",
      "foto_setengah_badan",
      "surat_kesehatan",
      "pakta_integritas_santri",
  "pakta_integritas_ortu",
      "pernyataan_bebas_negatif",
    ];

    const allDocsRaw = await prisma.dokumen.findMany({
      where: { pendaftar_id: pendaftarId },
    });

    // Use same logic as main route: filter to required types
    const allDocs = allDocsRaw.filter((d) =>
      REQUIRED_DOCS.includes(d.jenis_dokumen),
    );
    const verifiedTypes = new Set(
      allDocs.filter((d) => d.is_verified).map((d) => d.jenis_dokumen),
    );
    const allRequiredVerified = REQUIRED_DOCS.every((type) =>
      verifiedTypes.has(type),
    );

    if (allRequiredVerified) {
      const currentPendaftar = await prisma.pendaftar.findUnique({
        where: { id: pendaftarId },
        select: { status_pendaftaran: true, no_hp: true, nama_lengkap: true },
      });

      // Update status only if still in docs_uploaded (advance)
      if (currentPendaftar?.status_pendaftaran === "docs_uploaded") {
        await prisma.pendaftar.update({
          where: { id: pendaftarId },
          data: { status_pendaftaran: "docs_verified" },
        });
        console.log(
          `✅ [Admin Upload] Auto-unlocked pendaftar ${pendaftarId} to docs_verified`,
        );
      }

      // ALWAYS send notification if they are complete (even if status was already docs_verified)
      // This handles cases where a document was re-uploaded/corrected.
      if (currentPendaftar?.no_hp) {
        try {
          const docListStr = `Lengkap (${REQUIRED_DOCS.length}/${REQUIRED_DOCS.length} Dokumen Terverifikasi)`;

          // Use enqueueWhatsapp for consistency with main route and anti-spam protection
          const { enqueueWhatsapp, buildMessageDocumentVerified } =
            await import("@/lib/whatsapp-queue");
          await enqueueWhatsapp({
            pendaftarId: pendaftarId,
            phone: currentPendaftar.no_hp,
            jenisNotif: "document_verified",
            messageContent: buildMessageDocumentVerified(
              currentPendaftar.nama_lengkap,
              docListStr,
            ),
          });
          console.log(
            `📥 [Admin Upload] Queued document_verified for ${pendaftarId}`,
          );
        } catch (waError) {
          console.error(
            "WhatsApp notification error after admin upload:",
            waError,
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${config.label} berhasil diubah oleh Admin`,
      data: { file_path: updatedFilePath },
    });
  } catch (error: any) {
    console.error("Admin upload dokumen error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat mengubah file" },
      { status: 500 },
    );
  }
}
