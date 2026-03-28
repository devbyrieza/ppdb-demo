import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Daftar semua jenis dokumen sesuai persyaratan PPDB Al-Imam
const JENIS_DOKUMEN = [
  { key: "kartu_keluarga", label: "Scan Kartu Keluarga", required: true },
  { key: "akta_kelahiran", label: "Scan Akte Kelahiran", required: true },
  { key: "rapor_sem1", label: "Scan Rapor Semester 1 Terakhir", required: true },
  { key: "rapor_sem2", label: "Scan Rapor Semester 2 Terakhir", required: true },
  { key: "nisn", label: "Scan NISN (Nomor Induk Siswa Nasional)", required: true },
  { key: "foto_setengah_badan", label: "Foto Setengah Badan", required: true },
  { key: "surat_kesehatan", label: "Surat Keterangan Sehat (Download format)", required: true },
  { key: "pakta_integritas", label: "Scan Pakta Integritas (Download format)", required: true },
  { key: "pernyataan_bebas_negatif", label: "Scan Pernyataan Bebas Perilaku Negatif (Download format)", required: true },
];

export async function GET(request: NextRequest) {
  try {
    // 1. Validasi session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan" },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid" },
        { status: 401 }
      );
    }

    if (session.role !== "pendaftar") {
      return NextResponse.json(
        { success: false, error: "Akses tidak diizinkan" },
        { status: 403 }
      );
    }

    // 2. Ambil semua dokumen pendaftar
    const dokumenList = await prisma.dokumen.findMany({
      where: { pendaftar_id: session.id },
    });

    // 3. Mapping status untuk setiap jenis dokumen
    const dokumenStatus = JENIS_DOKUMEN.map((jenis) => {
      const dokumen = dokumenList.find((d) => d.jenis_dokumen === jenis.key);

      let status: "pending" | "uploaded" | "verified" | "rejected" = "pending";
      if (dokumen) {
        if (dokumen.is_verified) {
          status = "verified";
        } else if (dokumen.catatan && !dokumen.is_verified) {
          status = "rejected";
        } else {
          status = "uploaded";
        }
      }

      return {
        key: jenis.key,
        label: jenis.label,
        required: jenis.required,
        status,
        file_name: dokumen?.file_name || null,
        file_path: dokumen?.file_path || null,
        file_size: dokumen?.file_size || null,
        file_type: dokumen?.file_type || null,
        is_verified: dokumen?.is_verified || false,
        catatan: dokumen?.catatan || null,
        uploaded_at: dokumen?.created_at || null,
        verified_at: dokumen?.verified_at || null,
      };
    });

    // 4. Hitung progress
    const totalRequired = JENIS_DOKUMEN.filter((d) => d.required).length;
    const uploadedRequired = dokumenStatus.filter(
      (d) => d.required && d.status !== "pending"
    ).length;
    const verifiedCount = dokumenStatus.filter(
      (d) => d.status === "verified"
    ).length;

    // 5. Get Pendaftar Status
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: session.id },
      select: { status_pendaftaran: true }
    });

    // 6. Return data
    return NextResponse.json({
      success: true,
      data: {
        dokumen: dokumenStatus,
        pendaftar_status: pendaftar?.status_pendaftaran || 'draft',
        summary: {
          total: JENIS_DOKUMEN.length,
          uploaded: dokumenList.length || 0,
          verified: verifiedCount,
          pending: JENIS_DOKUMEN.length - (dokumenList.length || 0),
          progress: {
            required: {
              total: totalRequired,
              uploaded: uploadedRequired,
              percentage: Math.round((uploadedRequired / totalRequired) * 100),
            },
            all: {
              total: JENIS_DOKUMEN.length,
              uploaded: dokumenList.length || 0,
              percentage: Math.round(((dokumenList.length || 0) / JENIS_DOKUMEN.length) * 100),
            },
          },
        },
      },
    });
  } catch (error: any) {
    console.error("Error in dokumen status API:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
