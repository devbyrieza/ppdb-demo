"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Target,
  Trophy,
  Clock,
  Calendar as CalendarIcon,
  Users,
  Shield,
  Monitor,
  Zap,
  Waves,
  Palette,
} from "lucide-react";
import { Container } from "@/components/layout/Container";

// ─── DATA KEGIATAN UTAMA ───
const ACTIVITIES = [
  {
    id: 1,
    title: "Kajian Kitab Turots",
    category: "Akademik",
    description:
      "Pendalaman literatur klasik Islam dengan bimbingan asatidzah berkompeten untuk membangun fondasi ilmu yang kokoh.",
    time: "Setiap Ba'da Subuh",
    image: "/images/pembelajaran-kitab-turotz.webp",
    icon: BookOpen,
    color: "teal",
  },
  {
    id: 2,
    title: "Halaqoh Tahfidz",
    category: "Al-Qur'an",
    description:
      "Program intensif menghafal Al-Qur'an dengan metode talaqqi untuk memastikan kualitas bacaan dan kekuatan hafalan.",
    time: "Setiap Ba'da Ashar",
    image: "/images/tahfidz.webp",
    icon: Target,
    color: "emerald",
  },
  {
    id: 3,
    title: "Latihan Memanah",
    category: "Ekstrakurikuler",
    description:
      "Melatih fokus, konsentrasi, dan kekuatan fisik melalui sunnah memanah dengan standar peralatan yang representatif.",
    time: "Sabtu & Ahad Pagi",
    image: "/images/gedung-utama-dan-lapangan-basket.webp",
    icon: Trophy,
    color: "sand",
  },
];

// ─── DATA EKSTRAKURIKULER (Chips) ───
// Ditambahkan agar sama lengkapnya dengan versi institusi
const EXTRA_ACTIVITIES = [
  { name: "Karate", icon: Trophy, color: "teal" },
  { name: "Pramuka", icon: Shield, color: "sand" },
  { name: "Panahan", icon: Target, color: "teal" },
  { name: "Komputer", icon: Monitor, color: "emerald" },
  { name: "Desain", icon: Palette, color: "sand" },
  { name: "Bela Diri", icon: Zap, color: "teal" },
  { name: "Renang", icon: Waves, color: "emerald" },
];

// ─── ANIMATION VARIANTS ───
const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

// ─── COMPONENT: ACTIVITY CARD ───
function ActivityCard({
  activity,
  index,
}: {
  activity: (typeof ACTIVITIES)[0];
  index: number;
}) {
  const Icon = activity.icon;
  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col h-full bg-white rounded-[2rem] overflow-hidden border border-sand-100 hover:border-teal-200 transition-all duration-500 shadow-premium-sm hover:shadow-premium-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          priority={index < 2}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        <div className="absolute top-5 left-5">
          <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest">
            {activity.category}
          </div>
        </div>
        <div className="absolute bottom-5 right-5 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <Icon className="w-5 h-5 text-teal-600" />
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider">
            {activity.time}
          </span>
        </div>
        <h3 className="text-xl font-black text-ink-950 mb-3 leading-tight group-hover:text-teal-800 transition-colors">
          {activity.title}
        </h3>
        <p className="text-sm text-ink-600 leading-relaxed font-medium line-clamp-3 mb-6">
          {activity.description}
        </p>
        <div className="mt-auto">
          <div className="w-full h-px bg-sand-100 mb-6 group-hover:bg-teal-100 transition-colors" />
          <button className="flex items-center gap-2 text-[11px] font-black text-teal-700 uppercase tracking-widest group/btn">
            Pelajari Lebih Lanjut
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN SECTION ───
export default function ActivitiesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="activities"
      className="section-std relative overflow-hidden bg-sand-50/30"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sand-100/50 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <Container className="relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center"
        >
          {/* Header */}
          <div className="max-w-2xl text-center mb-16 lg:mb-20">
            <motion.div variants={fadeUpVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-sand-200 text-teal-700 text-[10px] font-bold uppercase tracking-[0.15em] mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Agenda Terpadu</span>
              </div>
            </motion.div>

            <motion.h2
              variants={fadeUpVariants}
              className="section-title mb-6"
            >
              Kegiatan <span className="text-gradient-teal">Terbaik</span> untuk Bekal Masa Depan
            </motion.h2>

            <motion.p
              variants={fadeUpVariants}
              className="text-lg text-ink-600 font-medium leading-relaxed"
            >
              Kurikulum yang dirancang untuk membentuk karakter rabbani,
              kecerdasan akademik, dan kemandirian melalui program harian yang
              terstruktur.
            </motion.p>
          </div>

          {/* Grid Kegiatan Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {ACTIVITIES.map((activity, index) => (
              <ActivityCard key={activity.id} activity={activity} index={index} />
            ))}
          </div>

          {/* Extra Activities Chips - Menyamakan kelengkapan dengan Institusi */}
          <motion.div
            variants={fadeUpVariants}
            className="w-full max-w-4xl mb-20 md:mb-24"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {EXTRA_ACTIVITIES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 px-5 py-3 bg-white rounded-2xl border border-sand-100 shadow-premium-sm hover:border-teal-200 hover:shadow-premium-md transition-all duration-300 group cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sand-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-50 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-black text-ink-950 uppercase tracking-widest">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Footer Card */}
          <motion.div variants={fadeUpVariants} className="w-full">
            <div className="relative p-10 md:p-12 rounded-[2.5rem] bg-teal-900 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal-400/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="max-w-md">
                  <h4 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
                    Lihat Jadwal Harian Lengkap Santri
                  </h4>
                  <p className="text-teal-100/80 font-medium text-sm leading-relaxed">
                    Setiap detik di sini adalah kesempatan belajar. Unduh jadwal
                    harian lengkap untuk mengetahui rutinitas santri kami.
                  </p>
                </div>

                <div className="shrink-0">
                  <Link href="/kegiatan">
                    <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-teal-900 font-black text-sm uppercase tracking-widest rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95">
                      <span className="relative z-10">
                        Eksplorasi Seluruh Kegiatan
                      </span>
                      <CalendarIcon className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                      <div className="absolute inset-0 bg-sand-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
