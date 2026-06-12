const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pendaftar.findUnique({
    where: { nomor_pendaftaran: 'MTA2500010' },
  });
  console.log(p);
}
main().catch(console.error).finally(() => prisma.$disconnect());
