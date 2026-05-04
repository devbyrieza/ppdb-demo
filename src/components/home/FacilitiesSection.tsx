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
import { navigateToDetail } from "@/lib/navigation-scroll";

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
    ink: "bg-surface-100 text-ink-600 ring-surface-200",
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
        transition: { staggerChildren: 0.05, delayChildren: 0.08 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: SPRING_EASE,
        },
    },
};

const photoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: springTransition,
    },
};

export default function FacilitiesSection() {
    return (
        <section id="fasilitas" className="section-std overflow-hidden">
            {/* ── Decorative blobs ── */}
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-24
                   w-[480px] h-[480px] rounded-full
                   bg-sand-100 blur-[120px] opacity-50"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -left-16
                   w-[320px] h-[320px] rounded-full
                   bg-teal-50 blur-[100px] opacity-60"
            />

            <Container className="relative z-10">
                {/* ── Section header ── */}
                <div className="text-center mb-14 max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, ease: SPRING_EASE }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-teal-50 border border-teal-100
                       text-teal-700 text-xs font-bold uppercase tracking-widest
                       mb-5 shadow-xs"
                    >
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Lingkungan Pesantren</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.08, ease: SPRING_EASE }}
                        className="section-title mb-4"
                    >
                        Fasilitas{" "}
                        <span className="text-gradient-teal">Terpadu &amp; Lengkap</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.16, ease: SPRING_EASE }}
                        className="section-subtitle"
                    >
                        Sarana dan prasarana yang memadai untuk menunjang kenyamanan
                        belajar, beribadah, dan aktivitas harian seluruh santri.
                    </motion.p>
                </div>

                {/* ── Photo gallery ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-14 auto-rows-[200px] md:auto-rows-[220px]">
                    {FACILITY_IMAGES.map((img, idx) => (
                        <motion.div
                            key={idx}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-60px" }}
                            variants={photoVariants}
                            transition={{
                                duration: 0.6,
                                delay: idx * 0.08,
                                ease: SPRING_EASE,
                            }}
                            className={`${img.span} relative rounded-2xl overflow-hidden group
                          border border-white/80 ring-1 ring-sand-200
                          shadow-md`}
                        >
                            {/* Image */}
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
                                className="object-cover transition-transform duration-700 ease-out
                           group-hover:scale-[1.06] bg-sand-50"
                            />

                            {/* Gradient overlay */}
                            <div
                                className="absolute inset-0 bg-gradient-to-t
                             from-black/60 via-black/10 to-transparent
                             transition-opacity duration-300
                             group-hover:from-black/70"
                            />

                            {/* sand accent bar — subtle branding touch */}
                            <div
                                className="absolute top-0 left-0 right-0 h-0.5
                             bg-gradient-to-r from-sand-400/0
                             via-sand-400/60 to-sand-400/0
                             opacity-0 group-hover:opacity-100
                             transition-opacity duration-500"
                            />

                            {/* Label */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                                <p className="text-white font-bold text-sm md:text-base leading-snug drop-shadow">
                                    {img.label}
                                </p>
                                <p className="text-white/70 font-medium text-xs mt-0.5 leading-snug">
                                    {img.sub}
                                </p>
                            </div>

                            {/* Hover shine */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100
                             bg-gradient-to-br from-white/6 to-transparent
                             transition-opacity duration-500 pointer-events-none"
                            />
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
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-100 to-transparent" />
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-300 whitespace-nowrap px-1">
                        Fasilitas Penunjang
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-100 to-transparent" />
                </motion.div>

                {/* ── Facilities list ── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-14"
                >
                    {FACILITIES.map((facility, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ y: -2 }}
                            className="group flex items-center gap-3.5 p-4 rounded-xl
                         bg-white border border-sand-200
                         hover:border-teal-200 hover:shadow-sm
                         transition-all duration-300 ease-out cursor-default"
                        >
                            {/* Icon */}
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center
                             shrink-0 ring-1 shadow-xs
                             transition-transform duration-300 group-hover:scale-105
                             ${iconClasses[facility.color] ?? iconClasses.ink}`}
                            >
                                <facility.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                            </div>

                            {/* Name */}
                            <span
                                className="font-semibold text-ink-800 text-sm leading-snug
                               group-hover:text-teal-800 transition-colors duration-200"
                            >
                                {facility.name}
                            </span>

                            {/* Hover arrow indicator */}
                            <ChevronRight
                                className="w-3.5 h-3.5 text-teal-300 ml-auto shrink-0
                             opacity-0 -translate-x-1
                             group-hover:opacity-100 group-hover:translate-x-0
                             transition-all duration-200"
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── CTA ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: SPRING_EASE }}
                    className="flex justify-center"
                >
                    <Link
                        href="/fasilitas"
                        onClick={() => navigateToDetail("/fasilitas", "#fasilitas")}
                    >
                        <button className="btn-secondary group inline-flex items-center gap-2.5 px-9">
                            <span>Lihat Semua Fasilitas</span>
                            <ArrowRight
                                className="w-[18px] h-[18px] transition-transform duration-300
                             group-hover:translate-x-1"
                            />
                        </button>
                    </Link>
                </motion.div>
            </Container>
        </section>
    );
}
