"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Phone,
    Mail,
    Send,
    CheckCircle,
    Instagram,
    Facebook,
    Youtube,
    MessageCircle,
    Clock,
    ArrowRight,
    Map as MapIcon,
    Award,
    ShieldCheck,
    GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ========================================
// REUSABLE COMPONENTS
// ========================================

const ContactInfoCard = ({
    icon: Icon,
    title,
    content,
    href,
    subContent,
    delay = 0
}: {
    icon: any,
    title: string,
    content: string,
    href?: string,
    subContent?: string,
    delay?: number
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="app-card bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-brand-blue-100 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center"
    >
        <div className="w-16 h-16 rounded-2xl bg-brand-blue-50 flex items-center justify-center text-brand-blue-600 mb-6 group-hover:scale-110 transition-transform shadow-sm border border-brand-blue-100">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-display font-black text-brand-blue-950 mb-3">{title}</h3>
        {href ? (
            <a href={href} className="text-lg font-bold text-brand-blue-600 hover:text-brand-blue-700 transition-colors break-all">
                {content}
            </a>
        ) : (
            <p className="text-lg text-ink-700 leading-relaxed font-bold">
                {content}
            </p>
        )}
        {subContent && (
            <p className="mt-3 text-sm text-ink-400 font-bold uppercase tracking-widest">{subContent}</p>
        )}
    </motion.div>
);

const SocialCard = ({ social, delay = 0 }: { social: any, delay?: number }) => (
    <motion.a
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`app-card group flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] bg-white border border-brand-blue-50 shadow-sm hover:shadow-md transition-all`}
    >
        <div className={`w-14 h-14 rounded-2xl ${social.bgLight} flex items-center justify-center ${social.textColor} group-hover:scale-110 transition-transform shadow-sm border border-brand-blue-50`}>
            <social.icon className="w-7 h-7" />
        </div>
        <div>
            <p className="text-[10px] font-black text-ink-400 uppercase tracking-widest mb-1">{social.name}</p>
            <p className={`font-black text-ink-900 group-hover:${social.textColor} transition-colors text-sm md:text-base break-all`}>{social.username}</p>
        </div>
    </motion.a>
);

// ========================================
// MAIN COMPONENT
// ========================================

export default function ContactPage() {
    const [formData, setFormData] = useState({
        nama: "",
        email: "",
        telepon: "",
        pesan: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setShowSuccess(true);
            setFormData({ nama: "", email: "", telepon: "", pesan: "" });
            setIsSubmitting(false);
            setTimeout(() => setShowSuccess(false), 5000);
        }, 1500);
    };

    const SOCIAL_MEDIA = [
        {
            name: "Instagram",
            username: "@alandalusululalbaab",
            url: "https://www.instagram.com/alandalusululalbaab/",
            icon: Instagram,
            textColor: "text-pink-600",
            bgLight: "bg-pink-50",
        },
        {
            name: "Facebook",
            username: "Pesantren Al-Andalus Ulul Albaab",
            url: "https://www.facebook.com/search/top?q=pesantren%20al-andalus%20ulul%20albaab",
            icon: Facebook,
            textColor: "text-blue-600",
            bgLight: "bg-blue-50",
        },
        {
            name: "Youtube",
            username: "Al Andalus Ulul Albaab",
            url: "https://www.youtube.com/@AlAndalusUlulAlbaab",
            icon: Youtube,
            textColor: "text-red-600",
            bgLight: "bg-red-50",
        },
    ];

    return (
        <main className="bg-white min-h-screen pb-32 md:pb-0">
            {/* 1. Hero Section - Airy & Clean */}
            <section className="relative py-24 md:py-32 overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-yellow-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

                <Container className="relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-blue-50 border border-brand-blue-100 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-10 shadow-sm"
                        >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Layanan Informasi & Kontak</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-7xl lg:text-8xl font-display font-black mb-10 tracking-tight leading-[0.9] text-ink-950"
                        >
                            Kami Siap <br />
                            <span className="text-gradient-blue">Membantu Anda</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-ink-600 max-w-3xl mx-auto leading-relaxed font-medium"
                        >
                            Hubungi kami untuk informasi lebih lanjut mengenai pendaftaran, program pendidikan, atau kunjungan ke pesantren.
                        </motion.p>
                    </div>
                </Container>
            </section>

            {/* 2. Contact Info Grid */}
            <section className="py-12 relative">
                <Container>
                    <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
                        <ContactInfoCard
                            icon={MapPin}
                            title="Alamat Lengkap"
                            content="Jl. KH Mama Oyon, Cihaur, Kec. Cicantayan, Kabupaten Sukabumi, Jawa Barat 43155"
                            subContent="Lokasi Strategis & Asri"
                            delay={0.1}
                        />
                        <ContactInfoCard
                            icon={MessageCircle}
                            title="Nomor WhatsApp CS"
                            content="+62 812-85-300800"
                            href="https://wa.me/6281285300800"
                            subContent="Layanan Informasi Pelayanan"
                            delay={0.2}
                        />
                        <ContactInfoCard
                            icon={Mail}
                            title="Email Resmi"
                            content="alandalus.ululalbaab@gmail.com"
                            href="mailto:alandalus.ululalbaab@gmail.com"
                            subContent="Surat Menyurat & Kerjasama"
                            delay={0.3}
                        />
                    </div>
                </Container>
            </section>

            {/* 3. Form & Social Media Section */}
            <section className="py-24 md:py-32 bg-surface-50/50">
                <Container>
                    <div className="grid lg:grid-cols-5 gap-10 lg:gap-24 items-start">
                        {/* Form Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="lg:col-span-3 bg-white p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-lg border border-brand-blue-50 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-50/50 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 md:gap-5 mb-8 md:mb-12">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-blue-900 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-md shrink-0">
                                        <Send className="w-6 h-6 md:w-8 md:h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-display font-black text-ink-950 mb-1">Kirim Pesan</h2>
                                        <p className="text-sm md:text-base text-ink-500 font-medium">Tim kami akan membalas segera.</p>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            className="bg-teal-50 border border-teal-100 p-6 rounded-[2rem] overflow-hidden"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white shrink-0">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <p className="text-teal-900 font-black text-lg">Pesan Terkirim! Syukran.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                                        <div className="space-y-2 md:space-y-3">
                                            <label className="text-[10px] md:text-xs font-black text-ink-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                name="nama"
                                                value={formData.nama}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-5 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl bg-brand-blue-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-blue-50 transition-all font-bold text-ink-900 placeholder:text-ink-300 text-sm md:text-base"
                                                placeholder="Nama lengkap Anda"
                                            />
                                        </div>
                                        <div className="space-y-2 md:space-y-3">
                                            <label className="text-[10px] md:text-xs font-black text-ink-400 uppercase tracking-widest ml-1">Email Aktif</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-5 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl bg-brand-blue-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-blue-50 transition-all font-bold text-ink-900 placeholder:text-ink-300 text-sm md:text-base"
                                                placeholder="email@anda.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:space-y-3">
                                        <label className="text-[10px] md:text-xs font-black text-ink-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                                        <input
                                            type="tel"
                                            name="telepon"
                                            value={formData.telepon}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-5 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl bg-brand-blue-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-blue-50 transition-all font-bold text-ink-900 placeholder:text-ink-300 text-sm md:text-base"
                                            placeholder="08xx-xxxx-xxxx"
                                        />
                                    </div>

                                    <div className="space-y-2 md:space-y-3">
                                        <label className="text-[10px] md:text-xs font-black text-ink-400 uppercase tracking-widest ml-1">Kebutuhan / Pesan</label>
                                        <textarea
                                            name="pesan"
                                            value={formData.pesan}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            className="w-full px-5 py-3 md:px-8 md:py-5 rounded-xl md:rounded-2xl bg-brand-blue-50 border border-transparent focus:bg-white focus:border-brand-blue-200 focus:ring-4 focus:ring-brand-blue-50 transition-all font-bold text-ink-900 placeholder:text-ink-300 text-sm md:text-base resize-none"
                                            placeholder="Apa yang bisa kami bantu?"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 md:py-6 rounded-pill bg-brand-blue-900 text-white font-black text-lg md:text-xl hover:bg-brand-yellow-600 shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Sedang Mengirim..." : "Kirim Sekarang"}
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>

                        {/* Social & Map Column */}
                        <div className="lg:col-span-2 space-y-8 md:space-y-12">
                            <div className="space-y-4 md:space-y-6">
                                <motion.h2
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="text-2xl md:text-3xl font-display font-black text-ink-950 px-2"
                                >
                                    Ikuti <span className="text-brand-blue-600">Media Sosial</span>
                                </motion.h2>
                                <div className="grid gap-3 md:gap-5">
                                    {SOCIAL_MEDIA.map((social, idx) => (
                                        <SocialCard key={idx} social={social} delay={idx * 0.1} />
                                    ))}
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white p-3 md:p-4 rounded-[2rem] md:rounded-[3rem] border border-surface-100 shadow-premium-lg"
                            >
                                <div className="rounded-[2rem] md:rounded-[2.5rem] overflow-hidden h-[300px] md:h-[400px] relative border border-surface-50">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.170258079815!2d106.84883492584104!3d-6.9457494681995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68370000000001%3A0x6737000000000000!2sPesantren%20Al-Andalus%20Ulul%20Albaab!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Lokasi Pesantren Al-Andalus Ulul Albaab"
                                        className="grayscale hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 md:px-6 md:py-3 rounded-lg md:rounded-2xl shadow-md border border-brand-blue-100 flex items-center gap-1.5 md:gap-3 z-10">
                                        <MapIcon className="w-3.5 h-3.5 md:w-5 md:h-5 text-brand-blue-600" />
                                        <span className="text-[10px] md:text-sm font-black text-ink-950 uppercase tracking-widest">Buka di Maps</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 4. Final CTA */}
            <section className="py-16 md:py-24 lg:py-32 bg-white">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-brand-blue-950 rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-8 md:p-16 lg:p-24 text-center text-white relative overflow-hidden shadow-premium-2xl"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

                        <div className="relative z-10">
                            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-black mb-4 sm:mb-6 md:mb-8 text-white leading-tight">
                                Mari Bergabung <br /> <span className="text-brand-yellow-100">Menjadi Keluarga</span>
                            </h2>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-brand-blue-50 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 font-medium px-2">
                                Kami menunggu kehadiran Anda di Pesantren Al-Andalus Ulul Albaab. Pendaftaran santri baru telah dibuka!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center px-4">
                                <Link href="/ppdb">
                                    <button className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 md:py-5 rounded-pill bg-white text-brand-blue-900 font-black text-sm sm:text-base md:text-lg hover:bg-brand-yellow-100 shadow-md transition-all min-h-[48px] sm:min-h-[52px]">
                                        Daftar PPDB Baru
                                    </button>
                                </Link>
                                <a href="https://wa.me/6281285300800" className="w-full sm:w-auto">
                                    <button className="w-full flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3.5 sm:py-4 md:py-5 rounded-pill bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-all text-sm sm:text-base md:text-lg min-h-[48px] sm:min-h-[52px]">
                                        Chat via WhatsApp
                                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </a>
                            </div>

                            {/* Trust microcopy */}
                            <p className="mt-6 text-[11px] text-brand-blue-300 font-bold uppercase tracking-widest">
                                ✦ Pendaftaran Gratis&nbsp;&nbsp;•&nbsp;&nbsp;Proses Mudah&nbsp;&nbsp;•&nbsp;&nbsp;Langsung Konfirmasi
                            </p>

                            {/* Legalitas badges */}
                            <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6">
                                <div className="flex items-center gap-2 text-brand-blue-100/70">
                                    <ShieldCheck className="w-4 h-4 text-green-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Terakreditasi BAN-PDM</span>
                                </div>
                                <div className="flex items-center gap-2 text-brand-blue-100/70">
                                    <Award className="w-4 h-4 text-brand-yellow-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Sejak 1995 • 30 Tahun Melayani</span>
                                </div>
                                <div className="flex items-center gap-2 text-brand-blue-100/70">
                                    <GraduationCap className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Resmi Kemendikdasmen</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </Container>
            </section>
        </main >
    );
}
