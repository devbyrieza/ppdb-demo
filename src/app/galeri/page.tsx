"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Images,
  ArrowRight,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Layers
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, AnimatePresence } from "framer-motion";
import { BRANDING } from "@/config/branding";

interface AlbumItem {
  src: string;
  label: string;
}

interface Album {
  id: string;
  title: string;
  category: string;
  desc: string;
  cover: string;
  items: AlbumItem[];
}

const ALBUMS: Album[] = [
  {
    id: "masjid",
    title: "Masjid Jami' Pesantren",
    category: "Ibadah & Spiritual",
    desc: "Pusat ibadah shalat 5 waktu berjamaah, halaqah Al-Qur'an, dan kajian keislaman para santri.",
    cover: "/images/masjid-utama-pesantren.png",
    items: [
      { src: "/images/masjid-utama-pesantren.png", label: "Tampak Depan Masjid Jami' Pesantren" },
      { src: "/images/masjid-bagian-dalam.png", label: "Interior Masjid — Ruang Shalat & Halaqah Tahfidz" },
      { src: "/images/kegiatan-halaqah-akhwat.jpg", label: "Halaqah Al-Qur'an & Mutqin Santri di Masjid" },
    ],
  },
  {
    id: "gedung-utama",
    title: "Gedung Utama & Kompleks Kampus",
    category: "Kawasan Kampus",
    desc: "Pusat kegiatan administrasi, penerimaan tamu, dan lanskap lingkungan Pesantren Al-Basyir Islamic Boarding School.",
    cover: "/images/gedung-utama-dan-lapangan-basket.png",
    items: [
      { src: "/images/gedung-utama-dan-lapangan-basket.png", label: "Gedung Utama & Area Terbuka Kampus Pesantren" },
      { src: "/images/gedung-utama-dari-bawah-tangga.png", label: "Fasad Gedung Utama dari Tangga Pelataran" },
      { src: "/images/welcome-selamat-datang.webp", label: "Kawasan Asri & Lanskap Kampus Pesantren" },
    ],
  },
  {
    id: "kelas",
    title: "Ruang Pembelajaran & Kelas",
    category: "Akademik",
    desc: "Ruang kelas modern ber-AC yang representatif dan kondusif, tempat santriwati mengkaji ilmu diniyah dan akademik.",
    cover: "/images/kegiatan-belajar-akhwat.jpg",
    items: [
      { src: "/images/kegiatan-belajar-akhwat.jpg", label: "Suasana Belajar Santriwati di Ruang Kelas Interaktif" },
      { src: "/images/kelas-bagian-dalam-1.png", label: "Interior Ruang Kelas Ber-AC — Susunan Meja Rapi" },
      { src: "/images/kelas-bagian-dalam-2.webp", label: "Ruang Kelas — Pencahayaan Alami Optimal" },
    ],
  },
  {
    id: "keterampilan-putri",
    title: "Life Skill & Keterampilan Santriwati",
    category: "Kemandirian & Karya",
    desc: "Pembekalan kecakapan hidup khas muslimah: Tata Boga (Baking/Pastry), Merajut, dan Menjahit busana syar'i.",
    cover: "/images/ekskul-tataboga-1.jpg",
    items: [
      { src: "/images/ekskul-tataboga-1.jpg", label: "Praktik Tata Boga — Pembuatan Pastry & Kuliner Sehat (1)" },
      { src: "/images/ekskul-tataboga-2.jpg", label: "Praktik Tata Boga — Olahan Kue & Kuliner Sehat (2)" },
      { src: "/images/ekskul-menjahit.jpg", label: "Praktik Menjahit — Pembuatan Busana Muslimah Syar'i" },
      { src: "/images/ekskul-merajut.jpg", label: "Praktik Merajut — Kerajinan Tangan Kreatif Santriwati" },
    ],
  },
  {
    id: "olahraga",
    title: "Olahraga & Bela Diri Muslimah",
    category: "Kebugaran & Olahraga",
    desc: "Fasilitas olahraga dan latihan karate santriwati untuk melatih kebugaran fisik, sportivitas, dan kepercayaan diri.",
    cover: "/images/ekskul-karate-akhwat.jpg",
    items: [
      { src: "/images/ekskul-karate-akhwat.jpg", label: "Bela Diri Karate Santriwati — Ketangkasan & Disiplin" },
      { src: "/images/lapangan-minisoccer.webp", label: "Lapangan Terbuka Hijau & Sarana Olahraga Santriwati" },
    ],
  },
  {
    id: "asrama",
    title: "Kompleks Asrama & Sanitasi",
    category: "Tempat Tinggal",
    desc: "Hunian asrama santriwati yang bersih, tertib, dan didampingi ustadzah musyrifah selama 24 jam.",
    cover: "/images/asrama.png",
    items: [
      { src: "/images/asrama.png", label: "Gedung Asrama & Hunian Santri" },
      { src: "/images/kamar-mandi-bagian-luar.png", label: "Area Wudhu & Wastafel Luar Toilet Asrama" },
      { src: "/images/kamar-mandi-bagian-dalam-1.png", label: "Kamar Mandi Santriwati — Bersih & Representatif (1)" },
      { src: "/images/kamar-mandi-bagian-dalam-2.png", label: "Kamar Mandi Santriwati — Bersih & Representatif (2)" },
    ],
  },
  {
    id: "kegiatan",
    title: "Kehidupan Pesantren & Halaqah",
    category: "Aktivitas Santriwati",
    desc: "Potret kehidupan nyata santri sehari-hari di kampus Pesantren Al-Basyir mulai dari halaqah tahfidz intensif hingga bimbingan adab.",
    cover: "/images/kegiatan-halaqah-akhwat.jpg",
    items: [
      { src: "/images/kegiatan-halaqah-akhwat.jpg", label: "Halaqah Tahfidz Al-Qur'an Intensif Bersama Ustadzah" },
      { src: "/images/kegiatan-belajar-akhwat.jpg", label: "Pembelajaran Kitab Turots & Sains Akademik" },
      { src: "/images/ekskul-english-club.jpg", label: "Ujian Lisan & Semaan Tahfidz Mutqin Santriwati" },
    ],
  },
  {
    id: "ekstrakurikuler",
    title: "Ekstrakurikuler Bahasa & Teknologi",
    category: "Bakat & Minat",
    desc: "Pengembangan potensi santriwati di bidang bahasa internasional, teknologi grafis, dan literasi digital.",
    cover: "/images/ekskul-english-club.jpg",
    items: [
      { src: "/images/ekskul-english-club.jpg", label: "English Club — Public Speaking & Presentasi Santriwati" },
      { src: "/images/ekskul-desain-grafis.jpg", label: "Desain Grafis — Kreativitas Digital & Desain Visual" },
      { src: "/images/ekskul-fotografi-akhwat.jpg", label: "Fotografi — Jurnalistik & Dokumentasi Santriwati" },
      { src: "/images/ekskul-komputer.png", label: "Lab Komputer — Penguasaan Teknologi & Aplikasi Perkantoran" },
    ],
  },
  {
    id: "pelayanan",
    title: "Kantor Layanan & Penunjang",
    category: "Pelayanan & Bimbingan",
    desc: "Kantor informasi SPMB, ruang tamu representatif, kantor dewan asatidzah, dan depot galon air higienis santriwati.",
    cover: "/images/kantor-spmb-ruang-tamu.png",
    items: [
      { src: "/images/kantor-spmb-ruang-tamu.png", label: "Ruang Tamu Kantor Pelayanan SPMB" },
      { src: "/images/kantor-spmb-dari-luar.webp", label: "Tampak Luar Kantor Layanan Informasi SPMB" },
      { src: "/images/kantor-guru-dan-pengasuhan.png", label: "Kantor Dewan Asatidzah & Bidang Kepengasuhan" },
      { src: "/images/depot-galon-gratis.webp", label: "Depot Air Minum Higienis Santriwati (Gratis)" },
    ],
  },
];

export default function GaleriPage() {
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Body Scroll Lock when modal is open

  const openAlbum = (album: Album, startIdx = 0) => {
    setActiveAlbum(album);
    setCurrentIndex(startIdx);
  };

  const closeAlbum = () => {
    setActiveAlbum(null);
    setCurrentIndex(0);
  };

  const nextPhoto = useCallback(() => {
    if (!activeAlbum) return;
    setCurrentIndex((prev) => (prev + 1) % activeAlbum.items.length);
  }, [activeAlbum]);

  const prevPhoto = useCallback(() => {
    if (!activeAlbum) return;
    setCurrentIndex((prev) => (prev - 1 + activeAlbum.items.length) % activeAlbum.items.length);
  }, [activeAlbum]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeAlbum) return;
      if (e.key === "Escape") closeAlbum();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAlbum, nextPhoto, prevPhoto]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white min-h-dvh">
      {/* Hero Header */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-[#FDFCF9] via-[#F8FAFC] to-white border-b border-slate-100">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none max-w-full" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-6 shadow-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Dokumentasi Resmi Pesantren</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-slate-900"
          >
            Galeri &amp; Fasilitas <br />
            <span className="text-primary">{BRANDING.schoolShortName}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Klik pada setiap album fasilitas di bawah untuk melihat kumpulan foto dokumentasi lengkap secara interaktif.
          </motion.p>
        </Container>
      </section>

      {/* Grid of Albums */}
      <section className="py-14 md:py-20 bg-slate-50/50">
        <Container>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200 shadow-xs">
                <Images className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Katalog Album Fasilitas
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Tersedia {ALBUMS.length} album fasilitas &amp; kawasan pesantren
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {ALBUMS.map((album, idx) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 3) * 0.08, duration: 0.5 }}
                onClick={() => openAlbum(album, 0)}
                className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
              >
                {/* Image Cover */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 whitespace-nowrap inline-block shrink-0">
                  <Image
                    src={album.cover}
                    alt={album.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                    <span className="text-[11px] font-bold text-white bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider">
                      {album.category}
                    </span>

                    {/* Photo count badge */}
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-300 bg-emerald-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/20 shadow-xs">
                      <Layers className="w-3.5 h-3.5" />
                      {album.items.length} Foto
                    </span>
                  </div>

                  {/* Click to open indicator */}
                  <div className="absolute bottom-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-black shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5 text-primary" />
                      Lihat Album
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 grow flex flex-col justify-between border-t border-slate-100 bg-white">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-1 mb-1.5">
                      {album.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {album.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary-700 group-hover:text-primary-800">
                    <span>Buka Galeri Foto</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Interactive Lightbox Modal */}
      <AnimatePresence>
        {activeAlbum && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between overscroll-contain overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-4 md:px-8 md:py-4 flex items-center justify-between text-white border-b border-white/10 z-20 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-white/10 px-2.5 py-0.5 rounded-full">
                    {activeAlbum.category}
                  </span>
                  <h3 className="text-base md:text-lg font-black text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
                    {activeAlbum.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Foto {currentIndex + 1} dari {activeAlbum.items.length}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={closeAlbum}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Main Photo Viewport */}
            <div className="relative grow flex items-center justify-center p-2 sm:p-4 md:p-8 select-none">
              {/* Previous Button */}
              {activeAlbum.items.length > 1 && (
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 sm:left-4 md:left-8 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                  title="Foto Sebelumnya (Panah Kiri)"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
              )}

              {/* Active Image */}
              <div className="relative w-full h-full max-w-5xl max-h-[70vh] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full h-full flex flex-col items-center justify-center"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={activeAlbum.items[currentIndex].src}
                        alt={activeAlbum.items[currentIndex].label}
                        fill
                        className="object-contain"
                        priority
                        sizes="(max-width: 1200px) 100vw, 1200px"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Button */}
              {activeAlbum.items.length > 1 && (
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 sm:right-4 md:right-8 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                  title="Foto Selanjutnya (Panah Kanan)"
                >
                  <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
              )}
            </div>

            {/* Modal Bottom Caption & Thumbnail Strip */}
            <div className="p-3 sm:p-4 md:px-8 md:py-4 bg-black/60 border-t border-white/10 shrink-0 flex flex-col items-center gap-2 sm:gap-3 z-20">
              {/* Caption */}
              <p className="text-center text-xs sm:text-sm md:text-base font-semibold text-slate-200 max-w-3xl line-clamp-2 px-4">
                {activeAlbum.items[currentIndex].label}
              </p>

              {/* Thumbnail Strip (if multi-photo) */}
              {activeAlbum.items.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 custom-scrollbar">
                  {activeAlbum.items.map((it, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        idx === currentIndex
                          ? "border-primary-400 scale-105 shadow-md "
                          : "border-white/20 opacity-50 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={it.src}
                        alt={it.label}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Footer */}
      <section className="py-20 bg-primary-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800/30 rounded-full blur-3xl pointer-events-none" />
        <Container className="relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Ingin Berkunjung Langsung ke Kampus?
          </h2>
          <p className="text-primary-200/80 max-w-xl mx-auto mb-8 text-base md:text-lg">
            Kami menyambut kunjungan silaturahmi calon santri dan orang tua untuk melihat sarana pendidikan dan asrama di {BRANDING.schoolName}.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/fasilitas"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-ink-950 font-bold text-base shadow-lg transition-all hover:-translate-y-0.5"
            >
              Rincian Fasilitas Lengkap <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-base transition-all hover:-translate-y-0.5 whitespace-nowrap shrink-0"
            >
              Daftar SPMB Sekarang
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}

