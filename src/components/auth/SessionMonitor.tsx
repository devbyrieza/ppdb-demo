// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BONUS: SESSION MONITOR COMPONENT
// Tampilkan info session di dashboard (opsional)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Path: src/components/auth/SessionMonitor.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useEffect, useState } from "react";
import { Clock, Shield, CheckCircle, BookOpen, Palette, CheckCircle2 } from "lucide-react";
import {
  getSessionRemainingDays,
  formatSessionExpiry,
  isSessionExpiringSoon,
} from "@/lib/auth";

export default function SessionMonitor() {
  const [remainingDays, setRemainingDays] = useState<number>(0);
  const [expiryText, setExpiryText] = useState<string>("");
  const [expiringSoon, setExpiringSoon] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateSessionInfo = async () => {
      try {
        const days = await getSessionRemainingDays();
        const text = await formatSessionExpiry();
        const soon = await isSessionExpiringSoon();

        setRemainingDays(days);
        setExpiryText(text);
        setExpiringSoon(soon);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching session info:", error);
        setIsLoading(false);
      }
    };

    // Update immediately
    updateSessionInfo();

    // Update every 1 minute
    const interval = setInterval(updateSessionInfo, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
        expiringSoon
          ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
          : "bg-green-50 border border-green-200 text-green-700"
      }`}
    >
      {expiringSoon ? (
        <Clock className="w-4 h-4" />
      ) : (
        <CheckCircle className="w-4 h-4" />
      )}
      <span>{expiryText}</span>
      {!expiringSoon && <Shield className="w-4 h-4" />}
    </div>
  );
}

// ============================================
// <BookOpen className="w-4 h-4 inline-block mr-1" /> CARA PAKAI:
// ============================================
//
// Di Dashboard Header (src/app/dashboard/page.tsx):
//
// import SessionMonitor from "@/components/auth/SessionMonitor";
//
// <div className="flex items-center gap-4">
//   <SessionMonitor />
//   <button onClick={handleLogout}>Logout</button>
// </div>
//
// ============================================
// <Palette className="w-4 h-4 inline-block mr-1" /> TAMPILAN:
// ============================================
//
// <CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Session aman (> 1 hari):
// ┌──────────────────────────┐
// │ ✓ Sisa 5 hari 🛡️        │
// └──────────────────────────┘
// (Hijau)
//
// ⚠️ Session akan expired (< 1 hari):
// ┌──────────────────────────┐
// │ <Clock className="w-4 h-4 inline-block mr-1" /> Sisa 8 jam            │
// └──────────────────────────┘
// (Kuning)
