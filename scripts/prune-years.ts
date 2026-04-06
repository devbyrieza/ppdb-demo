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
  console.log('🧹 Memulai Operasi Pembersihan Tahun Ajaran Kosong...');

  // Cari tahun ajaran 2025/2026
  const targetYear = await prisma.tahunAjaran.findFirst({
    where: {
      nama: '2025/2026'
    }
  });

  if (!targetYear) {
    console.log('✅ Tahun Ajaran 2025/2026 sudah tidak ada.');
    return;
  }

  // Cek apakah ada pendaftar yang masih tertinggal
  const pendaftarCount = await prisma.pendaftar.count({
    where: { tahun_ajaran_id: targetYear.id }
  });

  if (pendaftarCount > 0) {
    console.log(`⚠️ PERINGATAN: Masih ada ${pendaftarCount} pendaftar di tahun 2025/2026. Batal hapus demi keamanan.`);
    return;
  }

  // Hapus tahun ajaran
  await prisma.tahunAjaran.delete({
    where: { id: targetYear.id }
  });

  console.log('✅ Tahun Ajaran 2025/2026 berhasil dihapus sepenuhnya.');
}

main()
  .catch((e) => {
    console.error('❌ Kesalahan:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
