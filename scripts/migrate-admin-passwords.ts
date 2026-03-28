/**
 * Script: Migrate Admin Passwords
 *
 * Karena password admin sebelumnya disimpan di Supabase Auth (tidak bisa diakses),
 * script ini akan set password_hash baru untuk semua admin profiles.
 *
 * Default password = email address (admin harus ganti setelah login pertama)
 *
 * Usage: npx tsx scripts/migrate-admin-passwords.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Migrate Admin Passwords ===\n");

  const adminRoles = ["admin", "admin_super", "admin_berkas", "admin_keuangan", "penguji"];

  const admins = await prisma.profile.findMany({
    where: {
      role: { in: adminRoles },
      password_hash: null,
    },
  });

  if (admins.length === 0) {
    console.log("Tidak ada admin yang perlu dimigrasi (semua sudah punya password_hash).");
    return;
  }

  console.log(`Ditemukan ${admins.length} admin tanpa password_hash:\n`);

  for (const admin of admins) {
    // Default password = email atau "admin123" jika tidak ada email
    const defaultPassword = admin.email || "admin123";
    const hash = await bcrypt.hash(defaultPassword, 10);

    await prisma.profile.update({
      where: { id: admin.id },
      data: { password_hash: hash },
    });

    console.log(`  [OK] ${admin.full_name} (${admin.email || "no email"}) - role: ${admin.role}`);
    console.log(`        Password sementara: ${defaultPassword}`);
    console.log();
  }

  console.log("=== Selesai ===");
  console.log("\nPENTING: Minta semua admin untuk segera ganti password setelah login!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
