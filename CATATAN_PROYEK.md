# 📋 CATATAN PROYEK PPDB AL-ANDALUS
> Dibuat: 2026-07-08 | Untuk referensi AI di masa depan

---

## 🏗️ STRUKTUR PROYEK

| Project | URL | Pesantren | Database | OTP WA |
|---|---|---|---|---|
| `alandalus-alimam` | ppdb.pesantren-alimam.com | Al-Andalus Al-Imam | ppdb_alimam (port 5433) | ✅ REAL (Wablas) |
| `alandalus-ululalbaab` | ppdb.ululalbaab.com | Al-Andalus Ulul Albaab | ppdb_ululalbaab | ✅ REAL (Wablas) |
| `template-demo` | ppdb-demo.vercel.app | Demo/Contoh | ppdb_demo | ❌ SKIP (bypass OTP) |

### Server
- **VPS**: Hostinger KVM 2 (IP: 72.61.141.50)
- **OS**: Ubuntu 24.04 LTS
- **Specs**: 2 vCPU, 8GB RAM, 100GB NVMe, 8TB bandwidth
- **Rekomendasi upgrade**: KVM 4 (Rp213.900/bln) saat klien pesantren sudah 4+

---

## 🎯 STRATEGI DEMO / PRESENTASI KE CALON KLIEN

### Situasi
Saat presentasi PPDB ke mudir/pesantren calon klien, ada dua hal yang ditunjukkan:
1. **template-demo** → Fitur sistem PPDB secara umum (OTP di-skip, mudah demo)
2. **alandalus-alimam** → Sistem REAL yang sudah berjalan (OTP WhatsApp sungguhan dikirim)

### Masalah
`alandalus-alimam` sering dalam kondisi **TUTUP PENDAFTARAN** (setelah masa PPDB selesai), sehingga saat presentasi, orang tidak bisa mendaftar untuk mendemonstrasikan alur OTP WhatsApp real.

### ✅ Solusi SEKARANG (Sudah Diimplementasi): Manual Buka/Tutup
Buka pendaftaran dari admin panel `alandalus-alimam`:
- Login sebagai admin/admin_super
- Buka menu **Pengaturan Tahun Ajaran**
- Ubah `tanggal_tutup_pendaftaran` ke tanggal yang akan datang
- Setelah demo selesai → tutup kembali
- Hapus data test yang dibuat saat demo

**API endpoint untuk update**: `PATCH /api/admin/tahun-ajaran/[id]`
```json
{
  "tanggal_tutup_pendaftaran": "2026-12-31"
}
```

### 🟡 Solusi JANGKA MENENGAH (Belum Diimplementasi): Admin Toggle Mudah
Tambahkan tombol **"Buka/Tutup Pendaftaran"** yang lebih visible di admin panel:
- Letakkan di halaman utama Dashboard Admin (header/sidebar)
- Satu klik untuk buka, satu klik untuk tutup
- Tampilkan status pendaftaran saat ini secara jelas
- **File yang perlu dimodifikasi**:
  - `src/app/dashboard/admin/page.tsx` — tambah toggle button di header
  - `src/app/api/admin/pendaftaran-status/route.ts` — buat API baru untuk toggle
  - Sinkronkan ke ketiga project

### 🟢 Solusi JANGKA PANJANG (Belum Diimplementasi): Demo Number System
Sistem nomor demo khusus yang **selalu bisa mendaftar** meski masa pendaftaran tutup:
- Daftarkan nomor HP tertentu (misal nomor admin/pengembang) sebagai "Demo Number"
- Nomor ini bisa trigger OTP WhatsApp kapanpun tanpa buka pendaftaran
- OTP tetap real dikirim ke WA — sangat meyakinkan saat presentasi
- Data yang dibuat dengan nomor ini diberi tag `is_demo: true` agar mudah dibersihkan

**Cara implementasi**:
1. Tambah env var `DEMO_PHONE_NUMBERS="628xxx,628yyy"` di `.env`
2. Di `src/app/api/register/send-otp/route.ts` → bypass cek period pendaftaran jika nomor ada di daftar demo
3. Di `src/app/api/register/verify-otp/route.ts` → saat complete, tandai pendaftar dengan `is_demo: true`
4. Tambah script cleanup: hapus semua pendaftar dengan `is_demo: true` setelah presentasi
5. **File kunci**: `src/app/api/register/send-otp/route.ts` dan `src/app/api/auth/register/complete/route.ts`

---

## 📱 KONFIGURASI OTP WHATSAPP (Wablas)

### alandalus-alimam & alandalus-ululalbaab
```env
WABLAS_DOMAIN="https://jkt.wablas.com"
SKIP_WHATSAPP_OTP="false"  ← PENTING: false = OTP real dikirim
```

### template-demo
```env
SKIP_WHATSAPP_OTP="true"   ← PENTING: true = OTP di-skip (langsung masuk)
```

---

## 🔢 NOMOR PENDAFTARAN — SISTEM DAUR ULANG (Gap Filling)

Sudah diimplementasi sejak 2026-07-07:
- Format: `{PREFIX}{2-digit-tahun}{5-digit-sequence}` contoh: `MTA2600001`
- Prefix: `MTI` (putra), `MTA` (putri)
- Jika pendaftar **dihapus (soft delete)**: nomor diawali `DEL_` → slot tersedia kembali
- Jika pendaftar **mengundurkan diri**: nomor diawali `WD_{timestamp}_` → slot tersedia kembali
- Algoritma Gap Finder: scan semua nomor aktif, isi celah dari terkecil dahulu
- **File kunci**: `src/lib/utils/nomor-pendaftaran.ts`

---

## 🗑️ SISTEM SAMPAH (SOFT DELETE)

- Pendaftar yang dihapus → `deleted_at` diisi timestamp, nomor di-prefix `DEL_`
- Data TIDAK muncul di dashboard admin manapun kecuali halaman Folder Sampah
- Data TIDAK muncul di verifikasi keuangan maupun berkas
- Implemented via `getAdminWhereClause()` dengan filter `deleted_at: null`

---

## 🖼️ FOTO PENDAFTAR DI CARD ADMIN

Foto profil pendaftar muncul di card admin **jika dan hanya jika**:
1. Pendaftar sudah upload foto di halaman "Upload Berkas"
2. Status foto sudah **DIVERIFIKASI** oleh admin berkas

---

## 📦 REVISI WEBSITE

- Hak revisi: **2 kali gratis** selama masa pembuatan website
- Pengerjaan pertama + 2 kali revisi = total 3 kali pengerjaan
- (Mudir Al-Imam mengoreksi: dari yang semula ditulis 3 kali revisi menjadi 2 kali)

---

## 🔧 CARA BUKA PENDAFTARAN UNTUK DEMO/PRESENTASI

### Cara 1: Lewat Admin Panel (Termudah)
1. Login admin `alandalus-alimam` sebagai `admin_super`
2. Buka **Pengaturan → Tahun Ajaran**
3. Klik edit pada tahun ajaran aktif
4. Ubah **Tanggal Tutup Pendaftaran** ke tanggal yang akan datang (misal 31 Desember)
5. Simpan → pendaftaran terbuka kembali
6. Setelah demo: kembalikan tanggal ke masa lalu atau tanggal hari itu

### Cara 2: Lewat Database (Jika Tidak Ada UI)
```sql
-- Cek tahun ajaran aktif
SELECT id, nama, tanggal_tutup_pendaftaran FROM "TahunAjaran" WHERE is_active = true;

-- Buka pendaftaran (extend tanggal tutup)
UPDATE "TahunAjaran" 
SET tanggal_tutup_pendaftaran = '2026-12-31 23:59:59'
WHERE is_active = true;
```

### Bersihkan Data Test Setelah Demo
```sql
-- Cek pendaftar test yang baru dibuat
SELECT id, nama_lengkap, nomor_pendaftaran, created_at 
FROM "Pendaftar" 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- Soft delete data test
UPDATE "Pendaftar" 
SET deleted_at = NOW(), nomor_pendaftaran = CONCAT('DEL_', nomor_pendaftaran)
WHERE id = 'ID_PENDAFTAR_DI_SINI';
```

---

## 🚀 ROADMAP FITUR YANG BELUM DIBUAT

- [ ] **Toggle Buka/Tutup Pendaftaran** di admin panel (1 klik) — JANGKA MENENGAH
- [ ] **Demo Number System** untuk presentasi tanpa buka/tutup manual — JANGKA PANJANG
- [ ] **Multi-Tenant Architecture** jika klien 10+ pesantren — MASA DEPAN
- [ ] **Backup harian otomatis** Hostinger (Rp104.900/bln) — SEGERA AKTIFKAN
- [ ] **Upgrade VPS ke KVM 4** saat klien sudah 4+ pesantren

---

*Catatan ini dibuat 2026-07-08. Update jika ada perubahan arsitektur atau fitur baru.*
