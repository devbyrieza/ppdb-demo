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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {EXTRA_ACTIVITIES.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-white p-6 md:p-8 rounded-[2rem] border border-cream-200/60 flex flex-col items-center justify-center text-center group hover:bg-linear-to-b hover:from-white hover:to-cream-50 hover:border-brand-blue-300 hover:shadow-premium-xl transition-all duration-500 cursor-default relative overflow-hidden"
                        >
                            {/* Hover Shine Effect */}
                            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] flex items-center justify-center mb-5 shadow-premium-sm group-hover:shadow-premium-md group-hover:scale-110 transition-all duration-500 relative z-10 ${
                                item.color === 'brand-blue' ? 'bg-brand-blue-50 text-brand-blue-600' :
                                item.color === 'brand-yellow' ? 'bg-brand-yellow-50 text-brand-blue-700' :
                                'bg-brand-yellow-100/50 text-brand-yellow-700'
                                }`}>
                                <item.icon className="w-7 h-7 md:w-8 md:h-8" />
                            </div>
                            
                            <p className="text-[10px] md:text-[11px] font-black tracking-[0.15em] text-ink-950 uppercase group-hover:text-brand-blue-900 transition-colors leading-tight relative z-10">
                                {item.name}
                            </p>

                            {/* Subtle decorative dot */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}