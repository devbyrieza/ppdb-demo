import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Search by exact ID from screenshot
    const p = await prisma.pendaftar.findFirst({
        where: { nomor_pendaftaran: 'MTI2600004' },
        include: { nilai_ujian: true }
    });

    if (p) {
        console.log('Result:', JSON.stringify(p, null, 2));
    } else {
        // Search by name contains
        const p2 = await prisma.pendaftar.findFirst({
            where: { nama_lengkap: { contains: 'Sukari', mode: 'insensitive' } },
            include: { nilai_ujian: true }
        });
        if (p2) {
            console.log('Result (via name):', JSON.stringify(p2, null, 2));
        } else {
            console.log('Not found at all');
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
