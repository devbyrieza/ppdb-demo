// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD LAYOUT - WITH IDLE TIMEOUT TRACKER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Path: src/app/dashboard/layout.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import IdleTimeoutTracker from "@/components/auth/IdleTimeoutTracker";
import ForceChangePassword from "@/components/auth/ForceChangePassword";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");
  let isDefaultPassword = false;

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (
        session.is_default_password &&
        !["pendaftar", "santri", "wali_santri"].includes(session.role)
      ) {
        isDefaultPassword = true;
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <>
      {/* 🚨 Idle Timeout Tracker - Auto logout setelah 24 jam */}
      <IdleTimeoutTracker />
      <ForceChangePassword isDefaultPassword={isDefaultPassword} />

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
// 2. Jika 24 jam tidak ada aktivitas:
//    - Tampilkan warning modal (5 menit sebelum logout)
//    - Auto logout setelah 24 jam
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
