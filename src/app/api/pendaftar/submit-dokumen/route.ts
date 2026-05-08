import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Dokumen yang wajib ada
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

    // 2. Cek kelengkapan dokumen
    const uploadedDocs = await prisma.dokumen.findMany({
      where: {
        pendaftar_id: session.id,
      },
      select: {
        jenis_dokumen: true,
      },
    });

    const uploadedTypes = new Set(uploadedDocs.map((d) => d.jenis_dokumen));
    const missingDocs = REQUIRED_DOCS.filter((doc) => !uploadedTypes.has(doc));

    if (missingDocs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Dokumen belum lengkap. Harap upload semua dokumen wajib.",
          missing: missingDocs,
        },
        { status: 400 },
      );
    }

    // 3. Update status pendaftar
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: session.id },
      select: { status_pendaftaran: true },
    });

    // Hanya update jika statusnya masih 'data_completed' atau 'docs_uploaded' (re-submit) atau 'verified'
    // Jika sudah 'docs_verified', jangan diubah mundur
    if (
      ["data_completed", "docs_uploaded", "verified"].includes(
        pendaftar?.status_pendaftaran || "",
      )
    ) {
      await prisma.pendaftar.update({
        where: { id: session.id },
        data: {
          status_pendaftaran: "docs_uploaded",
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "Berkas berhasil dikirim! Tim kami akan memverifikasi dokumen Anda.",
    });
  } catch (error: any) {
    console.error("Submit docs error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
