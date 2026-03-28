#!/bin/bash
# ============================================================================
# SCRIPT 03: SETUP POSTGRESQL 16 di Ubuntu 24.04
# Jalankan sebagai root
# ============================================================================

set -e

echo "============================================"
echo "  SETUP POSTGRESQL 16 - PPDB AL-IMAM"
echo "  $(date)"
echo "============================================"

# ===== KONFIGURASI =====
DB_NAME="ppdb_alimam"
DB_USER="ppdb_user"
DB_PASSWORD=""  # Akan diminta via prompt

# Minta password
echo ""
read -sp "Masukkan password untuk database user ($DB_USER): " DB_PASSWORD
echo ""
read -sp "Konfirmasi password: " DB_PASSWORD_CONFIRM
echo ""

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    echo "ERROR: Password tidak cocok!"
    exit 1
fi

if [ ${#DB_PASSWORD} -lt 12 ]; then
    echo "WARNING: Password kurang dari 12 karakter. Disarankan minimal 12 karakter."
    read -p "Lanjutkan? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

# 1. Install PostgreSQL 16
echo ""
echo "[1/7] Installing PostgreSQL 16..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-16 postgresql-contrib-16
echo "  PostgreSQL 16 installed!"

# 2. Start & enable service
echo ""
echo "[2/7] Starting PostgreSQL service..."
systemctl start postgresql
systemctl enable postgresql
echo "  Service started!"

# 3. Create database user
echo ""
echo "[3/7] Creating database user: $DB_USER..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
echo "  User created!"

# 4. Create database
echo ""
echo "[4/7] Creating database: $DB_NAME..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
echo "  Database created!"

# 5. Setup extensions
echo ""
echo "[5/7] Setting up extensions..."
sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"
echo "  Extensions & privileges configured!"

# 6. Configure remote access (untuk pgAdmin)
echo ""
echo "[6/7] Configuring remote access..."

PG_HBA=$(find /etc/postgresql -name "pg_hba.conf" | head -1)
PG_CONF=$(find /etc/postgresql -name "postgresql.conf" | head -1)

# Backup config
cp $PG_HBA ${PG_HBA}.backup
cp $PG_CONF ${PG_CONF}.backup

# Allow remote connections (hanya dari IP tertentu, bukan semua)
echo "" >> $PG_HBA
echo "# Remote access for pgAdmin (RESTRICT to your IP in production)" >> $PG_HBA
echo "host    $DB_NAME    $DB_USER    0.0.0.0/0    scram-sha-256" >> $PG_HBA

# Listen on all interfaces
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" $PG_CONF

# Restart PostgreSQL
systemctl restart postgresql
echo "  Remote access configured!"

# 7. Verifikasi
echo ""
echo "[7/7] Verifying installation..."
sudo -u postgres psql -c "SELECT version();"
sudo -u postgres psql -d $DB_NAME -c "\dt"
echo ""

echo "============================================"
echo "  POSTGRESQL SETUP SELESAI!"
echo "============================================"
echo ""
echo "Connection String:"
echo "  postgresql://$DB_USER:YOUR_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo "Remote Connection (pgAdmin):"
echo "  Host: YOUR_VPS_IP"
echo "  Port: 5432"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo "  Password: (yang tadi dimasukkan)"
echo ""
echo "PENTING: Pastikan firewall mengizinkan port 5432!"
echo "  ufw allow from YOUR_IP to any port 5432"
echo ""
echo "Langkah selanjutnya:"
echo "  bash 04-setup-firewall.sh"
echo ""
