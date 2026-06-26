const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.whatsappLog.findMany({
    where: { pendaftar_id: 'ILA2600018' },
  });
  console.log(JSON.stringify(logs, null, 2));
}
main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
