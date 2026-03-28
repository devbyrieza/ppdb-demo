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
            "Sinergi Kurikulum Nasional & Al-Andalus",
            "Bahasa Arab & Kitab Turots",
            "Sanad Al-Qur'an & Hadith",
            "Program TICE & Global"
        ],
        quota: "25 Kursi",
        icon: School,
        color: "maroon"
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
            "Ziarah Ilmiah & Pengabdian"
        ],
        quota: "25 Kursi",
        icon: BookOpen,
        color: "cream"
    },
] as const;

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
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream-50 border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
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
                <div className="grid md:grid-cols-2 gap-6 lg:gap-10 max-w-6xl mx-auto">
                    {PROGRAMS.map((program, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="h-full"
                        >
                            <div className="app-card bg-white p-8 md:p-10 h-full flex flex-col group">
                                {/* Top Accents */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                                        program.color === 'maroon' ? 'bg-maroon-50 text-maroon-600' : 'bg-cream-100 text-maroon-800'
                                        }`}>
                                        <program.icon className="w-7 h-7" />
                                    </div>
                                    <div className="status-pill status-pill-pending bg-cream-100 py-1.5 px-3">
                                        Kuota: {program.quota}
                                    </div>
                                </div>

                                <div className="flex-grow">
                                    <h3 className="text-2xl font-bold text-ink-950 mb-2">{program.title}</h3>
                                    <p className="text-xs font-bold text-maroon-600/80 mb-6 tracking-wide uppercase">{program.subtitle}</p>
                                    <p className="text-[15px] text-ink-600 leading-relaxed mb-8 font-medium text-justify">
                                        {program.desc}
                                    </p>

                                    {/* Feature List */}
                                    <ul className="space-y-4 mb-10">
                                        {program.features.map((feature, fIdx) => (
                                            <li key={fIdx} className="flex items-start gap-3">
                                                <div className="mt-1 w-5 h-5 rounded-full bg-cream-100 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-3.5 h-3.5 text-maroon-700" />
                                                </div>
                                                <span className="text-sm font-bold text-ink-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link href="/program" onClick={() => navigateToDetail('/program', '#program')}>
                                    <button className="btn-secondary w-full py-3.5 justify-center mt-auto group-hover:bg-cream-50">
                                        Detail Program
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
