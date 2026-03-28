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
import { motion, AnimatePresence } from "framer-motion";

interface FormData {
  nik: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  no_hp: string;
  jenis_kelamin: "L" | "P" | "";
  jenjang: "MTs" | "IL" | "";
}

// ========================================
// REUSABLE COMPONENTS
// ========================================

const InputField = ({
  label,
  error,
  children
}: {
  label: string,
  error?: string,
  children: React.ReactNode
}) => (
  <div className="space-y-3">
    <label className="text-xs font-black text-ink-600 uppercase tracking-widest ml-1">{label}</label>
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
  const router = useRouter();
  const [jenjangFromUrl, setJenjangFromUrl] = useState<"MTs" | "IL" | "">("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const jenjang = params.get('jenjang') as "MTs" | "IL" | null;
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
      const savedData = sessionStorage.getItem("pendaftaran_form");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            jenjang: jenjangFromUrl || parsed.jenjang || ""
          }));
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      } else if (jenjangFromUrl) {
        setFormData(prev => ({
          ...prev,
          jenjang: jenjangFromUrl
        }));
      }
    }
  }, [jenjangFromUrl]);

  // Save data on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const timeoutId = setTimeout(() => {
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

      if (data.simulation_code) {
        params.append("sim_code", data.simulation_code);
      }

      router.push(`/verifikasi-otp?${params.toString()}`);
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat mengirim OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white py-12 md:py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cream-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cream-100/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <Container className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-cream-200 mb-6 group hover:scale-110 transition-transform app-card">
            <School className="w-8 h-8 text-maroon-600" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-ink-950 mb-3 tracking-tight"
          >
            Mulai Pendaftaran <span className="text-gradient-maroon">Terpadu</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-ink-700 font-medium"
          >
            Tahap Awal Penerimaan Santri Baru T.A 2026/2027
          </motion.p>
        </motion.div>

        <div className="w-full max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="app-card bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-lg p-6 md:p-16 border border-cream-200 relative overflow-hidden"
          >
            {/* Soft decorative blur inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cream-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            {/* Saved Data Notice */}
            <AnimatePresence>
              {(formData.nik || formData.nama_lengkap || formData.no_hp) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 40 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-teal-50 border border-teal-100/50 rounded-3xl p-6 flex items-start gap-4 relative z-10 overflow-hidden"
                >
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-premium-xs">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-display font-black text-teal-900 leading-none mb-1">
                      Melanjutkan Draft Pendaftaran
                    </p>
                    <p className="text-sm text-teal-600 font-medium">
                      Data yang anda masukkan sebelumnya telah tersimpan otomatis dalam sesi ini.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Hapus seluruh draf dan mulai dari awal?")) {
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
                      className="mt-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-teal-800 hover:text-teal-950 transition-colors"
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
                  <div className="w-10 h-10 rounded-xl bg-cream-50 flex items-center justify-center text-maroon-600 shadow-sm border border-cream-200">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-ink-950">Pilih Jenjang</h3>
                </div>

                <div data-error={!!fieldErrors.jenjang} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { value: "MTs", title: "Madrasah Tsanawiyah", subtitle: "Lulusan SD/Sederajat" },
                    { value: "IL", title: "I'dad Lughowi", subtitle: "Lulusan SMP/Sederajat" },
                  ].map((option) => (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData((prev) => ({ ...prev, jenjang: option.value as any }))}
                      className={`cursor-pointer rounded-[2rem] p-6 border-2 transition-all duration-300 app-card ${formData.jenjang === option.value
                        ? "border-maroon-600 bg-cream-50 shadow-md"
                        : "border-cream-200 bg-white hover:border-maroon-200 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.jenjang === option.value ? "border-maroon-600" : "border-cream-200"
                          }`}>
                          {formData.jenjang === option.value && <motion.div layoutId="jk-dot-jenjang" className="w-3 h-3 rounded-full bg-maroon-600" />}
                        </div>
                        <div>
                          <p className="font-display font-black text-xl text-ink-950 leading-none mb-1">{option.title}</p>
                          <p className="text-xs text-ink-600 font-black uppercase tracking-widest">{option.subtitle}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
                  <div className="w-10 h-10 rounded-xl bg-cream-50 flex items-center justify-center text-maroon-600 shadow-sm border border-cream-200">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-ink-950">Data Calon Santri</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <InputField label="Nama Lengkap" error={fieldErrors.nama_lengkap}>
                      <input
                        type="text"
                        value={formData.nama_lengkap}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nama_lengkap: e.target.value }))}
                        placeholder="Sesuai Akta Kelahiran santri"
                        className="w-full px-5 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl bg-cream-50 border border-transparent focus:bg-white focus:border-maroon-200 focus:ring-4 focus:ring-cream-50 transition-all font-bold text-ink-900 placeholder:text-ink-500 text-sm md:text-base"
                      />
                    </InputField>
                  </div>

                  <InputField label="NIK Santri" error={fieldErrors.nik}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={16}
                      value={formData.nik}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nik: e.target.value.replace(/\D/g, "") }))}
                      placeholder="16 Digit NIK"
                      className="w-full px-5 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl bg-cream-50 border border-transparent focus:bg-white focus:border-maroon-200 focus:ring-4 focus:ring-cream-50 transition-all font-bold text-ink-900 placeholder:text-ink-500 text-sm md:text-base"
                    />
                  </InputField>

                  <InputField label="Tanggal Lahir" error={fieldErrors.tanggal_lahir}>
                    <input
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tanggal_lahir: e.target.value }))}
                      className="w-full px-5 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl bg-cream-50 border border-transparent focus:bg-white focus:border-maroon-200 focus:ring-4 focus:ring-cream-50 transition-all font-bold text-ink-900 text-sm md:text-base"
                    />
                  </InputField>

                  <div className="md:col-span-2">
                    <InputField label="Jenis Kelamin" error={fieldErrors.jenis_kelamin}>
                      <div className="flex gap-4">
                        {[{ val: 'L', label: 'Santri Putra' }, { val: 'P', label: 'Santri Putri' }].map((jk) => (
                          <motion.label
                            key={jk.val}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 flex items-center justify-center px-4 md:px-6 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] border-2 cursor-pointer transition-all duration-300 text-sm md:text-base ${formData.jenis_kelamin === jk.val
                              ? "bg-maroon-900 border-maroon-900 text-white font-black shadow-md"
                              : "bg-cream-50 border-transparent text-ink-600 hover:border-maroon-200 hover:bg-white"
                              }`}>
                            <input
                              type="radio"
                              name="jk"
                              value={jk.val}
                              checked={formData.jenis_kelamin === jk.val}
                              onChange={() => setFormData(p => ({ ...p, jenis_kelamin: jk.val as any }))}
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
                  <div className="w-10 h-10 rounded-xl bg-cream-50 flex items-center justify-center text-maroon-600 shadow-sm border border-cream-200">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-ink-950">Kontak Verifikasi</h3>
                </div>

                <InputField label="Nomor WhatsApp Orang Tua" error={fieldErrors.no_hp}>
                  <div className="relative flex shadow-sm border border-transparent focus-within:border-maroon-200 focus-within:ring-4 focus-within:ring-cream-50 rounded-xl md:rounded-2xl overflow-hidden bg-cream-50 transition-all">
                    <div className="relative">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="appearance-none h-full pl-4 pr-8 py-3 md:pl-6 md:pr-10 md:py-5 bg-transparent border-r border-cream-200 text-ink-950 font-black transition-all cursor-pointer text-sm md:text-base"
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
                        setFormData((prev) => ({ ...prev, no_hp: val }))
                      }}
                      placeholder={countryCode === "+62" ? "812 3456 7890" : "Nomor Telepon"}
                      className="flex-1 px-4 py-3 md:px-8 md:py-5 bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-ink-950 placeholder:text-ink-500 min-w-0 text-sm md:text-base"
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
                transition={{ delay: 0.7 }}
                className="pt-10"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 md:py-6 rounded-pill bg-maroon-900 text-white font-black text-lg md:text-xl hover:bg-cream-100 hover:text-maroon-900 shadow-md border border-maroon-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
                  Punya Akun? <Link href="/login" className="text-maroon-700 hover:text-cream-100 hover:bg-maroon-900 px-3 py-1 rounded-full transition-colors">Masuk di sini</Link>
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
          <Link href="/" className="inline-flex items-center gap-2 text-ink-600 hover:text-maroon-700 text-xs font-black uppercase tracking-widest transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Kembali Ke Beranda
          </Link>
        </motion.div>
      </Container>
    </main>
  );
}
