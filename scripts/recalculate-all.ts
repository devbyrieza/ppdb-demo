import { PrismaClient } from '@prisma/client';
import { recalculateNilaiUjian } from '../src/lib/scoring';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting global score recalculation...');

    const allNilai = await prisma.nilaiUjian.findMany({
        select: { pendaftar_id: true }
    });

    console.log(`Found ${allNilai.length} records to process.`);

    for (const item of allNilai) {
        try {
            await recalculateNilaiUjian(item.pendaftar_id);
            console.log(`- Recalculated for pendaftar_id: ${item.pendaftar_id}`);
        } catch (err: any) {
            console.error(`- Failed for ${item.pendaftar_id}: ${err.message}`);
        }
    }

    console.log('Recalculation complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
