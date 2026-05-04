"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import {
    MapPin,
    Phone,
    Mail,
    MessageCircle,
    Send
} from "lucide-react";
import { motion } from "framer-motion";

const CONTACT_INFO = [
    {
        icon: MapPin,
        title: "Lokasi Pesantren",
        content: "Jl. Pelabuhan Ratu II KM 18",
        detail: "Cikembar, Sukabumi",
        accent: "teal" as const,
    },
    {
        icon: Phone,
        title: "Layanan Telepon",
        content: "+62 812-8530-0800",
        detail: "Senin-Sabtu (08.00 - 16.00)",
        accent: "sand" as const,
    },
    {
        icon: Mail,
        title: "Email Resmi",
        content: "alandalusululalbaab2@gmail.com",
        detail: "Kirim pertanyaan kapan saja",
        accent: "teal" as const,
    },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ContactSection() {
    return (
        <section id="kontak" className="py-20 md:py-24 bg-white relative overflow-hidden">
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="bg-sand-50/50 rounded-[2rem] lg:rounded-[2.5rem] p-8 md:p-12 lg:p-14 border border-sand-200 relative overflow-hidden shadow-sm"
                >
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('/grid-pattern.svg')] pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

                        {/* ── Text Content ── */}
                        <div className="lg:w-[45%] text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sand-200 text-teal-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs">
                                <MessageCircle className="w-3 h-3 shrink-0" strokeWidth={2} />
                                <span>Pusat Bantuan</span>
                            </div>
                            
                            <h2 className="section-title mb-5">
                                Ada Pertanyaan? <br />
                                <span className="text-gradient-teal">Kami Siap Membantu</span>
                            </h2>
                            
                            <p className="section-subtitle lg:ml-0 text-center lg:text-left mb-8 max-w-lg mx-auto lg:mx-0">
                                Jangan ragu untuk menghubungi kami. Tim administrasi kami siap melayani pertanyaan seputar pendaftaran, kurikulum, dan informasi pesantren.
                            </p>

                            <Link href="/kontak" className="inline-block w-full sm:w-auto">
                                <button className="btn-primary w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2.5 mx-auto lg:mx-0 group/btn">
                                    Hubungi Kami Sekarang
                                    <Send className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </button>
                            </Link>
                        </div>

                        {/* ── Cards Grid ── */}
                        <div className="lg:w-[55%] grid sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                            {CONTACT_INFO.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className={`bg-white p-6 rounded-2xl border border-sand-200 shadow-premium-sm hover:shadow-premium-md flex flex-col items-start group transition-all duration-400 ${idx === 0 ? 'sm:col-span-2' : ''}`}
                                >
                                    <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center mb-4 transition-transform shadow-xs group-hover:scale-105 duration-400 shrink-0 ${
                                        item.accent === 'teal' ? 'bg-teal-50 text-teal-600' :
                                        item.accent === 'sand' ? 'bg-sand-100 text-teal-800' :
                                        'bg-teal-50 text-teal-700'
                                    }`}>
                                        <item.icon className="w-5 h-5" strokeWidth={1.8} />
                                    </div>
                                    <h3 className="text-ink-900 font-bold text-[0.9375rem] mb-1.5 tracking-tight group-hover:text-teal-700 transition-colors">{item.title}</h3>
                                    <p className="text-ink-700 font-bold text-[0.875rem] leading-snug mb-1">{item.content}</p>
                                    <p className="text-ink-400 text-[0.6rem] font-bold uppercase tracking-[0.1em]">{item.detail}</p>
                                </div>
                            ))}
                        </div>

                    </div>
                </motion.div>
            </Container>
        </section>
    );
}
