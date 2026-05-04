"use client";

import Link from "next/link";
import {
    GraduationCap,
    BookOpen,
    CheckCircle,
    ArrowRight,
    School,
    Users,
    type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, Variants } from "framer-motion";
import { navigateToDetail } from "@/lib/navigation-scroll";

const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

type ProgramVariant = "teal" | "sand";

interface ProgramItem {
    title: string;
    subtitle: string;
    desc: string;
    features: string[];
    quota: string;
    icon: LucideIcon;
    variant: ProgramVariant;
}

const PROGRAMS: ProgramItem[] = [
    {
        title: "Madrasah Tsanawiyah",
        subtitle: "Tingkat Menengah · Setara SMP",
        desc: "Pendidikan 3 tahun yang mencakup Tahfidz, Dasar Ilmu Syar'i, dan Akademik Nasional, serta pembentukan Adab sebagai fondasi utama.",
        features: [
            "Target Hafalan 12 Juz",
            "Sinergi Kurikulum Nasional & PPDB Modern",
            "Bahasa Arab & Kitab Turots",
            "Sanad Al-Qur'an & Hadith",
            "Program TICE & Global",
        ],
        quota: "25 Kursi",
        icon: School,
        variant: "teal",
    },
    {
        title: "I'dad Lughowi",
        subtitle: "Persiapan & Menengah Atas · Setara SMA",
        desc: "Program intensif Bahasa dan Syari'at untuk mencetak kader ulama masa depan. Persiapan matang studi ke Universitas Timur Tengah maupun Perguruan Tinggi Favorit Dalam Negeri.",
        features: [
            "Target Hafalan 16 Juz",
            "Penguasaan Kitab Turots",
            "Bahasa Arab Aktif & Formal",
            "Persiapan Universitas Timur Tengah & Dalam Negeri",
            "Ziarah Ilmiah",
        ],
        quota: "25 Kursi",
        icon: BookOpen,
        variant: "sand",
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12 },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "tween", duration: 0.65, ease: SPRING },
    },
};

const featureVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "tween", duration: 0.4, ease: SPRING },
    },
};

function getTokens(variant: ProgramVariant) {
    switch (variant) {
        case "teal":
            return {
                accentBar:
                    "bg-gradient-to-r from-teal-700 via-teal-500 to-teal-300",
                corner: "bg-teal-50",
                icon: "bg-teal-700 text-sand-100",
                subtitleText: "text-teal-600",
                dividerLine: "bg-teal-300",
                checkBg: "bg-teal-50 border-teal-200",
                checkHover:
                    "group-hover/item:bg-teal-600 group-hover/item:border-teal-600",
                checkIcon:
                    "text-teal-600 group-hover/item:text-white",
                ctaBtn:
                    "bg-white border-teal-200 text-teal-800 hover:bg-teal-700 hover:border-teal-700 hover:text-sand-100",
                cardBorder: "border-teal-100 group-hover:border-teal-200",
                hoverTitle: "group-hover:text-teal-800",
            };
        case "sand":
            return {
                accentBar:
                    "bg-gradient-to-r from-sand-600 via-sand-400 to-sand-200",
                corner: "bg-sand-50",
                icon: "bg-sand-400 text-teal-900",
                subtitleText: "text-sand-600",
                dividerLine: "bg-sand-300",
                checkBg: "bg-sand-50 border-sand-200",
                checkHover:
                    "group-hover/item:bg-sand-500 group-hover/item:border-sand-500",
                checkIcon:
                    "text-sand-600 group-hover/item:text-teal-950",
                ctaBtn:
                    "bg-white border-sand-300 text-teal-800 hover:bg-sand-500 hover:border-sand-500 hover:text-teal-950",
                cardBorder: "border-sand-100 group-hover:border-sand-300",
                hoverTitle: "group-hover:text-teal-700",
            };
    }
}

export default function ProgramSection() {
    return (
        <section id="program" className="section-std relative overflow-hidden">
            {/* Ambient blobs — teal & sand */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-teal-50/70 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-sand-100/50 blur-3xl" />
            </div>

            <Container className="relative z-10">

                {/* ── Header ────────────────────────────── */}
                <div className="max-w-2xl mx-auto text-center mb-16 lg:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: "tween", duration: 0.5, ease: SPRING }}
                        className="inline-flex mb-6"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-bold uppercase tracking-[0.12em] shadow-xs">
                            <GraduationCap className="w-3 h-3" />
                            Jenjang Pendidikan
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            type: "tween",
                            duration: 0.55,
                            ease: SPRING,
                            delay: 0.08,
                        }}
                        className="section-title mb-5 text-balance"
                    >
                        Program Studi{" "}
                        <span className="text-gradient-teal">Unggulan</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            type: "tween",
                            duration: 0.55,
                            ease: SPRING,
                            delay: 0.14,
                        }}
                        className="section-subtitle"
                    >
                        Pendidikan berkualitas tinggi yang menggabungkan keunggulan
                        spiritual, intelektual, dan karakter dalam satu sistem terpadu.
                    </motion.p>
                </div>

                {/* ── Cards Grid ─────────────────────────── */}
                <motion.div
                    className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={containerVariants}
                >
                    {PROGRAMS.map((program, idx) => {
                        const tokens = getTokens(program.variant);
                        return (
                            <motion.div
                                key={idx}
                                variants={cardVariants}
                                whileHover={{
                                    y: -6,
                                    transition: {
                                        type: "tween",
                                        duration: 0.3,
                                        ease: SPRING,
                                    },
                                }}
                                className="group h-full"
                            >
                                <div
                                    className={`relative h-full flex flex-col bg-white rounded-2xl border overflow-hidden shadow-premium-sm group-hover:shadow-premium-lg transition-all duration-500 ${tokens.cardBorder}`}
                                >
                                    {/* Top accent bar */}
                                    <div
                                        className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl ${tokens.accentBar}`}
                                    />

                                    {/* Decorative corner */}
                                    <div
                                        className={`absolute top-0 right-0 w-28 h-28 rounded-bl-[3rem] opacity-40 ${tokens.corner}`}
                                    />

                                    <div className="relative z-10 flex flex-col h-full p-8 md:p-10">

                                        {/* ── Card Header ── */}
                                        <div className="flex items-start justify-between mb-8">
                                            {/* Icon */}
                                            <div
                                                className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:-rotate-2 ${tokens.icon}`}
                                            >
                                                <program.icon
                                                    className="w-6 h-6"
                                                    strokeWidth={1.75}
                                                />
                                            </div>

                                            {/* Quota badge */}
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.15em]">
                                                    Kapasitas
                                                </span>
                                                <div className="flex items-center gap-1.5 bg-ink-950 text-white px-3 py-1.5 rounded-lg shadow-md">
                                                    <Users className="w-3 h-3 opacity-70" />
                                                    <span className="text-xs font-black">
                                                        {program.quota}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Title Block ── */}
                                        <div className="mb-7">
                                            <h3
                                                className={`font-display font-black text-2xl md:text-[1.75rem] text-ink-950 tracking-tight leading-tight mb-2 transition-colors duration-300 ${tokens.hoverTitle}`}
                                            >
                                                {program.title}
                                            </h3>
                                            <p
                                                className={`text-[11px] font-bold uppercase tracking-[0.15em] mb-5 ${tokens.subtitleText}`}
                                            >
                                                {program.subtitle}
                                            </p>
                                            <p className="text-[14.5px] text-ink-600 leading-relaxed font-[450] text-justify md:text-left">
                                                {program.desc}
                                            </p>
                                        </div>

                                        {/* ── Feature List ── */}
                                        <div className="mb-8 grow">
                                            <div className="flex items-center gap-2.5 mb-5">
                                                <div
                                                    className={`h-px w-6 ${tokens.dividerLine}`}
                                                />
                                                <span className="text-[10px] font-black text-ink-400 uppercase tracking-[0.15em]">
                                                    Target &amp; Kurikulum
                                                </span>
                                            </div>

                                            <motion.ul
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3"
                                                variants={containerVariants}
                                            >
                                                {program.features.map((feature, fIdx) => (
                                                    <motion.li
                                                        key={fIdx}
                                                        variants={featureVariants}
                                                        className="flex items-start gap-2.5 group/item"
                                                    >
                                                        <div
                                                            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 ${tokens.checkBg} ${tokens.checkHover}`}
                                                        >
                                                            <CheckCircle
                                                                className={`w-3 h-3 transition-colors duration-200 ${tokens.checkIcon}`}
                                                                strokeWidth={2.5}
                                                            />
                                                        </div>
                                                        <span className="text-[13px] font-semibold text-ink-700 leading-snug group-hover/item:text-ink-950 transition-colors duration-200">
                                                            {feature}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </motion.ul>
                                        </div>

                                        {/* ── CTA Button ── */}
                                        <Link
                                            href="/program"
                                            onClick={() =>
                                                navigateToDetail("/program", "#program")
                                            }
                                            className="block"
                                        >
                                            <button
                                                className={`w-full py-3.5 px-6 rounded-xl font-bold text-[13.5px] flex items-center justify-center gap-2.5 border transition-all duration-300 group/btn ${tokens.ctaBtn}`}
                                            >
                                                Jelajahi Kurikulum Selengkapnya
                                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                            </button>
                                        </Link>

                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

            </Container>
        </section>
    );
}
