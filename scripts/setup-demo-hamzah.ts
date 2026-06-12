/**
 * Script: setup-demo-hamzah.ts
 * Setup MTA2500010 (Hamzah) → status enrolled_full, semua menu terbuka untuk demo
 * Jalankan: npx tsx scripts/setup-demo-hamzah.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const NOMOR = "MTA2500010";

async function main() {
  console.log(`\n🔍 Mencari pendaftar ${NOMOR}...`);

  const pendaftar = await prisma.pendaftar.findFirst({
    where: { nomor_pendaftaran: NOMOR },
    include: { pengumuman: true, pembayaran: true },
  });

  if (!pendaftar) {
    console.error(`❌ Pendaftar ${NOMOR} tidak ditemukan!`);
    process.exit(1);
  }

  console.log(`✅ ${pendaftar.nama_lengkap} (ID: ${pendaftar.id})`);
  console.log(`   status_pendaftaran saat ini: ${pendaftar.status_pendaftaran}`);
  console.log(`   tahun_ajaran_id: ${pendaftar.tahun_ajaran_id}`);

  // ── 1. Update status_pendaftaran → enrolled_full
  console.log(`\n📝 [1/4] Update status → enrolled_full...`);
  await prisma.pendaftar.update({
    where: { id: pendaftar.id },
    data: {
      status_pendaftaran: "enrolled_full",
      // Seragam sekalian diisi agar menu Ukuran Seragam bisa terlihat terisi
      ukuran_seragam_baju: "M",
      ukuran_seragam_celana: "30",
      ukuran_seragam_almamater: "M",
    },
  });
  console.log(`   ✅ status_pendaftaran → enrolled_full`);

  // ── 2. Pembayaran terverifikasi
  console.log(`\n💳 [2/4] Pastikan pembayaran verified...`);
  if (!pendaftar.pembayaran || pendaftar.pembayaran.length === 0) {
    await prisma.pembayaran.create({
      data: {
        pendaftar_id: pendaftar.id,
        tahun_ajaran_id: pendaftar.tahun_ajaran_id,
        metode_pembayaran: "transfer",
        jumlah: 200000,
        status_pembayaran: "verified",
        catatan_verifikasi: "Pembayaran terverifikasi (Demo)",
      },
    });
    console.log(`   ✅ Pembayaran demo dibuat (verified)`);
  } else {
    await prisma.pembayaran.updateMany({
      where: { pendaftar_id: pendaftar.id },
      data: { status_pembayaran: "verified" },
    });
    console.log(`   ✅ Pembayaran diupdate ke verified`);
  }

  // ── 3. Pengumuman DITERIMA (published)
  console.log(`\n🏆 [3/4] Setup pengumuman DITERIMA...`);
  if (!pendaftar.pengumuman) {
    await prisma.pengumuman.create({
      data: {
        pendaftar_id: pendaftar.id,
        tahun_ajaran_id: pendaftar.tahun_ajaran_id,
        status_kelulusan: "diterima",
        is_published: true,
        published_at: new Date("2025-09-01"),
        catatan:
          "Selamat! Anda dinyatakan DITERIMA sebagai santri baru. (Demo)",
      },
    });
    console.log(`   ✅ Pengumuman DITERIMA dibuat`);
  } else {
    await prisma.pengumuman.update({
      where: { pendaftar_id: pendaftar.id },
      data: {
        status_kelulusan: "diterima",
        is_published: true,
        published_at: new Date("2025-09-01"),
        catatan:
          "Selamat! Anda dinyatakan DITERIMA sebagai santri baru. (Demo)",
      },
    });
    console.log(`   ✅ Pengumuman diupdate ke DITERIMA`);
  }

  // ── 4. Dokumen terverifikasi
  console.log(`\n📄 [4/4] Cek dan verifikasi dokumen...`);
  const updated = await prisma.dokumen.updateMany({
    where: { pendaftar_id: pendaftar.id },
    data: { is_verified: true, catatan: null },
  });
  console.log(`   ✅ ${updated.count} dokumen ditandai verified`);

  console.log(`\n${"═".repeat(55)}`);
  console.log(`🎉 SELESAI! ${NOMOR} (${pendaftar.nama_lengkap}) siap demo:`);
  console.log(`   ✅ status_pendaftaran : enrolled_full`);
  console.log(`   ✅ Pembayaran         : verified`);
  console.log(`   ✅ Pengumuman         : DITERIMA (published)`);
  console.log(`   ✅ Seragam            : M / 30 / M`);
  console.log(`   ✅ Semua menu         : TERBUKA`);
  console.log(`   📱 Login NIK          : 3204541574678888`);
  console.log(`${"═".repeat(55)}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
