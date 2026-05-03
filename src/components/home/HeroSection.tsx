// src/components/home/HeroSection.tsx — alandalus-template-demo
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  GraduationCap,
  Sparkles,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BRANDING } from "@/config/branding";

// ─── Animation variants ───
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const fadeIn = {
  hidden: {
    opacity: 0,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.08,
  });

  const animate = inView ? "visible" : "hidden";

  return (
    <section
      ref={ref}
      aria-label="Hero — Beranda PPDB Modern"
      className="relative min-h-[96vh] flex items-center pt-24 pb-20 md:pt-28 lg:pt-32 lg:pb-28 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, var(--color-surface-50) 0%, var(--color-white) 55%, var(--color-army-50) 100%)",
      }}
    >
      {/* ── Atmospheric Background ── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Blob army — primary */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[55%] h-[65%] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(ellipse, var(--color-army-300) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        {/* Blob khaki — secondary, hangat */}
        <div
          className="absolute top-[10%] -right-[8%] w-[40%] h-[50%] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(ellipse, var(--color-khaki-300) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute bottom-[-5%] left-[20%] w-[45%] h-[40%] rounded-full opacity-18"
          style={{
            background:
              "radial-gradient(ellipse, var(--color-army-200) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Subtle grid pattern — army-tinted */}
        <div
          className="absolute inset-0 opacity-[0.020]"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-army-500) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-army-500) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">

          {/* ════════════════════════════════════
              CONTENT SIDE
          ════════════════════════════════════ */}
          <div className="flex flex-col gap-7 lg:gap-9 text-center lg:text-left">

            {/* — Opening Badge — */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.1 }}
              className="flex justify-center lg:justify-start"
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{
                  background: "var(--color-white)",
                  border: "1px solid var(--color-army-200)",
                  color: "var(--color-army-700)",
                  boxShadow:
                    "var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                <Sparkles
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "var(--color-khaki-500)" }}
                  aria-hidden="true"
                />
                <span>Premium Quality • Managed by Andalus Demo System</span>
              </span>
            </motion.div>

            {/* — Headline — */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <h1
                className="leading-[1.06] tracking-[-0.03em] mx-auto lg:mx-0 max-w-2xl lg:max-w-none font-black text-balance"
                style={{ color: "var(--color-army-950)" }}
              >
                <span className="block">Mencetak Generasi</span>
                <span
                  className="block mt-1"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-army-800) 0%, var(--color-khaki-500) 50%, var(--color-army-950) 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    paddingBottom: "0.15em",
                  }}
                >
                  Unggul, Cerdas,{" "}
                  <br className="hidden xl:block" />
                  dan Berintegritas
                </span>
              </h1>
            </motion.div>

            {/* — Body Copy — */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.3 }}
              className="text-base lg:text-[1.075rem] leading-[1.85] max-w-[38rem] mx-auto lg:mx-0 text-center lg:text-left text-pretty"
              style={{
                color: "var(--color-ink-600)",
                fontWeight: 450,
              }}
            >
              Bukan sekadar sistem pendaftaran — sebuah pengalaman digital
              berbasis{" "}
              <strong
                className="font-bold"
                style={{ color: "var(--color-army-800)" }}
              >
                Kecepatan, Kemudahan, Keamanan, dan Estetika
              </strong>{" "}
              untuk institusi pendidikan modern.
            </motion.p>

            {/* — Tagline Divider — */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.38 }}
              className="flex items-center gap-3 justify-center lg:justify-start"
            >
              <div
                className="h-px flex-1 max-w-[3rem]"
                style={{ background: "var(--color-army-200)" }}
              />
              <p
                className="text-sm font-semibold italic"
                style={{ color: "var(--color-army-700)" }}
              >
                "Pendidikan Berkualitas, Diperkuat Sistem{" "}
                {BRANDING.schoolName.includes("PPDB Modern")
                  ? "PPDB Modern"
                  : BRANDING.schoolShortName}
                "
              </p>
              <div
                className="h-px flex-1 max-w-[3rem]"
                style={{ background: "var(--color-army-200)" }}
              />
            </motion.div>

            {/* — CTA Group — */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.45 }}
              className="flex flex-col gap-4 items-center lg:items-start"
            >
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/ppdb" className="w-full sm:w-auto">
                  <button
                    className="btn-primary w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-[1.125rem] min-h-[56px] text-[0.9375rem]"
                    style={{ boxShadow: "var(--shadow-army-lg)" }}
                  >
                    Daftar PPDB Sekarang
                    <ArrowRight className="w-4 h-4 ml-0.5" aria-hidden="true" />
                  </button>
                </Link>
                <Link href="/program" className="w-full sm:w-auto">
                  <button className="btn-secondary w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-[1.125rem] min-h-[56px] text-[0.9375rem]">
                    Lihat Program Studi
                  </button>
                </Link>
              </div>

              {/* Trust microcopy */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex -space-x-2.5">
                  {[
                    { bg: "var(--color-army-200)" },
                    { bg: "var(--color-khaki-300)" },
                    { bg: "var(--color-army-300)" },
                    { bg: "var(--color-khaki-200)" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 flex-shrink-0"
                      style={{
                        background: item.bg,
                        borderColor: "var(--color-white)",
                        boxShadow: "var(--shadow-xs)",
                      }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p
                  className="text-[11px] font-semibold leading-tight"
                  style={{ color: "var(--color-ink-500)" }}
                >
                  <span
                    className="font-bold uppercase tracking-wide"
                    style={{ color: "var(--color-army-700)" }}
                  >
                    Angkatan Pertama
                  </span>
                  {" • "}Managed by PPDB Modern IIBS
                </p>
              </div>

              {/* 3 trust points */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start mt-1">
                {[
                  "MTs & SMA tersedia",
                  "Proses cepat & transparan",
                  "Jaringan Al-Andalus",
                ].map((point) => (
                  <span
                    key={point}
                    className="flex items-center gap-1.5 text-[11px] font-semibold"
                    style={{ color: "var(--color-ink-500)" }}
                  >
                    <CheckCircle2
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: "var(--color-army-500)" }}
                      aria-hidden="true"
                    />
                    {point}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ════════════════════════════════════
              VISUAL SIDE
          ════════════════════════════════════ */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate={animate}
            transition={{ delay: shouldReduceMotion ? 0 : 0.25 }}
            className="relative w-full mt-8 lg:mt-0"
          >
            {/* ─ Main Image ─ */}
            <div
              className="relative z-10 overflow-hidden"
              style={{
                borderRadius: "2rem",
                border: "10px solid var(--color-white)",
                boxShadow:
                  "var(--shadow-premium-2xl), 0 0 0 1px var(--color-army-100)",
              }}
            >
              <Image
                src="/images/hero.webp"
                alt={`${BRANDING.schoolName} — Sistem PPDB Modern`}
                width={800}
                height={600}
                className="w-full h-auto object-cover aspect-[4/3]"
                style={{
                  transition:
                    "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  if (!shouldReduceMotion)
                    e.currentTarget.style.transform = "scale(1.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
                priority
              />
              {/* Vignette overlay — army gelap */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10, 22, 16, 0.50) 0%, transparent 55%)",
                }}
                aria-hidden="true"
              />
            </div>

            {/* ─ Floating Card: Tersedia ─ */}
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-4 lg:-top-6 -right-2 lg:-right-6 z-20"
              style={{ transformOrigin: "right center" }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(20px) saturate(1.8)",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  boxShadow: "var(--shadow-premium-md)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-army-50)" }}
                >
                  <GraduationCap
                    className="w-5 h-5"
                    style={{ color: "var(--color-army-600)" }}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.08em] leading-none mb-1"
                    style={{ color: "var(--color-ink-400)" }}
                  >
                    Tersedia
                  </p>
                  <p
                    className="text-sm font-black leading-tight"
                    style={{ color: "var(--color-army-900)" }}
                  >
                    MTs &amp; SMA
                  </p>
                  <p
                    className="text-[10px] font-semibold mt-0.5"
                    style={{ color: "var(--color-ink-500)" }}
                  >
                    Kuota terbatas
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ─ Floating Card: Jaringan Elit ─ */}
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, 10, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-5 lg:-bottom-8 -left-2 lg:-left-6 z-20"
              style={{ transformOrigin: "left center" }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(20px) saturate(1.8)",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  boxShadow: "var(--shadow-premium-md)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-army-50)" }}
                >
                  <Globe
                    className="w-5 h-5"
                    style={{ color: "var(--color-army-600)" }}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-black leading-tight"
                    style={{ color: "var(--color-army-900)" }}
                  >
                    Jaringan Elit
                  </p>
                  <p
                    className="text-[10px] font-semibold mt-0.5"
                    style={{ color: "var(--color-ink-500)" }}
                  >
                    Andalus Demo
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ─ Info Badge (rotasi) — khaki accent ─ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
              animate={
                inView
                  ? { opacity: 1, scale: 1, rotate: -6 }
                  : { opacity: 0, scale: 0.5, rotate: -25 }
              }
              transition={{
                duration: 0.85,
                delay: shouldReduceMotion ? 0 : 0.9,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              whileHover={
                shouldReduceMotion ? {} : { rotate: 0, scale: 1.05 }
              }
              className="absolute -bottom-3 -right-3 lg:bottom-10 lg:-right-10 z-30 cursor-default"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-khaki-300) 0%, var(--color-khaki-500) 100%)",
                padding: "1rem 1.125rem",
                borderRadius: "1.5rem",
                border: "4px solid var(--color-white)",
                boxShadow: "var(--shadow-premium-lg)",
                transition:
                  "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="text-center min-w-[80px]">
                <p
                  className="text-[9px] font-black uppercase tracking-[0.1em] leading-none mb-1.5"
                  style={{ color: "var(--color-army-950)" }}
                >
                  Info Penting
                </p>
                <p
                  className="text-base font-black leading-tight"
                  style={{ color: "var(--color-army-900)" }}
                >
                  Pendaftaran
                  <br />
                  Dibuka
                </p>
                <div
                  className="mt-2 py-1 px-2.5 rounded-full"
                  style={{ background: "rgba(10, 22, 16, 0.12)" }}
                >
                  <p
                    className="text-[9px] font-bold"
                    style={{ color: "var(--color-army-900)" }}
                  >
                    Kuota Terbatas
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ─ Decorative blobs behind image ─ */}
            <div
              className="absolute -z-10 -bottom-14 -right-14 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse, var(--color-army-400) 0%, transparent 70%)",
                filter: "blur(40px)",
                opacity: 0.15,
              }}
              aria-hidden="true"
            />
            <div
              className="absolute -z-10 -top-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse, var(--color-khaki-400) 0%, transparent 70%)",
                filter: "blur(36px)",
                opacity: 0.20,
              }}
              aria-hidden="true"
            />
          </motion.div>

        </div>
      </Container>
    </section>
  );
}