#!/bin/bash
# ============================================================================
# SCRIPT 05: DEPLOY APLIKASI KE VPS
# Alternatif deployment manual (jika Coolify bermasalah)
# Jalankan sebagai user 'deploy'
# ============================================================================

set -e

echo "============================================"
echo "  DEPLOY PPDB AL-IMAM"
echo "  $(date)"
echo "============================================"

# ===== KONFIGURASI =====
APP_DIR="/home/deploy/ppdb-alimam"
REPO_URL=""  # Akan diminta
DOMAIN=""     # Akan diminta

read -p "Masukkan Git repository URL: " REPO_URL
read -p "Masukkan domain (contoh: ppdb.alimam.sch.id): " DOMAIN

# 1. Install Node.js 22 LTS
echo ""
echo "[1/7] Installing Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pnpm
echo "  Node.js $(node -v) installed!"
echo "  pnpm $(pnpm -v) installed!"

# 2. Clone repository
echo ""
echo "[2/7] Cloning repository..."
if [ -d "$APP_DIR" ]; then
    echo "  Directory exists, pulling latest..."
    cd $APP_DIR
    git pull
else
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi
echo "  Repository ready!"

# 3. Install dependencies
echo ""
echo "[3/7] Installing dependencies..."
cd $APP_DIR
pnpm install --frozen-lockfile
echo "  Dependencies installed!"

# 4. Setup environment
echo ""
echo "[4/7] Setting up environment..."
if [ ! -f .env ]; then
    echo "  PERHATIAN: File .env belum ada!"
    echo "  Buat file .env di $APP_DIR dengan isi dari env-variables.md"
    echo ""
    read -p "Apakah Anda sudah membuat file .env? (y/n): " ENV_READY
    if [ "$ENV_READY" != "y" ]; then
        echo "  Silakan buat file .env dulu, lalu jalankan script ini lagi."
        exit 1
    fi
fi

# 5. Generate Prisma & push schema
echo ""
echo "[5/7] Setting up database schema..."
npx prisma generate
npx prisma db push
echo "  Database schema deployed!"

# 6. Build application
echo ""
echo "[6/7] Building application..."
pnpm build
echo "  Build complete!"

# 7. Setup systemd service
echo ""
echo "[7/7] Setting up systemd service..."

sudo tee /etc/systemd/system/ppdb-alimam.service > /dev/null << EOF
[Unit]
Description=PPDB AL-IMAM Next.js Application
After=network.target postgresql.service

[Service]
Type=simple
User=deploy
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/pnpm start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=ppdb-alimam
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ppdb-alimam
sudo systemctl start ppdb-alimam

echo ""
echo "============================================"
echo "  DEPLOYMENT SELESAI!"
echo "============================================"
echo ""
echo "Status aplikasi:"
sudo systemctl status ppdb-alimam --no-pager
echo ""
echo "Aplikasi berjalan di: http://localhost:3000"
echo ""
echo "Untuk setup reverse proxy (Nginx/Caddy):"
echo "  Lihat dokumentasi DNS-SETUP.md"
echo ""
echo "Commands berguna:"
echo "  sudo systemctl status ppdb-alimam   # Cek status"
echo "  sudo systemctl restart ppdb-alimam  # Restart"
echo "  sudo journalctl -u ppdb-alimam -f   # Lihat logs"
echo ""
