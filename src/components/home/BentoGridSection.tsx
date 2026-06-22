"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { ArrowRight, BookOpen, Coffee, Home, Monitor, Wifi } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BentoGridSection() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-label section-label-teal mb-4">Fasilitas Ekosistem</span>
          <h2 className="text-3xl md:text-5xl font-black mb-6">Lingkungan Belajar Ideal</h2>
          <p className="text-ink-600 text-lg">Semua fasilitas didesain khusus untuk mendukung perkembangan akademik, hafalan, dan karakter santri secara maksimal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[240px]">
          
          {/* Card 1: Large Feature (Span 2 cols, 2 rows) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-2 row-span-2 bento-card relative group"
          >
            <Image src="/images/hero.jpg" alt="Masjid" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Masjid Jami' Pusat Hafalan</h3>
              <p className="text-white/80 max-w-md">Pusat kegiatan ibadah dan halaqah tahfidz Al-Qur'an dengan suasana yang tenang dan kondusif.</p>
            </div>
          </motion.div>

          {/* Card 2: Medium Feature (Span 2 cols, 1 row) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 lg:col-span-2 row-span-1 bento-card relative bg-primary-50 p-6 flex items-center gap-6 group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-primary-900 tracking-wide uppercase text-sm">Tech-Enabled</span>
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-2 group-hover:text-primary-700 transition-colors">Lab Komputer & Multimedia</h3>
              <p className="text-ink-600 text-sm">Fasilitas modern untuk mendukung pembelajaran IT dan kemampuan digital santri.</p>
            </div>
            <div className="w-32 h-32 relative rounded-xl overflow-hidden shrink-0 shadow-md">
              <Image src="/images/hero.jpg" alt="Lab" fill className="object-cover" />
            </div>
          </motion.div>

          {/* Card 3: Small Feature */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 row-span-1 bento-card bg-surface-100 p-6 flex flex-col justify-between group"
          >
            <div>
              <Home className="w-8 h-8 text-secondary-600 mb-4" />
              <h3 className="text-lg font-bold text-ink-900 mb-2">Asrama Nyaman</h3>
              <p className="text-ink-600 text-sm">Standar kenyamanan tinggi, AC, dan ruang yang representatif.</p>
            </div>
          </motion.div>

          {/* Card 4: Small Feature */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 row-span-1 bento-card bg-surface-100 p-6 flex flex-col justify-between group"
          >
            <div>
              <Coffee className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-bold text-ink-900 mb-2">Pusat Nutrisi</h3>
              <p className="text-ink-600 text-sm">Dapur bersih dengan standar gizi terbaik untuk santri.</p>
            </div>
          </motion.div>

        </div>

        <div className="mt-12 text-center">
          <Link href="/fasilitas" className="inline-flex items-center gap-2 text-primary-700 font-bold hover:text-primary-800 hover:underline underline-offset-4 transition-all">
            Lihat Semua Fasilitas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
