const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
    console.log("Adding detail_quran column...");
    await p.$executeRawUnsafe(
        "ALTER TABLE nilai_ujian ADD COLUMN IF NOT EXISTS detail_quran JSONB"
    );
    console.log("Added detail_quran.");

    console.log("Adding detail_cawalsan column...");
    await p.$executeRawUnsafe(
        "ALTER TABLE nilai_ujian ADD COLUMN IF NOT EXISTS detail_cawalsan JSONB"
    );
    console.log("Added detail_cawalsan. Migration complete!");
}

main().catch(e => console.error("Migration error:", e.message)).finally(() => p.$disconnect());
