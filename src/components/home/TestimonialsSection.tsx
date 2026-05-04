"use client";

import { MessageCircle, Star, Quote } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    no: "001",
    name: "Bpk. Surwanto",
    role: "Wali Santri PPDB Modern Pusat",
    city: "Sukoharjo, Jawa Tengah",
    initial: "S",
    date: "Oktober 2024",
    quote:
      "Tujuan kami menyekolahkan anak ke PPDB Modern Pusat adalah agar mereka benar-benar paham agama. Alhamdulillah, sistem PPDB Modern memberikan perubahan nyata pada anak kami — cara bicara, sikap, dan keseriusannya dalam ibadah.",
    color: "teal"
  },
  {
    no: "002",
    name: "Ibu Endah Wulandari",
    role: "Wali Santri PPDB Modern Pusat",
    city: "Kebumen, Jawa Tengah",
    initial: "E",
    date: "Januari 2025",
    quote:
      "Awalnya saya khawatir dengan sistem boarding, namun kurikulum tahfidz di PPDB Modern Jonggol sangat sistematis. Dalam 6 bulan, anak saya sudah mampu memimpin shalat berjamaah di rumah dengan makhraj yang benar.",
    color: "sand"
  },
  {
    no: "003",
    name: "Muhammad Razan",
    role: "Alumni PPDB Modern Jonggol",
    city: "Purwokerto, Jawa Tengah",
    initial: "R",
    date: "Maret 2025",
    quote:
      "Disiplin bahasa Arab dan hafalan Al-Qur'an di PPDB Modern sangat membantu saat saya melanjutkan pendidikan tinggi. Saat teman-teman lain masih belajar dasar nahwu, saya sudah bisa langsung membaca kitab.",
    color: "gold"
  },
  {
    no: "004",
    name: "Faisal Ahmad",
    role: "Alumni PPDB Modern Jonggol",
    city: "Cilacap, Jawa Tengah",
    initial: "A",
    date: "Agustus 2024",
    quote:
      "Berkat bimbingan intensif para asatidz di Pesantren PPDB Modern Pusat, saya berhasil lulus seleksi masuk universitas di Timur Tengah. Fondasi bahasa Arab aktif yang ditanamkan benar-benar menjadi kunci.",
    color: "teal"
  },
] as const;

function TestimonialCard({
  no,
  name,
  role,
  city,
  initial,
  date,
  quote,
  color,
  idx
}: (typeof TESTIMONIALS)[number] & { idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2.5rem] h-full flex flex-col relative group transition-all duration-500 border border-sand-200/60 hover:border-teal-200 hover:shadow-premium-xl overflow-hidden"
    >
      {/* Decorative Gradient Background on Hover */}
      <div className="absolute inset-0 bg-linear-to-br from-transparent to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Number badge */}
      <div className="absolute top-8 left-8 w-10 h-10 rounded-[14px] bg-sand-50 border border-sand-200 flex items-center justify-center shadow-premium-xs group-hover:scale-110 transition-transform duration-500 z-10">
        <span className="text-[10px] font-black text-teal-700 tracking-wider">#{no}</span>
      </div>

      <Quote className="absolute top-8 right-8 w-12 h-12 text-sand-50 group-hover:text-sand-100 transition-colors duration-500 -rotate-12" />

      {/* Stars with premium glow */}
      <div className="flex gap-1.5 mb-6 mt-14 relative z-10">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-sand-500 fill-sand-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
        ))}
      </div>

      <p className="text-ink-800 leading-relaxed mb-8 grow font-medium relative z-10 text-[15px] italic">
        "{quote}"
      </p>

      <div className="flex flex-col gap-5 mt-auto pt-6 border-t border-sand-100 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white font-display font-black shadow-premium-sm group-hover:shadow-premium-md group-hover:rotate-6 transition-all duration-500">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-ink-950 leading-tight mb-1 truncate">{name}</p>
            <p className="text-[10px] text-teal-800 font-bold uppercase tracking-widest truncate">{role}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-ink-500 font-semibold tracking-wide">{city}</p>
          <span className="text-[9px] text-teal-700 font-black uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100/50 shadow-premium-xs">{date}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="section-alt border-y border-sand-200">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sand-100/60 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 opacity-50" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white border border-sand-200 text-teal-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Reputasi PPDB Modern Pusat (Jonggol)</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title mb-6"
          >
            Cerita Keberhasilan <span className="text-gradient-teal">Keluarga PPDB Modern</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="section-subtitle mb-6"
          >
            PPDB menerapkan standar keunggulan dan sistem yang sama dengan Pesantren PPDB Modern Pusat (Jonggol) International Islamic Boarding School.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 px-4 py-2 rounded-xl border border-teal-100 font-bold text-sm shadow-sm"
          >
            <span className="text-teal-600">✦</span> Reputasi Global yang Teruji
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {TESTIMONIALS.map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} idx={idx} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[10px] text-ink-500 font-bold uppercase tracking-widest"
        >
          Testimoni asli dari wali santri & alumni · Nama ditampilkan dengan persetujuan
        </motion.p>
      </Container>
    </section>
  );
}
