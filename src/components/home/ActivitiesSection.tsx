"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Trophy, Shield, Target, Monitor, Zap, TreePine, Waves, FileText, PenTool, Dumbbell, Play, Palette, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const ACTIVITIES = [
    { name: "Pembelajaran Aktif", color: "maroon", description: "Metode interaktif yang memadukan teori dan praktik syar'i guna mengoptimalkan potensi akademik santri secara mendalam.", image: "/images/pembelajaran-kitab-turotz.webp" },
    { name: "Kegiatan Rutin Harian", color: "cream", description: "Pembiasaan ibadah melalui sholat berjamaah tepat waktu dan halaqah tahfidz Al-Qur'an setiap hari secara konsisten.", image: "/images/tahfidz.webp" },
    { name: "Ekstrakurikuler Unggulan", color: "maroon-alt", description: "Tersedia 15+ pilihan kegiatan mulai dari beladiri hingga Desain Grafis untuk mengasah minat dan bakat santri.", image: "/images/extra-karate.webp" },
    { name: "Kemandirian & Skill", color: "maroon-light", description: "Program pelatihan entrepreneurship dan keterampilan hidup mandiri guna mencetak santri yang siap berdikari di masa depan.", image: "/images/luar-kelas.webp" },
] as const;

const EXTRA_ACTIVITIES = [
    { name: "Karate", icon: Trophy, color: "maroon" },
    { name: "Pramuka", icon: Shield, color: "cream" },
    { name: "Panahan", icon: Target, color: "maroon" },
    { name: "Futsal", icon: Trophy, color: "gold" },
    { name: "Volly", icon: Trophy, color: "maroon" },
    { name: "Komputer", icon: Monitor, color: "cream" },
    { name: "Design Grafis", icon: Palette, color: "maroon" },
    { name: "Kaligrafi", icon: PenTool, color: "gold" },
    { name: "Jurnalistik", icon: FileText, color: "maroon" },
    { name: "Konten Kreator", icon: Play, color: "cream" },
    { name: "Basket", icon: Dumbbell, color: "maroon" },
    { name: "Bulutangkis", icon: Zap, color: "gold" },
    { name: "Pertanian", icon: TreePine, color: "cream" },
    { name: "Periklanan", icon: Waves, color: "maroon" },
    { name: "Web Programming", icon: Sparkles, color: "gold" },
] as const;

export default function ActivitiesSection() {
    return (
        <section id="kegiatan" className="section-alt border-y border-cream-200/50">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

            <Container className="relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>Kegiatan Santri</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="section-title mb-6"
                    >
                        Kegiatan <span className="text-gradient-maroon">Bervariasi & Edukatif</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="section-subtitle"
                    >
                        Berbagai kegiatan positif untuk mengembangkan potensi santri dalam bidang akademik, spiritual, dan kemandirian sosial.
                    </motion.p>
                </div>

                {/* Main Activities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {ACTIVITIES.map((activity, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[2rem] border-2 border-transparent hover:border-maroon-200 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden flex flex-col"
                        >
                            <div className="relative h-48 overflow-hidden shrink-0">
                                <Image
                                    src={activity.image}
                                    alt={activity.name}
                                    fill
                                    priority={idx < 2}
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 bg-cream-100 animate-pulse"
                                    onLoad={(e) => e.currentTarget.classList.remove('animate-pulse')}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-maroon-900/60 to-transparent opacity-80" />
                            </div>
                            <div className="p-6 md:p-8 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-ink-950 mb-3 tracking-tight group-hover:text-maroon-700 transition-colors">{activity.name}</h3>
                                <p className="text-ink-500 font-medium text-[15px] leading-relaxed mb-6 flex-grow">
                                    {activity.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Extracurriculars Subsection */}
                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream-50 border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Minat & Bakat</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-ink-950 mt-4 mb-2">
                            Ekstrakurikuler <span className="text-gradient-maroon">Terpadu</span>
                        </h3>
                        <p className="text-ink-600 font-medium max-w-2xl mx-auto">
                            Mengembangkan potensi santri secara holistik melalui berbagai pilihan kegiatan yang mendukung kemandirian, kreativitas, dan fisik yang kuat.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
                        {EXTRA_ACTIVITIES.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.03 }}
                                className="bg-white p-5 md:p-6 rounded-[1.5rem] border border-cream-200 flex flex-col items-center justify-center text-center group hover:bg-cream-50 hover:border-maroon-200 hover:shadow-md transition-all duration-500 cursor-default"
                            >
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500 ${
                                    item.color === 'maroon' ? 'bg-maroon-50 text-maroon-600' :
                                    item.color === 'cream' ? 'bg-cream-100 text-maroon-700' :
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
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <Link href="/kegiatan">
                        <button className="btn-secondary w-full sm:w-auto px-12">
                            Lihat Semua Kegiatan
                        </button>
                    </Link>
                </motion.div>
            </Container>
        </section>
    );
}