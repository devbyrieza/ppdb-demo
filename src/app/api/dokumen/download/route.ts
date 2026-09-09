import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jenis = searchParams.get("jenis") || searchParams.get("type");

    if (!jenis) {
      return NextResponse.json(
        { success: false, error: "Parameter jenis dokumen wajib diisi" },
        { status: 400 }
      );
    }

    const normKey = jenis.toLowerCase().replace(/_/g, "-");

    // Check if it's a panitia template
    if (
      normKey.includes("kesehatan") ||
      normKey.includes("sehat") ||
      normKey.includes("pakta") ||
      normKey.includes("integritas") ||
      normKey.includes("pernyataan") ||
      normKey.includes("bebas")
    ) {
      let mappedType = "pakta-integritas";
      if (normKey.includes("kesehatan") || normKey.includes("sehat")) {
        mappedType = "surat-kesehatan";
      } else if (normKey === "pakta-integritas-santri") {
        mappedType = "pakta-integritas-santri";
      } else if (normKey === "pakta-integritas-ortu" || normKey === "pakta-integritas-wali") {
        mappedType = "pakta-integritas-ortu";
      } else if (normKey.includes("pakta") || normKey.includes("integritas")) {
        mappedType = "pakta-integritas";
      } else if (normKey.includes("pernyataan") || normKey.includes("bebas")) {
        mappedType = "surat-pernyataan";
      }

      const acceptHeader = request.headers.get("accept") || "";
      const isJsonRequest = acceptHeader.includes("application/json");

      if (isJsonRequest) {
        return NextResponse.json({
          success: true,
          data: { url: `/api/dokumen/download/${mappedType}?v=${Date.now()}` }
        });
      }

      // Direct navigation -> redirect to the typed endpoint
      return NextResponse.redirect(new URL(`/api/dokumen/download/${mappedType}?v=${Date.now()}`, request.url));
    }

    // Otherwise, it's an uploaded document file
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session") || cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan" },
        { status: 401 }
      );
    }

    let session: any = null;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ success: false, error: "Sesi tidak valid" }, { status: 401 });
    }

    const dokumen = await prisma.dokumen.findFirst({
      where: {
        pendaftar_id: session.id,
        jenis_dokumen: jenis,
      },
      select: {
        file_path: true,
        file_type: true,
        updated_at: true,
      },
    });

    if (!dokumen || !dokumen.file_path) {
      return NextResponse.json(
        { success: false, error: "Dokumen belum diupload atau tidak ditemukan" },
        { status: 404 }
      );
    }

    const fileUrl = `/api/files/${dokumen.file_path}`;
    const acceptHeader = request.headers.get("accept") || "";
    if (acceptHeader.includes("application/json")) {
      return NextResponse.json({
        success: true,
        data: { url: fileUrl, file_type: dokumen.file_type }
      });
    }

    return NextResponse.redirect(new URL(fileUrl, request.url));
  } catch (error: any) {
    console.error("Download route error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server: " + (error.message || "") },
      { status: 500 }
    );
  }
}
