# Panduan Setup DNS - Domain sch.id ke VPS Hostinger Malaysia

## Prasyarat
- Domain sch.id sudah dibeli dari Hostinger
- VPS Hostinger KVM 2 sudah aktif
- Tahu IP address VPS (dari panel Hostinger)

---

## LANGKAH 1: Dapatkan IP VPS

1. Login ke Hostinger panel → VPS Management
2. Catat IP address VPS (contoh: `103.xxx.xxx.xxx`)

## LANGKAH 2: Setup DNS Records di Hostinger

Login ke Hostinger → Domain → DNS Zone Editor

### Records yang Diperlukan

| Type  | Name | Value | TTL |
|-------|------|-------|-----|
| A     | @    | `IP_VPS` | 3600 |
| A     | www  | `IP_VPS` | 3600 |
| A     | ppdb | `IP_VPS` | 3600 |
| CNAME | www  | `yourdomain.sch.id` | 3600 |

### Penjelasan:
- **A record `@`**: Root domain (yourdomain.sch.id) → IP VPS
- **A record `www`**: www.yourdomain.sch.id → IP VPS
- **A record `ppdb`**: ppdb.yourdomain.sch.id → IP VPS (subdomain untuk PPDB)
- **CNAME `www`**: Redirect www ke root domain

### Opsional (Email):
| Type | Name | Value | Priority | TTL |
|------|------|-------|----------|-----|
| MX   | @    | mail.yourdomain.sch.id | 10 | 3600 |

## LANGKAH 3: Verifikasi DNS Propagasi

### Dari Windows (CMD/PowerShell):
```bash
nslookup yourdomain.sch.id
nslookup ppdb.yourdomain.sch.id
```

### Dari Linux/VPS:
```bash
dig yourdomain.sch.id
dig ppdb.yourdomain.sch.id
```

### Online Tools:
- https://www.whatsmydns.net/ - Cek propagasi global
- https://dnschecker.org/ - DNS checker

DNS propagasi biasanya 5-30 menit untuk Hostinger (karena domain dan VPS satu provider), tapi bisa sampai 24-48 jam untuk propagasi global.

## LANGKAH 4: Setup Reverse Proxy (Caddy - Recommended)

Caddy otomatis handle SSL certificate via Let's Encrypt.

### Install Caddy di VPS:
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### Konfigurasi Caddy:
```bash
sudo nano /etc/caddy/Caddyfile
```

Isi dengan:
```
yourdomain.sch.id {
    reverse_proxy localhost:3000
}

www.yourdomain.sch.id {
    redir https://yourdomain.sch.id{uri}
}

ppdb.yourdomain.sch.id {
    reverse_proxy localhost:3000
}
```

### Start Caddy:
```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
```

Caddy akan **otomatis**:
- Dapatkan SSL certificate dari Let's Encrypt
- Redirect HTTP → HTTPS
- Renew certificate sebelum expired

## LANGKAH 5: Verifikasi

### Test dari browser:
1. Buka `https://yourdomain.sch.id` - Harus tampil PPDB
2. Buka `https://www.yourdomain.sch.id` - Harus redirect ke domain utama
3. Buka `http://yourdomain.sch.id` - Harus auto-redirect ke HTTPS
4. Cek SSL certificate (klik gembok di browser)

### Test dari terminal:
```bash
curl -I https://yourdomain.sch.id
# Harus return HTTP 200

curl -I http://yourdomain.sch.id
# Harus return HTTP 301 redirect ke HTTPS
```

---

## ALTERNATIF: Setup via Coolify

Jika menggunakan Coolify, SSL dan reverse proxy sudah dihandle otomatis:

1. Buka Coolify dashboard (http://IP_VPS:8000)
2. Buat project baru
3. Add new resource → Public Repository
4. Masukkan URL Git repository
5. Set environment variables
6. Set domain di Coolify settings
7. Coolify akan auto-setup Traefik reverse proxy + SSL

---

## TROUBLESHOOTING

### DNS belum propagasi
- Tunggu 30 menit - 24 jam
- Cek di whatsmydns.net
- Sementara akses via IP: `http://IP_VPS:3000`

### SSL certificate gagal
- Pastikan DNS sudah pointing ke VPS (A record)
- Pastikan port 80 dan 443 terbuka di firewall
- Cek log Caddy: `sudo journalctl -u caddy -f`

### Domain tidak resolve
- Cek nameserver domain di registrar
- Pastikan nameserver Hostinger digunakan:
  - ns1.dns-parking.com
  - ns2.dns-parking.com
  (atau sesuai panel Hostinger)

### Timeout saat akses domain
- Cek firewall: `sudo ufw status`
- Pastikan port 80/443 terbuka
- Cek aplikasi berjalan: `sudo systemctl status ppdb-alimam`
