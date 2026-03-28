# PANDUAN MIGRASI: Supabase → VPS Hostinger KVM 2

## Target Infrastruktur
- VPS: Hostinger KVM 2 (8GB RAM, 100GB NVMe, 2 vCPU)
- Lokasi: Malaysia (latency 27ms ke Indonesia)
- OS: Ubuntu 24.04 LTS
- Domain: sch.id (dibeli dari Hostinger)
- Orchestration: Coolify (open source)
- Database: PostgreSQL 16 (self-hosted)
- Remote DB Management: pgAdmin

---

## FASE 1: BACKUP SUPABASE (Malam Ini)

### 1.1 Install PostgreSQL di Windows

Download dan install PostgreSQL 16 dari:
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

Saat instalasi:
- Centang semua komponen (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
- Set password superuser: `postgres` (atau sesuai keinginan)
- Port default: 5432
- Locale: Default

Setelah install, pastikan `psql` dan `pg_dump` tersedia di PATH:
```
set PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin
```

Atau tambahkan ke System Environment Variables secara permanen.

### 1.2 Backup Data dari Supabase

```bash
# Backup SCHEMA ONLY (tanpa data)
pg_dump --host=db.hcknodoayqarjbrzcgrp.supabase.co --port=5432 --username=postgres --dbname=postgres --schema=public --schema-only --no-owner --no-privileges -f migration/backup/supabase_schema.sql

# Backup DATA ONLY (tanpa schema)
pg_dump --host=db.hcknodoayqarjbrzcgrp.supabase.co --port=5432 --username=postgres --dbname=postgres --schema=public --data-only --no-owner --no-privileges -f migration/backup/supabase_data.sql

# Backup LENGKAP (schema + data)
pg_dump --host=db.hcknodoayqarjbrzcgrp.supabase.co --port=5432 --username=postgres --dbname=postgres --schema=public --no-owner --no-privileges -f migration/backup/supabase_full.sql

# Backup dalam format custom (untuk pg_restore)
pg_dump --host=db.hcknodoayqarjbrzcgrp.supabase.co --port=5432 --username=postgres --dbname=postgres --schema=public --no-owner --no-privileges -Fc -f migration/backup/supabase_full.dump
```

Password: `SKBalimam26!` (yang sudah URL-encoded: `SKBalimam26%21`)

### 1.3 Backup Tabel OTP (non-Prisma)

Tabel `otp_verifications` dibuat manual (tidak ada di Prisma schema).
Pastikan tabel ini juga ter-backup. Cek di SQL dump output.

### 1.4 Verify Backup

```bash
# Cek ukuran file backup
dir migration\backup\

# Cek isi backup (harusnya ada CREATE TABLE statements)
# Buka file supabase_schema.sql dan pastikan ada semua 14 tabel + otp_verifications
```

---

## FASE 2: SETUP POSTGRESQL LOKAL

### 2.1 Buat Database Lokal

Buka pgAdmin atau psql:

```sql
-- Buat database untuk testing
CREATE DATABASE ppdb_alimam_test;

-- Buat extension yang diperlukan
\c ppdb_alimam_test
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Atau via command line:
```bash
psql -U postgres -c "CREATE DATABASE ppdb_alimam_test;"
psql -U postgres -d ppdb_alimam_test -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

### 2.2 Update .env.local

```env
# Database - PostgreSQL Lokal
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ppdb_alimam_test
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ppdb_alimam_test

# Supabase Auth (TEMPORARY - masih pakai Supabase untuk auth saat testing)
NEXT_PUBLIC_SUPABASE_URL=https://hcknodoayqarjbrzcgrp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Third-party (tetap sama)
MIDTRANS_SERVER_KEY=Mid-server-_wezICIZ7g4SHaF5JBhxleH2s
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2.3 Migrate Schema via Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database lokal (tanpa migration history)
npx prisma db push

# Atau gunakan SQL dump yang sudah di-backup
psql -U postgres -d ppdb_alimam_test -f migration/backup/supabase_schema.sql
```

### 2.4 Import Data

```bash
# Import data dari backup
psql -U postgres -d ppdb_alimam_test -f migration/backup/supabase_data.sql

# Atau restore dari format custom
pg_restore -U postgres -d ppdb_alimam_test migration/backup/supabase_full.dump
```

### 2.5 Verifikasi

```bash
# Cek semua tabel ada
npx prisma studio

# Atau via psql
psql -U postgres -d ppdb_alimam_test -c "\dt"
```

---

## FASE 3: TESTING LOKAL

### 3.1 Jalankan Development Server

```bash
pnpm dev
```

### 3.2 Test Checklist

- [ ] Homepage loads correctly
- [ ] Login pendaftar (NIK + Nomor Pendaftaran)
- [ ] Login admin (Email + Password)
- [ ] Dashboard pendaftar loads
- [ ] Dashboard admin loads
- [ ] Daftar baru (registrasi)
- [ ] Upload dokumen
- [ ] Pembayaran (Midtrans sandbox)
- [ ] Verifikasi admin
- [ ] API routes respond correctly
- [ ] Prisma Studio shows data correctly

---

## FASE 4: DEPLOYMENT KE VPS (Besok)

Lihat file terpisah:
- `migration/scripts/01-setup-vps.sh` - Setup VPS awal
- `migration/scripts/02-install-coolify.sh` - Install Coolify
- `migration/scripts/03-setup-postgresql.sh` - Setup PostgreSQL
- `migration/scripts/04-setup-firewall.sh` - Firewall & Security
- `migration/docs/DEPLOYMENT-CHECKLIST.md` - Checklist lengkap
- `migration/docs/DNS-SETUP.md` - Panduan DNS

---

## FASE 5: MIGRASI AUTH (Penting!)

### Komponen Supabase yang Perlu Diganti

| Komponen | Status | Pengganti |
|----------|--------|-----------|
| Database PostgreSQL | Mudah | Self-hosted PostgreSQL |
| Supabase Auth (Admin login) | Sedang | Custom bcrypt + JWT/session cookie |
| Supabase Auth (Pendaftar login) | Sudah custom | Tidak perlu ubah (NIK + NoPendaftaran) |
| Supabase Auth (Middleware) | Sedang | Custom session middleware |
| Supabase Storage | Sedang | Local filesystem + serve static |
| Supabase Auth (Registration) | Sedang | Custom (sudah pakai OTP) |

### File yang Perlu Dimodifikasi

1. `middleware.ts` - Hapus Supabase client, pakai custom session saja
2. `src/lib/supabase/server.ts` - Hapus atau ganti
3. `src/lib/supabase/client.ts` - Hapus atau ganti
4. `src/lib/auth.ts` - Hapus Supabase client
5. `src/lib/storage/upload.ts` - Ganti ke local filesystem
6. `src/lib/storage/download.ts` - Ganti ke local filesystem
7. `src/app/api/auth/login/route.ts` - Ganti admin auth ke bcrypt
8. `prisma/seed.ts` - Hapus Supabase auth calls

---

## ROLLBACK PLAN

Jika ada masalah saat deployment:

1. **Database rusak**: Restore dari backup
   ```bash
   pg_restore -U postgres -d ppdb_alimam --clean migration/backup/supabase_full.dump
   ```

2. **App tidak bisa start**: Revert ke Supabase
   - Kembalikan .env ke Supabase connection string
   - Deploy ulang

3. **DNS belum propagasi**: Gunakan IP VPS langsung
   - Akses via `http://IP_VPS:3000`

4. **Coolify bermasalah**: Deploy manual
   - Install Node.js langsung di VPS
   - `pnpm install && pnpm build && pnpm start`
