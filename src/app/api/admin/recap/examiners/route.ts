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

        // 2. Fetch all valid schedules matching Monitoring Jadwal exclusions
        const schedules = await prisma.jadwalUjian.findMany({
            where: {
                pendaftar: {
                    deleted_at: null
                }
            },
            include: {
                pendaftar: {
                    select: {
                        nama_lengkap: true,
                    }
                }
            }
        });

        // 3. Filter out "tes" data exactly like Monitoring Jadwal
        const cleanedData = schedules.filter(s => {
            const nama = s.pendaftar.nama_lengkap.toLowerCase();
            return !nama.includes("tes ") && !nama.includes("test") && !nama.endsWith("tes");
        });

        // 4. Map aggregates to profiles by counting actual valid schedule assignments
        const recap = profiles.map(p => {
            const quranCount = cleanedData.filter(s => s.penguji_quran_id === p.id).length;
            const santriCount = cleanedData.filter(s => s.penguji_santri_id === p.id).length;
            const ortuCount = cleanedData.filter(s => s.penguji_ortu_id === p.id).length;

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
        }).filter(item => item.counts.total > 0); // Only show those who have actually been scheduled

        return NextResponse.json({ success: true, data: recap });

    } catch (error) {
        console.error('Recap API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
