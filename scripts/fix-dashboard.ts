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
  console.log('🧹 Memulai Proses Pembersihan Dashboard...');
  console.log('📡 Target Connection:', process.env.DATABASE_URL);

  const targetYearId = '77777777-7777-7777-7777-777777777777';
  const seedYearId = '11111111-1111-1111-1111-111111111111';

  // 1. Pastikan pendaftar yang mungkin nyangkut di seedYear dipindah ke targetYear
  console.log('🔄 Memindahkan data pendaftar seed ke tahun ajaran migrasi...');
  await prisma.pendaftar.updateMany({
    where: { tahun_ajaran_id: seedYearId },
    data: { tahun_ajaran_id: targetYearId }
  });

  await prisma.pembayaran.updateMany({
    where: { tahun_ajaran_id: seedYearId },
    data: { tahun_ajaran_id: targetYearId }
  });

  // 2. Hapus Tahun Ajaran duplikat
  console.log('🗑️ Menghapus Tahun Ajaran duplikat (seed)...');
  try {
    await prisma.tahunAjaran.delete({
      where: { id: seedYearId }
    });
    console.log('✅ Berhasil menghapus Tahun Ajaran duplikat.');
  } catch (e) {
    console.log('⚠️ Tahun ajaran seed mungkin sudah tidak ada atau gagal dihapus, lanjut...');
  }

  // 3. Pastikan Tahun Ajaran migrasi aktif
  console.log('🌟 Mengaktifkan Tahun Ajaran hasil migrasi...');
  await prisma.tahunAjaran.update({
    where: { id: targetYearId },
    data: { is_active: true }
  });

  console.log('\n✨ PERBAIKAN SELESAI! ✨');
  console.log('Silakan Refresh Dashboard Bapak sekarang. Angka 180 pendaftar seharusnya sudah muncul!');
}

main()
  .catch((e) => {
    console.error('❌ Kesalahan:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
