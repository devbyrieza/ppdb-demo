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
  Home,
  Shield,
  Loader2,
  ChevronRight,
  UserCheck
} from "lucide-react";
import Link from "next/link";
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
        // Support both new session format (sessionData.session.full_name) and legacy format
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
      name: "Dashboard",
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

  const NavLink = ({ item }: { item: (typeof menuItems)[0] }) => {
    return (
      <div className="px-3 py-1">
        <Link
          href={item.href}
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${item.active
            ? "bg-maroon-600 text-white shadow-lg shadow-maroon-200"
            : "text-ink-600 hover:bg-maroon-50 hover:text-maroon-700"
            }`}
        >
          <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${item.active ? 'text-white' : 'text-ink-400 group-hover:text-maroon-600'}`} />
          <span className="flex-1 truncate">{item.name}</span>

          {item.active && (
            <ChevronRight className="w-4 h-4 text-maroon-200" />
          )}
        </Link>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full mx-4">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-cream-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-maroon-600 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-maroon-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-ink-950 mb-2">Memuat Panel Tim Seleksi</h2>
          <p className="text-cream-500 text-sm">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <IdleTimeoutTracker />
      <div className="min-h-screen bg-cream-50 font-sans selection:bg-maroon-100 selection:text-maroon-900">
        {/* Mobile Header (Fintech Style) */}
        <div className="lg:hidden bg-white/90 backdrop-blur-xl sticky top-0 z-40 px-5 py-4 flex items-center justify-between border-b border-cream-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest text-cream-500 mb-0.5">PPDB Al-Imam</span>
            <span className="text-base font-black text-ink-950 leading-none">Beranda</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-maroon-600 to-maroon-700 flex items-center justify-center text-white text-sm font-black shadow-md border-2 border-cream-100">
              {pengujiName.charAt(0)}
            </div>
          </div>
        </div>

        <div className="flex relative">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-screen z-50">
            <div className="flex flex-col h-full bg-white border-r border-cream-200 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
              {/* Brand */}
              <div className="px-6 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-maroon-600 to-maroon-700 flex items-center justify-center text-white shadow-lg shadow-maroon-200">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-black text-xl text-ink-950 leading-none tracking-tight">Panel <span className="text-maroon-600">Tim Seleksi</span></h1>
                    <p className="text-xs text-cream-500 font-medium mt-1">Seleksi PPDB</p>
                  </div>
                </div>

                {/* Penguji Info */}
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <UserCheck className="w-16 h-16 text-maroon-600" />
                  </div>
                  <p className="text-xs font-semibold text-cream-500 mb-1">Masuk sebagai,</p>
                  <p className="font-bold text-ink-950 truncate mb-2">{pengujiName}</p>
                  <div className="flex items-center gap-1 text-xs text-maroon-600 bg-maroon-50 px-2 py-1 rounded-lg inline-flex border border-maroon-100">
                    <Shield className="w-3 h-3" />
                    <span className="font-bold">Tim Seleksi</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 scrollbar-hide">
                <div className="px-3 mb-2">
                  <p className="text-xs font-bold text-ink-400 uppercase tracking-wider">Menu Utama</p>
                </div>
                {menuItems.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-cream-100 bg-cream-50">
                {availableRoles && availableRoles.length > 1 && (
                  <div className="mb-4">
                    <label className="text-xs font-bold text-cream-500 uppercase tracking-wider mb-2 block">Switch Role</label>
                    <select
                      value={userRole || ""}
                      onChange={handleRoleSwitch}
                      className="w-full bg-white border border-cream-200 text-sm text-ink-900 rounded-xl py-2 px-3 focus:ring-2 focus:ring-maroon-500/20 shadow-sm"
                    >
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>{ROLE_LABELS[role as UserRole] || role}</option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
            <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className={`absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-cream-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-maroon-600 flex items-center justify-center text-white">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-ink-950">Panel Tim Seleksi</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 text-ink-400 hover:text-ink-950">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {menuItems.map((item) => (
                    <div key={item.name} onClick={() => setSidebarOpen(false)}>
                      <NavLink item={item} />
                    </div>
                  ))}
                </nav>

                <div className="p-4 border-t border-cream-100">
                  {availableRoles && availableRoles.length > 1 && (
                    <div className="mb-4">
                      <label className="text-xs font-bold text-cream-500 mb-2 block">Switch Role</label>
                      <select
                        value={userRole || ""}
                        onChange={handleRoleSwitch}
                        className="w-full bg-cream-50 border border-cream-200 text-sm text-ink-900 rounded-xl py-3 px-3 focus:ring-2 focus:ring-maroon-500/20"
                      >
                        {availableRoles.map((role) => (
                          <option key={role} value={role}>{ROLE_LABELS[role as UserRole] || role}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" /> Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 lg:pl-72 w-full transition-all duration-300 flex flex-col min-h-screen relative pb-24 lg:pb-0">
            {/* Desktop Topbar */}
            <header className="hidden lg:flex sticky top-4 z-30 mx-8 mt-4 rounded-[1.5rem] bg-white/70 backdrop-blur-xl px-6 py-4 items-center justify-between shadow-sm border border-cream-200">
              <div>
                <h2 className="text-xl font-black text-ink-950 tracking-tight">Panel Tim Seleksi</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-cream-500">Penguji & Pewawancara - Seleksi PPDB</p>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/" className="p-2 text-ink-400 hover:text-maroon-600 bg-cream-50 hover:bg-cream-100 rounded-full transition-colors" title="Lihat Website">
                  <Home className="w-5 h-5" />
                </Link>

                <div className="h-8 w-px bg-cream-200" />

                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-maroon-50 border border-maroon-100 text-maroon-700 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-maroon-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Akses Penilai</span>
                </div>
              </div>
            </header>

            {/* Content Wrapper */}
            <div className="flex-1 pt-6 lg:pt-0 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>

            {/* Mobile Bottom Navigation (Fintech Style) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-200 pb-safe z-40 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] rounded-t-[1.5rem]">
              <div className="flex justify-around items-center px-4 py-3">
                <Link href="/dashboard/penguji" className="flex flex-col items-center p-2 group w-16">
                  <div className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${pathname === '/dashboard/penguji' ? 'bg-maroon-50' : 'bg-transparent group-hover:bg-cream-50'}`}>
                    <LayoutDashboard className={`w-5 h-5 transition-colors ${pathname === '/dashboard/penguji' ? 'text-maroon-700' : 'text-ink-400 group-hover:text-maroon-600'}`} />
                  </div>
                  <span className={`text-[10px] font-bold text-center ${pathname === '/dashboard/penguji' ? 'text-maroon-800' : 'text-ink-400'}`}>Beranda</span>
                </Link>
                
                <Link href="/dashboard/penguji/jadwal" className="flex flex-col items-center p-2 group w-16">
                  <div className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${pathname.includes('/jadwal') ? 'bg-maroon-50' : 'bg-transparent group-hover:bg-cream-50'}`}>
                    <Calendar className={`w-5 h-5 transition-colors ${pathname.includes('/jadwal') ? 'text-maroon-700' : 'text-ink-400 group-hover:text-maroon-600'}`} />
                  </div>
                  <span className={`text-[10px] font-bold text-center ${pathname.includes('/jadwal') ? 'text-maroon-800' : 'text-ink-400'}`}>Jadwal</span>
                </Link>

                <Link href="/dashboard/penguji/input-nilai" className="flex flex-col items-center p-2 group w-16">
                  <div className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${pathname.includes('/input-nilai') ? 'bg-maroon-50' : 'bg-transparent group-hover:bg-cream-50'}`}>
                    <ClipboardCheck className={`w-5 h-5 transition-colors ${pathname.includes('/input-nilai') ? 'text-maroon-700' : 'text-ink-400 group-hover:text-maroon-600'}`} />
                  </div>
                  <span className={`text-[10px] font-bold text-center ${pathname.includes('/input-nilai') ? 'text-maroon-800' : 'text-ink-400'}`}>Nilai</span>
                </Link>

                <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center p-2 group w-16">
                  <div className="w-10 h-8 rounded-full flex items-center justify-center mb-1 bg-transparent group-hover:bg-cream-50 transition-colors">
                    <Menu className="w-5 h-5 text-ink-400 group-hover:text-maroon-600 transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-ink-400 text-center">Menu</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
