// src/app/page.tsx — template-demo
"use client";

import { useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import { Zap } from "lucide-react";

import { restoreScrollPosition } from "@/lib/navigation-scroll";
import ScrollAnimation from "@/components/ui/ScrollAnimation";

import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import AboutSection from "@/components/home/AboutSection";
import ProgramSection from "@/components/home/ProgramSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import TeachersSection from "@/components/home/TeachersSection";
import BoardSection from "@/components/home/BoardSection";
import ProcessSection from "@/components/home/ProcessSection";
import FacilitiesSection from "@/components/home/FacilitiesSection";
import ActivitiesSection from "@/components/home/ActivitiesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FaqSection from "@/components/home/FaqSection";
import ContactSection from "@/components/home/ContactSection";
import CtaSection from "@/components/home/CtaSection";

export default function HomePage() {
  useEffect(() => {
    restoreScrollPosition();
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <main
        id="main-content"
        className="relative overflow-x-hidden"
        aria-label="Halaman Utama Template Demo"
      >
        <section id="beranda" aria-label="Hero">
          <HeroSection />
        </section>

        <section id="statistik" aria-label="Statistik Pesantren">
          <ScrollAnimation delay={0.15} direction="up" duration={0.7}>
            <StatsSection />
          </ScrollAnimation>
        </section>

        <section id="tentang" aria-label="Tentang Pesantren">
          <ScrollAnimation delay={0.1} direction="none" duration={0.8}>
            <AboutSection />
          </ScrollAnimation>
        </section>

        <section id="program" aria-label="Program Unggulan">
          <ScrollAnimation delay={0.12} direction="up" duration={0.7}>
            <ProgramSection />
          </ScrollAnimation>
        </section>

        <section id="keunggulan" aria-label="Keunggulan Pesantren">
          <ScrollAnimation delay={0.1} direction="none" duration={0.75}>
            <FeaturesSection />
          </ScrollAnimation>
        </section>

        <section id="pengajar" aria-label="Tim Pengajar">
          <ScrollAnimation delay={0.1} direction="left" duration={0.7}>
            <TeachersSection />
          </ScrollAnimation>
        </section>

        <section id="pengurus" aria-label="Dewan Pengurus">
          <ScrollAnimation delay={0.1} direction="up" duration={0.7}>
            <BoardSection />
          </ScrollAnimation>
        </section>

        <section id="proses" aria-label="Alur Pendaftaran">
          <ScrollAnimation delay={0.1} direction="none" duration={0.8}>
            <ProcessSection />
          </ScrollAnimation>
        </section>

        <section id="fasilitas" aria-label="Fasilitas Pesantren">
          <ScrollAnimation delay={0.1} direction="up" duration={0.7}>
            <FacilitiesSection />
          </ScrollAnimation>
        </section>

        <section id="kegiatan" aria-label="Kegiatan Pesantren">
          <ScrollAnimation delay={0.1} direction="left" duration={0.7}>
            <ActivitiesSection />
          </ScrollAnimation>
        </section>

        <section id="testimoni" aria-label="Testimoni Santri & Wali">
          <ScrollAnimation delay={0.12} direction="up" duration={0.75}>
            <TestimonialsSection />
          </ScrollAnimation>
        </section>

        <section id="faq" aria-label="Pertanyaan Umum">
          <ScrollAnimation delay={0.1} direction="none" duration={0.8}>
            <FaqSection />
          </ScrollAnimation>
        </section>

        <section id="kontak" aria-label="Hubungi Kami">
          <ScrollAnimation delay={0.1} direction="up" duration={0.7}>
            <ContactSection />
          </ScrollAnimation>
        </section>

        <section id="daftar" aria-label="Daftar Sekarang">
          <ScrollAnimation delay={0.15} direction="none" duration={0.8}>
            <CtaSection />
          </ScrollAnimation>
        </section>

        {/* ── Floating Demo Button — khusus template-demo, tidak ada di alimam/ululalbaab ── */}
        <m.div
          className="fixed bottom-8 left-8 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/login" aria-label="Coba demo aplikasi">
            <m.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="group flex items-center gap-3 px-6 py-4 rounded-full font-black text-sm uppercase tracking-widest border-2 border-white"
              style={{
                background: "linear-gradient(135deg, var(--color-khaki-300) 0%, var(--color-khaki-500) 100%)",
                color: "var(--color-army-900)",
                boxShadow: "var(--shadow-khaki), 0 0 0 1px rgba(0,0,0,0.04)",
              }}
            >
              <Zap
                className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12"
                style={{ fill: "var(--color-army-900)" }}
                aria-hidden="true"
              />
              <span>Coba Demo</span>
            </m.button>
          </Link>
        </m.div>
      </main>
    </LazyMotion>
  );
}