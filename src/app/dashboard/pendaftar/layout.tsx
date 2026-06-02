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
  Shirt,
} from "lucide-react";
import { BRANDING } from "@/config/branding";
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
import DashboardTabs from "./components/DashboardTabs";

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
  const [tipePendaftaran, setTipePendaftaran] = useState("");
  const [loading, setLoading] = useState(true);

  // Extract first name for greeting
  const namaDepan = namaLengkap.split(" ")[0] || namaLengkap;

  // Get formatted status
  const statusInfo = formatStatusDisplay(statusProses);
  const nextStep = getNextStep(statusProses, tipePendaftaran);

  // Fetch user status dari database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // 1. Get session
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) {
          throw new Error(`Failed to get session: ${sessionRes.status}`);
        }

        const sessionData = await sessionRes.json();
        const fallbackName =
          sessionData.session?.full_name ||
          sessionData.session?.name ||
          sessionData.session?.email ||
          "Pendaftar";

        // 2. Validate pendaftar_id
        if (!sessionData.pendaftar_id) {
          console.warn("⚠️ [Layout] No pendaftar_id found in session");
          setNamaLengkap(fallbackName);
          setStatusProses("draft");
          setLoading(false);
          return;
        }

        // 3. Fetch current registration status (Force dynamic & No-cache)
        const statusRes = await fetch(
          `/api/pendaftar/status?pendaftar_id=${sessionData.pendaftar_id}&t=${Date.now()}`,
          { cache: "no-store" },
        );

        if (!statusRes.ok) {
          console.error("❌ [Layout] Status fetch failed:", statusRes.status);
          setNamaLengkap(fallbackName);
          setLoading(false);
          return;
        }

        const userData = await statusRes.json();

        // 4. Update state with fresh data
        const currentStatus = (userData.status_proses ||
          "draft") as StatusProses;
        console.log(`✅ [Layout] Current Status: ${currentStatus}`);

        setStatusProses(currentStatus);
        setNomorPendaftaran(userData.nomor_pendaftaran || "-");
        setNamaLengkap(userData.nama_lengkap || fallbackName);
        setTipePendaftaran(userData.tipe_pendaftaran || "");
      } catch (error: any) {
        console.error(
          "Error in Layout fetchUserData:",
          error?.message || error,
        );
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
      href: "/dashboard/pendaftar/isi-data-lengkap",
      tabName: "kelengkapan-berkas" as TabName,
      icon: ClipboardList,
      active: pathname === "/dashboard/pendaftar/isi-data-lengkap",
    },
    {
      name: "Upload Berkas",
      href: "/dashboard/pendaftar/upload-berkas",
      tabName: "upload-berkas" as TabName,
      icon: Upload,
      active: pathname === "/dashboard/pendaftar/upload-berkas",
    },

    {
      name: "Jadwal Seleksi",
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
      name: "Ukuran Seragam",
      href: "/dashboard/pendaftar/seragam",
      tabName: "ukuran-seragam" as TabName, // Menggunakan rules akses ukuran-seragam
      icon: Shirt,
      active: pathname === "/dashboard/pendaftar/seragam",
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
    // SPECIAL BYPASS FOR TESTING ACCOUNT: RIEZA TES
    if (nomorPendaftaran === "ILI2600007") return true;

    return canAccessTab(tabName, statusProses);
  };

  // NavLink component dengan conditional rendering
  const NavLink = ({ item }: { item: (typeof menuItems)[0] }) => {
    const isAccessible = isTabAccessible(item.tabName);
    const progressToUnlock = calculateProgressToUnlock(
      item.tabName,
      statusProses,
    );
    const unlockMessage = getUnlockMessage(item.tabName);

    if (!isAccessible) {
      return (
        <div className="px-3 py-1 group relative">
          <div className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-ink-400 bg-surface-50 border border-transparent cursor-not-allowed group-hover:border-surface-200 transition-all">
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="flex-1 truncate">{item.name}</span>
            <Lock className="w-4 h-4 text-ink-300 group-hover:text-ink-500 transition-colors" />
          </div>

          {/* Tooltip for locked state */}
          <div className="absolute left-14 top-full z-50 w-64 p-3 mt-2 text-xs text-white bg-ink-900 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 lg:left-full lg:top-0 lg:ml-2">
            <div className="font-bold mb-1 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-gold-400" />
              <span>Akses Terkunci</span>
            </div>
            <p className="text-ink-200 mb-2">{unlockMessage}</p>
            <div className="w-full h-1 bg-ink-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-500 rounded-full"
                style={{ width: `${progressToUnlock}%` }}
              />
            </div>
            <p className="text-right text-[10px] text-ink-300 mt-1">
              {progressToUnlock}% Selesai
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="px-3 py-1">
        <Link
          href={item.href}
          className={`group flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 ${
            item.active
              ? "bg-primary-900 text-white shadow-md border border-primary-800"
              : "text-ink-600 hover:bg-gold-100 hover:text-primary-900"
          }`}
        >
          <item.icon
            className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${item.active ? "text-gold-200" : "text-ink-400 group-hover:text-primary-700"}`}
          />
          <span className="flex-1 truncate">{item.name}</span>

          {item.active && <ChevronRight className="w-4 h-4 text-gold-200" />}
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
            <div className="absolute inset-0 border-4 border-gold-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary-700 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-6 h-6 text-primary-700" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-black uppercase text-primary-950 mb-2">
            Pondok Pesantren {BRANDING.schoolName}
          </h1>
          <p className="text-ink-500 text-sm">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <IdleTimeoutTracker />
      <div className="min-h-screen bg-surface-50 font-sans selection:bg-primary-100 selection:text-primary-900">
        {/* Mobile Header (Fintech Style) */}
        <div className="lg:hidden bg-white/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-gold-200 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-primary-950 hover:bg-gold-50 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <span
                className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-ink-400 mb-0.5"
                style={{ display: "none" }}
              >
                PPDB {BRANDING.schoolName}
              </span>
              <span className="text-sm sm:text-base font-black text-primary-950 leading-none">
                Portal Santri
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`hidden sm:block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-black border bg-opacity-10 ${statusInfo.color.replace("text-", "border-")} ${statusInfo.color}`}
            >
              {statusInfo.label}
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-linear-to-br from-primary-700 to-primary-900 flex items-center justify-center text-white text-sm font-black shadow-md border border-gold-100">
              {namaLengkap.charAt(0)}
            </div>
          </div>
        </div>

        <div className="flex relative">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-screen z-50">
            <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-clay-lg">
              {/* Brand */}
              <div className="px-6 pt-8 pb-6 border-b border-gold-100/50 mb-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md ring-4 ring-gold-50 overflow-hidden">
                    <img
                      src={BRANDING.logoPath}
                      alt="Logo"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div>
                    <h1 className="font-black text-xl text-primary-950 leading-none tracking-tight">
                      PPDB{" "}
                      <span className="text-primary-700">
                        {BRANDING.schoolName}
                      </span>
                    </h1>
                    <p className="text-[10px] text-ink-500 font-bold mt-1 uppercase tracking-widest">
                      Tahun 2026/2027
                    </p>
                  </div>
                </div>

                {/* User Card */}
                <div className="p-4 rounded-[1.5rem] bg-gold-50/50 border border-gold-100 relative overflow-hidden group app-card">
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <User className="w-20 h-20 text-primary-900 translate-x-4 -translate-y-4" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-ink-400 mb-1">
                    Pendaftar
                  </p>
                  <p className="font-black text-ink-950 text-base truncate mb-3">
                    {namaDepan}
                  </p>
                  <div className="text-[10px] text-ink-500 bg-white px-2.5 py-1.5 rounded-xl inline-flex shadow-sm border border-gold-100 items-center justify-between w-full">
                    <span className="font-bold uppercase">No. Registrasi</span>
                    <span className="font-mono text-primary-700 font-black">
                      {nomorPendaftaran}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 scrollbar-hide">
                <div className="px-3 mb-2">
                  <p className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                    Menu Utama
                  </p>
                </div>
                {menuItems.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-surface-100 bg-white/50 backdrop-blur-sm">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
                <p className="text-[10px] text-center text-ink-600 mt-4">
                  &copy; 2026 Ponpes {BRANDING.schoolName}
                </p>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          <div
            className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
          >
            <div
              className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div
              className={`absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
              {/* Mobile Sidebar Content */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-surface-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm overflow-hidden">
                      <img
                        src={BRANDING.logoPath}
                        alt="Logo"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <span className="font-black text-lg text-primary-950 tracking-tight">
                      PPDB {BRANDING.schoolName}
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-ink-400 hover:text-primary-700 bg-gold-50 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 bg-gold-50 border-b border-gold-100">
                  <p className="text-[10px] font-black text-ink-400 mb-1 uppercase tracking-widest">
                    Akun Pendaftar
                  </p>
                  <p className="font-black text-ink-950 text-lg mb-1">
                    {namaDepan}
                  </p>
                  <p className="font-mono text-xs font-bold text-primary-700 bg-white px-2 py-1 rounded-lg inline-block border border-gold-100">
                    {nomorPendaftaran}
                  </p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {menuItems.map((item) => (
                    <div
                      key={item.name}
                      onClick={() =>
                        isTabAccessible(item.tabName) && setSidebarOpen(false)
                      }
                    >
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
            <header className="hidden lg:flex sticky top-4 z-30 mx-8 mt-4 rounded-[1.5rem] bg-white/70 backdrop-blur-xl px-6 py-4 items-center justify-between shadow-sm border border-gold-100">
              <div>
                <h2 className="text-xl font-black text-primary-950 tracking-tight">
                  Dashboard Pendaftar
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-600">
                  Panel Utama Pendaftaran Khusus Pendaftar Baru
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="p-2 text-ink-400 hover:text-primary-700 bg-gold-50 hover:bg-gold-100 rounded-full transition-colors"
                  title="Ke Beranda Website"
                >
                  <Home className="w-5 h-5" />
                </Link>

                <div className="h-8 w-px bg-gold-200" />

                {/* Status Badge */}
                <div
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full border bg-white shadow-sm ${statusInfo.color.replace("text-", "border-")}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${statusInfo.color.split(" ")[1].replace("text-", "bg-")}`}
                  />
                  <span className="text-[10px] uppercase tracking-widest font-black">
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </header>

            {/* Content Wrapper */}
            <div className="flex-1 pt-14 lg:pt-12 max-w-6xl w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
              <DashboardTabs statusProses={statusProses} />
              <div className="p-4 md:p-6 lg:p-8">{children}</div>
            </div>

            {/* Mobile Bottom Navigation (Fintech Style) */}
            {!pathname.includes("/ujian/") && (
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gold-200 pb-safe z-40 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] rounded-t-[1.5rem]">
                <div className="flex justify-around items-center px-4 py-3">
                  <Link
                    href="/dashboard/pendaftar"
                    className="flex flex-col items-center p-2 group w-16"
                  >
                    <div
                      className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${pathname === "/dashboard/pendaftar" ? "bg-gold-100" : "bg-transparent group-hover:bg-gold-50"}`}
                    >
                      <Home
                        className={`w-5 h-5 transition-colors ${pathname === "/dashboard/pendaftar" ? "text-primary-700" : "text-ink-400 group-hover:text-primary-600"}`}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold text-center ${pathname === "/dashboard/pendaftar" ? "text-primary-800" : "text-ink-400"}`}
                    >
                      Beranda
                    </span>
                  </Link>

                  <Link
                    href="/dashboard/pendaftar/pembayaran-pendaftaran"
                    className="flex flex-col items-center p-2 group w-16"
                  >
                    <div
                      className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${pathname.includes("pembayaran") ? "bg-gold-100" : "bg-transparent group-hover:bg-gold-50"}`}
                    >
                      <CreditCard
                        className={`w-5 h-5 transition-colors ${pathname.includes("pembayaran") ? "text-primary-700" : "text-ink-400 group-hover:text-primary-600"}`}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold text-center ${pathname.includes("pembayaran") ? "text-primary-800" : "text-ink-400"}`}
                    >
                      Bayar
                    </span>
                  </Link>

                  <Link
                    href={canAccessTab("kelengkapan-berkas", statusProses) ? "/dashboard/pendaftar/isi-data-lengkap" : "#"}
                    onClick={(e) => {
                      if (!canAccessTab("kelengkapan-berkas", statusProses)) {
                        e.preventDefault();
                        alert(getUnlockMessage("kelengkapan-berkas"));
                      }
                    }}
                    className={`flex flex-col items-center p-2 group w-16 ${!canAccessTab("kelengkapan-berkas", statusProses) ? "opacity-60" : ""}`}
                  >
                    <div
                      className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${!canAccessTab("kelengkapan-berkas", statusProses) ? "bg-transparent" : pathname.includes("isi-data-lengkap") || pathname.includes("upload-berkas") ? "bg-gold-100" : "bg-transparent group-hover:bg-gold-50"}`}
                    >
                      {!canAccessTab("kelengkapan-berkas", statusProses) ? (
                        <Lock className="w-5 h-5 text-ink-400" />
                      ) : (
                        <ClipboardList
                          className={`w-5 h-5 transition-colors ${pathname.includes("isi-data-lengkap") || pathname.includes("upload-berkas") ? "text-primary-700" : "text-ink-400 group-hover:text-primary-600"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold text-center ${pathname.includes("isi-data-lengkap") || pathname.includes("upload-berkas") ? "text-primary-800" : "text-ink-400"}`}
                    >
                      Data
                    </span>
                  </Link>

                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex flex-col items-center p-2 group w-16"
                  >
                    <div className="w-10 h-8 rounded-full flex items-center justify-center mb-1 bg-transparent group-hover:bg-gold-50 transition-colors">
                      <Menu className="w-5 h-5 text-ink-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                    <span className="text-[10px] font-bold text-ink-600 text-center">
                      Menu
                    </span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
