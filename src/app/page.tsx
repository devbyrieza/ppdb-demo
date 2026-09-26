"use client";

// src/app/page.tsx
import { useEffect } from "react";
import { LazyMotion, domAnimation } from "framer-motion";

import { restoreScrollPosition } from "@/lib/navigation-scroll";
import ScrollAnimation from "@/components/ui/ScrollAnimation";

import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import AboutSection from "@/components/home/AboutSection";
import ProgramSection from "@/components/home/ProgramSection";
import ScholarshipSection from "@/components/home/ScholarshipSection";
// FeaturesSection sengaja tidak dipakai — kontennya tumpang tindih dengan StickyFeatureSection di bawah.
// File tetap ada di src/components/home/FeaturesSection.tsx untuk kemungkinan dipakai di halaman lain.
import TeachersSection from "@/components/home/TeachersSection";
import BoardSection from "@/components/home/BoardSection";
import ProcessSection from "@/components/home/ProcessSection";
import FacilitiesSection from "@/components/home/FacilitiesSection";
import ActivitiesSection from "@/components/home/ActivitiesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FaqSection from "@/components/home/FaqSection";
import ContactSection from "@/components/home/ContactSection";
import CtaSection from "@/components/home/CtaSection";
import StickyFeatureSection from "@/components/home/StickyFeatureSection";
import BentoGridSection from "@/components/home/BentoGridSection";
import FloatingCta from "@/components/home/FloatingCta";

export default function HomePage() {
  useEffect(() => {
    restoreScrollPosition();
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <main
        id="main-content"
        className="relative overflow-x-hidden"
        aria-label="Halaman Utama Al Imam"
      >
        <section id="beranda" aria-label="Hero">
          <HeroSection />
        </section>

        <section id="statistik" aria-label="Statistik Pesantren">
          <ScrollAnimation delay={0.15} direction="up" duration={0.7}>
            <StatsSection />
          </ScrollAnimation>
        </section>

        {/* fade → "none" = hanya opacity, tanpa translasi */}
        <section id="tentang" aria-label="Tentang Al Imam">
          <ScrollAnimation delay={0.1} direction="none" duration={0.8}>
            <AboutSection />
          </ScrollAnimation>
        </section>

        <section id="program" aria-label="Program Unggulan">
          <ScrollAnimation delay={0.12} direction="up" duration={0.7}>
            <ProgramSection />
          </ScrollAnimation>
        </section>

        {/* Diaktifkan kembali — sebelumnya di-import tapi tidak dirender */}
        <section id="beasiswa" aria-label="Jalur Beasiswa">
          <ScrollAnimation delay={0.1} direction="none" duration={0.8}>
            <ScholarshipSection />
          </ScrollAnimation>
        </section>

        {/* scale → "none" = fade saja, kesan muncul halus */}
        <section id="keunggulan" aria-label="Keunggulan Pesantren">
          <ScrollAnimation delay={0.1} direction="none" duration={0.75}>
            <StickyFeatureSection />
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
            <BentoGridSection />
          </ScrollAnimation>
        </section>

        <section id="kegiatan" aria-label="Kegiatan Pesantren">
          <ScrollAnimation delay={0.1} direction="left" duration={0.7}>
            <ActivitiesSection />
          </ScrollAnimation>
        </section>

        <section id="testimoni" aria-label="Testimoni Santri & Wali ">
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

        {/* CTA — none agar muncul elegan tanpa terlalu banyak gerak di akhir */}
        <section id="daftar" aria-label="Daftar Sekarang">
          <ScrollAnimation delay={0.15} direction="none" duration={0.8}>
            <CtaSection />
          </ScrollAnimation>
        </section>

        {/* Floating CTA for Mobile/Desktop */}
        <FloatingCta />
      </main>
    </LazyMotion>
  );
}