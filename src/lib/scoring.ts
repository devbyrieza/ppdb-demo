import { prisma } from "./prisma";
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
export async function recalculateNilaiUjian(pendaftarId: string) {
  // 1. Ambil semua rekaman nilai untuk pendaftar ini (bisa lebih dari satu jika diinput bertahap)
  const allNilai = await prisma.nilaiUjian.findMany({
    where: { pendaftar_id: pendaftarId },
    orderBy: { updated_at: "desc" },
  });

  if (allNilai.length === 0) return null;

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
  allNilai.forEach((record) => {
    Object.entries(record).forEach(([key, val]) => {
      if (["id", "created_at", "updated_at", "pendaftar_id"].includes(key))
        return;

      if (!isEffectivelyEmpty(val)) {
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
          // DEEP MERGE for JSON fields
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

  let ws = master.nilai_wawancara_santri != null ? Number(master.nilai_wawancara_santri) : null;
  
  // Hanya gunakan score_wawancara sebagai nilai wawancara santri JIKA data ini adalah data lama
  // (di mana nilai_wawancara_santri dan nilai_wawancara_ortu sama-sama kosong)
  // JANGAN ambil dari score_wawancara jika nilai_wawancara_ortu sudah terisi,
  // karena score_wawancara mungkin sudah ditimpa oleh rata-rata (wawancaraTotal)
  const isLegacyData = master.score_wawancara != null && master.nilai_wawancara_santri == null && master.nilai_wawancara_ortu == null && master.detail_cawalsan == null;
  if (isLegacyData && ws == null) {
    ws = Number(master.score_wawancara);
  }
  
  if (ws != null && ws <= 10 && ws > 0) ws = normalizeSantriScore(ws);

  let wo = null;
  const calculatedWo = master.detail_cawalsan && !isEffectivelyEmpty(master.detail_cawalsan) ? calculateOrangTuaScore(master.detail_cawalsan) : 0;
  const manualWo = master.nilai_wawancara_ortu != null ? Number(master.nilai_wawancara_ortu) : null;
  
  // Prefer calculated if it's > 0, otherwise fallback to manual
  wo = (calculatedWo > 0) ? calculatedWo : (manualWo ?? (calculatedWo || null));

  // Rata-rata Wawancara (Santri + Orang Tua)
  const wawancaraTotal = (ws != null && wo != null) ? (ws + wo) / 2 : (ws ?? wo ?? null);

  // 4. Hitung Skor Akhir (Berdasarkan bobot di grading.ts)
  const totalScore = calculateFinalScore(ak || 0, quran || 0, wawancaraTotal || 0, kp || 0, ks || 0);

  // 5. Tentukan Status Kelulusan (Matriks A/B/C)
  const allGraded = ak != null && quran != null && kp != null && ks != null && ws != null && wo != null;
  let status: string = "BELUM LENGKAP";

  if (allGraded) {
    const grades = {
      quran: master.detail_quran?.rekomendasi ? evaluateStatusGrade(master.detail_quran.rekomendasi) : evaluateQuranGrade(quran || 0),
      akademik: evaluateAkademikGrade(ak || 0),
      kepribadian: evaluateKepribadianGrade(kp || 0),
      kesiapan: evaluateKesiapanGrade(ks || 0),
      wawancaraSantri: evaluateWawancaraGrade(ws || 0),
      wawancaraOrangTua: evaluateWawancaraGrade(wo || 0),
    };

    status = determineFinalDecision(grades);

    // 6. Sinkronisasi ke Tabel Pendaftar & Pengumuman
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      include: { orang_tua: true },
    });

    if (pendaftar && !["enrolled", "re_registered"].includes(pendaftar.status_pendaftaran)) {
      let nextStatus = status === "DITERIMA" ? "accepted" : (status === "DITOLAK" ? "rejected" : "announced");
      let displayLabel = status === "DITERIMA" ? "Diterima" : (status === "DITOLAK" ? "Ditolak" : "Cadangan");

      await prisma.pendaftar.update({ where: { id: pendaftarId }, data: { status_pendaftaran: nextStatus }});
      await prisma.pengumuman.upsert({
        where: { pendaftar_id: pendaftarId },
        update: { status_kelulusan: displayLabel, is_published: true, published_at: new Date() },
        create: { pendaftar_id: pendaftarId, status_kelulusan: displayLabel, is_published: true, published_at: new Date(), tahun_ajaran_id: pendaftar.tahun_ajaran_id },
      });

      // 7. Kirim Notifikasi WhatsApp Otomatis
      try {
        const { notifyCombinedFinalResult } = await import("./wablas");
        const phone = pendaftar.no_hp || pendaftar.orang_tua?.no_hp_ayah || pendaftar.orang_tua?.no_hp_ibu;
        if (phone) {
          await notifyCombinedFinalResult({
            pendaftarId, phone, nama: pendaftar.nama_lengkap,
            status: status as any, jenjang: pendaftar.jenjang
          });
        }
      } catch (err) {
        console.error("WhatsApp Notification Error:", err);
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
      score_akademik: ak, score_quran: quran, score_kepribadian: kp, score_kesiapan: ks,
      nilai_wawancara_santri: ws, nilai_wawancara_ortu: wo, score_wawancara: wawancaraTotal,
      total_score: totalScore, nilai_total: totalScore, status_kelulusan: status, updated_at: new Date(),
    },
  });

  // 9. Bersihkan duplikat jika ada (Hanya sisakan satu record utama)
  if (allNilai.length > 1) {
    const idsToDelete = allNilai.slice(1).map(n => n.id);
    await prisma.nilaiUjian.deleteMany({
      where: { id: { in: idsToDelete } }
    });
  }

  return mainRecord;
}
