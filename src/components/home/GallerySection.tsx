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
import {
  motion,
  useInView,
  type Variants,
  type Transition,
} from "framer-motion";
import { useRef } from "react";
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

const SCHEDULE_ITEMS = [
  {
    time: "Pagi",
    label: "Tahfidz & Muroja'ah",
    icon: Sun,
    iconBg: "bg-secondary-100",
    iconColor: "text-secondary-700",
  },
  {
    time: "Siang",
    label: "Sekolah Formal",
    icon: BookOpen,
    iconBg: "bg-primary-50",
    iconColor: "text-primary-700",
  },
  {
    time: "Sore",
    label: "Ekskul & Olahraga",
    icon: Target,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    time: "Malam",
    label: "Belajar Mandiri",
    icon: Moon,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, delay: i * 0.08, ease: EASE },
  }),
};

const scheduleVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: EASE },
  }),
};

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
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-premium-sm border border-secondary-200"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary-50">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-900/20 to-transparent transition-opacity duration-500 opacity-80 group-hover:opacity-100" />
      </div>

      <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-secondary-400 group-hover:border-secondary-300 group-hover:text-primary-900 shadow-sm">
        <Icon className="w-4 h-4" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-bold text-[0.9375rem] tracking-tight leading-snug translate-y-1.5 group-hover:translate-y-0 transition-transform duration-300 drop-shadow-sm">
          {title}
        </h3>
        <p className="text-secondary-100/90 text-[0.65rem] mt-1 font-semibold uppercase tracking-[0.1em] opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
          {description}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-secondary-400 to-secondary-300 group-hover:w-full transition-all duration-500 ease-out" />
    </motion.div>
  );
}

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
      className="flex items-center gap-3.5 p-3.5 rounded-[1.25rem] bg-white border border-secondary-200 transition-all duration-300 hover:border-primary-200 shadow-premium-sm hover:shadow-premium-md"
    >
      <div
        className={`w-10 h-10 rounded-[10px] ${iconBg} flex items-center justify-center ${iconColor} shrink-0 ring-1 ring-black/5`}
      >
        <Icon className="w-4 h-4" strokeWidth={2} />
      </div>

      <div className="min-w-0">
        <p className="text-[0.6rem] font-bold text-ink-400 uppercase tracking-[0.15em] leading-none mb-1">
          {time}
        </p>
        <p className="font-bold text-ink-900 text-[0.875rem] leading-tight truncate">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

export default function GallerySection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });
  const scheduleInView = useInView(scheduleRef, {
    once: true,
    margin: "-60px",
  });

  return (
    <section
      id="gallery"
      className="section-std !pb-0 overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <Container className="relative z-10">
        <motion.div
          ref={headerRef}
          variants={containerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16"
        >
          <div className="max-w-xl">
            <motion.div variants={fadeUpVariants}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-secondary-200 text-primary-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-4 shadow-xs">
                <Images className="w-3 h-3" strokeWidth={2} />
                <span>Dokumentasi</span>
              </div>
            </motion.div>

            <motion.h2 variants={fadeUpVariants} className="section-title mb-0">
              Galeri <span className="text-gradient-primary">Aktivitas</span>
            </motion.h2>

            <motion.p
              variants={fadeUpVariants}
              className="section-subtitle lg:ml-0 text-left mt-3 text-justify"
            >
              Intip kegiatan sehari-hari para santri dalam menuntut ilmu dan
              beribadah.
            </motion.p>
          </div>

          <motion.div variants={fadeUpVariants} className="shrink-0">
            <Link href="/kegiatan">
              <button className="btn-secondary group inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-secondary-200 hover:border-primary-200">
                <span className="font-bold text-[0.875rem]">Lihat Semua</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-16 lg:mb-20">
          {GALLERY_ITEMS.map((item, idx) => (
            <GalleryCard key={idx} {...item} index={idx} />
          ))}
        </div>

        <motion.div
          ref={scheduleRef}
          initial={{ opacity: 0, y: 40 }}
          animate={scheduleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative rounded-t-[2.5rem] overflow-hidden border border-b-0 border-secondary-200 bg-gradient-to-br from-secondary-50/50 to-white shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.05)]"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-300 via-secondary-300 to-transparent" />

          <div className="relative z-10 grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center p-8 md:p-12 lg:p-14 max-w-6xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={scheduleInView ? "visible" : "hidden"}
            >
              <motion.div variants={fadeUpVariants}>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary-100 border border-secondary-200 text-primary-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Jadwal Harian</span>
                </div>
              </motion.div>

              <motion.h3
                variants={fadeUpVariants}
                className="font-display font-black text-[2rem] md:text-[2.5rem] text-ink-950 tracking-tight mb-4 leading-[1.15]"
              >
                Jadwal Harian Berkah
              </motion.h3>

              <motion.p
                variants={fadeUpVariants}
                className="text-ink-600 font-[450] mb-8 max-w-md leading-relaxed text-[0.9375rem] text-justify"
              >
                Setiap detik sangat berharga. Kami mengatur jadwal santri agar
                seimbang antara ibadah, belajar, istirahat, dan bersosialisasi.
              </motion.p>

              <motion.div variants={fadeUpVariants}>
                <Link href="/kalender">
                  <button className="btn-primary inline-flex items-center gap-2 group px-7 py-3.5 shadow-md">
                    Lihat Jadwal Lengkap
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={scheduleInView ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
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
