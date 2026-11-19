import { prisma } from "../src/lib/prisma";
import { getInstitutionType, isPutriInstitution } from "../src/lib/utils/jenjang";
import { generatePrefix } from "../src/lib/utils/nomor-pendaftaran";

async function main() {
  const inst = getInstitutionType();
  const isPutri = isPutriInstitution();
  const targetGender = isPutri ? "P" : "L";

  let instLabel = "";
  let targetSMPorMTs = "MTA";
  let targetIL = "ILA";
  let targetSMAorMA = "SMA";

  if (inst === "ANDALUS_PUSAT") {
    if (isPutri) {
      instLabel = "Andalus Pusat Putri (SMP IT: SPI, IL: ILI)";
      targetSMPorMTs = "SPI";
      targetIL = "ILI";
    } else {
      instLabel = "Andalus Pusat Putra (SMP IT: SPA, IL: ILA)";
      targetSMPorMTs = "SPA";
      targetIL = "ILA";
    }
  } else if (inst === "AL_IMAM") {
    instLabel = "Al-Imam Putri (MTs: MTI, IL: ILI, MA: MAI)";
    targetSMPorMTs = "MTI";
    targetIL = "ILI";
    targetSMAorMA = "MAI";
  } else {
    instLabel = "Ulul Albaab Putra (MTs: MTA, IL: ILA, SMA: SMA)";
    targetSMPorMTs = "MTA";
    targetIL = "ILA";
    targetSMAorMA = "SMA";
  }

  console.log(`\n========================================`);
  console.log(`Mulai sinkronisasi awalan untuk: ${instLabel}`);
  console.log(`========================================\n`);

  const list = await prisma.pendaftar.findMany({
    select: {
      id: true,
      nomor_pendaftaran: true,
      nama_lengkap: true,
      jenjang: true,
      jenis_kelamin: true,
      data_lengkap: true,
    },
    orderBy: { nomor_pendaftaran: "asc" },
  });

  console.log(`Total pendaftar ditemukan: ${list.length}`);
  let updatedCount = 0;
  const reservedNomor = new Set<string>();

  for (const item of list) {
    const oldNomor = item.nomor_pendaftaran || "";
    const normJ = (item.jenjang || "").toUpperCase();
    let expectedPrefix = targetSMPorMTs;
    if (normJ.includes("IL") || normJ.includes("IDAD") || normJ.includes("LUGHAW")) {
      expectedPrefix = targetIL;
    } else if (normJ.includes("SMA") || normJ.includes("MA")) {
      expectedPrefix = inst === "ANDALUS_PUSAT" ? targetSMPorMTs : targetSMAorMA;
    }

    const currentPrefix = oldNomor.slice(0, 3).toUpperCase();
    const updateData: any = {};

    // 1. Normalize jenjang
    if (inst === "ANDALUS_PUSAT") {
      const correctJenjang = normJ.includes("IL") || normJ.includes("IDAD") ? "IL" : "SMP IT";
      if (item.jenjang !== correctJenjang) updateData.jenjang = correctJenjang;
    } else if (inst === "AL_IMAM") {
      let correctJenjang = "MTs";
      if (normJ.includes("IL") || normJ.includes("IDAD")) correctJenjang = "IL";
      else if (normJ.includes("MA") || normJ.includes("SMA")) correctJenjang = "MA";
      if (item.jenjang !== correctJenjang) updateData.jenjang = correctJenjang;
    } else {
      let correctJenjang = "MTs";
      if (normJ.includes("IL") || normJ.includes("IDAD")) correctJenjang = "IL";
      else if (normJ.includes("MA") || normJ.includes("SMA")) correctJenjang = "SMA";
      if (item.jenjang !== correctJenjang) updateData.jenjang = correctJenjang;
    }

    // 2. Normalize gender
    if (item.jenis_kelamin !== targetGender) {
      updateData.jenis_kelamin = targetGender;
    }

    // 3. Normalize nomor_pendaftaran prefix
    if (currentPrefix !== expectedPrefix && oldNomor.length >= 8) {
      const tahun = oldNomor.slice(3, 5);
      const candidate = `${expectedPrefix}${oldNomor.slice(3)}`;
      const conflict = await prisma.pendaftar.findUnique({ where: { nomor_pendaftaran: candidate } });
      let finalNomor = candidate;

      if ((conflict && conflict.id !== item.id) || reservedNomor.has(candidate)) {
        const existingList = await prisma.pendaftar.findMany({
          where: { nomor_pendaftaran: { startsWith: `${expectedPrefix}${tahun}` } },
          select: { nomor_pendaftaran: true },
        });
        const usedSeqs = new Set(
          existingList.map((p) => parseInt(p.nomor_pendaftaran.slice(5), 10)).filter((n) => !isNaN(n))
        );
        let nextSeq = 1;
        while (
          usedSeqs.has(nextSeq) ||
          reservedNomor.has(`${expectedPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`)
        ) {
          nextSeq++;
        }
        finalNomor = `${expectedPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`;
      }

      reservedNomor.add(finalNomor);
      updateData.nomor_pendaftaran = finalNomor;
      const dl = (item.data_lengkap as any) || {};
      dl.legacy_nomor_pendaftaran = oldNomor;
      updateData.data_lengkap = dl;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.pendaftar.update({
        where: { id: item.id },
        data: updateData,
      });
      console.log(
        `✓ [${item.nama_lengkap}]: ${oldNomor} -> ${updateData.nomor_pendaftaran || oldNomor} (${updateData.jenjang || item.jenjang})`
      );
      updatedCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Selesai! Total pendaftar disinkronkan: ${updatedCount}`);
  console.log(`========================================\n`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
