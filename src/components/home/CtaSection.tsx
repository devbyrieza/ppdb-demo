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
          className="glass-panel-dark rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] p-8 sm:p-12 md:p-16 lg:p-20 relative overflow-hidden text-center shine-top"
          style={{ background: "linear-gradient(135deg, var(--color-teal-800) 0%, var(--color-teal-950) 100%)" }}
        >
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.08] mix-blend-overlay pointer-events-none" />
          <div className="hidden sm:block glow-blob glow-blob-teal w-[600px] h-[600px] -top-32 -right-32 opacity-30" />
          <div className="hidden sm:block glow-blob glow-blob-gold w-[500px] h-[500px] -bottom-32 -left-32 opacity-20" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <div className="section-label section-label-white mb-6">
              <span className="text-sand-300">✦</span> Pendaftaran Dibuka
            </div>

            <h3 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] font-display font-black mb-5 tracking-tight leading-[1.1]">
              <span className="gradient-text-white">Mulai Langkah Pertama</span> <br /> 
              <span className="text-white">Menuju Generasi Unggul</span>
            </h3>

            <p className="text-[0.9375rem] md:text-[1.0625rem] text-sand-50/90 mb-10 leading-relaxed font-[450] text-center max-w-2xl mx-auto">
              Telah dibuka Pendaftaran Santri Baru (PPDB) Tahun Ajaran
              2026/2027. Kuota sangat terbatas untuk menjaga kualitas pendidikan
              secara optimal.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 max-w-xl mx-auto w-full">
              <Link href="/ppdb" className="w-full sm:w-auto flex-1 hover-lift">
                <button className="w-full px-8 py-4 rounded-full bg-sand-300 text-teal-950 font-bold hover:bg-sand-400 transition-all duration-300 text-[0.9375rem] flex items-center justify-center gap-2 glow-ring-teal">
                  Daftar Sekarang
                </button>
              </Link>
              <Link href="/kontak" className="w-full sm:w-auto flex-1 hover-lift">
                <button className="w-full px-8 py-4 rounded-full text-white font-bold border border-white/20 hover:bg-white/10 transition-all duration-300 text-[0.9375rem] flex items-center justify-center gap-2 glass-panel-dark group/btn">
                  Konsultasi WhatsApp
                  <Send className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* ── Legalitas Badges ── */}
            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 w-full max-w-2xl">
              <div className="flex items-center gap-2 text-sand-50/70">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em]">
                  Terakreditasi A — BAN-PDM
                </span>
              </div>
              <div className="flex items-center gap-2 text-sand-50/70">
                <BookOpen className="w-4 h-4 text-sand-400" />
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em]">
                  Kurikulum Terpadu
                </span>
              </div>
              <div className="flex items-center gap-2 text-sand-50/70">
                <Award className="w-4 h-4 text-teal-300" />
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.1em]">
                  {BRANDING.schoolNetwork}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
