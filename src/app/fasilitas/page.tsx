"use client";

import Link from "next/link";
import Image from "next/image";
import {
  School,
  Droplets,
  Home,
  BookOpen,
  Wifi,
  Utensils,
  Heart,
  Shield,
  Building,
  Building2,
  FlaskConical,
  MonitorPlay,
  Cpu,
  Award,
  CheckCircle2,
  Sparkles,
  Users,
  Droplet,
  Zap,
  Video,
  Lightbulb,
  Wind,
  Check,
  MapPin,
  Trophy,
  Star,
  TrendingUp,
  ArrowRight,
  Camera
} from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";

// ========================================
// REUSABLE COMPONENTS
// ========================================

const HeroStat = ({ icon: Icon, value, label, delay = 0 }: { icon: any, value: string, label: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="app-card bg-white p-5 flex flex-col items-center text-center min-w-[140px]"
  >
    <div className="w-12 h-12 rounded-xl bg-cream-100/50 flex items-center justify-center text-maroon-700 mb-3 border border-cream-200 shadow-sm">
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-2xl font-black text-ink-950 leading-none mb-1">{value}</p>
    <p className="text-[10px] text-ink-500 font-extrabold uppercase tracking-widest">{label}</p>
  </motion.div>
);

export default function FasilitasPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* 1. Hero Section - Airy & Clean */}
      <section className="relative py-24 md:py-32 overflow-hidden section-std">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cream-100/60 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream-50 border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Sarana & Prasarana</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-7xl lg:text-8xl font-black mb-6 md:mb-10 tracking-tight leading-[0.9] text-ink-950"
              >
                Fasilitas <br />
                <span className="text-gradient-maroon">Terbaik Kita</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-ink-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium mb-12"
              >
                Kami menyediakan lingkungan belajar yang kondusif, nyaman, dan modern untuk mendukung tumbuh kembang santri secara optimal.
              </motion.p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <HeroStat icon={Home} value="15+" label="Kamar Asrama" delay={0.3} />
                <HeroStat icon={School} value="12+" label="Ruang Kelas" delay={0.4} />
                <HeroStat icon={BookOpen} value="1K+" label="Koleksi Buku" delay={0.5} />
              </div>
            </div>

            {/* Decorative Gallery Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative hidden lg:grid grid-cols-2 gap-6 h-[600px]"
            >
              <div className="space-y-6 pt-12">
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-lg relative group border border-cream-200">
                  <Image src="/images/masjid.webp" alt="Masjid" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/60 to-transparent flex items-end p-8">
                    <span className="text-white font-bold text-xl drop-shadow-md">Masjid Jami'</span>
                  </div>
                </div>
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-lg relative group border border-cream-200">
                  <Image src="/images/lapangan-minisoccer.webp" alt="Lapangan" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/60 to-transparent flex items-end p-8">
                    <span className="text-white font-bold text-lg drop-shadow-md">Area Olahraga</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-lg relative group border border-cream-200">
                  <Image src="/images/asrama.webp" alt="Asrama" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/60 to-transparent flex items-end p-8">
                    <span className="text-white font-bold text-lg drop-shadow-md">Asrama Nyaman</span>
                  </div>
                </div>
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-lg relative group border border-cream-200">
                  <Image src="/images/kelas-dari-dalam.webp" alt="Kelas" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/60 to-transparent flex items-end p-8">
                    <span className="text-white font-bold text-xl drop-shadow-md">Kelas Modern</span>
                  </div>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-[2rem] shadow-xl border border-cream-200 flex flex-col items-center gap-1 z-20">
                <Camera className="w-8 h-8 text-maroon-600 mb-1" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-500">Sneak Peek</span>
                <span className="text-sm font-black text-maroon-900">Campus Tour</span>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 2. Main Facilities - Big Sections */}
      <section className="py-24 md:py-32 relative section-alt border-y border-cream-200">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-maroon-700 font-bold tracking-[0.2em] uppercase text-[10px] xl:text-xs mb-3 block"
            >
              Fasilitas Utama
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title mb-6"
            >
              Pusat Kegiatan Santri
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-subtitle"
            >
              Sarana vital yang menjadi jantung aktivitas harian di <br className="hidden md:block" /> Pesantren Al-Andalus Al-Imam untuk kenyamanan dan kekhusyukan.
            </motion.p>
          </div>

          <div className="space-y-24 lg:space-y-32">
            {/* Masjid */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="app-card bg-white p-8 sm:p-12 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <Home className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cream-100 rounded-2xl flex items-center justify-center text-maroon-700 mb-8 sm:mb-10 shadow-sm transition-transform group-hover:scale-110 border border-cream-200">
                    <Home className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink-950 mb-6 leading-[1.1]">Masjid Jami' <br className="hidden sm:block" /> Al-Imam</h3>
                  <p className="text-base sm:text-lg lg:text-xl text-ink-600 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Pusat peribadatan santri yang mampu menampung 1000 jamaah. Dilengkapi pendingin ruangan, karpet premium, dan sistem audio berkualitas tinggi.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">Kapasitas Luas</h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">2 Lantai utama luas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">Kenyamanan</h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">Full AC & Karpet Empuk</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-4 shadow-xl relative rotate-2 hover:rotate-0 transition-transform duration-700 border border-cream-200">
                  <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3.2rem] overflow-hidden">
                    <Image
                      src="/images/masjid.webp"
                      alt="Masjid Jami' Al-Imam"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Asrama */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1"
              >
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-4 shadow-xl relative -rotate-2 hover:rotate-0 transition-transform duration-700 border border-cream-200">
                  <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3.2rem] overflow-hidden">
                    <Image
                      src="/images/asrama.webp"
                      alt="Asrama Santri"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2"
              >
                <div className="app-card bg-white p-8 sm:p-12 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <Building className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cream-100 rounded-2xl flex items-center justify-center text-maroon-700 mb-8 sm:mb-10 shadow-sm transition-transform group-hover:scale-110 border border-cream-200">
                    <Building className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink-950 mb-6 leading-[1.1]">Asrama <br className="hidden sm:block" /> Berkualitas</h3>
                  <p className="text-base sm:text-lg lg:text-xl text-ink-600 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Hunian nyaman dengan sirkulasi udara optimal. Setiap kamar didesain dengan konsep kekeluargaan dan dilengkapi fasilitas penyimpanan pribadi.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">Kekeluargaan</h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">Musyrif Pembimbing 24 jam</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">Higienitas</h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">Standar kebersihan tinggi</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            {/* Ruang Kelas */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="app-card bg-white p-8 sm:p-12 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <School className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cream-100 rounded-2xl flex items-center justify-center text-maroon-700 mb-8 sm:mb-10 shadow-sm transition-transform group-hover:scale-110 border border-cream-200">
                    <School className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink-950 mb-6 leading-[1.1]">Ruang Kelas <br className="hidden sm:block" /> Modern</h3>
                  <p className="text-base sm:text-lg lg:text-xl text-ink-600 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Ruang kelas yang didesain ergonomis dan modern untuk konsentrasi belajar maksimal. Setiap kelas dilengkapi alat peraga edukatif dan sirkulasi udara yang baik.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">Ergonomis</h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">Meja Kursi Nyaman</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">Interaktif</h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">Fasilitas Multimedia</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-4 shadow-xl relative rotate-2 hover:rotate-0 transition-transform duration-700 border border-cream-200">
                  <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3.2rem] overflow-hidden">
                    <Image
                      src="/images/kelas-dari-dalam.webp"
                      alt="Ruang Kelas Modern"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Lapangan Minisoccer */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1"
              >
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-4 shadow-xl relative -rotate-2 hover:rotate-0 transition-transform duration-700 border border-cream-200">
                  <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3.2rem] overflow-hidden">
                    <Image
                      src="/images/lapangan-minisoccer.webp"
                      alt="Lapangan Minisoccer"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2"
              >
                <div className="app-card bg-white p-8 sm:p-12 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <Trophy className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cream-100 rounded-2xl flex items-center justify-center text-maroon-700 mb-8 sm:mb-10 shadow-sm transition-transform group-hover:scale-110 border border-cream-200">
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink-950 mb-6 leading-[1.1]">Lapangan <br className="hidden sm:block" /> Minisoccer</h3>
                  <p className="text-base sm:text-lg lg:text-xl text-ink-600 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Sarana olahraga outdoor berkualitas untuk mendukung kesehatan fisik dan bakat atletik santri. Lapangan rumput sintetis standar yang aman dan nyaman.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">Kualitas</h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">Rumput Sintetis Premium</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">Sejarah</h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">Area Luas & Bersih</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Kantor PPDB & Tamu */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1"
              >
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-4 shadow-xl relative -rotate-2 hover:rotate-0 transition-transform duration-700 border border-cream-200">
                  <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3.2rem] overflow-hidden">
                    <Image
                      src="/images/kantor-ppdb-tamu.webp"
                      alt="Kantor PPDB & Tamu"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2"
              >
                <div className="app-card bg-white p-8 sm:p-12 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <Building className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cream-100 rounded-2xl flex items-center justify-center text-maroon-700 mb-8 sm:mb-10 shadow-sm transition-transform group-hover:scale-110 border border-cream-200">
                    <Building className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink-950 mb-6 leading-[1.1]">Kantor PPDB <br className="hidden sm:block" /> & Tamu</h3>
                  <p className="text-base sm:text-lg lg:text-xl text-ink-600 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Pusat informasi dan pendaftaran santri baru. Dilengkapi dengan ruang tunggu yang nyaman dan staf yang siap membantu proses pendaftaran.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">Informasi</h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">Layanan 24 Jam</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-maroon-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">Kenyamanan</h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">Ruang Tunggu AC</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Supporting Facilities - Enhanced Grid (TEXT-ONLY - Secondary List) */}
      <section className="py-24 md:py-32 bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-ink-950 mb-4"
            >
              Fasilitas <span className="text-maroon-700">Penunjang</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-base md:text-lg text-ink-600 font-medium leading-relaxed"
            >
              Lengkap dengan sarana pendukung untuk mengembangkan <br className="hidden md:block" /> minat, bakat, dan kesehatan santri.
            </motion.p>
          </div>

          {/* Enhanced 3x3 Grid Layout - Smaller Typography for Text-Only Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
            {/* Row 1 - Academic Facilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-xl flex items-center justify-center text-maroon-700 mb-5 group-hover:scale-110 transition-transform border border-cream-200 shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-ink-950 mb-2">Perpustakaan</h3>
              <p className="text-sm text-ink-600 font-medium">Ribuan koleksi kitab & buku</p>
              <div className="mt-4 pt-4 border-t border-cream-200/50 w-full">
                <span className="text-xs text-maroon-700 font-bold uppercase tracking-widest">📚 Akademik</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-xl flex items-center justify-center text-maroon-700 mb-5 group-hover:scale-110 transition-transform border border-cream-200 shadow-sm">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-ink-950 mb-2">Laboratorium</h3>
              <p className="text-sm text-ink-600 font-medium">Sains & Komputer</p>
              <div className="mt-4 pt-4 border-t border-cream-200/50 w-full">
                <span className="text-xs text-maroon-700 font-bold uppercase tracking-widest">🔬 Praktikum</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-xl flex items-center justify-center text-maroon-700 mb-5 group-hover:scale-110 transition-transform border border-cream-200 shadow-sm">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-ink-950 mb-2">Dapur Sehat</h3>
              <p className="text-sm text-ink-600 font-medium">Menu bergizi 3x sehari</p>
              <div className="mt-4 pt-4 border-t border-cream-200/50 w-full">
                <span className="text-xs text-maroon-700 font-bold uppercase tracking-widest">🍽️ Nutrisi</span>
              </div>
            </motion.div>

            {/* 4. Depot Galon Gratis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-xl flex items-center justify-center text-maroon-700 mb-5 group-hover:scale-110 transition-transform border border-cream-200 shadow-sm">
                <Droplet className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-ink-950 mb-2">Depot Air</h3>
              <p className="text-sm text-ink-600 font-medium">Air minum higienis gratis</p>
              <div className="mt-4 pt-4 border-t border-cream-200/50 w-full">
                <span className="text-xs text-maroon-700 font-bold uppercase tracking-widest">💧 Minuman</span>
              </div>
            </motion.div>

            {/* 5. Klinik Santri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-xl flex items-center justify-center text-maroon-700 mb-5 group-hover:scale-110 transition-transform border border-cream-200 shadow-sm">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-ink-950 mb-2">Klinik Santri</h3>
              <p className="text-sm text-ink-600 font-medium">Layanan medis internal</p>
              <div className="mt-4 pt-4 border-t border-cream-200/50 w-full">
                <span className="text-xs text-maroon-700 font-bold uppercase tracking-widest">🏥 Kesehatan</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-xl flex items-center justify-center text-maroon-700 mb-5 group-hover:scale-110 transition-transform border border-cream-200 shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-ink-950 mb-2">Security</h3>
              <p className="text-sm text-ink-600 font-medium">Keamanan CCTV 24 Jam</p>
              <div className="mt-4 pt-4 border-t border-cream-200/50 w-full">
                <span className="text-xs text-maroon-700 font-bold uppercase tracking-widest">🛡️ Keamanan</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-xl flex items-center justify-center text-maroon-700 mb-5 group-hover:scale-110 transition-transform border border-cream-200 shadow-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-ink-950 mb-2">Aula Besar</h3>
              <p className="text-sm text-ink-600 font-medium">Kapasitas 500 orang</p>
              <div className="mt-4 pt-4 border-t border-cream-200/50 w-full">
                <span className="text-xs text-maroon-700 font-bold uppercase tracking-widest">🏛️ Event</span>
              </div>
            </motion.div>

            {/* Row 3 - Modern Facilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-xl flex items-center justify-center text-maroon-700 mb-5 group-hover:scale-110 transition-transform border border-cream-200 shadow-sm">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-ink-950 mb-2">Internet</h3>
              <p className="text-sm text-ink-600 font-medium">Akses WiFi Terfilter</p>
              <div className="mt-4 pt-4 border-t border-cream-200/50 w-full">
                <span className="text-xs text-maroon-700 font-bold uppercase tracking-widest">📶 Teknologi</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-xl flex items-center justify-center text-maroon-700 mb-5 group-hover:scale-110 transition-transform border border-cream-200 shadow-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-ink-950 mb-2">Lapangan Basket</h3>
              <p className="text-sm text-ink-600 font-medium">Lapangan olahraga standar</p>
              <div className="mt-4 pt-4 border-t border-cream-200/50 w-full">
                <span className="text-xs text-maroon-700 font-bold uppercase tracking-widest">🏀 Olahraga</span>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 4. Photo Gallery - Enhanced Layout */}
      <section id="gallery" className="py-24 md:py-32 section-alt border-y border-cream-200">
        <Container>
          <div className="text-center md:text-left max-w-3xl mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Dokumentasi</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-title mb-6 md:mb-4 lg:mb-6 text-center md:text-left lg:ml-0"
            >
              Galeri <span className="text-gradient-maroon">Fasilitas</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-subtitle lg:ml-0"
            >
              Lihat langsung suasana dan lingkungan Pesantren Al-Andalus Al-Imam dari berbagai sudut.
            </motion.p>
          </div>

          {/* Enhanced Gallery Grid with Better Layout */}
          <div className="max-w-7xl mx-auto">
            {/* Hero Row - Large Featured Images - REARRANGED: Masjid + Ruang Kelas Raksasa */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
              {/* Masjid - Large Featured */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 row-span-2 relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-500 border border-cream-200"
              >
                <Image
                  src="/images/masjid.webp"
                  alt="Masjid Jami' Al-Imam"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/70 via-maroon-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8">
                  <span className="text-white font-black text-2xl md:text-3xl drop-shadow-md">Masjid Jami' Al-Imam</span>
                  <p className="text-cream-50/90 text-sm md:text-lg mt-1 md:mt-2 font-medium">Pusat peribadatan</p>
                </div>
              </motion.div>

              {/* RUANG KELAS - SMALLER VIEW */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1 row-span-2 relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group aspect-[4/3] lg:aspect-[2/3] shadow-md hover:shadow-xl transition-all duration-500 border border-cream-200"
              >
                <Image
                  src="/images/kelas-dari-dalam.webp"
                  alt="Ruang Kelas dari Dalam - View Lengkap"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/70 via-maroon-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8">
                  <span className="text-white font-black text-xl md:text-2xl drop-shadow-md leading-tight">Ruang Kelas</span>
                  <p className="text-cream-50/90 text-xs md:text-sm mt-1 md:mt-2 font-medium">Fasilitas pembelajaran modern</p>
                </div>
              </motion.div>
            </div>

            {/* Second Row - Academic & Residential */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden group aspect-square shadow-sm hover:shadow-md transition-all duration-500 border border-cream-200"
              >
                <Image
                  src="/images/gedung-kelas.webp"
                  alt="Gedung Kelas"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/70 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                  <span className="text-white font-black text-[15px] sm:text-lg">Gedung Kelas</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden group aspect-square shadow-sm hover:shadow-md transition-all duration-500 border border-cream-200"
              >
                <Image
                  src="/images/asrama.webp"
                  alt="Asrama"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/70 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                  <span className="text-white font-black text-[15px] sm:text-lg">Asrama</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2 relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden group aspect-[2/1] lg:aspect-auto h-full shadow-sm hover:shadow-md transition-all duration-500 border border-cream-200"
              >
                <Image
                  src="/images/lapangan-minisoccer.webp"
                  alt="Lapangan Olahraga"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/70 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                  <span className="text-white font-black text-[15px] sm:text-xl">Lapangan Minisoccer</span>
                  <p className="text-cream-50/90 text-xs sm:text-sm mt-1 font-medium hidden sm:block">Sarana olahraga berkualitas</p>
                </div>
              </motion.div>
            </div>
            
             {/* Note Info Component using App Card Style */}
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                 className="mt-8 app-card bg-cream-50 p-6 flex items-start gap-4 border border-cream-200 max-w-2xl mx-auto"
            >
                <div className="w-10 h-10 rounded-full bg-cream-200 text-maroon-700 flex items-center justify-center shrink-0">
                   <Info className="w-5 h-5" />
                </div>
                 <p className="text-sm font-medium text-ink-700">Masih banyak fasilitas pendukung lainnya di dalam Pesantren Al-Andalus Al-Imam. Silakan jadwalkan kunjungan untuk melihat langsung.</p>
             </motion.div>

          </div>
        </Container>
      </section>
    </main >
  );
}

// Temporary Icon definitions if Info not originally imported, adding to avoid missing export.
import { Info } from "lucide-react";
