"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  BookMarked,
  Target,
  School,
  Images,
  ArrowRight,
  Sun,
  Moon,
  Star
} from "lucide-react";
import { Container } from "@/components/layout/Container";

const GALLERY_ITEMS = [
  {
    image: "/images/pembelajaran-kitab-turotz.webp",
    title: "Kajian Kitab Turots",
    description: "Mengkaji Kitab Turots & Ulama Salaf",
    icon: BookOpen,
  },
  {
    image: "/images/tahfidz.webp",
    title: "Halaqoh Tahfidz",
    description: "Setoran Hafalan & Muroja'ah",
    icon: BookMarked,
  },
  {
    image: "/images/extra-karate.webp",
    title: "Ekstrakurikuler",
    description: "Bela Diri, Panahan & Lifeskill",
    icon: Target,
  },
  {
    image: "/images/masjid.webp",
    title: "Masjid Jami'",
    description: "Pusat Ibadah & Tarbiyah Santri",
    icon: School,
  },
] as const;

function GalleryCard({
  image,
  title,
  description,
  icon: Icon,
}: (typeof GALLERY_ITEMS)[number]) {
  return (
    <div className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/80 via-maroon-900/20 to-transparent opacity-90 transition-opacity duration-300" />
      </div>

      {/* Floating Icon */}
      <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 text-white">
        <Icon className="w-5 h-5" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-white font-bold text-lg mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{title}</h3>
        <p className="text-cream-50/80 text-sm translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-[50ms]">{description}</p>
      </div>
    </div>
  );
}

export default function GallerySection() {
  return (
    <section id="gallery" className="section-std !pb-0">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream-50 border border-cream-200 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
              <Images className="w-3.5 h-3.5" />
              <span>Dokumentasi</span>
            </div>
            <h2 className="section-title mb-0">
              Galeri <span className="text-gradient-maroon">Aktivitas</span>
            </h2>
            <p className="section-subtitle lg:ml-0 text-left mt-4 text-justify">
              Intip kegiatan sehari-hari para santri dalam menuntut ilmu dan beribadah.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <Link href="/kegiatan">
              <button className="btn-secondary px-8">
                Lihat Semua
              </button>
            </Link>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 lg:mb-20">
          {GALLERY_ITEMS.map((item, idx) => (
             <GalleryCard key={idx} {...item} />
          ))}
        </div>

        {/* Daily Schedule Preview (Wablas Card like - Modified to Cream/Maroon style) */}
        <div className="bg-gradient-to-br from-brand-yellow-100 to-white p-8 md:p-12 relative overflow-hidden rounded-t-[3rem] border border-cream-200 border-b-0 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
            <div>
              <h3 className="text-3xl font-black text-maroon-900 mb-4 tracking-tight">Jadwal Harian Berkah</h3>
              <p className="text-ink-600 font-medium mb-8 max-w-md leading-relaxed text-justify">
                Setiap detik sangat berharga. Kami mengatur jadwal santri agar seimbang antara ibadah, belajar, istirahat, dan bersosialisasi.
              </p>
              <Link href="/kalender">
                <button className="btn-primary w-full sm:w-auto px-8">
                  Lihat Jadwal Lengkap
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="app-card p-4 sm:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-yellow-50 flex items-center justify-center text-yellow-600 shadow-sm shrink-0">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-ink-500 uppercase tracking-widest leading-none mb-1">Pagi</p>
                  <p className="font-bold text-ink-900 text-sm sm:text-[15px] leading-tight">Tahfidz & Muroja'ah</p>
                </div>
              </div>
              <div className="app-card p-4 sm:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-brand-blue-50 flex items-center justify-center text-brand-blue-600 shadow-sm shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-ink-500 uppercase tracking-widest leading-none mb-1">Siang</p>
                  <p className="font-bold text-ink-900 text-sm sm:text-[15px] leading-tight">Sekolah Formal</p>
                </div>
              </div>
              <div className="app-card p-4 sm:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-ink-500 uppercase tracking-widest leading-none mb-1">Sore</p>
                  <p className="font-bold text-ink-900 text-sm sm:text-[15px] leading-tight">Ekskul & Olahraga</p>
                </div>
              </div>
              <div className="app-card p-4 sm:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-ink-500 uppercase tracking-widest leading-none mb-1">Malam</p>
                  <p className="font-bold text-ink-900 text-sm sm:text-[15px] leading-tight">Belajar Mandiri</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </Container>
    </section>
  );
}