#!/bin/bash
# ============================================================================
# SCRIPT 02: INSTALL COOLIFY
# Coolify = open source PaaS (seperti Vercel/Heroku tapi self-hosted)
# Jalankan sebagai root
# ============================================================================

set -e

echo "============================================"
echo "  INSTALL COOLIFY - PPDB AL-IMAM"
echo "  $(date)"
echo "============================================"

# 1. Install Coolify (single command)
echo ""
echo "[1/2] Installing Coolify..."
echo "  Ini akan install Docker, Docker Compose, dan Coolify..."
echo ""

curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# 2. Verifikasi
echo ""
echo "[2/2] Verifying installation..."
docker --version
echo ""

echo "============================================"
echo "  COOLIFY TERINSTALL!"
echo "============================================"
echo ""
echo "Akses Coolify dashboard di:"
echo "  http://YOUR_VPS_IP:8000"
echo ""
echo "Setup awal Coolify:"
echo "  1. Buka browser ke http://YOUR_VPS_IP:8000"
echo "  2. Buat akun admin"
echo "  3. Configure server (localhost)"
echo "  4. Add new project: ppdb-alimam"
echo "  5. Connect ke Git repository"
echo ""
echo "Langkah selanjutnya:"
echo "  bash 03-setup-postgresql.sh"
echo ""
