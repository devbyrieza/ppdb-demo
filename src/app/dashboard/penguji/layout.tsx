"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  LogOut,
  Menu,
  X,
  Shield,
  Loader2,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  Search,
  ExternalLink,
  Home
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import IdleTimeoutTracker from "@/components/auth/IdleTimeoutTracker";
import { UserRole, ROLE_LABELS } from "@/lib/access-control";

export default function PengujiDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pengujiName, setPengujiName] = useState("Asatidz");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchPengujiData = async () => {
      try {
        setLoading(true);
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) throw new Error("Failed to get session");

        const sessionData = await sessionRes.json();
        const name =
          sessionData.session?.full_name ||
          sessionData.full_name ||
          sessionData.user?.user_metadata?.nama ||
          sessionData.user?.user_metadata?.full_name ||
          "Asatidz";
        setPengujiName(name);
        setUserId(sessionData.session?.id || "");
        setUserRole(sessionData.session?.role || "");
        setAvailableRoles(sessionData.availableRoles || []);
      } catch (error) {
        console.error("Error fetching penguji data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPengujiData();
  }, []);

  const menuItems = [
    {
      name: "Beranda",
      href: "/dashboard/penguji",
      icon: LayoutDashboard,
      active: pathname === "/dashboard/penguji",
    },
    {
      name: "Jadwal Ujian Saya",
      href: "/dashboard/penguji/jadwal",
      icon: Calendar,
      active: pathname === "/dashboard/penguji/jadwal",
    },
    {
      name: "Input Nilai",
      href: "/dashboard/penguji/input-nilai",
      icon: ClipboardCheck,
      active: pathname === "/dashboard/penguji/input-nilai",
    },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

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
      } else {
        alert(data.error || "Gagal berpindah role");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    }
  };

  const SidebarNav = () => (
    <nav className="space-y-1">
      {menuItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => setSidebarOpen(false)}
          className={`group flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
            item.active
              ? "bg-brand-blue-600 text-white shadow-lg shadow-brand-blue-200"
              : "text-ink-600 hover:bg-brand-blue-50 hover:text-brand-blue-700"
          }`}
        >
          <item.icon className={`w-5 h-5 mr-3 shrink-0 transition-colors ${item.active ? 'text-white' : 'text-ink-400 group-hover:text-brand-blue-600'}`} />
          <span className="flex-1 truncate tracking-tight">{item.name}</span>
          {item.active && <ChevronRight className="w-4 h-4 text-brand-blue-200" />}
        </Link>
      ))}
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-brand-blue-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-brand-blue-600 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-brand-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-black text-ink-950 mb-2">Ulul Albaab</h2>
          <p className="text-ink-500 text-sm font-medium animate-pulse">Menghubungkan ke sistem seleksi...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <IdleTimeoutTracker />
      <div className="min-h-screen bg-surface-50 font-sans selection:bg-brand-blue-100 selection:text-brand-blue-900">
        
        {/* Mobile Header - branding only */}
        <header 
          data-ui-version="2"
          className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-200 px-5 py-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-blue-600 to-brand-blue-700 flex items-center justify-center text-white text-sm font-black shadow-md">
            UA
          </div>
          <span className="font-black text-ink-950 tracking-tight leading-none text-base">Seleksi Panel</span>
        </header>

        <div className="flex relative">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-screen z-50 bg-white border-r border-surface-200 shadow-premium-sm transition-all duration-300">
            <div className="flex flex-col h-full">
              {/* Brand Header */}
              <div className="px-8 pt-10 pb-8 border-b border-surface-100 mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-blue-600 to-brand-blue-700 flex items-center justify-center text-white shadow-lg shadow-brand-blue-200">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-black text-xl text-ink-950 leading-none tracking-tight">Seleksi <span className="text-brand-blue-600">Panel</span></h1>
                    <p className="text-[10px] uppercase tracking-widest font-black text-brand-yellow-600 mt-1">Ulul Albaab</p>
                  </div>
                </div>
              </div>

              {/* User Info Card */}
              <div className="px-6 mb-8">
                <div className="p-5 rounded-[1.5rem] bg-surface-50 border border-surface-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                    <UserCheck className="w-16 h-16 text-brand-blue-600" />
                  </div>
                  <div className="relative z-10 flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-premium-sm flex items-center justify-center border border-surface-100 font-black text-brand-blue-700">
                       {pengujiName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-ink-950 text-sm truncate">{pengujiName}</p>
                      <span className="text-[10px] font-bold text-ink-400 capitalize">{userRole}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-brand-blue-700 bg-brand-blue-50 px-2.5 py-1 rounded-lg border border-brand-blue-100 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Aktif Sesi
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 px-6 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-black text-ink-300 uppercase tracking-[0.2em] mb-4 pl-1">Navigasi Utama</p>
                <SidebarNav />
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-surface-50 mt-auto">
                {availableRoles.length > 1 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2 pl-1">Ganti Role</p>
                    <select
                      value={userRole}
                      onChange={handleRoleSwitch}
                      className="w-full bg-surface-50 border border-surface-100 text-xs font-bold text-ink-900 rounded-xl py-2.5 px-3 focus:ring-4 focus:ring-brand-blue-500/10 focus:border-brand-blue-200 outline-none transition-all shadow-premium-sm"
                    >
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>{ROLE_LABELS[role as UserRole] || role}</option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                >
                  <LogOut className="w-5 h-5 mr-3 shrink-0 text-red-300 group-hover:text-red-500 transition-colors" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden fixed inset-0 z-[60] bg-ink-950/20 backdrop-blur-md"
                />
                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] z-[70] bg-white shadow-2xl flex flex-col p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-blue-600 to-brand-blue-700 flex items-center justify-center text-white shadow-md">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="font-black text-ink-950">Tim Seleksi</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-surface-100 rounded-xl">
                      <X className="w-5 h-5 text-ink-400" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="mb-5 p-3.5 rounded-2xl bg-surface-50 border border-surface-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center border border-surface-100 font-black text-brand-blue-700 text-sm shrink-0">
                      {pengujiName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-ink-950 text-sm truncate">{pengujiName}</p>
                      <span className="text-[10px] font-bold text-ink-400 capitalize">{userRole}</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <SidebarNav />
                  </div>

                  {/* Switch Role - hanya tampil untuk multi-role */}
                  {availableRoles.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-surface-100">
                      <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2 pl-1">Ganti Role</p>
                      <select
                        value={userRole}
                        onChange={handleRoleSwitch}
                        className="w-full bg-surface-50 border border-surface-100 text-xs font-bold text-ink-900 rounded-xl py-2.5 px-3 focus:ring-4 focus:ring-brand-blue-500/10 focus:border-brand-blue-200 outline-none transition-all shadow-sm"
                      >
                        {availableRoles.map((role) => (
                          <option key={role} value={role}>{ROLE_LABELS[role as UserRole] || role}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="mt-4 flex items-center w-full px-4 py-4 text-sm font-black text-red-600 bg-red-50 rounded-xl"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout Akun
                  </button>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Content */}
          <div className="flex-1 flex flex-col min-w-0 lg:ml-72 min-h-screen">
            {/* Topbar Desktop */}
            <header className="hidden lg:flex items-center justify-between h-24 px-10 sticky top-0 bg-surface-50/80 backdrop-blur-md z-30 shrink-0">
               <div className="flex-1 max-w-xl">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 group-focus-within:text-brand-blue-600 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Cari data pendaftar..." 
                      className="w-full bg-white border border-surface-200 focus:border-brand-blue-300 focus:ring-4 focus:ring-brand-blue-500/5 rounded-[1.25rem] py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all shadow-premium-sm"
                    />
                  </div>
               </div>

               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <Link href="/" target="_blank" className="p-3 text-ink-400 hover:text-brand-blue-600 bg-white hover:bg-brand-blue-50 border border-surface-100 rounded-full transition-all shadow-premium-sm">
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                    <div className="w-px h-6 bg-surface-200" />
                    <div className="flex items-center gap-3">
                       <div className="text-right hidden xl:block">
                          <p className="text-sm font-black text-ink-950 leading-none">{pengujiName}</p>
                          <p className="text-[10px] font-bold text-brand-blue-600 uppercase tracking-widest mt-1">Penguji Penilai</p>
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-blue-50 to-brand-blue-100 flex items-center justify-center border border-brand-blue-200 shadow-premium-sm text-brand-blue-700 font-black">
                          {pengujiName.charAt(0)}
                       </div>
                    </div>
                  </div>
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-6 lg:p-10">
              <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 px-2 py-3 z-40 flex items-center justify-around shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)] rounded-t-[2rem]">
               {menuItems.map((item) => (
                  <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 group py-1 min-w-[70px]">
                     <div className={`p-2 rounded-2xl transition-all ${item.active ? 'bg-brand-blue-600 text-white shadow-lg shadow-brand-blue-200' : 'text-ink-400 group-hover:bg-brand-blue-50'}`}>
                        <item.icon className="w-5 h-5" />
                     </div>
                     <span className={`text-[9px] font-black uppercase tracking-widest ${item.active ? 'text-brand-blue-700' : 'text-ink-400'}`}>{item.name}</span>
                  </Link>
               ))}
               <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center gap-1 group py-1 min-w-[70px]">
                  <div className="p-2 rounded-2xl text-ink-400 group-hover:bg-brand-blue-50 transition-all">
                    <Menu className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-ink-400">Menu</span>
               </button>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
