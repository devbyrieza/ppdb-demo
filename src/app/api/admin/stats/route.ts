import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getAdminWhereClause } from "@/lib/utils/admin";
import { getCache, setCache } from "@/lib/redis";

async function checkAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    if (
      [
        "admin_super",
        "admin",
        "admin_berkas",
        "admin_keuangan",
        "penguji",
      ].includes(session.role)
    ) {
      return session;
    }
  } catch {}
  return null;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tahunAjaranId = searchParams.get("tahun_ajaran_id");

    const session = await checkAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build where clause
    const where = getAdminWhereClause(tahunAjaranId || undefined) as any;
    where.tipe_pendaftaran = { not: "PINDAHAN" };

    // If no year specified and no active year found by utility, find active manually for deeper payment stats
    if (!where.tahun_ajaran_id) {
      const activeTA = await prisma.tahunAjaran.findFirst({
        where: { is_active: true },
      });
      if (activeTA) {
        where.tahun_ajaran_id = activeTA.id;
      }
    }

    console.log(
      `[API] Admin Stats: ActiveTA=${where.tahun_ajaran_id || "None"}, Role=${session.role}, Where=${JSON.stringify(where)}`,
    );

    // === REDIS CACHE CHECK ===
    const cacheKey = `admin_stats_${where.tahun_ajaran_id || "all"}`;
    const cachedStats = await getCache<any>(cacheKey);
    if (cachedStats) {
      console.log("⚡ [API Stats] Mengembalikan data dari Redis Cache!");
      return NextResponse.json(cachedStats);
    }
    // =========================

    // Fetch pendaftar data with status, jenjang, and location
    const pendaftarData = await prisma.pendaftar.findMany({
      where,
      select: {
        id: true,
        status_pendaftaran: true,
        jenjang: true,
        provinsi: true,
        jenis_kelamin: true,
        created_at: true,
      },
    });

    // Fetch pembayaran data for the same year
    const pembayaranData = await prisma.pembayaran.findMany({
      where: {
        tahun_ajaran_id: where.tahun_ajaran_id || undefined,
      },
      select: {
        pendaftar_id: true,
        status_pembayaran: true,
      },
    });

    // 4. Calculate Stats
    const total_pendaftar = pendaftarData.length;
    const statusCounts: Record<string, number> = {};
    const jenjangCounts: Record<string, any> = {};
    const provinsiCounts: Record<string, number> = {};
    const genderCounts: Record<string, number> = {
      "Laki-laki": 0,
      Perempuan: 0,
      "Belum Diisi": 0,
    };

    pendaftarData.forEach((p) => {
      const status = p.status_pendaftaran || "draft";
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // Normalize Jenjang: Handle common variations
      let jRaw = (p.jenjang || "UNKNOWN").toUpperCase().trim();
      let jenjang = "MTS"; // Default fallback
      if (jRaw.includes("MTS")) jenjang = "MTS";
      else if (jRaw.includes("IL")) jenjang = "IL";
      else if (jRaw.includes("SMA") || jRaw === "MA" || jRaw.includes("MA")) jenjang = "SMA";
      else jenjang = "MTS";

      if (!jenjangCounts[jenjang]) {
        jenjangCounts[jenjang] = {
          total: 0,
          putra: 0,
          putri: 0,
          bayar_total: 0,
          bayar_putra: 0,
          bayar_putri: 0,
          accepted: 0,
          accepted_putra: 0,
          accepted_putri: 0,
          cadangan: 0,
          cadangan_putra: 0,
          cadangan_putri: 0,
          ditolak: 0,
          ditolak_putra: 0,
          data_total: 0,
          data_putra: 0,
          data_putri: 0,
          berkas_total: 0,
          berkas_putra: 0,
          berkas_putri: 0,
          ulang_total: 0,
          ulang_putra: 0,
          ulang_putri: 0,
          ulang_sedang_total: 0,
          ulang_sedang_putra: 0,
          ulang_sedang_putri: 0,
          ulang_selesai_total: 0,
          ulang_selesai_putra: 0,
          ulang_selesai_putri: 0,
          seleksi_total: 0,
          seleksi_putra: 0,
          seleksi_putri: 0,
        };
      }

      const j = jenjangCounts[jenjang];
      // Normalize Gender mapping (L/P or Full String)
      const isL = p.jenis_kelamin === "L" || p.jenis_kelamin === "Laki-laki";
      const isP = p.jenis_kelamin === "P" || p.jenis_kelamin === "Perempuan";

      j.total++;
      if (isL) {
        j.putra++;
        genderCounts["Laki-laki"]++;
      } else if (isP) {
        j.putri++;
        genderCounts["Perempuan"]++;
      } else {
        genderCounts["Belum Diisi"]++;
      }

      // Bayar Pendaftaran Logic: verified or higher
      const verifiedIndex = 3; // 'verified' index in status list below
      const statusList = [
        "draft",
        "awaiting_payment",
        "payment_verification",
        "verified",
        "paid",
        "data_completed",
        "docs_uploaded",
        "docs_verified",
        "selection",
        "scheduled",
        "testing",
        "tested",
        "announced",
        "accepted",
        "enrolled",
        "enrolled_full",
      ];
      const currentIndex = statusList.indexOf(status);

      if (currentIndex >= verifiedIndex || status === "paid") {
        j.bayar_total++;
        if (isL) j.bayar_putra++;
        if (isP) j.bayar_putri++;
      }

      // Diterima Logic: accepted, enrolled, or enrolled_full
      if (status === "accepted" || status === "enrolled" || status === "enrolled_full") {
        j.accepted++;
        if (isL) j.accepted_putra++;
        if (isP) j.accepted_putri++;
      }

      // Cadangan Logic: announced
      if (status === "announced") {
        j.cadangan++;
        if (isL) j.cadangan_putra++;
        if (isP) j.cadangan_putri++;
      }

      // Ditolak Logic: rejected
      if (status === "rejected") {
        j.ditolak++;
        if (isL) j.ditolak_putra++;
        if (isP) j.ditolak_putri++;
      }

      // Data Lengkap Logic: payment_verification or higher
      const dataVerifiedIndex = 2; // 'payment_verification' index
      if (currentIndex >= dataVerifiedIndex && status !== "rejected") {
        j.data_total++;
        if (isL) j.data_putra++;
        if (isP) j.data_putri++;
      }

      // Berkas Lengkap Logic: docs_verified or higher
      const docsVerifiedIndex = 8; // 'docs_verified' index
      if (currentIndex >= docsVerifiedIndex && status !== "rejected" && status !== "selection") {
        j.berkas_total++;
        if (isL) j.berkas_putra++;
        if (isP) j.berkas_putri++;
      }

      // Daftar Ulang Logic: enrolled or enrolled_full
      if (status === "enrolled" || status === "enrolled_full") {
        j.ulang_total++;
        if (isL) j.ulang_putra++;
        if (isP) j.ulang_putri++;

        if (status === "enrolled") {
          j.ulang_sedang_total++;
          if (isL) j.ulang_sedang_putra++;
          if (isP) j.ulang_sedang_putri++;
        } else {
          j.ulang_selesai_total++;
          if (isL) j.ulang_selesai_putra++;
          if (isP) j.ulang_selesai_putri++;
        }
      }

      // Sedang Seleksi Logic
      if (["selection", "scheduled", "testing", "tested"].includes(status)) {
        j.seleksi_total++;
        if (isL) j.seleksi_putra++;
        if (isP) j.seleksi_putri++;
      }

      // Normalize Provinsi
      let provinsi = p.provinsi || "Belum Diisi";
      if (provinsi && provinsi !== "Belum Diisi") {
        provinsi = provinsi
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
      provinsiCounts[provinsi] = (provinsiCounts[provinsi] || 0) + 1;
    });

    // Quota configuration (Standard Demo Quotas)
    const QUOTAS: Record<
      string,
      { putra: number; putri: number; total: number }
    > = {
      MTS: { putra: 32, putri: 30, total: 62 },
      IL: { putra: 32, putri: 30, total: 62 },
      SMA: { putra: 0, putri: 0, total: 0 },
    };

    // Calculate weekly growth rate in-memory
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    let countThisWeek = 0;
    let countLastWeek = 0;

    pendaftarData.forEach((p: any) => {
      const createdAt = new Date(p.created_at || p.createdAt || now);
      if (createdAt >= oneWeekAgo && createdAt <= now) {
        countThisWeek++;
      } else if (createdAt >= twoWeeksAgo && createdAt < oneWeekAgo) {
        countLastWeek++;
      }
    });

    let growthPercent = 0;
    if (countLastWeek > 0) {
      growthPercent = Math.round(((countThisWeek - countLastWeek) / countLastWeek) * 100);
    } else if (countThisWeek > 0) {
      growthPercent = 100;
    }

    const growthText = growthPercent >= 0 ? `+${growthPercent}% pekan ini` : `${growthPercent}% pekan ini`;

    const stats = {
      total_pendaftar,
      growth_text: growthText,
      diterima: (statusCounts.accepted || 0) + (statusCounts.enrolled || 0) + (statusCounts.enrolled_full || 0),
      cadangan: statusCounts.announced || 0,
      ditolak: statusCounts.rejected || 0,
      berkas_lengkap: ["docs_verified", "selection", "scheduled", "testing", "tested", "announced", "accepted", "enrolled", "enrolled_full"].reduce((acc, s) => acc + (statusCounts[s] || 0), 0),
      sedang_seleksi: ["selection", "scheduled", "testing", "tested"].reduce((acc, s) => acc + (statusCounts[s] || 0), 0),
      daftar_ulang: (statusCounts.enrolled || 0) + (statusCounts.enrolled_full || 0),
      daftar_ulang_sedang: statusCounts.enrolled || 0,
      daftar_ulang_selesai: statusCounts.enrolled_full || 0,
      mengundurkan_diri: statusCounts.mengundurkan_diri || 0,

      // Secondary metrics
      sudah_bayar: ["paid", "verified", "data_completed", "docs_uploaded", "docs_verified", "selection", "scheduled", "testing", "tested", "announced", "accepted", "enrolled", "enrolled_full"].reduce((acc, s) => acc + (statusCounts[s] || 0), 0),
      sudah_isi_data: ["data_completed", "docs_uploaded", "docs_verified", "selection", "scheduled", "testing", "tested", "announced", "accepted", "enrolled", "enrolled_full"].reduce((acc, s) => acc + (statusCounts[s] || 0), 0),
      waiting_payment: statusCounts.waiting_payment || 0,
      waiting_docs: statusCounts.data_completed || 0,

      stats_per_jenjang: ["MTS", "IL", "SMA"].map((jenjang) => {
        const data = jenjangCounts[jenjang] || {
          total: 0,
          putra: 0,
          putri: 0,
          bayar_total: 0,
          bayar_putra: 0,
          bayar_putri: 0,
          accepted: 0,
          accepted_putra: 0,
          accepted_putri: 0,
          cadangan: 0,
          cadangan_putra: 0,
          cadangan_putri: 0,
          ulang_total: 0,
          ulang_putra: 0,
          ulang_putri: 0,
          seleksi_total: 0,
          seleksi_putra: 0,
          seleksi_putri: 0,
          data_total: 0,
          data_putra: 0,
          data_putri: 0,
        };
        const q = QUOTAS[jenjang];
        return {
          jenjang,
          kuota_putra: q.putra,
          kuota_putri: q.putri,
          kuota_total: q.total,
          pendaftar: data.total,
          pendaftar_putra: data.putra,
          pendaftar_putri: data.putri,
          bayar_total: data.bayar_total,
          bayar_putra: data.bayar_putra,
          bayar_putri: data.bayar_putri,
          data_total: data.data_total || 0,
          data_putra: data.data_putra || 0,
          data_putri: data.data_putri || 0,
          diterima: data.accepted,
          diterima_putra: data.accepted_putra,
          diterima_putri: data.accepted_putri,
          cadangan: data.cadangan,
          cadangan_putra: data.cadangan_putra,
          cadangan_putri: data.cadangan_putri,
          ditolak: data.ditolak,
          ditolak_putra: data.ditolak_putra,
          ditolak_putri: data.ditolak_putri,
          berkas_lengkap: data.berkas_total,
          berkas_putra: data.berkas_putra,
          berkas_putri: data.berkas_putri,
          sedang_seleksi: data.seleksi_total,
          seleksi_putra: data.seleksi_putra,
          seleksi_putri: data.seleksi_putri,
          daftar_ulang: data.ulang_total,
          ulang_putra: data.ulang_putra,
          ulang_putri: data.ulang_putri,
          ulang_sedang_putra: data.ulang_sedang_putra,
          ulang_sedang_putri: data.ulang_sedang_putri,
          ulang_selesai_putra: data.ulang_selesai_putra,
          ulang_selesai_putri: data.ulang_selesai_putri,
        };
      }),

      stats_per_provinsi: Object.entries(provinsiCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([provinsi, jumlah]) => ({ provinsi, jumlah })),
      stats_gender: genderCounts,
      pie_chart_status: {
        diterima: (statusCounts.accepted || 0) + (statusCounts.enrolled || 0) + (statusCounts.enrolled_full || 0),
        cadangan: statusCounts.announced || 0,
        menunggu:
          (statusCounts.tested || 0) +
          (statusCounts.testing || 0) +
          (statusCounts.scheduled || 0) +
          (statusCounts.selection || 0) +
          (statusCounts.docs_verified || 0),
        proses:
          (statusCounts.draft || 0) +
          (statusCounts.verified || 0) +
          (statusCounts.data_completed || 0),
        ditolak: statusCounts.rejected || 0,
      },
    };

    // Simpan ke Redis selama 60 detik (1 menit)
    await setCache(cacheKey, stats, 60);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error in admin stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
