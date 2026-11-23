"use client";

import { Building2, Settings, Users, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRANDING } from "@/config/branding";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 print:hidden overscroll-contain">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gold-500" />
            Portal Staf
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">{BRANDING.schoolName}</p>
        </div>
        
        <nav className="p-4 space-y-2 custom-scrollbar overscroll-contain">
          <Link 
            href="/admin/kartu-jajan" 
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${pathname.includes('kartu-jajan') ? 'bg-gold-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Printer className="w-5 h-5" />
            Cetak Kartu Jajan
          </Link>
          
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all mt-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Portal
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
