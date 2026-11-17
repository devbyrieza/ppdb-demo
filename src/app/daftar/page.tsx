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
  ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { countries } from "@/lib/data/countries";
import { formatNamaLengkap } from "@/lib/validations/registration";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { getInstitutionType, normalizeJenjang } from "@/lib/utils/jenjang";

interface FormData {
  nik: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  no_hp: string;
  jenis_kelamin: "L" | "P" | "";
  jenjang: string;
}

// ========================================
// REUSABLE COMPONENTS
// ========================================

const InputField = ({
  label,
  error,
  children }: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3" data-error={!!error}>
    <label className="text-xs font-black text-ink-600 uppercase tracking-widest ml-1">
      {label}
    </label>
    {children}
    {error && (
      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xs text-red-600 font-bold ml-1 flex items-center gap-1"
      >
        <AlertCircle className="w-3.5 h-3.5" /> {error}
      </motion.p>
    )}
  </div>
);

// ========================================
// MAIN COMPONENT
// ========================================

export default function DaftarPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const router = useRouter();
  const [jenjangFromUrl, setJenjangFromUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const jenjang = params.get("jenjang");
      if (jenjang) {
        setJenjangFromUrl(normalizeJenjang(jenjang));
      }
    }
  }, []);

  const [formData, setFormData] = useState<FormData>({
    nik: "",
    nama_lengkap: "",
    tanggal_lahir: "",
    no_hp: "",
    jenis_kelamin: "P",
    jenjang: jenjangFromUrl });

  const [countryCode, setCountryCode] = useState("+62");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("pendaftaran_form") || sessionStorage.getItem("pendaftaran_form");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            jenjang: jenjangFromUrl || parsed.jenjang || "" }));
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      } else if (jenjangFromUrl) {
        setFormData((prev) => ({
          ...prev,
          jenjang: jenjangFromUrl }));
      }
    }
  }, [jenjangFromUrl]);

  // Save data on change to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("pendaftaran_form", JSON.stringify(formData));
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
      formData.jenis_kelamin = "P";
    }

    if (!formData.jenjang) {
      errors.jenjang = "Pilih jenjang pendidikan";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector('[data-error="true"]');
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
          otp_channel: "whatsapp" }) });

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
        channel: "whatsapp" });

      if (data.simulation_code || data.otp) {
        params.append("sim_code", data.simulation_code || data.otp);
      }

      router.push(`/verifikasi-otp?${params.toString()}`);
    } catch (error: any) {
      Swal.fire(
        "Gagal!",
        error.message || "Terjadi kesalahan saat mengirim OTP",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-white py-10 sm:py-16 relative overflow-hidden font-sans">
      {/* Background Micro Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMGwwIDYwIi8+PC9nPjwvc3ZnPg==')] opacity-70 pointer-events-none" />

      <Container className="relative z-10 max-w-3xl mx-auto px-4">
        
        {/* Top Navigation Pills (OMI Mobile/Desktop Standard) */}
        <div className="w-full flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-primary hover:border-primary/40 transition-all hover:-translate-y-0.5"
          >
            <span>← Kembali ke Beranda</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm text-xs font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pendaftaran Santri Baru 2027</span>
          </div>
        </div>

        {/* Banner Pengalihan Pendaftaran Santri Putra ke Ulul Albaab */}
        <div className="w-full mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-50/95 via-sky-50/90 to-blue-50/95 border-2 border-blue-200 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md mt-0.5 sm:mt-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  Khusus Calon Santri Putra
                </span>
                <span className="text-xs font-bold text-blue-900">Mencari Pendaftaran Santri Putra (Laki-laki)?</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Pesantren Al-Imam Al-Islami <strong>resmi khusus santriwati (Putri)</strong>. Pendaftaran santri <strong>Putra</strong> dialihkan ke <strong>Pesantren Ulul Albaab (Managed by Al-Andalus IIBS)</strong>.
              </p>
            </div>
          </div>
          <a
            href="https://spmb.pesantren-ululalbaab.com/daftar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all shrink-0 w-full sm:w-auto"
          >
            <span>Daftar Santri Putra</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Two-Section OMI Container Card */}
        <div className="w-full rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 border border-slate-200 bg-white relative">
          
          {/* Section 1: Dark Maroon Gradient Header */}
          <div className="bg-gradient-to-br from-[#831843] via-[#BE185D] to-[#E11D74] p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-200 bg-white/10 px-3 py-1 rounded-full border border-white/15 inline-block">
                  Tahap 1: Registrasi Data Awal
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-200 bg-rose-500/25 px-3 py-1 rounded-full border border-rose-400/30 inline-block">
                  KHUSUS PUTRI
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Formulir Pendaftaran SPMB Online
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed">
                Silakan isi data calon santriwati dan nomor WhatsApp aktif wali santri untuk verifikasi pendaftaran.
              </p>
            </div>
          </div>

          {/* Section 2: White Body Card */}
          <div className="p-6 sm:p-10 space-y-8 bg-white">
            {/* Soft decorative blur inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            {/* Saved Data Notice */}
            <AnimatePresence>
              {(formData.nik || formData.nama_lengkap || formData.no_hp) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 40 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-primary-50 border border-primary-100/50 rounded-3xl p-6 flex items-start gap-4 relative z-10 overflow-hidden"
                >
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-ink-950 shrink-0 shadow-premium-xs">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-display font-black text-primary-900 leading-none mb-1">
                      Melanjutkan Draft Pendaftaran
                    </p>
                    <p className="text-sm text-primary-600 font-medium">
                      Data yang anda masukkan sebelumnya telah tersimpan
                      otomatis dalam sesi ini.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: "Hapus Draf?",
                          text: "Hapus seluruh draf and mulai dari awal?",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonColor: "#1e40af",
                          confirmButtonText: "Ya, Hapus",
                          cancelButtonText: "Batal" });

                        if (result.isConfirmed) {
                          localStorage.removeItem("pendaftaran_form");
                          sessionStorage.removeItem("pendaftaran_form");
                          setFormData({
                            nik: "",
                            nama_lengkap: "",
                            tanggal_lahir: "",
                            no_hp: "",
                            jenis_kelamin: "P",
                            jenjang: "" });
                          setFieldErrors({});
                        }
                      }}
                      className="mt-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary-800 hover:text-primary-950 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Mulai dari Awal
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>



            <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
              {/* Section: Jenjang */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-3xl bg-secondary-50 flex items-center justify-center text-primary-900 shadow-2xl border border-secondary-200">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-ink-950">
                    Pilih Jenjang
                  </h3>
                </div>

                <div
                  data-error={!!fieldErrors.jenjang}
                  className={`grid grid-cols-1 ${getInstitutionType() === "ANDALUS_PUSAT" ? "md:grid-cols-2" : "md:grid-cols-3"} gap-6`}
                >
                  {(() => {
                    const inst = getInstitutionType();
                    if (inst === "ANDALUS_PUSAT") {
                      return [
                        {
                          value: "SMP IT",
                          title: "SMP IT Al-Andalus",
                          subtitle: "Lulusan SD/MI Sederajat",
                          desc: "Pendidikan setara SMP memadukan kurikulum turots khas Al-Andalus, Tahfidz, dan Diknas.",
                        },
                        {
                          value: "IL",
                          title: "I'dad Lughowi (Persiapan Bahasa)",
                          subtitle: "Lulusan SMP/MTs Sederajat",
                          desc: "Program persiapan intensif bahasa Arab 1 tahun sebelum masuk jenjang lanjutan.",
                        },
                      ];
                    }
                    if (inst === "ULUL_ALBAAB") {
                      return [
                        {
                          value: "MTs",
                          title: "Madrasah Tsanawiyah (MTs)",
                          subtitle: "Lulusan SD/MI Sederajat",
                          desc: "Pendidikan setara SMP memadukan kurikulum turots khas Al-Andalus, Tahfidz, dan Diknas.",
                        },
                        {
                          value: "IL",
                          title: "I'dad Lughowi (Persiapan Bahasa)",
                          subtitle: "Lulusan SMP/MTs Sederajat",
                          desc: "Program persiapan bahasa Arab 1 tahun sebelum masuk jenjang Sekolah Menengah Atas (SMA).",
                        },
                        {
                          value: "SMA",
                          title: "Sekolah Menengah Atas (SMA)",
                          subtitle: "Lulusan SMP/MTs Sederajat",
                          desc: "Jalur langsung tanpa IL bagi santri yang lancar bahasa Arab aktif & hafalan Al-Qur'an mutqin.",
                        },
                      ];
                    }
                    return [
                      {
                        value: "MTs",
                        title: "Madrasah Tsanawiyah (MTs)",
                        subtitle: "Lulusan SD/MI Sederajat",
                        desc: "Pendidikan setara SMP memadukan kurikulum turots khas Al-Andalus, Tahfidz, dan Diknas.",
                      },
                      {
                        value: "IL",
                        title: "I'dad Lughowi (Persiapan Bahasa)",
                        subtitle: "Lulusan SMP/MTs Sederajat",
                        desc: "Program persiapan bahasa Arab 1 tahun sebelum masuk jenjang Madrasah Aliyah (MA).",
                      },
                      {
                        value: "MA",
                        title: "Madrasah Aliyah (MA) Khusus Putri",
                        subtitle: "Lulusan SMP/MTs Sederajat",
                        desc: "Jalur langsung tanpa IL bagi santriwati yang lancar bahasa Arab aktif & hafalan Al-Qur'an mutqin.",
                      },
                    ];
                  })().map((option) => {
                    const isPutra = formData.jenis_kelamin === "L";
                    const isPutri = formData.jenis_kelamin === "P";
                    const inst = getInstitutionType();
                    const isClosed = inst === "AL_IMAM" ? isPutra : inst === "ULUL_ALBAAB" ? isPutri : false;
                    const closedLabel = inst === "AL_IMAM" 
                      ? "Pendaftaran Putra tidak tersedia di sini. Silakan daftar via website Ulul Albaab."
                      : inst === "ULUL_ALBAAB"
                        ? "Pendaftaran Putri tidak tersedia di sini. Silakan daftar via website Al-Imam."
                        : "Pendaftaran tidak tersedia.";

                    return (
                      <motion.div
                        key={option.value}
                        whileHover={isClosed ? {} : { scale: 1.02 }}
                        whileTap={isClosed ? {} : { scale: 0.98 }}
                        onClick={() => {
                          if (isClosed) return;
                          setFormData((prev) => ({
                            ...prev,
                            jenjang: option.value as any }));
                        }}
                        className={`relative cursor-pointer rounded-[2rem] p-6 border-2 transition-all duration-300 app-card flex flex-col justify-between ${
                          isClosed
                            ? "opacity-50 grayscale cursor-not-allowed border-secondary-200 bg-stone-50"
                            : formData.jenjang === option.value
                              ? "border-primary-600 bg-secondary-50 shadow-2xl    "
                              : "border-secondary-200 bg-white hover:border-primary-200 hover:shadow-xl     "
                        }`}
                      >
                        {isClosed && (
                          <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-2xl z-10">
                            {closedLabel}
                          </div>
                        )}

                        <div className="flex flex-col gap-4 h-full justify-between">
                          <div className="flex items-center gap-3 relative z-0">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                formData.jenjang === option.value
                                  ? "border-primary-600"
                                  : "border-secondary-200"
                              }`}
                            >
                              {formData.jenjang === option.value && (
                                <motion.div
                                  layoutId="jk-dot-jenjang"
                                  className="w-3 h-3 rounded-full bg-primary-600"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-display font-black text-lg text-ink-950 leading-tight mb-0.5">
                                {option.title}
                              </p>
                              <p className="text-[10px] text-ink-600 font-black uppercase tracking-wider">
                                {option.subtitle}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-ink-500 font-bold leading-relaxed pt-2 border-t border-secondary-100/80">
                            {option.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Santri Pindahan Highlight Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-8 bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4 relative z-10 overflow-hidden shadow-premium-xs"
                >
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-ink-950 shrink-0 shadow-premium-xs">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-display font-black text-amber-900 leading-none mb-1">
                      Pendaftaran Santri Pindahan
                    </p>
                    <p className="text-sm text-amber-700 font-bold leading-relaxed mb-3">
                      Khusus calon santri pindahan yang akan masuk ke kelas <strong>8 MTs, 9 MTs, 11 MA, atau 12 MA</strong>, mohon <strong>TIDAK</strong> mengisi formulir reguler ini agar penempatan tidak salah.
                    </p>
                    <Link
                      href="/daftar-pindahan"
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-800 hover:text-amber-950 transition-colors bg-amber-100 hover:bg-amber-200/80 px-4 py-2.5 rounded-full border border-amber-200/50 whitespace-nowrap shrink-0"
                    >
                      Daftar Lewat Jalur Pindahan <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>

                {fieldErrors.jenjang && (
                  <p className="text-xs text-red-600 mt-4 font-bold flex items-center gap-1 ml-1">
                    <AlertCircle className="w-3.5 h-3.5" />{" "}
                    {fieldErrors.jenjang}
                  </p>
                )}
              </motion.section>

              {/* Section: Data Diri */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-3xl bg-secondary-50 flex items-center justify-center text-primary-900 shadow-2xl border border-secondary-200">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-ink-950">
                    Data Calon Santri
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <InputField
                      label="Nama Lengkap"
                      error={fieldErrors.nama_lengkap}
                    >
                      <input
                        type="text"
                        value={formData.nama_lengkap}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nama_lengkap: formatNamaLengkap(e.target.value) }))
                        }
                        placeholder="Sesuai Akta Kelahiran santri"
                        className="w-full px-5 py-3 md:px-8 md:py-5 rounded-3xl md:rounded-2xl bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold placeholder:text-ink-500 text-sm md:text-base text-ink-950"
                      />
                    </InputField>
                  </div>

                  <InputField label="NIK Santri" error={fieldErrors.nik}>
                    <div className="space-y-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={16}
                        value={formData.nik}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nik: e.target.value.replace(/\D/g, "") }))
                        }
                        placeholder="16 Digit NIK"
                        className="w-full px-5 py-3 md:px-8 md:py-5 rounded-3xl md:rounded-2xl bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold placeholder:text-ink-500 text-sm md:text-base text-ink-950"
                      />
                      <p className="text-[10px] text-ink-500 mt-1.5 ml-1 font-bold">
                        NIK (Nomor Induk Kependudukan) santri dapat dilihat pada lembar Kartu Keluarga (KK) di sebelah nama santri, atau pada KIA/KTP Anak.
                      </p>
                    </div>
                  </InputField>

                  <InputField
                    label="Tanggal Lahir"
                    error={fieldErrors.tanggal_lahir}
                  >
                    <input
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tanggal_lahir: e.target.value }))
                      }
                      className="w-full px-5 py-3 md:px-8 md:py-5 rounded-3xl md:rounded-2xl bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold text-sm md:text-base text-ink-950"
                    />
                  </InputField>

                  <div className="md:col-span-2">
                    <InputField
                      label="Jenis Kelamin"
                      error={fieldErrors.jenis_kelamin}
                    >
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-pink-50/70 border border-pink-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-md text-sm">
                            P
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm md:text-base">
                              Khusus Santriwati Putri (Perempuan)
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              Pesantren Al-Imam Al-Islami khusus mendidik santriwati Putri
                            </p>
                          </div>
                        </div>
                        <div className="sm:text-right text-xs text-slate-500 font-medium border-t sm:border-t-0 sm:border-l border-pink-200/80 pt-2 sm:pt-0 sm:pl-4">
                          <span>Untuk calon santri putra?</span>
                          <a
                            href="https://spmb.pesantren-ululalbaab.com/daftar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            Daftar di Ulul Albaab (Putra) →
                          </a>
                        </div>
                      </div>
                    </InputField>
                  </div>
                </div>
              </motion.section>

              {/* Section: Kontak */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-3xl bg-secondary-50 flex items-center justify-center text-primary-900 shadow-2xl border border-secondary-200">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-ink-950">
                    Kontak Verifikasi
                  </h3>
                </div>

                <InputField
                  label="Nomor WhatsApp Orang Tua"
                  error={fieldErrors.no_hp}
                >
                  <div className="relative flex shadow-2xl border border-transparent focus-within:border-primary-200 focus-within:ring-4 focus-within:ring-secondary-50 rounded-3xl md:rounded-2xl overflow-hidden bg-secondary-50 transition-all">
                    <div className="relative">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="appearance-none h-full pl-4 pr-8 py-3 md:pl-6 md:pr-10 md:py-5 bg-transparent border-r border-secondary-200 text-ink-950 font-black transition-all cursor-pointer text-sm md:text-base"
                      >
                        {countries.map((c) => (
                          <option key={c.name} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-600 pointer-events-none" />
                    </div>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={formData.no_hp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData((prev) => ({ ...prev, no_hp: val }));
                      }}
                      placeholder={
                        countryCode === "+62"
                          ? "812 3456 7890"
                          : "Nomor Telepon"
                      }
                      className="flex-1 px-4 py-3 md:px-8 md:py-5 bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-ink-950 placeholder:text-ink-400 min-w-0 text-sm md:text-base"
                    />
                  </div>
                  <p className="text-xs text-ink-600 font-bold uppercase tracking-widest mt-3 ml-1">
                    Kami akan mengirimkan kode OTP via WhatsApp ke nomor
                    tersebut.
                  </p>
                </InputField>
              </motion.section>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-10"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 md:py-6 rounded-pill bg-primary text-white font-extrabold text-base hover:bg-primary-dark rounded-xl h-14 shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Sedang Memproses...</span>
                    </>
                  ) : (
                    <span>Lanjutkan Registrasi</span>
                  )}
                </motion.button>

                <p className="text-center text-sm text-ink-600 font-bold uppercase tracking-widest mt-8">
                  Punya Akun?{" "}
                  <Link
                    href="/login"
                    className="text-primary-700 hover:text-primary-800 hover:bg-secondary-50 px-3 py-1 rounded-full transition-colors ml-1 border border-transparent hover:border-secondary-200"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </motion.div>
            </form>
          </div>
        </div>

        {/* Footer Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-ink-600 hover:text-primary-700 text-xs font-black uppercase tracking-widest transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Kembali Ke Beranda
          </Link>
        </motion.div>
      </Container>
    </main>
  );
}



