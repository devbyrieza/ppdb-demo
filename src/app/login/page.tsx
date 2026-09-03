// src/app/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  IdCard,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  Sparkles,
  School,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  FileText,
  ChevronRight,
  Layers,
  Crown,
  FolderCheck,
  Wallet,
  Mic,
  UserCheck,
  BookOpen,
  Award,
  MessageSquare,
  Settings,
  Key
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, AnimatePresence } from "framer-motion";
import { BRANDING } from "@/config/branding";
import DemoLoginHelper from "@/components/auth/DemoLoginHelper";

// Role label & icon map
const ROLE_INFO: Record<
  string,
  { label: string; icon: React.ElementType; desc: string; color: string }
> = {
  admin_super: {
    label: "Admin Super",
    icon: Crown,
    desc: "Akses penuh semua fitur",
    color: "from-secondary-50 to-yellow-50 border-secondary-200"
  },
  admin_berkas: {
    label: "Admin Berkas",
    icon: FolderCheck,
    desc: "Verifikasi dokumen pendaftar",
    color: "from-primary-50 to-indigo-50 border-primary-200"
  },
  admin_keuangan: {
    label: "Admin Keuangan",
    icon: Wallet,
    desc: "Verifikasi pembayaran",
    color: "from-emerald-50 to-primary-50 border-emerald-200"
  },
  pewawancara_cawalsan: {
    label: "Pewawancara Cawalsan",
    icon: Mic,
    desc: "Wawancara calon orangtua/wali santri",
    color: "from-purple-50 to-violet-50 border-purple-200"
  },
  pewawancara_calsan: {
    label: "Pewawancara Calon Santri",
    icon: UserCheck,
    desc: "Wawancara calon santri",
    color: "from-rose-50 to-pink-50 border-rose-200"
  },
  penguji: {
    label: "Penguji Al-Qur'an",
    icon: BookOpen,
    desc: "Penguji tes Al-Qur'an",
    color: "from-green-50 to-lime-50 border-green-200"
  },
  penguji_hafalan: {
    label: "Penguji Hafalan",
    icon: Award,
    desc: "Penguji tes Hafalan Al-Qur'an",
    color: "from-teal-50 to-emerald-50 border-teal-200"
  },
  penguji_bahasa_arab: {
    label: "Penguji Lisan B. Arab",
    icon: MessageSquare,
    desc: "Penguji tes Lisan Bahasa Arab",
    color: "from-sky-50 to-blue-50 border-sky-200"
  },
  admin: {
    label: "Admin",
    icon: Settings,
    desc: "Panel administrasi",
    color: "from-orange-50 to-secondary-50 border-orange-200"
  }
};

export default function LoginPage() {
  // Flush legacy cookies on mount
  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<"pendaftar" | "admin">("pendaftar");

  // Pendaftar login state
  const [nikPendaftar, setNikPendaftar] = useState("");
  const [nomorPendaftaran, setNomorPendaftaran] = useState("");

  // Admin/Penguji login state
  const [emailAdmin, setEmailAdmin] = useState("");
  const [passwordAdmin, setPasswordAdmin] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Multi-role selection state
  const [roleSelectionData, setRoleSelectionData] = useState<{
    profile_id: string;
    full_name: string;
    available_roles: string[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [selectingRole, setSelectingRole] = useState(false);
  const [error, setError] = useState("");

  // Mandatory UX Rule: Modal Scroll Lock
  useEffect(() => {
    if (roleSelectionData) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [roleSelectionData]);

  // Handle Login Pendaftar
  const handleLoginPendaftar = async (
    e?: React.FormEvent,
    manualNik?: string,
    manualNomor?: string
  ) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    const nik = manualNik || nikPendaftar;
    const nomor = manualNomor || nomorPendaftaran;

    if (!nomor || !nik) {
      setError("Nomor Pendaftaran dan NIK wajib diisi");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_type: "pendaftar",
          nomor_pendaftaran: nomor,
          nik: nik
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login gagal");

      window.location.href = "/dashboard/pendaftar";
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat login");
      setIsLoading(false);
    }
  };

  // Handle Login Admin / Penguji
  const handleLoginAdmin = async (
    e?: React.FormEvent,
    manualEmail?: string,
    manualPass?: string,
    chosenRole?: string
  ) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    const email = manualEmail || emailAdmin;
    const pass = manualPass || passwordAdmin;

    if (!email || !pass) {
      setError("Username / Email dan Password wajib diisi");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_type: "admin",
          email: email,
          password: pass,
          chosen_role: chosenRole
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login gagal");

      setIsLoading(false);

      if (data.requires_role_selection) {
        setRoleSelectionData({
          profile_id: data.profile_id,
          full_name: data.full_name,
          available_roles: data.available_roles
        });
        return;
      }

      const userRole = data.role.toLowerCase();
      if (
        ["admin", "admin_super", "admin_berkas", "admin_keuangan"].includes(userRole)
      ) {
        window.location.href = "/dashboard/admin";
      } else if (
        [
          "penguji",
          "pewawancara_calsan",
          "pewawancara_cawalsan",
          "penguji_quran",
          "penguji_calsan",
          "penguji_cawalsan"
        ].includes(userRole)
      ) {
        window.location.href = "/dashboard/penguji";
      } else {
        throw new Error(`Role tidak dikenali: ${data.role}`);
      }
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat login");
      setIsLoading(false);
    }
  };

  // Handle role selection
  const handleSelectRole = async (chosenRole: string) => {
    if (!roleSelectionData) return;
    setSelectingRole(true);
    setError("");
    try {
      const res = await fetch("/api/auth/select-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: roleSelectionData.profile_id,
          chosen_role: chosenRole
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memilih role");
      window.location.href = data.redirectTo;
    } catch (err: any) {
      setError(err.message);
      setSelectingRole(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-white flex flex-col items-center justify-center p-4 sm:p-6 py-10 sm:py-16 relative overflow-hidden font-sans">
      
      {/* Background Micro Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMGwwIDYwIi8+PC9nPjwvc3ZnPg==')] opacity-70 pointer-events-none" />

      {/* TOP NAVIGATION PILLS (OMI STANDARD) */}
      <div className="w-full max-w-[500px] flex items-center justify-between gap-3 mb-4 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-[#1E3A8A] hover:border-[#1E3A8A]/40 transition-all hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Portal SPMB 2027/2028</span>
        </div>
      </div>

      {/* TWO-SECTION OMI LOGIN CARD (PLATINUM DIAMOND STANDARD) */}
      <div className="w-full max-w-[500px] rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/10 border border-slate-200 bg-white relative z-10">
        
        {/* SECTION 1: ROYAL NAVY BLUE GRADIENT HEADER */}
        <div className="bg-gradient-to-br from-[#0B1528] via-[#1E3A8A] to-[#1D4ED8] p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-2xl shadow-sm">
              <img
                src={BRANDING.logoPath}
                alt={"Logo " + BRANDING.schoolName}
                className="w-7 h-7 object-contain"
              />
              <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                {BRANDING.schoolShortName}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/15 inline-block mb-2">
                Penerimaan Santri Baru 2027/2028
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Masuk Portal SPMB Al-Andalus
              </h2>
              <p className="text-xs sm:text-sm text-slate-200/90 font-normal mt-1 leading-relaxed">
                Silakan masukkan NIK / No. Pendaftaran calon santri atau kredensial akun staf Anda.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: WHITE FORM BODY */}
        <div className="p-6 sm:p-8 bg-white space-y-6">
          
          {/* Tab Switcher (Calon Santri vs Portal Staf) */}
          {!roleSelectionData && (
            <div className="bg-slate-100 p-1.5 rounded-2xl flex relative border border-slate-200/80">
              <motion.div
                layoutId="auth-tab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                className={`absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-sm border border-slate-200/50 ${
                  activeTab === "pendaftar"
                    ? "left-1.5 w-[calc(50%-6px)]"
                    : "left-[calc(50%+3px)] w-[calc(50%-6px)]"
                }`}
              />

              <button
                type="button"
                onClick={() => {
                  setActiveTab("pendaftar");
                  setError("");
                }}
                className={`flex-1 relative z-10 py-2.5 text-xs font-extrabold uppercase tracking-wider text-center rounded-xl transition-colors ${
                  activeTab === "pendaftar" ? "text-[#1E3A8A]" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Calon Santri
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("admin");
                  setError("");
                }}
                className={`flex-1 relative z-10 py-2.5 text-xs font-extrabold uppercase tracking-wider text-center rounded-xl transition-colors ${
                  activeTab === "admin" ? "text-[#1E3A8A]" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Portal Staf
              </button>
            </div>
          )}

          {/* Error Alert */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 overflow-hidden text-xs text-red-700 font-bold"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <div>
            {roleSelectionData ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-blue-50 text-[#1E3A8A] rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold border border-blue-100">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Ahlan, {roleSelectionData.full_name.split(" ")[0]}!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih peran yang ingin Anda gunakan:
                  </p>
                </div>

                <div className="space-y-2">
                  {roleSelectionData.available_roles.map((role) => {
                    const info = ROLE_INFO[role] || {
                      label: role,
                      icon: Key,
                      desc: "",
                      color: "from-slate-50 to-gray-50 border-slate-200"
                    };
                    const IconComponent = info.icon;
                    return (
                      <button
                        key={role}
                        onClick={() => handleSelectRole(role)}
                        disabled={selectingRole}
                        className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-[#1E3A8A] hover:bg-blue-50/50 transition-all flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center border border-blue-100">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#1E3A8A]">
                              {info.label}
                            </h4>
                            {info.desc && (
                              <p className="text-[11px] text-slate-500 font-normal">
                                {info.desc}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectingRole ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setRoleSelectionData(null);
                    setError("");
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-bold pt-1"
                >
                  Gunakan Akun Lain
                </button>
              </div>
            ) : activeTab === "pendaftar" ? (
              <form onSubmit={(e) => handleLoginPendaftar(e)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>Nomor Pendaftaran</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      disabled={isLoading}
                      value={nomorPendaftaran}
                      onChange={(e) => setNomorPendaftaran(e.target.value.toUpperCase())}
                      placeholder="Contoh: SPA2700001, SPI2700001"
                      className="w-full h-12 pl-4 pr-10 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
                    />
                    <FileText className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>NIK Calon Santri</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={16}
                      required
                      disabled={isLoading}
                      value={nikPendaftar}
                      onChange={(e) => setNikPendaftar(e.target.value.replace(/\D/g, ""))}
                      placeholder="16 Digit NIK Sesuai Kartu Keluarga"
                      className="w-full h-12 pl-4 pr-10 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
                    />
                    <IdCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Data...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard Santri</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Belum punya nomor pendaftaran?
                  </p>
                  <Link
                    href="/daftar"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1E3A8A] hover:underline"
                  >
                    <span>Daftar Santri Baru Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={(e) => handleLoginAdmin(e)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>Username / Email / No. WA</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      disabled={isLoading}
                      value={emailAdmin}
                      onChange={(e) => setEmailAdmin(e.target.value)}
                      placeholder="Username / Email / No. WA"
                      className="w-full h-12 pl-4 pr-10 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>Kata Sandi Staf</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      value={passwordAdmin}
                      onChange={(e) => setPasswordAdmin(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full h-12 pl-4 pr-11 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-extrabold text-sm shadow-md shadow-[#1E3A8A]/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Staf...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk Portal Panitia &amp; Penguji</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-2.5 text-xs text-[#1E3A8A] font-medium">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Lupa kata sandi? Hubungi Administrator Utama untuk reset akses.</span>
                </div>
              </form>
            )}
          </div>

          {/* Quick Demo Login Helper for Presentations */}
          <div className="pt-2 border-t border-slate-100">
            <DemoLoginHelper
              onSelect={(val1, val2, type, val3) => {
                setError("");
                if (type === "admin") {
                  setActiveTab("admin");
                  setEmailAdmin(val1);
                  setPasswordAdmin(val2);
                  setTimeout(() => handleLoginAdmin(undefined, val1, val2, val3), 300);
                } else {
                  setActiveTab("pendaftar");
                  setNikPendaftar(val1);
                  setNomorPendaftaran(val2);
                  setTimeout(() => handleLoginPendaftar(undefined, val1, val2), 300);
                }
              }}
            />
          </div>

          {/* Encrypted SSL Footer */}
          <div className="pt-2 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Koneksi Aman Terenkripsi SSL 256-Bit</span>
            </div>
          </div>

        </div>

      </div>

      <p className="text-center text-xs text-slate-400 mt-6 font-medium">
        &copy; 2026 {BRANDING.schoolLegalName} &bull; SPMB v2.0
      </p>

    </main>
  );
}
