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
  console.log('🕵️‍♂️ Memulai Audit Kesesuaian Data (Sync Check)...');

  // 1. Audit Jenjang & Gender
  const jenjangStats = await prisma.pendaftar.groupBy({
    by: ['jenjang', 'jenis_kelamin'],
    _count: { id: true }
  });

  console.log('\n📊 Statistik Jenjang & Gender (Live DB):');
  let totalInDB = 0;
  for (const stat of jenjangStats) {
    console.log(`- ${stat.jenjang} [${stat.jenis_kelamin === 'L' ? 'Ikhwan' : 'Akhwat'}]: ${stat._count.id} Santri`);
    totalInDB += stat._count.id;
  }
  console.log(`\n➡️ TOTAL PENDAFTAR DI DB: ${totalInDB}`);

  // 2. Audit Berkas & Pembayaran
  const berkasCount = await prisma.dokumen.count();
  const bayarCount = await prisma.pembayaran.count();

  console.log(`\n📄 Data Berkas: ${berkasCount}`);
  console.log(`💰 Data Bukti Pembayaran: ${bayarCount}`);

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
