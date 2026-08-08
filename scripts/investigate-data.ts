import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production', override: true });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const SQL_FILE = 'full_20260328.sql';

async function main() {
  console.log('🕵️‍♂️ Memulai Investigasi Data...');

  // 1. Audit Tahun Ajaran di SQL Dump
  const content = fs.readFileSync(SQL_FILE, 'utf8');
  console.log('📊 Menghitung distribusi tahun di file SQL...');
  
  const matches2025 = (content.match(/'2025'/g) || []).length;
  const matches2026 = (content.match(/'2026'/g) || []).length;
  const matches2027 = (content.match(/'2027'/g) || []).length;

  console.log(`- Data Tahun 2025: ${matches2025} baris`);
  console.log(`- Data Tahun 2026: ${matches2026} baris`);
  console.log(`- Data Tahun 2027: ${matches2027} baris`);

  // 2. Cari Raylan Akbar di Database Live
  console.log('\n🔍 Mencari detail Raylan Akbar di Database Produksi...');
  const raylan = await prisma.pendaftar.findFirst({
    where: { nama_lengkap: { contains: 'Raylan', mode: 'insensitive' } },
    include: { tahun_ajaran: true }
  });

  if (raylan) {
    console.log('✅ Raylan Akbar DITEMUKAN di database live.');
    console.log(`- Nomor Pendaftaran: ${raylan.nomor_pendaftaran}`);
    console.log(`- Tahun Ajaran: ${raylan.tahun_ajaran?.nama}`);
    console.log(`- Dibuat pada: ${raylan.created_at}`);
  } else {
    console.log('❌ Raylan Akbar TIDAK ditemukan di database live.');
  }

  // 3. Setup Tahun Ajaran 2027-2028
  console.log('\n📅 Menyiapkan Tahun Ajaran 2027-2028...');
  const year2026 = await prisma.tahunAjaran.upsert({
    where: { id: '88888888-8888-8888-8888-888888888888' },
    update: { is_active: true },
    create: {
      id: '88888888-8888-8888-8888-888888888888',
      nama: '2027-2028',
      tahun_mulai: 2026,
      tahun_selesai: 2027,
      is_active: true,
      tanggal_buka_pendaftaran: new Date('2025-09-01'),
      tanggal_tutup_pendaftaran: new Date('2026-07-31'),
    }
  });
  console.log(`✅ Tahun Ajaran 2027-2028 (Aktif): ${year2026.id}`);

  console.log('\n✨ INVESTIGASI SELESAI!');
}

main()
  .catch((e) => {
    console.error('❌ Kesalahan:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
