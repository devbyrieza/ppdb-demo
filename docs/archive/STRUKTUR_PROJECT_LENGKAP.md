# 📁 STRUKTUR PROJECT LENGKAP - PP-ALIMAM

**Project Type:** Next.js 14+ with TypeScript  
**Last Updated:** January 30, 2026

---

## 📚 DAFTAR ISI
1. [File Root](#file-root)
2. [Folder Utama](#folder-utama)
3. [Struktur App Directory](#struktur-app-directory)
4. [Struktur Components](#struktur-components)
5. [Struktur Library](#struktur-library)
6. [Struktur Types](#struktur-types)
7. [File & Konfigurasi](#file--konfigurasi)

---

## 📄 File Root

File-file yang berada di root directory project:

```
pp-alimam/
├── biome.json                      # Konfigurasi Biome (formatter & linter)
├── CONTEXT_HANDOVER.md             # Dokumentasi context handover
├── DOKUMENTASI-LENGKAP.md          # Dokumentasi lengkap project
├── konteks_proyek_updated.txt      # Konteks project terakhir
├── middleware.ts                   # Next.js middleware
├── NAVIGASI_BERANDA_UPDATE.md      # Update dokumentasi navigasi
├── next-env.d.ts                   # Next.js environment types
├── next.config.ts                  # Konfigurasi Next.js
├── package.json                    # Dependencies & scripts project
├── PERBAIKAN_SIDEBAR_COMPLETED.md  # Status perbaikan sidebar
├── PERBAIKAN_SIDEBAR_SUMMARY.md    # Summary perbaikan sidebar
├── PHASE2-IMPLEMENTATION.md        # Planning phase 2 implementation
├── pnpm-lock.yaml                  # Lock file untuk package manager
├── postcss.config.mjs              # Konfigurasi PostCSS
├── prisma.config.ts                # Konfigurasi Prisma
├── prisma.config.ts.backup         # Backup konfigurasi Prisma
├── progress_tracker_updated.txt    # Progress tracker
├── QUICK_REFERENCE.md              # Quick reference guide
├── README_PERBAIKAN_SIDEBAR.txt    # README perbaikan sidebar
├── README.md                       # README project utama
├── roadmap_updated.txt             # Roadmap project
├── struktur-project.txt            # Dokumentasi struktur project
├── TESTING_GUIDE.md                # Panduan testing
└── tsconfig.json                   # Konfigurasi TypeScript
```

---

## 📂 Folder Utama

### 🔹 `/prisma`
Database schema dan migration files

```
prisma/
└── schema.prisma       # Definisi database schema (Prisma ORM)
```

**Fungsi:** Mendefinisikan struktur database, relasi tabel, dan konfigurasi koneksi database.

---

### 🔹 `/public`
Static assets yang dapat diakses langsung

```
public/
├── favicon.ico         # Icon browser tab
├── file.svg            # SVG file asset
├── globe.svg           # Globe SVG
├── next.svg            # Next.js logo
├── vercel.svg          # Vercel logo
├── window.svg          # Window SVG
└── images/             # Folder untuk image assets
    ├── about.jpg       # Gambar About section
    ├── ekstra.jpg      # Gambar ekstrakulikuler
    ├── fasilitas.jpeg  # Gambar fasilitas
    ├── hero.jpg        # Gambar hero section
    ├── kitab.JPG       # Gambar kitab
    └── tahfiz.JPG      # Gambar tahfiz
```

**Fungsi:** Menyimpan file statis seperti logo, icon, dan gambar yang ditampilkan di frontend.

---

### 🔹 `/src`
Source code utama aplikasi

```
src/
├── app/                # Next.js App Router
├── components/         # React Components reusable
├── lib/                # Utility functions & helpers
└── types/              # TypeScript type definitions
```

---

## 📱 Struktur App Directory

### `/src/app` - Routes & Pages

#### Root Pages:
```
src/app/
├── favicon.ico                 # Favicon
├── globals.css                 # CSS global
├── layout.tsx                  # Root layout component
├── page.tsx                    # Homepage (/)
├── daftar/
│   └── page.tsx               # Halaman pendaftaran (/daftar)
├── daftar-sukses/
│   └── page.tsx               # Halaman sukses daftar (/daftar-sukses)
├── fasilitas/
│   └── page.tsx               # Halaman fasilitas (/fasilitas)
├── kegiatan/
│   └── page.tsx               # Halaman kegiatan (/kegiatan)
├── login/
│   └── page.tsx               # Halaman login (/login)
├── pilih-verifikasi/
│   └── page.tsx               # Pilih metode verifikasi (/pilih-verifikasi)
├── ppdb/
│   └── page.tsx               # Halaman PPDB (/ppdb)
├── send-otp/
│   └── page.tsx               # Halaman kirim OTP (/send-otp)
└── verifikasi-otp/
    └── page.tsx               # Halaman verifikasi OTP (/verifikasi-otp)
```

#### Admin Pages:
```
src/app/admin/
└── sms-dashboard/
    └── page.tsx               # Admin SMS dashboard
```

#### Dashboard Pages:
```
src/app/dashboard/
├── layout.tsx                 # Dashboard layout
├── page.tsx                   # Dashboard home page
└── pendaftar/
    ├── layout.tsx             # Pendaftar layout
    ├── page.tsx               # Pendaftar main page
    ├── backup/
    │   └── dashboard-old.tsx   # Backup dashboard lama
    ├── components/
    │   ├── DashboardTabs.tsx   # Component tabs dashboard
    │   ├── ProgressTracker.tsx # Component progress tracker
    │   └── tabs/               # Tab components
    │       ├── DaftarUlang.tsx
    │       ├── DataPendaftaran.tsx
    │       ├── DownloadBerkas.tsx
    │       ├── KelengkapanBerkas.tsx
    │       ├── PembayaranPendaftaran.tsx
    │       ├── Pengumuman.tsx
    │       ├── Profil.tsx
    │       ├── UndanganSeleksi.tsx
    │       └── UploadBerkas.tsx
    ├── daftar-ulang/
    │   └── page.tsx
    ├── download-berkas/
    │   └── page.tsx
    ├── kelengkapan-berkas/
    │   └── page.tsx
    ├── pembayaran-pendaftaran/
    │   └── page.tsx
    ├── pengumuman/
    │   └── page.tsx
    ├── profil/
    │   └── page.tsx
    ├── status/
    │   └── route.ts
    ├── status-pembayaran/
    │   └── page.tsx
    ├── undangan-seleksi/
    │   └── page.tsx
    └── upload-berkas/
        └── page.tsx
```

#### API Routes:
```
src/app/api/
├── admin/
│   ├── pending-sms/
│   │   └── route.ts           # Get pending SMS
│   └── verifikasi-manual/
│       └── page.tsx           # Manual verification page
├── auth/
│   ├── login/
│   │   └── route.ts           # Login endpoint
│   ├── logout/
│   │   └── route.ts           # Logout endpoint
│   ├── register/
│   │   ├── complete/
│   │   │   └── route.ts       # Complete registration
│   │   ├── send-otp/
│   │   │   └── route.ts       # Send OTP untuk register
│   │   └── verify-otp/
│   │       └── route.ts       # Verify OTP untuk register
│   └── session/
│       └── route.ts           # Get session info
├── dashboard/
│   └── pendaftar-data/
│       └── route.ts           # Get pendaftar data
├── dokumen/
│   ├── preview/
│   │   └── route.ts           # Preview document
│   └── status/
│       └── route.ts           # Get document status
├── pembayaran/
│   ├── manual/
│   │   └── upload/
│   │       └── route.ts       # Upload manual payment proof
│   ├── midtrans/
│   │   ├── callback/
│   │   │   └── route.ts       # Midtrans callback handler
│   │   └── create/
│   │       └── route.ts       # Create Midtrans transaction
│   └── status/
│       └── route.ts           # Get payment status
├── register/
│   ├── demo-direct/
│   │   └── route.ts           # Demo direct registration
│   └── send-otp/
│       └── route.ts           # Send OTP untuk register
├── upload/
│   └── dokumen/
│       └── route.ts           # Upload document
└── verifikasi/
    ├── generate/
    │   └── route.ts           # Generate verification
    ├── mark-sent/
    │   └── route.ts           # Mark verification as sent
    └── pending/
        └── route.ts           # Get pending verifications
```

---

## 🧩 Struktur Components

### `/src/components`

```
src/components/
├── auth/                       # Authentication components
│   ├── IdleTimeoutTracker.tsx # Track idle timeout
│   └── SessionMonitor.tsx     # Monitor user session
├── common/                     # Common/reusable components
│   └── BackToHomeButton.tsx   # Button back to home
├── cta/                        # Call-to-Action components
│   └── CTAButtons.tsx         # CTA button component
├── home/                       # Homepage components
│   ├── AboutSection.tsx       # Section "Tentang Kami"
│   ├── CalendarSection.tsx    # Section kalender/timeline
│   ├── ContactSection.tsx     # Section kontak
│   ├── FeaturesSection.tsx    # Section fitur
│   ├── GallerySection.tsx     # Section galeri
│   ├── HeroSection.tsx        # Hero section utama
│   └── TestimonialsSection.tsx # Section testimoni
├── layout/                     # Layout components
│   ├── Container.tsx          # Container wrapper
│   ├── Footer.tsx             # Footer component
│   ├── LayoutWrapper.tsx      # Layout wrapper
│   ├── Navbar.tsx             # Navbar/Header component
│   └── Section.tsx            # Section wrapper
└── ui/                         # UI components
    └── button.tsx             # Reusable button component
```

**Fungsi:** Menyimpan komponen React yang dapat digunakan kembali di berbagai halaman.

---

## 🛠️ Struktur Library (`/src/lib`)

### Utility & Helper Functions

```
src/lib/
├── access-control.ts          # Kontrol akses & permissions
├── auth.ts                    # Fungsi authentifikasi
├── prisma.ts                  # Prisma client singleton
├── utils.ts                   # Utility functions umum
├── notifications/
│   ├── multi-channel.ts       # Multi-channel notifications
│   ├── sms.ts                 # SMS notification handler
│   └── whatsapp.ts            # WhatsApp notification handler
├── storage/
│   ├── download.ts            # File download handler
│   └── upload.ts              # File upload handler
├── supabase/
│   ├── client.ts              # Supabase client (browser)
│   ├── index.ts               # Supabase index/export
│   └── server.ts              # Supabase server (backend)
├── utils/
│   ├── nomor-pendaftaran.ts   # Generate registration number
│   └── password.ts            # Password utilities (hash, verify)
├── validations/
│   └── registration.ts        # Registration form validation
├── verifications/
│   ├── multi-channel.ts       # Multi-channel verification
│   ├── sms.ts                 # SMS verification
│   └── whatsapp.ts            # WhatsApp verification
└── whatsapp/
    └── twilio.ts              # Twilio WhatsApp integration
```

**Fungsi:** Menyimpan fungsi-fungsi utility dan helper yang digunakan di seluruh aplikasi.

---

## 📝 Struktur Types (`/src/types`)

```
src/types/
├── database.ts                # Type definitions untuk database/models
└── registration.ts            # Type definitions untuk registration form
```

**Fungsi:** Menyimpan TypeScript interface dan type definitions yang digunakan di seluruh aplikasi.

---

## 📋 File & Konfigurasi

### Konfigurasi Project

| File | Fungsi |
|------|--------|
| `tsconfig.json` | Konfigurasi TypeScript compiler |
| `next.config.ts` | Konfigurasi Next.js (redirects, rewrites, etc) |
| `biome.json` | Konfigurasi Biome formatter & linter |
| `postcss.config.mjs` | Konfigurasi PostCSS (untuk Tailwind CSS) |
| `prisma/schema.prisma` | Definisi database schema |
| `middleware.ts` | Next.js middleware untuk request handling |
| `package.json` | Project dependencies & npm scripts |

---

## 🚀 Feature Mapping

### Fitur Utama:

| Fitur | File/Folder |
|-------|------------|
| **Pendaftaran (Registration)** | `/src/app/daftar`, `/src/app/api/auth/register/*` |
| **Login/Authentication** | `/src/app/login`, `/src/app/api/auth/login` |
| **Dashboard Pendaftar** | `/src/app/dashboard/pendaftar/*` |
| **OTP Verification** | `/src/app/verifikasi-otp`, `/src/app/api/auth/register/verify-otp` |
| **Upload Dokumen** | `/src/app/api/upload/dokumen`, Dashboard upload-berkas |
| **Pembayaran** | `/src/app/api/pembayaran/*` (Midtrans + Manual) |
| **Admin SMS Dashboard** | `/src/app/admin/sms-dashboard` |
| **Notifikasi (SMS/WhatsApp)** | `/src/lib/notifications/*`, `/src/lib/verifications/*` |
| **Storage (Supabase)** | `/src/lib/storage/*`, `/src/lib/supabase/*` |

---

## 📚 Database & Models

### Prisma Schema Locations:
- **Main Schema:** `prisma/schema.prisma`
- **Models/Types:** `/src/types/database.ts`

---

## 🔗 Relasi File Penting

```
Entry Point: package.json → next.config.ts → src/app/layout.tsx → src/app/page.tsx

Authentication Flow:
  src/app/login/page.tsx 
  → src/app/api/auth/login/route.ts 
  → src/lib/auth.ts
  → Prisma Database

Registration Flow:
  src/app/daftar/page.tsx 
  → src/app/api/auth/register/send-otp/route.ts
  → src/app/api/auth/register/verify-otp/route.ts
  → src/app/api/auth/register/complete/route.ts
  → src/lib/validations/registration.ts

Dashboard Flow:
  src/app/dashboard/pendaftar/page.tsx
  → src/app/dashboard/pendaftar/components/DashboardTabs.tsx
  → src/app/dashboard/pendaftar/components/tabs/*.tsx
```

---

## 📊 Ringkasan Struktur

```
Total Folders:
├── Utama: 4 (/prisma, /public, /src, node_modules)
├── App Routes: ~15+ page folders
├── API Routes: ~12+ route folders
├── Components: 5 categories (auth, common, cta, home, layout, ui)
├── Lib: 8+ utility folders
└── Types: 2 type definition files

Total Files:
├── Configuration: 7 files
├── Documentation: ~10 markdown/text files
├── Components: ~15 components
├── API Routes: ~20+ route files
├── Utilities: ~20+ utility functions
└── Types: 2 type files
```

---

## 🎯 Quick Navigation

**Untuk membuat fitur baru:**
1. Buat page di `/src/app/[feature]/`
2. Buat API route di `/src/app/api/[feature]/`
3. Buat components di `/src/components/[category]/`
4. Tambahkan types di `/src/types/`
5. Tambahkan utilities di `/src/lib/`

**Untuk debugging:**
- Authentication issues → Check `/src/lib/auth.ts` dan `/src/app/api/auth/*`
- Database issues → Check `/prisma/schema.prisma`
- Styling issues → Check `/src/app/globals.css` dan `/src/components/`
- Validation issues → Check `/src/lib/validations/`

---

**Generated:** January 30, 2026  
**Project:** PP-ALIMAM (PPDB Management System)  
**Framework:** Next.js 14+ with TypeScript
