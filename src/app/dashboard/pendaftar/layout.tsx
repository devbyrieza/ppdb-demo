"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { User, CreditCard, FileCheck, Calendar, Trophy, CheckCircle, Settings, LogOut, Menu, X, Home, Lock, Loader2, Download, Upload, ClipboardList, ChevronRight, ShieldCheck, Bell, Search, Shirt, HandCoins, PartyPopper } from "lucide-react";
import { BRANDING } from "@/config/branding";
import Link from "next/link";
import IdleTimeoutTracker from "@/components/auth/IdleTimeoutTracker";
import {
  canAccessTab, canAccessSeragam, calculateProgressToUnlock, getUnlockMessage, formatStatusDisplay, getNextStep, STATUS_ORDER,
} from "@/lib/access-control";
import type { StatusProses, TabName } from "@/lib/access-control";
import DashboardTabs from "./components/DashboardTabs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusProses, setStatusProses] = useState<StatusProses>("draft");
  const [nomorPendaftaran, setNomorPendaftaran] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [tipePendaftaran, setTipePendaftaran] = useState("");
  const [loading, setLoading] = useState(true);
  const [seragamLengkap, setSeragamLengkap] = useState(true);
  const [welcomeDayDone, setWelcomeDayDone] = useState(true);
  const [pasFoto, setPasFoto] = useState("");

  const namaDepan = namaLengkap.split(" ")[0] || namaLengkap;
  const statusInfo = formatStatusDisplay(statusProses);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) throw new Error("Failed to get session");
        const sessionData = await sessionRes.json();
        const fallbackName = sessionData.session?.full_name || "Pendaftar";
        if (!sessionData.pendaftar_id) {
          setNamaLengkap(fallbackName);
          setStatusProses("draft");
          setLoading(false);
          return;
        }
        const statusRes = await fetch(`/api/pendaftar/status?pendaftar_id=${sessionData.pendaftar_id}&t=${Date.now()}`, { cache: "no-store" });
        if (!statusRes.ok) {
          setNamaLengkap(fallbackName);
          setLoading(false);
          return;
        }
        const userData = await statusRes.json();
        setStatusProses((userData.status_proses || "draft") as StatusProses);
        setNomorPendaftaran(userData.nomor_pendaftaran || "-");
        setNamaLengkap(userData.nama_lengkap || fallbackName);
        setTipePendaftaran(userData.tipe_pendaftaran || "");
        setSeragamLengkap(!!(userData.ukuran_seragam_baju && userData.ukuran_seragam_celana && userData.ukuran_seragam_almamater));
        if (userData.data_lengkap?.pas_foto) setPasFoto(userData.data_lengkap.pas_foto);
        try {
          const wdRes = await fetch(`/api/pendaftar/welcome-day?t=${Date.now()}`);
          if (wdRes.ok) {
            const wdData = await wdRes.json();
            setWelcomeDayDone(!!(wdData.success && wdData.data?.data_penginap));
          }
        } catch {}
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const menuItems = [
    { name: "Dashboard Utama", href: "/dashboard/pendaftar", tabName: "data-pribadi" as TabName, icon: Home, active: pathname === "/dashboard/pendaftar" },
    { name: "Pembayaran", href: "/dashboard/pendaftar/pembayaran-pendaftaran", tabName: "pembayaran-pendaftaran" as TabName, icon: CreditCard, active: pathname === "/dashboard/pendaftar/pembayaran-pendaftaran" },
    { name: "Isi Data Lengkap", href: "/dashboard/pendaftar/isi-data-lengkap", tabName: "kelengkapan-berkas" as TabName, icon: ClipboardList, active: pathname === "/dashboard/pendaftar/isi-data-lengkap" },
    { name: "Upload Berkas", href: "/dashboard/pendaftar/upload-berkas", tabName: "upload-berkas" as TabName, icon: Upload, active: pathname === "/dashboard/pendaftar/upload-berkas" },
    { name: "Jadwal Seleksi", href: "/dashboard/pendaftar/undangan-seleksi", tabName: "undangan-seleksi" as TabName, icon: Calendar, active: pathname === "/dashboard/pendaftar/undangan-seleksi" },
    { name: "Pengumuman", href: "/dashboard/pendaftar/pengumuman", tabName: "pengumuman" as TabName, icon: Trophy, active: pathname === "/dashboard/pendaftar/pengumuman" },
    { name: "Daftar Ulang", href: "/dashboard/pendaftar/daftar-ulang", tabName: "daftar-ulang" as TabName, icon: CheckCircle, active: pathname === "/dashboard/pendaftar/daftar-ulang" },
    { name: "Ukuran Seragam", href: "/dashboard/pendaftar/seragam", tabName: "ukuran-seragam" as TabName, icon: Shirt, active: pathname === "/dashboard/pendaftar/seragam" },
    { name: "Welcome Day", href: "/dashboard/pendaftar/welcome-day", tabName: "welcome-day" as TabName, icon: PartyPopper, active: pathname === "/dashboard/pendaftar/welcome-day" },
    { name: "Profil Akun", href: "/dashboard/pendaftar/profil", tabName: "profil" as TabName, icon: Settings, active: pathname === "/dashboard/pendaftar/profil" },
  ];

  const isTabAccessible = (tabName: TabName) => tabName === "ukuran-seragam" ? canAccessSeragam(statusProses, nomorPendaftaran) : canAccessTab(tabName, statusProses);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>;

  return (
    <div className="app-layout">
      <IdleTimeoutTracker />
      
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between" style={{ background: "var(--primary-dark)", color: "white" }}>
        <span className="font-bold">{BRANDING.schoolShortName}</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <h1>PPDB {BRANDING.schoolShortName}</h1>
          <p>Tahun 2026/2027</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Menu Utama</div>
          {menuItems.map((item) => {
            const isAccessible = isTabAccessible(item.tabName);
            const Icon = item.icon;

            const isSeragamMenu = item.tabName === "ukuran-seragam";
            const showSeragamBadge = isSeragamMenu && !seragamLengkap && ["accepted", "enrolled", "enrolled_full"].includes(statusProses);
            const isWelcomeDayMenu = item.tabName === "welcome-day";
            const showWelcomeDayBadge = isWelcomeDayMenu && !welcomeDayDone && ["accepted", "enrolled", "enrolled_full"].includes(statusProses);
            const showAnyBadge = showSeragamBadge || showWelcomeDayBadge;

            if (!isAccessible) {
              return (
                <div key={item.name} className="sidebar-link" style={{ opacity: 0.5, cursor: "not-allowed" }} onClick={() => alert(getUnlockMessage(item.tabName))}>
                  <Icon size={18} />
                  <span>{item.name}</span>
                  <Lock size={14} style={{ marginLeft: "auto" }} />
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-link ${item.active ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.name}</span>
                {showAnyBadge && <span className="badge bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">Isi!</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>
              {namaDepan.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{namaDepan}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{nomorPendaftaran}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", borderColor: "rgba(255,255,255,0.2)", color: "white" }}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      <main className="app-content">
        <div className="page-header">
          <div>
            <h1>Dashboard Pendaftar</h1>
            <p>Panel Utama Pendaftaran</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary-dark)" }}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <DashboardTabs statusProses={statusProses} />

          {!seragamLengkap && ["accepted", "enrolled", "enrolled_full"].includes(statusProses) && pathname !== "/dashboard/pendaftar/seragam" && (
            <div className="card" style={{ marginBottom: "16px", borderColor: "orange", background: "#fffaf0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Shirt size={24} color="orange" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: "#9a3412" }}>Data Ukuran Seragam Belum Diisi!</p>
                  <p style={{ fontSize: "13px", color: "#c2410c" }}>Harap segera isi ukuran seragam ananda.</p>
                </div>
                <Link href="/dashboard/pendaftar/seragam" className="btn btn-primary" style={{ background: "orange" }}>
                  Isi Sekarang
                </Link>
              </div>
            </div>
          )}

          {!welcomeDayDone && ["accepted", "enrolled", "enrolled_full"].includes(statusProses) && pathname !== "/dashboard/pendaftar/welcome-day" && (
            <div className="card" style={{ marginBottom: "16px", borderColor: "var(--primary)", background: "var(--primary-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Calendar size={24} color="var(--primary-dark)" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: "var(--primary-dark)" }}>Konfirmasi Welcome Day Belum Diisi!</p>
                  <p style={{ fontSize: "13px", color: "var(--primary-dark)" }}>Harap konfirmasi kehadiran Welcome Day.</p>
                </div>
                <Link href="/dashboard/pendaftar/welcome-day" className="btn btn-primary" style={{ background: "var(--primary-dark)" }}>
                  Konfirmasi
                </Link>
              </div>
            </div>
          )}

          {children}
        </div>
      </main>
      
      <style jsx>{`
        @media (max-width: 768px) {
          .app-content {
            padding-top: 56px;
          }
        }
      `}</style>
    </div>
  );
}
