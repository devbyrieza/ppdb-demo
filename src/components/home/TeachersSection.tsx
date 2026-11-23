"use client";

// src/components/home/TeachersSection.tsx
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { Award, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import Image from "next/image";

const TEACHERS = [
  {
    role: "Pimpinan / Mudir",
    title: "Ustadz Wahab Rajasam, M.Pd.",
    institution: "Mudir Pesantren Al-Basyir",
    desc: "Membina arah kebijakan pendidikan, aqidah shahihah, dan manhaj tarbiyah santri.",
    icon: Award,
    badge: "Pimpinan",
    photo: "/images/wahab-rajasam.webp",
  },
  {
    role: "Penasehat Syar'i",
    title: "Dr. Muhammad Arifin Badri, M.A.",
    institution: "Pakar Fiqih & Mu'amalat Islam",
    desc: "Memberikan bimbingan manhaj syar'i, fatwa tarbiyah, dan pembinaan aqidah Ahlussunnah.",
    icon: BookOpen,
    badge: "Penasehat",
    photo: "/images/muhammad-arifin-badri.webp",
  },
  {
    role: "Pembina Yayasan",
    title: "H. Tarmen Tascha, SE",
    institution: "Dewan Pembina Yayasan",
    desc: "Mengawal visi strategis pengembangan sarana, infrastruktur, dan kelembagaan pesantren.",
    icon: ShieldCheck,
    badge: "Pembina",
    photo: null,
  },
  {
    role: "Dewan Pembina Pendidikan",
    title: "Ust. Aminullah Yasin, Lc., M.Pd.",
    institution: "Pakar Kurikulum & Pendidikan Islam",
    desc: "Supervisi mutu kurikulum integrasi turots, tahfidz mutqin, dan kurikulum formal.",
    icon: GraduationCap,
    badge: "Kurikulum",
    photo: null,
  },
  {
    role: "Dewan Pembina Kepengasuhan",
    title: "Ust. Thoriq Ziyad, Lc.",
    institution: "Dewan Pembina Ma'had",
    desc: "Penguatan tarbiyah ruhiyah, adab santri, dan kepengasuhan Mendidik Tanpa Luka.",
    icon: Award,
    badge: "Pengasuhan",
    photo: null,
  },
  {
    role: "Kepala Pengasuhan & Musyrik/Musyrifah",
    title: "Tim Kesantrian 24 Jam",
    institution: "Tarbiyah Adab & Karakter",
    desc: "Mendampingi santri di asrama 24 jam dengan penuh keteladanan tanpa kekerasan.",
    icon: ShieldCheck,
    badge: "Asrama 24 Jam",
    photo: null,
  },
];

export default function TeachersSection() {
  return (
    <section id="pengajar" className="py-24 bg-white border-b border-slate-200 scroll-mt-20">
      <Container className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="section-label section-label-primary inline-flex">Kompetensi &amp; Keteladanan</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Dibimbing oleh <span className="text-primary">Asatidzah Ahli</span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Didukung barisan pendidik berkompeten lulusan universitas Islam ternama dan praktisi pendidikan teruji.
          </p>
        </div>

        {/* Banner Foto Dewan Asatidzah */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[220px] sm:min-h-0 rounded-3xl overflow-hidden shadow-xl border-2 border-secondary/30 mb-12"
        >
          <Image
            src="/images/campus-landscape-hero.webp"
            alt="Dewan Asatidz & Pengajar Pesantren Al-Basyir"
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 text-white">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-block mb-2">
              Dewan Asatidz &amp; Asatidzah Pesantren Al-Basyir
            </span>
            <h3 className="text-base sm:text-xl lg:text-2xl font-extrabold leading-tight text-white">Para Pendidik &amp; Pembina Santri Pesantren Al-Basyir</h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1 font-normal max-w-xl line-clamp-2 sm:line-clamp-none">
              Lulusan universitas Islam ternama Timur Tengah, para hafizhah Al-Qur&apos;an bersanad, dan praktisi tarbiyah
              berpengalaman.
            </p>
          </div>
        </motion.div>

        {/* 6 Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEACHERS.map((teacher, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:shadow-md hover:border-secondary transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo or Icon */}
                <div className="flex items-center justify-between mb-5">
                  {teacher.photo ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-secondary/40 shadow-sm shrink-0">
                      <Image src={teacher.photo} alt={teacher.title} width={56} height={56} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/40 text-primary flex items-center justify-center font-bold">
                      <teacher.icon className="w-6 h-6" />
                    </div>
                  )}
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 whitespace-nowrap inline-block shrink-0">
                    {teacher.badge}
                  </span>
                </div>

                <span className="text-xs font-extrabold text-primary uppercase tracking-wider block mb-1">{teacher.role}</span>
                <h3 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-primary transition-colors leading-tight">
                  {teacher.title}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mb-3">{teacher.institution}</p>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{teacher.desc}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Standar Mutu Pesantren Al-Basyir</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}