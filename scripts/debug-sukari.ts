import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const pendaftar = await prisma.pendaftar.findMany({
        where: {
            nomor_pendaftaran: 'MTI2500004'
        },
        include: {
            nilai_ujian: true
        }
    });

    console.log(JSON.stringify(pendaftar, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
