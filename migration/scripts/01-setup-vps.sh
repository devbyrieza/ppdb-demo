#!/bin/bash
# ============================================================================
# SCRIPT 01: SETUP VPS AWAL - Ubuntu 24.04 LTS
# Jalankan sebagai root setelah login pertama ke VPS
# ============================================================================

set -e

echo "============================================"
echo "  SETUP VPS - PPDB AL-IMAM"
echo "  $(date)"
echo "============================================"

# 1. Update system
echo ""
echo "[1/6] Updating system..."
apt update && apt upgrade -y

# 2. Install essential packages
echo ""
echo "[2/6] Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    nano \
    ufw \
    fail2ban \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common

# 3. Set timezone
echo ""
echo "[3/6] Setting timezone to Asia/Jakarta..."
timedatectl set-timezone Asia/Jakarta

# 4. Create deploy user (non-root)
echo ""
echo "[4/6] Creating deploy user..."
if ! id "deploy" &>/dev/null; then
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/deploy
    echo "  User 'deploy' created!"
else
    echo "  User 'deploy' already exists"
fi

# 5. Setup SSH key for deploy user (copy from root)
echo ""
echo "[5/6] Setting up SSH for deploy user..."
mkdir -p /home/deploy/.ssh
if [ -f /root/.ssh/authorized_keys ]; then
    cp /root/.ssh/authorized_keys /home/deploy/.ssh/
    chown -R deploy:deploy /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    chmod 600 /home/deploy/.ssh/authorized_keys
    echo "  SSH keys copied to deploy user"
fi

# 6. Basic SSH hardening
echo ""
echo "[6/6] Basic SSH hardening..."
# Backup sshd_config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Disable root password login (keep key-based)
sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config

# Restart SSH
systemctl restart sshd

echo ""
echo "============================================"
echo "  VPS SETUP SELESAI!"
echo "============================================"
echo ""
echo "Langkah selanjutnya:"
echo "  1. Jalankan: bash 02-install-coolify.sh"
echo "  2. Atau jalankan: bash 03-setup-postgresql.sh"
echo ""
