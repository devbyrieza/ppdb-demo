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
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

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

      {/* Floating Demo Access for Presentation */}
      <div className="fixed bottom-8 left-8 z-50">
        <Link href="/login">
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-6 py-4 bg-brand-yellow-400 text-brand-blue-900 font-black rounded-pill shadow-2xl border-2 border-white group"
          >
            <Zap className="w-5 h-5 fill-brand-blue-900 group-hover:animate-pulse" />
            <span className="text-sm uppercase tracking-widest">Coba Demo</span>
          </motion.button>
        </Link>
      </div>
    </main>
  );
}
