"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// ─── LIBRARIES ───
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

// ─── ICONS ───
import {
  LayoutDashboard,
  Users,
  FileCheck,
  CreditCard,
  Calendar,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  PanelLeft,
  FileText,
  Bell,
  BarChart,
  ClipboardEdit,
  UserCog,
  Landmark,
  Map,
  Zap,
  UserCircle,
  Edit3,
  Activity,
  PieChart,
  ChevronRight,
  Search,
  Shuffle,
  Shirt,
  Wallet,
} from "lucide-react";

// ─── CONFIG & UTILS ───
import {
  getMenuItemsForRole,
  UserRole,
  ROLE_LABELS,
} from "@/lib/access-control";
import { BRANDING } from "@/config/branding";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

/**
 * ICON_MAP
 * Memetakan string icon dari database/config ke komponen Lucide Icon yang sesungguhnya.
 * Memudahkan penambahan menu baru secara dinamis.
 */
const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Users,
  FileCheck,
  CreditCard,
  Calendar,
  Trophy,
  Settings,
  FileText,
  BarChart,
  ClipboardEdit,
  UserCog,
  Landmark,
  Map,
  Zap,
  UserCircle,
  Edit3,
  Activity,
  PieChart,
  Shuffle,
  Shirt,
  Wallet,
};

interface AdminSidebarProps {
  children: React.ReactNode;
  userRole: UserRole | null;
  adminName: string;
  userId?: string;
  availableRoles?: string[];
  unverifiedPaymentsCount?: number;
  unverifiedDocsCount?: number;
  pendingDataRequestsCount?: number;
}

/**
 * AdminSidebar Component
 * Komponen utama navigasi untuk panel administrasi.
 * Fitur: Responsif (Mobile/Desktop), Multi-role support, Dynamic Badges, & Premium UI.
 */
export default function AdminSidebar({
  children,
  userRole,
  adminName,
  userId,
  availableRoles,
  unverifiedPaymentsCount: initialPaymentsCount = 0,
  unverifiedDocsCount: initialDocsCount = 0,
  pendingDataRequestsCount: initialRequestsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // State Management: Mengontrol visibilitas sidebar di berbagai ukuran layar
  const [sidebarOpen, setSidebarOpen] = useState(false); // Khusus Mobile (Drawer)
  const [collapsed, setCollapsed] = useState(false); // Khusus Desktop (Slim Mode)

  // Local state for auto-refreshing badges
  const [paymentsCount, setPaymentsCount] = useState(initialPaymentsCount);
  const [docsCount, setDocsCount] = useState(initialDocsCount);
  const [requestsCount, setRequestsCount] = useState(initialRequestsCount);

  // Polling effect
  useEffect(() => {
    if (!userRole || userRole === "pendaftar") return;
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/sidebar-counts");
        if (res.ok) {
          const data = await res.json();
          setPaymentsCount(data.unverifiedPaymentsCount || 0);
          setDocsCount(data.unverifiedDocsCount || 0);
          setRequestsCount(data.pendingDataRequestsCount || 0);
        }
      } catch (error) {
        console.error("Failed to poll sidebar counts:", error);
      }
    };
    const interval = setInterval(fetchCounts, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [userRole]);

  /**
   * Logic: Mempersiapkan menu berdasarkan role user yang aktif.
   * Menambahkan properti 'badge' secara dinamis untuk indikasi tugas tertunda.
   */
  const rawMenuItems = userRole ? getMenuItemsForRole(userRole) : [];
  const menuItems = rawMenuItems.map((item) => {
    // Dynamic counts fetched in Server-Side Layout.tsx and passed here
    let badgeCount = 0;
    if (item.name === "Verifikasi Pembayaran") {
      badgeCount = paymentsCount;
    } else if (item.name === "Verifikasi Dokumen") {
      badgeCount = docsCount;
    } else if (item.name === "Perubahan Data" || item.name.includes("Perubahan") || item.name.includes("Edit")) {
      badgeCount = requestsCount;
    }

    return {
      ...item,
      icon: ICON_MAP[item.icon] || LayoutDashboard,
      isActive: pathname === item.href,
      badge: badgeCount,
    };
  });

  /**
   * handleLogout
   * Menampilkan konfirmasi gaya premium sebelum menghapus sesi user.
   */
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Keluar Sekarang?",
      text: "Anda akan diarahkan kembali ke halaman login.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#7c2d12", // Maroon 900
      cancelButtonColor: "#94a3b8", // Slate 400
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      background: "#ffffff",
      customClass: {
        title: "font-black text-primary-950",
        popup: "rounded-[2rem] border-4 border-primary-50",
      },
    });

    if (result.isConfirmed) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout process failed:", error);
      }
    }
  };

  /**
   * handleRoleSwitch
   * Memungkinkan admin dengan banyak role untuk berpindah akses tanpa login ulang.
   */
  const handleRoleSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    try {
      const res = await fetch("/api/auth/select-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: userId, chosen_role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.redirectTo;
      }
    } catch (error) {
      console.error("Role switching failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans selection:bg-primary-100 selection:text-primary-900">
      {/* ─── MOBILE HEADER (Hanya muncul di layar < 1024px) ─── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-2xl border-b border-ink-200/60 px-6 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 -ml-2 text-ink-600 hover:bg-ink-100 rounded-2xl transition-all active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-black text-primary-950 tracking-tighter text-lg italic uppercase">
            {BRANDING.schoolShortName}
          </span>
          <span className="text-[10px] font-bold text-primary-600/50 uppercase tracking-[0.2em] -mt-1">
            Control Center
          </span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary-700 to-primary-900 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-primary-200">
          {adminName.charAt(0)}
        </div>
      </div>

      {/* ─── MOBILE SIDEBAR OVERLAY (Drawer Mode) ─── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop: Efek blur saat sidebar mobile terbuka */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-[70] bg-primary-950/40 backdrop-blur-md lg:hidden overflow-y-auto overflow-x-hidden p-4"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-[80] w-80 bg-white shadow-2xl lg:hidden flex flex-col rounded-r-[3rem] overflow-hidden"
            >
              <div className="p-5 md:p-8 flex items-center justify-between border-b border-ink-50 bg-linear-to-b from-ink-50 to-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-clay-sm border border-ink-100">
                    <img
                      src={BRANDING.logoPath}
                      alt="Logo"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <span className="font-black text-primary-950 uppercase text-sm tracking-widest italic">
                    Navigation
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-3 hover:bg-red-50 rounded-2xl text-red-400 transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-6 space-y-2 no-scrollbar">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                      item.isActive
                        ? "bg-primary-700 text-white shadow-xl shadow-primary-200 font-bold"
                        : "text-ink-500 hover:bg-ink-50 hover:text-primary-900"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon
                        className={`w-5 h-5 ${item.isActive ? "text-white" : "text-ink-400"}`}
                      />
                      <span className="text-sm tracking-tight">
                        {item.name}
                      </span>
                    </div>
                    {item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.isActive ? "bg-white text-primary-700" : "bg-red-500 text-white"}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="p-5 md:p-8 border-t border-ink-50 space-y-3">
                {availableRoles && availableRoles.length > 1 && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <UserCircle className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <select
                      value={userRole || ""}
                      onChange={handleRoleSwitch}
                      className="w-full appearance-none bg-ink-50 border border-ink-100 text-[10px] font-black text-primary-900 uppercase tracking-widest pl-10 pr-8 py-3 rounded-xl cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/5 transition-all group-hover:bg-ink-100"
                    >
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role as UserRole] || role}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400 pointer-events-none group-hover:text-primary-900 transition-colors" />
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" /> Keluar Sistem
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── DESKTOP SIDEBAR (Premium Slim Design) ─── */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col bg-white border-r border-ink-100 transition-all duration-500 ease-in-out ${collapsed ? "w-24" : "w-72"}`}
      >
        {/* Logo & Branding Area */}
        <div className="h-24 flex items-center px-5 md:px-8">
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-4 overflow-hidden group"
          >
            <div className="shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-ink-100 shadow-xl group-hover:rotate-6 transition-all duration-500">
              <img
                src={BRANDING.logoPath}
                alt="Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="whitespace-nowrap"
              >
                <span className="font-black text-primary-950 text-lg uppercase tracking-tighter italic">
                  {BRANDING.schoolShortName}
                </span>
                <span className="block text-[10px] text-primary-600/40 font-black uppercase tracking-[0.2em] -mt-1">
                  ADMIN PORTAL
                </span>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation Links Area */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-8 no-scrollbar">
          {/* Role Selector (Integrated inside sidebar) */}
          {!collapsed && availableRoles && availableRoles.length > 1 && (
            <div className="px-2 mb-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <UserCircle className="w-3.5 h-3.5 text-primary-600" />
                </div>
                <select
                  value={userRole || ""}
                  onChange={handleRoleSwitch}
                  className="w-full appearance-none bg-ink-50 border border-ink-100 text-[10px] font-black text-primary-900 uppercase tracking-widest pl-10 pr-8 py-3 rounded-xl cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/5 transition-all group-hover:bg-ink-100"
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role as UserRole] || role}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400 pointer-events-none group-hover:text-primary-900 transition-colors" />
              </div>
            </div>
          )}

          <nav className="space-y-1.5">
            {menuItems.map((item, idx) => {
              const prevItem = menuItems[idx - 1];
              const showGroupLabel =
                !collapsed &&
                item.group &&
                (!prevItem || prevItem.group !== item.group);

              return (
                <div key={item.name} className="relative">
                  {/* Group Header (Hanya muncul saat expanded) */}
                  {showGroupLabel && (
                    <p className="px-5 text-[9px] font-black text-ink-400 uppercase tracking-[0.2em] mt-8 mb-3 opacity-60">
                      {item.group}
                    </p>
                  )}
                  <Link
                    href={item.href}
                    className={`relative group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                      item.isActive
                        ? "text-primary-950 font-black"
                        : "text-ink-500 hover:text-primary-900 hover:bg-ink-50"
                    }`}
                  >
                    {/* Active Background Animation: Menggunakan LayoutId untuk transisi antar item yang halus */}
                    {item.isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-primary-50 rounded-2xl -z-10 border border-primary-100 shadow-sm"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <div className="flex items-center gap-4">
                      <item.icon
                        className={`w-5 h-5 shrink-0 transition-all duration-300 ${item.isActive ? "text-primary-700 scale-110" : "text-ink-400 group-hover:text-primary-600"}`}
                      />
                      {!collapsed && (
                        <span className="text-[14px] tracking-tight">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {/* Notification Badge: Dinamis & Animatif */}
                    {item.badge > 0 && (
                      <div
                        className={`${collapsed ? "absolute -top-1 -right-1" : "relative"}`}
                      >
                        <span
                          className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black shadow-sm ${
                            item.isActive
                              ? "bg-primary-700 text-white"
                              : "bg-red-500 text-white animate-pulse"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                    )}

                    {/* Tooltip: Hanya muncul saat sidebar dikempiskan (Collapsed Mode) */}
                    {collapsed && (
                      <div className="absolute left-full ml-6 px-4 py-2 bg-primary-950 text-white text-[11px] font-black rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-2xl border border-white/10 uppercase tracking-widest">
                        {item.name}
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Section: Collapse Toggle & Profile */}
        <div className="p-6 border-t border-ink-50 bg-ink-50/30">
          {/* Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center justify-center p-3 rounded-xl text-ink-400 hover:text-primary-950 hover:bg-white hover:shadow-sm mb-4 transition-all duration-300 active:scale-95 ${collapsed ? "" : "gap-3"}`}
          >
            <PanelLeft
              className={`w-5 h-5 shrink-0 transition-transform duration-700 ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && (
              <span className="text-xs font-black uppercase tracking-widest">
                Collapse Menu
              </span>
            )}
          </button>

          {/* Profile Card */}
          <div
            className={`flex items-center gap-4 p-3 rounded-2xl transition-all group relative ${collapsed ? "justify-center" : "bg-white shadow-sm border border-ink-100"}`}
          >
            <div className="shrink-0 w-10 h-10 rounded-2xl bg-linear-to-br from-primary-700 to-primary-900 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-primary-100 ring-4 ring-white border border-primary-500/20">
              {adminName.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-primary-950 truncate leading-none mb-1 uppercase tracking-tighter italic">
                  {adminName}
                </p>
                <p className="text-[9px] text-primary-600/40 font-black truncate uppercase tracking-[0.15em]">
                  {userRole ? ROLE_LABELS[userRole] : "Admin"}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-2 text-ink-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main
        className={`flex-1 min-w-0 transition-all duration-500 ${collapsed ? "lg:pl-24" : "lg:pl-72"}`}
      >
        {/* Top Desktop Navigation (Floating Navbar) */}
        <header className="hidden lg:flex sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-ink-100 h-24 items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-10">
            {/* Breadcrumbs: Memandu user posisi saat ini */}
            <div className="flex items-center gap-3 text-[11px] font-black text-ink-400 uppercase tracking-widest">
              <Link
                href="/dashboard/admin"
                className="hover:text-primary-700 transition-colors"
              >
                Admin Portal
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-ink-300" />
              <span className="text-primary-950 italic">Ikhtisar Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-ink-100" />
            <button className="relative p-3 text-ink-400 hover:text-primary-700 hover:bg-primary-50 rounded-2xl transition-all active:scale-95">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
            </button>
            <Link
              href="/"
              className="px-5 md:px-8 py-3.5 bg-primary-950 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-800 transition-all shadow-xl shadow-primary-950/20 active:scale-95"
            >
              Kunjungi Situs
            </Link>
          </div>
        </header>

        {/* Main Page Content: Area di mana halaman Dashboard sebenarnya dirender */}
        <div className="p-6 md:p-8 pt-24 lg:pt-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

