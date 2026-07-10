const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://postgres.dxaywhgdczmdynziqkmc:BCQiZ0YNkHLgu5YM@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }
  }
});

async function run() {
  try {
    // Check accepted pendaftar with their NIKs
    const accepted = await prisma.pendaftar.findMany({
      where: { status_pendaftaran: 'accepted' },
      select: {
        id: true,
        nomor_pendaftaran: true,
        nik: true,
        nama_lengkap: true,
        jenis_kelamin: true,
        jenjang: true,
        ukuran_seragam_baju: true,
        ukuran_seragam_celana: true,
        status_pendaftaran: true,
      }
    });
    console.log('Accepted pendaftar:', JSON.stringify(accepted, null, 2));

    // Check welcome day info
    const welcomeDay = await prisma.welcomeDay.findMany({ take: 5 }).catch(() => 'Table not found');
    console.log('Welcome day data:', welcomeDay);

    // Check daftar ulang
    const du = await prisma.pembayaran.findMany({ 
      where: { jenis_pembayaran: 'DAFTAR_ULANG' }, 
      select: { pendaftar_id: true, status_pembayaran: true, jumlah: true }
    });
    console.log('Daftar ulang payments:', JSON.stringify(du, null, 2));

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
