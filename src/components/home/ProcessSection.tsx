"use client";

import { UserPlus, FileText, CreditCard, ClipboardCheck, GraduationCap, CheckCircle, BellRing } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const STEPS = [
    {
        icon: UserPlus,
        title: "Buat Akun",
        description: "Daftarkan data diri awal dan buat akun pendaftaran santri baru.",
        color: "army",
    },
    {
        icon: CreditCard,
        title: "Pembayaran",
        description: "Bayar biaya daftar & unggah bukti transfer ke dashboard online.",
        color: "khaki",
    },
    {
        icon: FileText,
        title: "Lengkapi Berkas",
        description: "Isi form biodata lengkap dan unggah dokumen persyaratan digital.",
        color: "army-alt",
    },
    {
        icon: ClipboardCheck,
        title: "Tes Seleksi",
        description: "Hadiri dan ikuti ujian seleksi Al-Qur'an, wawancara, dan tes tulis.",
        color: "khaki",
    },
    {
        icon: BellRing,
        title: "Pengumuman",
        description: "Lihat hasil kelulusan seleksi melalui dashboard pendaftar & WhatsApp.",
        color: "army",
    },
    {
        icon: GraduationCap,
        title: "Daftar Ulang",
        description: "Lengkapi administrasi akhir setelah dinyatakan lolos seleksi.",
        color: "khaki-alt",
    },
] as const;

export default function ProcessSection() {
    return (
        <section id="alur" className="section-alt border-y border-khaki-200/50">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-60" />

            <Container className="relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white border border-khaki-200 text-army-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Prosedur PPDB</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="section-title mb-6"
                    >
                        Alur <span className="text-gradient-army">Pendaftaran</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="section-subtitle max-w-2xl mx-auto"
                    >
                        Ikuti langkah-langkah mudah berikut untuk menjadi bagian dari keluarga besar Pesantren Sistem PPDB Modern.
                    </motion.p>
                </div>

                {/* Steps Grid (Horizontal scroll on mobile to emulate fintech steps, grid on desktop) */}
                <div className="relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[60px] left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-khaki-300 to-transparent z-0" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-4 overflow-x-hidden md:overflow-visible">
                        {STEPS.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative z-10 flex flex-col items-center text-center group"
                            >
                                {/* Step Number Badge */}
                                <div className="absolute top-0 -right-2 md:right-4 lg:-right-2 w-8 h-8 md:w-9 md:h-9 rounded-[10px] bg-white shadow-md border border-khaki-200 flex items-center justify-center z-20 font-black text-army-700 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity text-xs md:text-sm">
                                    {idx + 1}
                                </div>

                                <div className={`w-20 h-20 md:w-[120px] md:h-[120px] rounded-[1.5rem] md:rounded-[2rem] border-2 flex items-center justify-center mb-5 md:mb-8 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-md ${step.color === 'army' ? 'bg-army-50 text-army-600 border-army-100 hover:bg-army-100' :
                                        step.color === 'khaki' ? 'bg-white text-khaki-800 border-khaki-200 hover:border-khaki-300 hover:bg-khaki-50' :
                                            step.color === 'army-alt' ? 'bg-surface-50 text-army-700 border-army-100 hover:bg-army-50' :
                                                'bg-khaki-50 text-army-800 border-khaki-100 hover:bg-khaki-100'
                                    }`}>
                                    <step.icon className="w-8 h-8 md:w-12 md:h-12" />
                                </div>

                                <h4 className="font-bold text-lg md:text-xl text-ink-950 mb-2 md:mb-3 tracking-tight group-hover:text-army-700 transition-colors">
                                    {step.title}
                                </h4>

                                <p className="text-xs md:text-sm text-ink-600 font-medium leading-relaxed px-4 lg:px-2 max-w-[280px] md:max-w-none">
                                    {step.description}
                                </p>

                                {/* Arrow for Mobile/Tablet */}
                                {idx < STEPS.length - 1 && (
                                    <div className="lg:hidden mt-6 md:mt-8 text-khaki-300">
                                        <div className="w-0.5 h-10 md:h-12 bg-khaki-200 mx-auto rounded-full" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 sm:mt-20 text-center"
                >
                    <button onClick={() => window.location.href = '/ppdb'} className="btn-primary w-full sm:w-auto px-12 md:px-16 text-base md:text-lg py-4">
                        Daftar Sebagai Santri
                    </button>
                </motion.div>
            </Container>
        </section>
    );
}