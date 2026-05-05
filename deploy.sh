#!/bin/bash
# ========================================
# DEPLOYMENT SCRIPT - TEMPLATE DEMO
# ========================================

# Konfigurasi
SERVER="root@72.61.141.50"
PROJECT_DIR="/root/apps/template-demo"

echo "🚀 Memulai deployment Template Demo ke $SERVER..."

# 1. Sync file ke server menggunakan rsync
echo "📦 Sinkronisasi file..."
rsync -avz --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '.env' \
  ./ $SERVER:$PROJECT_DIR

# 2. Build dan Restart Container di server
echo "🏗️ Membangun dan merestart container di server..."
ssh $SERVER "cd $PROJECT_DIR && docker compose up -d --build"

echo "✨ Deployment Template Demo Selesai!"
