import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recalculateNilaiUjian } from '@/lib/scoring';

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

// POST: Batch recalculate all NilaiUjian records
export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admin_super can trigger batch recalculation
        if (session.role !== 'admin_super' && session.role !== 'tim_it') {
            return NextResponse.json({ error: 'Forbidden: Only admin super can recalculate' }, { status: 403 });
        }

        // Fetch all NilaiUjian records
        const allNilai = await prisma.nilaiUjian.findMany({
            select: { id: true, pendaftar_id: true }
        });

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const nilai of allNilai) {
            try {
                await recalculateNilaiUjian(nilai.pendaftar_id);
                successCount++;
            } catch (err: any) {
                errorCount++;
                errors.push(`${nilai.pendaftar_id}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            total: allNilai.length,
            recalculated: successCount,
            errors: errorCount,
            errorDetails: errors.slice(0, 10) // Limit error details
        });
    } catch (error: any) {
        console.error('Batch recalculate error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
