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
  console.log('🧹 Memulai Operasi Pembersihan Data Siluman...');

  const namesToDelete = [
    'Raylan Akbar',
    'Ahmad Draft',
    'Budi Pending',
    'Citra Verified',
    'Dewi Completed',
    'Abdul Aziz Ali'
  ];

  for (const name of namesToDelete) {
    console.log(`🔍 Memeriksa pendaftar: ${name}...`);
    const records = await prisma.pendaftar.findMany({
      where: { nama_lengkap: { contains: name, mode: 'insensitive' } }
    });

    for (const record of records) {
      // Delete child relations first if any, though most are cascade
      // But let's be safe and just delete the pendaftar (and profile via cascade if set)
      console.log(`🗑️ Menghapus ${record.nama_lengkap} (${record.nomor_pendaftaran})`);
      
      // Get the profile ID first
      const userId = record.user_id;

      await prisma.pendaftar.delete({ where: { id: record.id } });
      
      if (userId) {
        try {
           await prisma.profile.delete({ where: { id: userId } });
        } catch (e) {
           console.log(`ℹ️ Profile ${userId} mungkin masih digunakan pendaftar lain, dilewati.`);
        }
      }
    }
  }

  console.log('\n📅 Menyesuaikan Aktifitas Tahun Ajaran...');
  await prisma.tahunAjaran.updateMany({
    where: { nama: '2025/2026' },
    data: { is_active: false }
  });
  console.log('✅ Tahun Ajaran 2025/2026 telah dinonaktifkan.');

  console.log('\n✨ PEMBERSIHAN SELESAI! Database Ulul Albaab kini murni 2026/2027.');
}

main()
  .catch((e) => {
    console.error('❌ Kesalahan:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
