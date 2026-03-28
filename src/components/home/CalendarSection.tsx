"use client";

import Link from "next/link";
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Download,
  ArrowRight,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const IMPORTANT_DATES = [
  {
    date: "10 Feb - 30 Mei 2026",
    title: "Pendaftaran PPDB",
    description: "Pendaftaran santri baru dibuka secara online melalui website resmi.",
    color: "maroon",
  },
  {
    date: "Sesuai Jadwal",
    title: "Tes Seleksi",
    description: "Ujian lisan dan tertulis dilaksanakan setelah verifikasi berkas.",
    color: "cream",
  },
  {
    date: "15 Juli 2026",
    title: "Hari Pertama KBM",
    description: "Khutbah Ta'aruf dan awal pengenalan lingkungan.",
    color: "gold",
  },
] as const;

export default function CalendarSection() {
  return (
    <section id="kalender" className="section-std">
      <Container>
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

          {/* Timeline side */}
          <div className="lg:w-[55%]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-cream-50 border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                <Calendar className="w-3.5 h-3.5" />
                <span>Agenda Penting</span>
              </div>
              <h2 className="section-title mb-10">
                Timeline <span className="text-gradient-maroon">Terstruktur</span>
              </h2>

              <div className="space-y-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-cream-200" />

                {IMPORTANT_DATES.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative flex items-start gap-6 sm:gap-8 group"
                  >
                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center relative z-10 shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110 ${
                        item.color === 'maroon' ? 'bg-maroon-700 text-white' :
                        item.color === 'cream' ? 'bg-cream-200 text-maroon-800 border border-cream-300' :
                        'bg-yellow-500 text-white border border-yellow-600'
                      }`}>
                      <span className="font-display font-black text-lg">{idx + 1}</span>
                    </div>
                    <div className="app-card bg-surface-50 p-6 md:p-8 flex-grow hover:bg-white transition-all duration-300">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className={`px-3 py-1.5 rounded-pill text-[10px] font-bold uppercase tracking-widest ${
                            item.color === 'maroon' ? 'bg-maroon-50 text-maroon-700 border border-maroon-100' :
                            item.color === 'cream' ? 'bg-cream-100 text-maroon-800 border border-cream-200' :
                            'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>
                          {item.date}
                        </span>
                      </div>
                      <h4 className="font-bold text-ink-950 text-xl mb-2 tracking-tight group-hover:text-maroon-700 transition-colors">{item.title}</h4>
                      <p className="text-sm text-ink-600 font-medium leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Card action side */}
          <div className="lg:w-[45%]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] p-8 sm:p-10 md:p-14 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-lg border border-cream-200 h-full hover:shadow-xl transition-all duration-500"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-cream-50 rounded-full flex items-center justify-center mb-8 shadow-sm">
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-maroon-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-ink-950 mb-6 tracking-tight">Manajemen Waktu yang Barokah</h3>
              <p className="text-sm sm:text-base text-ink-600 font-medium mb-10 leading-relaxed max-w-sm">
                Disiplin adalah kunci sukses. Ketahui seluruh jadwal akademik dan kegiatan santri dengan teliti.
              </p>

              <div className="space-y-4 w-full max-w-xs">
                <Link href="/kalender">
                  <button className="btn-primary w-full shadow-lg">
                    Cek Kalender Akademik
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </button>
                </Link>
                <Link href="#">
                  <button className="btn-secondary w-full group overflow-hidden relative">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <Download className="w-4 h-4 group-hover:translate-y-[2px] transition-transform" />
                        Unduh Jadwal (PDF)
                    </span>
                  </button>
                </Link>
              </div>

              {/* Decorative blobs */}
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cream-200/50 rounded-full blur-[80px] -z-10" />
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-maroon-50 rounded-full blur-[80px] -z-10" />
            </motion.div>
          </div>

        </div>
      </Container>
    </section>
  );
}