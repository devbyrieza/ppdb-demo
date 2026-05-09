"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  School,
  Building2,
  Dumbbell,
  Beaker,
  HeartPulse,
  ShoppingCart,
  Monitor,
  UtensilsCrossed,
  Library,
  Waves,
  Coffee,
  MapPin,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, type Variants, type Transition } from "framer-motion";

const FACILITIES = [
  { name: "Masjid Kapasitas 1000 Jamaah", icon: Home, color: "teal" },
  { name: "Gedung Sekolah Terpadu", icon: School, color: "sand" },
  { name: "Asrama Representatif", icon: Building2, color: "ink" },
  { name: "Fasilitas Olahraga", icon: Dumbbell, color: "gold" },
  { name: "Laboratorium IPA", icon: Beaker, color: "teal" },
  { name: "UKS (Unit Kesehatan Santri)", icon: HeartPulse, color: "red" },
  { name: "Mini Market", icon: ShoppingCart, color: "orange" },
  { name: "Lab. Komputer", icon: Monitor, color: "indigo" },
  { name: "Ruang Makan Bersama", icon: UtensilsCrossed, color: "amber" },
  { name: "Perpustakaan Digital", icon: Library, color: "emerald" },
  { name: "Area Kemandirian", icon: Waves, color: "cyan" },
  { name: "Kantin Sehat", icon: Coffee, color: "teal" },
] as const;

const FACILITY_IMAGES = [
  {
    src: "/images/masjid.webp",
    label: "Masjid Jami'",
    sub: "Kapasitas 1.000 Jamaah",
    span: "col-span-2 row-span-2",
    priority: true,
  },
  {
    src: "/images/gedung-utama-dan-lapangan-basket.webp",
    label: "Gedung Utama",
    sub: "& Lapangan Basket",
    span: "col-span-1 row-span-1",
    priority: true,
  },
  {
    src: "/images/gedung-kelas.webp",
    label: "Gedung Kelas",
    sub: "Modern & Representatif",
    span: "col-span-1 row-span-1",
    priority: false,
  },
  {
    src: "/images/asrama.webp",
    label: "Asrama Santri",
    sub: "Nyaman & Teratur",
    span: "col-span-1 row-span-1",
    priority: false,
  },
  {
    src: "/images/kelas-dari-dalam.webp",
    label: "Ruang Kelas",
    sub: "Kondusif & Lengkap",
    span: "col-span-1 row-span-1",
    priority: false,
  },
] as const;

/* ── Icon colour mapping — teal/sand branding ── */
const iconClasses: Record<string, string> = {
  teal: "bg-teal-50 text-teal-600 ring-teal-100",
  sand: "bg-sand-100 text-sand-800 ring-sand-200",
  gold: "bg-yellow-50 text-yellow-600 ring-yellow-100",
  red: "bg-red-50 text-red-600 ring-red-100",
  orange: "bg-orange-50 text-orange-600 ring-orange-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
  ink: "bg-sand-50 text-ink-600 ring-sand-100",
};

/* ── Easing & transition helpers ── */
const SPRING_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const springTransition: Transition = {
  duration: 0.6,
  ease: SPRING_EASE,
};

/* ── Framer Motion variants ── */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: SPRING_EASE,
    },
  },
};

const photoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
};

export default function FacilitiesSection() {
  return (
    <section
      id="fasilitas"
      className="section-std relative overflow-hidden border-b border-sand-200"
    >
      {/* ── Decorative blobs ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-sand-200 blur-[120px] opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-16 w-[320px] h-[320px] rounded-full bg-teal-50 blur-[100px] opacity-50"
      />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <Container className="relative z-10">
        {/* ── Section header ── */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: SPRING_EASE }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sand-200 text-teal-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>Lingkungan Pesantren</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.08, ease: SPRING_EASE }}
            className="section-title mb-4"
          >
            Fasilitas{" "}
            <span className="text-gradient-teal">Terpadu & Lengkap</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.16, ease: SPRING_EASE }}
            className="section-subtitle mx-auto"
          >
            Sarana dan prasarana yang memadai untuk menunjang kenyamanan
            belajar, beribadah, dan aktivitas harian seluruh santri.
          </motion.p>
        </div>

        {/* ── Photo gallery ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-16 auto-rows-[180px] md:auto-rows-[220px]">
          {FACILITY_IMAGES.map((img, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={photoVariants}
              transition={{
                duration: 0.6,
                delay: idx * 0.08,
                ease: SPRING_EASE,
              }}
              className={`${img.span} relative rounded-[1.5rem] overflow-hidden group shadow-premium-sm ring-1 ring-sand-200`}
            >
              <Image
                src={img.src}
                alt={img.label}
                fill
                priority={img.priority}
                sizes={
                  idx === 0
                    ? "(max-width:768px) 100vw, 50vw"
                    : "(max-width:768px) 50vw, 25vw"
                }
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] bg-sand-100"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/70 via-teal-950/15 to-transparent opacity-65 group-hover:opacity-85 transition-opacity duration-400" />

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                <p className="text-white font-bold text-[0.9375rem] md:text-[1.0625rem] leading-snug drop-shadow-sm mb-1 tracking-tight">
                  {img.label}
                </p>
                <p className="text-white/80 font-semibold text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.1em] drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
                  {img.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Divider with label ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sand-200 to-transparent" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink-400 px-2">
            Fasilitas Penunjang
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sand-200 to-transparent" />
        </motion.div>

        {/* ── Facilities list ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-16"
        >
          {FACILITIES.map((facility, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-sand-200 hover:border-teal-200 shadow-premium-sm hover:shadow-premium-md transition-all duration-300 ease-out cursor-default"
            >
              <div
                className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ring-1 shadow-xs transition-transform duration-300 group-hover:scale-105 ${iconClasses[facility.color] ?? iconClasses.ink}`}
              >
                <facility.icon className="w-4 h-4" strokeWidth={2} />
              </div>

              <span className="font-bold text-ink-900 text-[0.875rem] leading-snug group-hover:text-teal-800 transition-colors duration-200">
                {facility.name}
              </span>

              <ChevronRight className="w-3.5 h-3.5 text-teal-300 ml-auto shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </motion.div>
          ))}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: SPRING_EASE }}
          className="flex justify-center"
        >
          <Link href="/fasilitas">
            <button className="btn-secondary group inline-flex items-center gap-2 px-8 py-3 bg-white border border-sand-200 shadow-sm hover:shadow-md transition-all">
              <span className="text-[0.875rem] font-bold">
                Lihat Semua Fasilitas
              </span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
