import { prisma } from './prisma';
import {
    calculateFinalScore,
    evaluateAkademikGrade,
    evaluateKepribadianGrade,
    evaluateQuranGrade,
    evaluateWawancaraGrade,
    evaluateKesiapanGrade,
    evaluateStatusGrade,
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
    const isEmpty = (v: any) => {
        if (v == null || v === "") return true;
        if (typeof v === 'object') {
            if (Array.isArray(v)) return v.length === 0;
            const keys = Object.keys(v);
            if (keys.length === 0) return true;
            // Check if all values are null or empty
            return keys.every(key => v[key] == null || v[key] === "");
        }
        return false;
    };

    // 1. Master Merge: Build a unified 'master' object from all records
    // We iterate through all records and pick the best (non-empty) value for each field
    const master: any = {};
    allNilai.forEach(record => {
        Object.entries(record).forEach(([key, val]) => {
            // Ignore system fields
            if (['id', 'created_at', 'updated_at', 'pendaftar_id'].includes(key)) return;
            
            // Pick newest non-empty value
            if (!isEmpty(val) && isEmpty(master[key])) {
                master[key] = val;
            }
        });
    });

    // 2. Extract & Normalize Raw Scores from Master
    const ak = master.score_akademik != null ? Number(master.score_akademik) : null;
    const quran = master.score_quran != null ? Number(master.score_quran) : null;
    const kp = master.score_kepribadian != null ? Number(master.score_kepribadian) : null;
    const ks = master.score_kesiapan != null ? Number(master.score_kesiapan) : null;

    let ws = master.nilai_wawancara_santri != null ? Number(master.nilai_wawancara_santri) : null;
    if (ws != null && ws <= 10 && ws > 0) {
        ws = normalizeCalsanScore(ws);
    }
    // Clean up legacy artifact where missing values were mistakenly saved as exactly 0
    if (ws === 0) ws = null;

    let wo = null;
    if (master.detail_cawalsan && !isEmpty(master.detail_cawalsan)) {
        wo = calculateCawalsanScore(master.detail_cawalsan);
    } else if (master.nilai_wawancara_ortu != null) {
        wo = Number(master.nilai_wawancara_ortu);
        if (wo > 0 && wo < 10) wo = 75; // Default "Cukup" if only flag 1 is present
    }
    if (wo === 0) wo = null;

    // Wawancara summary
    let wawancaraTotal = null;
    if (ws != null && wo != null) {
        wawancaraTotal = (ws + wo) / 2;
    } else {
        wawancaraTotal = ws != null ? ws : (wo != null ? wo : null);
    }

    // 3. Calculate Final Score (Weights in grading.ts)
    // Treat nulls as 0 for calculation purposes to prevent NaN
    const totalScore = calculateFinalScore(
        ak || 0, 
        quran || 0, 
        wawancaraTotal || 0, 
        kp || 0, 
        ks || 0
    );

    // 4. Evaluate Status using A/B/C Grade Matrix (Excel R.H Logic)
    // All 6 components must be present: Akademik, Quran, Kepribadian, Kesiapan, W.Santri, W.Ortu
    const allGraded = (ak != null && quran != null && kp != null && ks != null && ws != null && wo != null);

    let status: string;
    if (allGraded) {
        // Convert raw numeric scores to A/B/C Grades
        const grades = {
            quran: master.detail_quran?.rekomendasi
                ? evaluateStatusGrade(master.detail_quran.rekomendasi)
                : evaluateQuranGrade(quran || 0),
            akademik: evaluateAkademikGrade(ak || 0),
            kepribadian: evaluateKepribadianGrade(kp || 0),
            kesiapan: evaluateKesiapanGrade(ks || 0),
            wawancaraCalsan: master.detail_wawancara?.rekomendasi
                ? evaluateStatusGrade(master.detail_wawancara.rekomendasi)
                : evaluateWawancaraGrade(ws || 0),
            wawancaraCawalsan: master.detail_cawalsan?.rekomendasi
                ? evaluateStatusGrade(master.detail_cawalsan.rekomendasi)
                : evaluateWawancaraGrade(wo || 0)
        };
        
        // Determine status based on Grade distribution
        // Determine status based on Grade distribution
        status = determineFinalDecision(grades);

        // Update Pendaftar Status to 'accepted', 'rejected', or 'announced' (for CADANGAN)
        const pendaftar = await prisma.pendaftar.findUnique({
            where: { id: pendaftarId },
            select: { 
                status_pendaftaran: true,
                nama_lengkap: true,
                no_hp: true,
                jenjang: true,
                orang_tua: { select: { no_hp_ayah: true, no_hp_ibu: true } }
            }
        });

        const currentStatus = pendaftar?.status_pendaftaran;
        // Don't downgrade status if they already re-registered or were accepted
        const immutableStatuses = ['accepted', 'rejected', 'announced', 're_registered', 'enrolled', 'withdrawn'];

        if (currentStatus && !immutableStatuses.includes(currentStatus)) {
            let nextStatus = 'announced'; // Default for CADANGAN
            if (status === 'DITERIMA') nextStatus = 'accepted';
            if (status === 'DITOLAK') nextStatus = 'rejected';

            await prisma.pendaftar.update({
                where: { id: pendaftarId },
                data: { status_pendaftaran: nextStatus }
            });

            // Send Combined Selection Notification
            const { notifyCombinedFinalResult } = await import('./wablas');
            const phone = pendaftar.no_hp || pendaftar.orang_tua?.no_hp_ayah || pendaftar.orang_tua?.no_hp_ibu;
            if (phone) {
                await notifyCombinedFinalResult({
                    pendaftarId,
                    phone,
                    nama: pendaftar.nama_lengkap,
                    status: status as 'DITERIMA' | 'CADANGAN' | 'DITOLAK',
                    jenjang: pendaftar.jenjang
                });
            }
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
            score_akademik: ak,
            score_quran: quran,
            score_kepribadian: kp,
            score_kesiapan: ks,
            nilai_wawancara_santri: ws,
            nilai_wawancara_ortu: wo,
            score_wawancara: wawancaraTotal,
            total_score: totalScore,
            nilai_total: totalScore, // Sync legacy field for other pages
            status_kelulusan: status,
            updated_at: new Date()
        }
    });
}
