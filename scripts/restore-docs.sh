#!/bin/bash
set -e

AZZAM_NEW_ID='7622839b-1678-450f-90e9-b5f20c8eabcf'
RAYLAN_NEW_ID='439d5b81-2c53-42ac-872c-f6983088b999'
VOLUME_BASE='/var/lib/docker/volumes/qkcs8ok8gg848o88ckckwkks-pp-alimam-storage/_data/dokumen-pendaftaran'

echo "Volume base: $VOLUME_BASE"

# Find original directories by searching for files with registration number prefix
AZZAM_OLD_DIR=$(find "$VOLUME_BASE" -type f -name 'MTI2600005_*' -print -quit | xargs dirname 2>/dev/null || echo "")
RAYLAN_OLD_DIR=$(find "$VOLUME_BASE" -type f -name 'ILI2600001_*' -print -quit | xargs dirname 2>/dev/null || echo "")

echo "Azzam old dir: $AZZAM_OLD_DIR"
echo "Raylan old dir: $RAYLAN_OLD_DIR"

# Create new directories and copy files
mkdir -p "$VOLUME_BASE/$AZZAM_NEW_ID"
mkdir -p "$VOLUME_BASE/$RAYLAN_NEW_ID"

if [ -n "$AZZAM_OLD_DIR" ] && [ -d "$AZZAM_OLD_DIR" ]; then
  echo "Copying Azzam files..."
  cp -v "$AZZAM_OLD_DIR"/* "$VOLUME_BASE/$AZZAM_NEW_ID/" 2>/dev/null || true
else
  echo "WARNING: No Azzam old directory found"
fi

if [ -n "$RAYLAN_OLD_DIR" ] && [ -d "$RAYLAN_OLD_DIR" ]; then
  echo "Copying Raylan files..."
  cp -v "$RAYLAN_OLD_DIR"/* "$VOLUME_BASE/$RAYLAN_NEW_ID/" 2>/dev/null || true
else
  echo "WARNING: No Raylan old directory found"
fi

echo '--- Building SQL ---'
echo 'BEGIN;' > /tmp/restore_docs.sql

# Process Azzam files
for FILE in "$VOLUME_BASE/$AZZAM_NEW_ID"/*; do
  if [ -f "$FILE" ]; then
    FN=$(basename "$FILE")
    FS=$(stat -c%s "$FILE")
    JD=$(echo "$FN" | sed -E 's/^[A-Z]+[0-9]+_//' | sed 's/\.[^.]*$//')
    EXT="${FN##*.}"
    case "$EXT" in
      pdf) FT='application/pdf' ;;
      jpg|jpeg) FT='image/jpeg' ;;
      png) FT='image/png' ;;
      *) FT='application/octet-stream' ;;
    esac
    FP="dokumen-pendaftaran/$AZZAM_NEW_ID/$FN"
    echo "INSERT INTO dokumen (pendaftar_id, jenis_dokumen, file_name, file_path, file_size, file_type, is_verified, created_at, updated_at) VALUES ('$AZZAM_NEW_ID', '$JD', '$FN', '$FP', $FS, '$FT', false, NOW(), NOW());" >> /tmp/restore_docs.sql
  fi
done

# Process Raylan files
for FILE in "$VOLUME_BASE/$RAYLAN_NEW_ID"/*; do
  if [ -f "$FILE" ]; then
    FN=$(basename "$FILE")
    FS=$(stat -c%s "$FILE")
    JD=$(echo "$FN" | sed -E 's/^[A-Z]+[0-9]+_//' | sed 's/\.[^.]*$//')
    EXT="${FN##*.}"
    case "$EXT" in
      pdf) FT='application/pdf' ;;
      jpg|jpeg) FT='image/jpeg' ;;
      png) FT='image/png' ;;
      *) FT='application/octet-stream' ;;
    esac
    FP="dokumen-pendaftaran/$RAYLAN_NEW_ID/$FN"
    echo "INSERT INTO dokumen (pendaftar_id, jenis_dokumen, file_name, file_path, file_size, file_type, is_verified, created_at, updated_at) VALUES ('$RAYLAN_NEW_ID', '$JD', '$FN', '$FP', $FS, '$FT', false, NOW(), NOW());" >> /tmp/restore_docs.sql
  fi
done

echo 'COMMIT;' >> /tmp/restore_docs.sql

echo '=== Generated SQL ==='
cat /tmp/restore_docs.sql

echo '=== Executing ==='
docker exec -i coolify-db psql -U postgres -d ppdb_alimam < /tmp/restore_docs.sql

echo '=== Verify ==='
docker exec coolify-db psql -U postgres -d ppdb_alimam -c "SELECT p.nama_lengkap, d.jenis_dokumen, d.file_name FROM dokumen d JOIN pendaftar p ON d.pendaftar_id = p.id ORDER BY p.nama_lengkap, d.jenis_dokumen;"
