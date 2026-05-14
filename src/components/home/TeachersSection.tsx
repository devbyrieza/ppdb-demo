"use client";

import {
  GraduationCap,
  Award,
  Globe,
  BookOpen,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const TEACHER_BACKGROUNDS = [
  {
    institution: "Muhammad Ibn Saud Islamic University",
    location: "Pascasarjana, Riyadh, KSA",
  },
  {
    institution: "Univ. Sidi Mohamed ben Abdellah",
    location: "Pascasarjana, Fes, Maroko",
  },
  {
    institution: "Universitas Al-Azhar",
    location: "Kairo, Mesir",
  },
  {
    institution: "Rabithah Al-Alam Al-Islami",
    location: "Makkah Al-Mukarromah",
  },
  {
    institution: "Native Speaker",
    location: "Timur Tengah",
  },
  {
    institution: "LIPIA Jakarta",
    location: "Univ. Islam Imam Muhammad bin Saud",
  },
  {
    institution: "Universitas Negeri Yogyakarta",
    location: "Pascasarjana",
  },
  {
    institution: "STIBA Ar-Raayah",
    location: "Sukabumi",
  },
  {
    institution: "Lulusan Pondok Terkemuka",
    location: "Nasional",
  },
  {
    institution: "Dosen & Praktisi Ahli",
    location: "Tenaga Ahli",
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export default function TeachersSection() {
  return (
    <section
      id="pengajar"
      className="section-alt relative border-y border-secondary-200 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
      <div
        className="absolute -top-32 right-0 translate-x-1/3 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(229,224,211,0.4) 0%, transparent 60%)",
        }}
      />

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-24 items-start">
          {/* ── Text Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="lg:w-[42%] text-center lg:text-left lg:sticky lg:top-32"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-secondary-200 text-primary-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs">
              <GraduationCap className="w-3 h-3 shrink-0" strokeWidth={2} />
              <span>Tenaga Pendidik</span>
            </div>

            <h2 className="section-title mb-5">
              Dibimbing Oleh{" "}
              <span className="text-gradient-primary">Asatidz Kompeten</span>
            </h2>

            <p className="section-subtitle lg:ml-0 text-justify lg:text-left mb-10 max-w-lg mx-auto lg:mx-0">
              Pesantren kami didukung oleh asatidzah profesional lulusan
              universitas terbaik dunia Islam serta pakar pendidikan nasional.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              {[
                {
                  icon: Globe,
                  label: "Lulusan Luar Negeri",
                  sub: "Timur Tengah, Mesir & Maroko",
                  accent: "teal",
                },
                {
                  icon: Users,
                  label: "Native Speakers",
                  sub: "Timur Tengah",
                  accent: "sand",
                },
                {
                  icon: BookOpen,
                  label: "Lulusan Terbaik",
                  sub: "Dalam Negeri & Pondok Unggulan",
                  accent: "sand",
                },
                {
                  icon: Award,
                  label: "Dosen & Pakar",
                  sub: "Tenaga Pendidik Profesional",
                  accent: "teal",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-secondary-200 shadow-premium-sm hover:shadow-premium-md hover:border-primary-200 transition-all duration-400"
                >
                  <div
                    className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 shadow-xs transition-transform duration-400 group-hover:scale-105 ${
                      feature.accent === "teal"
                        ? "bg-primary-50 text-primary-600"
                        : feature.accent === "sand"
                          ? "bg-secondary-100 text-primary-800 border border-secondary-200"
                          : "bg-secondary-50/50 text-primary-600"
                    }`}
                  >
                    <feature.icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[0.875rem] font-bold text-ink-900 leading-tight mb-0.5 truncate">
                      {feature.label}
                    </p>
                    <p className="text-[0.6rem] font-bold text-ink-400 uppercase tracking-[0.1em] leading-tight truncate">
                      {feature.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Grid Content ── */}
          <div className="lg:w-[58%] grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
            {TEACHER_BACKGROUNDS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: idx * 0.05, duration: 0.5, ease: EASE }}
                className="group relative bg-white p-5 rounded-2xl border border-secondary-200 shadow-premium-sm hover:shadow-premium-md hover:border-primary-200 flex items-start gap-3.5 overflow-hidden transition-all duration-400"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="mt-0.5 w-6 h-6 rounded-full bg-secondary-100 border border-secondary-200 flex items-center justify-center shrink-0 shadow-xs transition-transform duration-400 group-hover:scale-110 group-hover:bg-secondary-200">
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-primary-700"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="space-y-1 mt-0.5 relative z-10">
                  <h4 className="font-bold text-ink-900 text-[0.875rem] leading-snug group-hover:text-primary-800 transition-colors duration-200">
                    {item.institution}
                  </h4>
                  <p className="text-[0.625rem] font-bold text-ink-400 uppercase tracking-[0.1em] leading-tight">
                    {item.location}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
