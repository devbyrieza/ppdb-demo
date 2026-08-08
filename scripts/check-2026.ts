import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const year2026ID = '5864797b-1a92-4176-b55e-fe90711a79c2';

    const count = await prisma.pendaftar.count({
        where: { tahun_ajaran_id: year2026ID }
    });

    console.log(`Count for 2027-2028: ${count}`);

    const list = await prisma.pendaftar.findMany({
        where: { tahun_ajaran_id: year2026ID },
        select: { nama_lengkap: true, nomor_pendaftaran: true }
    });

    console.log('List for 2027-2028:', list);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
