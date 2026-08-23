"use client";

import Link from "next/link";
import {
  BookOpen,
  Award,
  Users,
  BookOpenCheck,
  ShieldCheck,
  Zap,
  Building2,
  ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Menghidupkan Fitrah Santri",
    description:
      "Berupaya maksimal menghidupkan fitrah santri, diiringi adab Islami dalam setiap interaksi." },
  {
    icon: ShieldCheck,
    title: "Pengawasan di Setiap Aktivitas",
    description:
      "Pengawasan menyeluruh di setiap aktivitas santri untuk memastikan perkembangan yang optimal." },
  {
    icon: Users,
    title: "Musyrif Tinggal di Kamar Santri",
    description:
      "Musyrif (Guru Asrama) tinggal langsung di kamar santri untuk pendampingan intensif 24 jam." },
  {
    icon: Zap,
    title: "Pendekatan Penyadaran & Pendewasaan",
    description:
      "Bimbingan dengan pendekatan penyadaran dan pendewasaan pada setiap kesalahan santri, bukan sekadar hukuman." },
  {
    icon: Award,
    title: "Tidak Ada Hukuman Fisik",
    description:
      "Tidak menerapkan hukuman yang membahayakan fisik dalam proses pembinaan santri." },
  {
    icon: Building2,
    title: "Tidak Ada Senioritas Menghukum",
    description:
      "Tidak memberikan kewenangan pada santri senior untuk menghukum santri lain." },
] as const;

export default function FeaturesSection() {
  return (
    <section id="keunggulan" className="section-std relative overflow-hidden">
      {/* CiroAI-style ambient glow blobs */}
      <div className="glow-blob glow-blob-primary w-[500px] h-[500px] -top-[15%] -right-[10%] opacity-[0.12]" aria-hidden="true" />
      <div className="glow-blob glow-blob-gold w-[400px] h-[400px] bottom-[5%] left-[5%] opacity-[0.10]" aria-hidden="true" />
      <Container className="relative z-10">
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
                {/* CiroAI Section Label Badge */}
                <div className="mb-6">
                  <span className="section-label section-label-primary">
                    Keunggulan Utama
                  </span>
                </div>
                <h2 className="section-title mb-3">Kenapa Harus Al Fath?</h2>
                <p className="text-lg text-ink-600 leading-relaxed font-medium text-justify lg:text-left">
                  Sistem pembentukan karakter berbasis{" "}
                  <strong className="text-primary-700">
                    Lingkungan, Kebiasaan, Komunitas, dan Spiritualitas
                  </strong>{" "}
                  — bukan sekadar tempat belajar agama.
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
                    className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl flex gap-5 group items-start border border-secondary-100 hover:border-primary-200 hover:shadow-premium-md transition-all duration-400 cursor-default hover:-translate-y-1"
                  >
                    {/* CiroAI Icon Box */}
                    <div className="icon-box icon-box-primary w-14 h-14 rounded-2xl shrink-0">
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-ink-950 text-base mb-1.5 group-hover:text-primary-800 transition-colors tracking-tight">
                        {feature.title}
                      </h4>
                      <p className="text-[13px] text-ink-500 leading-relaxed font-medium">
                        {feature.description}
                      </p>
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
              className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6"
            >
              <div className="space-y-4 lg:space-y-6 mt-12">
                <div className="app-card p-6 sm:p-8 min-h-56 md:h-64 flex flex-col justify-end items-start group">
                  <p className="text-4xl lg:text-5xl font-black text-primary-900 mb-2 tracking-tighter uppercase">
                    TA 26/27
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-ink-700 uppercase tracking-wider">
                      Angkatan Pertama
                    </p>
                    <p className="text-xs leading-tight text-ink-500 font-medium">
                      Dimulainya Sejarah Baru <br />
                      <span className="text-primary-700 font-bold block mt-1">
                        Pesantren Al Fath
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-linear-to-br from-primary-600 via-primary-700 to-primary-900 shine-top border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl shadow-primary/30 min-h-64 md:h-72 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  {/* CiroAI-style ambient glow inside dark card */}
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-secondary-400/25 blur-[60px] rounded-full pointer-events-none group-hover:bg-secondary-400/40 transition-colors duration-700" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary-300/10 blur-[50px] rounded-full pointer-events-none" />

                  <div className="icon-box icon-box-secondary w-20 h-20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                    <BookOpenCheck className="w-10 h-10" />
                  </div>
                  <h3 className="font-black text-2xl text-white tracking-tight leading-tight group-hover:text-secondary-100 transition-colors">
                    Tahfidz
                    <br />
                    Intensif
                  </h3>
                  <div className="mt-4 w-12 h-0.5 bg-secondary-400/40 rounded-full group-hover:w-16 group-hover:bg-secondary-300 transition-all duration-500" />
                </div>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <div className="app-card p-6 sm:p-8 min-h-64 md:h-72 flex flex-col justify-center items-center text-center group">
                  <div className="w-20 h-20 bg-secondary-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <ShieldCheck className="w-10 h-10 text-primary-600" />
                  </div>
                  <p className="font-black text-2xl text-primary-900">
                    Lingkungan
                    <br />
                    Islami
                  </p>
                </div>

                <div className="bg-secondary-50/80 backdrop-blur-lg border border-secondary-200 p-6 sm:p-8 rounded-[2rem] shadow-sm min-h-56 md:h-64 flex flex-col justify-end items-start hover:shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 transition-all duration-300">
                  <p className="text-4xl font-black mb-1 text-primary-800 tracking-tighter">
                    RESMI
                  </p>
                  <div className="space-y-1 mt-2">
                    <p className="text-sm font-bold text-ink-800">
                      Ijazah Diakui Negara
                    </p>
                    <p className="text-xs text-ink-500 font-medium leading-tight">
                      Kemendikdasmen RI
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CiroAI-style center ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[120px] z-0 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(13,148,136,0.07) 0%, rgba(212,175,55,0.06) 50%, transparent 70%)" }} aria-hidden="true" />
          </div>
        </div>
      </Container>
    </section>
  );
}
