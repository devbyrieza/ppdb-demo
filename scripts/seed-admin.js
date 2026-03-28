/**
 * Seed Admin Users
 * Creates 4 admin users with bcrypt passwords
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Creating admin users...\n");

  const admins = [
    {
      email: "super@pesantren-alimam.com",
      password: "SuperAdmin2026!",
      full_name: "Administrator Sistem",
      role: "admin_super",
      description: "Akses penuh ke semua fitur sistem PPDB",
    },
    {
      email: "berkas@pesantren-alimam.com",
      password: "AdminBerkas2026!",
      full_name: "Admin Verifikasi Berkas",
      role: "admin_berkas",
      description: "Verifikasi dokumen dan data diri pendaftar",
    },
    {
      email: "keuangan@pesantren-alimam.com",
      password: "AdminKeuangan2026!",
      full_name: "Admin Keuangan",
      role: "admin_keuangan",
      description: "Verifikasi pembayaran dan export data keuangan",
    },
    {
      email: "penguji@pesantren-alimam.com",
      password: "Penguji2026!",
      full_name: "Tim Penguji",
      role: "penguji",
      description: "Input nilai ujian dan wawancara santri",
    },
  ];

  for (const admin of admins) {
    const existingUser = await prisma.profile.findFirst({
      where: { email: admin.email },
    });

    if (existingUser) {
      console.log(`⚠️  ${admin.email} sudah ada, skip...`);
      continue;
    }

    // Hash password dengan bcrypt
    const password_hash = await bcrypt.hash(admin.password, 10);

    const user = await prisma.profile.create({
      data: {
        email: admin.email,
        password_hash,
        full_name: admin.full_name,
        role: admin.role,
        phone: "-",
      },
    });

    console.log(`✅ ${admin.role.toUpperCase()}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${admin.password}`);
    console.log(`   Deskripsi: ${admin.description}\n`);
  }

  console.log("✅ Selesai! Semua admin sudah dibuat.");
  console.log("\n📝 CATATAN:");
  console.log("   - Password di atas hanya untuk testing");
  console.log("   - Ganti password setelah login pertama kali");
  console.log("   - Simpan credentials dengan aman\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
