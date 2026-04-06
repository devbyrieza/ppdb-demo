import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production', override: true });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🕵️‍♂️ Memulai Audit Data Pendaftar Migrasi...');

  const summary = await prisma.pendaftar.groupBy({
    by: ['tahun_ajaran_id'],
    _count: {
      id: true
    }
  });

  console.log('\n📊 Distribusi Pendaftar per Tahun Ajaran (Hasil Migrasi):');
  
  for (const item of summary) {
    const year = await prisma.tahunAjaran.findUnique({
      where: { id: item.tahun_ajaran_id }
    });
    console.log(`- Tahun Ajaran [${year?.nama}]: ${item._count.id} Pendaftar`);
  }

  console.log('\n✨ AUDIT SELESAI!');
}

main()
  .catch((e) => {
    console.error('❌ Kesalahan:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
