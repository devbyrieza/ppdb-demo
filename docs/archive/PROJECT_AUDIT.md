# 📋 PROJECT AUDIT - PPDB AL-IMAM

**Tanggal Audit:** 31 Januari 2026  
**Status:** Ringkasan lengkap untuk melanjutkan development & sinkronisasi Supabase

---

## 🏗️ STRUKTUR PROJECT

```
pp-alimam/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── admin/              # Admin-only endpoints
│   │   │   ├── auth/               # Login, register, OTP
│   │   │   ├── dashboard/          # Dashboard data
│   │   │   ├── dokumen/            # Document preview/status
│   │   │   ├── pembayaran/         # Payment (Midtrans + manual)
│   │   │   ├── register/           # OTP, demo-direct
│   │   │   ├── upload/             # Document upload
│   │   │   └── verifikasi/         # OTP verification
│   │   ├── dashboard/
│   │   │   ├── admin/              # Admin panel (pendaftar, jadwal, pengaturan, dll)
│   │   │   ├── pendaftar/          # User dashboard (tabs, profil, berkas, dll)
│   │   │   └── penguji/            # Penguji panel
│   │   ├── daftar/                 # Halaman pendaftaran
│   │   ├── login/                  # Halaman login
│   │   ├── ppdb/, fasilitas/, kegiatan/  # Halaman info
│   │   └── globals.css             # Tailwind v4 + Islamic theme
│   ├── components/
│   │   ├── auth/                   # IdleTimeoutTracker, SessionMonitor
│   │   ├── home/                   # HeroSection, AboutSection, dll
│   │   ├── layout/                 # Navbar, Footer, Container
│   │   └── ui/                     # button.tsx
│   ├── lib/
│   │   ├── supabase/               # client.ts, server.ts
│   │   ├── storage/                # upload.ts, download.ts
│   │   ├── auth.ts                 # Auth helpers
│   │   ├── prisma.ts               # Prisma client (untuk locations)
│   │   ├── access-control.ts       # Tab access logic
│   │   ├── notifications/          # SMS, WhatsApp
│   │   └── utils/                  # nomor-pendaftaran, password
│   └── types/
│       ├── database.ts             # TypeScript interfaces
│       └── registration.ts
├── prisma/
│   ├── schema.prisma               # 14 tabel, referensi struktur DB
│   └── migrations/
│       └── 20260131_add_indexes.sql  # Index untuk filter lokasi
└── middleware.ts                   # Auth protection, role-based redirect
```

---

## 🔌 TECH STACK & DATABASE

| Komponen | Teknologi | Catatan |
|----------|-----------|---------|
| Framework | Next.js 16 (App Router) | ✅ |
| React | React 19 | ✅ |
| Styling | Tailwind CSS v4 | CSS-first, @theme di globals.css |
| Database | **Supabase (PostgreSQL)** | Main database |
| ORM | **Prisma** | Hanya untuk API locations (raw query) |
| Auth | **Hybrid** | Pendaftar: custom cookie. Admin: Supabase Auth |
| Storage | Supabase Storage | Buckets: dokumen-pendaftaran, bukti-pembayaran |
| Form | React Hook Form + Zod | ✅ |

### ⚠️ Dual Database Client
- **Supabase**: Auth, pendaftar, pembayaran, dokumen, tahun_ajaran, profiles, otp_verifications
- **Prisma**: Hanya API `/api/admin/locations/*` (provinsi, kabupaten, kecamatan, kelurahan) — query DISTINCT dari kolom pendaftar

---

## 🔐 SISTEM AUTHENTICATION

### 1. Pendaftar (Custom Auth - NO Supabase Auth)
- **Register**: Send OTP → Verify OTP → Complete (insert ke `pendaftar`)
- **Login**: NIK + Nomor Pendaftaran → Set cookie `app_session`
- **Session**: Cookie-based, 7 hari, sliding refresh di middleware

### 2. Admin/Penguji (Supabase Auth)
- **Login**: Email + Password via `supabase.auth.signInWithPassword`
- **Profile**: Tabel `profiles` (id = auth.users.id)
- **Session**: Supabase session + cookie `app_session` untuk role

### 3. Middleware Protection
- `/dashboard/pendaftar` → role = pendaftar
- `/dashboard/admin` → role = admin
- `/dashboard/penguji` → role = penguji
- `/dashboard` → redirect berdasarkan role

---

## 📊 TABEL SUPABASE (dari Prisma schema)

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | User profile (admin/penguji), id = auth.users.id |
| `tahun_ajaran` | Tahun ajaran aktif, periode pendaftaran |
| `pendaftar` | Data calon santri (NIK, nama, jenjang, alamat, dll) |
| `orang_tua` | Data ayah/ibu/wali |
| `dokumen` | File upload (KK, akte, foto) |
| `pembayaran` | Midtrans + manual, status verifikasi |
| `jadwal_ujian` | Jadwal tes santri + ortu |
| `nilai_ujian` | Nilai wawancara, Quran, dll |
| `pengumuman` | Hasil kelulusan |
| `data_rapor` | Nilai rapor |
| `data_prestasi` | Prestasi/sertifikat |
| `data_kesehatan` | Data kesehatan santri |
| `data_asrama` | Preferensi asrama |
| `reservasi_psb` | Reservasi penginapan |
| `otp_verifications` | OTP untuk registrasi (tidak di Prisma) |

### ⚠️ Catatan Schema
- **Pendaftar** di Prisma punya `user_id` (required), tapi register/complete **tidak insert user_id** — kemungkinan kolom nullable di Supabase atau pendaftar pakai flow berbeda (tanpa Supabase Auth)
- **otp_verifications** — tabel custom untuk OTP, perlu dibuat manual di Supabase

---

## 🔧 TEMUAN & PERBAIKAN

### 1. Supabase Server Exports (FIXED)
Beberapa API route import `createClient` atau `createServerClient` dari `@/lib/supabase/server`, tapi `server.ts` hanya export `createServerSupabaseClient` dan `supabaseAdmin`.

**Perbaikan:** Tambah alias export di `server.ts`:
```ts
export const createClient = createServerSupabaseClient;
export const createServerClient = createServerSupabaseClient;
```

### 2. Environment Variables
`.env.example` perlu dilengkapi:
```
# Supabase (wajib)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Prisma - untuk API locations (pakai connection string Supabase)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Opsional: Midtrans, Twilio (SMS/WhatsApp)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

### 3. Prisma vs Supabase
- **Locations API** pakai Prisma `$queryRaw` → butuh `DATABASE_URL` ke Supabase PostgreSQL
- Alternatif: Migrasi locations API ke Supabase client agar konsisten

### 4. Storage Buckets
Pastikan di Supabase Storage sudah ada:
- `dokumen-pendaftaran` — untuk upload KK, akte, foto
- `bukti-pembayaran` — untuk bukti transfer manual

---

## 📁 FILE PENTING UNTUK DEVELOPMENT

| File | Fungsi |
|------|--------|
| `src/lib/supabase/server.ts` | Server client, admin client |
| `src/lib/auth.ts` | getCurrentUser, getCurrentProfile, logout |
| `src/lib/utils/nomor-pendaftaran.ts` | Generate nomor pendaftaran |
| `src/types/database.ts` | TypeScript types (perlu diselaraskan dengan schema) |
| `prisma/schema.prisma` | Referensi struktur DB |
| `src/app/dashboard/admin/pendaftar/page.tsx` | Halaman utama admin - daftar pendaftar |
| `middleware.ts` | Route protection |

---

## ✅ NEXT STEPS (Sinkronisasi Supabase)

1. **Buat tabel yang belum ada** — terutama `otp_verifications`
2. **Jalankan migration index** — `prisma/migrations/20260131_add_indexes.sql`
3. **Setup Storage buckets** — dokumen-pendaftaran, bukti-pembayaran
4. **Seed tahun_ajaran** — minimal 1 tahun ajaran aktif
5. **Buat admin user** — via script `scripts/create-admin.js` atau Supabase Auth + profiles
6. **Verifikasi RLS policies** — jika menggunakan RLS (opsional untuk service role)

---

*Dokumen ini untuk memudahkan handover dan melanjutkan development.*
