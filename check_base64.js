const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pembayaran.findMany({
    orderBy: { updated_at: 'desc' },
    take: 3
  });
  console.log(p.map(x => ({
    id: x.id,
    pendaftar_id: x.pendaftar_id,
    filename: x.bukti_transfer_filename,
    has_json: !!x.midtrans_response_json,
    json: x.midtrans_response_json ? Object.keys(x.midtrans_response_json) : null
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
