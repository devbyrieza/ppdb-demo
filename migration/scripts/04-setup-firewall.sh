#!/bin/bash
# ============================================================================
# SCRIPT 04: SETUP FIREWALL & SECURITY
# Jalankan sebagai root
# ============================================================================

set -e

echo "============================================"
echo "  SETUP FIREWALL - PPDB AL-IMAM"
echo "  $(date)"
echo "============================================"

# Minta IP admin untuk whitelist pgAdmin
echo ""
read -p "Masukkan IP address Anda (untuk akses pgAdmin, kosongkan jika belum tahu): " ADMIN_IP

# 1. Setup UFW
echo ""
echo "[1/4] Configuring UFW firewall..."

# Reset UFW
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# SSH (HARUS pertama, jangan sampai terkunci!)
ufw allow 22/tcp comment 'SSH'

# HTTP & HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Coolify Dashboard
ufw allow 8000/tcp comment 'Coolify Dashboard'

# PostgreSQL - HANYA dari IP admin (jika diisi)
if [ -n "$ADMIN_IP" ]; then
    ufw allow from $ADMIN_IP to any port 5432 comment 'pgAdmin from Admin IP'
    echo "  PostgreSQL dibuka HANYA untuk IP: $ADMIN_IP"
else
    echo "  WARNING: PostgreSQL TIDAK dibuka dari luar (lebih aman)"
    echo "  Gunakan SSH tunnel untuk akses pgAdmin:"
    echo "  ssh -L 5432:localhost:5432 root@YOUR_VPS_IP"
fi

# Enable UFW
ufw --force enable
echo "  UFW enabled!"

# 2. Setup Fail2Ban
echo ""
echo "[2/4] Configuring Fail2Ban..."

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = admin@alimam.local
action = %(action_)s

[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 7200
EOF

systemctl restart fail2ban
systemctl enable fail2ban
echo "  Fail2Ban configured!"

# 3. Disable unnecessary services
echo ""
echo "[3/4] Hardening system..."

# Disable IPv6 if not needed
echo "net.ipv6.conf.all.disable_ipv6 = 1" >> /etc/sysctl.conf
echo "net.ipv6.conf.default.disable_ipv6 = 1" >> /etc/sysctl.conf
sysctl -p

echo "  System hardened!"

# 4. Verify
echo ""
echo "[4/4] Verifying firewall status..."
ufw status verbose
echo ""

echo "============================================"
echo "  FIREWALL SETUP SELESAI!"
echo "============================================"
echo ""
echo "Rules aktif:"
ufw status numbered
echo ""
echo "Fail2Ban status:"
fail2ban-client status
echo ""
echo "PENTING:"
echo "  - Jangan tutup terminal SSH ini sebelum test login baru!"
echo "  - Buka terminal baru dan coba SSH ke VPS"
echo "  - Jika berhasil, aman untuk lanjut"
echo ""
