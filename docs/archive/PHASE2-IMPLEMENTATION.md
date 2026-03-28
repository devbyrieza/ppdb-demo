# 📋 PHASE 2 IMPLEMENTATION GUIDE

**Form Pendaftaran + WhatsApp OTP System**

---

## 📚 FILES CREATED

### 1. Frontend Components

```
✅ src/app/daftar/page.tsx (Updated with API integration)
```

### 2. API Routes

```
✅ src/app/api/register/send-otp/route.ts
✅ src/app/api/register/verify-otp/route.ts
✅ src/app/api/register/complete/route.ts
```

### 3. Utility Functions

```
✅ src/lib/validations/registration.ts
✅ src/lib/utils/password.ts
✅ src/lib/utils/nomor-pendaftaran.ts
✅ src/types/registration.ts
```

### 4. Database Migration

```
✅ migrations/002_create_otp_verifications.sql
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Setup Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FONNTE_API_KEY=your_fonnte_api_key (optional for dev)
```

### Step 2: Run Database Migration

```bash
# Execute SQL file in Supabase SQL Editor
# Or use Supabase CLI:
supabase db push migrations/002_create_otp_verifications.sql
```

### Step 3: Install Dependencies

```bash
npm install bcryptjs @types/bcryptjs
npm install zod
```

### Step 4: Test the Flow

**A. Registration Form:**

1. Go to `/daftar`
2. Fill form (NIK, Nama, TTL, No WA, Gender, Jenjang)
3. Click "Daftar Sekarang"

**B. OTP Verification:**

1. Check WhatsApp for OTP code
2. Input 6-digit code
3. Click "Verifikasi Kode"

**C. Success:**

1. View Nomor Pendaftaran & Password
2. Copy credentials
3. Auto-redirect to `/login` (5s)

---

## 🧪 TESTING GUIDE

### Development Mode (Without Fonnte)

If you don't have Fonnte API key yet:

1. **Check Console for OTP:**
   - Open browser console (F12)
   - Click "Daftar Sekarang"
   - Look for: `📱 [DEV MODE] OTP for +6281234567890: 123456`

2. **Use Hardcoded OTP:**
   - In `verify-otp/route.ts`, temporarily change:

   ```typescript
   // For testing only!
   if (otp_code === "123456") {
     // Success
   }
   ```

3. **Simulate Success Flow:**
   - Input `123456` as OTP
   - Should proceed to complete registration

### Production Mode (With Fonnte)

1. **Setup Fonnte Account:**
   - Go to https://fonnte.com
   - Register & get API key
   - Add to `.env.local`

2. **Test Real WhatsApp:**
   - Use your real phone number
   - Receive actual OTP via WhatsApp
   - Verify and complete registration

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                   USER FILLS FORM                       │
│  (NIK, Nama, TTL, No WA, Gender, Jenjang)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          POST /api/register/send-otp                    │
│  • Validate form data                                   │
│  • Check NIK duplicate                                  │
│  • Generate 6-digit OTP                                 │
│  • Hash OTP (SHA-256)                                   │
│  • Store in otp_verifications table                     │
│  • Send OTP via WhatsApp (Fonnte)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            USER RECEIVES WHATSAPP OTP                   │
│  "Kode verifikasi: 123456"                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│       POST /api/register/verify-otp                     │
│  • Validate OTP format                                  │
│  • Hash input OTP                                       │
│  • Compare with stored hash                             │
│  • Check expiration (5 min)                             │
│  • Check attempts (max 3)                               │
│  • Mark as verified                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│       POST /api/register/complete                       │
│  • Get verified OTP record                              │
│  • Parse registration data                              │
│  • Generate Nomor Pendaftaran (B2600001)                │
│  • Generate Password (MT67890123)                       │
│  • Hash password (bcrypt)                               │
│  • Insert to data_pendaftar table                       │
│  • Send success notification via WhatsApp               │
│  • Delete OTP record (cleanup)                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              USER SEES SUCCESS MODAL                    │
│  • Display Nomor Pendaftaran                            │
│  • Display Password                                     │
│  • Copy to clipboard buttons                            │
│  • Auto-redirect to /login (5s)                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 SECURITY FEATURES

### 1. OTP Security

- ✅ Hashed with SHA-256 (not stored in plain text)
- ✅ Expires after 5 minutes
- ✅ Max 3 verification attempts
- ✅ Rate limiting (3 requests per hour)
- ✅ Auto-cleanup expired records

### 2. Password Security

- ✅ Generated automatically (10 characters)
- ✅ Hashed with bcrypt (10 rounds)
- ✅ Format: `[JENJANG][NIK_8_DIGIT]`
- ✅ User can change later (optional)

### 3. Form Validation

- ✅ Client-side: Zod schema
- ✅ Server-side: Double validation
- ✅ NIK: 16 digits, unique check
- ✅ Phone: Indonesian format (+62)
- ✅ Age: 10-20 years validation

### 4. Database Security

- ✅ Row Level Security (RLS) enabled
- ✅ Service role policies
- ✅ Indexed for performance
- ✅ Unique constraints

---

## 🎯 API ENDPOINTS

### 1. Send OTP

```typescript
POST /api/register/send-otp

Request Body:
{
  "nik": "3201234567890123",
  "nama_lengkap": "Ahmad Zaki Mubarak",
  "tanggal_lahir": "2010-05-15",
  "no_hp": "081234567890",
  "jenis_kelamin": "L",
  "jenjang": "MTs"
}

Success Response (200):
{
  "success": true,
  "message": "Kode OTP telah dikirim ke WhatsApp Anda",
  "phone": "+6281234567890",
  "expires_in": 300
}

Error Response (400/409/429):
{
  "success": false,
  "error": "NIK sudah terdaftar dengan nomor B2600001"
}
```

### 2. Verify OTP

```typescript
POST /api/register/verify-otp

Request Body:
{
  "no_hp": "081234567890",
  "otp_code": "123456"
}

Success Response (200):
{
  "success": true,
  "message": "Verifikasi berhasil",
  "data": { /* registration data */ },
  "otp_id": "uuid-here"
}

Error Response (400/404/410/429):
{
  "success": false,
  "error": "Kode OTP salah. Sisa percobaan: 2"
}
```

### 3. Complete Registration

```typescript
POST /api/register/complete

Request Body:
{
  "otp_id": "uuid-here"
}

Success Response (200):
{
  "success": true,
  "message": "Pendaftaran berhasil",
  "data": {
    "nomor_pendaftaran": "B2600001",
    "password": "MT67890123",
    "nama_lengkap": "Ahmad Zaki Mubarak",
    "jenjang": "MTs"
  }
}

Error Response (400/409/500):
{
  "success": false,
  "error": "OTP belum diverifikasi"
}
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: OTP Not Received

**Problem:** User doesn't receive WhatsApp OTP

**Solutions:**

1. Check Fonnte API key is correct
2. Check phone number format (+62)
3. Check Fonnte balance/quota
4. Check WhatsApp number is active
5. Use dev mode to see OTP in console

### Issue 2: OTP Expired

**Problem:** User gets "Kode OTP sudah kadaluarsa"

**Solutions:**

1. Click "Kirim Ulang Kode"
2. Check countdown timer
3. Complete verification within 5 minutes

### Issue 3: Too Many Attempts

**Problem:** "Terlalu banyak percobaan gagal"

**Solutions:**

1. Wait for rate limit to reset (15 min)
2. Request new OTP after cooldown
3. Check attempts counter in database

### Issue 4: Duplicate NIK

**Problem:** "NIK sudah terdaftar"

**Solutions:**

1. Check if user already registered
2. Use existing nomor pendaftaran
3. Admin can reset registration if needed

### Issue 5: Database Connection

**Problem:** "Terjadi kesalahan server"

**Solutions:**

1. Check Supabase URL & keys
2. Check internet connection
3. Verify database tables exist
4. Check RLS policies

---

## 📈 PERFORMANCE OPTIMIZATION

### Database Queries

```sql
-- Add indexes for faster lookups
CREATE INDEX idx_pendaftar_nik ON data_pendaftar(nik);
CREATE INDEX idx_pendaftar_nomor ON data_pendaftar(nomor_pendaftaran);
CREATE INDEX idx_pendaftar_tahun ON data_pendaftar(tahun_ajaran_id);
```

### Caching Strategy

```typescript
// Cache tahun ajaran aktif (rarely changes)
const cachedTahunAjaran = await getCachedTahunAjaran();

// Cache last nomor pendaftaran for sequence
const lastNomor = await redis.get("last_nomor_pendaftaran");
```

### Rate Limiting

```typescript
// Use Redis for production rate limiting
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
});
```

---

## ✅ CHECKLIST BEFORE DEPLOY

- [ ] Environment variables configured
- [ ] Database migration executed
- [ ] Fonnte API key added (or dev mode ready)
- [ ] All dependencies installed
- [ ] Form validation tested
- [ ] OTP flow tested end-to-end
- [ ] Success modal displays correctly
- [ ] Redirect to login works
- [ ] WhatsApp notifications sent
- [ ] Error handling tested
- [ ] Mobile responsive checked
- [ ] Accessibility (a11y) verified

---

## 🎉 NEXT STEPS

After Phase 2 is complete:

**Phase 3: Form Data Lengkap + Dashboard**

- Multi-step form (8 steps)
- Dashboard tabs (8 tabs)
- Upload berkas system
- Payment tracking
- Progress tracker

**Target Start:** 22 Jan 2026
**Estimated Time:** 3-4 days

---

**Last Updated:** 20 Januari 2026
**Status:** ✅ Ready to Deploy
**Version:** 1.0.0
