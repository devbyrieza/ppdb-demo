"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";
import {
  Calendar,
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  ShieldCheck } from "lucide-react";
import { BRANDING } from "@/config/branding";
import InfiniteMarquee from "@/components/ui/InfiniteMarquee";


// ─── Types ───────────────────────────────────────────
type StatColor = "primary" | "secondary";

interface Stat {
  id: string;
  label: string;
  value: number;
  icon: React.ElementType;
  color: StatColor;
  suffix: string;
  sublabel: string;
  description: string;
}

// ─── Data ────────────────────────────────────────────
const STATS: Stat[] = [
  {
    id: "batch",
    label: "Angkatan Pertama",
    value: 1,
    icon: Calendar,
    color: "primary",
    suffix: "",
    sublabel: "Tahun Ajaran 2027/2028",
    description: "Momen bersejarah pembukaan" },
  {
    id: "quality",
    label: "Kurikulum Terintegrasi",
    value: 100,
    icon: Award,
    color: "secondary",
    suffix: "%",
    sublabel: "Tahfidz, Syar'i, Akademik, Leadership & Entrepreneurship",
    description: "Lima pilar pendidikan utama" },
  {
    id: "levels",
    label: "Jenjang Pendidikan",
    value: 2,
    icon: GraduationCap,
    color: "primary",
    suffix: "",
    sublabel: "MTs · IL",
    description: "Pendidikan menengah lengkap" },
  {
    id: "quota",
    label: "Kuota Terbatas",
    value: 25,
    icon: Users,
    color: "secondary",
    suffix: "",
    sublabel: "Per Jenjang (Eksklusif)",
    description: "Seleksi ketat, kualitas terjaga" },
];

// ─── Animated Counter ────────────────────────────────
function AnimatedCounter({
  value,
  trigger,
  delay = 0 }: {
  value: number;
  trigger: boolean;
  delay?: number;
}) {
  const motionVal = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const controls = animate(motionVal, value, {
      duration: 1.6,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.floor(v));
      } });
    return controls.stop;
  }, [trigger, value, delay, motionVal]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
}

// ─── Stat Card ───────────────────────────────────────
function StatCard({
  stat,
  index,
  trigger }: {
  stat: Stat;
  index: number;
  trigger: boolean;
}) {
  const Icon = stat.icon;
  const isPrimary = stat.color === "primary";
  const isSecondary = stat.color === "secondary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-full hover-lift-sm"
    >
      <div className="glass-panel relative flex flex-col items-center text-center px-6 py-8 md:px-8 md:py-10 rounded-2xl overflow-hidden h-full">
        {/* Hover radial bg */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: isPrimary
              ? "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(13,110,110,0.04) 0%, transparent 70%)"
              : "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(190,174,119,0.06) 0%, transparent 70%)" }}
        />

        {/* Icon */}
        <div
          className={[
            "relative mb-6 w-13 h-13 md:w-14 md:h-14 flex items-center justify-center rounded-xl shadow-xs",
            "transition-all duration-500 group-hover:scale-110",
            isPrimary ? "bg-primary-50 text-primary-700 group-hover:bg-primary-100" : "",
            isSecondary ? "bg-secondary-100 text-secondary-700 group-hover:bg-secondary-200" : "",
          ].join(" ")}
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.75} />
          <div
            className={[
              "absolute inset-0 rounded-xl ring-0 transition-all duration-500",
              isPrimary ? "group-hover:ring-2 group-hover:ring-primary-200" : "",
              isSecondary ? "group-hover:ring-2 group-hover:ring-secondary-300" : "",
            ].join(" ")}
          />
        </div>

        {/* Number */}
        <div className="flex items-baseline justify-center gap-0.5 mb-1">
          <span
            className={[
              "text-[2.625rem] md:text-[3.25rem] font-black leading-none tracking-[-0.04em]",
              isPrimary ? "text-primary-700" : "",
              isSecondary ? "text-secondary-700" : "",
            ].join(" ")}
          >
            <AnimatedCounter
              value={stat.value}
              trigger={trigger}
              delay={0.5 + index * 0.1}
            />
          </span>
          {stat.suffix && (
            <span
              className={[
                "text-2xl md:text-3xl font-black leading-none tracking-[-0.03em]",
                isPrimary ? "text-primary-500" : "",
                isSecondary ? "text-secondary-500" : "",
              ].join(" ")}
            >
              {stat.suffix}
            </span>
          )}
        </div>

        {/* Label */}
        <p className="text-[0.65rem] md:text-[0.7rem] font-bold text-ink-500 uppercase tracking-[0.12em] mt-2">
          {stat.label}
        </p>

        {/* Sublabel */}
        <p
          className={[
            "text-[0.6rem] md:text-[0.65rem] font-semibold tracking-wide mt-0.5",
            isPrimary ? "text-primary-500" : "",
            isSecondary ? "text-secondary-500" : "",
          ].join(" ")}
        >
          {stat.sublabel}
        </p>

        {/* Description — always visible on mobile, hover reveal on desktop */}
        <p className="text-[0.65rem] md:text-[0.7rem] text-ink-400 mt-2.5 md:mt-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-400 leading-relaxed max-w-[140px]">
          {stat.description}
        </p>

        {/* Spacer to push accent line to bottom */}
        <div className="flex-grow" />

        {/* Bottom accent line */}
        <div
          className={[
            "mt-5 h-[2px] w-6 rounded-full transition-all duration-500 group-hover:w-10",
            isPrimary ? "bg-primary-100 group-hover:bg-primary-500" : "",
            isSecondary ? "bg-secondary-200 group-hover:bg-secondary-500" : "",
          ].join(" ")}
        />
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────
export default function StatsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 bg-white border-b border-surface-200 overflow-hidden"
    >
      {/* CiroAI Background glows */}
      <div className="glow-blob glow-blob-primary w-[600px] h-[600px] -top-[25%] right-0 translate-x-[20%]" aria-hidden="true" />
      <div className="glow-blob glow-blob-gold w-[500px] h-[500px] -bottom-[25%] left-0 -translate-x-[20%]" aria-hidden="true" />

      <Container className="relative z-10">
        <div className="max-w-5xl mx-auto space-y-12 md:space-y-14">
          {/* Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {STATS.map((stat, i) => (
              <StatCard key={stat.id} stat={stat} index={i} trigger={inView} />
            ))}
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap justify-center items-center gap-2.5 md:gap-3"
          >
            {/* CiroAI-style badges */}
            {/* Badge 1 — Pulse */}
            <div className="section-label section-label-primary hover:bg-primary-50/50 cursor-default">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
              </span>
              <span>Pendaftaran Dibuka</span>
            </div>

            {/* Badge 2 — Akreditasi */}
            <div className="section-label section-label-primary border-secondary-200 text-ink-700 bg-secondary-50/50 hover:bg-secondary-100/50 cursor-default">
              <ShieldCheck className="w-3 h-3 shrink-0 text-secondary-600" strokeWidth={2} />
              <span>Terakreditasi A — BAN-PDM</span>
            </div>

            {/* Badge 3 — School Network */}
            <div className="section-label section-label-primary hover:bg-primary-50/50 cursor-default">
              <TrendingUp className="w-3 h-3 shrink-0 text-primary-600" strokeWidth={2} />
              <span>{BRANDING.schoolNetwork}</span>
            </div>
          </motion.div>

          {/* ── Jaringan Kemitraan Marquee (cekat.ai-inspired social proof strip) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="pt-4"
          >
            <div className="divider-editorial mb-5">
              <span>Jaringan Kemitraan Global</span>
            </div>
            <InfiniteMarquee
              items={[
                { text: "Universitas Islam Madinah, Arab Saudi" },
                { text: "Universitas Al-Azhar, Kairo" },
                { text: "LIPIA Jakarta" },
                { text: "Universitas Gadjah Mada (UGM)" },
                { text: "Universitas Jordan, Yordania" },
                { text: "Universitas Yarmouk, Yordania" },
                { text: "Universitas Mu'tah, Yordania" },
                { text: "Universitas Istanbul, Turki" },
                { text: "LPMQ Kementerian Agama RI" },
                { text: "Universitas Yalova, Turki" },
              ]}
              speed="normal"
              variant="transparent"
              separator="·"
              itemClassName="text-ink-400 text-[0.75rem] font-semibold"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

