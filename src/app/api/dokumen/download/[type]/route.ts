import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  generateSuratKesehatan,
  generateSuratPernyataan,
  generatePaktaIntegritas,
  PendaftarPdfData } from "@/lib/utils/pdf-generator";
import { jsPDF } from "jspdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const { type } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const session = JSON.parse(sessionCookie.value);

    // Admin has access to download without fetching full pendaftar by default
    let pendaftarId = session.id;
    if (session.role === "admin") {
      // Allow admin to specify pendaftar_id query param
      const searchParams = request.nextUrl.searchParams;
      const qId = searchParams.get("pendaftar_id");
      if (qId) {
        pendaftarId = qId;
      } else {
        return NextResponse.json(
          { success: false, error: "Pendaftar ID required for admin" },
          { status: 400 },
        );
      }
    }

    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      include: {
        tahun_ajaran: true } });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    const pdfData: PendaftarPdfData = {
      nomor_pendaftaran: pendaftar.nomor_pendaftaran,
      nama_lengkap: pendaftar.nama_lengkap,
      nik: pendaftar.nik || "-",
      jenjang: pendaftar.jenjang,
      tempat_lahir: pendaftar.tempat_lahir || "",
      tanggal_lahir: pendaftar.tanggal_lahir
        ? new Date(pendaftar.tanggal_lahir).toLocaleDateString("id-ID")
        : "",
      alamat: pendaftar.alamat || "",
      no_hp: pendaftar.no_hp || "",
      tahun_ajaran: pendaftar.tahun_ajaran?.nama || "2027/2028" };

    let pdfOutput: ArrayBuffer | null = null;
    let filename = `Template_${type}_${pendaftar.nomor_pendaftaran}.pdf`;

    let doc: any = null;
    if (type === "surat-kesehatan") {
      doc = await generateSuratKesehatan(pdfData);
    } else if (type === "surat-pernyataan") {
      doc = await generateSuratPernyataan(pdfData);
    } else if (type === "pakta-integritas") {
      doc = await generatePaktaIntegritas(pdfData);
    } else {
      return NextResponse.json(
        { success: false, error: "Tipe dokumen tidak valid" },
        { status: 400 },
      );
    }

    if (doc) {
      pdfOutput = doc.output("arraybuffer");
    }

    if (!pdfOutput) {
      return NextResponse.json(
        { success: false, error: "Gagal men-generate PDF" },
        { status: 500 },
      );
    }

    // Return the PDF buffer directly
    return new NextResponse(pdfOutput, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"` } });
  } catch (error: any) {
    console.error("Error generating PDF template:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat generate PDF" },
      { status: 500 },
    );
  }
}
