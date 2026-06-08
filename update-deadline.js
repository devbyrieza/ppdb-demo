const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Updating deadline to 30 June 2026...");
    const result = await prisma.$executeRaw`UPDATE tahun_ajaran SET tanggal_tutup_pendaftaran = '2026-06-30', updated_at = NOW() WHERE is_active = true`;
    console.log(`Updated ${result} rows.`);
    
    const active = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });
    console.log("Active Tahun Ajaran:", active.nama);
    console.log("Tanggal Buka:", active.tanggal_buka_pendaftaran);
    console.log("Tanggal Tutup:", active.tanggal_tutup_pendaftaran);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
