// src/app/daftar/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  User,
  Phone,
  GraduationCap,
  CheckCircle,
  Loader2,
  ArrowRight,
  School,
  ChevronDown,
  Sparkles,
  RefreshCw,
  IdCard,
  Calendar,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { countries } from "@/lib/data/countries";
import { formatNamaLengkap } from "@/lib/validations/registration";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { BRANDING } from "@/config/branding";

interface FormData {
  nik: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  no_hp: string;
  jenis_kelamin: "L" | "P" | "";
  jenjang: "MTs" | "IL" | "MA" | "";
}

export default function DaftarPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const router = useRouter();
  const [jenjangFromUrl, setJenjangFromUrl] = useState<"MTs" | "IL" | "MA" | "">("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const jenjang = params.get("jenjang") as "MTs" | "IL" | "MA" | null;
      if (jenjang) {
        setJenjangFromUrl(jenjang);
      }
    }
  }, []);

  const [formData, setFormData] = useState<FormData>({
    nik: "",
    nama_lengkap: "",
    tanggal_lahir: "",
    no_hp: "",
    jenis_kelamin: "",
    jenjang: jenjangFromUrl
  });

  const [countryCode, setCountryCode] = useState("+62");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData =
        localStorage.getItem("template_demo_daftar_draft") ||
        sessionStorage.getItem("pendaftaran_form");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            jenjang: jenjangFromUrl || parsed.jenjang || ""
          }));
          setHasDraft(true);
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      } else if (jenjangFromUrl) {
        setFormData((prev) => ({
          ...prev,
          jenjang: jenjangFromUrl
        }));
      }
    }
  }, [jenjangFromUrl]);

  // Save draft on change (Mandatory UX Rule)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("template_demo_daftar_draft", JSON.stringify(formData));
        sessionStorage.setItem("pendaftaran_form", JSON.stringify(formData));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nik) {
      errors.nik = "NIK santri wajib diisi";
    } else if (!/^\d{16}$/.test(formData.nik)) {
      errors.nik = "NIK harus 16 digit angka";
    }

    if (!formData.nama_lengkap) {
      errors.nama_lengkap = "Nama lengkap santri wajib diisi";
    } else if (formData.nama_lengkap.length < 3) {
      errors.nama_lengkap = "Nama minimal 3 karakter";
    }

    if (!formData.tanggal_lahir) {
      errors.tanggal_lahir = "Tanggal lahir santri wajib diisi";
    }

    if (!formData.no_hp) {
      errors.no_hp = "Nomor WhatsApp/HP orang tua wajib diisi";
    } else {
      let cleaned = formData.no_hp.replace(/[\s\-\(\)]/g, "");
      if (countryCode === "+62") {
        cleaned = cleaned.replace(/^(\+?62|0)/, "");
        if (!/^8\d{7,13}$/.test(cleaned)) {
          errors.no_hp = "Nomor tidak valid (contoh: 81234567890)";
        }
      } else {
        if (!/^\d{6,15}$/.test(cleaned)) {
          errors.no_hp = "Nomor telepon tidak valid";
        }
      }
    }

    if (!formData.jenis_kelamin) {
      errors.jenis_kelamin = "Pilih jenis kelamin santri";
    }

    if (!formData.jenjang) {
      errors.jenjang = "Pilih jenjang pendidikan yang dituju";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector("[data-error='true']");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsLoading(true);

    try {
      let finalPhone = formData.no_hp.replace(/[\s\-\(\)]/g, "");
      if (countryCode === "+62") {
        finalPhone = finalPhone.replace(/^(\+?62|0)/, "");
      } else {
        finalPhone = finalPhone.replace(/^0+/, "");
      }

      const codeClean = countryCode.replace("+", "");
      const fullHp = `${codeClean}${finalPhone}`;

      const response = await fetch("/api/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          no_hp: fullHp,
          otp_channel: "whatsapp"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim OTP");
      }

      const params = new URLSearchParams({
        nik: formData.nik,
        nama_lengkap: formData.nama_lengkap,
        tanggal_lahir: formData.tanggal_lahir,
        no_hp: fullHp,
        jenis_kelamin: formData.jenis_kelamin,
        jenjang: formData.jenjang,
        channel: "whatsapp"
      });

      if (data.simulation_code || data.otp) {
        params.append("sim_code", data.simulation_code || data.otp);
      }

      localStorage.removeItem("template_demo_daftar_draft");
      sessionStorage.removeItem("pendaftaran_form");
      router.push(`/verifikasi-otp?${params.toString()}`);
    } catch (error: any) {
      Swal.fire(
        "Gagal!",
        error.message || "Terjadi kesalahan saat mengirim OTP",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-white py-10 sm:py-16 px-4 font-sans relative overflow-hidden flex flex-col justify-center items-center">
      
      {/* Background Micro Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMGwwIDYwIi8+PC9nPjwvc3ZnPg==')] opacity-70 pointer-events-none" />

      {/* TOP NAVIGATION PILLS (OMI STANDARD) */}
      <div className="w-full max-w-3xl flex items-center justify-between gap-3 mb-5 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-[#1E3A8A] hover:border-[#1E3A8A]/40 transition-all hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Penerimaan Santri Baru 2027/2028</span>
        </div>
      </div>

      {/* TWO-SECTION OMI CARD (PLATINUM DIAMOND REGISTRATION) */}
      <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/10 border border-slate-200 bg-white relative z-10">
        
        {/* SECTION 1: ROYAL NAVY BLUE GRADIENT HEADER */}
        <div className="bg-gradient-to-br from-[#0B1528] via-[#1E3A8A] to-[#1D4ED8] p-7 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
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
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/15 inline-block mb-1">
                Langkah 1 dari 2 &bull; Registrasi Akun
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                Formulir Pendaftaran Santri Baru
              </h1>
              <p className="text-xs sm:text-sm text-slate-200/90 font-normal mt-1 leading-relaxed">
                Silakan lengkapi data awal calon santri. Akun portal dan kode akses akan dikirimkan otomatis setelah verifikasi nomor WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: WHITE FORM BODY */}
        <div className="p-7 sm:p-10 bg-white space-y-8">
          
          {/* Draft Autosave Notice Banner */}
          {hasDraft && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium">
                  Draf formulir Anda sebelumnya telah tersimpan otomatis di perangkat ini.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("template_demo_daftar_draft");
                  sessionStorage.removeItem("pendaftaran_form");
                  setFormData({
                    nik: "",
                    nama_lengkap: "",
                    tanggal_lahir: "",
                    no_hp: "",
                    jenis_kelamin: "",
                    jenjang: ""
                  });
                  setHasDraft(false);
                }}
                className="text-amber-800 hover:text-amber-950 font-extrabold flex items-center gap-1 shrink-0 uppercase text-[10px] tracking-wider"
              >
                <RefreshCw className="w-3 h-3" /> Mulai Ulang
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Pilih Jenjang Pendidikan */}
            <div className="space-y-3" data-error={!!fieldErrors.jenjang}>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#1E3A8A]" />
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Pilih Jenjang Pendidikan <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="grid sm:grid-cols-3 gap-3.5">
                {[
                  {
                    value: "MTs",
                    title: "SMP IT",
                    subtitle: "Lulusan SD / MI",
                    desc: "Pendidikan dasar 3 tahun berasrama"
                  },
                  {
                    value: "IL",
                    title: "I'dad Lughowi",
                    subtitle: "Lulusan SMP / MTs",
                    desc: "Persiapan bahasa Arab intensif 1 tahun"
                  },
                  {
                    value: "MA",
                    title: "SMA IT",
                    subtitle: "Lulusan SMP / MTs",
                    desc: "Jalur langsung khusus lancar bahasa Arab"
                  }
                ].map((item) => (
                  <div
                    key={item.value}
                    onClick={() => setFormData((p) => ({ ...p, jenjang: item.value as any }))}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      formData.jenjang === item.value
                        ? "border-[#1E3A8A] bg-blue-50/50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm text-slate-900">
                          {item.title}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            formData.jenjang === item.value
                              ? "border-[#1E3A8A] bg-[#1E3A8A]"
                              : "border-slate-300"
                          }`}
                        >
                          {formData.jenjang === item.value && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mb-1">
                        {item.subtitle}
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {fieldErrors.jenjang && (
                <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.jenjang}
                </p>
              )}
            </div>

            {/* 2. Data Calon Santri */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#1E3A8A]" />
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Identitas Calon Santri
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5" data-error={!!fieldErrors.nama_lengkap}>
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>Nama Lengkap Santri</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_lengkap}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        nama_lengkap: formatNamaLengkap(e.target.value)
                      }))
                    }
                    placeholder="Sesuai Akta Kelahiran / Kartu Keluarga"
                    className="w-full h-12 px-4 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
                  />
                  {fieldErrors.nama_lengkap && (
                    <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.nama_lengkap}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5" data-error={!!fieldErrors.nik}>
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>NIK Calon Santri (16 Digit)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    required
                    value={formData.nik}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        nik: e.target.value.replace(/\D/g, "")
                      }))
                    }
                    placeholder="16 Digit NIK Santri"
                    className="w-full h-12 px-4 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
                  />
                  {fieldErrors.nik && (
                    <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.nik}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5" data-error={!!fieldErrors.tanggal_lahir}>
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>Tanggal Lahir</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_lahir}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, tanggal_lahir: e.target.value }))
                    }
                    className="w-full h-12 px-4 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all"
                  />
                  {fieldErrors.tanggal_lahir && (
                    <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.tanggal_lahir}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1.5" data-error={!!fieldErrors.jenis_kelamin}>
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <span>Jenis Kelamin</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: "L", label: "Santri Putra (Ikhwan)" },
                      { val: "P", label: "Santri Putri (Akhwat)" }
                    ].map((jk) => (
                      <button
                        key={jk.val}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, jenis_kelamin: jk.val as any }))
                        }
                        className={`h-12 rounded-xl border-2 font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                          formData.jenis_kelamin === jk.val
                            ? "border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>{jk.label}</span>
                      </button>
                    ))}
                  </div>
                  {fieldErrors.jenis_kelamin && (
                    <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.jenis_kelamin}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Kontak WhatsApp */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1E3A8A]" />
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Nomor WhatsApp Orang Tua / Wali <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="space-y-1.5" data-error={!!fieldErrors.no_hp}>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#1E3A8A] focus-within:ring-4 focus-within:ring-[#1E3A8A]/10 bg-slate-50/60 transition-all">
                  <div className="relative border-r border-slate-200 bg-slate-100/80 px-3 flex items-center">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer pr-4"
                    >
                      {countries.map((c) => (
                        <option key={c.name} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    value={formData.no_hp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData((p) => ({ ...p, no_hp: val }));
                    }}
                    placeholder="81234567890 (Tanpa awalan angka 0)"
                    className="flex-1 h-12 px-4 bg-transparent text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Kode OTP verifikasi akun akan dikirimkan ke nomor WhatsApp ini.
                </p>
                {fieldErrors.no_hp && (
                  <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.no_hp}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-extrabold text-sm shadow-md shadow-[#1E3A8A]/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim Kode OTP WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <span>Lanjutkan ke Verifikasi OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="pt-2 text-center border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium">
                Sudah pernah mendaftar sebelumnya?{" "}
                <Link
                  href="/login"
                  className="font-extrabold text-[#1E3A8A] hover:underline"
                >
                  Masuk ke Portal Santri di Sini
                </Link>
              </p>
            </div>

          </form>

        </div>

      </div>

      <p className="text-center text-xs text-slate-400 mt-6 font-medium">
        &copy; 2026 {BRANDING.schoolLegalName} &bull; SPMB v2.0
      </p>

    </main>
  );
}
