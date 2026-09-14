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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #060e24 0%, #0c1c48 30%, #162f7a 60%, #1e3a8a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Orbs */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Subtle Micro-Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Main Card Container */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Top Nav Pills */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "100px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.85)",
              fontSize: "11px",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s",
            }}
          >
            <ArrowLeft style={{ width: 12, height: 12 }} />
            Beranda
          </Link>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "100px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
                boxShadow: "0 0 8px #4ade80",
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.03em" }}>
              Portal Demo SPMB 2026/2027
            </span>
          </div>
        </div>

        {/* Hero Brand Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
            }}
          >
            <img
              src={BRANDING.logoPath}
              alt={"Logo " + BRANDING.schoolName}
              style={{ width: 48, height: 48, objectFit: "contain" }}
            />
          </div>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#60a5fa",
              marginBottom: "6px",
            }}
          >
            {BRANDING.schoolName}
          </p>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "8px",
            }}
          >
            Portal Masuk SPMB
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 400, lineHeight: 1.5 }}>
            {BRANDING.schoolTagline || "Seleksi Penerimaan Murid Baru"}
          </p>
        </div>

        {/* Floating White Form Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.98)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          {/* Role Selection Screen */}
          {roleSelectionData ? (
            <div className="space-y-4">
              <div className="text-center mb-5">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Selamat datang, {roleSelectionData.full_name.split(" ")[0]}!
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Pilih dashboard yang ingin diakses:
                </p>
              </div>

              <div className="space-y-2.5">
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
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 text-left flex items-center gap-3.5 transition-all disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-slate-900 text-sm">
                          {info.label}
                        </p>
                        {info.desc && (
                          <p className="text-[11px] text-slate-500 font-medium">
                            {info.desc}
                          </p>
                        )}
                      </div>
                      {selectingRole ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
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
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-bold pt-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft style={{ width: 14, height: 14 }} /> Gunakan akun lain
              </button>
            </div>
          ) : (
            <>
              {/* Tab Switcher */}
              <div
                style={{
                  display: "flex",
                  background: "#f1f5f9",
                  borderRadius: "14px",
                  padding: "4px",
                  marginBottom: "18px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("pendaftar");
                    setError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: activeTab === "pendaftar" ? "#ffffff" : "transparent",
                    color: activeTab === "pendaftar" ? "#1e3a8a" : "#64748b",
                    boxShadow: activeTab === "pendaftar" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    fontFamily: "inherit",
                  }}
                >
                  Calon Santri
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("admin");
                    setError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: activeTab === "admin" ? "#ffffff" : "transparent",
                    color: activeTab === "admin" ? "#1e3a8a" : "#64748b",
                    boxShadow: activeTab === "admin" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    fontFamily: "inherit",
                  }}
                >
                  Portal Staf
                </button>
              </div>

              {/* Registration Prompt Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                  border: "1px solid rgba(30,58,138,0.25)",
                  marginBottom: "20px",
                  fontSize: "11px",
                }}
              >
                <span style={{ color: "#1e3a8a", fontWeight: 500 }}>
                  Belum memiliki akun terdaftar?
                </span>
                <Link
                  href="/daftar"
                  style={{
                    color: "#1e3a8a",
                    fontWeight: 800,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Daftar Akun <ArrowRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    marginBottom: "16px",
                  }}
                >
                  <AlertCircle style={{ width: 14, height: 14, color: "#dc2626", flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#dc2626" }}>{error}</span>
                </div>
              )}

              {/* Tab 1: Calon Santri Form */}
              {activeTab === "pendaftar" ? (
                <form onSubmit={handleLoginPendaftar} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Nomor Pendaftaran <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <FileText style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94a3b8", pointerEvents: "none" }} />
                      <input
                        type="text"
                        required
                        value={nomorPendaftaran}
                        onChange={(e) => setNomorPendaftaran(e.target.value.toUpperCase())}
                        placeholder="Contoh: SPA2700001"
                        disabled={isLoading}
                        style={{
                          width: "100%",
                          height: "48px",
                          paddingLeft: "40px",
                          paddingRight: "16px",
                          background: "#f8fafc",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "12px",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0f172a",
                          outline: "none",
                          textTransform: "uppercase",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                          transition: "all 0.2s",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#1e3a8a";
                          e.target.style.background = "#ffffff";
                          e.target.style.boxShadow = "0 0 0 4px rgba(30,58,138,0.08)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.background = "#f8fafc";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      NIK Calon Santri (16 Digit) <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <IdCard style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94a3b8", pointerEvents: "none" }} />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={16}
                        required
                        value={nikPendaftar}
                        onChange={(e) => setNikPendaftar(e.target.value.replace(/\D/g, ""))}
                        placeholder="16 Digit NIK sesuai KK"
                        disabled={isLoading}
                        style={{
                          width: "100%",
                          height: "48px",
                          paddingLeft: "40px",
                          paddingRight: "16px",
                          background: "#f8fafc",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "12px",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                          transition: "all 0.2s",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#1e3a8a";
                          e.target.style.background = "#ffffff";
                          e.target.style.boxShadow = "0 0 0 4px rgba(30,58,138,0.08)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.background = "#f8fafc";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      height: "50px",
                      borderRadius: "12px",
                      background: isLoading ? "#64748b" : "linear-gradient(135deg, #162f7a 0%, #1e3a8a 100%)",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "13px",
                      letterSpacing: "0.02em",
                      border: "none",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: isLoading ? "none" : "0 8px 24px rgba(30,58,138,0.35)",
                      transition: "all 0.2s",
                      fontFamily: "inherit",
                      opacity: isLoading ? 0.8 : 1,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                        <span>Memverifikasi Data...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk Portal Calon Santri</span>
                        <ArrowRight style={{ width: 16, height: 16 }} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Tab 2: Staf / Admin Form */
                <form onSubmit={handleLoginAdmin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Email / Username / No. WA <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Mail style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94a3b8", pointerEvents: "none" }} />
                      <input
                        type="text"
                        required
                        value={emailAdmin}
                        onChange={(e) => setEmailAdmin(e.target.value)}
                        placeholder="Email, username, atau no. WA"
                        disabled={isLoading}
                        style={{
                          width: "100%",
                          height: "48px",
                          paddingLeft: "40px",
                          paddingRight: "16px",
                          background: "#f8fafc",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "12px",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                          transition: "all 0.2s",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#1e3a8a";
                          e.target.style.background = "#ffffff";
                          e.target.style.boxShadow = "0 0 0 4px rgba(30,58,138,0.08)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.background = "#f8fafc";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Kata Sandi <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94a3b8", pointerEvents: "none" }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={passwordAdmin}
                        onChange={(e) => setPasswordAdmin(e.target.value)}
                        placeholder="Masukkan kata sandi staf"
                        disabled={isLoading}
                        style={{
                          width: "100%",
                          height: "48px",
                          paddingLeft: "40px",
                          paddingRight: "44px",
                          background: "#f8fafc",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "12px",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0f172a",
                          outline: "none",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                          transition: "all 0.2s",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#1e3a8a";
                          e.target.style.background = "#ffffff";
                          e.target.style.boxShadow = "0 0 0 4px rgba(30,58,138,0.08)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.background = "#f8fafc";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#94a3b8",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                        aria-label="Tampilkan kata sandi"
                      >
                        {showPassword ? (
                          <EyeOff style={{ width: 16, height: 16 }} />
                        ) : (
                          <Eye style={{ width: 16, height: 16 }} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      height: "50px",
                      borderRadius: "12px",
                      background: isLoading ? "#64748b" : "linear-gradient(135deg, #162f7a 0%, #1e3a8a 100%)",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "13px",
                      letterSpacing: "0.02em",
                      border: "none",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: isLoading ? "none" : "0 8px 24px rgba(30,58,138,0.35)",
                      transition: "all 0.2s",
                      fontFamily: "inherit",
                      opacity: isLoading ? 0.8 : 1,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                        <span>Memverifikasi Staf...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk Portal Staf</span>
                        <ShieldCheck style={{ width: 16, height: 16 }} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Footer inside card */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              color: "#94a3b8",
              fontWeight: 600,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                }}
              />
              <span>Koneksi Aman Terenkripsi SSL</span>
            </div>

          </div>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          <div key="Demo Pendaftaran" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "100px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", display: "inline-block", flexShrink: 0 }} /><span style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.03em" }}>Demo Pendaftaran</span></div>
          <div key="Simulasi Ujian" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "100px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", display: "inline-block", flexShrink: 0 }} /><span style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.03em" }}>Simulasi Ujian</span></div>
          <div key="Pengumuman" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "100px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", display: "inline-block", flexShrink: 0 }} /><span style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.03em" }}>Pengumuman</span></div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
            &copy; 2026 {BRANDING.schoolName}. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
