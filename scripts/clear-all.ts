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
  console.log('🧹 Memulai Pembersihan Total Pendaftar (Wipe & Load)...');

  // Menghapus semua pendaftar, orang tua, pembayaran, dan dokumen terkait (Cascade)
  const deletePendaftar = await prisma.pendaftar.deleteMany();
  const deleteProfile = await prisma.profile.deleteMany({
    where: { role: 'pendaftar' }
  });

  console.log(`✅ ${deletePendaftar.count} Pendaftar berhasil dihapus.`);
  console.log(`✅ ${deleteProfile.count} Profile pendaftar berhasil dihapus.`);

  console.log('\n✨ DATABASE BERSIH! Siap Menampung Migrasi 2027-2028.');
}

main()
  .catch((e) => {
    console.error('❌ Kesalahan:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
