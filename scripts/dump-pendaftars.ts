import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const list = await prisma.pendaftar.findMany({
        select: {
            id: true,
            nama_lengkap: true,
            nomor_pendaftaran: true
        }
    });

    fs.writeFileSync('pendaftars_dump.json', JSON.stringify(list, null, 2));
    console.log('Dumped all pendaftars to pendaftars_dump.json');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
