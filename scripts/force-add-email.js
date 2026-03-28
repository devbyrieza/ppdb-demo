const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Forcing 'email' column addition...");
    try {
        // Check if column exists physically in pg_attribute to be safe? 
        // Or just use IF NOT EXISTS

        await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'profiles' AND column_name = 'email'
          ) THEN
              ALTER TABLE "profiles" ADD COLUMN "email" VARCHAR(255);
              CREATE INDEX IF NOT EXISTS "profiles_email_idx" ON "profiles" ("email");
              RAISE NOTICE 'Added email column';
          ELSE
              RAISE NOTICE 'Email column already exists';
          END IF;
      END $$;
    `);
        console.log("✅ SQL executed successfully.");

        // Verify inside the same script
        const result = await prisma.$queryRawUnsafe(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    `);
        console.log("Verification Result:", result);

    } catch (e) {
        console.error("❌ Error executing SQL:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
