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

export default function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative min-h-[95vh] flex items-center pt-20 pb-16 md:pt-24 lg:pt-28 lg:pb-24 overflow-hidden bg-cream-gradient">
      {/* Sophisticated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-maroon-100/40 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[50%] bg-cream-300/30 blur-[100px] rounded-full" />
        <div className="absolute bottom-[0%] left-[20%] w-[40%] h-[40%] bg-maroon-50/60 blur-[100px] rounded-full" />
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
                className="inline-flex items-center gap-2 px-4 py-2 mt-4 lg:mt-0 rounded-pill bg-white border border-cream-200 shadow-sm text-maroon-700 text-[10px] lg:text-xs font-bold uppercase tracking-widest mx-auto lg:mx-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-cream-500" />
                <span>Terakreditasi BAN-PDM • Sejak 1995</span>
              </motion.div>

              <h1 className="leading-[1.15] tracking-tight mx-auto lg:mx-0 max-w-2xl lg:max-w-none text-maroon-900">
                <span className="block">Mencetak Generasi</span>
                <span className="block text-gradient-maroon">Hanif, Kontributif,</span>
                <span className="block text-gradient-maroon">dan Adaptif</span>
              </h1>

              <p className="text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium font-sans text-ink-600 text-center lg:text-left">
                Bukan sekadar tempat belajar agama — sistem pembentukan karakter berbasis <span className="font-bold text-maroon-800">Lingkungan, Kebiasaan, Komunitas, dan Spiritualitas</span> tanpa kekerasan dan luka pengasuhan.
              </p>
              
              <div className="mt-4 pt-4 border-t border-cream-200/50">
                <p className="text-sm lg:text-base font-bold text-maroon-800 text-center lg:text-left italic">
                  "Warisan 30 tahun, diperkuat sistem Al-Andalus"
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
                <p className="text-xs font-semibold text-ink-500">
                  <span className="text-maroon-700 font-bold">300+</span> Santri Bergabung
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
            <div className="relative z-10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl border-8 sm:border-[12px] border-white ring-1 ring-cream-200 bg-white">
              <Image
                src="/images/hero.webp"
                alt="Pesantren Al-Andalus Al-Imam"
                width={800}
                height={600}
                className="w-full h-auto object-cover aspect-[4/3] hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-900/40 via-transparent to-transparent opacity-60" />
            </div>

            {/* Floating Info Cards - Fintech Style */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 lg:-top-6 -right-2 lg:-right-8 z-20 flex items-center gap-3 bg-white/90 backdrop-blur-md p-3 px-4 lg:p-4 rounded-2xl shadow-lg border border-white/50"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-cream-100 flex items-center justify-center text-cream-600">
                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-[10px] lg:text-xs font-bold text-ink-400 uppercase tracking-widest">Tersedia</p>
                <p className="text-xs lg:text-sm font-black text-maroon-900">Beasiswa Tahfidz</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 lg:-bottom-10 -left-2 lg:-left-8 z-20 flex items-center gap-3 bg-white/90 backdrop-blur-md p-3 px-4 lg:p-4 rounded-2xl shadow-lg border border-white/50"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-maroon-50 flex items-center justify-center text-maroon-600">
                <Globe className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-black text-maroon-900">Jaringan Global</p>
                <p className="text-[10px] lg:text-xs font-semibold text-ink-500">Timur Tengah</p>
              </div>
            </motion.div>

            {/* Aesthetic Blobs */}
            <div className="absolute -z-10 -bottom-12 -right-12 w-48 h-48 sm:w-64 sm:h-64 bg-maroon-300/20 blur-3xl rounded-full" />
            <div className="absolute -z-10 -top-12 -left-12 w-36 h-36 sm:w-48 sm:h-48 bg-cream-400/20 blur-2xl rounded-full" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
