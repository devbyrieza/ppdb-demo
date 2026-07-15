// src/components/home/HeroSection.tsx — alfath-template-demo
// FIXED: reduced motion badge, tablet breakpoint, touch hover, explicit font sizing
"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  GraduationCap,
  Globe,
  CheckCircle2,
  Gift,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BRANDING } from "@/config/branding";

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
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
  hidden: { opacity: 0, scale: 0.97 },
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
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setSession(data.session);
          }
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };
    fetchSession();
  }, []);

  const shouldReduceMotion = useReducedMotion();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.08 });
  const animate = inView ? "visible" : "hidden";

  // FIX #4: Badge animate computed correctly — no scale jump when reduced motion is on
  const badgeAnimate = inView
    ? { opacity: 1, scale: 1, rotate: -6 }
    : { opacity: 0, scale: shouldReduceMotion ? 1 : 0.5, rotate: -25 };

  return (
    <section
      ref={ref}
      aria-label="Hero — Beranda Al Fath"
      className="relative min-h-[100vh] md:min-h-[90vh] lg:min-h-[85vh] flex items-center pt-24 pb-20 md:pt-28 lg:pt-24 lg:pb-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, var(--color-surface-50) 0%, var(--color-white) 55%, var(--color-primary-50) 100%)",
      }}
    >
      {/* CiroAI Atmospheric Background Blobs */}
      <div className="glow-blob glow-blob-primary w-[60%] h-[70%] -top-[20%] -left-[10%] opacity-20" aria-hidden="true" />
      <div className="glow-blob glow-blob-gold w-[50%] h-[60%] top-[10%] -right-[10%] opacity-15" aria-hidden="true" />
      <div className="glow-blob glow-blob-primary w-[40%] h-[40%] bottom-[-10%] left-[20%] opacity-10" aria-hidden="true" />
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--color-primary-500) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-500) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* CONTENT SIDE */}
          <div className="flex flex-col gap-7 lg:gap-9 text-center lg:text-left">
            {/* Opening Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.1 }}
              className="flex justify-center lg:justify-start"
            >
              <span className="section-label section-label-primary">
                Selamat Datang di {BRANDING.schoolShortName}
              </span>
            </motion.div>

            {/* Headline — FIX #1: explicit clamp for 360px safety */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <h1
                className="leading-[1.06] tracking-[-0.03em] mx-auto lg:mx-0 max-w-2xl lg:max-w-none font-black text-balance"
                style={{
                  fontSize: "clamp(2.5rem, 5vw + 1rem, 5rem)",
                }}
              >
                <span className="block text-ink-950">
                  Kaderisasi Ummat
                </span>
                <span className="block mt-1 text-[var(--color-primary-700)]">
                  <span className="bg-gradient-to-r from-[var(--color-primary-700)] to-[var(--color-secondary-600)] text-transparent bg-clip-text">
                    Unggul, Cerdas, 
                  </span>
                  <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-[var(--color-primary-700)] to-[var(--color-secondary-600)] text-transparent bg-clip-text">
                    dan Berintegritas
                  </span>
                </span>
              </h1>
            </motion.div>

            {/* Body Copy */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.3 }}
              className="text-base lg:text-[1.075rem] leading-[1.85] max-w-[42rem] mx-auto lg:mx-0 text-center lg:text-left text-pretty"
              style={{ color: "var(--color-ink-600)", fontWeight: 450 }}
            >
              Bukan sekadar tempat belajar — sebuah sistem pembentukan karakter
              yang{" "}
              <strong
                className="font-bold"
                style={{ color: "var(--color-primary-700)" }}
              >
                mengedepankan keteladanan para pendidik serta mendidik tanpa kekerasan dan luka pengasuhan
              </strong>, memadukan Intensitas Tahfidz Al-Qur'an, Ilmu Syar'i, Akademik, Leadership, dan Enterpreneurship.
            </motion.p>

            {/* Tagline Divider */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.38 }}
              className="flex items-center gap-3 justify-center lg:justify-start"
            >
              <div
                className="h-px flex-1 max-w-[3rem]"
                style={{ background: "var(--color-primary-200)" }}
              />
              <p
                className="text-sm font-semibold italic"
                style={{ color: "var(--color-primary-700)" }}
              >
                &ldquo;{BRANDING.schoolTagline}&rdquo;
              </p>
              <div
                className="h-px flex-1 max-w-[3rem]"
                style={{ background: "var(--color-primary-200)" }}
              />
            </motion.div>

            {/* CTA Group */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={animate}
              transition={{ delay: 0.45 }}
              className="flex flex-col gap-4 items-center lg:items-start"
            >
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {session ? (
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <button
                      className="btn-primary w-full sm:w-auto px-10 lg:px-12 py-4 lg:py-[1.125rem] min-h-[56px] text-[0.9375rem] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-98 transition-all relative overflow-hidden group font-bold"
                      style={{ boxShadow: "var(--shadow-primary-lg)" }}
                    >
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                      </span>
                      <span>Lanjutkan Ke Dashboard</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/ppdb" className="w-full sm:w-auto">
                      <button
                        className="btn-primary shine-hover w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-[1.125rem] min-h-[56px] text-[0.9375rem] flex items-center justify-center gap-2.5 group font-bold"
                        style={{ boxShadow: "var(--shadow-primary-lg)" }}
                      >
                        Daftar PPDB Sekarang
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </Link>
                    <Link href="/program" className="w-full sm:w-auto">
                      <button className="btn-secondary w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-[1.125rem] min-h-[56px] text-[0.9375rem] flex items-center justify-center gap-2 group">
                        Lihat Program Kami
                        <ArrowRight className="w-4 h-4 opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
                      </button>
                    </Link>
                  </>
                )}

              </div>

              <div className="flex items-center gap-3 mt-1">
                <div className="flex -space-x-2.5">
                  {[
                    { bg: "var(--color-primary-200)" },
                    { bg: "var(--color-secondary-300)" },
                    { bg: "var(--color-primary-300)" },
                    { bg: "var(--color-secondary-200)" },
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
                    style={{ color: "var(--color-primary-700)" }}
                  >
                    Angkatan Pertama
                  </span>
                  {" • "}Pesantren Al Fath
                </p>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start mt-1">
                {[
                  "MTs & IL tersedia",
                  "Proses PPDB Cepat & Transparan",
                  "Sistem Boarding (Asrama)",
                ].map((point) => (
                  <span
                    key={point}
                    className="flex items-center gap-1.5 text-[11px] font-semibold"
                    style={{ color: "var(--color-ink-500)" }}
                  >
                    <CheckCircle2
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: "var(--color-primary-500)" }}
                      aria-hidden="true"
                    />
                    {point}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* VISUAL SIDE — FIX #2: overflow visible + md breakpoints */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate={animate}
            transition={{ delay: shouldReduceMotion ? 0 : 0.25 }}
            className="relative w-full mt-8 lg:-mt-8 xl:-mt-12 lg:max-w-[500px] xl:max-w-[540px] lg:ml-auto"
            style={{ overflow: "visible" }}
          >
            {/* Main Image */}
            <div
              className="relative z-10"
              style={{
                borderRadius: "2rem",
                border: "10px solid var(--color-white)",
                boxShadow:
                  "var(--shadow-premium-2xl), 0 0 0 1px var(--color-primary-100)",
                overflow: "hidden",
              }}
            >
              <Image
                src="/images/hero.jpg"
                alt={`${BRANDING.schoolName} — Pesantren Al Fath`}
                width={800}
                height={600}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                className="w-full h-auto object-cover aspect-[4/3]"
                style={{
                  transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={(e) => {
                  if (!shouldReduceMotion)
                    e.currentTarget.style.transform = "scale(1.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10, 22, 16, 0.50) 0%, transparent 55%)",
                }}
                aria-hidden="true"
              />
            </div>

            {/* Floating Card: Beasiswa — NEW highlight */}
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -12, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-[-2%] -left-6 md:top-[5%] md:-left-20 lg:-left-28 z-20 scale-[0.8] md:scale-100"
              style={{ transformOrigin: "left center" }}
            >
              <div className="glass-panel flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-premium-lg border-amber-100">
                <div className="icon-box w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wider mb-0.5 text-amber-600">Beasiswa</p>
                  <p className="text-xs md:text-sm font-black leading-tight text-[var(--color-primary-900)]">
                    Dhuafa Berprestasi
                  </p>
                  <p className="text-[9px] md:text-[10px] font-semibold mt-0.5 text-[var(--color-ink-500)]">
                    Tersedia 10 Kuota
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Card: Tersedia — FIX #2 md breakpoint */}
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-6 md:-top-5 lg:-top-6 md:-right-4 lg:-right-6 z-20 scale-[0.8] md:scale-100"
              style={{ transformOrigin: "right center" }}
            >
              <div className="glass-panel flex items-center gap-3 px-4 py-3 rounded-2xl">
                <div className="icon-box icon-box-primary w-11 h-11 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="stat-label mb-1">Tersedia</p>
                  <p className="text-sm font-black leading-tight text-[var(--color-primary-900)]">
                    MTs &amp; IL
                  </p>
                  <p className="text-[10px] font-semibold mt-0.5 text-[var(--color-ink-500)]">
                    Kuota terbatas
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Card: Jaringan Global — FIX #2 md breakpoint */}
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, 10, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-8 -left-6 md:-bottom-6 lg:-bottom-8 md:-left-4 lg:-left-6 z-20 scale-[0.8] md:scale-100"
              style={{ transformOrigin: "left center" }}
            >
              <div className="glass-panel flex items-center gap-3 px-4 py-3 rounded-2xl">
                <div className="icon-box icon-box-primary w-11 h-11 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black leading-tight text-[var(--color-primary-900)]">
                    Bekerjasama dengan
                  </p>
                  <p className="text-[10px] font-semibold mt-0.5 text-[var(--color-ink-500)]">
                    Universitas Islam Terkemuka di 3 Benua
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Info Badge — FIX #4: proper reduced motion, FIX #2: md position */}
            <motion.div
              initial={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.5,
                rotate: shouldReduceMotion ? -6 : -25,
              }}
              animate={badgeAnimate}
              transition={{
                duration: shouldReduceMotion ? 0.01 : 0.85,
                delay: shouldReduceMotion ? 0 : 0.9,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              whileHover={shouldReduceMotion ? {} : { rotate: 0, scale: 1.05 }}
              className="absolute -bottom-16 -right-4 md:bottom-6 md:-right-6 lg:bottom-10 lg:-right-10 z-30 cursor-default scale-[0.85] md:scale-100"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-secondary-300) 0%, var(--color-secondary-500) 100%)",
                padding: "0.85rem 1rem",
                borderRadius: "1.25rem",
                border: "4px solid var(--color-white)",
                boxShadow: "var(--shadow-premium-lg)",
                transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="text-center min-w-[80px]">
                <p
                  className="text-[9px] font-black uppercase tracking-[0.1em] leading-none mb-1.5"
                  style={{ color: "var(--color-primary-950)" }}
                >
                  Info Penting
                </p>
                <p
                  className="text-base font-black leading-tight"
                  style={{ color: "var(--color-primary-900)" }}
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
                    style={{ color: "var(--color-primary-900)" }}
                  >
                    Kuota Terbatas
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Decorative glows */}
            <div className="glow-blob glow-blob-primary w-64 h-64 -bottom-14 -right-14 opacity-15" aria-hidden="true" />
            <div className="glow-blob glow-blob-gold w-48 h-48 -top-10 -left-10 opacity-20" aria-hidden="true" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
