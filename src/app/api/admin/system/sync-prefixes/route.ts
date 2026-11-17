import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BRANDING } from "@/config/branding";

export const dynamic = "force-dynamic";

/**
 * Endpoint Sinkronisasi Awalan Nomor Pendaftaran
 * Menyesuaikan otomatis dengan identitas institusi (Putra vs Putri):
 * - Putri (Al-Imam / Banat): MTs -> MTI, IL -> ILI, MA/SMA -> MAI, gender -> "P"
 * - Putra (Ulul Albaab / Banin): MTs -> MTA, IL -> ILA, SMA/MA -> SMA, gender -> "L"
 */
export async function GET(request: NextRequest) {
  try {
    const isPutriInstitution = 
      BRANDING?.gender?.toLowerCase() === "putri" ||
      (BRANDING?.subtitle || "").toLowerCase().includes("putri") ||
      (BRANDING?.schoolName || "").toLowerCase().includes("putri");

    const isPutraInstitution = 
      BRANDING?.gender?.toLowerCase() === "putra" ||
      (BRANDING?.subtitle || "").toLowerCase().includes("putra") ||
      (BRANDING?.schoolName || "").toLowerCase().includes("putra") ||
      (BRANDING?.schoolShortName || "").toLowerCase().includes("ulul albaab");

    if (isPutriInstitution) {
      const list = await prisma.pendaftar.findMany({
        where: {
          OR: [
            { nomor_pendaftaran: { startsWith: "MTA" } },
            { nomor_pendaftaran: { startsWith: "ILA" } },
            { nomor_pendaftaran: { startsWith: "MAA" } },
            { nomor_pendaftaran: { startsWith: "SMA" } },
            { nomor_pendaftaran: { startsWith: "SPA" } },
            { jenis_kelamin: "L" },
          ],
        },
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

      const updates: Array<{ id: string; name: string; from: string; to: string }> = [];
      const reservedNomor = new Set<string>();

      for (const item of list) {
        let targetPrefix = "MTI";
        const normJ = (item.jenjang || "").toUpperCase();
        if (normJ.includes("IL")) targetPrefix = "ILI";
        else if (normJ.includes("MA") || normJ.includes("SMA")) targetPrefix = "MAI";
        else targetPrefix = "MTI";

        let newNomor = item.nomor_pendaftaran;
        if (item.nomor_pendaftaran && /^(MTA|ILA|MAA|SMA|SPA)/.test(item.nomor_pendaftaran)) {
          const tahun = item.nomor_pendaftaran.slice(3, 5);
          const candidate = `${targetPrefix}${item.nomor_pendaftaran.slice(3)}`;

          const conflict = await prisma.pendaftar.findUnique({ where: { nomor_pendaftaran: candidate } });
          if ((!conflict || conflict.id === item.id) && !reservedNomor.has(candidate)) {
            newNomor = candidate;
          } else {
            const existingList = await prisma.pendaftar.findMany({
              where: { nomor_pendaftaran: { startsWith: `${targetPrefix}${tahun}` } },
              select: { nomor_pendaftaran: true },
            });
            const usedSeqs = new Set(
              existingList
                .map((p) => parseInt(p.nomor_pendaftaran.slice(5), 10))
                .filter((n) => !isNaN(n))
            );
            let nextSeq = 1;
            while (
              usedSeqs.has(nextSeq) ||
              reservedNomor.has(`${targetPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`)
            ) {
              nextSeq++;
            }
            newNomor = `${targetPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`;
          }
          reservedNomor.add(newNomor);
        }

        const updatePayload: any = {};
        if (newNomor !== item.nomor_pendaftaran) {
          updatePayload.nomor_pendaftaran = newNomor;
          const dl = (item.data_lengkap as any) || {};
          dl.legacy_nomor_pendaftaran = item.nomor_pendaftaran;
          updatePayload.data_lengkap = dl;
        }
        if (item.jenis_kelamin !== "P") {
          updatePayload.jenis_kelamin = "P";
        }

        if (Object.keys(updatePayload).length > 0) {
          await prisma.pendaftar.update({
            where: { id: item.id },
            data: updatePayload,
          });
          updates.push({
            id: item.id,
            name: item.nama_lengkap,
            from: item.nomor_pendaftaran,
            to: newNomor,
          });
        }
      }

      return NextResponse.json({
        success: true,
        institution: BRANDING?.schoolName || "Khusus Putri",
        message: `Berhasil menyinkronkan ${updates.length} data pendaftar ke format Putri (MTI, ILI, MAI)`,
        updated_count: updates.length,
        updates,
      });
    } else if (isPutraInstitution) {
      const list = await prisma.pendaftar.findMany({
        where: {
          OR: [
            { nomor_pendaftaran: { startsWith: "MTI" } },
            { nomor_pendaftaran: { startsWith: "ILI" } },
            { nomor_pendaftaran: { startsWith: "MAI" } },
            { nomor_pendaftaran: { startsWith: "MAA" } },
            { nomor_pendaftaran: { startsWith: "SMI" } },
            { nomor_pendaftaran: { startsWith: "SPI" } },
            { jenis_kelamin: "P" },
          ],
        },
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

      const updates: Array<{ id: string; name: string; from: string; to: string }> = [];
      const reservedNomor = new Set<string>();

      for (const item of list) {
        let targetPrefix = "MTA";
        const normJ = (item.jenjang || "").toUpperCase();
        if (normJ.includes("IL")) targetPrefix = "ILA";
        else if (normJ.includes("SMA") || normJ.includes("MA")) targetPrefix = "SMA";
        else targetPrefix = "MTA";

        let newNomor = item.nomor_pendaftaran;
        if (item.nomor_pendaftaran && /^(MTI|ILI|MAI|MAA|SMI|SPI)/.test(item.nomor_pendaftaran)) {
          const tahun = item.nomor_pendaftaran.slice(3, 5);
          const candidate = `${targetPrefix}${item.nomor_pendaftaran.slice(3)}`;

          const conflict = await prisma.pendaftar.findUnique({ where: { nomor_pendaftaran: candidate } });
          if ((!conflict || conflict.id === item.id) && !reservedNomor.has(candidate)) {
            newNomor = candidate;
          } else {
            const existingList = await prisma.pendaftar.findMany({
              where: { nomor_pendaftaran: { startsWith: `${targetPrefix}${tahun}` } },
              select: { nomor_pendaftaran: true },
            });
            const usedSeqs = new Set(
              existingList
                .map((p) => parseInt(p.nomor_pendaftaran.slice(5), 10))
                .filter((n) => !isNaN(n))
            );
            let nextSeq = 1;
            while (
              usedSeqs.has(nextSeq) ||
              reservedNomor.has(`${targetPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`)
            ) {
              nextSeq++;
            }
            newNomor = `${targetPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`;
          }
          reservedNomor.add(newNomor);
        }

        const updatePayload: any = {};
        if (newNomor !== item.nomor_pendaftaran) {
          updatePayload.nomor_pendaftaran = newNomor;
          const dl = (item.data_lengkap as any) || {};
          dl.legacy_nomor_pendaftaran = item.nomor_pendaftaran;
          updatePayload.data_lengkap = dl;
        }
        if (normJ.includes("SMA") || normJ === "MA") {
          updatePayload.jenjang = "SMA";
        }
        if (item.jenis_kelamin !== "L") {
          updatePayload.jenis_kelamin = "L";
        }

        if (Object.keys(updatePayload).length > 0) {
          await prisma.pendaftar.update({
            where: { id: item.id },
            data: updatePayload,
          });
          updates.push({
            id: item.id,
            name: item.nama_lengkap,
            from: item.nomor_pendaftaran,
            to: newNomor,
          });
        }
      }

      return NextResponse.json({
        success: true,
        institution: BRANDING?.schoolName || "Khusus Putra",
        message: `Berhasil menyinkronkan ${updates.length} data pendaftar ke format Putra (MTA, ILA, SMA)`,
        updated_count: updates.length,
        updates,
      });
    } else {
      return NextResponse.json({
        success: true,
        institution: BRANDING?.schoolName || "Umum",
        message: "Institusi umum/campuran: tidak ada sinkronisasi gender otomatis yang dijalankan.",
      });
    }
  } catch (error: any) {
    console.error("SYNC_PREFIXES_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
