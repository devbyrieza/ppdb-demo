"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Trophy,
  Shield,
  Target,
  Monitor,
  Zap,
  TreePine,
  Waves,
  FileText,
  PenTool,
  Dumbbell,
  Play,
  Palette,
  Sparkles,
  ArrowRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────


interface Activity {
  name: string;
  description: string;
  image: string;
  badge: string;
}

interface ExtraActivity {
  name: string;
  icon: React.ElementType;
}

// ─── Data ────────────────────────────────────────────
const ACTIVITIES: Activity[] = [
  {
    name: "Pembelajaran Aktif",
    badge: "Akademik & Syar'i",
    description:
      "Metode pembelajaran interaktif yang memadukan keunggulan akademik umum dengan pendalaman bahasa Arab dan ilmu syar'i secara komprehensif.",
    image: "/images/pembelajaran-kitab-turotz.webp",
  },
  {
    name: "Kegiatan Rutin Harian",
    badge: "Spiritual",
    description:
      "Pembiasaan ibadah melalui sholat berjamaah tepat waktu dan halaqah tahfidz Al-Qur'an setiap hari secara konsisten.",
    image: "/images/tahfidz.webp",
  },
  {
    name: "Ekstrakurikuler Unggulan",
    badge: "15+ Pilihan",
    description:
      "Tersedia 15+ pilihan kegiatan mulai dari beladiri hingga Desain Grafis untuk mengasah minat dan bakat santri.",
    image: "/images/extra-karate.webp",
  },
  {
    name: "Kemandirian, Skill & Leadership",
    badge: "Life Skills",
    description:
      "Program pelatihan entrepreneurship, leadership, dan keterampilan hidup mandiri guna mencetak santri yang siap berdikari di masa depan.",
    image: "/images/luar-kelas.webp",
  },
];

const EXTRA_ACTIVITIES: ExtraActivity[] = [
  { name: "Karate", icon: Trophy },
  { name: "Pramuka", icon: Shield },
  { name: "Panahan", icon: Target },
  { name: "Futsal", icon: Trophy },
  { name: "Volly", icon: Trophy },
  { name: "Komputer", icon: Monitor },
  { name: "Design Grafis", icon: Palette },
  { name: "Kaligrafi", icon: PenTool },
  { name: "Jurnalistik", icon: FileText },
  { name: "Konten Kreator", icon: Play },
  { name: "Basket", icon: Dumbbell },
  { name: "Bulutangkis", icon: Zap },
  { name: "Pertanian", icon: TreePine },
  { name: "Periklanan", icon: Waves },
  { name: "Coding & AI", icon: Sparkles },
];

// ─── Activity Card ────────────────────────────────────
function ActivityCard({
  activity,
  index,
}: {
  activity: Activity;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{
        delay: index * 0.09,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group flex flex-col bg-white rounded-2xl border border-primary-100 shadow-premium-sm overflow-hidden transition-all duration-500 ease-spring hover:-translate-y-2 hover:shadow-premium-md hover:border-primary-200"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden shrink-0 bg-secondary-100">
        <Image
          src={activity.image}
          alt={activity.name}
          fill
          priority={index < 2}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay removed for clear images */}

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[0.6rem] font-bold text-primary-700 uppercase tracking-widest border border-primary-100/50 shadow-sm">
            {activity.badge}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col grow p-6 md:p-7">
        <h3 className="text-base md:text-lg font-bold text-ink-900 mb-2.5 tracking-tight leading-snug group-hover:text-primary-700 transition-colors duration-300">
          {activity.name}
        </h3>
        <p className="text-[0.8125rem] md:text-sm text-ink-500 leading-relaxed grow font-[450]">
          {activity.description}
        </p>

        {/* Bottom accent */}
        <div className="mt-5 pt-4 border-t border-primary-50 flex items-center justify-between">
          <div className="h-[2px] w-5 rounded-full bg-primary-200 group-hover:w-10 group-hover:bg-primary-500 transition-all duration-500" />
          <span className="text-[0.65rem] font-bold text-primary-300 uppercase tracking-widest group-hover:text-primary-500 transition-colors duration-300">
            Selengkapnya
          </span>
        </div>
      </div>
    </motion.div>
  );
}



// ─── Main Component ──────────────────────────────────
export default function ActivitiesSection() {
  return (
    <section
      id="kegiatan"
      className="section-alt relative border-y border-secondary-200/60"
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230d9488' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] -translate-y-1/2 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(240,253,250,0.7) 0%, transparent 70%)",
        }}
      />

      <Container className="relative z-10">
        {/* ── Section Header ── */}
        <div className="text-center mb-14 md:mb-18 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-primary-100 text-primary-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-6 shadow-xs"
          >
            <Users className="w-3 h-3 shrink-0" strokeWidth={2} />
            <span>Kegiatan Santri</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="section-title mb-5 text-balance"
          >
            Kegiatan{" "}
            <span className="text-gradient-primary">Bervariasi & Edukatif</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="section-subtitle"
          >
            Berbagai kegiatan positif untuk mengembangkan potensi santri dalam
            bidang akademik, spiritual, dan kemandirian sosial.
          </motion.p>
        </div>

        {/* ── Main Activities Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-20 md:mb-24">
          {ACTIVITIES.map((activity, idx) => (
            <ActivityCard key={activity.name} activity={activity} index={idx} />
          ))}
        </div>

        {/* ── Extracurriculars ── */}
        <div className="mb-16 md:mb-20">
          {/* Sub-header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10 md:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-50 border border-secondary-200 text-primary-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs">
              <Sparkles className="w-3 h-3 shrink-0" strokeWidth={2} />
              <span>Minat & Bakat</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-ink-900 tracking-tight mb-3">
              Ekstrakurikuler{" "}
              <span className="text-gradient-primary">Terpadu</span>
            </h3>

            <p className="text-sm md:text-[0.9375rem] text-ink-500 font-[450] max-w-xl mx-auto leading-relaxed">
              Mengembangkan potensi santri secara holistik melalui berbagai
              pilihan kegiatan yang mendukung kemandirian, kreativitas, dan
              fisik yang kuat.
            </p>
          </motion.div>

          {/* Extra Activities Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-20">
            {EXTRA_ACTIVITIES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-primary-50 shadow-sm hover:border-primary-100 hover:shadow-md transition-all group text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-ink-950 uppercase tracking-wider">
                    {item.name}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Card (Big CTA) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="relative p-10 md:p-12 rounded-[2.5rem] bg-primary-900 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-secondary-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="max-w-md">
                  <h4 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
                    Lihat Jadwal Harian Lengkap Santri
                  </h4>
                  <p className="text-primary-100/70 font-medium text-sm leading-relaxed">
                    Setiap detik di pesantren adalah ibadah dan ilmu. Pelajari
                    jadwal harian lengkap untuk mengetahui rutinitas santri kami.
                  </p>
                </div>

                <div className="shrink-0">
                  <Link href="/kegiatan">
                    <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-secondary-500 text-primary-950 font-black text-sm uppercase tracking-widest rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95">
                      <span className="relative z-10">Eksplorasi Seluruh Kegiatan</span>
                      <CalendarIcon className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                      <div className="absolute inset-0 bg-secondary-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
