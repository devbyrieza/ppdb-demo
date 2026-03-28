import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const list = await prisma.pendaftar.findMany({
        select: {
            id: true,
            nama_lengkap: true,
            nomor_pendaftaran: true,
            tahun_ajaran: {
                select: { nama: true }
            }
        }
    });

    const years = await prisma.tahunAjaran.findMany();

    console.log('--- ALL PENDAFTARS ---');
    list.forEach(p => {
        console.log(`- [${p.nomor_pendaftaran}] ${p.nama_lengkap} (Year: ${p.tahun_ajaran.nama}) (ID: ${p.id})`);
    });

    console.log('\n--- ALL TAHUN AJARAN ---');
    years.forEach(y => {
        console.log(`- ${y.nama} (Active: ${y.is_active}) (ID: ${y.id})`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
