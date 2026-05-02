"use client";

import Link from "next/link";
import { BookOpen, Award, Users, BookOpenCheck, ShieldCheck, Zap, Building2, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Menghidupkan Fitrah Santri",
    description: "Berupaya maksimal menghidupkan fitrah santri, diiringi adab Islami dalam setiap interaksi.",
  },
  {
    icon: ShieldCheck,
    title: "Pengawasan di Setiap Aktivitas",
    description: "Pengawasan menyeluruh di setiap aktivitas santri untuk memastikan perkembangan yang optimal.",
  },
  {
    icon: Users,
    title: "Musyrif Tinggal di Kamar Santri",
    description: "Musyrif (Guru Asrama) tinggal langsung di kamar santri untuk pendampingan intensif 24 jam.",
  },
  {
    icon: Zap,
    title: "Pendekatan Penyadaran & Pendewasaan",
    description: "Bimbingan dengan pendekatan penyadaran dan pendewasaan pada setiap kesalahan santri, bukan sekadar hukuman.",
  },
  {
    icon: Award,
    title: "Tidak Ada Hukuman Fisik",
    description: "Tidak menerapkan hukuman yang membahayakan fisik dalam proses pembinaan santri.",
  },
  {
    icon: Building2,
    title: "Tidak Ada Senioritas Menghukum",
    description: "Tidak memberikan kewenangan pada santri senior untuk menghukum santri lain.",
  },
] as const;

export default function FeaturesSection() {
  return (
    <section id="keunggulan" className="section-std">
      <Container>
        <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">

          {/* TEXT SIDE */}
          <div className="lg:w-1/2 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream-50 border border-cream-200 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  <span>Keunggulan Utama</span>
                </div>
                <h2 className="section-title mb-3">
                  Kenapa Harus PPDB
                </h2>
                <p className="text-xs font-bold text-brand-blue-600 uppercase tracking-widest mb-6">
                  Managed by PPDB Modern IIBS
                </p>
                <p className="text-lg text-ink-600 leading-relaxed font-medium text-justify lg:text-left">
                  Sistem pembentukan karakter berbasis <strong className="text-brand-blue-700">Lingkungan, Kebiasaan, Komunitas, dan Spiritualitas</strong> — bukan sekadar tempat belajar agama.
                </p>
              </div>

              <div className="flex flex-col gap-6 pt-2">
                {FEATURES.map((feature, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-[2rem] flex gap-6 group items-start border border-cream-200/60 hover:border-brand-blue-300 hover:shadow-premium-xl transition-all duration-500 cursor-default"
                  >
                    <div className="w-16 h-16 rounded-[1.25rem] bg-linear-to-br from-brand-yellow-50 to-brand-yellow-100 flex items-center justify-center shrink-0 shadow-premium-xs group-hover:bg-brand-blue-700 group-hover:rotate-6 transition-all duration-500">
                      <feature.icon className="w-8 h-8 text-brand-blue-800 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-black text-ink-950 text-lg mb-2 group-hover:text-brand-blue-800 transition-colors tracking-tight">{feature.title}</h4>
                      <p className="text-[14px] text-ink-600 leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/ppdb" className="inline-block">
                  <button className="btn-primary w-full sm:w-auto text-base">
                    Daftar Sekarang
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* IMAGE/CARD SIDE */}
          <div className="lg:w-1/2 relative w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 grid grid-cols-2 gap-4 lg:gap-6"
            >
              <div className="space-y-4 lg:space-y-6 mt-12">
                <div className="app-card p-6 sm:p-8 min-h-56 md:h-64 flex flex-col justify-end items-start group">
                  <p className="text-4xl lg:text-5xl font-black text-maroon-900 mb-2 tracking-tighter uppercase">TA 26/27</p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-ink-700 uppercase tracking-wider">Angkatan Pertama</p>
                    <p className="text-xs leading-tight text-ink-500 font-medium">
                      Dimulainya Sejarah Baru <br />
                      <span className="text-brand-blue-700 font-bold block mt-1">Managed by PPDB Modern IIBS</span>
                    </p>
                  </div>
                </div>

                <div className="bg-linear-to-br from-brand-blue-600 via-brand-blue-700 to-brand-blue-900 border border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-xl min-h-64 md:h-72 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                  <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay" />
                  {/* Decorative glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-yellow-400/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-brand-yellow-400/30 transition-colors" />
                  
                  <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md group-hover:scale-110 transition-transform duration-500 border border-white/20 shadow-inner">
                    <BookOpenCheck className="w-10 h-10 text-brand-yellow-300" />
                  </div>
                  <h3 className="font-black text-2xl text-white tracking-tight leading-tight group-hover:text-brand-yellow-100 transition-colors">
                    Tahfidz<br />Intensif
                  </h3>
                  <div className="mt-4 w-12 h-1 bg-brand-yellow-400/30 rounded-full group-hover:w-16 group-hover:bg-brand-yellow-400 transition-all duration-500" />
                </div>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <div className="app-card p-6 sm:p-8 min-h-64 md:h-72 flex flex-col justify-center items-center text-center group">
                  <div className="w-20 h-20 bg-brand-yellow-100 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <ShieldCheck className="w-10 h-10 text-brand-blue-600" />
                  </div>
                  <p className="font-black text-2xl text-maroon-900">Lingkungan<br />Islami</p>
                </div>

                <div className="bg-cream-50/80 backdrop-blur-lg border border-cream-200 p-6 sm:p-8 rounded-[2rem] shadow-sm min-h-56 md:h-64 flex flex-col justify-end items-start hover:shadow-md transition-all duration-300">
                  <p className="text-4xl font-black mb-1 text-maroon-800 tracking-tighter">RESMI</p>
                  <div className="space-y-1 mt-2">
                    <p className="text-sm font-bold text-ink-800">Ijazah Diakui Negara</p>
                    <p className="text-xs text-ink-500 font-medium leading-tight">
                      Kemendikdasmen RI (B)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cream-200/40 rounded-full blur-[100px] z-0" />
          </div>

        </div>
      </Container>
    </section>
  );
}