import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const data = [
  { name: "Abah", phone: "087836270966" },
  { name: "Agus Cahyono", phone: "081251971250" },
  { name: "Fuad Khomsatun", phone: "085692512479" },
  { name: "Jusman", phone: "081241295968" },
  { name: "Maulidin Bachtiar", phone: "0895332071063" },
  { name: "Muhajir", phone: "085826330927" },
  { name: "Muhammad Syauqi Al Faruq", phone: "08568719310" },
  { name: "Teguh", phone: "081398225358" },
];

async function main() {
  console.log("🚀 Memulai update nomor HP penguji...");
  for (const item of data) {
    try {
      const result = await prisma.profile.updateMany({
        where: {
          full_name: { contains: item.name, mode: "insensitive" },
        },
        data: { phone: item.phone },
      });
      console.log(`✅ ${item.name}: updated ${result.count} records`);
    } catch (error) {
      console.error(`❌ Gagal update ${item.name}:`, error);
    }
  }
  console.log("✨ Selesai!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
