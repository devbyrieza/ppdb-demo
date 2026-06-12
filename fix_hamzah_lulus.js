const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftarId = 'badd9a11-eef3-41be-8c54-90c07a86be8e'; // Hamzah Hidayat ID
  const tahunAjaranId = '11111111-1111-1111-1111-111111111111';

  // 1. Create/Update Hasil Seleksi
  await prisma.hasilSeleksi.upsert({
    where: { pendaftar_id: pendaftarId },
    update: { status_seleksi: 'DITERIMA', nilai_akhir: 90 },
    create: {
      pendaftar_id: pendaftarId,
      tahun_ajaran_id: tahunAjaranId,
      status_seleksi: 'DITERIMA',
      nilai_akhir: 90,
    }
  });

  // 2. Create/Update Pengumuman
  await prisma.pengumuman.upsert({
    where: { pendaftar_id: pendaftarId },
    update: { status_kelulusan: 'LULUS', is_published: true },
    create: {
      pendaftar_id: pendaftarId,
      tahun_ajaran_id: tahunAjaranId,
      status_kelulusan: 'LULUS',
      is_published: true,
      ranking: 1,
    }
  });

  console.log('Fixed Hamzah Hasil Seleksi and Pengumuman');
}
main().catch(console.error).finally(() => prisma.$disconnect());
