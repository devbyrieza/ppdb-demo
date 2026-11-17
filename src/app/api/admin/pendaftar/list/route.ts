import type { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/redis";
import { getAdminWhereClause, resolveTahunAjaranId } from "@/lib/utils/admin";

export async function GET(request: NextRequest) {
  try {
    // 1. Validasi session manual
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

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

    // Auto-sync prefix: Pastikan seluruh pendaftar di Al-Imam (Putri) menggunakan prefix MTI, ILI, MAI
    try {
      const mismatched = await prisma.pendaftar.findMany({
        where: {
          OR: [
            { nomor_pendaftaran: { startsWith: "MTA" } },
            { nomor_pendaftaran: { startsWith: "ILA" } },
            { nomor_pendaftaran: { startsWith: "MAA" } },
            { nomor_pendaftaran: { startsWith: "SMA" } },
            { jenis_kelamin: "L" },
          ],
        },
        select: {
          id: true,
          nomor_pendaftaran: true,
          jenjang: true,
          jenis_kelamin: true,
          data_lengkap: true,
        },
        orderBy: { nomor_pendaftaran: "asc" },
        take: 100,
      });

      if (mismatched.length > 0) {
        const reservedNomor = new Set<string>();

        for (const item of mismatched) {
          let targetPrefix = "MTI";
          const normJ = (item.jenjang || "").toUpperCase();
          if (normJ.includes("IL")) targetPrefix = "ILI";
          else if (normJ.includes("MA") || normJ.includes("SMA")) targetPrefix = "MAI";
          else targetPrefix = "MTI";

          let newNomor = item.nomor_pendaftaran;
          if (item.nomor_pendaftaran && /^(MTA|ILA|MAA|SMA|SPA)/.test(item.nomor_pendaftaran)) {
            const tahun = item.nomor_pendaftaran.slice(3, 5);
            const candidate = `${targetPrefix}${item.nomor_pendaftaran.slice(3)}`;

            const conflict = await prisma.pendaftar.findUnique({
              where: { nomor_pendaftaran: candidate },
            });
            if ((!conflict || conflict.id === item.id) && !reservedNomor.has(candidate)) {
              newNomor = candidate;
            } else {
              const existingList = await prisma.pendaftar.findMany({
                where: { nomor_pendaftaran: { startsWith: `${targetPrefix}${tahun}` } },
                select: { nomor_pendaftaran: true },
              });
              const usedSeqs = new Set(
                existingList
                  .map((p) => parseInt(p.nomor_pendaftaran.slice(5), 10))
                  .filter((n) => !isNaN(n))
              );
              let nextSeq = 1;
              while (
                usedSeqs.has(nextSeq) ||
                reservedNomor.has(`${targetPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`)
              ) {
                nextSeq++;
              }
              newNomor = `${targetPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`;
            }
            reservedNomor.add(newNomor);
          }

          const updateData: any = {};
          if (newNomor !== item.nomor_pendaftaran) {
            updateData.nomor_pendaftaran = newNomor;
            const dl = (item.data_lengkap as any) || {};
            dl.legacy_nomor_pendaftaran = item.nomor_pendaftaran;
            updateData.data_lengkap = dl;
          }
          if (item.jenis_kelamin !== "P") {
            updateData.jenis_kelamin = "P";
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.pendaftar.update({
              where: { id: item.id },
              data: updateData,
            });
          }
        }
      }
    } catch (e: any) {
      console.warn("[AUTO-SYNC-PREFIX-ALIMAM] Warning:", e?.message);
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
    const baseWhere = (await getAdminWhereClause(tahunAjaran || "all")) as any;
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

    // Status filter mapping
    if (status && status !== "all") {
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
        sedang_seleksi: ["selection", "scheduled", "testing", "tested"],
        belum_ujian: ["scheduled", "selection"],
        tested: ["tested", "passed", "announced", "accepted", "enrolled"],
        sudah_ujian: ["tested", "passed", "announced", "accepted", "enrolled"],
        hasil_ujian: ["passed", "announced", "accepted", "enrolled"],
        diterima: ["accepted", "passed"],
        cadangan: ["cadangan", "announced"],
        ditolak: ["rejected", "docs_rejected"],
        belum_daftar_ulang: ["accepted"],
        sudah_daftar_ulang: ["enrolled"],
        mengundurkan_diri: ["mengundurkan_diri"],
      };

      if (status.includes(",")) {
        const parts = status
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const allMapped: string[] = [];
        for (const part of parts) {
          if (filterMapping[part]) {
            allMapped.push(...filterMapping[part]);
          } else {
            allMapped.push(part);
          }
        }
        where.status_pendaftaran = { in: Array.from(new Set(allMapped)) };
      } else {
        const statusValues = filterMapping[status];
        if (statusValues && statusValues.length > 0) {
          where.status_pendaftaran = { in: statusValues };
        } else {
          where.status_pendaftaran = status;
        }
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
    if (tahunAjaran === "all" || tahunAjaran === "ALL") {
      delete where.tahun_ajaran_id;
    } else if (tahunAjaran) {
      const resolvedTaId = await resolveTahunAjaranId(tahunAjaran);
      if (resolvedTaId) {
        where.tahun_ajaran_id = resolvedTaId;
      }
    }
    if (provinsi) where.provinsi = provinsi;
    if (kabupaten) where.kabupaten = kabupaten;
    if (kecamatan) where.kecamatan = kecamatan;
    if (kelurahan) where.kelurahan = kelurahan;
    if (tipePendaftaran) where.tipe_pendaftaran = tipePendaftaran;

    // === REDIS CACHE CHECK ===
    const cacheKey = `admin_pendaftar_list_${tahunAjaran}_${page}_${limit}_${search}_${status}_${jenjang}_${jenisKelamin}_${tipePendaftaran}_${provinsi}_${kabupaten}_${kecamatan}_${kelurahan}`;
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
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
        tahun_ajaran_id: true,
        data_lengkap: true,
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
            detail_akademik: true,
            score_hafalan: true,
            score_arab: true,
            nilai_hafalan_total: true,
            nilai_arab_total: true,
            catatan_quran: true,
            catatan_santri: true,
            catatan_ortu: true,
            catatan_hafalan: true,
            catatan_arab: true,
            catatan_tes_tertulis: true,
            catatan_umum: true,
            detail_quran: true,
            detail_wawancara: true,
            detail_cawalsan: true,
            detail_hafalan: true,
            detail_arab: true,
            input_by_quran: true,
            input_by_santri: true,
            input_by_ortu: true,
            input_by_hafalan: true,
            input_by_arab: true,
            input_by_quran_profile: {
              select: { id: true, full_name: true },
            },
            input_by_santri_profile: {
              select: { id: true, full_name: true },
            },
            input_by_ortu_profile: {
              select: { id: true, full_name: true },
            },
            input_by_hafalan_profile: {
              select: { id: true, full_name: true },
            },
            input_by_arab_profile: {
              select: { id: true, full_name: true },
            },
          },
        },
        pengumuman: {
          select: { status_kelulusan: true, is_published: true, surat_pengumuman_path: true },
        },
        orang_tua: {
          select: {
            nama_ayah: true,
            no_hp_ayah: true,
            nama_ibu: true,
            no_hp_ibu: true,
            nama_wali: true,
            no_hp_wali: true,
          },
        },
        jadwal_ujian: {
          select: {
            id: true,
            tanggal_ujian: true,
            metode_ujian: true,
            status_quran: true,
            status_santri: true,
            status_ortu: true,
            penguji_quran_id: true,
            penguji_santri_id: true,
            penguji_ortu_id: true,
            penguji_hafalan_id: true,
            penguji_arab_id: true,
            penguji_quran: {
              select: { id: true, full_name: true, phone: true },
            },
            penguji_santri: {
              select: { id: true, full_name: true, phone: true },
            },
            penguji_ortu: {
              select: { id: true, full_name: true, phone: true },
            },
            penguji_hafalan: {
              select: { id: true, full_name: true, phone: true },
            },
            penguji_arab: {
              select: { id: true, full_name: true, phone: true },
            },
          },
          take: 1,
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

    const isEmpty = (v: any) => {
      if (v == null || v === "") return true;
      if (typeof v === "object") {
        if (Array.isArray(v)) return v.length === 0;
        const keys = Object.keys(v);
        if (keys.length === 0) return true;
        return keys.every((key) => v[key] == null || v[key] === "");
      }
      return false;
    };

    const transformedData = data.map((item) => {
      const scores = item.nilai_ujian || [];
      let mergedNilai = null;

      if (scores.length > 0) {
        const sorted = [...scores].sort(
          (a: any, b: any) =>
            new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        );

        const master: any = {};
        sorted.forEach((s) => {
          Object.entries(s).forEach(([k, v]) => {
            if (!isEmpty(v) && isEmpty(master[k])) {
              master[k] = v;
            }
          });
        });
        mergedNilai = master;
      }

      let examScoreCount = 0;
      if (mergedNilai) {
        if (mergedNilai.score_quran != null) examScoreCount++;
        if (mergedNilai.score_akademik != null) examScoreCount++;
        if (mergedNilai.score_kepribadian != null) examScoreCount++;
        if (mergedNilai.nilai_wawancara_santri != null || mergedNilai.score_wawancara != null) examScoreCount++;
        if (mergedNilai.nilai_wawancara_ortu != null) examScoreCount++;
        if (mergedNilai.score_kesiapan != null) examScoreCount++;
        if (mergedNilai.score_hafalan != null) examScoreCount++;
        if (mergedNilai.score_arab != null) examScoreCount++;
      }

      const jadwalList = item.jadwal_ujian || [];
      const j = jadwalList[0];
      const hasValidJadwal =
        Boolean(j && j.tanggal_ujian) ||
        ["scheduled", "selection", "testing", "tested", "passed"].includes(item.status_pendaftaran);

      // Kategori belum lengkap jika examScoreCount < 6
      // Aturan: Jika ada seleksi yang belum dinilai dan ada yang belum pilih jadwal, masukkan ke belum_pilih_jadwal
      let kategoriBelumLengkap: "belum_pilih_jadwal" | "menunggu_penilaian" | null = null;
      if (examScoreCount < 6) {
        if (
          !hasValidJadwal ||
          item.status_pendaftaran === "submitted" ||
          item.status_pendaftaran === "docs_verified" ||
          item.status_pendaftaran === "registered" ||
          item.status_pendaftaran === "data_completed"
        ) {
          kategoriBelumLengkap = "belum_pilih_jadwal";
        } else {
          kategoriBelumLengkap = "menunggu_penilaian";
        }
      }

      let examStatus = "unregistered";
      const sp = item.status_pendaftaran;
      if (
        sp === "scheduled" ||
        sp === "selection" ||
        sp === "testing" ||
        sp === "tested" ||
        sp === "passed"
      ) {
        if (examScoreCount >= 6 || sp === "passed") {
          examStatus = "tested";
        } else if (examScoreCount > 0) {
          examStatus = "testing";
        } else {
          examStatus = "scheduled";
        }
      }

      // Komponen nilai yang belum diinput beserta penguji yang bertugas
      const missingComponents: Array<{
        key: string;
        name: string;
        type: "penguji" | "sistem";
        penguji_name?: string | null;
        penguji_phone?: string | null;
      }> = [];

      if (!mergedNilai || mergedNilai.score_quran == null) {
        missingComponents.push({
          key: "quran",
          name: "Bacaan Al-Qur'an",
          type: "penguji",
          penguji_name: j?.penguji_quran?.full_name || null,
          penguji_phone: j?.penguji_quran?.phone || null,
        });
      }
      if (!mergedNilai || mergedNilai.score_akademik == null) {
        missingComponents.push({
          key: "akademik",
          name: "CBT Akademik",
          type: "sistem",
        });
      }
      if (!mergedNilai || mergedNilai.score_kepribadian == null) {
        missingComponents.push({
          key: "kepribadian",
          name: "Tes Kepribadian",
          type: "sistem",
        });
      }
      if (!mergedNilai || (mergedNilai.nilai_wawancara_santri == null && mergedNilai.score_wawancara == null)) {
        missingComponents.push({
          key: "wawancara_santri",
          name: "Wawancara Calon Santri",
          type: "penguji",
          penguji_name: j?.penguji_santri?.full_name || null,
          penguji_phone: j?.penguji_santri?.phone || null,
        });
      }
      if (!mergedNilai || mergedNilai.nilai_wawancara_ortu == null) {
        missingComponents.push({
          key: "wawancara_ortu",
          name: "Wawancara Orang Tua",
          type: "penguji",
          penguji_name: j?.penguji_ortu?.full_name || null,
          penguji_phone: j?.penguji_ortu?.phone || null,
        });
      }
      if (!mergedNilai || mergedNilai.score_kesiapan == null) {
        missingComponents.push({
          key: "kesiapan",
          name: "Kesiapan Santri",
          type: "sistem",
        });
      }

      const jenjangUp = (item.jenjang || "").toUpperCase();
      if (jenjangUp === "MA" || jenjangUp === "SMA") {
        if (!mergedNilai || mergedNilai.score_hafalan == null) {
          missingComponents.push({
            key: "hafalan",
            name: "Hafalan Al-Qur'an",
            type: "penguji",
            penguji_name: j?.penguji_hafalan?.full_name || null,
            penguji_phone: j?.penguji_hafalan?.phone || null,
          });
        }
        if (!mergedNilai || mergedNilai.score_arab == null) {
          missingComponents.push({
            key: "arab",
            name: "Lisan Bahasa Arab",
            type: "penguji",
            penguji_name: j?.penguji_arab?.full_name || null,
            penguji_phone: j?.penguji_arab?.phone || null,
          });
        }
      }

      const waliPhone =
        item.orang_tua?.no_hp_ayah ||
        item.orang_tua?.no_hp_ibu ||
        item.orang_tua?.no_hp_wali ||
        item.no_hp ||
        null;

      const waliName =
        item.orang_tua?.nama_ayah ||
        item.orang_tua?.nama_ibu ||
        item.orang_tua?.nama_wali ||
        "Bapak/Ibu Wali Santri";

      const examinerInfo = {
        quran: {
          name:
            mergedNilai?.input_by_quran_profile?.full_name ||
            mergedNilai?.detail_quran?.nama_penguji ||
            j?.penguji_quran?.full_name ||
            "-",
          notes:
            mergedNilai?.catatan_quran ||
            mergedNilai?.detail_quran?.catatan ||
            "-",
          recommendation:
            mergedNilai?.detail_quran?.rekomendasi ||
            "-",
        },
        wawancara_santri: {
          name:
            mergedNilai?.input_by_santri_profile?.full_name ||
            mergedNilai?.detail_wawancara?.nama_pewawancara ||
            j?.penguji_santri?.full_name ||
            "-",
          notes:
            mergedNilai?.catatan_santri ||
            mergedNilai?.detail_wawancara?.catatan ||
            "-",
          recommendation:
            mergedNilai?.detail_wawancara?.rekomendasi ||
            "-",
        },
        wawancara_ortu: {
          name:
            mergedNilai?.input_by_ortu_profile?.full_name ||
            mergedNilai?.detail_cawalsan?.nama_pewawancara ||
            j?.penguji_ortu?.full_name ||
            "-",
          notes:
            mergedNilai?.catatan_ortu ||
            mergedNilai?.detail_cawalsan?.catatan ||
            "-",
          recommendation:
            mergedNilai?.detail_cawalsan?.rekomendasi ||
            "-",
        },
        hafalan: {
          name:
            mergedNilai?.input_by_hafalan_profile?.full_name ||
            mergedNilai?.detail_hafalan?.nama_penguji ||
            j?.penguji_hafalan?.full_name ||
            "-",
          notes:
            mergedNilai?.catatan_hafalan ||
            mergedNilai?.detail_hafalan?.catatan_tambahan ||
            "-",
          recommendation:
            mergedNilai?.detail_hafalan?.rekomendasi ||
            "-",
        },
        arab: {
          name:
            mergedNilai?.input_by_arab_profile?.full_name ||
            mergedNilai?.detail_arab?.nama_penguji ||
            j?.penguji_arab?.full_name ||
            "-",
          notes:
            mergedNilai?.catatan_arab ||
            mergedNilai?.detail_arab?.catatan_tambahan ||
            "-",
          recommendation:
            mergedNilai?.detail_arab?.rekomendasi ||
            mergedNilai?.detail_lisan_arab?.rekomendasi ||
            "-",
        },
      };

      return {
        ...item,
        nilai_ujian: mergedNilai,
        examiner_info: examinerInfo,
        exam_score_count: examScoreCount,
        exam_status: examStatus,
        has_jadwal: hasValidJadwal,
        kategori_belum_lengkap: kategoriBelumLengkap,
        jadwal_ujian: j || null,
        missing_components: missingComponents,
        wali_phone: waliPhone,
        wali_name: waliName,
        whatsapp_status: item.whatsapp_logs?.[0] || null,
        dokumen: item.dokumen.map((doc) => ({
          jenis_dokumen: doc.jenis_dokumen,
          status_verifikasi: doc.is_verified ? "verified" : doc.catatan ? "rejected" : "pending",
        })),
      };
    });

    const responseData = {
      data: transformedData || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await setCache(cacheKey, responseData, 60);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in admin pendaftar list API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
