const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftarId = '03287cec-f252-4a35-9914-d0c3b01be3a7';
  
  // Update Pendaftar statuses
  const p = await prisma.pendaftar.update({
    where: { id: pendaftarId },
    data: {
      status_pendaftaran: 'completed',
      verifikasi_status: 'verified'
    }
  });
  
  // Update his Pembayaran to verified
  await prisma.pembayaran.updateMany({
    where: { pendaftar_id: pendaftarId },
    data: {
      status_pembayaran: 'verified'
    }
  });
  
  console.log({
    nama: p.nama_lengkap,
    nomor_pendaftaran: p.nomor_pendaftaran,
    nik: p.nik
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
