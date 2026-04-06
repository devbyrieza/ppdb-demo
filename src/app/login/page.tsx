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
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, AnimatePresence } from "framer-motion";

// Role label & icon map
const ROLE_INFO: Record<string, { label: string; icon: string; desc: string; color: string }> = {
  admin_super: { label: "Admin Super", icon: "👑", desc: "Akses penuh semua fitur", color: "from-amber-50 to-yellow-50 border-amber-200" },
  admin_berkas: { label: "Admin Berkas", icon: "📂", desc: "Verifikasi dokumen pendaftar", color: "from-blue-50 to-indigo-50 border-blue-200" },
  admin_keuangan: { label: "Admin Keuangan", icon: "💰", desc: "Verifikasi pembayaran", color: "from-emerald-50 to-teal-50 border-emerald-200" },
  pewawancara_cawalsan: { label: "Pewawancara Cawalsan", icon: "🎙️", desc: "Wawancara calon wali santri", color: "from-purple-50 to-violet-50 border-purple-200" },
  pewawancara_calsan: { label: "Pewawancara Calsan", icon: "🎙️", desc: "Wawancara calon santri", color: "from-rose-50 to-pink-50 border-rose-200" },
  penguji_calsan: { label: "Penguji Al-Qur'an", icon: "📖", desc: "Penguji tes Al-Qur'an", color: "from-green-50 to-lime-50 border-green-200" },
  head_of_it: { label: "Head of IT", icon: "💻", desc: "Manajemen sistem", color: "from-slate-50 to-gray-50 border-slate-200" },
  tim_it: { label: "Tim IT", icon: "🛠️", desc: "Support teknis", color: "from-slate-50 to-gray-50 border-slate-200" },
  admin: { label: "Admin", icon: "⚙️", desc: "Panel administrasi", color: "from-orange-50 to-amber-50 border-orange-200" },
};

// ========================================
// REUSABLE COMPONENTS
// ========================================

const AuthInput = ({
  label,
  icon: Icon,
  error,
  children
}: {
  label: string,
  icon: any,
  error?: string,
  children: React.ReactNode
}) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-ink-600 uppercase tracking-[0.2em] ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-ink-500 group-focus-within:text-brand-blue-600 transition-colors duration-300">
        <Icon className="w-5 h-5" />
      </div>
      {children}
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
  const [selectingRole, setSelectingRole] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle login pendaftar
  const handleLoginPendaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!nikPendaftar || !nomorPendaftaran) {
      setError("NIK dan Nomor Pendaftaran wajib diisi");
      setIsLoading(false);
      return;
    }

    if (!/^\d{16}$/.test(nikPendaftar)) {
      setError("NIK harus 16 digit angka");
      setIsLoading(false);
      return;
    }

    if (!/^(MTI|MTA|ILI|ILA|MAI|MAA)\d{6,8}$/.test(nomorPendaftaran)) {
      setError("Format nomor pendaftaran tidak valid (contoh: MTI2600001)");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_type: "pendaftar",
          nik: nikPendaftar,
          nomor_pendaftaran: nomorPendaftaran,
        }),
      });

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
  const handleLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!emailAdmin || !passwordAdmin) {
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
          email: emailAdmin,
          password: passwordAdmin,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login gagal");

      setIsLoading(false);

      // Multi-role: show role picker
      if (data.requires_role_selection) {
        setRoleSelectionData({
          profile_id: data.profile_id,
          full_name: data.full_name,
          available_roles: data.available_roles,
        });
        return;
      }

      // Single role: redirect
      if (["admin", "admin_super", "admin_berkas", "admin_keuangan", "head_of_it", "tim_it"].includes(data.role)) {
        window.location.href = "/dashboard/admin";
      } else if (["penguji", "penguji_calsan", "pewawancara_calsan", "pewawancara_cawalsan"].includes(data.role)) {
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
          chosen_role: chosenRole,
        }),
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
    <main className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-yellow-100/30 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <Container className="relative z-10 flex flex-col items-center">
        {/* Logo / Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link href="/">
            <div className="app-card inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-sm border border-brand-blue-100 mb-8 hover:scale-110 transition-transform group overflow-hidden">
              <img src="/images/logo.webp" alt="Logo Ulul Albaab" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-black text-ink-950 mb-3 tracking-tight">
            Portal <span className="text-gradient-blue font-black">Ulul Albaab</span>
          </h1>
          <p className="text-lg text-ink-700 font-medium">
            Masuk ke Sistem Administrasi & Pendaftaran
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="app-card w-full max-w-[480px] bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-lg border border-brand-blue-100 p-6 md:p-14 relative overflow-hidden"
        >
          {/* Subtle inside gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          {/* Tab Switcher - Premium "Pill" style */}
          {!roleSelectionData && (
            <div className="bg-brand-blue-50 p-2 rounded-[2rem] flex relative mb-12 border border-brand-blue-100">
              {/* Animated Background Pill */}
              <motion.div
                layoutId="auth-tab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                className={`absolute top-2 bottom-2 rounded-2xl bg-white shadow-sm ${activeTab === 'pendaftar' ? 'left-2 w-[calc(50%-8px)]' : 'left-[calc(50%+4px)] w-[calc(50%-8px)]'
                  }`}
              />

              <button
                onClick={() => { setActiveTab("pendaftar"); setError(""); }}
                className={`flex-1 relative z-10 py-3.5 text-xs font-black uppercase tracking-widest text-center rounded-2xl transition-colors duration-300 ${activeTab === "pendaftar" ? "text-brand-blue-700" : "text-ink-600 hover:text-ink-800"}`}
              >
                Pendaftar
              </button>
              <button
                onClick={() => { setActiveTab("admin"); setError(""); }}
                className={`flex-1 relative z-10 py-3.5 text-xs font-black uppercase tracking-widest text-center rounded-2xl transition-colors duration-300 ${activeTab === "admin" ? "text-brand-blue-700" : "text-ink-600 hover:text-ink-800"}`}
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
                className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4 overflow-hidden"
              >
                <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-premium-xs">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-sm text-red-700 font-bold leading-tight mt-0.5">{error}</p>
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
                    <div className="w-14 h-14 bg-brand-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-yellow-200">
                      <Layers className="w-7 h-7 text-brand-blue-700" />
                    </div>
                    <h2 className="text-xl font-black text-ink-950">Selamat datang, {roleSelectionData.full_name.split(' ')[0]}!</h2>
                    <p className="text-sm text-ink-600 font-medium mt-1">Pilih dashboard yang ingin diakses</p>
                  </div>

                  <div className="space-y-3">
                    {roleSelectionData.available_roles.map((role) => {
                      const info = ROLE_INFO[role] || { label: role, icon: "🔑", desc: "", color: "from-slate-50 to-gray-50 border-slate-200" };
                      return (
                        <motion.button
                          key={role}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectRole(role)}
                          disabled={selectingRole}
                          className={`w-full p-4 rounded-2xl bg-linear-to-r ${info.color} border text-left flex items-center gap-4 transition-all hover:shadow-md disabled:opacity-60`}
                        >
                          <div className="text-3xl">{info.icon}</div>
                          <div className="flex-1">
                            <p className="font-black text-ink-900 text-base">{info.label}</p>
                            {info.desc && <p className="text-xs text-ink-600 font-medium mt-0.5">{info.desc}</p>}
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
                    onClick={() => { setRoleSelectionData(null); setError(""); }}
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
                      onChange={(e) => setNomorPendaftaran(e.target.value.toUpperCase())}
                      placeholder="Contoh: MTI2600001"
                      className="w-full px-5 py-3 md:px-8 md:py-5 pl-12 md:pl-16 rounded-xl md:rounded-2xl bg-brand-blue-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-blue-50 transition-all font-bold text-ink-950 uppercase placeholder:normal-case placeholder:font-medium placeholder:text-ink-500 text-sm md:text-base"
                      disabled={isLoading}
                    />
                  </AuthInput>

                  <AuthInput label="NIK Calon Santri" icon={IdCard}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={16}
                      value={nikPendaftar}
                      onChange={(e) => setNikPendaftar(e.target.value.replace(/\D/g, ""))}
                      placeholder="16 Digit NIK Sesuai KK"
                      className="w-full px-5 py-3 md:px-8 md:py-5 pl-12 md:pl-16 rounded-xl md:rounded-2xl bg-brand-blue-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-blue-50 transition-all font-bold text-ink-950 placeholder:font-medium placeholder:text-ink-500 text-sm md:text-base"
                      disabled={isLoading}
                    />
                  </AuthInput>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 md:py-6 rounded-pill bg-brand-blue-600 text-white font-black text-lg md:text-xl hover:bg-brand-blue-700 shadow-xl shadow-brand-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
                    <p className="text-sm text-ink-600 font-bold uppercase tracking-widest mb-4">Belum Punya Akun?</p>
                    <Link
                      href="/daftar"
                      className="inline-flex items-center gap-2 px-10 py-3 rounded-pill bg-brand-blue-50 text-brand-blue-700 font-black text-sm border border-brand-blue-100 hover:bg-white hover:shadow-sm transition-all"
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
                  <AuthInput label="Email Institusi" icon={Mail}>
                    <input
                      type="email"
                      value={emailAdmin}
                      onChange={(e) => setEmailAdmin(e.target.value)}
                      placeholder="admin@andalus.sch.id"
                      className="w-full px-5 py-3 md:px-8 md:py-5 pl-12 md:pl-16 rounded-xl md:rounded-2xl bg-brand-blue-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-blue-50 transition-all font-bold text-ink-950 placeholder:font-medium placeholder:text-ink-500 text-sm md:text-base"
                      disabled={isLoading}
                    />
                  </AuthInput>

                  <AuthInput label="Kata Sandi" icon={Lock}>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordAdmin}
                        onChange={(e) => setPasswordAdmin(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-5 py-3 md:px-8 md:py-5 pl-12 md:pl-16 pr-12 md:pr-16 rounded-xl md:rounded-2xl bg-brand-blue-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-blue-50 transition-all font-bold text-ink-950 placeholder:font-medium placeholder:text-ink-500 text-sm md:text-base"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-800 transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </AuthInput>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 md:py-6 rounded-pill bg-brand-yellow-400 text-brand-blue-900 font-black text-lg md:text-xl hover:bg-brand-yellow-500 shadow-xl shadow-brand-yellow-100 border border-brand-yellow-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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

                  <div className="p-6 bg-cream-50/50 rounded-3xl border border-brand-yellow-100 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-brand-yellow-100 flex items-center justify-center text-brand-blue-700 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-ink-600 font-bold leading-relaxed">
                      Lupa password? Silakan hubungi Head of IT atau Admin Pusat untuk reset akses Anda.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
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
            className="group flex items-center gap-3 text-ink-600 hover:text-brand-blue-700 font-black uppercase tracking-[0.2em] text-[10px] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-brand-blue-50 border border-brand-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Kembali ke Beranda
          </Link>
        </motion.div>
      </Container>
    </main>
  );
}
