"use client";

import { Users, User } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import Image from "next/image";

const BOARD_MEMBERS = [
    {
        name: "Ustadz Dr. Muhammad Arifin Badri, Lc, M.A",
        image: "/images/muhammad-arifin-badri.webp"
    },
    {
        name: "Ustadz Nurdin Apud Sarbini, Lc, M.Pd",
        image: "/images/nurdin-apud-sabrini.webp"
    },
    {
        name: "H. Tarmen Tascha, SE",
        image: "/images/tarmen-tascha.webp"
    },
    {
        name: "Ustadz Aminullah Yasin, Lc, M.Pd",
        image: "/images/aminullah-yasin.webp"
    },
    {
        name: "Ustadz Wahab Rajasam, M.Pd",
        image: "/images/wahab-rajasam.webp"
    },
    {
        name: "Ustadz Thoriq Ziyad, Lc",
        image: "/images/thoriq-ziyad.webp"
    },
] as const;

export default function BoardSection() {
    return (
        <section id="pembina" className="section-std">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cream-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />

            <Container className="relative z-10">
                <div className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream-50 border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>Struktur Organisasi</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="section-title mb-6"
                    >
                        Dewan <span className="text-gradient-maroon">Pembina</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="section-subtitle"
                    >
                        Dibimbing oleh para asatidz dan tokoh yang berpengalaman dalam membangun peradaban Islam melalui jalur pendidikan dan dakwah.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
                    {BOARD_MEMBERS.map((member, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="app-card bg-white p-4 sm:p-5 flex items-center gap-4 group"
                        >
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-cream-50 overflow-hidden shrink-0 transition-transform duration-500 group-hover:scale-105 shadow-sm border border-cream-100">
                                {member.image ? (
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            sizes="(max-width: 768px) 96px, 96px"
                                            priority={idx < 4}
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-maroon-900/0 group-hover:bg-maroon-900/10 transition-colors duration-500" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center group-hover:bg-maroon-50 transition-all duration-500">
                                        <User className="w-8 h-8 text-maroon-300 group-hover:text-maroon-600 transition-colors" />
                                    </div>
                                )}

                            </div>

                            <div className="min-w-0 py-2">
                                <h4 className="font-bold text-ink-950 text-base leading-snug group-hover:text-maroon-700 transition-colors">
                                    {member.name}
                                </h4>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}