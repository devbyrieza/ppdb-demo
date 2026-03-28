/**
 * Backfill Script: Fix penguji_*_id on existing JadwalUjian records
 * 
 * This script finds all JadwalUjian that have an exam_session_id but
 * missing penguji assignments, then fills them based on the session title
 * and the session's created_by field.
 * 
 * Usage: npx tsx scripts/backfill-penguji.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Looking for JadwalUjian records with missing penguji assignments...\n");

    const jadwalList = await prisma.jadwalUjian.findMany({
        where: {
            exam_session_id: { not: null },
            penguji_santri_id: null,
            penguji_quran_id: null,
            penguji_ortu_id: null,
        },
        include: {
            exam_session: {
                select: { id: true, title: true, created_by: true }
            },
            pendaftar: {
                select: { nama_lengkap: true }
            }
        }
    });

    console.log(`Found ${jadwalList.length} records to fix.\n`);

    let fixed = 0;
    let skipped = 0;

    for (const jadwal of jadwalList) {
        const session = jadwal.exam_session;
        if (!session || !session.created_by) {
            console.log(`⏭️  Skip: ${jadwal.pendaftar.nama_lengkap} — no session or no created_by`);
            skipped++;
            continue;
        }

        const title = (session.title || "").toLowerCase();
        let updateData: Record<string, string> = {};

        if (title.includes("qur") || title.includes("quran")) {
            updateData = { penguji_quran_id: session.created_by };
        } else if (title.includes("calsan") || title.includes("santri")) {
            updateData = { penguji_santri_id: session.created_by };
        } else if (title.includes("cawalsan") || title.includes("ortu") || title.includes("orang")) {
            updateData = { penguji_ortu_id: session.created_by };
        } else {
            console.log(`⏭️  Skip: ${jadwal.pendaftar.nama_lengkap} — unknown title "${session.title}"`);
            skipped++;
            continue;
        }

        await prisma.jadwalUjian.update({
            where: { id: jadwal.id },
            data: updateData,
        });

        const field = Object.keys(updateData)[0];
        console.log(`✅ Fixed: ${jadwal.pendaftar.nama_lengkap} — ${session.title} → ${field} = ${session.created_by}`);
        fixed++;
    }

    console.log(`\n========================================`);
    console.log(`Done! Fixed: ${fixed}, Skipped: ${skipped}`);
    console.log(`========================================`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
