import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targets = ['Raylan', 'Azzam', 'Sukari'];
    const pendaftars = await prisma.pendaftar.findMany({
        select: {
            id: true,
            nama_lengkap: true,
            nomor_pendaftaran: true
        }
    });

    console.log('--- TARGET MATCHES ---');
    pendaftars.forEach(p => {
        const match = targets.some(t => p.nama_lengkap.toLowerCase().includes(t.toLowerCase()));
        if (match) {
            console.log(`MATCH: [${p.nomor_pendaftaran}] ${p.nama_lengkap} (ID: ${p.id})`);
        }
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
