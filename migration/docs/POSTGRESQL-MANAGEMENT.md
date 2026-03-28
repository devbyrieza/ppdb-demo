# 🐘 POSTGRESQL MANAGEMENT OPTIONS

## 🎯 RECOMMENDED: pgAdmin 4 (Sudah Terinstall)

### 📱 Cara Akses pgAdmin:
1. Buka **Start Menu** → cari "pgAdmin 4"
2. Atau buka browser: http://localhost:5050
3. Login dengan password PostgreSQL kamu

### 🔧 Setup Database di pgAdmin:
1. **Add Server**:
   - Klik "Add New Server"
   - Name: "PPDB Local"
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: [password kamu]
   - Save password

2. **Create Database**:
   - Expand server → Databases
   - Right-click → Create → Database
   - Name: `ppdb_alimam_test`
   - Owner: postgres
   - Save

3. **Create User**:
   - Expand server → Login/Group Roles
   - Right-click → Create → Login/Group Role
   - Name: `ppdb_user`
   - Password: `ppdb_password123`
   - Tab: Privileges → Can login? Yes
   - Save

4. **Grant Privileges**:
   - Right-click database `ppdb_alimam_test`
   - Properties → Privileges
   - Add `ppdb_user` dengan ALL privileges
   - Save

## 🎯 ALTERNATIVE: Stack Builder

### 📥 Install Stack Builder:
1. Download dari: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Pilih "Stack Builder" untuk Windows
3. Install sebagai Administrator
4. Connect ke existing PostgreSQL instance

### ✅ Benefits Stack Builder:
- GUI-based database management
- Visual query builder
- Performance monitoring dashboard
- Backup scheduling
- User management interface

### ⚠️ Stack Builder vs pgAdmin:
- **pgAdmin**: Web-based, simpler, already installed
- **Stack Builder**: Desktop app, more features, separate install

## 🎯 MY RECOMMENDATION:

**Gunakan pgAdmin dulu** karena:
✅ Sudah terinstall dengan PostgreSQL
✅ Web-based (no additional software)
✅ Sufficient untuk database management
✅ Standard tool untuk PostgreSQL

**Install Stack Builder nanti** jika:
❌ pgAdmin tidak cukup untuk kebutuhan kamu
❌ Butuh advanced monitoring features
❌ Butuh desktop application

## 🚀 NEXT STEPS:

### 📋 Dengan pgAdmin:
1. **Buka pgAdmin 4**
2. **Create database**: `ppdb_alimam_test`
3. **Create user**: `ppdb_user` / `ppdb_password123`
4. **Grant privileges**
5. **Test connection**

### 📋 Dengan Stack Builder:
1. **Download & install**
2. **Connect ke existing PostgreSQL**
3. **Setup database & user**
4. **Test management features**

## 🔧 VERIFICATION COMMANDS:

Setelah setup, test di Command Prompt:
```bash
# Test connection
psql -U postgres -h localhost -c "\l"

# Test new user
psql -U ppdb_user -d ppdb_alimam_test -h localhost -c "\dt"

# Test password
psql -U ppdb_user -d ppdb_alimam_test -h localhost
# Password: ppdb_password123
```

## 📞 TROUBLESHOOTING:

❌ **pgAdmin tidak bisa connect**:
→ Pastikan PostgreSQL service running
→ Check port 5050 tidak blocked
→ Verify password benar

❌ **Stack Builder tidak detect PostgreSQL**:
→ Pastikan PostgreSQL di PATH
→ Check service status
→ Restart Stack Builder

❌ **Connection refused**:
→ Start PostgreSQL service
→ Check firewall settings
→ Verify port 5432 open

---

## 🎯 ACTION PLAN:

### 🔄 Option 1: pgAdmin (Recommended)
1. Buka pgAdmin 4 (5 menit)
2. Setup database & user (10 menit)
3. Test connection (5 menit)
4. Ready untuk import data! 🚀

### 🔄 Option 2: Stack Builder
1. Download Stack Builder (10 menit)
2. Install & setup (15 menit)
3. Connect & configure (10 menit)
4. Test features (5 menit)

**Total Time**: 20-40 menit

---

## 🎉 RECOMMENDATION FINAL:

**Gunakan pgAdmin dulu** - lebih cepat dan sudah terinstall!

Kalau nanti butuh features lebih advanced, baru install Stack Builder.

**Goal**: Database siap untuk import data dari Supabase! 🎯
