"use client";

import React, { useState } from "react";
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
  Key } from "lucide-react";
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
    color: "from-secondary-50 to-yellow-50 border-secondary-200" },
  admin_berkas: {
    label: "Admin Berkas",
    icon: FolderCheck,
    desc: "Verifikasi dokumen pendaftar",
    color: "from-primary-50 to-indigo-50 border-primary-200" },
  admin_keuangan: {
    label: "Admin Keuangan",
    icon: Wallet,
    desc: "Verifikasi pembayaran",
    color: "from-emerald-50 to-primary-50 border-emerald-200" },
  pewawancara_cawalsan: {
    label: "Pewawancara Cawalsan",
    icon: Mic,
    desc: "Wawancara calon orangtua/wali santri",
    color: "from-purple-50 to-violet-50 border-purple-200" },
  pewawancara_calsan: {
    label: "Pewawancara Calon Santri",
    icon: UserCheck,
    desc: "Wawancara calon santri",
    color: "from-rose-50 to-pink-50 border-rose-200" },
  penguji: {
    label: "Penguji Al-Qur'an",
    icon: BookOpen,
    desc: "Penguji tes Al-Qur'an",
    color: "from-green-50 to-lime-50 border-green-200" },
  penguji_hafalan: {
    label: "Penguji Hafalan",
    icon: Award,
    desc: "Penguji tes Hafalan Al-Qur'an",
    color: "from-teal-50 to-emerald-50 border-teal-200" },
  penguji_bahasa_arab: {
    label: "Penguji Lisan B. Arab",
    icon: MessageSquare,
    desc: "Penguji tes Lisan Bahasa Arab",
    color: "from-sky-50 to-blue-50 border-sky-200" },
  admin: {
    label: "Admin",
    icon: Settings,
    desc: "Panel administrasi",
    color: "from-orange-50 to-secondary-50 border-orange-200" } };

// ========================================
// REUSABLE COMPONENTS
// ========================================

const AuthInput = ({
  label,
  icon: Icon,
  error,
  children,
  rightElement }: {
  label: string;
  icon: any;
  error?: string;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-ink-600 uppercase tracking-[0.2em] ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-5 md:left-6 top-0 bottom-0 flex items-center text-ink-500 group-focus-within:text-primary-600 transition-colors duration-300 pointer-events-none">
        <Icon className="w-5 h-5" />
      </div>
      {children}
      {rightElement && (
        <div className="absolute right-5 md:right-6 top-0 bottom-0 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xs text-red-600 font-bold ml-1 flex items-center gap-1.5"
      >
        <AlertCircle className="w-3.5 h-3.5" /> {error}
      </motion.p>
    )}
  </div>
);

// ========================================
// MAIN COMPONENT
// ========================================

export default function LoginPage() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<"pendaftar" | "admin">(
    "pendaftar",
  );

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
  const [selectingRole, setSelectingRole] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle login pendaftar
  const handleLoginPendaftar = async (
    e?: React.FormEvent,
    manualNik?: string,
    manualNo?: string,
  ) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    const nik = (manualNik || nikPendaftar || "").trim();
    const no = (manualNo || nomorPendaftaran || "").trim().toUpperCase();

    if (!nik || !no) {
      setError("NIK dan Nomor Pendaftaran wajib diisi");
      setIsLoading(false);
      return;
    }

    if (!/^\d{16}$/.test(nik)) {
      setError("NIK harus 16 digit angka");
      setIsLoading(false);
      return;
    }

    if (!/^(MTI|MTA|ILI|ILA|MAI|MAA)\d{6,8}$/.test(no)) {
      setError("Format nomor pendaftaran tidak valid (contoh: MTI2600001 atau MAA2600001)");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_type: "pendaftar",
          nik: nik,
          nomor_pendaftaran: no }) });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login gagal");

      setIsLoading(false);
      window.location.href = "/dashboard";
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat login");
      setIsLoading(false);
    }
  };

  // Handle login admin/penguji
  const handleLoginAdmin = async (
    e?: React.FormEvent,
    manualEmail?: string,
    manualPass?: string,
    chosenRole?: string,
  ) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    const email = manualEmail || emailAdmin;
    const pass = manualPass || passwordAdmin;

    if (!email || !pass) {
      setError("Email dan Password wajib diisi");
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
          chosen_role: chosenRole }) });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login gagal");

      setIsLoading(false);

      // Multi-role: show role picker
      if (data.requires_role_selection) {
        setRoleSelectionData({
          profile_id: data.profile_id,
          full_name: data.full_name,
          available_roles: data.available_roles });
        return;
      }

      const userRole = data.role.toLowerCase();
      // Single role: redirect
      if (
        ["admin", "admin_super", "admin_berkas", "admin_keuangan"].includes(
          userRole,
        )
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
          chosen_role: chosenRole }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memilih role");
      window.location.href = data.redirectTo;
    } catch (err: any) {
      setError(err.message);
      setSelectingRole(false);
    }
  };

  return (
    <main className="min-h-screen bg-primary-950 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor - Deep Blue & Gold Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-500/20 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay pointer-events-none" />

      <Container className="relative z-10 flex flex-col items-center">
        {/* Logo / Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link href="/">
            <div className="app-card inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2rem] shadow-2xl border border-white/20 mb-6 hover:scale-110 hover:bg-white/20 transition-all duration-300 group overflow-hidden">
              <img
                src={BRANDING.logoPath}
                alt={"Logo " + BRANDING.schoolName}
                className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </Link>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white mb-2 tracking-tight drop-shadow-md">
            Portal{" "}
            <span className="text-secondary-400 font-black drop-shadow-md">
              {BRANDING.schoolShortName}
            </span>
          </h1>
          <p className="text-lg text-primary-100/80 font-medium">
            Sistem Administrasi & Penerimaan Santri Baru
          </p>
        </motion.div>

        {/* Main Card - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[480px] bg-white/90 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3rem] shadow-premium-2xl border border-white p-6 md:p-12 relative overflow-hidden"
        >
          {/* Subtle inside glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-300/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          {/* Tab Switcher - Premium "Pill" style */}
          {!roleSelectionData && (
            <div className="bg-slate-100 p-2 rounded-[2rem] flex relative mb-12 border border-slate-200">
              {/* Animated Background Pill */}
              <motion.div
                layoutId="auth-tab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                className={`absolute top-2 bottom-2 rounded-[24px] bg-white shadow-sm border border-slate-200/50 ${
                  activeTab === "pendaftar"
                    ? "left-2 w-[calc(50%-8px)]"
                    : "left-[calc(50%+4px)] w-[calc(50%-8px)]"
                }`}
              />

              <button
                onClick={() => {
                  setActiveTab("pendaftar");
                  setError("");
                }}
                className={`flex-1 relative z-10 py-3.5 text-xs font-black uppercase tracking-widest text-center rounded-[24px] transition-colors duration-300 ${activeTab === "pendaftar" ? "text-primary-700" : "text-ink-600 hover:text-ink-800"}`}
              >
                Pendaftar
              </button>
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setError("");
                }}
                className={`flex-1 relative z-10 py-3.5 text-xs font-black uppercase tracking-widest text-center rounded-[24px] transition-colors duration-300 ${activeTab === "admin" ? "text-primary-700" : "text-ink-600 hover:text-ink-800"}`}
              >
                Portal Staf
              </button>
            </div>
          )}

          {/* Error Alert */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-[24px_28px] bg-red-50 border border-red-100 rounded-3xl flex items-start gap-[24px_28px] overflow-hidden"
              >
                <div className="w-10 h-10 bg-red-500 rounded-[24px] flex items-center justify-center text-white shrink-0 shadow-premium-xs">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-sm text-red-700 font-bold leading-tight mt-0.5">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms with AnimatePresence for smooth transitions */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {/* Role Selection Screen */}
              {roleSelectionData ? (
                <motion.div
                  key="role-selector"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-secondary-100 rounded-[24px] flex items-center justify-center mx-auto mb-4 border border-secondary-200">
                      <Layers className="w-7 h-7 text-primary-700" />
                    </div>
                    <h2 className="text-xl font-black text-ink-950">
                      Selamat datang,{" "}
                      {roleSelectionData.full_name.split(" ")[0]}!
                    </h2>
                    <p className="text-sm text-ink-600 font-medium mt-1">
                      Pilih dashboard yang ingin diakses
                    </p>
                  </div>

                  <div className="space-y-3">
                    {roleSelectionData.available_roles.map((role) => {
                      const info = ROLE_INFO[role] || {
                        label: role,
                        icon: Key,
                        desc: "",
                        color: "from-slate-50 to-gray-50 border-slate-200" };
                      const IconComponent = info.icon;
                      return (
                        <motion.button
                          key={role}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectRole(role)}
                          disabled={selectingRole}
                          className={`w-full p-[24px_28px] rounded-[24px] bg-linear-to-r ${info.color} border text-left flex items-center gap-[24px_28px] transition-all hover:shadow-md disabled:opacity-60`}
                        >
                          <div className="w-10 h-10 rounded-[24px] bg-white/80 flex items-center justify-center text-primary-700 shrink-0 border border-primary-100 shadow-xs">
                            <IconComponent className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-ink-900 text-base">
                              {info.label}
                            </p>
                            {info.desc && (
                              <p className="text-xs text-ink-600 font-medium mt-0.5">
                                {info.desc}
                              </p>
                            )}
                          </div>
                          {selectingRole ? (
                            <Loader2 className="w-5 h-5 animate-spin text-ink-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-ink-400" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setRoleSelectionData(null);
                      setError("");
                    }}
                    className="w-full text-center text-xs text-ink-500 hover:text-ink-800 font-bold mt-2 flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Gunakan akun lain
                  </button>
                </motion.div>
              ) : activeTab === "pendaftar" ? (
                <motion.form
                  key="form-pendaftar"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLoginPendaftar}
                  className="space-y-8"
                >
                  <AuthInput label="Nomor Pendaftaran" icon={FileText}>
                    <input
                      type="text"
                      value={nomorPendaftaran}
                      onChange={(e) =>
                        setNomorPendaftaran(e.target.value.toUpperCase())
                      }
                      placeholder="Contoh: MTI2600001"
                      className="w-full px-5 py-3 md:px-8 md:py-5 pl-14 md:pl-16 rounded-[24px] md:rounded-[24px] bg-white/50 backdrop-blur-sm border border-white/50 focus:bg-white/90 focus:border-secondary-400 focus:ring-4 focus:ring-secondary-100 transition-all font-bold text-ink-950 uppercase placeholder:normal-case placeholder:font-medium placeholder:text-ink-400 text-sm md:text-base shadow-inner"
                      disabled={isLoading}
                    />
                  </AuthInput>

                  <AuthInput label="NIK Calon Santri" icon={IdCard}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={16}
                      value={nikPendaftar}
                      onChange={(e) =>
                        setNikPendaftar(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="16 Digit NIK Sesuai KK"
                      className="w-full px-5 py-3 md:px-8 md:py-5 pl-14 md:pl-16 rounded-[24px] md:rounded-[24px] bg-white/50 backdrop-blur-sm border border-white/50 focus:bg-white/90 focus:border-secondary-400 focus:ring-4 focus:ring-secondary-100 transition-all font-bold text-ink-950 placeholder:font-medium placeholder:text-ink-400 text-sm md:text-base shadow-inner"
                      disabled={isLoading}
                    />
                  </AuthInput>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 md:py-5 rounded-[1.5rem] bg-gradient-to-r from-secondary-400 to-secondary-600 text-primary-950 font-black text-lg md:text-xl shadow-xl shadow-secondary-400/20 border border-secondary-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span>Masuk Portal</span>
                        <LogIn className="w-6 h-6" />
                      </>
                    )}
                  </motion.button>

                  <div className="text-center pt-4">
                    <p className="text-sm text-ink-500 font-bold uppercase tracking-widest mb-4">
                      Belum Punya Akun?
                    </p>
                    <Link
                      href="/daftar"
                      className="inline-flex items-center gap-2 px-6 md:px-10 py-3 rounded-[24px] bg-white/50 backdrop-blur-sm text-primary-800 font-black text-sm border border-primary-100 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all"
                    >
                      Daftar Baru Di Sini
                    </Link>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="form-admin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLoginAdmin}
                  className="space-y-8"
                >
                  <AuthInput label="Username / Email / No. WA Admin" icon={Mail}>
                    <input
                      type="text"
                      value={emailAdmin}
                      onChange={(e) => setEmailAdmin(e.target.value)}
                      placeholder="Username / Email / No. WA"
                      className="w-full px-5 py-3 md:px-8 md:py-5 pl-14 md:pl-16 rounded-[24px] md:rounded-[24px] bg-white/50 backdrop-blur-sm border border-white/50 focus:bg-white/90 focus:border-secondary-400 focus:ring-4 focus:ring-secondary-100 transition-all font-bold text-ink-950 placeholder:font-medium placeholder:text-ink-400 text-sm md:text-base shadow-inner"
                      disabled={isLoading}
                    />
                  </AuthInput>

                  <AuthInput
                    label="Kata Sandi"
                    icon={Lock}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-ink-500 hover:text-ink-800 transition-colors duration-300 p-2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    }
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordAdmin}
                      onChange={(e) => setPasswordAdmin(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-5 py-3 md:px-8 md:py-5 pl-14 md:pl-16 pr-12 md:pr-16 rounded-[24px] md:rounded-[24px] bg-white/50 backdrop-blur-sm border border-white/50 focus:bg-white/90 focus:border-secondary-400 focus:ring-4 focus:ring-secondary-100 transition-all font-bold text-ink-950 placeholder:font-medium placeholder:text-ink-400 text-sm md:text-base shadow-inner"
                      disabled={isLoading}
                    />
                  </AuthInput>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 md:py-5 rounded-[1.5rem] bg-gradient-to-r from-primary-700 to-primary-900 text-white font-black text-lg md:text-xl shadow-xl shadow-primary-900/20 border border-primary-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span>Masuk Staf</span>
                        <ShieldCheck className="w-6 h-6" />
                      </>
                    )}
                  </motion.button>

                  <div className="p-6 bg-secondary-50/50 rounded-[24px] border border-secondary-100 flex items-start gap-[24px_28px]">
                    <div className="w-8 h-8 rounded-[24px] bg-secondary-100 flex items-center justify-center text-primary-700 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-ink-600 font-bold leading-relaxed mt-0.5">
                      Lupa password? Silakan hubungi Admin Pusat untuk reset akses.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <DemoLoginHelper
            onSelect={(val1, val2, type, val3) => {
              setError("");
              if (type === "admin") {
                setActiveTab("admin");
                setEmailAdmin(val1);
                setPasswordAdmin(val2);
                // Auto-execute login for demo magic
                setTimeout(() => handleLoginAdmin(undefined, val1, val2, val3), 300);
              } else {
                setActiveTab("pendaftar");
                setNikPendaftar(val1);
                setNomorPendaftaran(val2);
                // Auto-execute login for demo magic
                setTimeout(
                  () => handleLoginPendaftar(undefined, val1, val2),
                  300,
                );
              }
            }}
          />
        </motion.div>

        {/* Footer Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Link
            href="/"
            className="group flex items-center gap-3 text-ink-600 hover:text-primary-700 font-black uppercase tracking-[0.2em] text-[10px] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-secondary-50 border border-secondary-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Kembali ke Beranda
          </Link>
        </motion.div>
      </Container>
    </main>
  );
}
