import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const all = await prisma.pendaftar.findMany();

    fs.writeFileSync('FULL_PENDAFTAR_DUMP.json', JSON.stringify(all, null, 2));
    console.log(`Dumped ${all.length} records to FULL_PENDAFTAR_DUMP.json`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
