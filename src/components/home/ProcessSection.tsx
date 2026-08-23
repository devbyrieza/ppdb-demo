"use client";

import Link from "next/link";
import {
  UserPlus,
  FileText,
  CreditCard,
  ClipboardCheck,
  GraduationCap,
  CheckCircle2,
  BellRing,
  ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

// ─── Data ────────────────────────────────────────────
const STEPS = [
  {
    icon: UserPlus,
    title: "Buat Akun",
    description:
      "Daftarkan data diri awal dan buat akun pendaftaran santri baru.",
    accent: "primary" as const },
  {
    icon: CreditCard,
    title: "Pembayaran",
    description:
      "Bayar biaya daftar & unggah bukti transfer ke dashboard online.",
    accent: "secondary" as const },
  {
    icon: FileText,
    title: "Lengkapi Berkas",
    description:
      "Isi form biodata lengkap dan unggah dokumen persyaratan digital.",
    accent: "primary" as const },
  {
    icon: ClipboardCheck,
    title: "Seleksi",
    description:
      "Hadiri dan ikuti ujian seleksi Al-Qur'an, wawancara, dan tes tulis.",
    accent: "secondary" as const },
  {
    icon: BellRing,
    title: "Pengumuman",
    description: "Lihat hasil kelulusan seleksi melalui dashboard & WhatsApp.",
    accent: "primary" as const },
  {
    icon: GraduationCap,
    title: "Daftar Ulang",
    description:
      "Lengkapi administrasi akhir setelah dinyatakan lolos seleksi.",
    accent: "primary" as const },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

const ACCENT_MAP = {
  primary: {
    icon: "bg-primary-50 text-primary-600 border-primary-100 group-hover:bg-primary-100 group-hover:border-primary-200",
    badge: "bg-primary-600 text-white",
    title: "group-hover:text-primary-700" },
  secondary: {
    icon: "bg-secondary-50 text-secondary-700 border-secondary-100 group-hover:bg-secondary-100 group-hover:border-secondary-200",
    badge: "bg-secondary-600 text-white",
    title: "group-hover:text-secondary-700" } };

// ─── Step Card ────────────────────────────────────────
function StepCard({
  icon: Icon,
  title,
  description,
  accent,
  index,
  isLast }: (typeof STEPS)[number] & { index: number; isLast: boolean }) {
  const colors = ACCENT_MAP[accent];

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ delay: index * 0.08, duration: 0.55, ease: EASE }}
        className="group relative z-10 flex flex-col items-center text-center w-full"
      >
        {/* Step number badge */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-black mb-4 shadow-xs ${colors.badge}`}
        >
          {index + 1}
        </div>

        {/* Icon box */}
        <div
          className={[
            "w-16 h-16 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center mb-5",
            "transition-all duration-400 group-hover:scale-105 group-hover:shadow-premium-sm shadow-xs",
            colors.icon,
          ].join(" ")}
        >
          <Icon className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.6} />
        </div>

        <h4
          className={`font-bold text-[0.9375rem] text-ink-900 mb-2 tracking-tight transition-colors duration-200 ${colors.title}`}
        >
          {title}
        </h4>
        <p className="text-[0.75rem] text-ink-500 font-[450] leading-relaxed max-w-[160px]">
          {description}
        </p>
      </motion.div>

      {/* Connector line desktop */}
      {!isLast && (
        <div className="hidden lg:block absolute top-[28px] left-[calc(50%+44px)] right-[calc(-50%+44px)] h-px bg-gradient-to-r from-primary-100 to-secondary-200 z-0" />
      )}

      {/* Mobile vertical connector */}
      {!isLast && (
        <div className="lg:hidden mt-6 mb-2 w-px h-8 bg-gradient-to-b from-primary-100 to-transparent rounded-full" />
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────
export default function ProcessSection() {
  return (
    <section
      id="alur"
      className="section-alt relative border-y border-secondary-100/60 overflow-hidden"
    >
      <div
        className="absolute -top-32 right-0 translate-x-1/3 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(229,224,211,0.4) 0%, transparent 65%)" }}
      />
      <div
        className="absolute -bottom-24 left-0 -translate-x-1/3 w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(176,220,220,0.3) 0%, transparent 65%)" }}
      />

      <Container className="relative z-10">
        <div className="text-center mb-14 md:mb-18 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-secondary-200 text-primary-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs"
          >
            <CheckCircle2 className="w-3 h-3 shrink-0" strokeWidth={2} />
            <span>Prosedur PPDB</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
            className="section-title mb-4"
          >
            Alur <span className="text-gradient-primary">Pendaftaran</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
            className="section-subtitle max-w-xl mx-auto"
          >
            Ikuti langkah-langkah mudah berikut untuk menjadi bagian dari
            keluarga besar Pesantren kami.
          </motion.p>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-6 gap-1 md:gap-0 max-w-5xl mx-auto">
          {STEPS.map((step, idx) => (
            <StepCard
              key={idx}
              {...step}
              index={idx}
              isLast={idx === STEPS.length - 1}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
          className="mt-14 md:mt-18 flex justify-center"
        >
          <Link href="/ppdb">
            <button className="btn-primary inline-flex items-center gap-2.5 px-10 group/btn">
              <span>Daftar Sebagai Santri</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                strokeWidth={2}
              />
            </button>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
