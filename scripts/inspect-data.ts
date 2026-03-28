import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Inspection ---');

    const totalPendaftar = await prisma.pendaftar.count();
    console.log('Total Pendaftar:', totalPendaftar);

    const latestPendaftar = await prisma.pendaftar.findMany({
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
            id: true,
            nama_lengkap: true,
            created_at: true,
            tahun_ajaran: {
                select: {
                    nama: true
                }
            }
        }
    });

    console.log('\nLatest 10 Pendaftar:');
    latestPendaftar.forEach((p, i) => {
        console.log(`${i + 1}. ${p.nama_lengkap} (${p.tahun_ajaran.nama}) - ${p.created_at}`);
    });

    const years = await prisma.tahunAjaran.findMany({
        select: {
            id: true,
            nama: true,
            is_active: true
        }
    });

    console.log('\nTahun Ajaran:');
    years.forEach(y => {
        console.log(`- ${y.nama} (Active: ${y.is_active}) [${y.id}]`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
