"use client";
import { useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import {
  Users,
  Target,
  Award,
  BookOpen,
  Compass,
  Sparkles,
  CheckCircle2,
  Send,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TentangPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white min-h-screen">
      {/* 1. Hero Section - Professional Airy Design */}
      <section className="section-std pb-0! relative overflow-hidden">
        {/* Sophisticated Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-100/60 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-50/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mengenal Al Imam Al Islami • Managed by Al Andalus IIBS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 md:mb-10 tracking-tight leading-[0.95] md:leading-[0.9] text-ink-950"
          >
            Babak Baru <br />
            <span className="text-gradient-primary pb-2 block sm:inline">
              Pendidikan Qur'ani
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-ink-600 max-w-3xl mx-auto leading-relaxed font-medium mb-12 px-4"
          >
            Pesantren Al Imam Al Islami Sukabumi, cabang resmi Managed by Al Andalus IIBS.
            Memadukan intensitas Tahfidz Al-Qur'an dengan pengembangan jiwa Leadership untuk
            Kaderisasi Ummat Hanif, Kontributif, dan Adaptif. Tahun Ajaran 2027/2028 merupakan
            Angkatan Pertama (Era Baru) sejak dikelola oleh Al Andalus IIBS.
          </motion.p>
        </Container>
      </section>

      {/* 2. Welcome Banner - Refined Section */}
      <section className="py-12 md:py-20 lg:py-24 bg-white overflow-hidden border-t border-primary-100/50">
        <Container>
          <div className="mb-10 lg:mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 text-primary-700 mb-4"
            >
              <div className="w-8 h-0.5 bg-primary-600/30 rounded-full" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary-700">
                Ahlan Wa Sahlan
              </span>
              <div className="w-8 h-0.5 bg-primary-600/30 rounded-full" />
            </motion.div>
            <h2 className="section-title text-center text-3xl sm:text-2xl md:text-4xl lg:text-6xl leading-[1.1] mb-0">
              Masa Depan Qur'ani <br className="hidden md:block" />
              Dimulai dari{" "}
              <span className="text-primary-700 underline decoration-primary-500/30 underline-offset-4 md:underline-offset-8">
                Sini
              </span>
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative aspect-video md:aspect-[21/9] max-h-[480px] w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-lg border border-primary-100 group bg-gradient-to-br from-primary-950 to-primary-900"
          >
            <Image
              src="/images/welcome-selamat-datang.webp"
              alt="Selamat Datang di Al Imam Al Islami"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </motion.div>
        </Container>
      </section>

      {/* 3. History & Profile - Enhanced Layout */}
      <section className="section-alt border-y border-primary-100">
        <Container>
          <div className="grid lg:grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center">
            {/* Image Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[4/5] max-h-[520px] min-h-[350px] w-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-xl relative z-10 bg-white p-3 border border-primary-100">
                <div className="relative w-full h-full min-h-[330px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary-950 to-primary-900">
                  <Image
                    src="/images/tentang.webp"
                    alt="Pesantren Al Imam Al Islami"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Floating Stats Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-6 right-0 sm:-bottom-10 sm:-right-6 md:-bottom-12 md:-right-10 z-20 bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-lg border border-primary-100 max-w-[85vw] sm:max-w-[90vw] md:max-w-none"
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-linear-to-br from-primary-600 to-primary-800 rounded-3xl md:rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
                    <Award className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-ink-950 tracking-tight leading-none mb-1">
                      2026
                    </p>
                    <p className="text-primary-700 font-bold text-[9px] md:text-[10px] uppercase tracking-widest mb-1.5 md:mb-2">
                      Era Baru
                    </p>
                    <div className="text-[9px] md:text-[10px] font-bold text-primary-900 bg-primary-50 px-2.5 py-1.5 rounded-2xl border border-primary-100 leading-tight">
                      Managed by Al Andalus IIBS
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Grid */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none -z-10" />
            </motion.div>

            {/* Content Column */}
            <div className="space-y-8 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="section-title text-left lg:ml-0 mb-6">
                  Sejarah & <br />
                  <span className="text-gradient-primary">Profil Pesantren</span>
                </h2>
                <div className="w-20 h-1.5 bg-primary-600 rounded-full mb-8 lg:mb-10" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="space-y-4 md:space-y-6 text-base md:text-[17px] text-ink-700 font-medium leading-[1.8] text-justify"
              >
                <p>
                  <span className="text-ink-950 font-black">
                    Pesantren Al Imam Al Islami
                  </span>{" "}
                  hadir sebagai babak baru dalam dunia pendidikan Islam di
                  Sukabumi. Sebagai cabang resmi dari{" "}
                  <span className="text-primary-700 italic font-bold">
                    Managed by Al Andalus IIBS
                  </span>
                  , kami menerapkan standar operasional, kurikulum, dan
                  pengasuhan yang identik dengan kampus pusat.
                </p>
                <p>
                  Kami berkomitmen mencetak kader ulama rabbani yang beraqidah
                  lurus dan berwawasan luas dengan dukungan fasilitas modern
                  serta barisan asatidzah yang kompeten di bidangnya.
                </p>
                <p>
                  Mulai tahun 2026, Al Imam Al Islami bertransformasi total untuk
                  memberikan layanan pendidikan terbaik, mencakup hirarki
                  kepengurusan yang profesional, sistem pendidikan tahfidz
                  intensif, dan pengasuhan berbasis adab.
                </p>
                <p className="font-bold text-primary-800 bg-primary-50/50 p-6 sm:p-8 rounded-3xl border border-primary-100 italic text-center text-lg mt-6">
                  "Standar Internasional, Kini Hadir di Sukabumi"
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 md:pt-6"
              >
                <div className="app-card bg-white p-5 md:p-6 flex flex-col items-start group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-3xl bg-orange-50 flex items-center justify-center mb-4 text-orange-600 group-hover:scale-110 transition-transform shadow-md">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h4 className="font-black text-ink-950 text-xl md:text-2xl mb-1">
                    PREMIUM
                  </h4>
                  <p className="text-[9px] md:text-[10px] font-bold text-ink-500 uppercase tracking-widest">
                    Fasilitas Modern
                  </p>
                </div>
                <div className="app-card bg-white p-5 md:p-6 flex flex-col items-start group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-3xl bg-primary-50 flex items-center justify-center mb-4 text-primary-600 group-hover:scale-110 transition-transform shadow-md">
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h4 className="font-black text-ink-950 text-lg md:text-xl tracking-tighter mb-1">
                    STABIL
                  </h4>
                  <p className="text-[9px] md:text-[10px] font-bold text-ink-500 uppercase tracking-widest">
                    Jaringan Al Andalus
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Vision Mission - Modern Cards */}
      <section className="section-std relative">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-secondary-100/50 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary-700 font-bold tracking-[0.2em] uppercase text-[10px] xl:text-xs mb-3 block"
            >
              Landasan Dasar
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-title mb-6"
            >
              Visi & Misi
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="section-subtitle"
            >
              Komitmen berkelanjutan kami dalam menjalankan misi pendidikan
              Islam yang unggul dan integratif.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Visi */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="app-card bg-white p-5 md:p-8 flex flex-col group h-full hover:-translate-y-1 transition-transform duration-500"
            >
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 text-primary-600 group-hover:scale-110 transition-transform duration-500 shadow-md">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-ink-950 mb-5">
                Visi
              </h3>
              <p className="text-lg md:text-xl font-black text-primary-800 italic leading-[1.5] md:leading-[1.4] flex-1">
                "Kaderisasi Ummat Hanif, Kontributif, dan
                Adaptif."
              </p>
            </motion.div>

            {/* Tujuan - Moved to occupy 2nd slot */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="app-card bg-linear-to-br from-secondary-50 to-white p-5 md:p-8 flex flex-col group h-full hover:-translate-y-1 transition-transform duration-500"
            >
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6 text-yellow-600 group-hover:scale-110 transition-transform duration-500 shadow-md">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-ink-950 mb-6">
                Tujuan
              </h3>
              <ul className="space-y-4 md:space-y-6 flex-1">
                {[
                  "Membentuk pribadi Hanif: lurus akidah, benar ibadah, baik akhlaq.",
                  "Membentuk Pemimpin Kontributif: memiliki jiwa leadership, berkarya, dan berperan nyata.",
                  "Membentuk pribadi Adaptif: cerdas membaca realitas, kreatif, namun teguh prinsip.",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-center group/item">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-ink-800 font-bold text-[13px] md:text-sm tracking-tight group-hover/item:text-yellow-700 transition-colors pt-0.5">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Misi - Moved to Bottom, Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 app-card bg-secondary-100/50 p-5 md:p-8 lg:p-6 hover:-translate-y-1 transition-transform duration-500 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-700 group-hover:scale-110 transition-transform duration-500 border border-primary-100 shadow-md shrink-0">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-ink-950">
                  Misi Utama
                </h3>
              </div>

              <ul className="grid md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6">
                {[
                  "Menguatkan akidah shahihah dan membiasakan beribadah sesuai sunnah melalui sistem Tahfidz intensif, pembelajaran Bahasa Arab, dan adab Islami.",
                  "Membina jiwa Leadership melalui partisipasi aktif dalam organisasi, manajemen kegiatan, dan public speaking berbasis dakwah.",
                  "Membimbing pembentukan karakter melalui sistem pengasuhan berbasis fitrah dengan pendekatan penyadaran dan pendewasaan.",
                  "Membekali Hard Skill melalui kewirausahaan dan keterampilan praktis sebagai bekal hidup mandiri dan bermanfaat bagi umat.",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex gap-4 items-start group/item bg-white p-5 rounded-2xl border border-primary-50 shadow-md"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-ink-700 font-medium text-[13.5px] md:text-sm tracking-tight group-hover/item:text-primary-800 transition-colors leading-normal">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 4. CTA Section - Direct and impactful */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-white border-t border-primary-100">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary-900 bg-linear-to-br from-primary-800 to-primary-950 rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[4rem] p-5 md:p-8 sm:p-6 lg:p-24 relative overflow-hidden text-center shadow-lg border border-primary-700"
          >
            {/* Decorative background */}
            <div className="hidden sm:block absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-secondary-50/10 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-2xl md:text-4xl lg:text-6xl font-black mb-6 md:mb-8 text-white tracking-tight leading-[1.1]">
                Mari Menjadi Bagian <br />
                Keluarga <span className="text-secondary-300">Al Imam Al Islami</span>
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-10 lg:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-2">
                Daftarkan putra Anda sekarang dan persiapkan masa depan gemilang
                bersama kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                <Link href="/ppdb" className="w-full sm:w-auto">
                  <button className="w-full px-5 md:px-8 py-4 sm:py-4.5 rounded-pill bg-white text-primary-900 font-bold text-base md:text-lg shadow-lg hover:bg-secondary-100 hover:shadow-lg transition-all duration-300 min-h-[52px]">
                    Daftar Sekarang
                  </button>
                </Link>
                <Link href="/kontak" className="w-full sm:w-auto">
                  <button className="w-full flex items-center justify-center gap-2 px-5 md:px-8 py-4 sm:py-4.5 rounded-pill bg-white/10 text-white font-bold border-2 border-white/20 hover:bg-white/20 transition-all duration-300 min-h-[52px] text-base md:text-lg">
                    Hubungi Kami
                    <Send className="w-4 h-4 ml-1" />
                  </button>
                </Link>
              </div>

              {/* Trust microcopy */}
              <div className="mt-8 mb-4">
                <span className="inline-block px-4 py-1.5 rounded-pill bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] sm:text-xs text-white/80 font-bold uppercase tracking-widest">
                  ✦ Pendaftaran Gratis • Proses Mudah • Langsung Konfirmasi
                </span>
              </div>

              {/* Legalitas badges */}
              <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-2 text-gold-100/70">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Terakreditasi
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gold-100/70">
                  <BookOpen className="w-4 h-4 text-yellow-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Kurikulum Al Andalus
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gold-100/70">
                  <Award className="w-4 h-4 text-primary-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Resmi Kemendikdasmen
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}

