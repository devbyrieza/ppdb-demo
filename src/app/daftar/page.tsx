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
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { countries } from "@/lib/data/countries";
import { formatNamaLengkap } from "@/lib/validations/registration";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface FormData {
  nik: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  no_hp: string;
  jenis_kelamin: "L" | "P" | "";
  jenjang: "MTs" | "IL" | "MA" | "";
}

// ========================================
// REUSABLE COMPONENTS
// ========================================

const InputField = ({
  label,
  error,
  children,
}: {
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
    jenjang: jenjangFromUrl,
  });

  const [countryCode, setCountryCode] = useState("+62");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("template_demo_daftar_draft") || sessionStorage.getItem("pendaftaran_form");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            jenjang: jenjangFromUrl || parsed.jenjang || "",
          }));
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      } else if (jenjangFromUrl) {
        setFormData((prev) => ({
          ...prev,
          jenjang: jenjangFromUrl,
        }));
      }
    }
  }, [jenjangFromUrl]);

  // Save data on change
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
          otp_channel: "whatsapp",
        }),
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
        channel: "whatsapp",
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
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white py-12 md:py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <Container className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-[24px] shadow-sm border border-secondary-200 mb-6 group hover:scale-110 transition-transform app-card">
            <School className="w-8 h-8 text-primary-600" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-6xl font-display font-black text-ink-950 mb-3 tracking-tight"
          >
            Mulai Pendaftaran{" "}
            <span className="text-gradient-primary">Terpadu</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-ink-700 font-medium"
          >
            Tahap Awal Penerimaan Santri Baru T.A 2027-2028
          </motion.p>
        </motion.div>

        <div className="w-full max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="app-card bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-lg p-6 md:p-16 border border-secondary-200 relative overflow-hidden"
          >
            {/* Soft decorative blur inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            {/* Saved Data Notice */}
            <AnimatePresence>
              {(formData.nik || formData.nama_lengkap || formData.no_hp) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 40 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-primary-50 border border-primary-100/50 rounded-3xl p-6 flex items-start gap-[24px_28px] relative z-10 overflow-hidden"
                >
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-premium-xs">
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
                          text: "Hapus seluruh draf dan mulai dari awal?",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonColor: "#3a5029",
                          confirmButtonText: "Ya, Hapus",
                          cancelButtonText: "Batal",
                        });

                        if (result.isConfirmed) {
                          sessionStorage.removeItem("pendaftaran_form");
                          setFormData({
                            nik: "",
                            nama_lengkap: "",
                            tanggal_lahir: "",
                            no_hp: "",
                            jenis_kelamin: "",
                            jenjang: "",
                          });
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
                  <div className="w-10 h-10 rounded-[24px] bg-secondary-50 flex items-center justify-center text-primary-600 shadow-sm border border-secondary-200">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-ink-950">
                    Pilih Jenjang
                  </h3>
                </div>

                <div
                  data-error={!!fieldErrors.jenjang}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {[
                    {
                      value: "MTs",
                      title: "Madrasah Tsanawiyah",
                      subtitle: "Lulusan SD/Sederajat",
                      desc: "Jenjang pendidikan dasar setingkat SMP.",
                    },
                    {
                      value: "IL",
                      title: "I'dad Lughowi",
                      subtitle: "Lulusan SMP/Sederajat",
                      desc: "Kelas persiapan bahasa Arab sebelum masuk MA.",
                    },
                    {
                      value: "MA",
                      title: "Madrasah Aliyah (MA) Langsung",
                      subtitle: "Lulusan SMP/Sederajat",
                      desc: "Jalur langsung tanpa IL. Khusus yang lancar berbahasa Arab & hafal minimal 5 juz mutqin.",
                    },
                  ].map((option) => {
                    const isPutra = formData.jenis_kelamin === "L";
                    const isPutri = formData.jenis_kelamin === "P";
                    // Untuk Template Demo, kita buka semua untuk demo.
                    const isClosed = false;

                    return (
                      <motion.div
                        key={option.value}
                        whileHover={isClosed ? {} : { scale: 1.02 }}
                        whileTap={isClosed ? {} : { scale: 0.98 }}
                        onClick={() => {
                          if (isClosed) return;
                          setFormData((prev) => ({
                            ...prev,
                            jenjang: option.value as any,
                          }));
                        }}
                        className={`relative cursor-pointer rounded-[2rem] p-6 border-2 transition-all duration-300 app-card flex flex-col justify-between ${
                          isClosed
                            ? "opacity-50 grayscale cursor-not-allowed border-secondary-200 bg-stone-50"
                            : formData.jenjang === option.value
                              ? "border-primary-600 bg-secondary-50 shadow-md"
                              : "border-secondary-200 bg-white hover:border-primary-200 hover:shadow-sm"
                        }`}
                      >
                        {isClosed && (
                          <div className="absolute top-[24px_28px] right-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm z-10">
                            Kuota Penuh / Tutup
                          </div>
                        )}

                        <div className="flex flex-col gap-[24px_28px] h-full justify-between">
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
                  className="mt-8 bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-[24px_28px] relative z-10 overflow-hidden shadow-premium-xs"
                >
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-premium-xs">
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
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-800 hover:text-amber-950 transition-colors bg-amber-100 hover:bg-amber-200/80 p-[16px_20px].5 rounded-full border border-amber-200/50"
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
                  <div className="w-10 h-10 rounded-[24px] bg-secondary-50 flex items-center justify-center text-primary-600 shadow-sm border border-secondary-200">
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
                            nama_lengkap: formatNamaLengkap(e.target.value),
                          }))
                        }
                        placeholder="Sesuai Akta Kelahiran santri"
                        className="w-full px-5 py-3 md:px-8 md:py-5 rounded-[24px] md:rounded-[24px] bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold placeholder:text-ink-500 text-sm md:text-base text-ink-950"
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
                            nik: e.target.value.replace(/\D/g, ""),
                          }))
                        }
                        placeholder="16 Digit NIK"
                        className="w-full px-5 py-3 md:px-8 md:py-5 rounded-[24px] md:rounded-[24px] bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold placeholder:text-ink-500 text-sm md:text-base text-ink-950"
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
                          tanggal_lahir: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-3 md:px-8 md:py-5 rounded-[24px] md:rounded-[24px] bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold text-sm md:text-base text-ink-950"
                    />
                  </InputField>

                  <div className="md:col-span-2">
                    <InputField
                      label="Jenis Kelamin"
                      error={fieldErrors.jenis_kelamin}
                    >
                      <div className="flex gap-[24px_28px]">
                        {[
                          { val: "L", label: "Santri Putra" },
                          { val: "P", label: "Santri Putri" },
                        ].map((jk) => (
                          <motion.label
                            key={jk.val}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 flex items-center justify-center px-4 md:p-[16px_20px] md:py-4 rounded-[1.5rem] md:rounded-[2rem] border-2 cursor-pointer transition-all duration-300 text-sm md:text-base ${
                              formData.jenis_kelamin === jk.val
                                ? "bg-primary-700 border-primary-700 text-white font-black shadow-md"
                                : "bg-secondary-50 border-secondary-200 text-ink-800 hover:border-primary-200 hover:bg-white font-bold"
                            }`}
                          >
                            <input
                              type="radio"
                              name="jk"
                              value={jk.val}
                              checked={formData.jenis_kelamin === jk.val}
                              onChange={() =>
                                setFormData((p) => ({
                                  ...p,
                                  jenis_kelamin: jk.val as any,
                                }))
                              }
                              className="hidden"
                            />
                            {jk.label}
                          </motion.label>
                        ))}
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
                  <div className="w-10 h-10 rounded-[24px] bg-secondary-50 flex items-center justify-center text-primary-600 shadow-sm border border-secondary-200">
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
                  <div className="relative flex shadow-sm border border-transparent focus-within:border-primary-200 focus-within:ring-4 focus-within:ring-secondary-50 rounded-[24px] md:rounded-[24px] overflow-hidden bg-secondary-50 transition-all">
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
                  className="w-full py-4 md:py-6 rounded-pill bg-primary-700 text-white font-black text-lg md:text-xl hover:bg-primary-800 shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
          </motion.div>
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
