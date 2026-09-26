"use client";

// src/components/home/ScholarshipSection.tsx
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { Award, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ScholarshipSection() {
  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden border-y border-maroon-100">
      <Container>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] p-10 md:p-16 lg:p-20 overflow-hidden bg-gradient-to-br from-maroon-900 to-maroon-950 border border-maroon-800 shadow-premium-xl flex flex-col lg:flex-row items-center gap-10 lg:gap-20"
        >
          {/* Gold Glow */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[300px] bg-cream-500/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="lg:w-1/2 text-center lg:text-left relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100 text-cream-800 text-[10px] font-black uppercase tracking-widest mb-6">
              <Award className="w-4 h-4" /> Program Prestasi
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
              Jalur Beasiswa <br /> <span className="text-cream-400">Prestasi Santri.</span>
            </h2>
            <p className="text-maroon-100/80 font-medium text-lg leading-relaxed mb-8">
              Kami mengapresiasi calon santri yang memiliki hafalan Al-Qur&apos;an mutqin atau prestasi akademik tingkat
              nasional dengan program beasiswa khusus.
            </p>

            <Link
              href="/daftar#beasiswa"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-cream-400 hover:bg-cream-300 text-maroon-950 font-extrabold text-sm shadow-lg shadow-black/20 hover:-translate-y-0.5 transition-all group"
            >
              <span>Daftar Jalur Beasiswa</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="lg:w-1/2 relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {[
              { title: "Tahfidz 30 Juz", desc: "Beasiswa penuh untuk hafizh bersanad." },
              { title: "Tahfidz 15 Juz", desc: "Potongan DPP khusus untuk hafalan mutqin." },
              { title: "Prestasi Akademik", desc: "Medalis OSN atau KSM tingkat Nasional." },
              { title: "Yatim Piatu", desc: "Kuota khusus pendaftar jalur dhuafa & yatim." },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl hover:bg-white/20 transition-colors">
                <h3 className="font-bold text-cream-100 mb-1">{item.title}</h3>
                <p className="text-xs text-maroon-200/80 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}