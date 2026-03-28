import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

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

    const data = {
        pendaftars: list,
        tahun_ajaran: years
    };

    fs.writeFileSync('cleanup_audit.json', JSON.stringify(data, null, 2));
    console.log('Dumped audit data to cleanup_audit.json');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
