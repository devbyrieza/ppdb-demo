"use client";

import Link from "next/link";
import { Calendar, Download, Clock, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

// ─── Data ────────────────────────────────────────────
const IMPORTANT_DATES = [
  {
    date: "10 Feb - 30 Mei 2026",
    title: "Pendaftaran PPDB",
    description:
      "Pendaftaran santri baru dibuka secara online melalui website resmi.",
    accent: "teal" as const,
  },
  {
    date: "Sesuai Jadwal",
    title: "Seleksi",
    description:
      "Ujian lisan dan tertulis dilaksanakan setelah verifikasi berkas.",
    accent: "sand" as const,
  },
  {
    date: "15 Juli 2026",
    title: "Hari Pertama KBM",
    description: "Khutbah Ta'aruf dan awal pengenalan lingkungan.",
    accent: "teal" as const,
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

const ACCENT_MAP = {
  teal: {
    number: "bg-primary-600 text-white",
    badge: "bg-primary-50 text-primary-700 border-primary-100",
    title: "group-hover:text-primary-700",
  },
  sand: {
    number: "bg-secondary-100 text-secondary-800 border border-secondary-200",
    badge: "bg-secondary-50 text-secondary-700 border-secondary-200",
    title: "group-hover:text-secondary-700",
  },
};

// ─── Main ─────────────────────────────────────────────
export default function CalendarSection() {
  return (
    <section
      id="kalender"
      className="section-std relative border-y border-secondary-200 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
          <div className="lg:w-[55%] w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-50 border border-secondary-200 text-primary-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs">
                <Calendar className="w-3 h-3 shrink-0" strokeWidth={2} />
                <span>Agenda Penting</span>
              </div>

              <h2 className="section-title mb-10">
                Timeline <span className="text-gradient-primary">Terstruktur</span>
              </h2>

              <div className="space-y-6 relative pl-3">
                <div className="absolute left-[35px] top-6 bottom-6 w-px bg-gradient-to-b from-primary-200 via-secondary-200 to-transparent" />

                {IMPORTANT_DATES.map((item, idx) => {
                  const colors = ACCENT_MAP[item.accent];
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: idx * 0.1,
                        duration: 0.5,
                        ease: EASE,
                      }}
                      className="relative flex items-start gap-5 sm:gap-7 group"
                    >
                      <div
                        className={[
                          "w-11 h-11 rounded-2xl flex items-center justify-center relative z-10 shrink-0 shadow-xs",
                          "transition-transform duration-400 group-hover:scale-110",
                          colors.number,
                        ].join(" ")}
                      >
                        <span className="font-display font-black text-[1.0625rem]">
                          {idx + 1}
                        </span>
                      </div>

                      <div className="bg-white p-6 md:p-7 rounded-2xl border border-secondary-200 shadow-premium-sm hover:shadow-premium-md hover:border-primary-200 transition-all duration-400 flex-grow relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                        <div className="relative z-10">
                          <span
                            className={[
                              "inline-block px-2.5 py-1 rounded-md text-[0.6rem] font-black uppercase tracking-widest mb-3 border shadow-xs",
                              colors.badge,
                            ].join(" ")}
                          >
                            {item.date}
                          </span>
                          <h4
                            className={`font-bold text-ink-900 text-lg mb-1.5 tracking-tight transition-colors duration-200 ${colors.title}`}
                          >
                            {item.title}
                          </h4>
                          <p className="text-[0.8125rem] text-ink-500 font-[450] leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <div className="lg:w-[45%] w-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: EASE }}
              className="bg-white rounded-[2.5rem] p-8 sm:p-10 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-premium-lg border border-secondary-200 group hover:border-primary-200 transition-all duration-500"
            >
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary-200/50 rounded-full blur-[60px] pointer-events-none transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-50/80 rounded-full blur-[60px] pointer-events-none transition-transform duration-700 group-hover:scale-110" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-secondary-100 group-hover:scale-105 group-hover:border-primary-100 transition-all duration-400">
                  <Clock
                    className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="text-[1.35rem] sm:text-[1.75rem] font-display font-black text-ink-900 mb-4 tracking-tight leading-snug group-hover:text-primary-800 transition-colors duration-300">
                  Manajemen Waktu <br /> yang Barokah
                </h3>

                <p className="text-[0.8125rem] sm:text-[0.875rem] text-ink-500 font-[450] mb-8 leading-relaxed max-w-[260px]">
                  Disiplin adalah kunci sukses. Ketahui seluruh jadwal akademik
                  dan kegiatan santri dengan teliti.
                </p>

                <div className="space-y-3.5 w-full max-w-[240px]">
                  <Link href="/kalender" className="block w-full">
                    <button className="btn-primary w-full justify-center py-3 shadow-md">
                      Cek Kalender
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </button>
                  </Link>
                  <Link href="#" className="block w-full">
                    <button className="btn-secondary w-full justify-center py-3 bg-white hover:bg-secondary-50 border-secondary-200 group/btn">
                      <Download className="w-4 h-4 mr-2 group-hover/btn:-translate-y-0.5 transition-transform" />
                      <span className="text-[0.8125rem]">Unduh PDF</span>
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
