"use client";

// src/components/home/ProgramSection.tsx
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { BookOpen, BookKey, GraduationCap, Check, ArrowRight } from "lucide-react";

const PROGRAMS = [
  {
    title: "Madrasah Tsanawiyah (MTs)",
    badge: "Kurikulum Terpadu",
    badgeColor: "bg-primary text-white",
    desc: "Pendidikan menengah pertama memadukan bahasa Arab intensif, tahfidz mutqin, ilmu syar'i, sains akademik umum berdaya saing, serta pola asuh mendidik tanpa luka.",
    icon: GraduationCap,
    features: [
      "Bahasa Arab sangat intensif & kajian turots Sunnah",
      "Tahfidz Al-Qur'an mutqin bimbingan tajwid bersanad",
      "Pelajaran sains & akademik umum tetap pintar berdaya saing",
      "Mendidik tanpa luka: keteladanan 24 jam & adab Islami",
    ],
    href: "/program#mts",
  },
  {
    title: "I'dad Lughawi (IL)",
    badge: "Intensif 1 Tahun",
    badgeColor: "bg-secondary text-primary font-extrabold",
    desc: "Program matrikulasi akselerasi bahasa Arab intensif selama satu tahun bagi lulusan SMP umum untuk persiapan mendalami ilmu syar'i dan melanjutkan ke jenjang MA.",
    icon: BookKey,
    features: [
      "Imersi total bahasa Arab harian (Muhadatsah)",
      "Penguasaan kaidah Nahwu, Shorof, & mufrodat praktis",
      "Pembiasaan adab harian, ibadah Sunnah, & kultur asrama",
      "Jembatan percepatan menuju Madrasah Aliyah",
    ],
    href: "/program#idad",
  },
  {
    title: "Madrasah Aliyah (MA)",
    badge: "Segera Hadir",
    badgeColor: "bg-slate-100 text-slate-700 font-bold",
    desc: "Pendidikan tingkat menengah atas dengan pendalaman literatur turots, penguatan riset syar'i, leadership, entrepreneurship, dan persiapan studi lanjutan.",
    icon: BookOpen,
    features: [
      "Pendalaman kitab turots bersanad para ulama",
      "Persiapan beasiswa Timur Tengah & Perguruan Tinggi",
      "Penempaan leadership dakwah & dasar entrepreneurship",
      "Kemandirian santri berwawasan global & berakhlak mulia",
    ],
    href: "/program#ma",
  },
];

export default function ProgramSection() {
  return (
    <section id="program" className="py-24 bg-white border-b border-slate-200 scroll-mt-20">
      <Container className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="section-label section-label-primary inline-flex">Jenjang Pendidikan &amp; Kurikulum</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Pilihan Program <span className="text-primary">Pendidikan</span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Dirancang komprehensif untuk mencetak generasi yang mutafaqqih fiddin, berwawasan luas, dan berakhlak mulia.
          </p>
        </div>

        {/* 3 Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROGRAMS.map((prog, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-7 md:p-8 border border-slate-200 shadow-xs hover:shadow-md hover:border-secondary transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Icon & Badge */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/40 text-primary flex items-center justify-center font-bold">
                    <prog.icon className="w-6 h-6" />
                  </div>
                  <span className={`px-3.5 py-1 rounded-full text-xs uppercase tracking-wider ${prog.badgeColor}`}>
                    {prog.badge}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2.5 group-hover:text-primary transition-colors">
                  {prog.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">{prog.desc}</p>

                {/* Features list */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 mb-8">
                  {prog.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-secondary/30 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <Link
                href={prog.href}
                className="h-11 px-5 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 text-slate-800 hover:text-primary text-xs font-extrabold transition-all inline-flex items-center justify-between w-full"
              >
                <span>Pelajari Kurikulum Lengkap</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}