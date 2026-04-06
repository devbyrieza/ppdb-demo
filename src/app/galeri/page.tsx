"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, Images, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const GALLERY_CATEGORIES = [
  {
    title: "Fasilitas Pesantren",
    items: [
      { src: "/images/masjid.webp", label: "Masjid Jami' Ulul Albaab" },
      { src: "/images/asrama.webp", label: "Asrama Santri" },
      { src: "/images/tentang.webp", label: "Gedung Utama" },
      { src: "/images/gedung-utama-dan-lapangan-basket.webp", label: "Gedung Utama & Lapangan Basket" },
      { src: "/images/gedung-kelas.webp", label: "Gedung Kelas" },
      { src: "/images/kelas-dari-dalam.webp", label: "Ruang Kelas dari Dalam" },
      { src: "/images/luar-kelas.webp", label: "Area Luar Kelas" },
      { src: "/images/lapangan-minisoccer.webp", label: "Lapangan Mini Soccer" },
      { src: "/images/kantor-ppdb-tamu.webp", label: "Kantor PPDB & Tamu" },
      { src: "/images/depot-galon-gratis.webp", label: "Depot Galon Gratis" },
    ],
  },
  {
    title: "Kegiatan Santri",
    items: [
      { src: "/images/pembelajaran-kitab-turotz.webp", label: "Pembelajaran Kitab Turots" },
      { src: "/images/tahfidz.webp", label: "Halaqoh Tahfidz Al-Qur'an" },
      { src: "/images/extra-karate.webp", label: "Ekstrakurikuler Karate" },
    ],
  },
  {
    title: "Suasana Pesantren",
    items: [
      { src: "/images/welcome-selamat-datang.webp", label: "Selamat Datang di Ulul Albaab" },
      { src: "/images/halaman-dekat-masjid.webp", label: "Halaman Pesantren" },
    ],
  },
];

export default function GaleriPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-yellow-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-blue-50 border border-brand-blue-100 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-10 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Dokumentasi Pesantren</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-10 tracking-tight leading-[0.9] text-ink-950"
          >
            Galeri <br />
            <span className="text-gradient-blue">Ulul Albaab</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-ink-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Koleksi foto suasana, fasilitas, dan kegiatan santri di Pesantren Al-Andalus Ulul Albaab.
          </motion.p>
        </Container>
      </section>

      {/* Gallery Sections */}
      {GALLERY_CATEGORIES.map((category, catIdx) => (
        <section
          key={catIdx}
          className={`py-16 md:py-24 ${catIdx % 2 === 0 ? "bg-white" : "bg-surface-50/30"}`}
        >
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-blue-50 flex items-center justify-center text-brand-blue-700 border border-brand-blue-100">
                  <Images className="w-5 h-5" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-black text-ink-950 tracking-tight">
                  {category.title}
                </h2>
              </div>
              <div className="w-20 h-1.5 bg-brand-yellow-400 rounded-pill" />
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {category.items.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative rounded-3xl overflow-hidden group aspect-[4/3] shadow-premium-md hover:shadow-premium-xl transition-all duration-500"
                >
                  <Image
                    src={img.src}
                    alt={img.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4">
                    <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm drop-shadow-lg leading-tight block">
                      {img.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* CTA */}
      <section className="py-16 md:py-24 lg:py-32 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-brand-blue-900 bg-linear-to-br from-brand-blue-800 to-brand-blue-950 rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-8 md:p-16 lg:p-24 text-center text-white relative overflow-hidden shadow-lg"
          >
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-black mb-4 sm:mb-6 md:mb-8 text-white leading-tight">
                Tertarik? <br /> <span className="text-brand-yellow-400">Kunjungi Langsung!</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-brand-blue-50 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 font-medium px-2">
                Foto tidak cukup menggambarkan suasana sesungguhnya. Jadwalkan kunjungan ke pesantren dan rasakan sendiri.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center px-4">
                <Link href="/kontak">
                  <button className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 md:py-5 rounded-pill bg-white text-brand-blue-950 font-black text-sm sm:text-base md:text-lg hover:bg-brand-blue-50 shadow-md transition-all min-h-[48px] sm:min-h-[52px]">
                    Jadwalkan Kunjungan
                  </button>
                </Link>
                <Link href="/ppdb">
                  <button className="w-full sm:w-auto px-10 py-3.5 sm:py-4 md:py-5 rounded-pill bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg min-h-[48px] sm:min-h-[52px]">
                    Info PPDB
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}
