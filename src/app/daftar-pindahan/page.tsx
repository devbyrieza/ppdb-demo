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
  School,
  ChevronDown,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { countries } from "@/lib/data/countries";
import { formatNamaLengkap } from "@/lib/validations/registration";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface FormData {
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  no_hp: string;
  jenis_kelamin: "L" | "P" | "";
  jenjang: "MTs" | "MA" | "";
  kelas_masuk: string;
  asal_institusi: string;
  nomor_induk_lama: string;
  catatan_pindahan: string;
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
  <div className="space-y-3">
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

export default function DaftarPindahanPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const router = useRouter();
  const [jenjangFromUrl, setJenjangFromUrl] = useState<"MTs" | "MA" | "">("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const jenjang = params.get("jenjang") as "MTs" | "MA" | null;
      if (jenjang) {
        setJenjangFromUrl(jenjang);
      }
    }
  }, []);

  const [formData, setFormData] = useState<FormData>({
    nik: "",
    nama_lengkap: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    no_hp: "",
    jenis_kelamin: "",
    jenjang: jenjangFromUrl,
    kelas_masuk: "",
    asal_institusi: "",
    nisn: "",
    npsn: "",
    catatan_pindahan: "",
  });

  const [countryCode, setCountryCode] = useState("+62");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("template_demo_daftar_pindahan_draft") || sessionStorage.getItem("pendaftaran_pindahan_form");
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
        localStorage.setItem("template_demo_daftar_pindahan_draft", JSON.stringify(formData));
        sessionStorage.setItem("pendaftaran_pindahan_form", JSON.stringify(formData));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData]);

  // Handle class default options based on Jenjang
  useEffect(() => {
    if (formData.jenjang === "MTs") {
      setFormData((p) => ({ ...p, kelas_masuk: "8" }));
    } else if (formData.jenjang === "MA") {
      setFormData((p) => ({ ...p, kelas_masuk: "11" }));
    } else {
      setFormData((p) => ({ ...p, kelas_masuk: "" }));
    }
  }, [formData.jenjang]);

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

    // tempat_lahir tidak lagi wajib diisi (tidak ditampilkan di form)

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

    if (!formData.kelas_masuk) {
      errors.kelas_masuk = "Pilih kelas masuk";
    }

    if (!formData.asal_institusi) {
      errors.asal_institusi = "Asal pesantren/sekolah wajib diisi";
    }

    if (!formData.nisn) {
      errors.nisn = "NISN wajib diisi";
    }

    if (!formData.npsn) {
      errors.npsn = "NPSN wajib diisi";
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
          tipe_pendaftaran: "PINDAHAN",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim OTP");
      }

      const params = new URLSearchParams({
        nik: formData.nik,
        nama_lengkap: formData.nama_lengkap,
        tempat_lahir: formData.tempat_lahir,
        tanggal_lahir: formData.tanggal_lahir,
        no_hp: fullHp,
        jenis_kelamin: formData.jenis_kelamin,
        jenjang: formData.jenjang,
        kelas_masuk: formData.kelas_masuk,
        asal_institusi: formData.asal_institusi,
        nisn: formData.nisn,
        npsn: formData.npsn,
        catatan_pindahan: formData.catatan_pindahan,
        tipe_pendaftaran: "PINDAHAN",
        channel: "whatsapp",
      });

      if (data.simulation_code || data.otp) {
        params.append("sim_code", data.simulation_code || data.otp);
      }

      localStorage.removeItem("template_demo_daftar_pindahan_draft");
      sessionStorage.removeItem("pendaftaran_pindahan_form");
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
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold-100/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
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
            Pendaftaran <span className="text-gradient-primary">Santri Pindahan</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-ink-700 font-medium"
          >
            Formulir Khusus Santri yang Pindah dari Pondok Pesantren Lain
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
                      Data yang anda masukkan sebelumnya telah tersimpan otomatis dalam sesi ini.
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
                          sessionStorage.removeItem("pendaftaran_pindahan_form");
                          setFormData({
                            nik: "",
                            nama_lengkap: "",
                            tempat_lahir: "",
                            tanggal_lahir: "",
                            no_hp: "",
                            jenis_kelamin: "",
                            jenjang: "",
                            kelas_masuk: "",
                            asal_institusi: "",
                            nisn: "",
    npsn: "",
                            catatan_pindahan: "",
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
                    Pilih Jenjang Pindahan
                  </h3>
                </div>

                <div
                  data-error={!!fieldErrors.jenjang}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {[
                    {
                      value: "MTs",
                      title: "Madrasah Tsanawiyah",
                      subtitle: "Pindahan tingkat SMP/MTs",
                    },
                    {
                      value: "MA",
                      title: "Madrasah Aliyah",
                      subtitle: "Pindahan tingkat SMA/MA",
                    },
                  ].map((option) => {
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
                        className={`relative cursor-pointer rounded-[2rem] p-6 border-2 transition-all duration-300 app-card ${
                          isClosed
                            ? "opacity-50 grayscale cursor-not-allowed border-secondary-200 bg-stone-50"
                            : formData.jenjang === option.value
                              ? "border-primary-600 bg-secondary-50 shadow-md"
                              : "border-secondary-200 bg-white hover:border-primary-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-[24px_28px] relative z-0">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
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
                            <p className="font-display font-black text-xl text-ink-950 leading-none mb-1">
                              {option.title}
                            </p>
                            <p className="text-xs text-ink-600 font-black uppercase tracking-widest">
                              {option.subtitle}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                {fieldErrors.jenjang && (
                  <p className="text-xs text-red-600 mt-4 font-bold flex items-center gap-1 ml-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.jenjang}
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
                  </InputField>

                  <InputField label="Tanggal Lahir" error={fieldErrors.tanggal_lahir}>
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

              {/* Section: Detail Pindahan */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[24px] bg-secondary-50 flex items-center justify-center text-primary-600 shadow-sm border border-secondary-200">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-ink-950">
                    Detail Pindahan
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <InputField label="Kelas Masuk" error={fieldErrors.kelas_masuk}>
                    <div className="relative">
                      <select
                        value={formData.kelas_masuk}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, kelas_masuk: e.target.value }))
                        }
                        className="w-full px-5 py-3 md:px-8 md:py-5 rounded-[24px] md:rounded-[24px] bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold text-sm md:text-base text-ink-950 appearance-none cursor-pointer"
                      >
                        <option value="">Pilih Jenjang Terlebih Dahulu</option>
                        {formData.jenjang === "MTs" && (
                          <>
                            <option value="8">Kelas 8</option>
                            <option value="9">Kelas 9</option>
                          </>
                        )}
                        {formData.jenjang === "MA" && (
                          <>
                            <option value="11">Kelas 11</option>
                            <option value="12">Kelas 12</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-600 pointer-events-none" />
                    </div>
                  </InputField>

                  <InputField label="NISN (Nomor Induk Siswa Nasional) *" error={fieldErrors.nisn}>
                    <input
                      required
                      type="text"
                      maxLength={10}
                      value={formData.nisn}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          nisn: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="10 Digit NISN"
                      className="w-full px-5 py-3 md:px-8 md:py-5 rounded-[24px] md:rounded-[24px] bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold placeholder:text-ink-500 text-sm md:text-base text-ink-950"
                    />
                  </InputField>
                  <InputField label="NPSN Sekolah Asal *" error={fieldErrors.npsn}>
                    <input
                      required
                      type="text"
                      maxLength={8}
                      value={formData.npsn}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          npsn: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="8 Digit NPSN"
                      className="w-full px-5 py-3 md:px-8 md:py-5 rounded-[24px] md:rounded-[24px] bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold placeholder:text-ink-500 text-sm md:text-base text-ink-950"
                    />
                  </InputField>

                  <div className="md:col-span-2">
                    <InputField label="Asal Pesantren / Sekolah *" error={fieldErrors.asal_institusi}>
                      <input
                        type="text"
                        value={formData.asal_institusi}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            asal_institusi: e.target.value,
                          }))
                        }
                        placeholder="Nama Pondok Pesantren atau Sekolah asal"
                        className="w-full px-5 py-3 md:px-8 md:py-5 rounded-[24px] md:rounded-[24px] bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold placeholder:text-ink-500 text-sm md:text-base text-ink-950"
                      />
                    </InputField>
                  </div>

                  <div className="md:col-span-2">
                    <InputField label="Alasan Pindah & Catatan Khusus" error={fieldErrors.catatan_pindahan}>
                      <textarea
                        value={formData.catatan_pindahan}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            catatan_pindahan: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Alasan pindah sekolah, riwayat hafalan Quran, atau catatan penting lainnya..."
                        className="w-full px-5 py-4 md:px-8 md:py-6 rounded-[24px] md:rounded-[24px] bg-secondary-50 border border-transparent focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-secondary-50 transition-all font-bold placeholder:text-ink-500 text-sm md:text-base text-ink-950 resize-none"
                      />
                    </InputField>
                  </div>
                </div>
              </motion.section>

              {/* Section: Kontak */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
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
                    Kami akan mengirimkan kode OTP via WhatsApp ke nomor tersebut.
                  </p>
                </InputField>
              </motion.section>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
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
                    <span>Lanjutkan Registrasi Pindahan</span>
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
          transition={{ delay: 0.9 }}
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
