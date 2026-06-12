const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pendaftars = await prisma.pendaftar.findMany({
    select: { id: true, nama_lengkap: true, nik: true, nomor_pendaftaran: true, status_pendaftaran: true }
  });
  console.log("PENDAFTAR:", pendaftars);
}
main().catch(console.error).finally(() => prisma.$disconnect());
