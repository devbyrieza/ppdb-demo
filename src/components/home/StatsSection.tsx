"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Calendar, Users, GraduationCap, Award, TrendingUp, BookOpen } from 'lucide-react';

const STATS = [
  { id: 'batch', label: 'Angkatan Ke-1', value: 1, icon: Calendar, color: 'brand-blue' as const, suffix: '', sublabel: 'TA 2026/2027' },
  { id: 'quality', label: 'Standar Global', value: 100, icon: Award, color: 'brand-yellow' as const, suffix: '%', sublabel: 'Kurikulum PPDB Modern IIBS' },
  { id: 'levels', label: 'Jenjang Tersedia', value: 2, icon: GraduationCap, color: 'gold' as const, suffix: '', sublabel: 'MTs · IL' },
  { id: 'quota', label: 'Kuota Per Jenjang', value: 25, icon: Users, color: 'brand-blue' as const, suffix: '', sublabel: 'Santri (Terbatas)' },
] as const;

export default function StatsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [counters, setCounters] = useState(
    STATS.reduce((acc, stat) => ({ ...acc, [stat.id]: 0 }), {})
  );

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        STATS.forEach((stat) => {
          let current = 0;
          const target = stat.value;
          const duration = 1500;
          const steps = 60;
          const increment = target / steps;
          const stepTime = duration / steps;

          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            setCounters(prev => ({ ...prev, [stat.id]: Math.floor(current) }));
          }, stepTime);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden border-b border-cream-200">
      {/* Sophisticated Background Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-maroon-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-yellow-100/40 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <Container className="relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.id}
                ref={index === 0 ? ref : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="app-card p-6 md:p-8 flex flex-col items-center text-center group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 shadow-sm
                  ${stat.color === 'brand-blue' ? 'bg-brand-blue-50 text-brand-blue-600' :
                  stat.color === 'brand-yellow' ? 'bg-brand-yellow-100 text-brand-yellow-700' :
                  stat.color === 'gold' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-brand-blue-100 text-brand-blue-800'
                  }`}>
                  <stat.icon className="w-6 h-6" />
                </div>

                <div className="relative">
                  <motion.div
                    className="text-4xl md:text-5xl font-black text-brand-blue-700 mb-2 tracking-tighter"
                  >
                    {counters[stat.id as keyof typeof counters]}
                    {stat.suffix && <span className="text-brand-blue-600 ml-0.5">{stat.suffix}</span>}
                  </motion.div>
                </div>

                <p className="text-[10px] md:text-xs font-bold text-ink-500 uppercase tracking-widest mt-1">
                  {stat.label}
                </p>
                {stat.sublabel && (
                  <p className="text-[9px] md:text-[10px] font-semibold text-ink-400 tracking-wide mt-0.5">
                    {stat.sublabel}
                  </p>
                )}

                {/* Subtle underline decoration */}
                <div className="mt-4 w-6 h-1 bg-cream-200 rounded-full group-hover:w-12 group-hover:bg-maroon-400 transition-all duration-500" />
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators - Fintech Style */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cream-50 rounded-pill border border-cream-200">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-ink-700 uppercase tracking-widest">Pendaftaran Dibuka</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cream-50 rounded-pill border border-cream-200">
              <Award className="w-3.5 h-3.5 text-brand-blue-600" />
              <span className="text-[10px] font-bold text-ink-700 uppercase tracking-widest">Resmi Kemendikdasmen</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cream-50 rounded-pill border border-cream-200">
              <TrendingUp className="w-3.5 h-3.5 text-brand-blue-600" />
              <span className="text-[10px] font-bold text-ink-700 uppercase tracking-widest">Kurikulum Terintegrasi</span>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}