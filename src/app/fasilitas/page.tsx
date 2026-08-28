"use client";
import { useState, useEffect } from "react";

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
  Camera,
  Calendar,
  Clock,
  Smartphone,
  User } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";

// ========================================
// REUSABLE COMPONENTS
// ========================================

const HeroStat = ({
  icon: Icon,
  value,
  label,
  delay = 0 }: {
  icon: any;
  value: string;
  label: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="app-card bg-white p-5 flex flex-col items-center text-center min-w-[140px]"
  >
    <div className="w-12 h-12 rounded-3xl bg-primary-50 flex items-center justify-center text-primary-600 mb-3 border border-primary-100 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10">
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-2xl font-black text-primary-950 leading-none mb-1">
      {value}
    </p>
    <p className="text-[10px] text-primary-500/70 font-extrabold uppercase tracking-widest">
      {label}
    </p>
  </motion.div>
);

export default function FasilitasPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "success">("idle");
  
  const [visitForm, setVisitForm] = useState({
    nama: "",
    wa: "",
    tanggal: "",
    jam: "",
    jumlah: "" });

  // Autosave visitForm to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("alandalus_demo_fasilitas_visit_draft");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            setVisitForm((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch (e) {
        console.warn("Failed to load visit form draft:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("alandalus_demo_fasilitas_visit_draft", JSON.stringify(visitForm));
      } catch (e) {
        console.warn("Failed to save visit form draft:", e);
      }
    }
  }, [visitForm]);

  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Saya ingin mengajukan Jadwal Kunjungan ke Pesantren Al Imam Al Islami.

*Rincian Rencana Kunjungan:*
• Nama: ${visitForm.nama}
• WhatsApp: ${visitForm.wa}
• Tanggal: ${visitForm.tanggal}
• Waktu: ${visitForm.jam} WIB
• Jumlah Pengunjung: ${visitForm.jumlah} orang

Mohon konfirmasi kesediaan waktu kunjungan tersebut. Terima kasih.`;

    const encodedText = encodeURIComponent(message);
    // alandalus-demo CS number
    const waNumber = "6285111524441"; 
    
    window.open(`https://wa.me/${waNumber}?text=${encodedText}`, '_blank');
    setFormStatus('success');
    if (typeof window !== "undefined") {
      localStorage.removeItem("alandalus_demo_fasilitas_visit_draft");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white min-h-screen">
      {/* 1. Hero Section - Airy & Clean */}
      <section className="relative py-24 md:py-32 overflow-hidden section-std">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-50/60 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Sarana & Prasarana</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl md:text-4xl sm:text-7xl lg:text-8xl font-black mb-6 md:mb-10 tracking-tight leading-[0.9] text-ink-950"
              >
                Fasilitas <br />
                <span className="text-gradient-primary">Terbaik Kita</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-ink-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium mb-12"
              >
                Kami menyediakan lingkungan belajar yang kondusif, nyaman, dan
                modern untuk mendukung tumbuh kembang santri secara optimal.
              </motion.p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <HeroStat
                  icon={Home}
                  value="15+"
                  label="Kamar Asrama"
                  delay={0.3}
                />
                <HeroStat
                  icon={School}
                  value="12+"
                  label="Ruang Kelas"
                  delay={0.4}
                />
                <HeroStat
                  icon={BookOpen}
                  value="1K+"
                  label="Koleksi Buku"
                  delay={0.5}
                />
              </div>
            </div>

            {/* Decorative Gallery Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative hidden lg:grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]"
            >
              <div className="space-y-6 pt-12">
                <div className="aspect-[4/5] max-h-[500px] w-full rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/30  shadow-primary/20 relative group border border-primary-100 bg-gradient-to-br from-primary-950 to-primary-900">
                  <Image
                    src="/images/masjid.webp"
                    alt="Masjid"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-5 left-5 z-10">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-3xl shadow-2xl shadow-primary/30  shadow-primary/20 border border-white/40 transition-transform duration-300 group-hover:translate-y-[-4px]">
                      <span className="text-ink-950 font-black text-sm md:text-[15px] tracking-tight">
                        Masjid Jami' Al Imam
                      </span>
                    </div>
                  </div>
                </div>
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/30  shadow-primary/20 relative group border border-primary-100 bg-gradient-to-br from-primary-950 to-primary-900">
                  <Image
                    src="/images/lapangan-minisoccer.webp"
                    alt="Lapangan"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-5 left-5 z-10">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-3xl shadow-2xl shadow-primary/30  shadow-primary/20 border border-white/40 transition-transform duration-300 group-hover:translate-y-[-4px]">
                      <span className="text-ink-950 font-black text-sm md:text-[15px] tracking-tight">
                        Area Olahraga
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/30  shadow-primary/20 relative group border border-primary-100 bg-gradient-to-br from-primary-950 to-primary-900">
                  <Image
                    src="/images/asrama.webp"
                    alt="Asrama"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-5 left-5 z-10">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-3xl shadow-2xl shadow-primary/30  shadow-primary/20 border border-white/40 transition-transform duration-300 group-hover:translate-y-[-4px]">
                      <span className="text-ink-950 font-black text-sm md:text-[15px] tracking-tight">
                        Asrama Nyaman
                      </span>
                    </div>
                  </div>
                </div>
                <div className="aspect-[4/5] max-h-[500px] w-full rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/30  shadow-primary/20 relative group border border-primary-100 bg-gradient-to-br from-primary-950 to-primary-900">
                  <Image
                    src="/images/kelas-dari-dalam.webp"
                    alt="Kelas"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-5 left-5 z-10">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-3xl shadow-2xl shadow-primary/30  shadow-primary/20 border border-white/40 transition-transform duration-300 group-hover:translate-y-[-4px]">
                      <span className="text-ink-950 font-black text-sm md:text-[15px] tracking-tight">
                        Kelas Modern
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-[2rem] shadow-2xl shadow-primary/30 border border-primary-100 flex flex-col items-center gap-1 z-20">
                <Camera className="w-8 h-8 text-primary-600 mb-1" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">
                  Sneak Peek
                </span>
                <span className="text-sm font-black text-primary-900">
                  Campus Tour
                </span>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 2. Main Facilities - Big Sections */}
      <section className="py-24 md:py-32 relative section-alt border-y border-primary-100">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary-700 font-bold tracking-[0.2em] uppercase text-[10px] xl:text-xs mb-3 block"
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
              Sarana vital yang menjadi jantung aktivitas harian di{" "}
              <br className="hidden md:block" /> Pesantren Al Imam Al Islami
              untuk kenyamanan dan kekhusyukan.
            </motion.p>
          </div>

          <div className="space-y-24 lg:space-y-32">
            {/* 1. Masjid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="app-card bg-white p-5 md:p-8 sm:p-6 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <Home className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 mb-8 sm:mb-10 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 transition-transform group-hover:scale-110 border border-primary-100">
                    <Home className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-2xl md:text-4xl lg:text-3xl font-black text-primary-950 mb-6 leading-[1.1]">
                    Masjid Jami' <br className="hidden sm:block" /> Al Imam
                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl text-primary-950/70 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Pusat peribadatan santri yang mampu menampung 1000 jamaah.
                    Dilengkapi pendingin ruangan, karpet premium, dan sistem
                    audio berkualitas tinggi.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-primary-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Kapasitas Luas
                        </h4>
                        <p className="text-xs sm:text-sm text-primary-500 font-medium">
                          2 Lantai utama luas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-primary-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Kenyamanan
                        </h4>
                        <p className="text-xs sm:text-sm text-primary-500 font-medium">
                          Full AC & Karpet Empuk
                        </p>
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
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-6 sm:p-8 shadow-2xl shadow-primary/30 relative rotate-2 hover:rotate-0 transition-transform duration-700 border border-primary-100">
                  <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3.2rem] overflow-hidden">
                    <Image
                      src="/images/masjid.webp"
                      alt="Masjid Jami' Al Imam"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 2. Ruang Kelas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1"
              >
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-6 sm:p-8 shadow-2xl shadow-primary/30 relative -rotate-2 hover:rotate-0 transition-transform duration-700 border border-primary-100">
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

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2"
              >
                <div className="app-card bg-white p-5 md:p-8 sm:p-6 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <School className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 mb-8 sm:mb-10 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 transition-transform group-hover:scale-110 border border-primary-100">
                    <School className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-2xl md:text-4xl lg:text-3xl font-black text-ink-950 mb-6 leading-[1.1]">
                    Ruang Kelas <br className="hidden sm:block" /> Modern
                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl text-ink-600 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Ruang kelas yang didesain ergonomis dan modern untuk
                    konsentrasi belajar maksimal. Setiap kelas dilengkapi alat
                    peraga edukatif dan sirkulasi udara yang baik.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Ergonomis
                        </h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">
                          Meja Kursi Nyaman
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Interaktif
                        </h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">
                          Fasilitas Multimedia
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 3. Asrama */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="app-card bg-white p-5 md:p-8 sm:p-6 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <Building className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 mb-8 sm:mb-10 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 transition-transform group-hover:scale-110 border border-primary-100">
                    <Building className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-2xl md:text-4xl lg:text-3xl font-black text-primary-950 mb-6 leading-[1.1]">
                    Asrama <br className="hidden sm:block" /> Berkualitas
                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl text-primary-950/70 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Hunian nyaman dengan sirkulasi udara optimal. Setiap kamar
                    didesain dengan konsep kekeluargaan dan dilengkapi fasilitas
                    penyimpanan pribadi.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-primary-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Kekeluargaan
                        </h4>
                        <p className="text-xs sm:text-sm text-primary-500 font-medium">
                          Musyrif Pembimbing 24 jam
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-primary-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Higienitas
                        </h4>
                        <p className="text-xs sm:text-sm text-primary-500 font-medium">
                          Standar kebersihan tinggi
                        </p>
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
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-6 sm:p-8 shadow-2xl shadow-primary/30 relative rotate-2 hover:rotate-0 transition-transform duration-700 border border-primary-100">
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
            </div>

            {/* 4. Lapangan Minisoccer */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1"
              >
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-6 sm:p-8 shadow-2xl shadow-primary/30 relative -rotate-2 hover:rotate-0 transition-transform duration-700 border border-primary-100">
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
                <div className="app-card bg-white p-5 md:p-8 sm:p-6 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <Trophy className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 mb-8 sm:mb-10 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 transition-transform group-hover:scale-110 border border-primary-100">
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-2xl md:text-4xl lg:text-3xl font-black text-ink-950 mb-6 leading-[1.1]">
                    Lapangan <br className="hidden sm:block" /> Minisoccer
                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl text-ink-600 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Sarana olahraga outdoor berkualitas untuk mendukung
                    kesehatan fisik dan bakat atletik santri. Lapangan rumput
                    sintetis standar yang aman dan nyaman.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Kualitas
                        </h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">
                          Rumput Sintetis Premium
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Kebersihan
                        </h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">
                          Area Luas & Terawat
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 5. Lapangan Basket */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="app-card bg-white p-5 md:p-8 sm:p-6 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <Award className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 mb-8 sm:mb-10 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 transition-transform group-hover:scale-110 border border-primary-100">
                    <Award className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-2xl md:text-4xl lg:text-3xl font-black text-primary-950 mb-6 leading-[1.1]">
                    Lapangan <br className="hidden sm:block" /> Basket
                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl text-primary-950/70 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Fasilitas olahraga terpadu dengan standar yang memadai untuk
                    melatih kebugaran, kerjasama tim, dan sportivitas santri dalam
                    berbagai aktivitas fisik harian.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-primary-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Terbuka
                        </h4>
                        <p className="text-xs sm:text-sm text-primary-500 font-medium">
                          Sirkulasi Udara Baik
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-primary-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Multifungsi
                        </h4>
                        <p className="text-xs sm:text-sm text-primary-500 font-medium">
                          Basket & Senam Pagi
                        </p>
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
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-6 sm:p-8 shadow-2xl shadow-primary/30 relative rotate-2 hover:rotate-0 transition-transform duration-700 border border-primary-100">
                  <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3.2rem] overflow-hidden">
                    <Image
                      src="/images/gedung-utama-dan-lapangan-basket.webp"
                      alt="Lapangan Basket"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 6. Depot Galon Gratis */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1"
              >
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-6 sm:p-8 shadow-2xl shadow-primary/30 relative -rotate-2 hover:rotate-0 transition-transform duration-700 border border-primary-100">
                  <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3.2rem] overflow-hidden">
                    <Image
                      src="/images/depot-galon-gratis.webp"
                      alt="Depot Galon Gratis"
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
                <div className="app-card bg-white p-5 md:p-8 sm:p-6 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <Droplets className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 mb-8 sm:mb-10 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 transition-transform group-hover:scale-110 border border-primary-100">
                    <Droplets className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-2xl md:text-4xl lg:text-3xl font-black text-ink-950 mb-6 leading-[1.1]">
                    Depot <br className="hidden sm:block" /> Galon Gratis
                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl text-ink-600 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Akses air minum higienis yang tersedia cuma-cuma untuk menjamin 
                    kebutuhan hidrasi sehat harian seluruh santri dengan sistem
                    penyaringan modern yang terjaga kualitasnya.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Higienis
                        </h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">
                          Penyaringan Modern
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          24 Jam
                        </h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">
                          Akses Bebas Kapan Saja
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 7. Kantor SPMB & Tamu */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="app-card bg-white p-5 md:p-8 sm:p-6 lg:p-16 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <Building2 className="w-48 h-48" />
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 mb-8 sm:mb-10 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 transition-transform group-hover:scale-110 border border-primary-100">
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <h3 className="text-3xl sm:text-2xl md:text-4xl lg:text-3xl font-black text-ink-950 mb-6 leading-[1.1]">
                    Kantor SPMB <br className="hidden sm:block" /> & Tamu
                  </h3>
                  <p className="text-base sm:text-lg lg:text-xl text-ink-600 mb-8 sm:mb-10 leading-relaxed font-medium">
                    Pusat informasi dan pendaftaran santri baru. Dilengkapi
                    dengan ruang tunggu yang nyaman dan staf yang siap membantu
                    proses pendaftaran.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Informasi
                        </h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">
                          Layanan Cepat Tanggap
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-[15px] sm:text-lg uppercase tracking-tight">
                          Kenyamanan
                        </h4>
                        <p className="text-xs sm:text-sm text-ink-500 font-medium">
                          Ruang Tunggu Sejuk
                        </p>
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
                <div className="aspect-square rounded-[3rem] sm:rounded-[4rem] bg-white p-3 sm:p-6 sm:p-8 shadow-2xl shadow-primary/30 relative rotate-2 hover:rotate-0 transition-transform duration-700 border border-primary-100">
                  <div className="relative w-full h-full rounded-[2.5rem] sm:rounded-[3.2rem] overflow-hidden">
                    <Image
                      src="/images/kantor-ppdb-tamu.webp"
                      alt="Kantor SPMB Al Imam"
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-110"
                    />
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
              className="text-3xl md:text-5xl font-black text-primary-950 mb-4"
            >
              Fasilitas <span className="text-primary-600">Penunjang</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-base md:text-lg text-primary-950/70 font-medium leading-relaxed"
            >
              Lengkap dengan sarana pendukung untuk mengembangkan{" "}
              <br className="hidden md:block" /> minat, bakat, dan kesehatan
              santri.
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
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform border border-primary-50 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-700 mb-5 group-hover:scale-110 transition-transform border border-primary-100 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-primary-950 mb-2">
                Perpustakaan
              </h3>
              <p className="text-sm text-primary-950/60 font-medium">
                Ribuan koleksi kitab & buku
              </p>
              <div className="mt-4 pt-4 border-t border-primary-50 w-full">
                <span className="text-xs text-primary-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Akademik
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform border border-primary-50 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-700 mb-5 group-hover:scale-110 transition-transform border border-primary-100 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-primary-950 mb-2">
                Laboratorium
              </h3>
              <p className="text-sm text-primary-950/60 font-medium">
                Sains & Komputer
              </p>
              <div className="mt-4 pt-4 border-t border-primary-50 w-full">
                <span className="text-xs text-primary-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5" /> Praktikum
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform border border-primary-50 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-700 mb-5 group-hover:scale-110 transition-transform border border-primary-100 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-primary-950 mb-2">
                Dapur Sehat
              </h3>
              <p className="text-sm text-primary-950/60 font-medium">
                Menu bergizi 3x sehari
              </p>
              <div className="mt-4 pt-4 border-t border-primary-50 w-full">
                <span className="text-xs text-primary-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" /> Nutrisi
                </span>
              </div>
            </motion.div>

            {/* 5. Klinik Santri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform border border-primary-50 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-700 mb-5 group-hover:scale-110 transition-transform border border-primary-100 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-primary-950 mb-2">
                Klinik Santri
              </h3>
              <p className="text-sm text-primary-950/60 font-medium">
                Layanan medis internal
              </p>
              <div className="mt-4 pt-4 border-t border-primary-50 w-full">
                <span className="text-xs text-primary-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Kesehatan
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform border border-primary-50 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-700 mb-5 group-hover:scale-110 transition-transform border border-primary-100 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-primary-950 mb-2">
                Security
              </h3>
              <p className="text-sm text-primary-950/60 font-medium">
                Keamanan CCTV 24 Jam
              </p>
              <div className="mt-4 pt-4 border-t border-primary-50 w-full">
                <span className="text-xs text-primary-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Keamanan
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="app-card bg-white p-6 md:p-8 flex flex-col items-start group hover:-translate-y-1 transition-transform border border-primary-50 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-700 mb-5 group-hover:scale-110 transition-transform border border-primary-100 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-primary-950 mb-2">
                Aula Besar
              </h3>
              <p className="text-sm text-primary-950/60 font-medium">
                Kapasitas 500 orang
              </p>
              <div className="mt-4 pt-4 border-t border-primary-50 w-full">
                <span className="text-xs text-primary-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Event
                </span>
              </div>
            </motion.div>

          </div>
        </Container>
      </section>

      {/* 4. Photo Gallery - Enhanced Layout */}
      {/* 4. Jadwalkan Kunjungan - Replaces Gallery */}
      <section
        id="visit"
        className="py-24 md:py-32 section-alt border-y border-primary-100 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-60" />
        
        <Container className="relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Content - Info */}
              <div className="lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white border border-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Survey Pesantren</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-display font-black text-ink-950 mb-6 leading-tight">
                    Kunjungi <span className="text-gradient-primary">Kami</span>
                  </h2>
                  <p className="text-lg text-ink-600 mb-8 leading-relaxed font-medium">
                    Masih banyak fasilitas pendukung lainnya di dalam Pesantren Al Imam Al Islami.
                    Ingin melihat langsung? Jadwalkan kunjungan Anda melalui formulir ini.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 border border-primary-100">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-lg mb-1">Konfirmasi Cepat</h4>
                        <p className="text-sm text-ink-600 font-medium">Tim kami akan segera menghubungi via WhatsApp.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 border border-primary-100">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-ink-950 text-lg mb-1">Tour Terpadu</h4>
                        <p className="text-sm text-ink-600 font-medium">Dipandu langsung untuk melihat seluruh area.</p>
                      </div>
                    </div>
                  </div>

                  {/* Peta Lokasi Terintegrasi */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mt-10 bg-white p-4.5 rounded-[2rem] border border-primary-100 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary-900/5 overflow-hidden relative group"
                  >
                    <div className="rounded-[1.5rem] overflow-hidden h-[200px] relative bg-primary-50">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.170258079815!2d106.84883492584104!3d-6.9457494681995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68370000000001%3A0x6737000000000000!2sPesantren%20Al%20Andalus%20Al%20Imam!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Lokasi Pesantren Al Imam Al Islami"
                        className="grayscale group-hover:grayscale-0 transition-all duration-700 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-3xl shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10 border border-primary-100 flex items-center gap-2 z-10 pointer-events-none">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        <span className="text-[10px] font-black text-ink-950 uppercase tracking-widest">
                          Lokasi Pesantren
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Right Content - The Form */}
              <div className="lg:col-span-7">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="app-card bg-white p-6 sm:p-6 md:p-10 border border-primary-50 shadow-2xl relative overflow-hidden"
                >
                  {formStatus === 'success' ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="py-12 flex flex-col items-center text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-50 text-[#550000] flex items-center justify-center mb-6 border border-green-100 shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary/10">
                        <Check className="w-10 h-10" strokeWidth={3} />
                      </div>
                      <h3 className="text-2xl font-black text-ink-950 mb-3">Permintaan Terkirim!</h3>
                      <p className="text-ink-600 font-medium max-w-sm mx-auto mb-8">
                        Terima kasih. Formulir kunjungan Anda telah kami terima. Tim kami akan menghubungi Anda sebentar lagi via WhatsApp.
                      </p>
                      <button 
                        onClick={() => setFormStatus('idle')}
                        className="px-6 py-3 rounded-3xl bg-primary-50 text-primary-700 font-bold hover:bg-primary-100 transition-colors"
                      >
                        Isi Form Kembali
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleVisitSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-black text-ink-950 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary-600" /> Nama Lengkap
                          </label>
                          <input 
                            required 
                            type="text" 
                            placeholder="Contoh: Bapak Ahmad" 
                            className="w-full px-4 py-3.5 rounded-3xl border border-ink-100 bg-surface-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-hidden transition-all font-medium text-ink-900 placeholder:text-ink-300" 
                            value={visitForm.nama}
                            onChange={(e) => setVisitForm({ ...visitForm, nama: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black text-ink-950 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-primary-600" /> Nomor WhatsApp
                          </label>
                          <input 
                            required 
                            type="tel" 
                            placeholder="Contoh: 0812..." 
                            className="w-full px-4 py-3.5 rounded-3xl border border-ink-100 bg-surface-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-hidden transition-all font-medium text-ink-900 placeholder:text-ink-300" 
                            value={visitForm.wa}
                            onChange={(e) => setVisitForm({ ...visitForm, wa: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-black text-ink-950 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-600" /> Rencana Tanggal
                          </label>
                          <input 
                            required 
                            type="date" 
                            className="w-full px-4 py-3.5 rounded-3xl border border-ink-100 bg-surface-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-hidden transition-all font-medium text-ink-900" 
                            value={visitForm.tanggal}
                            onChange={(e) => setVisitForm({ ...visitForm, tanggal: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-black text-ink-950 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary-600" /> Rencana Jam
                          </label>
                          <select 
                            required 
                            className="w-full px-4 py-3.5 rounded-3xl border border-ink-100 bg-surface-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-hidden transition-all font-medium text-ink-900 cursor-pointer"
                            value={visitForm.jam}
                            onChange={(e) => setVisitForm({ ...visitForm, jam: e.target.value })}
                          >
                            <option value="">Pilih Waktu</option>
                            <option value="08:00">08:00 WIB</option>
                            <option value="10:00">10:00 WIB</option>
                            <option value="13:00">13:00 WIB</option>
                            <option value="15:00">15:00 WIB</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-ink-950 flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary-600" /> Jumlah Orang yang Datang
                        </label>
                        <input 
                          required 
                          type="number" 
                          min="1" 
                          placeholder="Contoh: 3" 
                          className="w-full px-4 py-3.5 rounded-3xl border border-ink-100 bg-surface-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-hidden transition-all font-medium text-ink-900 placeholder:text-ink-300" 
                          value={visitForm.jumlah}
                          onChange={(e) => setVisitForm({ ...visitForm, jumlah: e.target.value })}
                        />
                      </div>

                      <button type="submit" className="w-full py-4 rounded-3xl bg-primary-600 text-white font-black text-lg shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-2 mt-2">
                        <span>Ajukan Jadwal Kunjungan</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                      
                      <p className="text-xs text-center text-ink-400 font-medium mt-4 flex items-center justify-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-primary-600" /> Data Anda aman dan hanya digunakan untuk keperluan jadwal kunjungan.
                      </p>
                    </form>
                  )}
                </motion.div>
              </div>

            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
