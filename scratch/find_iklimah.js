
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pendaftar.findMany({
    where: { 
      OR: [
        { nama_lengkap: { contains: 'Iklimah', mode: 'insensitive' } },
        { nomor_pendaftaran: 'MTI2600013' }
      ]
    }
  });
  console.log(p);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
