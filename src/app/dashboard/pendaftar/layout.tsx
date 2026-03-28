"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  User,
  CreditCard,
  FileCheck,
  Calendar,
  Trophy,
  CheckCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Lock,
  Loader2,
  Download,
  Upload,
  ClipboardList,
  ChevronRight,
  ShieldCheck,
  Bell,
  Search,
  School
} from "lucide-react";
import Link from "next/link";
import IdleTimeoutTracker from "@/components/auth/IdleTimeoutTracker";
import {
  canAccessTab,
  calculateProgressToUnlock,
  getUnlockMessage,
  formatStatusDisplay,
  getNextStep,
  STATUS_ORDER,
  type StatusProses,
  type TabName,
} from "@/lib/access-control";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusProses, setStatusProses] = useState<StatusProses>("draft");
  const [nomorPendaftaran, setNomorPendaftaran] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [loading, setLoading] = useState(true);

  // Extract first name for greeting
  const namaDepan = namaLengkap.split(' ')[0] || namaLengkap;

  // Get formatted status
  const statusInfo = formatStatusDisplay(statusProses);
  const nextStep = getNextStep(statusProses);

  // Fetch user status dari database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // 1. Get session
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) {
          const errorText = await sessionRes.text();
          throw new Error(`Failed to get session: ${sessionRes.status} - ${errorText}`);
        }

        const sessionData = await sessionRes.json();
        if (!sessionData.pendaftar_id) {
          console.warn("No pendaftar_id in session");
          // Still set basic info from session
          const fallbackName = sessionData.session?.full_name || sessionData.session?.name || sessionData.session?.email || "Pendaftar";
          setNamaLengkap(fallbackName);
          setLoading(false);
          return;
        }
        const fallbackName =
          sessionData.full_name || sessionData.name || sessionData.email || "Pendaftar";

        // 2. Get user status
        const statusRes = await fetch(
          `/api/pendaftar/status?pendaftar_id=${sessionData.pendaftar_id}`,
        );

        const statusText = await statusRes.text();

        if (!statusRes.ok) {
          console.error(`Status API failed: ${statusRes.status} - ${statusText}`);
          // Set what we have from session
          setNamaLengkap(fallbackName);
          setLoading(false);
          return;
        }

        const userData = JSON.parse(statusText);
        setStatusProses((userData.status_proses || "draft") as StatusProses);
        setNomorPendaftaran(userData.nomor_pendaftaran || "-");
        setNamaLengkap(userData.nama_lengkap || fallbackName);

      } catch (error: any) {
        console.error("Error fetching user data:", error?.message || error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const menuItems = [
    {
      name: "Dashboard Utama",
      href: "/dashboard/pendaftar",
      tabName: "data-pribadi" as TabName, // Tetap gunakan key internal yang sama jika diperlukan oleh access control
      icon: Home, // Ganti icon menjadi Home agar lebih sesuai
      active: pathname === "/dashboard/pendaftar",
    },
    {
      name: "Pembayaran",
      href: "/dashboard/pendaftar/pembayaran-pendaftaran",
      tabName: "pembayaran-pendaftaran" as TabName,
      icon: CreditCard,
      active: pathname === "/dashboard/pendaftar/pembayaran-pendaftaran",
    },
    {
      name: "Isi Data Lengkap",
      href: "/dashboard/pendaftar/kelengkapan-berkas",
      tabName: "kelengkapan-berkas" as TabName,
      icon: ClipboardList,
      active: pathname === "/dashboard/pendaftar/kelengkapan-berkas",
    },
    {
      name: "Upload Berkas",
      href: "/dashboard/pendaftar/upload-berkas",
      tabName: "upload-berkas" as TabName,
      icon: Upload,
      active: pathname === "/dashboard/pendaftar/upload-berkas",
    },

    {
      name: "Undangan Seleksi",
      href: "/dashboard/pendaftar/undangan-seleksi",
      tabName: "undangan-seleksi" as TabName,
      icon: Calendar,
      active: pathname === "/dashboard/pendaftar/undangan-seleksi",
    },
    {
      name: "Pengumuman",
      href: "/dashboard/pendaftar/pengumuman",
      tabName: "pengumuman" as TabName,
      icon: Trophy,
      active: pathname === "/dashboard/pendaftar/pengumuman",
    },
    {
      name: "Daftar Ulang",
      href: "/dashboard/pendaftar/daftar-ulang",
      tabName: "daftar-ulang" as TabName,
      icon: CheckCircle,
      active: pathname === "/dashboard/pendaftar/daftar-ulang",
    },
    {
      name: "Profil Akun",
      href: "/dashboard/pendaftar/profil",
      tabName: "profil" as TabName,
      icon: Settings,
      active: pathname === "/dashboard/pendaftar/profil",
    },
  ];

  // Function untuk cek apakah tab bisa diakses
  const isTabAccessible = (tabName: TabName) => {
    return canAccessTab(tabName, statusProses);
  };

  // NavLink component dengan conditional rendering
  const NavLink = ({ item }: { item: (typeof menuItems)[0] }) => {
    const isAccessible = isTabAccessible(item.tabName);
    const progressToUnlock = calculateProgressToUnlock(item.tabName, statusProses);
    const unlockMessage = getUnlockMessage(item.tabName);

    if (!isAccessible) {
      return (
        <div className="px-3 py-1 group relative">
          <div
            className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-ink-400 bg-surface-50 border border-transparent cursor-not-allowed group-hover:border-surface-200 transition-all"
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="flex-1 truncate">{item.name}</span>
            <Lock className="w-4 h-4 text-ink-300 group-hover:text-ink-500 transition-colors" />
          </div>

          {/* Tooltip for locked state */}
          <div className="absolute left-14 top-full z-50 w-64 p-3 mt-2 text-xs text-white bg-ink-900 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 lg:left-full lg:top-0 lg:ml-2">
            <div className="font-bold mb-1 flex items-center gap-2">
              <Lock className="w-3 h-3 text-gold-400" />
              <span>Akses Terkunci</span>
            </div>
            <p className="text-ink-300 mb-2">{unlockMessage}</p>
            <div className="w-full h-1 bg-ink-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-500 rounded-full"
                style={{ width: `${progressToUnlock}%` }}
              />
            </div>
            <p className="text-right text-[10px] text-ink-400 mt-1">{progressToUnlock}% Selesai</p>
          </div>
        </div>
      );
    }

    return (
      <div className="px-3 py-1">
        <Link
          href={item.href}
          className={`group flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 ${item.active
            ? "bg-maroon-900 text-white shadow-md border border-maroon-800"
            : "text-ink-600 hover:bg-cream-100 hover:text-maroon-900"
            }`}
        >
          <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${item.active ? 'text-cream-200' : 'text-ink-400 group-hover:text-maroon-700'}`} />
          <span className="flex-1 truncate">{item.name}</span>

          {item.active && (
            <ChevronRight className="w-4 h-4 text-cream-200" />
          )}
        </Link>
      </div>
    );
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-clay-lg text-center max-w-sm w-full mx-4">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-cream-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-maroon-700 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-6 h-6 text-maroon-700" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-ink-900 mb-2">Memuat Dashboard</h2>
          <p className="text-ink-500 text-sm">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <IdleTimeoutTracker />
      <div className="min-h-screen bg-surface-50 font-sans selection:bg-brown-100 selection:text-brown-900">

        {/* Mobile Header (Fintech Style) */}
        <div className="lg:hidden bg-white/90 backdrop-blur-xl sticky top-0 z-40 px-5 py-4 flex items-center justify-between border-b border-cream-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest text-ink-400 mb-0.5">PPDB Al-Andalus Al-Imam</span>
            <span className="text-base font-black text-maroon-950 leading-none">Beranda</span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-black border bg-opacity-10 ${statusInfo.color.replace('text-', 'border-')} ${statusInfo.color}`}>
              {statusInfo.label}
            </div>
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-maroon-700 to-maroon-900 flex items-center justify-center text-white text-sm font-black shadow-md border-2 border-cream-100">
              {namaLengkap.charAt(0)}
            </div>
          </div>
        </div>

        <div className="flex relative">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-screen z-50">
            <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-clay-lg">
              {/* Brand */}
              <div className="px-6 pt-8 pb-6 border-b border-cream-100/50 mb-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-maroon-700 to-maroon-900 flex items-center justify-center text-white shadow-md border border-maroon-800 ring-4 ring-cream-50">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-black text-xl text-maroon-950 leading-none tracking-tight">PPDB <span className="text-maroon-700">Al-Andalus Al-Imam</span></h1>
                    <p className="text-[10px] text-ink-500 font-bold mt-1 uppercase tracking-widest">Tahun 2026/2027</p>
                  </div>
                </div>

                {/* User Card */}
                <div className="p-4 rounded-[1.5rem] bg-cream-50/50 border border-cream-200 relative overflow-hidden group app-card">
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <User className="w-20 h-20 text-maroon-900 translate-x-4 -translate-y-4" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-ink-400 mb-1">Pendaftar</p>
                  <p className="font-black text-ink-950 text-base truncate mb-3">{namaDepan}</p>
                  <div className="text-[10px] text-ink-500 bg-white px-2.5 py-1.5 rounded-xl inline-flex shadow-sm border border-cream-200 items-center justify-between w-full">
                    <span className="font-bold uppercase">No. Registrasi</span>
                    <span className="font-mono text-maroon-700 font-black">{nomorPendaftaran}</span>
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
              <div className="p-4 border-t border-surface-100 bg-white/50 backdrop-blur-sm">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
                <p className="text-[10px] text-center text-ink-400 mt-4">
                  &copy; 2026 Ponpes Al-Andalus Al-Imam
                </p>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
            <div className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className={`absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
              {/* Mobile Sidebar Content */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-surface-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-maroon-800 flex items-center justify-center text-white">
                      <School className="w-5 h-5" />
                    </div>
                    <span className="font-black text-lg text-maroon-950 tracking-tight">PPDB Al-Andalus Al-Imam</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 text-ink-400 hover:text-maroon-700 bg-cream-50 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 bg-cream-50 border-b border-cream-100">
                  <p className="text-[10px] font-black text-ink-400 mb-1 uppercase tracking-widest">Akun Pendaftar</p>
                  <p className="font-black text-ink-950 text-lg mb-1">{namaDepan}</p>
                  <p className="font-mono text-xs font-bold text-maroon-700 bg-white px-2 py-1 rounded-lg inline-block border border-cream-200">{nomorPendaftaran}</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {menuItems.map((item) => (
                    <div key={item.name} onClick={() => isTabAccessible(item.tabName) && setSidebarOpen(false)}>
                      <NavLink item={item} />
                    </div>
                  ))}
                </nav>

                <div className="p-4 border-t border-surface-100">
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
            {/* Desktop Topbar - Glass Effect */}
            <header className="hidden lg:flex sticky top-4 z-30 mx-8 mt-4 rounded-[1.5rem] bg-white/70 backdrop-blur-xl px-6 py-4 items-center justify-between shadow-sm border border-cream-200">
              <div>
                <h2 className="text-xl font-black text-maroon-950 tracking-tight">Dashboard Pendaftar</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Panel Utama Pendaftaran Khusus Pendaftar Baru</p>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/" className="p-2 text-ink-400 hover:text-maroon-700 bg-cream-50 hover:bg-cream-100 rounded-full transition-colors" title="Ke Beranda Website">
                  <Home className="w-5 h-5" />
                </Link>

                <div className="h-8 w-px bg-cream-200" />

                {/* Status Badge */}
                <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border bg-white shadow-sm ${statusInfo.color.replace('text-', 'border-')}`}>
                  <div className={`w-2 h-2 rounded-full ${statusInfo.color.split(' ')[1].replace('text-', 'bg-')}`} />
                  <span className="text-[10px] uppercase tracking-widest font-black">{statusInfo.label}</span>
                </div>
              </div>
            </header>

            {/* Content Wrapper */}
            <div className="flex-1 pt-6 lg:pt-0 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
              {children}
            </div>
            
            {/* Mobile Bottom Navigation (Fintech Style) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-200 pb-safe z-40 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] rounded-t-[1.5rem]">
              <div className="flex justify-around items-center px-4 py-3">
                <Link href="/dashboard/pendaftar" className="flex flex-col items-center p-2 group w-16">
                  <div className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${pathname === '/dashboard/pendaftar' ? 'bg-cream-100' : 'bg-transparent group-hover:bg-cream-50'}`}>
                    <Home className={`w-5 h-5 transition-colors ${pathname === '/dashboard/pendaftar' ? 'text-maroon-700' : 'text-ink-400 group-hover:text-maroon-600'}`} />
                  </div>
                  <span className={`text-[10px] font-bold text-center ${pathname === '/dashboard/pendaftar' ? 'text-maroon-800' : 'text-ink-400'}`}>Beranda</span>
                </Link>
                
                <Link href="/dashboard/pendaftar/pembayaran-pendaftaran" className="flex flex-col items-center p-2 group w-16">
                  <div className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${pathname.includes('pembayaran') ? 'bg-cream-100' : 'bg-transparent group-hover:bg-cream-50'}`}>
                    <CreditCard className={`w-5 h-5 transition-colors ${pathname.includes('pembayaran') ? 'text-maroon-700' : 'text-ink-400 group-hover:text-maroon-600'}`} />
                  </div>
                  <span className={`text-[10px] font-bold text-center ${pathname.includes('pembayaran') ? 'text-maroon-800' : 'text-ink-400'}`}>Bayar</span>
                </Link>

                <Link href="/dashboard/pendaftar/kelengkapan-berkas" className="flex flex-col items-center p-2 group w-16">
                  <div className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${pathname.includes('kelengkapan-berkas') || pathname.includes('upload-berkas') ? 'bg-cream-100' : 'bg-transparent group-hover:bg-cream-50'}`}>
                    <ClipboardList className={`w-5 h-5 transition-colors ${pathname.includes('kelengkapan-berkas') || pathname.includes('upload-berkas') ? 'text-maroon-700' : 'text-ink-400 group-hover:text-maroon-600'}`} />
                  </div>
                  <span className={`text-[10px] font-bold text-center ${pathname.includes('kelengkapan-berkas') || pathname.includes('upload-berkas') ? 'text-maroon-800' : 'text-ink-400'}`}>Berkas</span>
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
