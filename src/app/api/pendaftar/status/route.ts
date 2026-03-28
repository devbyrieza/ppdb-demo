/**
 * GET /api/pendaftar/status
 * Mengambil status pendaftaran untuk layout dashboard
 * Query: pendaftar_id (dari session)
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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
        updated_at: true,
        pengumuman: {
          select: {
            status_kelulusan: true,
            catatan: true,
            surat_keputusan_url: true
          }
        }
      },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Failed to fetch status" },
        { status: 404 },
      );
    }

    // select nilai_ujian status
    const dataWithNilai = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      include: {
        nilai_ujian: true
      }
    });

    const nilai = dataWithNilai?.nilai_ujian[0];

    // status_proses = status_pendaftaran (kompatibel dengan access-control)
    return NextResponse.json({
      id: data.id,
      nama_lengkap: data.nama_lengkap,
      nomor_pendaftaran: data.nomor_pendaftaran,
      status_proses: data.status_pendaftaran || "draft",
      updated_at: data.updated_at,
      hasil_kelulusan: {
        status: (nilai as any)?.status_kelulusan || null,
        catatan: (nilai as any)?.catatan_kelulusan || null
      }
    });
  } catch (error) {
    console.error("Error in status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
