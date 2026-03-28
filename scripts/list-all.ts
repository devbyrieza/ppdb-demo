import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const list = await prisma.pendaftar.findMany({
        take: 50,
        select: {
            id: true,
            nama_lengkap: true,
            nomor_pendaftaran: true
        }
    });

    console.log('--- ALL PENDAFTARS ---');
    list.forEach(p => {
        console.log(`- [${p.nomor_pendaftaran}] ${p.nama_lengkap} (${p.id})`);
    });
    console.log('--- END ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
