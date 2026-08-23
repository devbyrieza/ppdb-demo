import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const list = await prisma.pengajuanBeasiswa.findMany({
    include: {
      pendaftar: {
        select: {
          id: true,
          nama_lengkap: true,
          nomor_pendaftaran: true,
          status_pendaftaran: true }
      }
    }
  });
  
  console.log("=== PENGAJUAN BEASISWA RECORDS ===");
  for (const item of list) {
    console.log({
      id: item.id,
      nama: item.pendaftar?.nama_lengkap,
      nomor_pendaftaran: item.pendaftar?.nomor_pendaftaran,
      jenis_pengajuan: item.jenis_pengajuan,
      nominal_kesanggupan: item.nominal_kesanggupan ? Number(item.nominal_kesanggupan) : null,
      status: item.status,
      nominal_potongan: item.nominal_potongan ? Number(item.nominal_potongan) : null,
      tipe_potongan: item.tipe_potongan,
      persentase_potongan: item.persentase_potongan ? Number(item.persentase_potongan) : null });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
