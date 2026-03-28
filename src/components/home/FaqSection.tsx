"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const FAQS = [
    {
        question: "Kapan pendaftaran santri baru angkatan 2026/2027 dibuka?",
        answer: "Pendaftaran PPDB Tahun Ajaran 2026/2027 dibuka mulai tanggal 10 Februari sampai dengan 30 Mei 2026. Namun, pendaftaran dapat ditutup lebih awal jika kuota santri baru sudah terpenuhi.",
    },
    {
        question: "Apakah santri diwajibkan untuk tinggal di asrama?",
        answer: "Ya, seluruh santri di Pesantren Al-Andalus Al-Imam wajib tinggal di asrama untuk mengikuti seluruh rangkaian kegiatan tarbiyah, halaqah tahfidz, dan pembelajaran kitab turots secara maksimal.",
    },
    {
        question: "Kurikulum apa yang diterapkan di Pesantren Al-Andalus Al-Imam?",
        answer: "Kami menerapkan Kurikulum Terpadu yang menggabungkan kurikulum Nasional dengan kurikulum khas Al-Andalus yang berfokus pada penguasaan Bahasa Arab, Tahfidz Al-Qur'an, dan Kitab Turots.",
    },
    {
        question: "Apa saja berkas persyaratan yang harus disiapkan?",
        answer: "Berkas utama yang diperlukan adalah Akta Kelahiran, Kartu Keluarga, Ijazah/Rapor terakhir, dan pas foto terbaru. Seluruh berkas diunggah secara digital melalui dashboard pendaftaran.",
    },
    {
        question: "Bagaimana sistem seleksi yang diterapkan?",
        answer: "Sistem seleksi meliputi tes lisan (tahfidz/bacaan Al-Qur'an), tes tertulis (pengetahuan dasar agama dan akademik), serta Wawancara Calsan dan orang tua.",
    },
    {
        question: "Apakah tersedia program beasiswa?",
        answer: "Ya, Al-Andalus Al-Imam menyediakan program beasiswa bagi santri berprestasi (tahfidz 30 juz) dan santri dari keluarga yatim/piatu/dhuafa dengan syarat dan ketentuan yang berlaku.",
    },
] as const;

function FaqItem({ question, answer, isOpen, toggle }: { question: string, answer: string, isOpen: boolean, toggle: () => void }) {
    return (
        <div className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${isOpen ? 'bg-white border-cream-200 shadow-md ring-1 ring-cream-100' : 'bg-white border-cream-200 hover:border-maroon-200 hover:bg-cream-50/50'}`}>
            <button
                onClick={toggle}
                className="w-full px-6 py-5 md:px-8 md:py-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-500 rounded-[24px]"
            >
                <span className={`font-bold text-base md:text-lg tracking-tight transition-colors pr-4 ${isOpen ? 'text-maroon-700' : 'text-ink-950'}`}>
                    {question}
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-maroon-600 text-white rotate-180 shadow-md' : 'bg-cream-100 text-maroon-600 group-hover:bg-maroon-100'}`}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-6 pb-6 md:px-8 md:pb-8 pt-0">
                            <div className="h-px bg-cream-200 w-12 mb-6" />
                            <p className="text-ink-600 leading-relaxed font-medium text-[15px] sm:text-base text-left">
                                {answer}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="section-std relative">
            {/* Decorative Blur */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-cream-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />

            <Container className="relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream-50 border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Tanya Jawab</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="section-title mb-6"
                    >
                        Sering <span className="text-gradient-maroon">Ditanyakan</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="section-subtitle max-w-2xl mx-auto"
                    >
                        Temukan jawaban cepat untuk pertanyaan umum seputar pendaftaran, biaya, dan sistem pendidikan di Al-Andalus Al-Imam.
                    </motion.p>
                </div>

                <div className="max-w-4xl mx-auto space-y-4 relative">
                    {/* Decorative element behind FAQs */}
                    <div className="absolute top-10 -right-20 w-40 h-40 bg-cream-100/50 rounded-full blur-[60px] -z-10 pointer-events-none" />
                    
                    {FAQS.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <FaqItem
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openIndex === idx}
                                toggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action WhatsApp */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 sm:mt-20 text-center max-w-md mx-auto"
                >
                    <div className="bg-cream-50 rounded-3xl p-8 border border-cream-200 text-center shadow-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cream-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <p className="text-ink-600 font-bold mb-5 relative z-10 text-sm tracking-wide uppercase">Punya pertanyaan lain?</p>
                        <a
                            href="https://wa.me/6285111524441"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary w-full relative z-10 justify-center shadow-md bg-[#25D366] hover:bg-[#20BE5A] hover:shadow-lg"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            Hubungi via WhatsApp
                        </a>
                    </div>
                </motion.div>
            </Container>
        </section>
    );
}