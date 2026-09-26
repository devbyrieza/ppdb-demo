"use client";

// src/components/home/BentoGridSection.tsx
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { ArrowRight, BookOpen, Utensils, Home, Monitor, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BentoGridSection() {
  return (
    <section id="fasilitas" className="py-24 bg-white border-b border-slate-200 scroll-mt-20 overflow-hidden">
      <Container className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#550000] bg-[#ddc192]/20 px-4 py-1.5 rounded-full border border-[#ddc192]/50 inline-block">
            Sarana & Prasarana
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Lingkungan Belajar <span className="text-[#550000]">Kondusif & Terpadu</span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Fasilitas representatif didesain untuk menunjang kelancaran hafalan Al-Qur'an, kajian kitab turots, dan kesehatan fisik santri.
          </p>
        </div>

        {/* Bento Grid Layout (OMI Standard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
          
          {/* Card 1: Large Feature (Span 2 cols, 2 rows) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-2 row-span-2 rounded-3xl overflow-hidden border border-slate-200/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7),_0_2px_10px_rgba(0,0,0,0.04)] relative group bg-slate-900 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9),_0_8px_30px_rgba(85,0,0,0.08)] transition-all duration-300"
          >
            <Image
              src="/images/masjid-jami-al-furqon-al-imam-al-islami-dari-luar.png"
              alt="Masjid Jami' Al-Furqon Al Imam"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-end text-white">
              <div className="w-12 h-12 bg-[#ddc192] text-[#550000] rounded-2xl flex items-center justify-center mb-4 font-bold shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold uppercase text-[#ddc192] tracking-wider mb-1">
                Pusat Ibadah & Halaqah
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                Masjid Jami' Al Imam
              </h3>
              <p className="text-white/80 text-xs sm:text-sm max-w-md font-normal leading-relaxed">
                Pusat kegiatan sholat berjamaah lima waktu, halaqah tahfidz Al-Qur'an intensif, serta taklim rutin santri.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Medium Feature (Span 2 cols, 1 row) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 lg:col-span-2 row-span-1 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 flex items-center gap-4 sm:gap-6 shadow-xs hover:border-[#ddc192] transition-all group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4 text-[#550000] shrink-0" />
                <span className="font-extrabold text-[#550000] tracking-wider uppercase text-[10px]">
                  Kelas Multimedia
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-1 group-hover:text-[#550000] transition-colors leading-snug">
                Ruang Kelas Ber-AC & Interaktif
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-normal line-clamp-3 sm:line-clamp-none">
                Pencahayaan alami, pendingin ruangan, dan perangkat multimedia untuk pembelajaran sains dan bahasa Arab.
              </p>
            </div>
            <div className="w-20 h-20 sm:w-28 sm:h-28 relative rounded-2xl overflow-hidden shrink-0 border border-slate-200">
              <Image src="/images/kelas-bagian-dalam-saat-para-santri-belajar.png" alt="Santri Belajar di Kelas" fill className="object-cover" />
            </div>
          </motion.div>

          {/* Card 3: Asrama */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 row-span-1 rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-[#ddc192] transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#ddc192]/20 text-[#550000] flex items-center justify-center font-bold mb-4">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-[#550000] transition-colors">
                Asrama Santri
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-normal">
                Hunian bersih, kasur bertingkat kokoh, dan bimbingan musyrif adab 24 jam.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Gizi & Nutrisi */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 row-span-1 rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-[#ddc192] transition-all group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4 border border-emerald-100">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
                Gizi Sehat & Higienis
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-normal">
                Penyajian menu makan bernutrisi 3 kali sehari dengan standar kebersihan ketat.
              </p>
            </div>
          </motion.div>

        </div>

        <div className="mt-12 text-center">
          <Link
            href="/fasilitas"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-[#550000] hover:underline uppercase tracking-wider"
          >
            <span>Jelajahi Seluruh Sarana Kampus</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </Container>
    </section>
  );
}
