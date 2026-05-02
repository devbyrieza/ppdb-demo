"use client";

import Link from "next/link";
import {
    GraduationCap,
    BookOpen,
    CheckCircle,
    ArrowRight,
    School
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { navigateToDetail } from "@/lib/navigation-scroll";

const PROGRAMS = [
    {
        title: "Madrasah Tsanawiyah",
        subtitle: "Tingkat Menengah (Setara SMP)",
        desc: "Pendidikan 3 tahun yang mencakup Tahfidz, Dasar Ilmu Syar'i, dan Akademik Nasional, serta pembentukan Adab sebagai fondasi utama.",
        features: [
            "Target Hafalan 12 Juz",
            "Sinergi Kurikulum Nasional & PPDB Modern",
            "Bahasa Arab & Kitab Turots",
            "Sanad Al-Qur'an & Hadith",
            "Program TICE & Global"
        ],
        quota: "25 Kursi",
        icon: School,
        color: "brand-blue"
    },
    {
        title: "I'dad Lughowi",
        subtitle: "Persiapan & Menengah Atas (Setara SMA)",
        desc: "Program intensif Bahasa dan Syari'at untuk mencetak kader ulama masa depan. Persiapan matang studi ke Universitas Timur Tengah maupun Perguruan Tinggi Favorit Dalam Negeri.",
        features: [
            "Target Hafalan 16 Juz",
            "Penguasaan Kitab Turots",
            "Bahasa Arab Aktif & Formal",
            "Persiapan Universitas Timur Tengah & Dalam Negeri",
            "Ziarah Ilmiah"
        ],
        quota: "25 Kursi",
        icon: BookOpen,
        color: "brand-yellow"
    },
];

export default function ProgramSection() {
    return (
        <section id="program" className="section-std">
            {/* Subtle Patterns */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

            <Container className="relative z-10">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-yellow-50 border border-brand-yellow-400 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
                    >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Jenjang Pendidikan</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="section-title mb-6"
                    >
                        Program Studi <span className="text-gradient-maroon">Unggulan</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="section-subtitle"
                    >
                        Kami berkomitmen memberikan pendidikan berkualitas tinggi yang menggabungkan keunggulan spiritual, intelektual, dan karakter.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
                    {PROGRAMS.map((program, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2, duration: 0.6 }}
                            whileHover={{ y: -8 }}
                            className="h-full group"
                        >
                            <div className="bg-white rounded-[3rem] p-10 md:p-12 h-full flex flex-col relative border border-cream-200/60 hover:border-brand-blue-200 hover:shadow-premium-2xl transition-all duration-500 overflow-hidden">
                                {/* Glassmorphism Accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-brand-blue-50/50 to-transparent rounded-bl-[4rem] -z-0" />
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Icon & Quota Row */}
                                    <div className="flex items-start justify-between mb-10">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-premium-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${
                                            program.color === 'brand-blue' ? 'bg-brand-blue-600 text-white shadow-brand-blue-200/50' : 'bg-brand-yellow-400 text-maroon-950 shadow-brand-yellow-200/50'
                                            }`}>
                                            <program.icon className="w-8 h-8" />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-ink-400 uppercase tracking-[0.2em] mb-1.5">Kapasitas</span>
                                            <div className="bg-ink-950 text-white py-2 px-4 rounded-xl text-xs font-black shadow-lg">
                                                {program.quota}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <h3 className="text-3xl md:text-4xl font-black text-ink-950 mb-3 tracking-tight group-hover:text-brand-blue-800 transition-colors">{program.title}</h3>
                                        <p className="text-[11px] font-black text-brand-blue-600 tracking-[0.2em] uppercase mb-6 opacity-80">{program.subtitle}</p>
                                        <p className="text-base text-ink-600 leading-relaxed font-medium text-justify md:text-left">
                                            {program.desc}
                                        </p>
                                    </div>

                                    {/* Feature List with custom bullets */}
                                    <div className="mb-12 grow">
                                        <h4 className="text-xs font-black text-ink-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <div className="w-8 h-[2px] bg-brand-yellow-400" />
                                            Target & Kurikulum
                                        </h4>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                                            {program.features.map((feature, fIdx) => (
                                                <li key={fIdx} className="flex items-start gap-3 group/item">
                                                    <div className="mt-1 w-5 h-5 rounded-full bg-linear-to-br from-brand-blue-50 to-brand-blue-100 flex items-center justify-center shrink-0 border border-brand-blue-200 group-hover/item:bg-brand-blue-600 group-hover/item:border-brand-blue-600 transition-all">
                                                        <CheckCircle className="w-3 h-3 text-brand-blue-600 group-hover/item:text-white transition-colors" />
                                                    </div>
                                                    <span className="text-sm font-bold text-ink-800 group-hover/item:text-ink-950 transition-colors">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link href="/program" onClick={() => navigateToDetail('/program', '#program')} className="relative z-10">
                                        <button className="w-full bg-surface-50 border-2 border-surface-200 text-ink-950 hover:bg-brand-blue-700 hover:border-brand-blue-700 hover:text-white py-4.5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-500 shadow-premium-xs group-hover:shadow-premium-md">
                                            Jelajahi Kurikulum Selengkapnya
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
