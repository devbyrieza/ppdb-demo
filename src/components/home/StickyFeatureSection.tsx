"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CheckCircle2, ShieldCheck, Star, Users, BookOpen } from "lucide-react";
import Image from "next/image";

const FEATURES = [
  {
    id: "bahasa-syari",
    title: "Bahasa Arab Intensif & Syar'i",
    description: "Bahasa Arab mendapat perhatian sangat intensif sebagai bahasa percakapan harian dan kunci memahami kitab turots. Dipadukan dengan tahfidz Al-Qur'an mutqin serta penguasaan akademik sains modern.",
    icon: BookOpen,
    points: [
      "Bahasa Arab sangat intensif (Muhadatsah harian & Nahwu-Shorof)",
      "Tahfidz Al-Qur'an mutqin kaidah tajwid bersanad",
      "Pendalaman ilmu syar'i & turots bimbingan Sunnah",
      "Pelajaran umum & sains tetap pintar dan berdaya saing"
    ],
    image: "/images/campus-library-classroom.webp"
  },
  {
    id: "mendidik-tanpa-luka",
    title: "Mendidik Tanpa Luka Pengasuhan",
    description: "Pola pengasuhan rabbani yang mengutamakan keteladanan 24 jam para asatidz dan pendidik dengan kasih sayang tanpa sanksi fisik. Menjaga santri dari segala bentuk pelanggaran berat demi ketentraman dan kesehatan mental santri.",
    icon: ShieldCheck,
    points: [
      "Keteladanan 24 jam asatidz & musyrif tinggal mendampingi",
      "Zero Tolerance: bebas rokok, perundungan (bullying), pacaran, & LGBT",
      "Penindakan tegas edukatif tanpa kekerasan & tanpa sanksi fisik",
      "Penerapan akhlak mulia & ibadah harian sesuai Sunnah"
    ],
    image: "/images/campus-quran-halaqah.webp"
  },
  {
    id: "leadership-kemandirian",
    title: "Leadership & Entrepreneurship",
    description: "Menempa jiwa kepemimpinan yang amanah, kemandirian santri, dan kepekaan berwirausaha (entrepreneurship) berlandaskan etika Islam di dalam lingkungan pesantren yang asri dan representatif.",
    icon: Users,
    points: [
      "Penempaan kepemimpinan santri & kedisiplinan organisasi",
      "Edukasi dasar entrepreneurship & etika muamalah syar'i",
      "Lingkungan kampus asri, modern, & kondusif",
      "Fasilitas ruang kelas multimedia, olahraga, & asrama representatif"
    ],
    image: "/images/campus-sports-facility.webp"
  }
];

export default function StickyFeatureSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="relative bg-surface-50 py-20 md:py-32 overflow-hidden">
      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="section-label section-label-primary mb-4">Sistem Pendidikan</span>
          <h2 className="text-3xl md:text-5xl font-black mb-6">Mengapa Memilih Kami?</h2>
          <p className="text-ink-600 text-lg">Platform pendidikan yang didesain untuk mencetak kader ummat yang hanif, solutif, dan progresif.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          {/* Left Side: Vertical Accordion Tabs */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            {FEATURES.map((feature, i) => {
              const isActive = activeFeature === i;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(i)}
                  className={`text-left p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-300 border border-transparent ${
                    isActive 
                      ? 'bg-white shadow-premium-lg border-primary-100 scale-[1.01] sm:scale-[1.02]' 
                      : 'hover:bg-white/60 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-2">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-primary-500 text-ink-950 shadow-md' : 'bg-surface-200 text-ink-600'}`}>
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className={`text-lg sm:text-xl md:text-2xl font-bold transition-colors duration-300 ${isActive ? 'text-primary-900' : 'text-ink-500'}`}>
                      {feature.title}
                    </h3>
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 sm:pt-4 pl-2 sm:pl-16">
                          <p className="text-ink-600 mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed">
                            {feature.description}
                          </p>
                          <ul className="space-y-2.5 sm:space-y-3">
                            {feature.points.map((point, idx) => (
                              <li key={idx} className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 shrink-0" />
                                <span className="font-medium text-ink-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          {/* Right Side: Sticky Visual */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-32 h-[260px] sm:h-[380px] md:h-[500px] lg:h-[600px] mt-4 lg:mt-0">
            <div className="relative w-full h-full rounded-[2.5rem] border-[8px] border-white shadow-premium-2xl overflow-hidden bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={FEATURES[activeFeature].image}
                    alt={FEATURES[activeFeature].title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* No overlay — foto tampil jernih */}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
