const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
async function main() {
    console.log("Looking for JadwalUjian with missing penguji assignments...");
    const jadwalList = await p.jadwalUjian.findMany({
        where: {
            exam_session_id: { not: null },
            penguji_santri_id: null,
            penguji_quran_id: null,
            penguji_ortu_id: null,
        },
        include: {
            exam_session: { select: { id: true, title: true, created_by: true } },
            pendaftar: { select: { nama_lengkap: true } }
        }
    });
    console.log("Found " + jadwalList.length + " records to fix.");
    let fixed = 0, skipped = 0;
    for (const jadwal of jadwalList) {
        const session = jadwal.exam_session;
        if (!session || !session.created_by) {
            console.log("Skip: " + jadwal.pendaftar.nama_lengkap + " - no session/created_by");
            skipped++;
            continue;
        }
        const title = (session.title || "").toLowerCase();
        let updateData = {};
        if (title.includes("qur") || title.includes("quran")) {
            updateData = { penguji_quran_id: session.created_by };
        } else if (title.includes("calsan") || title.includes("santri")) {
            updateData = { penguji_santri_id: session.created_by };
        } else if (title.includes("cawalsan") || title.includes("ortu") || title.includes("orang")) {
            updateData = { penguji_ortu_id: session.created_by };
        } else {
            console.log("Skip: " + jadwal.pendaftar.nama_lengkap + " - unknown title: " + session.title);
            skipped++;
            continue;
        }
        await p.jadwalUjian.update({ where: { id: jadwal.id }, data: updateData });
        const field = Object.keys(updateData)[0];
        console.log("Fixed: " + jadwal.pendaftar.nama_lengkap + " -> " + field + " = " + session.created_by);
        fixed++;
    }
    console.log("Done! Fixed: " + fixed + ", Skipped: " + skipped);
}
main().catch(console.error).finally(() => p.$disconnect());
