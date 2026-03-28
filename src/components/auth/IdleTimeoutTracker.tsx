// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IDLE TIMEOUT TRACKER 🚨
// Auto-logout setelah 30 menit tidak ada aktivitas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Path: src/components/auth/IdleTimeoutTracker.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";
import { AlertCircle, Clock } from "lucide-react";

// ============================================
// ⚙️ KONFIGURASI
// ============================================
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 menit dalam milliseconds
const WARNING_TIME = 2 * 60 * 1000; // Warning 2 menit sebelum logout
const CHECK_INTERVAL = 1000; // Check setiap 1 detik

// ============================================
// 🎯 EVENTS YANG DIANGGAP "AKTIVITAS"
// ============================================
const ACTIVITY_EVENTS = [
  "mousedown", // Klik mouse
  "mousemove", // Gerak mouse
  "keypress", // Tekan keyboard
  "scroll", // Scroll halaman
  "touchstart", // Touch di mobile
  "click", // Klik apapun
];

// ============================================
// 📦 COMPONENT
// ============================================
export default function IdleTimeoutTracker() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // 🔄 UPDATE LAST ACTIVITY TIME
  // ============================================
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    warningShownRef.current = false;
  };

  // ============================================
  // 🚪 HANDLE LOGOUT
  // ============================================
  const handleLogout = async () => {
    console.log("⏰ Idle timeout reached - logging out...");

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Logout
    await logoutUser();

    // Redirect dengan message
    router.push(
      "/login?timeout=true&message=Anda+telah+logout+otomatis+karena+tidak+ada+aktivitas+selama+30+menit"
    );
  };

  // ============================================
  // ⏰ CHECK IDLE TIME
  // ============================================
  useEffect(() => {
    // Set initial last activity
    lastActivityRef.current = Date.now();

    // Add event listeners untuk track activity
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    // Interval untuk check idle time
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;
      const remainingTime = IDLE_TIMEOUT - idleTime;

      // Show warning 2 menit sebelum logout
      if (remainingTime <= WARNING_TIME && !warningShownRef.current) {
        setShowWarning(true);
        warningShownRef.current = true;
        setTimeLeft(Math.ceil(remainingTime / 1000)); // Convert ke detik
      }

      // Update countdown di warning
      if (showWarning && remainingTime > 0) {
        setTimeLeft(Math.ceil(remainingTime / 1000));
      }

      // Logout jika sudah timeout
      if (idleTime >= IDLE_TIMEOUT) {
        handleLogout();
      }
    }, CHECK_INTERVAL);

    // Cleanup
    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [showWarning]);

  // ============================================
  // 🎨 RENDER WARNING MODAL
  // ============================================
  if (!showWarning) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" />

      {/* Warning Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeInUp">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-center text-[var(--color-text-900)] mb-2">
            Tidak Ada Aktivitas
          </h3>

          {/* Description */}
          <p className="text-center text-[var(--color-text-600)] mb-4">
            Anda akan logout otomatis dalam:
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-[var(--color-brown-600)]" />
            <span className="text-3xl md:text-4xl font-bold text-[var(--color-brown-700)]">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>

          {/* Info */}
          <p className="text-sm text-center text-[var(--color-text-500)] mb-6">
            Klik tombol di bawah atau lakukan aktivitas apapun untuk tetap login
          </p>

          {/* Button */}
          <button
            onClick={updateActivity}
            className="w-full py-3 px-6 bg-gradient-to-r from-[var(--color-brown-700)] to-[var(--color-brown-800)] hover:from-[var(--color-brown-800)] hover:to-[var(--color-brown-900)] text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Saya Masih Di Sini
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================
// 📖 CARA PAKAI:
// ============================================
//
// Di Layout Dashboard (src/app/dashboard/layout.tsx):
//
// import IdleTimeoutTracker from "@/components/auth/IdleTimeoutTracker";
//
// export default function DashboardLayout({ children }) {
//   return (
//     <>
//       <IdleTimeoutTracker />
//       {children}
//     </>
//   );
// }
//
// ============================================
// 🎯 CARA KERJA:
// ============================================
//
// 1. Track user activity (klik, scroll, keyboard)
// 2. Reset timer setiap ada aktivitas
// 3. Jika 28 menit tidak ada aktivitas:
//    → Tampilkan warning modal dengan countdown
// 4. Jika 30 menit tidak ada aktivitas:
//    → Auto logout + redirect ke login
// 5. User bisa klik "Saya Masih Di Sini" untuk reset timer
