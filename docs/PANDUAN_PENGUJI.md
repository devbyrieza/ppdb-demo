# Panduan Penguji PPDB

Dokumen ini berisi informasi mengenai cara login dan menggunakan dashboard Penguji.

## 1. Membuat Akun Penguji
Akun penguji dibuat oleh Administrator melalui Database (saat ini) atau melalui halaman Pengaturan Admin (jika sudah tersedia).

### Via Database (Supabase SQL Editor)
Jalankan query berikut untuk membuat user baru dengan role `penguji`:

```sql
-- Ganti email, password, dan nama sesuai kebutuhan
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES 
  ('00000000-0000-0000-0000-000000000000', uuid_generate_v4(), 'authenticated', 'authenticated', 'penguji@alimam.sch.id', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nama":"Ustadz Ahmad"}', now(), now(), '', '');

-- Insert ke tabel public.profiles (Otomatis via Trigger biasanya, tapi jika manual:)
-- Pastikan ID match dengan auth.users yang baru dibuat
```

**Catatan**: Jika aplikasi sudah memiliki fitur registrasi/management user di Admin Dashboard, gunakan fitur tersebut.

## 2. Cara Login
1. Buka halaman login: `[URL_APLIKASI]/login`
2. Pilih Tab **Admin/Penguji** (Tab sebelah kanan, warna Oranye/Amber).
3. Masukkan Email dan Password akun penguji.
4. Klik tombol **Login**.
5. Anda akan diarahkan otomatis ke `/dashboard/penguji`.

## 3. Fitur Dashboard Penguji
- **Jadwal Ujian Saya**: Melihat daftar santri yang dijadwalkan untuk diuji oleh akun ini.
- **Input Nilai**: Menginput nilai ujian wawancara dan tes Al-Qur'an.
- **Dashboard Utama**: Ringkasan jumlah siswa yang perlu diuji.

## Troubleshooting
- **Gagal Login**: Pastikan role user di database tabel `profiles` atau `users` metadata adalah `penguji`.
- **Halaman Kosong**: Pastikan koneksi internet lancar dan refresh halaman.
