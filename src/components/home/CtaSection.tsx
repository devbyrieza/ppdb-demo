"use client";

import Link from "next/link";
import { ArrowRight, Send, ShieldCheck, Award, BookOpen } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

export default function CtaSection() {
    return (
        <section className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden border-y border-brand-yellow-400">
            <Container>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-brand-blue-900 bg-linear-to-br from-brand-blue-800 to-brand-blue-950 rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[4rem] p-8 sm:p-12 md:p-16 lg:p-24 relative overflow-hidden text-center shadow-lg border border-brand-blue-700"
                >
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05] mix-blend-overlay" />
                    <div className="hidden sm:block absolute -top-32 -right-32 w-64 h-64 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] bg-brand-yellow-100/10 rounded-full blur-[80px] md:blur-[100px]" />
                    <div className="hidden sm:block absolute -bottom-32 -left-32 w-64 h-64 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] bg-maroon-500/20 rounded-full blur-[80px] md:blur-[100px]" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 md:mb-8 tracking-tight leading-[1.1]">
                            Mulai Langkah Pertama <br /> Masa Depan Qur'ani
                        </h3>
                        <p className="text-base md:text-lg lg:text-xl text-brand-yellow-100/90 mb-8 md:mb-12 leading-relaxed font-medium text-center max-w-2xl mx-auto">
                            Telah dibuka Pendaftaran Santri Baru (PPDB) Tahun Ajaran 2026/2027. Kuota terbatas untuk kualitas pendidikan optimal.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 max-w-xl mx-auto">
                            <Link href="/ppdb" className="w-full sm:w-auto flex-1">
                                <button className="w-full px-8 py-4 rounded-pill bg-white text-maroon-900 font-bold hover:bg-cream-50 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 text-base md:text-lg flex items-center justify-center gap-2">
                                    Daftar Sekarang
                                </button>
                            </Link>
                            <Link href="/kontak" className="w-full sm:w-auto flex-1">
                                <button className="w-full px-8 py-4 rounded-pill text-white font-bold border-2 border-white/20 hover:bg-white/10 transition-all duration-300 text-base md:text-lg flex items-center justify-center gap-2">
                                    Konsultasi WhatsApp
                                    <Send className="w-4 h-4 ml-1" />
                                </button>
                            </Link>
                        </div>

                        {/* Trust microcopy */}
                        <div className="mt-8 mb-4">
                            <span className="inline-block px-4 py-1.5 rounded-pill bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] sm:text-xs text-cream-50 font-bold uppercase tracking-widest">
                                ✦ Pendaftaran Gratis • Proses Mudah • Langsung Konfirmasi
                            </span>
                        </div>

                        {/* Legalitas badges */}
                        <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                            <div className="flex items-center gap-2 text-brand-yellow-100/70">
                                <ShieldCheck className="w-4 h-4 text-green-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Terakreditasi BAN-PDM</span>
                            </div>
                            <div className="flex items-center gap-2 text-brand-yellow-100/70">
                                <BookOpen className="w-4 h-4 text-yellow-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Sejak 1995 • 30+ Tahun</span>
                            </div>
                            <div className="flex items-center gap-2 text-brand-yellow-100/70">
                                <Award className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Resmi Kemendikdasmen</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </section>
    );
}