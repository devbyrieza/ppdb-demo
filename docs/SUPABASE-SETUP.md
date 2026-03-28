# 🔧 SUPABASE SETUP - PPDB AL-IMAM

Panduan lengkap untuk menyinkronkan dan mengkonfigurasi Supabase dengan project PPDB Al-Imam.

---

## 📋 CHECKLIST SETUP

- [ ] 1. Environment Variables
- [ ] 2. Database Tables (migration)
- [ ] 3. Tabel `otp_verifications`
- [ ] 4. Tabel `profiles` (trigger dari auth.users)
- [ ] 5. Storage Buckets
- [ ] 6. Seed Data (tahun_ajaran)
- [ ] 7. Admin User
- [ ] 8. Index untuk performa
- [ ] 9. RLS Policies (opsional)

---

## 1️⃣ ENVIRONMENT VARIABLES

Buat file `.env.local` di root project:

```env
# Supabase (wajib)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Prisma - untuk API locations (connection string Supabase)
# Dapat dari: Supabase Dashboard → Settings → Database → Connection string (URI)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Opsional: Midtrans (pembayaran online)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=

# Opsional: Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

## 2️⃣ TABEL `otp_verifications`

**Wajib** — digunakan untuk registrasi pendaftar (Send OTP → Verify OTP → Complete).

Jalankan di **Supabase SQL Editor**:

```sql
-- Tabel OTP untuk registrasi pendaftar
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  otp_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT DEFAULT 0,
  otp_channel VARCHAR(20) DEFAULT 'sms',
  verified_at TIMESTAMPTZ,
  registration_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk lookup cepat
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications (phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications (expires_at);

-- Enable RLS (opsional - jika pakai anon key)
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Service role bisa akses semua
CREATE POLICY "Service role full access" ON otp_verifications
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 3️⃣ TABEL `profiles` (untuk Admin/Penguji)

Profiles terhubung dengan `auth.users`. Jika belum ada, buat tabel:

```sql
-- Tabel profiles (admin, penguji) - id = auth.users.id
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'pendaftar',
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Buat profile otomatis saat user baru di auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'pendaftar')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (jalankan jika belum ada)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4️⃣ TABEL LAIN (dari Prisma Schema)

Jika project baru atau tabel belum ada, jalankan migration lengkap dari Prisma:

```bash
# Generate Prisma Client
pnpm prisma generate

# Push schema ke Supabase (perhatian: akan create/alter tabel!)
# Pastikan DATABASE_URL sudah benar
pnpm prisma db push
```

**Catatan:** `prisma db push` akan sinkronisasi schema. Untuk production, gunakan `prisma migrate deploy` dengan migrations yang sudah dibuat.

### ⚠️ Kolom `tahun` di `tahun_ajaran`

Kode `nomor-pendaftaran.ts` memakai `tahun_ajaran.tahun` untuk format nomor (contoh: MTI**26**00001). Prisma schema punya `tahun_mulai` dan `tahun_selesai`. Jika error:

**Opsi A:** Tambah kolom generated di Supabase:

```sql
ALTER TABLE tahun_ajaran ADD COLUMN IF NOT EXISTS tahun INT GENERATED ALWAYS AS (tahun_mulai) STORED;
```

**Opsi B:** Update kode `nomor-pendaftaran.ts` untuk memakai `tahun_mulai` (lihat PROJECT_AUDIT.md).

### ⚠️ Kolom `user_id` di `pendaftar`

Prisma schema: `user_id` required. Flow registrasi saat ini **tidak** insert `user_id` (pendaftar pakai auth custom: NIK + nomor pendaftaran). Pastikan kolom `user_id` di Supabase **nullable**:

```sql
ALTER TABLE pendaftar ALTER COLUMN user_id DROP NOT NULL;
```

---

## 5️⃣ STORAGE BUCKETS

1. Buka **Supabase Dashboard** → **Storage** → **New bucket**
2. Buat bucket:
   - `dokumen-pendaftaran` — untuk KK, akte, foto
   - `bukti-pembayaran` — untuk bukti transfer manual

3. Set **Public** atau **Private** sesuai kebutuhan. Saat ini kode pakai signed URL untuk preview.
4. Policies (jika private):

```sql
-- Policy untuk upload dokumen (authenticated atau service role)
CREATE POLICY "Service role upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'dokumen-pendaftaran' OR bucket_id = 'bukti-pembayaran');

CREATE POLICY "Service role read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('dokumen-pendaftaran', 'bukti-pembayaran'));
```

---

## 6️⃣ SEED TAHUN AJARAN

Minimal 1 tahun ajaran aktif untuk pendaftaran:

```sql
INSERT INTO tahun_ajaran (
  id,
  tahun_mulai,
  tahun_selesai,
  nama,
  is_active,
  tanggal_buka_pendaftaran,
  tanggal_tutup_pendaftaran,
  biaya_pendaftaran
) VALUES (
  gen_random_uuid(),
  2026,
  2027,
  '2026/2027',
  true,
  '2026-01-01',
  '2026-06-30',
  250000
) ON CONFLICT DO NOTHING;
```

---

## 7️⃣ ADMIN USER

**Cara 1: Script create-admin.js**

```bash
SUPABASE_URL="https://xxxxx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
node scripts/create-admin.js admin@ponpes.com P@ssw0rd123 "Admin Ponpes" "+6281234567890"
```

**Cara 2: Manual via Supabase Dashboard**

1. **Authentication** → **Users** → **Add user** (email + password)
2. **SQL Editor** → Insert profile:

```sql
INSERT INTO profiles (id, role, full_name, phone)
VALUES (
  'UUID-dari-auth-users',
  'admin',
  'Admin Ponpes',
  '+6281234567890'
);
```

---

## 8️⃣ INDEX UNTUK PERFORMA

Jalankan file `prisma/migrations/20260131_add_indexes.sql`:

```bash
# Via Supabase SQL Editor - paste isi file
# Atau via psql:
psql "postgresql://..." -f prisma/migrations/20260131_add_indexes.sql
```

---

## 9️⃣ VERIFIKASI

### Cek koneksi Supabase

```bash
pnpm dev
```

- Buka `/daftar` → coba pendaftaran (OTP)
- Buka `/login` → login admin (email + password) atau pendaftar (NIK + nomor)
- Buka `/dashboard/admin` → daftar pendaftar
- Upload dokumen di dashboard pendaftar

### Cek Prisma (Locations API)

```bash
# Test API locations
curl "http://localhost:3000/api/admin/locations/provinsi"
```

Jika error "PrismaClientInitializationError" → pastikan `DATABASE_URL` benar dan Prisma sudah generate.

---

## 📚 REFERENSI

- [PROJECT_AUDIT.md](../PROJECT_AUDIT.md) — Ringkasan project & temuan
- [prisma/schema.prisma](../prisma/schema.prisma) — Struktur database lengkap
- [docs/DB-INDEXES.md](./DB-INDEXES.md) — Detail index
