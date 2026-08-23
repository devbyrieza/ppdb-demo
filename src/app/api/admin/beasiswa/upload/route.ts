import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { saveFileLocal, deleteFileLocal } from "@/lib/storage/local";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ALLOWED_FIELD_KEYS = [
  "file_sktm_path",
  "file_slip_gaji_path",
  "file_ktp_path",
  "file_ktp_ibu_path",
  "file_prestasi_path",
  "file_permohonan_path",
] as const;

type BerkasFieldKey = (typeof ALLOWED_FIELD_KEYS)[number];

const BERKAS_LABELS: Record<BerkasFieldKey, string> = {
  file_sktm_path: "Surat Keterangan Tidak Mampu (SKTM)",
  file_slip_gaji_path: "Surat Keterangan / Bukti Penghasilan (Slip Gaji)",
  file_ktp_path: "KTP Orangtua Ayah",
  file_ktp_ibu_path: "KTP Orangtua Ibu",
  file_prestasi_path: "Bukti Prestasi / Hafalan",
  file_permohonan_path: "Surat Permohonan Keringanan Biaya" };

// POST: Upload a berkas for an existing pengajuan (admin_super only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "admin_super") {
      return NextResponse.json({ error: "Forbidden: hanya admin_super yang diizinkan" }, { status: 403 });
    }

    const formData = await req.formData();
    const pendaftarId = formData.get("pendaftar_id") as string | null;
    const fieldKey = formData.get("field_key") as string | null;
    const file = formData.get("file") as File | null;

    if (!pendaftarId || !fieldKey || !file) {
      return NextResponse.json({ error: "pendaftar_id, field_key, dan file wajib diisi" }, { status: 400 });
    }

    if (!ALLOWED_FIELD_KEYS.includes(fieldKey as BerkasFieldKey)) {
      return NextResponse.json({ error: `field_key tidak valid: ${fieldKey}` }, { status: 400 });
    }

    // Check pengajuan exists
    const pengajuan = await prisma.pengajuanBeasiswa.findUnique({
      where: { pendaftar_id: pendaftarId } });

    if (!pengajuan) {
      return NextResponse.json({ error: "Pengajuan beasiswa tidak ditemukan untuk pendaftar ini" }, { status: 404 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Detect mime type via magic bytes
    const hex = buffer.slice(0, 4).toString("hex").toUpperCase();
    let detectedType = file.type || "application/octet-stream";
    if (hex.startsWith("FFD8FF")) detectedType = "image/jpeg";
    else if (hex === "89504E47") detectedType = "image/png";
    else if (hex === "25504446") detectedType = "application/pdf";
    else if (hex === "52494646") detectedType = "image/webp";

    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf", "image/heic"];
    if (!allowedMimes.includes(detectedType) && !detectedType.startsWith("image/")) {
      return NextResponse.json({ error: "Format file tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP." }, { status: 400 });
    }

    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file terlalu besar. Maksimal 10MB." }, { status: 400 });
    }

    // Determine extension
    let ext = path.extname(file.name).toLowerCase() || ".bin";
    if (detectedType === "image/jpeg") ext = ".jpg";
    else if (detectedType === "image/png") ext = ".png";
    else if (detectedType === "application/pdf") ext = ".pdf";
    else if (detectedType === "image/webp") ext = ".webp";

    const fileName = `${fieldKey}-admin-${crypto.randomBytes(6).toString("hex")}${ext}`;

    // Delete old file if exists
    const oldPath = (pengajuan as any)[fieldKey] as string | null;
    if (oldPath) {
      try { deleteFileLocal(oldPath); } catch (e) { /* ignore */ }
    }

    // Save new file
    const filePath = await saveFileLocal(buffer, "berkas-beasiswa", pendaftarId, fileName);

    // Update record
    await prisma.pengajuanBeasiswa.update({
      where: { pendaftar_id: pendaftarId },
      data: { [fieldKey]: filePath, updated_at: new Date() } });

    return NextResponse.json({
      success: true,
      message: `${BERKAS_LABELS[fieldKey as BerkasFieldKey]} berhasil diupload.`,
      data: { field_key: fieldKey, file_path: filePath } });
  } catch (error: any) {
    console.error("[admin/beasiswa/upload POST] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// DELETE: Hapus berkas tertentu dari pengajuan (admin_super only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "admin_super") {
      return NextResponse.json({ error: "Forbidden: hanya admin_super yang diizinkan" }, { status: 403 });
    }

    const body = await req.json();
    const { pendaftar_id: pendaftarId, field_key: fieldKey } = body;

    if (!pendaftarId || !fieldKey) {
      return NextResponse.json({ error: "pendaftar_id dan field_key wajib diisi" }, { status: 400 });
    }

    if (!ALLOWED_FIELD_KEYS.includes(fieldKey as BerkasFieldKey)) {
      return NextResponse.json({ error: `field_key tidak valid: ${fieldKey}` }, { status: 400 });
    }

    const pengajuan = await prisma.pengajuanBeasiswa.findUnique({
      where: { pendaftar_id: pendaftarId } });

    if (!pengajuan) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }

    const oldPath = (pengajuan as any)[fieldKey] as string | null;
    if (oldPath) {
      try { deleteFileLocal(oldPath); } catch (e) { /* ignore */ }
    }

    await prisma.pengajuanBeasiswa.update({
      where: { pendaftar_id: pendaftarId },
      data: { [fieldKey]: null, updated_at: new Date() } });

    return NextResponse.json({
      success: true,
      message: `${BERKAS_LABELS[fieldKey as BerkasFieldKey]} berhasil dihapus.` });
  } catch (error: any) {
    console.error("[admin/beasiswa/upload DELETE] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
