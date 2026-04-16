import { prisma } from './prisma';
import {
    calculateFinalScore,
    evaluateAkademikGrade,
    evaluateKepribadianGrade,
    evaluateQuranGrade,
    evaluateWawancaraGrade,
    determineFinalDecision
} from './grading';

/**
 * Normalizes Calsan 1-5 average to 0-100
 */
export function normalizeCalsanScore(avg1to5: number): number {
    if (!avg1to5) return 0;
    // Scale 1-5 to 20-100 (where 1=20, 5=100) or 0-100 (where 5=100)
    // Most intuitive: avg * 20
    return Math.min(100, Math.max(0, avg1to5 * 20));
}

/**
 * Normalizes Cawalsan A/B/C answers to a score
 */
export function calculateCawalsanScore(detail: any): number {
    if (!detail) return 0;

    // Cawalsan has q1-q12
    const keys = Array.from({ length: 12 }, (_, i) => `q${i + 1}`);
    let totalPoints = 0;
    let counted = 0;

    keys.forEach(key => {
        const val = detail[key];
        if (val) {
            counted++;
            if (val.startsWith('A')) totalPoints += 100;
            else if (val.startsWith('B')) totalPoints += 75;
            else if (val.startsWith('C')) totalPoints += 50;
        }
    });

    return counted > 0 ? totalPoints / counted : 0;
}

/**
 * Recalculates total score and final status for an applicant based on their sub-scores.
 * Master Merge: Combines multiple NilaiUjian records if they exist for the same student.
 */
export async function recalculateNilaiUjian(pendaftarId: string) {
    // 0. Fetch ALL score records for this pendaftar, sorted by update date (newest first)
    const allNilai = await prisma.nilaiUjian.findMany({
        where: { pendaftar_id: pendaftarId },
        orderBy: { updated_at: 'desc' }
    });

    if (allNilai.length === 0) return null;

    // Helper to check if a value is effectively empty
    const isEmpty = (v: any) => v == null || v === "" || (typeof v === 'object' && Object.keys(v).length === 0 && v.constructor === Object);

    // 1. Master Merge: Build a unified 'master' object from all records
    // We iterate from OLDEST to NEWEST so that newer records overwrite older ones for the same field
    const master: any = {};
    [...allNilai].reverse().forEach(record => {
        Object.entries(record).forEach(([key, val]) => {
            // Ignore system fields that shouldn't be blindly merged
            if (['id', 'created_at', 'updated_at', 'pendaftar_id'].includes(key)) return;
            
            // Only overwrite if the value is NOT empty
            if (!isEmpty(val)) {
                master[key] = val;
            }
        });
    });

    // 2. Extract & Normalize Raw Scores from Master
    const ak = Number(master.score_akademik) || 0;
    const quran = Number(master.score_quran) || 0;
    const kp = Number(master.score_kepribadian) || 0;
    const ks = Number(master.score_kesiapan) || 0;

    // Calsan (Santri) normalization (assuming value in DB is raw 1-5 if < 10)
    let ws_raw = Number(master.nilai_wawancara_santri) || 0;
    const ws = ws_raw > 10 ? ws_raw : normalizeCalsanScore(ws_raw);

    // Cawalsan (Ortu) score from detail or raw flag
    let wo = 0;
    if (master.detail_cawalsan) {
        wo = calculateCawalsanScore(master.detail_cawalsan);
    } else {
        wo = Number(master.nilai_wawancara_ortu) || 0;
        if (wo > 0 && wo < 10) wo = 75; // Default "Cukup" if only flag 1 is present
    }

    // Wawancara summary = Average of both components
    let wawancaraTotal = 0;
    if (ws > 0 && wo > 0) {
        wawancaraTotal = (ws + wo) / 2;
    } else {
        wawancaraTotal = ws || wo || 0;
    }

    // 3. Calculate Final Score (Weights in grading.ts)
    const totalScore = calculateFinalScore(ak, quran, wawancaraTotal, kp, ks);

    // 4. Evaluate Status using Matrix Grade
    const grdQuran = quran > 0 ? evaluateQuranGrade(quran) : null;
    const grdAk = ak > 0 ? evaluateAkademikGrade(ak) : null;
    const grdKp = kp > 0 ? evaluateKepribadianGrade(kp) : null;
    const grdWs = ws > 0 ? evaluateWawancaraGrade(ws) : null; 
    const grdWo = wo > 0 ? evaluateWawancaraGrade(wo) : null; 

    const allGraded = grdQuran !== null && grdAk !== null && grdKp !== null && grdWs !== null && grdWo !== null;

    let status: string;
    if (allGraded) {
        status = determineFinalDecision({
            quran: grdQuran,
            akademik: grdAk,
            kepribadian: grdKp,
            wawancaraCalsan: grdWs,
            wawancaraCawalsan: grdWo
        });

        // Update Pendaftar Status to 'tested'
        const pendaftar = await prisma.pendaftar.findUnique({
            where: { id: pendaftarId },
            select: { status_pendaftaran: true }
        });

        const currentStatus = pendaftar?.status_pendaftaran;
        const advancedStatuses = ['tested', 'passed', 'not_passed', 're_registered', 'withdrawn'];

        if (currentStatus && !advancedStatuses.includes(currentStatus)) {
            await prisma.pendaftar.update({
                where: { id: pendaftarId },
                data: { status_pendaftaran: 'tested' }
            });
        }
    } else {
        status = 'BELUM LENGKAP';
    }

    // 5. Final Save: Update the LATEST record with the Master state + Calculated scores
    const newestRecord = allNilai[0];
    return await prisma.nilaiUjian.update({
        where: { id: newestRecord.id },
        data: {
            ...master,
            total_score: totalScore,
            status_kelulusan: status,
            score_wawancara: wawancaraTotal,
            nilai_wawancara_ortu: wo,
            updated_at: new Date()
        }
    });
}
