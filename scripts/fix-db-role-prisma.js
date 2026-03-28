const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fixing profiles role constraint...");
    try {
        // 1. Drop constraint if exists
        await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
          IF EXISTS (
              SELECT 1 
              FROM pg_constraint 
              WHERE conname = 'profiles_role_check'
          ) THEN
              ALTER TABLE "profiles" DROP CONSTRAINT "profiles_role_check";
          END IF;
      END $$;
    `);
        console.log("Dropped existing constraint.");

        // 2. Add new constraint
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "profiles" ADD CONSTRAINT "profiles_role_check" 
      CHECK (role IN ('pendaftar', 'admin', 'penguji', 'admin_super', 'admin_berkas', 'admin_keuangan'));
    `);
        console.log("Added new constraint with all roles.");

    } catch (e) {
        console.error("Error executing SQL:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
