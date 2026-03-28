# 🐘 POSTGRESQL INSTALLATION GUIDE - WINDOWS

## 📥 Step 1: Download PostgreSQL
1. Buka: https://www.enterprisedb.com/download-postgresql-binaries.aspx
2. Pilih: Windows x86-64
3. Download versi terbaru (16.x)
4. Run installer sebagai Administrator

## 🛠️ Step 2: Installation
1. Pilih "Complete" installation
2. Centang "Install pgAdmin 4" 
3. Set password: **buatsuperpassword123** (ingat ini!)
4. Port: 5432 (default)
5. Selesai installation

## 🧪 Step 3: Add PostgreSQL to PATH
1. Buka Environment Variables:
   - Win + R → ketik "sysdm.cpl"
   - Advanced → Environment Variables
2. Add to PATH:
   - C:\Program Files\PostgreSQL\16\bin
   - C:\Program Files\PostgreSQL\16\lib

## 🧪 Step 4: Verify Installation
Buka Command Prompt dan test:
```bash
psql --version
pg_dump --version
```

## 🗄️ Step 5: Start PostgreSQL Service
1. Buka Services (services.msc)
2. Cari "postgresql-x64-16"
3. Start service (jika belum running)

## 🔐 Step 6: Setup Local Database
```bash
# Buka Command Prompt sebagai Administrator
psql -U postgres

# Buat database untuk testing
CREATE DATABASE ppdb_alimam_test;

# Buat user untuk aplikasi
CREATE USER ppdb_user WITH PASSWORD 'ppdb_password123';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ppdb_alimam_test TO ppdb_user;

# Exit
\q
```

## 📱 Step 7: Test Connection
```bash
# Test koneksi ke database
psql -U ppdb_user -d ppdb_alimam_test -h localhost

# Password: ppdb_password123
```

## ✅ Next Steps
Setelah PostgreSQL terinstall:
1. Jalankan migration script
2. Import data dari backup
3. Test aplikasi lokal
4. Ready untuk deployment!

## 🔧 Environment Variables untuk Local
Update .env.local:
```
# Local PostgreSQL
DATABASE_URL="postgresql://ppdb_user:ppdb_password123@localhost:5432/ppdb_alimam_test"

# Non-aktifkan Supabase
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
```

## 📞 Troubleshooting
❌ "psql not recognized":
   → Add PostgreSQL ke PATH (Step 3)

❌ "Connection refused":
   → Start PostgreSQL service (Step 5)

❌ "Password authentication failed":
   → Gunakan password yang benar (Step 6)

## 🎯 Target Configuration
- **Database**: ppdb_alimam_test
- **User**: ppdb_user  
- **Password**: ppdb_password123
- **Port**: 5432
- **Host**: localhost
