"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardEdit, CalendarPlus, CalendarClock } from "lucide-react";

export default function JadwalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [rescheduleCount, setRescheduleCount] = useState<number>(0);

  const fetchRescheduleCount = async () => {
    try {
      const res = await fetch("/api/admin/sidebar-counts");
      if (res.ok) {
        const data = await res.json();
        if (typeof data.pendingRescheduleCount === "number") {
          setRescheduleCount(data.pendingRescheduleCount);
        }
      }
    } catch {
      // silently handle
    }
  };

  useEffect(() => {
    fetchRescheduleCount();

    const handleRefresh = () => fetchRescheduleCount();
    window.addEventListener("sidebar-counts-refresh", handleRefresh);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("spmb-sidebar-badges");
        channel.onmessage = (event) => {
          if (event.data?.type === "refresh" || event.data?.type === "decrement") {
            fetchRescheduleCount();
          }
        };
      }
    } catch {}

    const interval = setInterval(fetchRescheduleCount, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("sidebar-counts-refresh", handleRefresh);
      if (channel) channel.close();
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-2 sm:p-3 border border-slate-100 flex gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar touch-pan-x overscroll-x-contain">
        <Link 
          href="/dashboard/admin/jadwal/monitoring"
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
            pathname.endsWith('/monitoring') 
              ? 'bg-primary-50 text-primary-700' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Monitoring Pelaksanaan
        </Link>
        <Link 
          href="/dashboard/admin/jadwal/monitoring-penguji"
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
            pathname.includes('/monitoring-penguji') 
              ? 'bg-primary-50 text-primary-700' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ClipboardEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Monitoring Penguji
        </Link>
        <Link 
          href="/dashboard/admin/jadwal/plotting"
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
            pathname.includes('/plotting') || pathname.includes('/input')
              ? 'bg-primary-50 text-primary-700 font-black' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <CalendarPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
          Plotting &amp; Sesi Ketersediaan
        </Link>
        <Link 
          href="/dashboard/admin/jadwal/reschedule"
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
            pathname.includes('/reschedule') 
              ? 'bg-primary-50 text-primary-700 font-black' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
          <span>Request Ubah Jadwal</span>
          {rescheduleCount > 0 && (
            <span
              className={`flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black shadow-sm ${
                pathname.includes('/reschedule')
                  ? 'bg-primary-700 text-white'
                  : 'bg-red-500 text-white animate-pulse'
              }`}
            >
              {rescheduleCount}
            </span>
          )}
        </Link>
      </div>
      {children}
    </div>
  );
}
