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
  Star,
} from "lucide-react";
import { motion, useInView, type Variants, type Transition } from "framer-motion";
import { useRef } from "react";
import { Container } from "@/components/layout/Container";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DATA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
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

const SCHEDULE_ITEMS = [
  {
    time: "Pagi",
    label: "Tahfidz & Muroja'ah",
    icon: Sun,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    time: "Siang",
    label: "Sekolah Formal",
    icon: BookOpen,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    time: "Sore",
    label: "Ekskul & Olahraga",
    icon: Target,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
  },
  {
    time: "Malam",
    label: "Belajar Mandiri",
    icon: Moon,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
  },
] as const;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ANIMATION VARIANTS
   Cubic-bezier sebagai tuple agar TypeScript happy
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SPRING = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.1,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: SPRING,
    } as Transition,
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: SPRING,
    } as Transition,
  }),
};

const scheduleVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.08,
      ease: SPRING,
    } as Transition,
  }),
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GALLERY CARD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function GalleryCard({
  image,
  title,
  description,
  icon: Icon,
  index,
}: (typeof GALLERY_ITEMS)[number] & { index: number }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -6, transition: { duration: 0.35, ease: SPRING } }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow:
          "0 4px 20px -4px rgba(13,110,110,0.10), 0 2px 8px -2px rgba(0,0,0,0.06)",
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Gradient overlay — teal deep sesuai branding template */}
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950/85 via-teal-900/30 to-transparent transition-opacity duration-500 opacity-80 group-hover:opacity-100" />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
      </div>

      {/* Icon chip — sand warm saat hover, khas template-demo */}
      <div
        className="absolute top-3.5 right-3.5 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-sand-200/90 group-hover:border-sand-300/50 group-hover:text-teal-800"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.20)" }}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-bold text-[15px] tracking-tight leading-snug translate-y-1.5 group-hover:translate-y-0 transition-transform duration-300">
          {title}
        </h3>
        <p className="text-teal-100/75 text-xs mt-1 font-medium opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-[40ms]">
          {description}
        </p>
      </div>

      {/* Bottom accent line — sand warm, signature template-demo */}
      <div className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-gradient-to-r from-sand-400 to-sand-500 group-hover:w-full transition-all duration-500 ease-out" />
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SCHEDULE CARD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ScheduleCard({
  time,
  label,
  icon: Icon,
  iconBg,
  iconColor,
  index,
}: (typeof SCHEDULE_ITEMS)[number] & { index: number }) {
  return (
    <motion.div
      custom={index}
      variants={scheduleVariants}
      className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-teal-100/70 transition-all duration-300 hover:border-teal-200 hover:shadow-[0_4px_16px_-4px_rgba(13,110,110,0.12)]"
      style={{
        boxShadow:
          "0 1px 4px rgba(13,110,110,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className={`w-10 h-10 rounded-[11px] ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.08em] leading-none mb-0.5">
          {time}
        </p>
        <p className="font-semibold text-ink-900 text-[13.5px] leading-tight truncate">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN EXPORT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function GallerySection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });
  const scheduleInView = useInView(scheduleRef, {
    once: true,
    margin: "-60px",
  });

  return (
    <section id="gallery" className="section-std !pb-0 overflow-hidden">
      <Container>
        {/* ── Section Header ── */}
        <motion.div
          ref={headerRef}
          variants={containerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16"
        >
          <div className="max-w-xl">
            <motion.div variants={fadeUpVariants}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-50 border border-sand-200 text-teal-700 text-[11px] font-bold uppercase tracking-[0.12em] mb-4 shadow-sm">
                <Images className="w-3 h-3" />
                <span>Dokumentasi</span>
              </div>
            </motion.div>

            <motion.h2 variants={fadeUpVariants} className="section-title mb-0">
              Galeri{" "}
              <span className="text-gradient-teal">Aktivitas</span>
            </motion.h2>

            <motion.p
              variants={fadeUpVariants}
              className="section-subtitle lg:ml-0 text-left mt-3 text-justify leading-relaxed"
            >
              Intip kegiatan sehari-hari para santri dalam menuntut ilmu dan beribadah.
            </motion.p>
          </div>

          <motion.div variants={fadeUpVariants} className="shrink-0">
            <Link href="/kegiatan">
              <button className="btn-secondary group inline-flex items-center gap-2 px-6">
                Lihat Semua
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Gallery Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-16 lg:mb-20">
          {GALLERY_ITEMS.map((item, idx) => (
            <GalleryCard key={idx} {...item} index={idx} />
          ))}
        </div>

        {/* ── Daily Schedule Panel ── */}
        <motion.div
          ref={scheduleRef}
          initial={{ opacity: 0, y: 40 }}
          animate={scheduleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: SPRING }}
          className="relative rounded-t-[2.5rem] overflow-hidden border border-b-0 border-sand-200"
          style={{
            background:
              "linear-gradient(160deg, #F0F9F9 0%, #FFFFFF 55%, #FAF9F6 100%)",
            boxShadow: "0 -12px 40px -12px rgba(13,110,110,0.07)",
          }}
        >
          {/* Decorative blobs — teal & sand khas template-demo */}
          <div
            className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(13,110,110,0.05) 0%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(190,174,119,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Accent line atas — sand warm, signature template-demo */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sand-400 via-sand-300 to-transparent" />

          <div className="relative z-10 grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-center p-8 md:p-12 max-w-6xl mx-auto">

            {/* Left: copy + CTA */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={scheduleInView ? "visible" : "hidden"}
            >
              <motion.div variants={fadeUpVariants}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-50 border border-sand-200 text-sand-700 text-[11px] font-bold uppercase tracking-[0.10em] mb-4">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>Jadwal Harian</span>
                </div>
              </motion.div>

              <motion.h3
                variants={fadeUpVariants}
                className="font-black text-teal-900 tracking-tight mb-3"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  lineHeight: 1.2,
                }}
              >
                Jadwal Harian Berkah
              </motion.h3>

              <motion.p
                variants={fadeUpVariants}
                className="text-ink-500 font-[450] mb-7 max-w-sm leading-relaxed text-justify"
                style={{ fontSize: "clamp(0.9rem, 1.2vw, 1rem)" }}
              >
                Setiap detik sangat berharga. Kami mengatur jadwal santri agar
                seimbang antara ibadah, belajar, istirahat, dan bersosialisasi.
              </motion.p>

              <motion.div variants={fadeUpVariants}>
                <Link href="/kalender">
                  <button className="btn-primary inline-flex items-center gap-2 group px-7">
                    Lihat Jadwal Lengkap
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: schedule cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={scheduleInView ? "visible" : "hidden"}
              className="grid grid-cols-2 gap-3"
            >
              {SCHEDULE_ITEMS.map((item, idx) => (
                <ScheduleCard key={idx} {...item} index={idx} />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}