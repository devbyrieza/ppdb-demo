"use client";

import { Rocket, Shield, Target, Compass, Monitor, Zap, TreePine, Waves, FileText, PenTool, Trophy, Dumbbell, Play, Palette, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

interface ExtraItem {
    name: string;
    icon: any;
    color: 'teal' | 'sand' | 'gold' | 'teal-alt' | 'sand-alt';
}

const EXTRA_ACTIVITIES: ExtraItem[] = [
    // Olahraga & Seni (Established)
    { name: "Karate", icon: Trophy, color: "teal" },
    { name: "Pramuka", icon: Shield, color: "sand" },
    { name: "Panahan", icon: Target, color: "teal" },
    { name: "Futsal", icon: Trophy, color: "gold" },
    { name: "Volly", icon: Trophy, color: "teal" },

    // Kompetensi & IT
    { name: "Komputer", icon: Monitor, color: "sand" },
    { name: "Design Grafis", icon: Palette, color: "teal" },
    { name: "Kaligrafi", icon: PenTool, color: "gold" },
    { name: "Jurnalistik", icon: FileText, color: "teal" },
    { name: "Konten Kreator", icon: Play, color: "sand" },

    // Kemandirian & Pengembangan
    { name: "Basket", icon: Dumbbell, color: "teal" },
    { name: "Bulutangkis", icon: Zap, color: "gold" },
    { name: "Pertanian", icon: TreePine, color: "sand" },
    { name: "Periklanan", icon: Waves, color: "teal" },
    { name: "Web Programming", icon: Rocket, color: "gold" },
] as const;

export default function ExtraSection() {
    return (
        <section id="ekstrakurikuler" className="section-std border-b border-sand-200/50">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sand-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

            <Container className="relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white border border-sand-200 text-teal-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Minat & Bakat</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="section-title mb-6"
                    >
                        Ekstrakurikuler <span className="text-gradient-teal">Terpadu</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="section-subtitle"
                    >
                        Mengembangkan potensi santri secara holistik melalui berbagai pilihan kegiatan yang mendukung kemandirian, kreativitas, dan fisik yang kuat.
                    </motion.p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {EXTRA_ACTIVITIES.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-white p-6 md:p-8 rounded-[2rem] border border-sand-200/60 flex flex-col items-center justify-center text-center group hover:bg-linear-to-b hover:from-white hover:to-sand-50 hover:border-teal-300 hover:shadow-premium-xl transition-all duration-500 cursor-default relative overflow-hidden"
                        >
                            {/* Hover Shine Effect */}
                            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] flex items-center justify-center mb-5 shadow-premium-sm group-hover:shadow-premium-md group-hover:scale-110 transition-all duration-500 relative z-10 ${
                                item.color === 'teal' ? 'bg-teal-50 text-teal-600' :
                                item.color === 'sand' ? 'bg-sand-50 text-teal-700' :
                                'bg-sand-100/50 text-teal-700'
                                }`}>
                                <item.icon className="w-7 h-7 md:w-8 md:h-8" />
                            </div>
                            
                            <p className="text-[10px] md:text-[11px] font-black tracking-[0.15em] text-ink-950 uppercase group-hover:text-teal-900 transition-colors leading-tight relative z-10">
                                {item.name}
                            </p>

                            {/* Subtle decorative dot */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
