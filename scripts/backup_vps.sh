#!/bin/bash

# Configuration
# ----------------------
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="pp-alimam-db"
DB_USER="postgres"
DB_NAME="pp_alimam"
UPLOAD_DIR="./storage_data"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "Using container: $DB_CONTAINER (Ensure this matches your docker-compose container_name)"

# 1. Backup Database
echo "📦 Backing up PostgreSQL database..."
docker exec -t $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
  echo "✅ Database backup successful: $BACKUP_DIR/db_backup_$TIMESTAMP.sql"
else
  echo "❌ Database backup failed!"
  exit 1
fi

# 2. Backup Uploaded Files
echo "📂 Backing up storage files..."
tar -czf "$BACKUP_DIR/storage_backup_$TIMESTAMP.tar.gz" -C "$UPLOAD_DIR" .

if [ $? -eq 0 ]; then
  echo "✅ Storage backup successful: $BACKUP_DIR/storage_backup_$TIMESTAMP.tar.gz"
else
  echo "❌ Storage backup failed!"
  exit 1
fi

# 3. Cleanup Old Backups (Keep last 7 days)
echo "🧹 Cleaning up backups older than 7 days..."
find "$BACKUP_DIR" -name "db_backup_*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "storage_backup_*.tar.gz" -mtime +7 -delete

echo "🎉 Backup Process Complete!"
