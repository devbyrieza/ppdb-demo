# CHECKLIST DEPLOYMENT - Besok Saat VPS Ready

## PERKIRAAN WAKTU: 1-2 JAM

---

## FASE A: VPS SETUP (15 menit)

- [ ] Login SSH ke VPS sebagai root
- [ ] Upload semua scripts dari `migration/scripts/` ke VPS
  ```bash
  scp -r migration/scripts/* root@IP_VPS:/root/
  ```
- [ ] Jalankan `01-setup-vps.sh`
  ```bash
  bash 01-setup-vps.sh
  ```
- [ ] Verifikasi: bisa SSH dengan user `deploy`

## FASE B: INSTALL COOLIFY (10 menit)

- [ ] Jalankan `02-install-coolify.sh`
  ```bash
  bash 02-install-coolify.sh
  ```
- [ ] Akses Coolify di `http://IP_VPS:8000`
- [ ] Buat akun admin di Coolify
- [ ] Verifikasi: Docker berjalan (`docker ps`)

## FASE C: SETUP DATABASE (10 menit)

- [ ] Jalankan `03-setup-postgresql.sh`
  ```bash
  bash 03-setup-postgresql.sh
  ```
- [ ] Catat password database yang dimasukkan
- [ ] Verifikasi: bisa connect ke database
  ```bash
  psql -U ppdb_user -d ppdb_alimam -c "SELECT 1;"
  ```

## FASE D: FIREWALL (5 menit)

- [ ] Jalankan `04-setup-firewall.sh`
  ```bash
  bash 04-setup-firewall.sh
  ```
- [ ] Test SSH dari terminal baru (JANGAN tutup terminal lama!)
- [ ] Verifikasi: `ufw status`

## FASE E: DEPLOY APLIKASI (20 menit)

### Opsi 1: Via Coolify (Recommended)
- [ ] Buka Coolify dashboard
- [ ] Add new resource → Public/Private Repository
- [ ] Masukkan URL Git repository
- [ ] Set Build Command: `pnpm install && npx prisma generate && pnpm build`
- [ ] Set Start Command: `pnpm start`
- [ ] Set environment variables (dari `env-variables.md`)
- [ ] Deploy

### Opsi 2: Manual (Backup)
- [ ] Jalankan `05-deploy-app.sh` sebagai user `deploy`
- [ ] Buat file `.env` di directory aplikasi
- [ ] Verifikasi: `sudo systemctl status ppdb-alimam`

## FASE F: MIGRATE DATA (10 menit)

- [ ] Upload backup SQL ke VPS
  ```bash
  scp migration/backup/supabase_data.sql root@IP_VPS:/tmp/
  ```
- [ ] Atau gunakan Prisma db push + seed
  ```bash
  npx prisma db push
  npx prisma db seed
  ```
- [ ] Atau restore dari dump
  ```bash
  psql -U ppdb_user -d ppdb_alimam -f /tmp/supabase_data.sql
  ```
- [ ] Verifikasi data:
  ```bash
  psql -U ppdb_user -d ppdb_alimam -c "SELECT count(*) FROM pendaftar;"
  psql -U ppdb_user -d ppdb_alimam -c "SELECT count(*) FROM profiles;"
  ```

## FASE G: SETUP DOMAIN & SSL (15 menit)

- [ ] Beli domain sch.id dari Hostinger
- [ ] Setup DNS records (lihat `DNS-SETUP.md`)
  - A record `@` → IP VPS
  - A record `www` → IP VPS
- [ ] Install Caddy di VPS (lihat `DNS-SETUP.md` langkah 4)
  - Atau gunakan Coolify built-in proxy
- [ ] Konfigurasi reverse proxy
- [ ] Verifikasi SSL certificate aktif
- [ ] Test akses via domain

## FASE H: TESTING PRODUCTION (15 menit)

### Fungsional
- [ ] Homepage loads (https://domain.sch.id)
- [ ] Halaman PPDB loads
- [ ] Login pendaftar berhasil
- [ ] Login admin berhasil
- [ ] Dashboard pendaftar tampil data
- [ ] Dashboard admin tampil data
- [ ] Registrasi baru berfungsi
- [ ] OTP terkirim via WhatsApp
- [ ] Upload dokumen berhasil
- [ ] Pembayaran Midtrans berfungsi (sandbox dulu)

### Performance
- [ ] Page load < 3 detik
- [ ] API response < 1 detik
- [ ] Database queries normal

### Security
- [ ] HTTPS berfungsi (gembok hijau)
- [ ] HTTP redirect ke HTTPS
- [ ] Firewall hanya buka port yang diperlukan
- [ ] SSH key-based auth berfungsi

---

## ROLLBACK PLAN

Jika ada masalah kritis:

1. **Database error**: Restore dari backup
   ```bash
   pg_restore -U ppdb_user -d ppdb_alimam --clean migration/backup/supabase_full.dump
   ```

2. **Aplikasi crash**: Cek logs
   ```bash
   sudo journalctl -u ppdb-alimam -f --since "1 hour ago"
   ```

3. **DNS belum propagasi**: Akses via IP langsung
   ```
   http://IP_VPS:3000
   ```

4. **Total failure**: Kembali ke Supabase
   - Ubah kembali DNS ke Vercel
   - Revert .env ke Supabase connection strings
   - Supabase data masih intact (tidak dihapus)

---

## CREDENTIALS YANG DIPERLUKAN

| Item | Value | Status |
|------|-------|--------|
| VPS IP | Dapat dari Hostinger panel | Belum |
| VPS Root Password | Dari Hostinger email | Belum |
| DB User | ppdb_user | Set saat setup |
| DB Password | Generate strong password | Belum |
| Domain | xxx.sch.id | Belum dibeli |
| Coolify Admin | Set saat first access | Belum |
| Midtrans Key | Mid-server-_wezICIZ7g4SHaF5JBhxleH2s | Sudah |
| Twilio SID | AC_YOUR_TWILIO_SID | Sudah |
| Twilio Token | YOUR_TWILIO_AUTH_TOKEN | Sudah |

---

## POST-DEPLOYMENT (Setelah Stabil)

- [ ] Setup automated backup database (cron job)
- [ ] Setup monitoring (uptime)
- [ ] Migrasi auth dari Supabase ke custom (jika belum)
- [ ] Migrasi storage dari Supabase ke local filesystem
- [ ] Ganti Midtrans ke production mode
- [ ] Remove Supabase dependencies dari kode
- [ ] Setup CI/CD pipeline
