"use client";

import Link from "next/link";
import { Send, ShieldCheck, Award, BookOpen } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { BRANDING } from "@/config/branding";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function CtaSection() {
    return (
        <section className="py-16 md:py-24 lg:py-28 bg-white relative overflow-hidden border-t border-sand-200">
            <Container>
                <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="bg-teal-900 rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] p-8 sm:p-12 md:p-16 lg:p-20 relative overflow-hidden text-center shadow-premium-lg border border-teal-800"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-800 to-teal-950 opacity-90" />
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
                    <div className="hidden sm:block absolute -top-32 -right-32 w-[400px] h-[400px] bg-sand-400/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="hidden sm:block absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-teal-500/30 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-6 shadow-xs">
                            <span className="text-sand-300">✦</span> Pendaftaran Dibuka 🎉
                        </div>

                        <h3 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] font-display font-black text-white mb-5 tracking-tight leading-[1.1]">
                            Mulai Langkah Pertama <br /> Menuju Generasi Unggul 🚀
                        </h3>
                        
                        <p className="text-[0.9375rem] md:text-[1.0625rem] text-sand-50/90 mb-10 leading-relaxed font-[450] text-center max-w-2xl mx-auto">
                            Telah dibuka Pendaftaran Santri Baru (PPDB) Tahun Ajaran 2026/2027. Kuota sangat terbatas untuk menjaga kualitas pendidikan secara optimal.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3.5 justify-center px-4 max-w-xl mx-auto w-full">
                            <Link href="/ppdb" className="w-full sm:w-auto flex-1">
                                <button className="w-full px-8 py-3.5 rounded-full bg-white text-teal-900 font-bold hover:bg-sand-50 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-[0.9375rem] flex items-center justify-center gap-2">
                                    Daftar Sekarang 🚀
                                </button>
                            </Link>
                            <Link href="/kontak" className="w-full sm:w-auto flex-1">
                                <button className="w-full px-8 py-3.5 rounded-full text-white font-bold border border-white/20 hover:bg-white/10 transition-all duration-300 text-[0.9375rem] flex items-center justify-center gap-2 backdrop-blur-sm group/btn">
                                    Konsultasi WhatsApp
                                    <Send className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </button>
                            </Link>
                        </div>

                        {/* ── Legalitas Badges ── */}
                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 w-full max-w-2xl">
                            <div className="flex items-center gap-2 text-sand-50/70">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em]">Terakreditasi BAN-PDM</span>
                            </div>
                            <div className="flex items-center gap-2 text-sand-50/70">
                                <BookOpen className="w-4 h-4 text-sand-400" />
                                <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em]">Kurikulum Terpadu</span>
                            </div>
                            <div className="flex items-center gap-2 text-sand-50/70">
                                <Award className="w-4 h-4 text-teal-300" />
                                <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em]">{BRANDING.schoolNetwork}</span>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </Container>
        </section>
    );
}
