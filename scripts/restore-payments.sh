#!/bin/bash
set -e

AZZAM_NEW_ID='7622839b-1678-450f-90e9-b5f20c8eabcf'
RAYLAN_NEW_ID='439d5b81-2c53-42ac-872c-f6983088b999'
SUKARI_NEW_ID='c92cffea-590c-40ba-9263-c793ba207d57'

VOLUME_BASE='/var/lib/docker/volumes/qkcs8ok8gg848o88ckckwkks-pp-alimam-storage/_data/bukti-pembayaran'
TA_ID='33acea8f-5049-4a0a-a064-ede33db6d133f'

echo "=== All payment files ==="
find "$VOLUME_BASE" -type f -name 'bukti-*' | sort

echo ""
echo "=== Building SQL ==="
echo 'BEGIN;' > /tmp/restore_payments.sql

while IFS= read -r FILEPATH; do
  OLD_DIR=$(dirname "$FILEPATH")
  OLD_ID=$(basename "$OLD_DIR")
  FN=$(basename "$FILEPATH")
  FS=$(stat -c%s "$FILEPATH")

  # Determine jenis_pembayaran from filename
  if echo "$FN" | grep -qi "daftar.ulang\|daftar-ulang"; then
    JENIS="DAFTAR_ULANG"
  else
    JENIS="PENDAFTARAN"
  fi

  EXT="${FN##*.}"
  case "$EXT" in
    pdf) FT='application/pdf' ;;
    jpg|jpeg) FT='image/jpeg' ;;
    png) FT='image/png' ;;
    *) FT='application/octet-stream' ;;
  esac

  # Map old ID to new ID
  NEW_ID=""
  case "$OLD_ID" in
    439d5b81-2c53-42ac-872c-3a*)  NEW_ID="$RAYLAN_NEW_ID" ;;
    c92cffea-590c-40ba-9263-2c*)  NEW_ID="$SUKARI_NEW_ID" ;;
    7622839b-*) NEW_ID="$AZZAM_NEW_ID" ;;
    *) echo "UNKNOWN OLD_ID: $OLD_ID — skipping"; continue ;;
  esac

  echo "Mapping $OLD_ID -> $NEW_ID  File: $FN"
  mkdir -p "$VOLUME_BASE/$NEW_ID"
  cp -v "$FILEPATH" "$VOLUME_BASE/$NEW_ID/$FN" 2>/dev/null || true

  FP="bukti-pembayaran/$NEW_ID/$FN"

  # Estimate jumlah: 200000 for PENDAFTARAN
  if [ "$JENIS" = "DAFTAR_ULANG" ]; then
    JUMLAH=8500000
  else
    JUMLAH=200000
  fi

  echo "INSERT INTO pembayaran (pendaftar_id, tahun_ajaran_id, metode_pembayaran, jenis_pembayaran, jumlah, bukti_transfer_path, bukti_transfer_filename, status_pembayaran, created_at, updated_at) VALUES ('$NEW_ID', '$TA_ID', 'manual', '$JENIS', $JUMLAH, '$FP', '$FN', 'pending', NOW(), NOW());" >> /tmp/restore_payments.sql

done < /tmp/payment_files.txt

echo 'COMMIT;' >> /tmp/restore_payments.sql

echo ""
echo "=== Generated SQL ==="
cat /tmp/restore_payments.sql

echo ""
echo "=== Executing ==="
docker exec -i coolify-db psql -U postgres -d ppdb_alimam < /tmp/restore_payments.sql

echo ""
echo "=== Verify Pembayaran ==="
docker exec coolify-db psql -U postgres -d ppdb_alimam -c "SELECT p.nama_lengkap, pb.jenis_pembayaran, pb.status_pembayaran, pb.jumlah, pb.bukti_transfer_filename FROM pembayaran pb JOIN pendaftar p ON pb.pendaftar_id = p.id ORDER BY p.nama_lengkap;"
