"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  GraduationCap,
  Sparkles,
  Globe
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

import { BRANDING } from "@/config/branding";

export default function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative min-h-[95vh] flex items-center pt-20 pb-16 md:pt-24 lg:pt-28 lg:pb-24 overflow-hidden bg-brand-blue-50/30">
      {/* Sophisticated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[15%] w-[60%] h-[60%] bg-brand-blue-200/20 blur-[140px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[50%] bg-brand-yellow-200/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[0%] left-[20%] w-[40%] h-[40%] bg-brand-blue-50/60 blur-[100px] rounded-full" />
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6 lg:gap-8 text-center lg:text-left"
          >
            <div className="space-y-4 lg:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 mt-4 lg:mt-0 rounded-pill bg-white border border-brand-blue-100 shadow-sm text-brand-blue-800 text-[10px] lg:text-xs font-bold uppercase tracking-widest mx-auto lg:mx-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-yellow-500" />
                <span>Premium Quality • Managed by Andalus Demo System</span>
              </motion.div>

              <h1 className="leading-[1.1] tracking-tight mx-auto lg:mx-0 max-w-2xl lg:max-w-none text-brand-blue-950 font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                <span className="block mb-2">Sistem PPDB</span>
                <span className="block text-transparent bg-clip-text bg-linear-to-r from-brand-blue-900 via-brand-yellow-600 to-brand-blue-950 drop-shadow-sm pb-2">
                  Modern, Cepat, <br className="hidden xl:block" />
                  dan Elegan
                </span>
              </h1>

              <p className="text-base lg:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium font-sans text-ink-700/80 text-center lg:text-left">
                Bukan sekadar sistem pendaftaran — sebuah pengalaman digital berbasis <span className="font-bold text-brand-blue-900">Kecepatan, Kemudahan, Keamanan, dan Estetika</span> untuk institusi pendidikan modern.
              </p>

              <div className="mt-4 pt-4 border-t border-cream-200/50">
                <p className="text-sm lg:text-base font-bold text-brand-blue-800 text-center lg:text-left italic">
                  "Pendidikan Berkualitas, Diperkuat Sistem {BRANDING.schoolName.includes("PPDB Modern") ? "PPDB Modern" : BRANDING.schoolShortName}"
                </p>
              </div>
            </div>

            {/* CTA Group */}
            <div className="flex flex-col gap-4 lg:gap-5 justify-center lg:justify-start w-full mt-2">
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start w-full sm:w-auto">
                <Link href="/ppdb" className="w-full sm:w-auto">
                  <button className="btn-primary w-full px-8 lg:px-10 py-4 lg:py-5 min-h-[56px] text-base shadow-lg shadow-maroon-800/20">
                    Daftar PPDB Sekarang
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </button>
                </Link>
                <Link href="/program" className="w-full sm:w-auto">
                  <button className="btn-secondary w-full px-8 lg:px-10 py-4 lg:py-5 min-h-[56px] text-base">
                    Lihat Program Studi
                  </button>
                </Link>
              </div>

              {/* Trust microcopy */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mt-1">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-cream-200 border-2 border-white flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-maroon-100" />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-ink-600">
                  <span className="text-brand-blue-700 font-bold uppercase tracking-wider">Angkatan Pertama</span> • Managed by PPDB Modern IIBS
                </p>
              </div>
            </div>
          </motion.div>

          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative w-full mt-8 lg:mt-0"
          >
            {/* Main Image Container */}
            <div className="relative z-10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-8 sm:border-[12px] border-white ring-1 ring-brand-blue-100 bg-white">
              <Image
                src="/images/hero.webp"
                alt={BRANDING.schoolName}
                width={800}
                height={600}
                className="w-full h-auto object-cover aspect-[4/3] hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-900/40 via-transparent to-transparent opacity-60" />
            </div>

            {/* Floating Info Cards - Fintech Style */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 sm:-top-4 lg:-top-6 -right-1 sm:-right-2 lg:-right-8 z-20 flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md p-2 px-3 sm:p-3 sm:px-4 lg:p-4 rounded-2xl shadow-xl border border-white/50 scale-[0.85] sm:scale-100 origin-right"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-brand-yellow-100 flex items-center justify-center text-brand-yellow-600">
                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-[10px] lg:text-xs font-bold text-ink-600 uppercase tracking-widest">Tersedia</p>
                <p className="text-xs lg:text-sm font-black text-brand-blue-900">MTs &amp; SMA</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 sm:-bottom-6 lg:-bottom-10 -left-1 sm:-left-2 lg:-left-8 z-20 flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md p-2 px-3 sm:p-3 sm:px-4 lg:p-4 rounded-2xl shadow-xl border border-white/50 scale-[0.85] sm:scale-100 origin-left"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-brand-blue-100 flex items-center justify-center text-brand-blue-600">
                <Globe className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-black text-brand-blue-900">Jaringan Elit</p>
                <p className="text-[10px] lg:text-xs font-semibold text-ink-600">Andalus Demo</p>
              </div>
            </motion.div>

            {/* Aesthetic Blobs */}
            <div className="absolute -z-10 -bottom-12 -right-12 w-48 h-48 sm:w-64 sm:h-64 bg-brand-blue-300/20 blur-3xl rounded-full" />
            <div className="absolute -z-10 -top-12 -left-12 w-36 h-36 sm:w-48 sm:h-48 bg-brand-yellow-400/20 blur-2xl rounded-full" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
