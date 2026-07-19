import { prisma } from "./prisma";
import { invalidateAdminPendaftarCache } from "./redis";
import {
  calculateFinalScore,
  evaluateAkademikGrade,
  evaluateKepribadianGrade,
  evaluateQuranGrade,
  evaluateWawancaraGrade,
  evaluateKesiapanGrade,
  evaluateStatusGrade,
  determineFinalDecision,
} from "./grading";

/**
 * ─── SCORING & GRADING SYSTEM ───
 * File ini mengelola semua logika perhitungan nilai seleksi.
 * Tugas utamanya: Normalisasi data, Penggabungan Nilai (Merge), 
 * dan Penentuan Kelulusan Otomatis.
 */

/**
 * normalizeSantriScore
 * Mengubah skala 1-5 (dari form penguji) menjadi skala 0-100.
 * Rumus: Nilai * 20.
 */
export function normalizeSantriScore(avg1to5: number): number {
  if (!avg1to5) return 0;
  return Math.min(100, Math.max(0, avg1to5 * 20));
}

/**
 * calculateOrangTuaScore
 * Menghitung skor wawancara orang tua berdasarkan jawaban A/B/C.
 * A = 100, B = 75, C = 50.
 */
export function calculateOrangTuaScore(detail: any): number {
  if (!detail) return 0;
  const keys = Array.from({ length: 12 }, (_, i) => `q${i + 1}`);
  let totalPoints = 0;
  let counted = 0;

  keys.forEach((key) => {
    const val = detail[key];
    if (val) {
      counted++;
      if (val.startsWith("A")) totalPoints += 100;
      else if (val.startsWith("B")) totalPoints += 75;
      else if (val.startsWith("C")) totalPoints += 50;
    }
  });

  return counted > 0 ? totalPoints / counted : 0;
}

/**
 * recalculateNilaiUjian
 * FUNGSI INTI: Menghitung total nilai akhir santri.
 * Menggabungkan semua data ujian (Al-Quran, Akademik, Wawancara) menjadi satu kesimpulan.
 */
export async function recalculateNilaiUjian(pendaftarId: string, overrideStatus?: string) {
  // 1. Ambil semua rekaman nilai untuk pendaftar ini (bisa lebih dari satu jika diinput bertahap)
  let allNilai = await prisma.nilaiUjian.findMany({
    where: { pendaftar_id: pendaftarId },
    orderBy: { updated_at: "desc" },
  });

  if (allNilai.length === 0) {
    if (!overrideStatus) return null;
    
    // Buat record kosong agar bisa menyimpan override status meskipun belum ada nilai sama sekali
    const emptyRecord = await prisma.nilaiUjian.create({
      data: { pendaftar_id: pendaftarId }
    });
    allNilai = [emptyRecord];
  }

  const isEffectivelyEmpty = (v: any) => {
    if (v == null || v === "") return true;
    if (typeof v === "object") {
      if (Array.isArray(v)) return v.length === 0;
      const keys = Object.keys(v);
      if (keys.length === 0) return true;
      // Check if all values inside are also null/empty
      return keys.every((key) => v[key] == null || v[key] === "");
    }
    return false;
  };

  // 2. MASTER MERGE: Gabungkan semua field dari catatan lama ke yang baru jika ada yang kosong
  const master: any = {};
  const jsonFields = ["nilai_tes_tertulis", "detail_akademik", "detail_kepribadian", "detail_kesiapan", "detail_quran", "detail_wawancara", "detail_cawalsan"];

  allNilai.forEach((record) => {
    Object.entries(record).forEach(([key, val]) => {
      if (["id", "created_at", "updated_at", "pendaftar_id"].includes(key))
        return;

      if (!isEffectivelyEmpty(val)) {
        if (jsonFields.includes(key) && typeof val === "object" && val !== null && !Array.isArray(val)) {
          // DEEP MERGE only for known JSON fields to avoid breaking Decimal objects
          if (!master[key]) master[key] = {};
          Object.entries(val).forEach(([subK, subV]) => {
            if (subV != null && subV !== "" && (master[key][subK] == null || master[key][subK] === "")) {
              master[key][subK] = subV;
            }
          });
        } else if (isEffectivelyEmpty(master[key])) {
          master[key] = val;
        }
      }
    });
  });

  // 3. Normalisasi & Ekstraksi Nilai
  const ak = (master.score_akademik != null ? Number(master.score_akademik) : (master.nilai_tes_tertulis_total != null ? Number(master.nilai_tes_tertulis_total) : null));
  const quran = (master.score_quran != null ? Number(master.score_quran) : (master.nilai_tes_quran != null ? Number(master.nilai_tes_quran) : null));
  const kp = master.score_kepribadian != null ? Number(master.score_kepribadian) : null;
  const ks = master.score_kesiapan != null ? Number(master.score_kesiapan) : null;

  let ws = master.score_wawancara != null ? Number(master.score_wawancara) : (master.nilai_wawancara_santri != null ? Number(master.nilai_wawancara_santri) : null);
  
  if (ws != null && ws <= 10 && ws > 0) ws = normalizeSantriScore(ws);

  let wo = null;
  const calculatedWo = master.detail_cawalsan && !isEffectivelyEmpty(master.detail_cawalsan) ? calculateOrangTuaScore(master.detail_cawalsan) : 0;
  const manualWo = master.nilai_wawancara_ortu != null ? Number(master.nilai_wawancara_ortu) : null;
  
  // Prefer calculated if it's > 0, otherwise fallback to manual
  wo = (calculatedWo > 0) ? calculatedWo : (manualWo ?? (calculatedWo || null));

  // Rata-rata Wawancara (Santri + Orang Tua)
  const wawancaraTotal = (ws != null && wo != null) ? (ws + wo) / 2 : (ws ?? wo ?? null);

  // Ambil data skipped_stages jika ada di dalam detail_akademik
  let skippedStages: string[] = [];
  if (master.detail_akademik) {
    let da = master.detail_akademik;
    if (typeof da === "string") {
      try { da = JSON.parse(da); } catch (e) {}
    }
    if (da && Array.isArray(da.skipped_stages)) {
      skippedStages = da.skipped_stages;
    }
  }

  // 4. Hitung Skor Akhir secara dinamis (Weighted Average) berdasarkan komponen yang aktif
  let totalWeighted = 0;
  let totalWeight = 0;

  // Akademik (30%)
  if (!skippedStages.includes("AKADEMIK")) {
    totalWeighted += (ak || 0) * 0.3;
    totalWeight += 0.3;
  }
  // Quran (30%)
  if (!skippedStages.includes("QURAN")) {
    totalWeighted += (quran || 0) * 0.3;
    totalWeight += 0.3;
  }
  // Wawancara Santri (10%)
  if (!skippedStages.includes("WAWANCARA_SANTRI")) {
    totalWeighted += (ws || 0) * 0.1;
    totalWeight += 0.1;
  }
  // Wawancara Ortu (10%)
  if (!skippedStages.includes("WAWANCARA_ORTU")) {
    totalWeighted += (wo || 0) * 0.1;
    totalWeight += 0.1;
  }
  // Kepribadian (10%)
  if (!skippedStages.includes("KEPRIBADIAN")) {
    totalWeighted += (kp || 0) * 0.1;
    totalWeight += 0.1;
  }
  // Kesiapan (10%)
  if (!skippedStages.includes("KESIAPAN")) {
    totalWeighted += (ks || 0) * 0.1;
    totalWeight += 0.1;
  }

  const totalScore = totalWeight > 0 ? (totalWeighted / totalWeight) : 0;

  // 5. Tentukan Status Kelulusan (Matriks A/B/C)
  // Suatu tes dianggap "selesai" jika nilainya ada ATAU jika tes tersebut di-skip
  const isAkGraded = ak != null || skippedStages.includes("AKADEMIK");
  const isQuranGraded = quran != null || skippedStages.includes("QURAN");
  const isKpGraded = kp != null || skippedStages.includes("KEPRIBADIAN");
  const isKsGraded = ks != null || skippedStages.includes("KESIAPAN");
  const isWsGraded = ws != null || skippedStages.includes("WAWANCARA_SANTRI");
  const isWoGraded = wo != null || skippedStages.includes("WAWANCARA_ORTU");

  const allGraded = isAkGraded && isQuranGraded && isKpGraded && isKsGraded && isWsGraded && isWoGraded;
  let status: string = "BELUM LENGKAP";

  if (allGraded || overrideStatus) {
    const grades = {
      quran: skippedStages.includes("QURAN") ? "A" as const : (master.detail_quran?.rekomendasi ? evaluateStatusGrade(master.detail_quran.rekomendasi) : evaluateQuranGrade(quran || 0)),
      akademik: skippedStages.includes("AKADEMIK") ? "A" as const : evaluateAkademikGrade(ak || 0),
      kepribadian: skippedStages.includes("KEPRIBADIAN") ? "A" as const : evaluateKepribadianGrade(kp || 0),
      kesiapan: skippedStages.includes("KESIAPAN") ? "A" as const : evaluateKesiapanGrade(ks || 0),
      wawancaraSantri: skippedStages.includes("WAWANCARA_SANTRI") ? "A" as const : evaluateWawancaraGrade(ws || 0),
      wawancaraOrangTua: skippedStages.includes("WAWANCARA_ORTU") ? "A" as const : evaluateWawancaraGrade(wo || 0),
    };

    status = overrideStatus || determineFinalDecision(grades);

    // 6. Sinkronisasi ke Tabel Pendaftar & Pengumuman
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      include: { orang_tua: true },
    });

    if (pendaftar && !["enrolled", "re_registered", "accepted"].includes(pendaftar.status_pendaftaran)) {
      let nextStatus = status === "DITERIMA" ? "accepted" : (status === "DITOLAK" ? "rejected" : "announced");
      let displayLabel = status === "DITERIMA" ? "Diterima" : (status === "DITOLAK" ? "Ditolak" : "Cadangan");

      // Atomic update to prevent race conditions causing duplicate notifications
      const updateResult = await prisma.pendaftar.updateMany({
        where: { id: pendaftarId, status_pendaftaran: { not: nextStatus } },
        data: { status_pendaftaran: nextStatus }
      });

      const isStatusChanged = updateResult.count > 0;

      await prisma.pengumuman.upsert({
        where: { pendaftar_id: pendaftarId },
        update: { status_kelulusan: displayLabel, is_published: true, published_at: new Date() },
        create: { pendaftar_id: pendaftarId, status_kelulusan: displayLabel, is_published: true, published_at: new Date(), tahun_ajaran_id: pendaftar.tahun_ajaran_id },
      });

      // 7. Kirim Notifikasi WhatsApp Otomatis
      if (isStatusChanged) {
        try {
          const { notifyCombinedFinalResult } = await import("./wablas");
          const { processWhatsappQueue } = await import("./whatsapp-queue");
          const phone = pendaftar.no_hp || pendaftar.orang_tua?.no_hp_ayah || pendaftar.orang_tua?.no_hp_ibu;
          if (phone) {
            await notifyCombinedFinalResult({
              pendaftarId, phone, nama: pendaftar.nama_lengkap,
              status: status as any, jenjang: pendaftar.jenjang
            });

            // Jalankan proses antrean secara asinkron (fail-safe jika cron delay/mati)
            processWhatsappQueue().catch((err) =>
              console.error("Failed to run processWhatsappQueue asynchronously:", err)
            );
          }
        } catch (err) {
          console.error("WhatsApp Notification Error:", err);
        }
      }

    }
  } else {
    // If not all graded, but some are, update status to 'tested' (Sedang Seleksi) 
    // to ensure they appear in the right lists
    const someGraded = ak != null || quran != null || kp != null || ks != null || ws != null || wo != null;
    if (someGraded) {
      const pendaftar = await prisma.pendaftar.findUnique({ where: { id: pendaftarId } });
      if (pendaftar && ["docs_verified", "scheduled"].includes(pendaftar.status_pendaftaran)) {
        await prisma.pendaftar.update({
          where: { id: pendaftarId },
          data: { status_pendaftaran: "tested" }
        });
      }
    }
  }

  // 8. Simpan Hasil Akhir ke Database (Update yang terbaru/utama)
  const mainRecord = await prisma.nilaiUjian.update({
    where: { id: allNilai[0].id },
    data: {
      ...master,
      score_akademik: ak, 
      nilai_tes_tertulis_total: ak, // Override Decimal field
      score_quran: quran, 
      nilai_tes_quran: quran, // Override Decimal field
      score_kepribadian: kp, 
      score_kesiapan: ks,
      score_wawancara: ws, // Simpan Wawancara Santri (sebelumnya menyimpan wawancaraTotal yang merusak data manual Calsan)
      nilai_wawancara_santri: ws, 
      nilai_wawancara_ortu: wo, 
      total_score: totalScore, 
      nilai_total: totalScore,
      status_kelulusan: status, 
      updated_at: new Date(),
    },
  });

  // 9. Bersihkan duplikat jika ada (Hanya sisakan satu record utama)
  if (allNilai.length > 1) {
    const idsToDelete = allNilai.slice(1).map(n => n.id);
    await prisma.nilaiUjian.deleteMany({
      where: { id: { in: idsToDelete } }
    });
  }

  await invalidateAdminPendaftarCache();
  return mainRecord;
}
