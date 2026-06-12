const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function processPendaftar(pendaftarId) {
  const p = await prisma.pendaftar.findUnique({ where: { id: pendaftarId } });
  if (!p) return;

  // 1. Create/Update Hasil Seleksi
  await prisma.hasilSeleksi.upsert({
    where: { pendaftar_id: pendaftarId },
    update: { status_seleksi: 'DITERIMA', nilai_akhir: 90 },
    create: {
      pendaftar_id: pendaftarId,
      tahun_ajaran_id: p.tahun_ajaran_id,
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
      tahun_ajaran_id: p.tahun_ajaran_id,
      status_kelulusan: 'LULUS',
      is_published: true,
      ranking: 1,
    }
  });
  
  // 3. Update Pendaftar status to accepted if needed
  await prisma.pendaftar.update({
    where: { id: pendaftarId },
    data: { status_pendaftaran: 'accepted' }
  });
}

async function main() {
  const hamzahId = 'badd9a11-eef3-41be-8c54-90c07a86be8e';
  const trytesId = '03287cec-f252-4a35-9914-d0c3b01be3a7';

  await processPendaftar(hamzahId);
  await processPendaftar(trytesId);

  console.log('Fixed Hamzah and Trytes to be LULUS');
}
main().catch(console.error).finally(() => prisma.$disconnect());
