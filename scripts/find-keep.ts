import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const keepNames = [
        'Raylan Akbar',
        'muhammad Azzam Al hafiz',
        'Ahmad Sukari Tes'
    ];

    const results = await prisma.pendaftar.findMany({
        where: {
            nama_lengkap: {
                in: keepNames,
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            nama_lengkap: true,
            nomor_pendaftaran: true
        }
    });

    console.log('--- FOUND RECORDS TO KEEP ---');
    results.forEach(p => {
        console.log(`Keep: [${p.nomor_pendaftaran}] ${p.nama_lengkap} (ID: ${p.id})`);
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
