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
 * Heart of the selection process. Manages normalization, record merging, and auto-decisions.
 */

export function normalizeSantriScore(avg1to5: number): number {
  if (!avg1to5) return 0;
  return Math.min(100, Math.max(0, avg1to5 * 20));
}

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

export async function recalculateNilaiUjian(pendaftarId: string) {
  const allNilai = await prisma.nilaiUjian.findMany({
    where: { pendaftar_id: pendaftarId },
    orderBy: { updated_at: "desc" },
  });
  if (allNilai.length === 0) return null;

  const isEmpty = (v: any) => (v == null || v === "" || (typeof v === "object" && Object.keys(v).length === 0));

  const master: any = {};
  allNilai.forEach((record) => {
    Object.entries(record).forEach(([key, val]) => {
      if (["id", "created_at", "updated_at", "pendaftar_id"].includes(key)) return;
      if (!isEmpty(val) && isEmpty(master[key])) master[key] = val;
    });
  });

  const ak = master.score_akademik != null ? Number(master.score_akademik) : null;
  const quran = master.score_quran != null ? Number(master.score_quran) : null;
  const kp = master.score_kepribadian != null ? Number(master.score_kepribadian) : null;
  const ks = master.score_kesiapan != null ? Number(master.score_kesiapan) : null;
  let ws = master.nilai_wawancara_santri != null ? Number(master.nilai_wawancara_santri) : null;
  if (ws != null && ws <= 10 && ws > 0) ws = normalizeSantriScore(ws);
  let wo = master.detail_cawalsan && !isEmpty(master.detail_cawalsan) ? calculateOrangTuaScore(master.detail_cawalsan) : (master.nilai_wawancara_ortu != null ? Number(master.nilai_wawancara_ortu) : null);

  const wawancaraTotal = (ws != null && wo != null) ? (ws + wo) / 2 : (ws ?? wo ?? null);
  const totalScore = calculateFinalScore(ak || 0, quran || 0, wawancaraTotal || 0, kp || 0, ks || 0);

  const allGraded = ak != null && quran != null && kp != null && ks != null && ws != null && wo != null;
  let status: string = "BELUM LENGKAP";

  if (allGraded) {
    const grades = {
      quran: evaluateQuranGrade(quran || 0),
      akademik: evaluateAkademikGrade(ak || 0),
      kepribadian: evaluateKepribadianGrade(kp || 0),
      kesiapan: evaluateKesiapanGrade(ks || 0),
      wawancaraSantri: evaluateWawancaraGrade(ws || 0),
      wawancaraOrangTua: evaluateWawancaraGrade(wo || 0),
    };
    status = determineFinalDecision(grades);

    const pendaftar = await prisma.pendaftar.findUnique({ where: { id: pendaftarId }, include: { orang_tua: true }});
    if (pendaftar && !["enrolled", "re_registered"].includes(pendaftar.status_pendaftaran)) {
      let nextStatus = status === "DITERIMA" ? "accepted" : (status === "DITOLAK" ? "rejected" : "announced");
      let displayLabel = status === "DITERIMA" ? "Lulus" : (status === "DITOLAK" ? "Tidak Lulus" : "Cadangan");
      await prisma.pendaftar.update({ where: { id: pendaftarId }, data: { status_pendaftaran: nextStatus }});
      await prisma.pengumuman.upsert({
        where: { pendaftar_id: pendaftarId },
        update: { status_kelulusan: displayLabel, is_published: true, published_at: new Date() },
        create: { pendaftar_id: pendaftarId, status_kelulusan: displayLabel, is_published: true, published_at: new Date(), tahun_ajaran_id: pendaftar.tahun_ajaran_id },
      });
    }
  }

  return await prisma.nilaiUjian.update({
    where: { id: allNilai[0].id },
    data: {
      ...master,
      score_akademik: ak, score_quran: quran, score_kepribadian: kp, score_kesiapan: ks,
      nilai_wawancara_santri: ws, nilai_wawancara_ortu: wo, score_wawancara: wawancaraTotal,
      total_score: totalScore, nilai_total: totalScore, status_kelulusan: status, updated_at: new Date(),
    },
  });
}
