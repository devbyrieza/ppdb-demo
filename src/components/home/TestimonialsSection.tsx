"use client";

import { MessageCircle, Star, Quote } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    no: "001",
    name: "Bpk. Surwanto",
    role: "Wali Santri",
    city: "Sukoharjo, Jawa Tengah",
    initial: "S",
    date: "Oktober 2024",
    quote:
      "Tujuan kami menyekolahkan anak ke pesantren adalah agar mereka benar-benar paham agama, bukan sekadar hafal pelajaran. Alhamdulillah, sistem Al-Andalus telah memberikan perubahan nyata pada anak kami — cara bicara, cara bersikap kepada orang tua, dan keseriusannya dalam ibadah.",
    color: "maroon"
  },
  {
    no: "002",
    name: "Ibu Endah Wulandari",
    role: "Wali Santri",
    city: "Kebumen, Jawa Tengah",
    initial: "E",
    date: "Januari 2025",
    quote:
      "Awalnya saya khawatir dengan sistem boarding, takut anak susah adaptasi. Ternyata kurikulum tahfidznya sangat sistematis — sangat ditekankan pada makhraj dan tajwid yang benar. Dalam 6 bulan, anak saya sudah mampu memimpin shalat berjamaah di rumah.",
    color: "cream"
  },
  {
    no: "003",
    name: "Muhammad Razan",
    role: "Alumni Al-Andalus",
    city: "Purwokerto, Jawa Tengah",
    initial: "R",
    date: "Maret 2025",
    quote:
      "Disiplin bahasa Arab dan hafalan Al-Qur'an sangat membantu saat saya melanjutkan pendidikan ke jenjang lebih tinggi. Saat teman-teman lain masih belajar dasar-dasar nahwu, saya sudah bisa langsung membaca kitab.",
    color: "gold"
  },
  {
    no: "004",
    name: "Faisal Ahmad",
    role: "Alumni Al-Andalus",
    city: "Cilacap, Jawa Tengah",
    initial: "A",
    date: "Agustus 2024",
    quote:
      "Berkat bimbingan intensif para asatidz di Pesantren Al-Andalus, saya berhasil lulus seleksi masuk universitas di Timur Tengah. Fondasi bahasa Arab aktif yang ditanamkan sejak awal benar-benar menjadi kunci.",
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
      className="app-card bg-white p-8 h-full flex flex-col relative group transition-all duration-500 hover:-translate-y-1"
    >
      {/* Number badge */}
      <div className="absolute top-8 left-8 w-10 h-10 rounded-[12px] bg-cream-50 border border-cream-200 flex items-center justify-center shadow-sm">
        <span className="text-xs font-black text-maroon-700 tracking-wider">#{no}</span>
      </div>

      <Quote className="absolute top-8 right-8 w-10 h-10 text-cream-100 group-hover:text-cream-200 transition-colors" />

      {/* Stars */}
      <div className="flex gap-1 mb-6 mt-14">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        ))}
      </div>

      <p className="text-ink-700 leading-relaxed mb-8 flex-grow font-medium relative z-10 text-[15px]">
        "{quote}"
      </p>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-cream-200/60">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-maroon-600 to-maroon-900 flex items-center justify-center text-white font-display font-black shadow-sm group-hover:scale-110 transition-transform duration-500">
            {initial}
          </div>
          <div>
            <p className="text-[15px] font-bold text-ink-950 leading-tight mb-1">{name}</p>
            <p className="text-[10px] text-maroon-700 font-bold uppercase tracking-widest">{role} · {city}</p>
          </div>
        </div>
        <span className="text-[10px] text-ink-400 font-bold shrink-0 bg-surface-50 px-2 py-1 rounded-md">{date}</span>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="section-alt border-y border-cream-200">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cream-100/60 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 opacity-50" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Cerita Nyata Wali Santri & Alumni</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title mb-6"
          >
            Apa Kata <span className="text-gradient-maroon">Mereka?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="section-subtitle mb-6"
          >
            Kepercayaan wali santri dan alumni adalah amanah bagi kami untuk terus memberikan yang terbaik.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-maroon-50 text-maroon-800 px-4 py-2 rounded-xl border border-maroon-100 font-bold text-sm shadow-sm"
          >
            <span className="text-maroon-600">✦</span> Dari Keluarga Besar Al-Andalus
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