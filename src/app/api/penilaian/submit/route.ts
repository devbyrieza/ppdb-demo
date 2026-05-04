import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalculateNilaiUjian } from '@/lib/scoring';
import {
    calculateFinalScore,
    determineStatus,
    gradeToScore,
    evaluateAkademikGrade,
    evaluateKepribadianGrade,
    evaluateQuranGrade,
    evaluateWawancaraGrade,
    evaluateStatusGrade,
    determineFinalDecision
} from '@/lib/grading';

async function getSession() {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");
    if (!sessionCookie) return null;
    try {
        return JSON.parse(sessionCookie.value);
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        // 1. Auth Check (Admins/Examiners only)
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userRole = session.role;
        const isSuper = userRole === 'admin_super';

        const body = await req.json();
        const { pendaftar_id, type } = body;
        const { score, details, examiner_id, grade } = body;

        // RBAC Validation
        if (!isSuper) {
            if (type === 'quran') {
                if (userRole !== 'penguji_calsan') {
                    return NextResponse.json({ error: 'Forbidden: Role restricted to Penguji' }, { status: 403 });
                }
            } else if (type === 'wawancara_santri') {
                if (userRole !== 'pewawancara_calsan') {
                    return NextResponse.json({ error: 'Forbidden: Role restricted to Pewawancara Calsan' }, { status: 403 });
                }
            } else if (type === 'wawancara_ortu') {
                if (userRole !== 'pewawancara_cawalsan') {
                    return NextResponse.json({ error: 'Forbidden: Role restricted to Pewawancara Cawalsan' }, { status: 403 });
                }
            }
        }

        if (!pendaftar_id || !type) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // --- ACCESS GUARD: Check pendaftar status ---
        // Super admin can bypass, but examiners/others must wait for verification
        if (!isSuper) {
            const pendaftar = await prisma.pendaftar.findUnique({
                where: { id: pendaftar_id },
                select: { status_pendaftaran: true }
            });

            const ALLOWED_STATUSES = ['docs_verified', 'scheduled', 'tested', 'announced', 'accepted', 'enrolled'];
            if (!pendaftar || !ALLOWED_STATUSES.includes(pendaftar.status_pendaftaran || '')) {
                return NextResponse.json({ 
                    error: 'Forbidden: Input nilai ditolak karena pendaftar belum berstatus "Terverifikasi Berkas".' 
                }, { status: 403 });
            }
        }

        // Determine numeric score to save
        let numericScore = score;
        if (grade && (score === undefined || score === null)) {
            numericScore = gradeToScore(grade);
        }

        // 2. Prepare Data to Update
        const updateData: any = { updated_at: new Date() };

        if (type === 'quran') {
            updateData.score_quran = numericScore;
            updateData.nilai_tes_quran = numericScore; // Legacy field sync
            updateData.catatan_quran = details?.catatan;
            updateData.input_by_quran = examiner_id;
            updateData.input_at_quran = new Date();
        } else if (type === 'wawancara_santri') {
            // Wawancara logic might combine Santri & Ortu?
            // Or simply store them. Let's store individually.
            updateData.nilai_wawancara_santri = numericScore;
            updateData.catatan_santri = details?.catatan;
            updateData.input_by_santri = examiner_id;
            updateData.input_at_santri = new Date();
            // Logic: Update comprehensive 'score_wawancara'?
            // Maybe avg(santri + ortu)? Let's fetch existing to combine.
        } else if (type === 'wawancara_ortu') {
            updateData.nilai_wawancara_ortu = numericScore;
            updateData.catatan_ortu = details?.catatan;
            updateData.input_by_ortu = examiner_id;
            updateData.input_at_ortu = new Date();
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        // 3. Update DB
        // First, verify NilaiUjian exists
        let nilai = await prisma.nilaiUjian.findFirst({ where: { pendaftar_id } });
        if (!nilai) {
            nilai = await prisma.nilaiUjian.create({ data: { pendaftar_id } });
        }

        // Perform Update
        const updated = await prisma.nilaiUjian.update({
            where: { id: nilai.id },
            data: updateData
        });

        // 4. Trigger Recalculation
        await recalculateNilaiUjian(pendaftar_id);

        return NextResponse.json({ success: true, updated });

    } catch (error) {
        console.error('Examiner Submit Error:', error);
        return NextResponse.json({ error: (error as any).message || 'Internal Server Error' }, { status: 500 });
    }
}
