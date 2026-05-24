"use client";

import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Users, 
  Trophy, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  ClipboardCheck
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import Link from "next/link";

interface ScholarshipSectionProps {
  variant?: "maroon" | "teal";
}

export default function ScholarshipSection({ variant = "maroon" }: ScholarshipSectionProps) {
  const isMaroon = variant === "maroon";
  
  const colors = {
    primary: isMaroon ? "var(--color-maroon-700)" : "var(--color-teal-700)",
    primaryLight: isMaroon ? "var(--color-maroon-50)" : "var(--color-teal-50)",
    primaryDark: isMaroon ? "var(--color-maroon-900)" : "var(--color-teal-900)",
    accent: isMaroon ? "var(--color-cream-400)" : "var(--color-sand-400)",
    badgeBg: isMaroon ? "bg-maroon-50" : "bg-teal-50",
    badgeText: isMaroon ? "text-maroon-700" : "text-teal-700",
    cardBorder: isMaroon ? "border-maroon-100" : "border-teal-100",
    iconBg: isMaroon ? "bg-maroon-600" : "bg-teal-600",
  };

  const EASE = [0.16, 1, 0.3, 1] as const;

  return (
    <section id="beasiswa" className="relative py-24 lg:py-32 overflow-hidden bg-white">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />
      
      <Container className="relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-center">
            
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-[0.15em] shadow-xs mb-6">
                <Sparkles className="w-3 h-3" />
                Highlight Program
              </div>

              <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6" style={{ color: colors.primaryDark }}>
                Program Beasiswa <br />
                <span style={{ color: colors.primary }}>Dhuafa Berprestasi</span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">
                Wujud nyata kepedulian kami dalam Kaderisasi Ummat Qur'ani yang unggul tanpa terhalang kendala ekonomi. Program ini didedikasikan bagi putra-putri terbaik bangsa.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { 
                    icon: GraduationCap, 
                    title: "Pembebasan Biaya", 
                    desc: "Bebas Biaya Uang Pangkal (Infaq Gedung & Sarana)." 
                  },
                  { 
                    icon: Users, 
                    title: "Kuota Terbatas", 
                    desc: "Hanya tersedia untuk 10 santri terpilih setiap angkatan." 
                  },
                  { 
                    icon: ClipboardCheck, 
                    title: "Seleksi Ketat", 
                    desc: "Melalui proses tes kompetensi dan survey ekonomi langsung." 
                  }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                    className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-0.5">{item.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link href="/ppdb">
                <button className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95`} style={{ backgroundColor: colors.primary }}>
                  Daftar Jalur Beasiswa
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>

            {/* Feature Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-premium-2xl overflow-hidden p-8 md:p-12">
                {/* Decorative blobs inside card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 opacity-30 rounded-full blur-3xl -ml-32 -mb-32" style={{ backgroundColor: colors.primaryLight }} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: colors.primary }}>
                      <Trophy className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Status Program</span>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Pendaftaran Dibuka
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Kriteria Penerima Beasiswa</h3>

                  <div className="grid gap-6">
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">Keluarga Kurang Mampu</p>
                          <p className="text-xs text-gray-500 mt-1">Melampirkan SKTM dan slip gaji/surat keterangan penghasilan.</p>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100" />

                      <div className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">Prestasi Hafalan Al-Qur'an</p>
                          <p className="text-xs text-gray-500 mt-1">Memiliki hafalan minimal 10 Juz mutqin (dibuktikan dengan sertifikat/syahadah).</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 px-4">
                        <div className="h-px flex-1 bg-gray-50" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Atau</span>
                        <div className="h-px flex-1 bg-gray-50" />
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">Prestasi Akademik</p>
                          <p className="text-xs text-gray-500 mt-1">Ranking 3 Besar di sekolah asal selama 3 semester terakhir.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                      <div className="flex gap-3 items-start">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-gray-800 leading-normal">
                            Proses seleksi mencakup wawancara khusus dan survey ekonomi langsung oleh pihak Donatur di lokasi calon santri.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative behind card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-2 border-gray-50 rounded-[3rem] -z-10" />
            </motion.div>

          </div>
        </div>
      </Container>
    </section>
  );
}
