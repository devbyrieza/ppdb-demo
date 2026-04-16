import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // 1. Validasi session manual
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Check custom role
    const allowedRoles = ["admin", "admin_super", "admin_berkas", "admin_keuangan", "penguji"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const jenjang = searchParams.get("jenjang") || "";
    const tahunAjaran = searchParams.get("tahun_ajaran") || "";
    const provinsi = searchParams.get("provinsi") || "";
    const kabupaten = searchParams.get("kabupaten") || "";
    const kecamatan = searchParams.get("kecamatan") || "";
    const kelurahan = searchParams.get("kelurahan") || "";

    const skip = (page - 1) * limit;

    // Build filter
    const where: Prisma.PendaftarWhereInput = {
      deleted_at: null, // Exclude soft-deleted records
    };

    // Search filter
    if (search) {
      where.OR = [
        { nama_lengkap: { contains: search, mode: "insensitive" } },
        { nik: { contains: search, mode: "insensitive" } },
        { nomor_pendaftaran: { contains: search, mode: "insensitive" } },
      ];
    }

    // Status filter
    if (status) {
      const filterMapping: Record<string, string[]> = {
        belum_bayar: ["draft", "waiting_payment", "awaiting_payment"],
        menunggu_verifikasi_pembayaran: ["payment_verification"],
        sudah_bayar: ["paid", "verified", "data_completed", "docs_uploaded", "docs_verified", "scheduled", "tested", "announced", "accepted", "enrolled"],
        pembayaran_ditolak: ["rejected", "payment_rejected"],
        belum_isi_data: ["verified", "paid"],
        sudah_isi_data: ["data_completed", "docs_uploaded", "docs_verified", "scheduled", "tested", "announced", "accepted", "enrolled"],
        belum_upload_dokumen: ["data_completed"],
        menunggu_verifikasi_dokumen: ["docs_uploaded"],
        dokumen_terverifikasi: ["docs_verified", "scheduled", "tested", "announced", "accepted", "enrolled"],
        dokumen_ditolak: ["docs_rejected"],
        terjadwal_ujian: ["scheduled"],
        belum_ujian: ["scheduled"],
        sudah_ujian: ["tested", "announced", "accepted", "enrolled"],
        hasil_ujian: ["announced", "accepted", "enrolled"],
        diterima: ["accepted"],
        belum_daftar_ulang: ["accepted"],
        sudah_daftar_ulang: ["enrolled"],
      };

      const statusValues = filterMapping[status];
      if (statusValues && statusValues.length > 0) {
        where.status_pendaftaran = { in: statusValues };
      } else {
        where.status_pendaftaran = status;
      }
    }

    // Other filters
    if (jenjang) where.jenjang = jenjang;
    if (tahunAjaran) where.tahun_ajaran_id = tahunAjaran;
    if (provinsi) where.provinsi = provinsi;
    if (kabupaten) where.kabupaten = kabupaten;
    if (kecamatan) where.kecamatan = kecamatan;
    if (kelurahan) where.kelurahan = kelurahan;

    // Execute query with transaction for count and data
    const [total, data] = await prisma.$transaction([
      prisma.pendaftar.count({ where }),
      prisma.pendaftar.findMany({
        where,
        select: {
          id: true,
          nomor_pendaftaran: true,
          nik: true,
          nama_lengkap: true,
          jenis_kelamin: true,
          jenjang: true,
          tanggal_lahir: true,
          no_hp: true,
          email: true,
          status_pendaftaran: true,
          created_at: true,
          tahun_ajaran: {
            select: { nama: true }
          },
          pembayaran: {
            select: { status_pembayaran: true }
          },
          dokumen: {
            select: { jenis_dokumen: true, is_verified: true, catatan: true }
          },
          nilai_ujian: {
            select: {
              nilai_total: true,
              score_akademik: true,
              score_kepribadian: true,
              score_kesiapan: true,
              score_quran: true,
              score_wawancara: true,
              nilai_wawancara_santri: true,
              nilai_wawancara_ortu: true,
              status_kelulusan: true,
              catatan_kelulusan: true,
            }
          },
          pengumuman: {
            select: { status_kelulusan: true }
          }
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
    ]);

    // Transform data: Master Merge for NilaiUjian and document status
    const isEmpty = (v: any) => v == null || v === "" || (typeof v === 'object' && Object.keys(v).length === 0 && v.constructor === Object);
    
    const transformedData = data.map(item => {
      // 1. Merge multiple NilaiUjian records if exists
      const scores = item.nilai_ujian || [];
      let mergedNilai = null;
      
      if (scores.length > 0) {
        // Sort oldest to newest to let newer field values prevail
        const sorted = [...scores].sort((a: any, b: any) => 
          new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime()
        );
        
        const master: any = {};
        sorted.forEach(s => {
          Object.entries(s).forEach(([k, v]) => {
            if (!isEmpty(v)) master[k] = v;
          });
        });
        mergedNilai = master;
      }

      return {
        ...item,
        nilai_ujian: mergedNilai,
        dokumen: item.dokumen.map(doc => ({
          jenis_dokumen: doc.jenis_dokumen,
          status_verifikasi: doc.is_verified ? "verified" : (doc.catatan ? "rejected" : "pending")
        }))
      };
    });

    console.log(`[API] Pendaftar List: Role=${session.role}, Count=${total}, Limit=${limit}, Where=${JSON.stringify(where)}`);

    return NextResponse.json({
      data: transformedData || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in admin pendaftar list API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
