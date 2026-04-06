import { PrismaClient } from '@prisma/client'
import * as mysql from 'mysql2/promise'
import * as dotenv from 'dotenv'

// Load env vars
dotenv.config({ path: '.env' })

const prisma = new PrismaClient()

// Koneksi ke Database Laravel Lama (Pastikan file .env.local memiliki var ini nanti)
// MYSQL_HOST=127.0.0.1
// MYSQL_USER=root
// MYSQL_PASSWORD=
// MYSQL_DATABASE=ppdb_laravel_db
async function getLegacyConnection() {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password123',
    database: process.env.MYSQL_DATABASE || 'ppdb_laravel_db',
  })
}

async function main() {
  console.log('🚀 Memulai Migrasi Data dari Laravel ke Prisma...')

  let connection;
  try {
    connection = await getLegacyConnection()
    console.log('✅ Koneksi ke Database Laravel Berhasil!')
  } catch (error) {
    console.error('❌ Gagal koneksi ke MySQL Laravel. Pastikan kredensial benar.', error)
    process.exit(1)
  }

  try {
    // ---------------------------------------------------------
    // 1. MIGRASI TAHUN AJARAN (Referensi Opsional)
    // ---------------------------------------------------------
    console.log('\n--- Memigrasi Tahun Ajaran ---')
    // Asumsi: Jika kita sudah punya tahun ajaran dari DB baru, kita bisa map ID-nya
    // Untuk demo script, kita ambil satu tahun ajaran aktif dari Prisma sebagai tempat berlabuh
    const tahunAjaranTarget = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    })
    
    if (!tahunAjaranTarget) {
        throw new Error("Tahun Ajaran Aktif tidak ditemukan di Database Prisma. Buat dulu dari UI admin.")
    }

    // ---------------------------------------------------------
    // 2. MIGRASI PENDAFTAR + BIODATA + SEKOLAH (Merge)
    // ---------------------------------------------------------
    console.log('\n--- Mengekstrak Data Pendaftar (Merge Model) ---')
    // Menggabungkan 3 tabel Laravel sekaligus!
    const [pendaftars]: any = await connection.execute(`
      SELECT 
        p.id as old_id, p.nama, p.jenis_kelamin, p.jenjang, p.nomor_identitas, p.nomor_registrasi, p.terdaftar_pada,
        b.tempat_lahir, b.tanggal_lahir, b.gol_darah, b.jumlah_saudara, b.anak_ke, b.hobi, b.cita_cita, b.alamat_lengkap, b.jumlah_hafalan,
        s.nama, s.npsn, s.tahun_lulus
      FROM pendaftars p
      LEFT JOIN biodata_pendaftars b ON b.pendaftar_id = p.id
      LEFT JOIN data_sekolah_asals s ON s.pendaftar_id = p.id
    `)

    console.log(`Menemukan ${pendaftars.length} Pendaftar. Memulai proses inject ke Prisma...`)
    
    // Mapping ID lama ke ID baru (UUID) agar berkesinambungan
    const mapIdPendaftar: Record<string, string> = {};

    for (const p of pendaftars) {
      // Pastikan NIK ada (Prisma butuh NIK)
      const nik = p.nomor_identitas || '0000000000000000'
      const nomor_pendaftaran = p.nomor_registrasi || `MIGRATE-${p.old_id}`

      // Upsert Pendaftar
      const newPendaftar = await prisma.pendaftar.upsert({
        where: { nomor_pendaftaran },
        update: {},
        create: {
          nomor_pendaftaran,
          nik,
          nama_lengkap: p.nama || 'Tanpa Nama',
          jenis_kelamin: p.jenis_kelamin || 'L',
          jenjang: p.jenjang || 'SMP',
          tempat_lahir: p.tempat_lahir,
          tanggal_lahir: p.tanggal_lahir ? new Date(p.tanggal_lahir) : null,
          alamat: p.alamat_lengkap,
          asal_sekolah: p.nama_sekolah,
          npsn: p.npsn,
          tahun_lulus: p.tahun_lulus ? Number(p.tahun_lulus) : null,
          golongan_darah: p.gol_darah,
          anak_ke: p.anak_ke ? Number(p.anak_ke) : null,
          jumlah_saudara: p.jumlah_saudara ? Number(p.jumlah_saudara) : null,
          hobi: p.hobi,
          cita_cita: p.cita_cita,
          jumlah_hafalan: p.jumlah_hafalan ? `${p.jumlah_hafalan} Juz` : null,
          tahun_ajaran_id: tahunAjaranTarget.id,
          created_at: p.terdaftar_pada ? new Date(p.terdaftar_pada) : new Date(),
          status_pendaftaran: 'submitted' // Atur default
        }
      })
      
      mapIdPendaftar[p.old_id] = newPendaftar.id;
    }
    console.log(`✅ Berhasil inject ${pendaftars.length} Pendaftar.`)


    // ---------------------------------------------------------
    // 3. MIGRASI WALI PENDAFTAR (Pivot 3 rows -> 1 row)
    // ---------------------------------------------------------
    console.log('\n--- Mengekstrak Data Orang Tua (Pivot Model) ---')
    const [walis]: any = await connection.execute(`
      SELECT w.*, p.nomor_hp 
      FROM wali_pendaftars w
      LEFT JOIN nomor_hps p ON w.nomor_hp_id = p.id
    `)

    // Kelompokkan berdasar Pendaftar (Ayah, Ibu, Wali)
    const orangTuaGrouped: Record<string, any> = {}
    
    for (const w of walis) {
      if (!orangTuaGrouped[w.pendaftar_id]) {
        orangTuaGrouped[w.pendaftar_id] = {}
      }
      
      const type = (w.tipe || '').toLowerCase() // ayah, ibu, wali
      if (type === 'ayah') {
        orangTuaGrouped[w.pendaftar_id].nama_ayah = w.nama
        orangTuaGrouped[w.pendaftar_id].nik_ayah = w.nik
        orangTuaGrouped[w.pendaftar_id].pekerjaan_ayah = w.pekerjaan_id?.toString() // Nanti dimap kalau ada ref pekerjaan
        orangTuaGrouped[w.pendaftar_id].no_hp_ayah = w.nomor_hp
      } else if (type === 'ibu') {
        orangTuaGrouped[w.pendaftar_id].nama_ibu = w.nama
        orangTuaGrouped[w.pendaftar_id].nik_ibu = w.nik
        orangTuaGrouped[w.pendaftar_id].no_hp_ibu = w.nomor_hp
      } else {
        orangTuaGrouped[w.pendaftar_id].nama_wali = w.nama
        orangTuaGrouped[w.pendaftar_id].hubungan_wali = w.hubungan_dengan_pendaftar
        orangTuaGrouped[w.pendaftar_id].no_hp_wali = w.nomor_hp
      }
    }

    let ortuCount = 0;
    for (const oldId in orangTuaGrouped) {
      const newPendaftarId = mapIdPendaftar[oldId]
      if (newPendaftarId) {
        const data = orangTuaGrouped[oldId]
        await prisma.orangTua.upsert({
          where: { pendaftar_id: newPendaftarId },
          update: data,
          create: {
            pendaftar_id: newPendaftarId,
            ...data
          }
        })
        ortuCount++
      }
    }
    console.log(`✅ Berhasil inject Data Orang Tua untuk ${ortuCount} pendaftar.`)


    // ---------------------------------------------------------
    // 4. MIGRASI PEMBAYARAN & BERKAS
    // ---------------------------------------------------------
    console.log('\n--- Mengekstrak Berkas & Pembayaran ---')
    // ... Implementasi query pembayaran dan dokumen ...
    // ... Nanti dilanjutkan setelah berhasil export SQL ...

    console.log('\n🎉🎉 SEMUA PROSES MIGRASI MENDASAR SELESAI 🎉🎉')

  } catch (err) {
    console.error('❌ Terjadi kesalahan fatal sewaktu migrasi:', err)
  } finally {
    if (connection) await connection.end()
    await prisma.$disconnect()
  }
}

main()
