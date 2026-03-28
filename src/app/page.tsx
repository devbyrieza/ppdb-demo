"use client";

import { useEffect } from "react";
import { restoreScrollPosition } from "@/lib/navigation-scroll";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import ScrollAnimation from "@/components/ui/ScrollAnimation";
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
    <main>
      <HeroSection />

      <ScrollAnimation delay={0.2} direction="up">
        <StatsSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <AboutSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <ProgramSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <FeaturesSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <TeachersSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <BoardSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <ProcessSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <FacilitiesSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <ActivitiesSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <TestimonialsSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <FaqSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <ContactSection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.1}>
        <CtaSection />
      </ScrollAnimation>
    </main>
  );
}
