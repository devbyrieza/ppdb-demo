import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BRANDING } from "@/config/branding";
import { getInstitutionType, isPutriInstitution } from "@/lib/utils/jenjang";
import { generatePrefix } from "@/lib/utils/nomor-pendaftaran";

export const dynamic = "force-dynamic";

/**
 * Endpoint Sinkronisasi Awalan Nomor Pendaftaran
 * Menyesuaikan otomatis dengan identitas institusi:
 * - Ulul Albaab (Putra): MTs -> MTA, IL -> ILA, SMA -> SMA, gender -> "L"
 * - Al-Imam (Putri): MTs -> MTI, IL -> ILI, MA -> MAI, gender -> "P"
 * - Andalus Pusat Putra: SMP IT -> SPA, IL -> ILA, gender -> "L"
 * - Andalus Pusat Putri: SMP IT -> SPI, IL -> ILI, gender -> "P"
 */
export async function GET(request: NextRequest) {
  try {
    const inst = getInstitutionType();
    const isPutri = isPutriInstitution();
    const targetGender = isPutri ? "P" : "L";

    let institutionLabel = "";
    if (inst === "ANDALUS_PUSAT") {
      institutionLabel = isPutri ? "Andalus Pusat Putri (SPI, ILI)" : "Andalus Pusat Putra (SPA, ILA)";
    } else if (inst === "AL_IMAM") {
      institutionLabel = "Al-Imam Putri (MTI, ILI, MAI)";
    } else {
      institutionLabel = "Ulul Albaab Putra (MTA, ILA, SMA)";
    }

    const allPendaftar = await prisma.pendaftar.findMany({
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

    const updates: Array<{ id: string; name: string; from: string; to: string; jenjang: string }> = [];
    const reservedNomor = new Set<string>();

    for (const item of allPendaftar) {
      const oldNomor = item.nomor_pendaftaran || "";
      const expectedPrefix = generatePrefix(item.jenjang || "", targetGender);
      const currentPrefix = oldNomor.slice(0, 3).toUpperCase();

      const updatePayload: any = {};

      // 1. Check Jenjang normalization
      let targetJenjang = item.jenjang;
      const normJ = (item.jenjang || "").toUpperCase();
      if (inst === "ANDALUS_PUSAT") {
        if (normJ.includes("IL") || normJ.includes("IDAD") || normJ.includes("LUGHAW")) {
          targetJenjang = "IL";
        } else {
          targetJenjang = "SMP IT";
        }
      } else if (inst === "AL_IMAM") {
        if (normJ.includes("IL") || normJ.includes("IDAD") || normJ.includes("LUGHAW")) {
          targetJenjang = "IL";
        } else if (normJ.includes("SMA") || normJ.includes("MA")) {
          targetJenjang = "MA";
        } else {
          targetJenjang = "MTs";
        }
      } else {
        // Ulul Albaab
        if (normJ.includes("IL") || normJ.includes("IDAD") || normJ.includes("LUGHAW")) {
          targetJenjang = "IL";
        } else if (normJ.includes("SMA") || normJ.includes("MA")) {
          targetJenjang = "SMA";
        } else {
          targetJenjang = "MTs";
        }
      }

      if (targetJenjang !== item.jenjang) {
        updatePayload.jenjang = targetJenjang;
      }

      // 2. Check Gender
      if (item.jenis_kelamin !== targetGender) {
        updatePayload.jenis_kelamin = targetGender;
      }

      // 3. Check Prefix
      if (currentPrefix !== expectedPrefix && oldNomor.length >= 8) {
        const tahun = oldNomor.slice(3, 5);
        const candidate = `${expectedPrefix}${oldNomor.slice(3)}`;

        const conflict = await prisma.pendaftar.findUnique({ where: { nomor_pendaftaran: candidate } });
        let newNomor = candidate;

        if ((conflict && conflict.id !== item.id) || reservedNomor.has(candidate)) {
          const existingList = await prisma.pendaftar.findMany({
            where: { nomor_pendaftaran: { startsWith: `${expectedPrefix}${tahun}` } },
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
            reservedNomor.has(`${expectedPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`)
          ) {
            nextSeq++;
          }
          newNomor = `${expectedPrefix}${tahun}${String(nextSeq).padStart(5, "0")}`;
        }

        reservedNomor.add(newNomor);
        updatePayload.nomor_pendaftaran = newNomor;

        const dl = (item.data_lengkap as any) || {};
        dl.legacy_nomor_pendaftaran = oldNomor;
        updatePayload.data_lengkap = dl;
      }

      if (Object.keys(updatePayload).length > 0) {
        await prisma.pendaftar.update({
          where: { id: item.id },
          data: updatePayload,
        });

        updates.push({
          id: item.id,
          name: item.nama_lengkap,
          from: oldNomor,
          to: updatePayload.nomor_pendaftaran || oldNomor,
          jenjang: updatePayload.jenjang || item.jenjang,
        });
      }
    }

    return NextResponse.json({
      success: true,
      institution: BRANDING?.schoolName || institutionLabel,
      inst_type: inst,
      message: `Berhasil menyinkronkan ${updates.length} data pendaftar ke standar ${institutionLabel}`,
      updated_count: updates.length,
      updates,
    });
  } catch (error: any) {
    console.error("SYNC_PREFIXES_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
