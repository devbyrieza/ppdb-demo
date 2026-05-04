import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const pendaftar = await prisma.pendaftar.findMany({
    where: {
      nama_lengkap: {
        contains: "Ahmad Sobari",
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      nomor_pendaftaran: true,
      nama_lengkap: true,
    },
  });

  console.log("--- PENDAFTAR ---");
  console.log(JSON.stringify(pendaftar, null, 2));

  const jadwal = await prisma.jadwalUjian.findMany({
    where: {
      pendaftar: {
        nama_lengkap: {
          contains: "Ahmad Sobari",
          mode: "insensitive",
        },
      },
    },
    include: {
      pendaftar: {
        select: {
          nama_lengkap: true,
        },
      },
    },
  });

  console.log("\n--- JADWAL UJIAN ---");
  console.log(JSON.stringify(jadwal, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
