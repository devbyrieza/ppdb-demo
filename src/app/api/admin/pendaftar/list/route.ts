import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAdminWhereClause } from "@/lib/utils/admin";
import { getCache, setCache } from "@/lib/redis";

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
    const allowedRoles = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_keuangan",
      "penguji",
    ];
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
    const jenisKelamin = searchParams.get("jenis_kelamin") || "";
    const tahunAjaran = searchParams.get("tahun_ajaran") || "";
    const provinsi = searchParams.get("provinsi") || "";
    const kabupaten = searchParams.get("kabupaten") || "";
    const kecamatan = searchParams.get("kecamatan") || "";
    const kelurahan = searchParams.get("kelurahan") || "";
    const tipePendaftaran = searchParams.get("tipe_pendaftaran") || "";

    const skip = (page - 1) * limit;

    // Build filter
    const baseWhere = getAdminWhereClause(tahunAjaran || undefined) as any;
    const where: Prisma.PendaftarWhereInput = {
      ...baseWhere,
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
        sudah_bayar: [
          "paid",
          "verified",
          "data_completed",
          "docs_uploaded",
          "docs_verified",
          "scheduled",
          "tested",
          "announced",
          "accepted",
          "enrolled",
        ],
        pembayaran_ditolak: ["rejected", "payment_rejected"],
        belum_isi_data: ["verified", "paid"],
        sudah_isi_data: [
          "data_completed",
          "docs_uploaded",
          "docs_verified",
          "scheduled",
          "tested",
          "announced",
          "accepted",
          "enrolled",
        ],
        belum_upload_dokumen: ["data_completed"],
        menunggu_verifikasi_dokumen: ["docs_uploaded"],
        dokumen_terverifikasi: [
          "docs_verified",
          "scheduled",
          "tested",
          "passed",
          "announced",
          "accepted",
          "enrolled",
        ],
        dokumen_ditolak: ["docs_rejected"],
        terjadwal_ujian: ["scheduled", "selection"],
        sedang_seleksi: ["selection", "scheduled", "testing"],
        belum_ujian: ["scheduled", "selection"],
        tested: ["tested", "passed", "announced", "accepted", "enrolled"], // Matches UI filter
        sudah_ujian: ["tested", "passed", "announced", "accepted", "enrolled"],
        hasil_ujian: ["passed", "announced", "accepted", "enrolled"],
        diterima: ["accepted", "passed"],
        cadangan: ["cadangan"],
        ditolak: ["rejected", "docs_rejected"],
        belum_daftar_ulang: ["accepted"],
        sudah_daftar_ulang: ["enrolled"],
        mengundurkan_diri: ["mengundurkan_diri"],
      };

      const statusValues = filterMapping[status];
      if (statusValues && statusValues.length > 0) {
        where.status_pendaftaran = { in: statusValues };
      } else {
        where.status_pendaftaran = status;
      }
    } else {
      where.status_pendaftaran = { not: "mengundurkan_diri" };
    }

    // Other filters
    if (jenjang) {
      where.jenjang = { contains: jenjang, mode: "insensitive" };
    }
    if (jenisKelamin) {
      where.jenis_kelamin = { contains: jenisKelamin, mode: "insensitive" };
    }
    if (tahunAjaran) where.tahun_ajaran_id = tahunAjaran;
    if (provinsi) where.provinsi = provinsi;
    if (kabupaten) where.kabupaten = kabupaten;
    if (kecamatan) where.kecamatan = kecamatan;
    if (kelurahan) where.kelurahan = kelurahan;
    if (tipePendaftaran) where.tipe_pendaftaran = tipePendaftaran;

    // Execute query with transaction for count and data
    // Execute query with transaction for count and data

    // === REDIS CACHE CHECK ===
    const cacheKey = `admin_pendaftar_list_${tahunAjaran}_${page}_${limit}_${search}_${status}_${jenjang}_${jenisKelamin}_${tipePendaftaran}_${provinsi}_${kabupaten}_${kecamatan}_${kelurahan}`;
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      console.log(`⚡ [API Pendaftar List] Mengembalikan data dari Redis Cache!`);
      return NextResponse.json(cachedData);
    }
    // =========================

    const total = await prisma.pendaftar.count({ where });

    const data = await prisma.pendaftar.findMany({
      where,
      select: {
        id: true,
        nomor_pendaftaran: true,
        nik: true,
        nama_lengkap: true,
        jenis_kelamin: true,
        jenjang: true,
        tipe_pendaftaran: true,
        tanggal_lahir: true,
        no_hp: true,
        email: true,
        status_pendaftaran: true,
        created_at: true,
        tahun_ajaran: {
          select: {
            nama: true,
          },
        },
        pembayaran: {
          select: { status_pembayaran: true },
        },
        dokumen: {
          select: { jenis_dokumen: true, is_verified: true, catatan: true },
        },
        nilai_ujian: {
          select: {
            id: true,
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
            updated_at: true,
          },
        },
        pengumuman: {
          select: { status_kelulusan: true },
        },
        whatsapp_logs: {
          orderBy: { created_at: "desc" },
          take: 1,
          select: { status: true, updated_at: true, error_message: true },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    });

    // Transform data: Master Merge for NilaiUjian and document status
    const isEmpty = (v: any) => {
      if (v == null || v === "") return true;
      if (typeof v === "object") {
        if (Array.isArray(v)) return v.length === 0;
        const keys = Object.keys(v);
        if (keys.length === 0) return true;
        // Check if all values are null or empty
        return keys.every((key) => v[key] == null || v[key] === "");
      }
      return false;
    };

    const transformedData = data.map((item) => {
      // 1. Merge multiple NilaiUjian records if exists
      const scores = item.nilai_ujian || [];
      let mergedNilai = null;

      if (scores.length > 0) {
        // Sort newest to oldest so first non-empty value found is the newest
        const sorted = [...scores].sort(
          (a: any, b: any) =>
            new Date(b.updated_at || 0).getTime() -
            new Date(a.updated_at || 0).getTime(),
        );

        const master: any = {};
        sorted.forEach((s) => {
          Object.entries(s).forEach(([k, v]) => {
            // Pick newest non-empty value
            if (!isEmpty(v) && isEmpty(master[k])) {
              master[k] = v;
            }
          });
        });
        mergedNilai = master;
      }

      // 2. Count completed score components (6 total)
      let examScoreCount = 0;
      if (mergedNilai) {
        if (mergedNilai.score_akademik != null) examScoreCount++;
        if (mergedNilai.score_kepribadian != null) examScoreCount++;
        if (mergedNilai.score_kesiapan != null) examScoreCount++;
        if (mergedNilai.score_quran != null) examScoreCount++;
        if (mergedNilai.nilai_wawancara_santri != null) examScoreCount++;
        if (mergedNilai.nilai_wawancara_ortu != null) examScoreCount++;
      }

      // 3. Derive virtual exam_status label for UI
      const sp = (item as any).status_pendaftaran;
      const examProgressStatuses = [
        "scheduled",
        "testing",
        "tested",
        "passed",
        "announced",
        "accepted",
        "enrolled",
      ];
      let examStatus = sp;
      if (examProgressStatuses.includes(sp)) {
        if (examScoreCount === 6 || sp === "passed") {
          examStatus = "tested"; // Sedang Seleksi / Passed by skip-ujian
        } else if (examScoreCount > 0) {
          examStatus = "testing"; // Sedang Ujian
        } else {
          examStatus = "scheduled"; // Terjadwal, belum ada nilai
        }
      }

      return {
        ...item,
        nilai_ujian: mergedNilai,
        exam_score_count: examScoreCount,
        exam_status: examStatus,
        whatsapp_status: item.whatsapp_logs?.[0] || null,
        dokumen: item.dokumen.map((doc) => ({
          jenis_dokumen: doc.jenis_dokumen,
          status_verifikasi: doc.is_verified
            ? "verified"
            : doc.catatan
              ? "rejected"
              : "pending",
        })),
      };
    });

    // Hapus console.log verbose di sini

    const responseData = {
      data: transformedData || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Simpan ke Redis selama 60 detik
    await setCache(cacheKey, responseData, 60);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in admin pendaftar list API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
