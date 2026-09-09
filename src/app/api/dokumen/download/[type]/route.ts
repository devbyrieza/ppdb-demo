import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  generateSuratKesehatan,
  generateSuratPernyataan,
  generatePaktaIntegritas,
  generateBuktiPendaftaran,
  generateKartuUjian,
  PendaftarPdfData,
} from "@/lib/utils/pdf-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const { type } = await params;
    const searchParams = request.nextUrl.searchParams;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session") || cookieStore.get("app_session");

    let pendaftar: any = null;

    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        let pendaftarId = session.id;

        if (session.role === "admin" || session.role === "admin_super" || session.role === "admin_berkas") {
          const qId = searchParams.get("pendaftar_id");
          if (qId) {
            pendaftarId = qId;
          } else {
            pendaftarId = null; // Admin downloading clean official blank template
          }
        }

        if (pendaftarId) {
          pendaftar = await prisma.pendaftar.findUnique({
            where: { id: pendaftarId },
            include: { tahun_ajaran: true },
          });
        }
      } catch (err) {
        console.warn("Error parsing session cookie:", err);
      }
    }

    // Prepare PDF data (Filled if pendaftar exists, or official blank dots if downloading clean format)
    const pdfData: PendaftarPdfData = {
      nomor_pendaftaran: pendaftar?.nomor_pendaftaran || "..................................................",
      nama_lengkap: pendaftar?.nama_lengkap || "....................................................................",
      nik: pendaftar?.nik || "..................................................",
      jenjang: pendaftar?.jenjang || "MTs / I'dad Lughawiy / MA",
      tempat_lahir: pendaftar?.tempat_lahir || "........................................",
      tanggal_lahir: pendaftar?.tanggal_lahir
        ? new Date(pendaftar.tanggal_lahir).toLocaleDateString("id-ID")
        : "....................",
      alamat: pendaftar?.alamat || "....................................................................................................",
      no_hp: pendaftar?.no_hp || "........................................",
      tahun_ajaran: pendaftar?.tahun_ajaran?.nama || "2027/2028",
    };

    const normType = (type || "").toLowerCase().replace(/_/g, "-");
    const suffix = pendaftar?.nomor_pendaftaran && pendaftar.nomor_pendaftaran !== "-"
      ? `_${pendaftar.nomor_pendaftaran}`
      : "_Format_Panitia";

    let doc: any = null;
    let filename = `Template_Dokumen${suffix}.pdf`;

    if (normType.includes("kesehatan") || normType.includes("sehat")) {
      doc = await generateSuratKesehatan(pdfData);
      filename = `Format_Surat_Keterangan_Sehat${suffix}.pdf`;
    } else if (normType === "pakta-integritas-santri" || normType === "pakta_integritas_santri") {
      doc = await (generatePaktaIntegritas as any)(pdfData, "santri");
      filename = `Format_Pakta_Integritas_Calon_Santri${suffix}.pdf`;
    } else if (normType === "pakta-integritas-ortu" || normType === "pakta_integritas_ortu" || normType === "pakta-integritas-wali") {
      doc = await (generatePaktaIntegritas as any)(pdfData, "ortu");
      filename = `Format_Pakta_Integritas_Calon_OrangTua_Wali${suffix}.pdf`;
    } else if (normType.includes("pakta") || normType.includes("integritas")) {
      doc = await (generatePaktaIntegritas as any)(pdfData, "both");
      filename = `Format_Pakta_Integritas_Santri_dan_OrangTua${suffix}.pdf`;
    } else if (
      normType.includes("pernyataan") ||
      normType.includes("bebas") ||
      normType.includes("perilaku")
    ) {
      doc = await generateSuratPernyataan(pdfData);
      filename = `Format_Surat_Pernyataan_Bebas_Perilaku_Buruk${suffix}.pdf`;
    } else if (normType.includes("bukti")) {
      doc = await generateBuktiPendaftaran(pdfData);
      filename = `Bukti_Pendaftaran${suffix}.pdf`;
    } else if (normType.includes("kartu") || normType.includes("ujian") || normType.includes("seleksi")) {
      doc = await generateKartuUjian(pdfData);
      filename = `Kartu_Ujian_Seleksi${suffix}.pdf`;
    } else {
      doc = await (generatePaktaIntegritas as any)(pdfData, "both");
      filename = `Format_Dokumen${suffix}.pdf`;
    }

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Gagal men-generate dokumen PDF" },
        { status: 500 },
      );
    }

    const pdfOutput = doc.output("arraybuffer");
    const isDownload = searchParams.get("download") === "1" || searchParams.get("download") === "true";
    const disposition = isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`;

    return new NextResponse(pdfOutput, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF template:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat generate PDF: " + (error.message || "") },
      { status: 500 },
    );
  }
}
