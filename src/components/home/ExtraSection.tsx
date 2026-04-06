"use client";

import { Rocket, Shield, Target, Compass, Monitor, Zap, TreePine, Waves, FileText, PenTool, Trophy, Dumbbell, Play, Palette, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

interface ExtraItem {
    name: string;
    icon: any;
    color: 'brand-blue' | 'brand-yellow' | 'gold' | 'maroon' | 'cream';
}

const EXTRA_ACTIVITIES: ExtraItem[] = [
    // Olahraga & Seni (Established)
    { name: "Karate", icon: Trophy, color: "brand-blue" },
    { name: "Pramuka", icon: Shield, color: "brand-yellow" },
    { name: "Panahan", icon: Target, color: "brand-blue" },
    { name: "Futsal", icon: Trophy, color: "gold" },
    { name: "Volly", icon: Trophy, color: "brand-blue" },

    // Kompetensi & IT
    { name: "Komputer", icon: Monitor, color: "brand-yellow" },
    { name: "Design Grafis", icon: Palette, color: "brand-blue" },
    { name: "Kaligrafi", icon: PenTool, color: "gold" },
    { name: "Jurnalistik", icon: FileText, color: "brand-blue" },
    { name: "Konten Kreator", icon: Play, color: "brand-yellow" },

    // Kemandirian & Pengembangan
    { name: "Basket", icon: Dumbbell, color: "brand-blue" },
    { name: "Bulutangkis", icon: Zap, color: "gold" },
    { name: "Pertanian", icon: TreePine, color: "brand-yellow" },
    { name: "Periklanan", icon: Waves, color: "brand-blue" },
    { name: "Web Programming", icon: Rocket, color: "gold" },
] as const;

export default function ExtraSection() {
    return (
        <section id="ekstrakurikuler" className="section-std border-b border-cream-200/50">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

            <Container className="relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream-50 border border-cream-200 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
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
                        Ekstrakurikuler <span className="text-gradient-maroon">Terpadu</span>
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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
                    {EXTRA_ACTIVITIES.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.03 }}
                            className="bg-white p-5 md:p-6 rounded-[1.5rem] border border-cream-200 flex flex-col items-center justify-center text-center group hover:bg-cream-50 hover:border-brand-blue-500 hover:shadow-md transition-all duration-500 cursor-default"
                        >
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500 ${
                                item.color === 'brand-blue' ? 'bg-maroon-50 text-brand-blue-600' :
                                item.color === 'brand-yellow' ? 'bg-brand-yellow-100 text-brand-blue-700' :
                                'bg-yellow-50 text-yellow-600'
                                }`}>
                                <item.icon className="w-6 h-6 md:w-7 md:h-7" />
                            </div>
                            <p className="text-[9px] md:text-[10px] font-bold tracking-[0.1em] text-ink-950 uppercase group-hover:text-maroon-800 transition-colors leading-tight">
                                {item.name}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}