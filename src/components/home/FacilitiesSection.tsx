"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, School, Building2, Dumbbell, Beaker, HeartPulse, ShoppingCart, Monitor, UtensilsCrossed, Library, Waves, Coffee, Tent, Droplets, MapPin, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { navigateToDetail } from "@/lib/navigation-scroll";

const FACILITIES = [
    { name: "Masjid Kapasitas 1000 Jamaah", icon: Home, color: "maroon" },
    { name: "Gedung Sekolah Terpadu", icon: School, color: "cream" },
    { name: "Asrama Representatif", icon: Building2, color: "ink" },
    { name: "Fasilitas Olahraga", icon: Dumbbell, color: "gold" },
    { name: "Laboratorium IPA", icon: Beaker, color: "teal" },
    { name: "UKS (Unit Kesehatan Santri)", icon: HeartPulse, color: "red" },
    { name: "Mini Market", icon: ShoppingCart, color: "orange" },
    { name: "Lab. Komputer", icon: Monitor, color: "indigo" },
    { name: "Ruang Makan Bersama", icon: UtensilsCrossed, color: "amber" },
    { name: "Perpustakaan Digital", icon: Library, color: "emerald" },
    { name: "Area Kemandirian", icon: Waves, color: "cyan" },
    { name: "Kantin Sehat", icon: Coffee, color: "maroon" },
] as const;

const FACILITY_IMAGES = [
    { src: "/images/masjid.webp", label: "Masjid Jami'", span: "col-span-2 row-span-2" },
    { src: "/images/gedung-utama-dan-lapangan-basket.webp", label: "Gedung Utama & Lapangan", span: "col-span-1" },
    { src: "/images/gedung-kelas.webp", label: "Gedung Kelas", span: "col-span-1" },
    { src: "/images/asrama.webp", label: "Asrama Santri", span: "col-span-1" },
    { src: "/images/kelas-dari-dalam.webp", label: "Ruang Kelas", span: "col-span-1" },
] as const;

export default function FacilitiesSection() {
    return (
        <section id="fasilitas" className="section-std">
            {/* Background decorative element */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-yellow-100 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2 opacity-50" />

            <Container className="relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream-50 border border-cream-200 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Lingkungan Pesantren</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="section-title mb-6"
                    >
                        Fasilitas <span className="text-gradient-maroon">Terpadu & Lengkap</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="section-subtitle"
                    >
                        Sarana dan prasarana yang memadai untuk menunjang kenyamanan belajar, beribadah, dan aktivitas harian seluruh santri.
                    </motion.p>
                </div>

                {/* PHOTO GALLERY - FACILITIES WITH IMAGES (MOVED TO TOP) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16"
                >
                    {FACILITY_IMAGES.map((img, idx) => (
                        <div key={idx} className={`${img.span} relative rounded-3xl overflow-hidden group aspect-4/3 shadow-md border-4 border-white ring-1 ring-cream-200`}>
                            <Image
                                src={img.src}
                                alt={img.label}
                                fill
                                priority={idx < 2} // Preload top 2 images 
                                className="object-cover transition-transform duration-700 group-hover:scale-110 bg-brand-yellow-100 animate-pulse"
                                onLoad={(e) => e.currentTarget.classList.remove('animate-pulse')}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 right-3">
                                <span className="text-white font-bold text-xs sm:text-sm md:text-base drop-shadow-lg leading-tight block">{img.label}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* TEXT-ONLY FACILITIES LIST (MOVED TO BOTTOM - SMALLER TYPOGRAPHY) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
                    {FACILITIES.map((facility, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-cream-200 group hover:bg-cream-50 hover:border-maroon-200 hover:shadow-md transition-all duration-300"
                        >
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110 ${
                                facility.color === 'maroon' ? 'bg-maroon-50 text-brand-blue-600' :
                                facility.color === 'cream' ? 'bg-brand-yellow-100 text-maroon-800' :
                                facility.color === 'gold' ? 'bg-yellow-50 text-yellow-600' :
                                facility.color === 'teal' ? 'bg-teal-50 text-teal-600' :
                                facility.color === 'red' ? 'bg-red-50 text-red-600' :
                                facility.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                                facility.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                facility.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                                facility.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                facility.color === 'cyan' ? 'bg-cyan-50 text-cyan-600' :
                                'bg-surface-100 text-ink-600'
                                }`}>
                                <facility.icon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-ink-950 text-sm leading-tight group-hover:text-maroon-800 transition-colors">{facility.name}</span>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <Link href="/fasilitas" onClick={() => navigateToDetail('/fasilitas', '#fasilitas')}>
                        <button className="btn-secondary w-full sm:w-auto px-10 flex items-center gap-2 mx-auto disabled:opacity-50">
                            Lihat Semua Fasilitas
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </button>
                    </Link>
                </motion.div>
            </Container>
        </section>
    );
}