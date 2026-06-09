"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, ClipboardEdit } from "lucide-react";

export default function JadwalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100 flex gap-2 overflow-x-auto hide-scrollbar">
        <Link 
          href="/dashboard/admin/jadwal/monitoring"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            pathname.endsWith('/monitoring') 
              ? 'bg-primary-50 text-primary-700' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Monitoring Pelaksanaan
        </Link>
        <Link 
          href="/dashboard/admin/jadwal/monitoring-penguji"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            pathname.includes('/monitoring-penguji') 
              ? 'bg-primary-50 text-primary-700' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ClipboardEdit className="w-4 h-4" />
          Monitoring Penguji
        </Link>
        <Link 
          href="/dashboard/admin/jadwal/input"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            pathname.includes('/input') 
              ? 'bg-primary-50 text-primary-700' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Manajemen & Ketersediaan
        </Link>
      </div>
      {children}
    </div>
  );
}
