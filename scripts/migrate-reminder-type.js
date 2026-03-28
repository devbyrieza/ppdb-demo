const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
    console.log("Adding reminder_type column...");
    await p.$executeRawUnsafe(
        "ALTER TABLE jadwal_notif_reminder ADD COLUMN IF NOT EXISTS reminder_type VARCHAR(10) DEFAULT 'h1'"
    );
    console.log("Column added.");

    console.log("Dropping old unique constraint...");
    await p.$executeRawUnsafe(
        "ALTER TABLE jadwal_notif_reminder DROP CONSTRAINT IF EXISTS jadwal_notif_reminder_jadwal_ujian_id_pendaftar_id_key"
    );
    console.log("Old constraint dropped.");

    console.log("Adding new unique constraint...");
    await p.$executeRawUnsafe(
        "CREATE UNIQUE INDEX IF NOT EXISTS jadwal_notif_reminder_jadwal_ujian_id_pendaftar_id_remind_key ON jadwal_notif_reminder(jadwal_ujian_id, pendaftar_id, reminder_type)"
    );
    console.log("New constraint added. Migration complete!");
}

main().catch(e => console.error("Migration error:", e.message)).finally(() => p.$disconnect());
