"use client";

// src/app/login/page.tsx
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
    label: "Penguji Al-Qur'an (Bacaan & Hafalan)",
    icon: BookOpen,
    desc: "Penguji tes Al-Qur'an (Bacaan & Hafalan)",
    color: "from-green-50 to-lime-50 border-green-200" },
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

  // Account setup state (mandatory setup for non-standard username / default password)
  const [accountSetupData, setAccountSetupData] = useState<{
    profile_id: string;
    full_name: string;
    current_username?: string;
    suggested_username?: string;
    needs_username: boolean;
    needs_password: boolean;
    role: string;
    available_roles?: string[];
    redirectTo?: string;
  } | null>(null);

  const [setupUsername, setSetupUsername] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupConfirmPassword, setSetupConfirmPassword] = useState("");
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [submittingSetup, setSubmittingSetup] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [error, setError] = useState("");

  // Mandatory UX Rule: Modal Scroll Lock

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

            // Account setup required (username missing/non-standard or password default)
      if (data.require_account_setup) {
        setAccountSetupData({
          profile_id: data.profile_id,
          full_name: data.full_name,
          current_username: data.current_username,
          suggested_username: data.suggested_username,
          needs_username: data.needs_username,
          needs_password: data.needs_password,
          role: data.role,
          available_roles: data.available_roles,
          redirectTo: data.redirectTo,
        });
        setSetupUsername(data.suggested_username || data.current_username || "");
        setSetupPassword("");
        setSetupConfirmPassword("");
        setSetupError("");
        return;
      }

      // Multi-role: show role picker
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
  // Handle save account setup
  const handleSaveAccountSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountSetupData) return;
    setSetupError("");

    if (accountSetupData.needs_username && !setupUsername.trim()) {
      setSetupError("Username wajib diisi");
      return;
    }

    if (accountSetupData.needs_password) {
      if (!setupPassword) {
        setSetupError("Kata sandi baru wajib diisi");
        return;
      }
      if (setupPassword !== setupConfirmPassword) {
        setSetupError("Konfirmasi kata sandi tidak cocok");
        return;
      }
      if (setupPassword.length < 8) {
        setSetupError("Kata sandi baru minimal 8 karakter");
        return;
      }
      if (!/[A-Z]/.test(setupPassword) || !/[a-z]/.test(setupPassword) || !/\d/.test(setupPassword) || !/[!@#$%^&*(),.?":{}|<>-=_+]/.test(setupPassword)) {
        setSetupError("Kata sandi harus mengandung kombinasi huruf besar, huruf kecil, angka, dan karakter khusus");
        return;
      }
    }

    setSubmittingSetup(true);
    try {
      const res = await fetch("/api/auth/setup-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: accountSetupData.profile_id,
          username: setupUsername.trim().toLowerCase(),
          new_password: setupPassword || undefined,
          chosen_role: accountSetupData.role,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Gagal memperbarui kredensial akun");

      window.location.href = resData.redirectTo || "/dashboard";
    } catch (err: any) {
      setSetupError(err.message);
      setSubmittingSetup(false);
    }
  };


  return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
        {/* Background Mesh */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary-400/20 rounded-full blur-[120px] pointer-events-none max-w-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[100px] pointer-events-none max-w-full" />
        
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
          {/* Top Nav */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Beranda
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-xs font-bold text-slate-700">
                Portal SPMB 2026/2027
              </span>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-white rounded-3xl border border-slate-100 shadow-[0_16px_40px_rgba(0,0,0,0.08)] flex items-center justify-center mb-5 relative">
              <div className="absolute inset-0 rounded-3xl bg-primary-500/10 blur-xl -z-10" />
              <img
                src={BRANDING?.logoPath || "/logo.png"}
                alt={"Logo"}
                className="w-12 h-12 object-contain drop-shadow-md"
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 mb-2">
              {BRANDING?.schoolName || "Pesantren Al-Imam"}
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
              Portal Masuk
            </h1>
            <p className="text-sm font-medium text-slate-500">
              {BRANDING?.schoolTagline || "Seleksi Penerimaan Murid Baru"}
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.07)] border border-white">
            {accountSetupData ? (
              <form onSubmit={handleSaveAccountSetup} className="space-y-5">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm mb-3">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Lengkapi & Amankan Akun Anda
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-sm mx-auto">
                    Ahlan wa Sahlan, <strong>{accountSetupData.full_name}</strong>. Sesuai standar keamanan pesantren, silakan tetapkan Username standar dan amankan kata sandi Anda.
                  </p>
                </div>

                {setupError && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-50 border border-red-100 text-xs font-bold text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{setupError}</span>
                  </div>
                )}

                {/* Field Username */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      Username Standar Pesantren <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-primary-600">
                      namadepan.namabelakang
                    </span>
                  </div>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={setupUsername}
                      onChange={(e) => setSetupUsername(e.target.value.toLowerCase().replace(/\s+/g, "."))}
                      placeholder="contoh: ahmad.zakaria"
                      disabled={submittingSetup}
                      className="w-full h-13 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-400 ml-1">
                    Gunakan 4-30 huruf kecil, angka, titik (.) atau underscore (_). Tanpa spasi & tanpa gelar.
                  </p>
                </div>

                {/* Field Password (jika needs_password) */}
                {accountSetupData.needs_password && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                        Kata Sandi Baru yang Kuat <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showSetupPassword ? "text" : "password"}
                          required
                          value={setupPassword}
                          onChange={(e) => setSetupPassword(e.target.value)}
                          placeholder="Minimal 8 karakter unik"
                          disabled={submittingSetup}
                          className="w-full h-13 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSetupPassword(!showSetupPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showSetupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-400 ml-1">
                        Wajib kombinasi huruf besar, huruf kecil, angka, dan simbol (!@#$% dll).
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                        Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showSetupPassword ? "text" : "password"}
                          required
                          value={setupConfirmPassword}
                          onChange={(e) => setSetupConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi baru"
                          disabled={submittingSetup}
                          className="w-full h-13 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={submittingSetup}
                  className="w-full h-13 mt-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all disabled:opacity-70"
                >
                  {submittingSetup ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> <span>Menyimpan ke Database...</span></>
                  ) : (
                    <><span>Simpan Kredensial & Masuk</span> <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAccountSetupData(null);
                    setSetupError("");
                  }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors pt-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Batal / Gunakan akun lain
                </button>
              </form>
            ) : roleSelectionData ? (
              <div className="space-y-4">
                 <div className="text-center mb-6">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">
                     Selamat datang, {roleSelectionData.full_name.split(" ")[0]}!
                   </h3>
                   <p className="text-xs font-medium text-slate-500 mt-2">
                     Pilih dashboard yang ingin diakses:
                   </p>
                 </div>
                 <div className="space-y-3">
                    {roleSelectionData.available_roles.map((role) => {
                      const info = ROLE_INFO[role] || {
                        label: role,
                        icon: ShieldCheck,
                        desc: "",
                        color: "from-slate-50 to-gray-50 border-slate-200"
                      };
                      const IconComp = info.icon;
                      return (
                        <button
                          key={role}
                          onClick={() => handleSelectRole(role)}
                          disabled={selectingRole}
                          className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:border-primary-300 hover:shadow-lg hover:shadow-primary-600/10 text-left flex items-center gap-4 transition-all disabled:opacity-60 cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 text-sm">
                              {info.label}
                            </p>
                            {info.desc && (
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                {info.desc}
                              </p>
                            )}
                          </div>
                          {selectingRole ? (
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                          )}
                        </button>
                      );
                    })}
                 </div>
                 <button
                   type="button"
                   onClick={() => {
                     setRoleSelectionData(null);
                     setError("");
                   }}
                   className="w-full mt-6 text-center text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                 >
                   <ArrowLeft className="w-4 h-4" /> Gunakan akun lain
                 </button>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setActiveTab("pendaftar"); setError(""); }}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === "pendaftar" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Calon Santri
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab("admin"); setError(""); }}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === "admin" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Portal Staf
                  </button>
                </div>

                {/* Banner Register */}
                <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 mb-6">
                  <span className="text-[11px] font-bold text-amber-900">Belum mendaftar?</span>
                  <Link href="/daftar" className="text-[11px] font-black text-amber-700 flex items-center gap-1 hover:text-amber-800">
                    Buat Akun <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-100 mb-5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="text-xs font-bold text-red-600">{error}</span>
                  </div>
                )}

                {activeTab === "pendaftar" ? (
                  <form onSubmit={handleLoginPendaftar} className="flex flex-col gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Nomor Pendaftaran <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={nomorPendaftaran}
                          onChange={(e) => setNomorPendaftaran(e.target.value.toUpperCase())}
                          placeholder="Contoh: SPA2700001"
                          disabled={isLoading}
                          className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        NIK Calon Santri <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={16}
                          required
                          value={nikPendaftar}
                          onChange={(e) => setNikPendaftar(e.target.value.replace(/\D/g, ""))}
                          placeholder="16 Digit NIK sesuai KK"
                          disabled={isLoading}
                          className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 mt-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-[13px] tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {isLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> <span>Memverifikasi...</span></>
                      ) : (
                        <><span>Masuk Portal Santri</span> <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLoginAdmin} className="flex flex-col gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Email / Username / No. WA <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={emailAdmin}
                          onChange={(e) => setEmailAdmin(e.target.value)}
                          placeholder="Kredensial Staf"
                          disabled={isLoading}
                          className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Kata Sandi <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={passwordAdmin}
                          onChange={(e) => setPasswordAdmin(e.target.value)}
                          placeholder="Masukkan kata sandi"
                          disabled={isLoading}
                          className="w-full h-14 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 mt-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black text-[13px] tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {isLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> <span>Memverifikasi...</span></>
                      ) : (
                        <><span>Masuk Portal Staf</span> <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
          
          <div className="text-center pt-2">
            <p className="text-[11px] font-bold text-slate-400">
              &copy; {new Date().getFullYear()} {BRANDING?.schoolName || "Pesantren Al-Imam"}. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </div>
    );

}
