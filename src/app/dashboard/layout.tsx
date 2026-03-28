// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD LAYOUT - WITH IDLE TIMEOUT TRACKER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Path: src/app/dashboard/layout.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import IdleTimeoutTracker from "@/components/auth/IdleTimeoutTracker";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 🚨 Idle Timeout Tracker - Auto logout setelah 30 menit */}
      <IdleTimeoutTracker />

      {/* Dashboard Content */}
      {children}
    </>
  );
}

// ============================================
// 📖 CATATAN:
// ============================================
//
// 1. IdleTimeoutTracker akan otomatis track user activity
// 2. Jika 30 menit tidak ada aktivitas:
//    - Tampilkan warning modal (2 menit sebelum logout)
//    - Auto logout setelah 30 menit
// 3. User bisa klik "Saya Masih Di Sini" untuk reset timer
//
// ============================================
// 🎯 AKTIVITAS YANG DI-TRACK:
// ============================================
//
// ✅ Klik mouse
// ✅ Gerak mouse
// ✅ Tekan keyboard
// ✅ Scroll halaman
// ✅ Touch di mobile
//
// ❌ Buka tab lain (tidak dihitung aktivitas)
// ❌ Minimize browser (tidak dihitung aktivitas)
