import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET: Generate signed URL untuk preview dokumen
export async function GET(request: NextRequest) {
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

    // 2. Ambil parameter
    const { searchParams } = new URL(request.url);
    const jenisDokumen = searchParams.get("jenis");

    if (!jenisDokumen) {
      return NextResponse.json(
        { success: false, error: "Jenis dokumen wajib diisi" },
        { status: 400 },
      );
    }

    // 3. Cari dokumen di database
    const dokumen = await prisma.dokumen.findFirst({
      where: {
        pendaftar_id: session.id,
        jenis_dokumen: jenisDokumen,
      },
      select: {
        file_path: true,
        file_type: true,
        updated_at: true, // Select updated_at for cache busting
      },
    });

    if (!dokumen) {
      return NextResponse.json(
        { success: false, error: "Dokumen tidak ditemukan" },
        { status: 404 },
      );
    }

    // 4. Generate URL pointing to our local file serving API
    // file_path stored in DB is relative: "dokumen-pendaftaran/USER_ID/filename.pdf"
    // Our API route: /api/files/dokumen-pendaftaran/USER_ID/filename.pdf
    const timestamp = dokumen.updated_at
      ? new Date(dokumen.updated_at).getTime()
      : Date.now();
    const fileUrl = `/api/files/${dokumen.file_path}?t=${timestamp}`;

    // 5. Return URL
    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        file_type: dokumen.file_type,
        expires_in: 3600, // Not actually expiring, but for compatibility
      },
    });
  } catch (error: any) {
    console.error("Preview error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
