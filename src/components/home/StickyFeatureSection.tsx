"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
    image: "/images/hero.jpg",
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
    image: "/images/hero.jpg",
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
    image: "/images/hero.jpg",
  }
];

export default function StickyFeatureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  // We track the scroll progress of the entire section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      // Divide progress into segments
      const segment = 1 / FEATURES.length;
      let activeIndex = Math.floor(latest / segment);
      if (activeIndex >= FEATURES.length) activeIndex = FEATURES.length - 1;
      if (activeIndex < 0) activeIndex = 0;
      
      setActiveFeature(activeIndex);
    });
  }, [scrollYProgress]);

  return (
    <section ref={containerRef} className="relative bg-surface-50">
      <Container className="relative pt-24 pb-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-label section-label-primary mb-4">Sistem Pendidikan</span>
          <h2 className="text-3xl md:text-5xl font-black mb-6">Mengapa Memilih Kami?</h2>
          <p className="text-ink-600 text-lg">Platform pendidikan yang didesain untuk mencetak generasi Rabbani yang unggul dalam Imtaq dan Iptek.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative items-start">
          {/* Left Side: Scrolling Content */}
          <div className="w-full lg:w-1/2 relative z-10" style={{ paddingBottom: "10vh" }}>
            <div className="flex flex-col space-y-[20vh] lg:space-y-[30vh] mt-[10vh] lg:mt-[20vh]">
              {FEATURES.map((feature, i) => {
                const isActive = activeFeature === i;
                return (
                  <motion.div
                    key={feature.id}
                    className="relative"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: isActive ? 1 : 0.3 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500 ${isActive ? 'bg-primary-500 text-white shadow-primary-lg' : 'bg-surface-200 text-ink-400'}`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h3 className={`text-2xl md:text-3xl font-bold transition-colors duration-500 ${isActive ? 'text-primary-900' : 'text-ink-400'}`}>
                        {feature.title}
                      </h3>
                    </div>
                    <p className={`text-lg mb-6 leading-relaxed transition-colors duration-500 ${isActive ? 'text-ink-600' : 'text-ink-400'}`}>
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.points.map((point, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckCircle2 className={`w-5 h-5 transition-colors duration-500 ${isActive ? 'text-primary-500' : 'text-ink-300'}`} />
                          <span className={`font-medium transition-colors duration-500 ${isActive ? 'text-ink-700' : 'text-ink-400'}`}>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Sticky Visual */}
          <div className="w-full lg:w-1/2 sticky top-24 lg:top-32 hidden lg:block h-[600px]">
            <div className="relative w-full h-full rounded-[2rem] border-[8px] border-white shadow-premium-2xl overflow-hidden bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
