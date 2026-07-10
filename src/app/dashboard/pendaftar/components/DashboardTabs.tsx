"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  User,
  CreditCard,
  ClipboardList,
  Upload,
  Calendar,
  Trophy,
  CheckCircle,
  Settings,
  Lock,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  canAccessTab,
  calculateProgressToUnlock,
  getUnlockMessage,
  TabName,
  StatusProses,
} from "@/lib/access-control";

interface DashboardTabsProps {
  statusProses: StatusProses;
}

export default function DashboardTabs({ statusProses }: DashboardTabsProps) {
  const pathname = usePathname();

  const tabs: { id: TabName; label: string; icon: any; href: string }[] = [
    {
      id: "data-pribadi",
      label: "Beranda",
      icon: User,
      href: "/dashboard/pendaftar",
    },
    {
      id: "pembayaran-pendaftaran",
      label: "Pembayaran",
      icon: CreditCard,
      href: "/dashboard/pendaftar/pembayaran-pendaftaran",
    },
    {
      id: "kelengkapan-berkas",
      label: "Isi Data",
      icon: ClipboardList,
      href: "/dashboard/pendaftar/isi-data-lengkap",
    },
    {
      id: "upload-berkas",
      label: "Upload",
      icon: Upload,
      href: "/dashboard/pendaftar/upload-berkas",
    },
    {
      id: "undangan-seleksi",
      label: "Ujian",
      icon: Calendar,
      href: "/dashboard/pendaftar/undangan-seleksi",
    },
    {
      id: "pengumuman",
      label: "Hasil",
      icon: Trophy,
      href: "/dashboard/pendaftar/pengumuman",
    },
    {
      id: "daftar-ulang",
      label: "Daftar Ulang",
      icon: CheckCircle,
      href: "/dashboard/pendaftar/daftar-ulang",
    },
    {
      id: "profil",
      label: "Profil",
      icon: Settings,
      href: "/dashboard/pendaftar/profil",
    },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-secondary-100 shadow-sm overflow-hidden rounded-b-[2rem]">
      <div className="max-w-7xl mx-auto flex items-center overflow-x-auto scrollbar-hide px-4 py-2 gap-2 sm:gap-4 no-scrollbar">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.id === "data-pribadi" && pathname === "/dashboard/pendaftar");
          const isAccessible = canAccessTab(tab.id, statusProses);
          const Icon = tab.icon;
          const progress = calculateProgressToUnlock(tab.id, statusProses);

          if (!isAccessible) {
            return (
              <div
                key={tab.id}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl text-ink-400 bg-surface-50 border border-transparent opacity-60 cursor-not-allowed group relative"
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest hidden sm:block">
                  {tab.label}
                </span>
                <Lock className="w-3 h-3 text-ink-300" />

                {/* Minimal tooltip on hover for mobile/desktop */}
                <div className="absolute top-full left-0 mt-2 p-2 bg-ink-900 text-white text-[8px] rounded shadow-xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 whitespace-nowrap">
                  {getUnlockMessage(tab.id)}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 relative group ${
                isActive
                  ? "bg-primary-900 text-white shadow-primary-200 shadow-lg scale-105"
                  : "text-ink-600 hover:bg-secondary-50 hover:text-primary-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 ${isActive ? "text-secondary-300" : ""}`}
              />
              <span
                className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isActive ? "block" : "hidden md:block"}`}
              >
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
