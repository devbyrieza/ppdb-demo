"use client";

import { GraduationCap, Award, Globe, BookOpen, Users, CheckCircle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const TEACHER_BACKGROUNDS = [
    {
        institution: "Muhammad Ibn Saud Islamic University",
        location: "Pascasarjana, Riyadh, KSA",
    },
    {
        institution: "Univ. Sidi Mohamed ben Abdellah",
        location: "Pascasarjana, Fes, Maroko",
    },
    {
        institution: "Universitas Al-Azhar",
        location: "Kairo, Mesir",
    },
    {
        institution: "Rabithah Al-Alam Al-Islami",
        location: "Makkah Al-Mukarromah",
    },
    {
        institution: "Native Speaker",
        location: "Timur Tengah",
    },
    {
        institution: "LIPIA Jakarta",
        location: "Univ. Islam Imam Muhammad bin Saud",
    },
    {
        institution: "Universitas Negeri Yogyakarta",
        location: "Pascasarjana",
    },
    {
        institution: "STIBA Ar-Raayah",
        location: "Sukabumi",
    },
    {
        institution: "Lulusan Pondok Terkemuka",
        location: "Nasional",
    },
    {
        institution: "Dosen & Praktisi Ahli",
        location: "Tenaga Ahli",
    },
] as const;

export default function TeachersSection() {
    return (
        <section id="pengajar" className="section-alt">
            {/* Background patterns */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

            <Container className="relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-[40%] text-center lg:text-left lg:sticky lg:top-32"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white border border-brand-yellow-400 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Tenaga Pendidik</span>
                        </div>

                        <h2 className="section-title mb-8">
                            Dibimbing Oleh <span className="text-gradient-maroon">Asatidz Kompeten</span>
                        </h2>

                        <p className="section-subtitle lg:ml-0 text-justify lg:text-left mb-10">
                            Pesantren Al-Andalus Ulul Albaab didukung oleh asatidzah profesional lulusan universitas terbaik dunia Islam serta pakar pendidikan nasional.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
                            {[
                                { icon: Globe, label: "Lulusan Luar Negeri", sub: "Timur Tengah, Mesir & Maroko", color: "brand-blue" },
                                { icon: Users, label: "Native Speakers", sub: "Timur Tengah", color: "brand-yellow" },
                                { icon: BookOpen, label: "Lulusan Terbaik", sub: "Dalam Negeri & Pondok Unggulan", color: "gold" },
                                { icon: Award, label: "Dosen & Pakar", sub: "Tenaga Pendidik Profesional", color: "brand-blue" }
                            ].map((feature, i) => (
                                <div key={i} className="app-card p-4 flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                                        feature.color === 'brand-blue' ? 'bg-brand-blue-500 text-brand-blue-600' :
                                        feature.color === 'brand-yellow' ? 'bg-brand-yellow-100 text-maroon-800' :
                                        'bg-yellow-50 text-yellow-600'
                                        }`}>
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[15px] font-bold text-ink-950 leading-tight mb-1">{feature.label}</p>
                                        <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest leading-tight">{feature.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Grid Content */}
                    <div className="lg:w-[60%] grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {TEACHER_BACKGROUNDS.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="app-card p-6 flex items-start gap-4 group"
                            >
                                <div className="mt-1 w-6 h-6 rounded-full bg-brand-yellow-100 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
                                    <CheckCircle className="w-3.5 h-3.5 text-brand-blue-700" />
                                </div>
                                <div className="space-y-1.5 mt-0.5">
                                    <h4 className="font-bold text-ink-900 text-[15px] leading-snug group-hover:text-maroon-800 transition-colors">{item.institution}</h4>
                                    <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest leading-tight">{item.location}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </Container>
        </section>
    );
}