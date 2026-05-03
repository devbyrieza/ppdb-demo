"use client";

import Link from "next/link";
import {
  CheckCircle,
  Target,
  Rocket,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, Variants } from "framer-motion";
import { navigateToDetail } from "@/lib/navigation-scroll";

const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

const misi = [
  {
    label: "Unggul",
    text: "Membentuk pribadi yang memiliki standar kualitas tinggi dalam setiap aspek kehidupan.",
  },
  {
    label: "Cerdas",
    text: "Membentuk pribadi yang memiliki kedalaman ilmu, kritis dalam berpikir, dan bijak dalam bertindak.",
  },
  {
    label: "Berintegritas",
    text: "Membentuk pribadi yang jujur, amanah, dan teguh dalam memegang prinsip kebenaran.",
  },
  {
    label: "Dakwah",
    text: "Menanamkan jiwa dakwah melalui Bimbingan & Pengawasan Melekat tanpa kekerasan dan luka pengasuhan.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: 0.55,
      ease: SPRING,
    },
  },
};

export default function AboutSection() {
  const handleNavigateToDetail = () => {
    navigateToDetail("/tentang", "#about");
  };

  return (
    <section id="about" className="section-alt relative overflow-hidden">
      {/* Ambient background blobs — army & khaki sesuai branding template-demo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-army-100/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-khaki-100/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-army-50/30 blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ─────────────────────────────── */}
          <motion.div
            className="text-center mb-16 lg:mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-army-100 text-army-700 text-[11px] font-bold uppercase tracking-[0.12em] shadow-xs">
                <Sparkles className="w-3 h-3" />
                Profil Pesantren
              </span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="section-title mb-5 text-balance"
            >
              Mengedepankan{" "}
              <span className="text-gradient-army">
                Bimbingan &amp; Pengawasan Melekat
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="section-subtitle text-justify md:text-center"
            >
              <span className="font-semibold text-army-800">
                Bukan sekadar tempat belajar agama.
              </span>{" "}
              Sistem pembentukan karakter berbasis Lingkungan, Kebiasaan,
              Komunitas, dan Spiritualitas — untuk mencetak generasi yang
              memiliki pribadi Unggul, Cerdas, dan Berintegritas.
            </motion.p>
          </motion.div>

          {/* ── Visi & Misi Grid ─────────────────── */}
          <div className="grid gap-5 lg:gap-6 mb-16 lg:mb-20">

            {/* Visi — Full Width, Statement Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "tween", duration: 0.6, ease: SPRING }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-army-100 bg-white shadow-premium-sm group">
                {/* Card top accent bar — army ke khaki */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-army-700 via-army-500 to-khaki-400 rounded-t-2xl" />

                <div className="flex flex-col items-center text-center px-8 py-12 md:px-16 md:py-16">
                  {/* Icon */}
                  <div className="mb-7 w-14 h-14 rounded-xl bg-army-50 border border-army-100 flex items-center justify-center shadow-xs group-hover:shadow-sm transition-shadow duration-300">
                    <Target
                      className="w-6 h-6 text-army-700"
                      strokeWidth={1.75}
                    />
                  </div>

                  <span className="badge badge-army mb-5 text-[11px] tracking-wider uppercase">
                    Visi Utama
                  </span>

                  <blockquote className="max-w-2xl mx-auto">
                    <p className="font-display font-black text-2xl md:text-[2.15rem] leading-[1.2] tracking-tight text-army-900 italic">
                      &ldquo;Mencetak Generasi yang Memiliki Pribadi Unggul,
                      Cerdas, dan Berintegritas.&rdquo;
                    </p>
                  </blockquote>

                  <div className="mt-8 flex items-center gap-3">
                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-army-200" />
                    <div className="w-1.5 h-1.5 rounded-full bg-khaki-400" />
                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-army-200" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Misi — Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                type: "tween",
                duration: 0.6,
                ease: SPRING,
                delay: 0.08,
              }}
            >
              <div className="rounded-2xl border border-army-100 bg-white shadow-premium-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 px-8 py-7 md:px-10 border-b border-army-50">
                  <div className="w-11 h-11 rounded-xl bg-army-50 border border-army-100 flex items-center justify-center shrink-0">
                    <Rocket
                      className="w-5 h-5 text-army-600"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-army-900 tracking-tight leading-tight">
                      Misi Kami
                    </h3>
                    <p className="text-[13px] text-ink-400 mt-0.5">
                      Empat langkah strategis pembentukan karakter
                    </p>
                  </div>
                  <div className="ml-auto hidden sm:block">
                    <span className="badge badge-khaki text-[11px] tracking-wider uppercase">
                      Langkah Strategis
                    </span>
                  </div>
                </div>

                {/* Misi list */}
                <motion.ul
                  className="grid md:grid-cols-2 divide-y divide-army-50 md:divide-y-0 md:divide-x md:divide-army-50"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={containerVariants}
                >
                  {misi.map((item, i) => (
                    <motion.li
                      key={i}
                      variants={itemVariants}
                      className="flex gap-4 items-start p-6 md:p-8 group/item hover:bg-army-50/40 transition-colors duration-200"
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className="w-7 h-7 rounded-full bg-army-50 border border-army-100 flex items-center justify-center group-hover/item:bg-army-100 transition-colors duration-200">
                          <CheckCircle
                            className="w-3.5 h-3.5 text-army-600"
                            strokeWidth={2.25}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-army-500 mb-1.5">
                          {item.label}
                        </span>
                        <p className="text-[14.5px] text-ink-600 leading-relaxed font-[450]">
                          {item.text}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          </div>

          {/* ── CTA ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              type: "tween",
              duration: 0.5,
              ease: SPRING,
              delay: 0.1,
            }}
            className="flex flex-col items-center"
          >
            <Link
              href="/tentang"
              onClick={handleNavigateToDetail}
              className="w-full sm:w-auto"
            >
              <button className="btn-secondary w-full px-10 py-3.5 group">
                Lanjut Baca Profil
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}