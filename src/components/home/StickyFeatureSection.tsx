"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CheckCircle2, ShieldCheck, Star, Users } from "lucide-react";
import Image from "next/image";

const FEATURES = [
  {
    id: "kurikulum",
    title: "Kurikulum Terintegrasi",
    description: "Memadukan pendidikan pesantren salaf dengan kurikulum nasional. Santri menguasai ilmu agama yang shahih sekaligus unggul dalam sains dan teknologi.",
    icon: ShieldCheck,
    points: [
      "Tahfidz Al-Qur'an bersanad",
      "Aqidah Ahlussunnah wal Jama'ah",
      "Matematika & Sains modern",
      "Program bahasa Arab & Inggris aktif"
    ],
    image: "/images/pembelajaran-kitab-turotz.webp",
  },
  {
    id: "pengasuhan",
    title: "Pengasuhan Berbasis Keteladanan",
    description: "Kami menerapkan sistem pendidikan tanpa kekerasan dan tanpa luka pengasuhan. Pendekatan holistik yang mengedepankan dialog dan teladan.",
    icon: Users,
    points: [
      "Rasio musyrif dan santri ideal",
      "Pendekatan persuasif dan dialogis",
      "Konseling psikologi berkala",
      "Pengembangan kecerdasan emosional"
    ],
    image: "/images/tahfidz.webp",
  },
  {
    id: "fasilitas",
    title: "Fasilitas Modern & Nyaman",
    description: "Lingkungan belajar yang asri dan representatif, mendukung konsentrasi santri dalam menghafal Al-Qur'an dan mengkaji ilmu syar'i.",
    icon: Star,
    points: [
      "Ruang kelas ber-AC & Multimedia",
      "Masjid jami' yang luas & nyaman",
      "Asrama bersih standar hotel",
      "Area olahraga lengkap"
    ],
    image: "/images/gedung-utama-dan-lapangan-basket.webp",
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
          <p className="text-ink-600 text-lg">Platform pendidikan yang didesain untuk mencetak generasi Rabbani yang unggul dalam Imtaq dan Iptek.</p>
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
                  className={`text-left p-6 md:p-8 rounded-[2rem] transition-all duration-300 border border-transparent ${
                    isActive 
                      ? 'bg-white shadow-premium-lg border-primary-100 scale-[1.02]' 
                      : 'hover:bg-white/60 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-primary-500 text-white shadow-primary-md' : 'bg-surface-200 text-ink-400'}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className={`text-xl md:text-2xl font-bold transition-colors duration-300 ${isActive ? 'text-primary-900' : 'text-ink-500'}`}>
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
                        <div className="pt-4 pl-16">
                          <p className="text-ink-600 mb-6 leading-relaxed">
                            {feature.description}
                          </p>
                          <ul className="space-y-3">
                            {feature.points.map((point, idx) => (
                              <li key={idx} className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
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
          <div className="w-full lg:w-1/2 lg:sticky lg:top-32 h-[400px] md:h-[500px] lg:h-[600px] mt-8 lg:mt-0">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/40 to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Decorative blobs */}
            <div className="glow-blob glow-blob-primary w-64 h-64 -bottom-10 -right-10 opacity-30 z-[-1]" />
          </div>
        </div>
      </Container>
    </section>
  );
}
