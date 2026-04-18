import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Fetch relevant profiles (Examiners, Interviewers, IT/SuperAdmin who might have tested)
        const profiles = await prisma.profile.findMany({
            where: {
                OR: [
                    { role: { in: ['penguji_calsan', 'pewawancara_calsan', 'pewawancara_cawalsan', 'admin_super', 'tim_it'] } },
                    { secondary_roles: { hasSome: ['penguji_calsan', 'pewawancara_calsan', 'pewawancara_cawalsan'] } }
                ]
            },
            select: {
                id: true,
                full_name: true,
                role: true,
            }
        });

        // 2. Aggregate counts from NilaiUjian table
        // We do this by grouping by the input fields
        const quranGroups = await prisma.nilaiUjian.groupBy({
            by: ['input_by_quran'],
            _count: { _all: true },
            where: { input_by_quran: { not: null } }
        });

        const santriGroups = await prisma.nilaiUjian.groupBy({
            by: ['input_by_santri'],
            _count: { _all: true },
            where: { input_by_santri: { not: null } }
        });

        const ortuGroups = await prisma.nilaiUjian.groupBy({
            by: ['input_by_ortu'],
            _count: { _all: true },
            where: { input_by_ortu: { not: null } }
        });

        // 3. Map aggregates to profiles
        const recap = profiles.map(p => {
            const quranCount = quranGroups.find(g => g.input_by_quran === p.id)?._count._all || 0;
            const santriCount = santriGroups.find(g => g.input_by_santri === p.id)?._count._all || 0;
            const ortuCount = ortuGroups.find(g => g.input_by_ortu === p.id)?._count._all || 0;

            return {
                id: p.id,
                name: p.full_name,
                role: p.role,
                counts: {
                    quran: quranCount,
                    santri: santriCount,
                    ortu: ortuCount,
                    total: quranCount + santriCount + ortuCount
                }
            };
        }).filter(item => item.counts.total > 0); // Only show those who have actually tested

        return NextResponse.json({ success: true, data: recap });

    } catch (error) {
        console.error('Recap API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
