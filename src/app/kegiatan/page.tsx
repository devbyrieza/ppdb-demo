"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  BookMarked,
  Target,
  Sun,
  Book,
  Moon,
  Users,
  Calendar,
  Clock,
  Award,
  Sparkles,
  Heart,
  Home,
  BookText,
  Tent,
  Swords,
  Music,
  PenTool,
  Globe,
  MessageCircle,
  Dribbble,
  CheckCircle2,
  TrendingUp,
  Star,
  Zap,
  Shield,
  Trophy,
  MessagesSquare,
  BadgeCheck,
  GraduationCap,
  ArrowRight,
  Camera
} from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";

// ========================================
// TYPE DEFINITIONS
// ========================================

interface StatItem {
  label: string;
  value: string;
}

interface ResultItem {
  icon: any;
  text: string;
}

interface KegiatanUtama {
  image: string;
  title: string;
  description: string;
  icon: any;
  accentColor: string;
  bgColor: string;
  stats: StatItem[];
  results: ResultItem[];
  testimonial: {
    quote: string;
    parent: string;
  };
}

interface HeroStat {
  icon: any;
  value: string;
  label: string;
  sublabel: string;
}

interface JadwalHarian {
  icon: any;
  time: string;
  activity: string;
  detail: string;
  benefit: string;
  bgColor: string;
  iconColor: string;
}

interface KegiatanMingguan {
  title: string;
  desc: string;
  detail: string;
  benefit: string;
  icon: any;
  color: string;
  bg: string;
}

interface Ekstrakurikuler {
  name: string;
  icon: any;
  desc: string;
  benefit: string;
}

// ========================================
// REUSABLE COMPONENTS
// ========================================

const FeatureCard = ({
  item,
  index,
}: {
  item: KegiatanUtama;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}
  >
    {/* Image Side */}
    <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
      <div className={`aspect-4/3 rounded-[3.5rem] overflow-hidden shadow-lg relative group ${index % 2 === 0 ? 'rotate-2' : '-rotate-2'} hover:rotate-0 transition-transform duration-700 border border-brand-blue-100 p-2 bg-white`}>
        <div className="relative w-full h-full rounded-[3rem] overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />
        </div>
      </div>
 
      {/* Program Badge */}
      <div className="absolute -top-4 -right-4 bg-white px-6 py-3 rounded-pill shadow-md border border-brand-blue-100 z-10 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-brand-yellow-500" />
        <span className="text-xs font-black text-ink-950 uppercase tracking-widest">Unggulan</span>
      </div>
    </div>

    {/* Content Side */}
    <div className="flex flex-col justify-center">
      <div className={`w-16 h-16 ${item.bgColor} rounded-2xl flex items-center justify-center shadow-sm mb-8 transition-transform hover:scale-110`}>
        <item.icon className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-ink-950 mb-4 md:mb-6 leading-tight">
        {item.title}
      </h3>

      <p className="text-lg md:text-xl text-ink-600 mb-8 md:mb-10 leading-relaxed font-medium">
        {item.description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {item.stats.map((stat, statIdx) => (
          <div
            key={statIdx}
            className="bg-brand-blue-50 p-4 rounded-[1.5rem] border border-brand-blue-100 text-center hover:bg-white hover:shadow-sm transition-all"
          >
            <div className="text-2xl font-black text-brand-blue-700 mb-1">
              {stat.value}
            </div>
            <div className="text-[10px] text-ink-400 font-extrabold uppercase tracking-widest">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Results List */}
      <div className="app-card bg-white p-8 rounded-[2.5rem] border border-brand-blue-100 shadow-sm mb-8">
        <div className="space-y-4">
          {item.results.map((result, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <result.icon className="w-5 h-5 text-brand-blue-600 mt-0.5 shrink-0" />
              <span className="text-base text-ink-700 font-bold leading-tight">
                {result.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div className="pl-6 border-l-4 border-brand-yellow-400">
        <p className="text-lg italic text-ink-600 mb-3 font-medium">
          "{item.testimonial.quote}"
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-yellow-400" />
          <span className="text-sm font-black text-ink-950 uppercase tracking-tight">
            {item.testimonial.parent}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

const StatsCard = ({ icon: Icon, value, label, sublabel }: HeroStat) => (
   <motion.div
    whileHover={{ y: -5 }}
    className="app-card bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-brand-blue-100 shadow-sm text-center min-w-[140px] md:min-w-[160px] flex flex-col items-center"
  >
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-blue-50 flex items-center justify-center text-brand-blue-600 mb-3 md:mb-4 border border-brand-blue-100">
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
    </div>
    <div className="text-2xl md:text-3xl font-black text-ink-950 mb-1">
      {value}
    </div>
    <div className="text-[10px] md:text-xs font-black text-ink-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-[9px] md:text-[10px] text-ink-400 font-bold">{sublabel}</div>
  </motion.div>
);

const ScheduleCard = ({
  schedule,
  index,
}: {
  schedule: JadwalHarian;
  index: number;
}) => (
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className={`group p-10 rounded-[3rem] ${schedule.bgColor} border border-brand-blue-100 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-2`}
  >
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-brand-blue-100">
          <schedule.icon className={`${schedule.iconColor} w-8 h-8`} />
        </div>
        <div className="text-lg font-black text-brand-blue-700 bg-white/50 px-4 py-1.5 rounded-pill border border-brand-blue-100">
          {schedule.time}
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-display font-black text-ink-950 mb-3 md:mb-4 leading-tight">
        {schedule.activity}
      </h3>

      <p className="text-base md:text-lg text-ink-600 mb-6 md:mb-8 font-medium leading-relaxed">
        {schedule.detail}
      </p>

       <div className="mt-auto inline-flex items-center gap-3 bg-white/60 p-4 rounded-2xl border border-brand-blue-100 shadow-sm">
        <Zap className="w-5 h-5 text-brand-blue-600 flex-shrink-0" />
        <span className="text-sm font-black text-ink-950 uppercase tracking-tight">
          {schedule.benefit}
        </span>
      </div>
    </div>
  </motion.div>
);

const WeeklyActivityCard = ({
  activity,
  index,
}: {
  activity: KegiatanMingguan;
  index: number;
}) => (
   <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    className={`app-card group p-8 rounded-[2.5rem] bg-white border border-brand-blue-50 shadow-sm hover:shadow-md transition-all hover:-translate-y-2 text-center`}
  >
    <div className={`w-14 h-14 ${activity.bg} rounded-2xl flex items-center justify-center ${activity.color} mx-auto mb-6 group-hover:scale-110 transition-transform border border-brand-blue-100`}>
      <activity.icon className="w-8 h-8" />
    </div>

    <h4 className="font-display font-black text-xl text-ink-950 mb-2">
      {activity.title}
    </h4>

    <p className="text-sm text-ink-400 font-extrabold uppercase tracking-widest mb-4">
      {activity.desc}
    </p>

    <div className="pt-6 border-t border-surface-50 mb-6">
      <p className="text-base text-ink-600 font-medium">
        {activity.detail}
      </p>
    </div>

    <div className="bg-teal-50 rounded-xl px-4 py-3 border border-teal-100">
      <p className="text-xs font-black text-teal-800 uppercase tracking-tight">
        {activity.benefit}
      </p>
    </div>
  </motion.div>
);

const EkskulCard = ({
  ekskul,
  index,
}: {
  ekskul: Ekstrakurikuler;
  index: number;
}) => (
   <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    className="app-card group p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white border border-brand-blue-50 shadow-sm hover:shadow-md hover:border-brand-blue-200 transition-all hover:-translate-y-2 text-center h-full flex flex-col justify-between"
  >
    <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-blue-600 mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-all duration-300 border border-brand-blue-100">
      <ekskul.icon className="w-6 h-6 md:w-8 md:h-8" />
    </div>

    <h4 className="font-display font-black text-sm md:text-xl text-ink-950 mb-2 md:mb-3 leading-tight">
      {ekskul.name}
    </h4>

    <p className="text-xs md:text-base text-ink-500 font-medium mb-4 md:mb-6 leading-relaxed">
      {ekskul.desc}
    </p>

    <div className="pt-3 md:pt-4 border-t border-surface-50 mt-auto">
      <p className="text-[10px] md:text-xs font-black text-teal-700 uppercase tracking-widest break-words">
        {ekskul.benefit}
      </p>
    </div>
  </motion.div>
);

// ========================================
// MAIN COMPONENT
// ========================================

export default function KegiatanPage() {
  const kegiatanUtama: KegiatanUtama[] = [
    {
      image: "/images/pembelajaran-kitab-turotz.webp",
      title: "Pembelajaran Kitab Turots",
      description: "Bukan sekadar hafalan! Santri kami PAHAM isi kitab, mampu berdiskusi ilmiah, dan disiapkan menjadi ilmuwan muda.",
      icon: BookOpen,
      accentColor: "bg-brand-blue-500",
      bgColor: "bg-brand-blue-600",
      stats: [
        { label: "Kitab Dikuasai", value: "30+" },
        { label: "Ustadz Expert", value: "20+" },
        { label: "Jam/Hari", value: "4+" },
      ],
      results: [
        { icon: TrendingUp, text: "Mampu membaca kitab gundul (Nahwu-Shorof Applied)" },
        { icon: Award, text: "Aktif dalam Bahtsul Masail & Muhadoroh" },
        { icon: GraduationCap, text: "Alumni tersebar di PTN & Timur Tengah" },
      ],
      testimonial: {
        quote: "Prioritas utama kami adalah pendidikan agama. Di sini, kami melihat langsung bagaimana anak dididik menjaga adab dan shalat berjamaah tepat waktu. Investasi akhirat yang luar biasa.",
        parent: "Bapak Surwanto (Wali Santri)",
      },
    },
    {
      image: "/images/tahfidz.webp",
      title: "Tahfidz Al-Qur'an Intensif",
      description: "Metode menghafal terukur sesuai kemampuan santri dengan target yang jelas setiap jenjang pendidikan.",
      icon: BookMarked,
      accentColor: "bg-brand-yellow-500",
      bgColor: "bg-brand-yellow-500",
      stats: [
        { label: "Target Utama", value: "28 Juz" },
        { label: "Metode Proven", value: "Talaqqi" },
        { label: "Setoran", value: "Harian" },
      ],
      results: [
        { icon: TrendingUp, text: "Target Hafalan Terukur (± 4 Juz/Tahun)" },
        { icon: Award, text: "Standar Bacaan Bersanad & Tartil" },
        { icon: CheckCircle2, text: "Mampu Menjadi Imam Shalat Berjamaah" },
      ],
      testimonial: {
        quote: "Sinergi kurikulum nasional dan tahfidznya sangat menenangkan. Anak kami tidak hanya mengejar target hafalan, tapi juga PAHAM maknanya melalui bimbingan asatidz yang kompeten.",
        parent: "Ibu Siti Aminah (Wali Santri)",
      },
    },
    {
      image: "/images/extra-karate.webp",
      title: "Pengembangan Bakat & Prestasi",
      description: "Menyiapkan santri multitalenta yang juara di bidang olimpiade, olahraga, hingga public speaking.",
      icon: Target,
      accentColor: "bg-teal-500",
      bgColor: "bg-teal-600",
      stats: [
        { label: "Pilihan Ekskul", value: "10+" },
        { label: "Pelatih Ahli", value: "15+" },
        { label: "Jam/Minggu", value: "6+" },
      ],
      results: [
        { icon: Trophy, text: "Juara Kompetisi Sains & Ketangkasan Fisik" },
        { icon: Award, text: "Pembicara Publik Handal dalam 3 Bahasa" },
        { icon: Users, text: "Berjiwa Kepemimpinan & Mandiri" },
      ],
      testimonial: {
        quote: "Fondasi ilmu syar'i dan disiplin bahasa Arab yang saya dapatkan menjadi modal utama saya saat melanjutkan studi. Lingkungan di sini sangat mendukung pembentukan karakter saya.",
        parent: "Muhammad Razan (Alumni)",
      },
    },
  ];

  const heroStats: HeroStat[] = [
    { icon: BookOpen, value: "30+", label: "Kitab Turots", sublabel: "Kajian Mendalam" },
    { icon: BookMarked, value: "28 Juz", label: "Target Tahfidz", sublabel: "Metode Talaqqi" },
    { icon: Target, value: "10+", label: "Ekstrakurikuler", sublabel: "Asah bakat santri" },
  ];

  const jadwalHarian: JadwalHarian[] = [
    {
      icon: Sun,
      time: "04:30 - 07:00",
      activity: "Subuh Berjamaah & Tahfidz",
      detail: "Mulai hari dengan spiritualitas tinggi dan setoran hafalan segar di waktu terbaik.",
      benefit: "Membangun disiplin bangun pagi seumur hidup.",
      bgColor: "bg-brand-yellow-50/50",
      iconColor: "text-brand-yellow-600",
    },
    {
      icon: Book,
      time: "07:30 - 14:00",
      activity: "KBM & Kajian Kitab",
      detail: "Sekolah formal (MTs/IL) dipadu dengan pembelajaran kitab turots intensif.",
      benefit: "Akademik unggul & ilmu agama mendalam.",
      bgColor: "bg-brand-blue-50",
      iconColor: "text-brand-blue-700",
    },
    {
      icon: Target,
      time: "15:30 - 17:00",
      activity: "Minat & Bakat",
      detail: "Waktu khusus untuk eksplorasi bakat seni, olahraga, dan organisasi santri.",
      benefit: "Menjadi santri multitalenta & adaptif.",
      bgColor: "bg-brand-blue-50/50",
      iconColor: "text-brand-blue-600",
    },
    {
      icon: Moon,
      time: "19:30 - 21:00",
      activity: "Muhadharah & Kajian",
      detail: "Latihan public speaking dan pendalaman etika serta kajian keislaman malam.",
      benefit: "Mental pemimpin & komunikator handal.",
      bgColor: "bg-white",
      iconColor: "text-ink-600",
    },
  ];

  const kegiatanMingguan: KegiatanMingguan[] = [
    {
      title: "Sholat Berjama'ah",
      desc: "5 Waktu Disiplin",
      detail: "Fardhu & Sunnah Rawatib berjamaah di masjid.",
      benefit: "Kebiasaan Ibadah Kokoh",
      icon: Home,
      color: "text-brand-blue-700",
      bg: "bg-brand-blue-50",
    },
    {
      title: "Kajian Jum'at",
      desc: "Wawasan Luas",
      detail: "Tafsir, Hadits & Isu Kontemporer.",
      benefit: "Literasi Agama Matang",
      icon: BookText,
      color: "text-brand-blue-600",
      bg: "bg-brand-blue-50",
    },
    {
      title: "Bela Diri",
      desc: "Fisik Tangguh",
      detail: "Latihan rutin untuk kebugaran dan pertahanan diri.",
      benefit: "Mental & Fisik Kuat",
      icon: Shield,
      color: "text-brand-blue-600",
      bg: "bg-brand-blue-50",
    },
    {
      title: "Pramuka",
      desc: "Kepanduan",
      detail: "Latihan kemandirian, kepemimpinan, dan keterampilan bertahan hidup.",
      benefit: "Jiwa Pemimpin",
      icon: Tent,
      color: "text-ink-600",
      bg: "bg-white",
    },
  ];

  const ekstrakurikuler: Ekstrakurikuler[] = [
    // Baris 1: Establised & Populer
    { name: "Karate", icon: Shield, desc: "Bela diri untuk ketahanan fisik dan disiplin diri.", benefit: "Mentalitas Tangguh" },
    { name: "Pramuka", icon: Tent, desc: "Pembentukan karakter, kepemimpinan & kemandirian.", benefit: "Jiwa Pemimpin" },
    { name: "Panahan", icon: Target, desc: "Olahraga sunnah untuk melatih fokus & ketenangan.", benefit: "Fokus & Konsentrasi" },
    { name: "Futsal", icon: Dribbble, desc: "Olahraga tim untuk kesehatan dan sportivitas.", benefit: "Kerjasama Tim" },
    { name: "Volly", icon: Trophy, desc: "Melatih koordinasi mata-tangan dan kerjasama regu.", benefit: "Ketangkasan Sosial" },

    // Baris 2: Kompetensi & Soft Skills
    { name: "Komputer", icon: Globe, desc: "Penguasaan software perkantoran & literasi digital.", benefit: "Kecakapan Teknologi" },
    { name: "Design Grafis", icon: PenTool, desc: "Seni kreativitas digital dan pengolahan visual.", benefit: "Kreativitas Modern" },
    { name: "Kaligrafi", icon: PenTool, desc: "Seni menulis indah ayat-ayat Al-Qur'an.", benefit: "Ketekunan Seni" },
    { name: "Jurnalistik", icon: BookText, desc: "Melatih kemampuan menulis dan analisis informasi.", benefit: "Komunikasi Publik" },
    { name: "Konten Kreator", icon: Camera, desc: "Edukasi pembuatan konten positif & beradab.", benefit: "Dakwah Digital" },

    // Baris 3: Pengembangan & Masa Depan
    { name: "Basket", icon: Trophy, desc: "Olahraga dinamis untuk stamina dan tinggi badan.", benefit: "Stamina & Endurance" },
    { name: "Bulutangkis", icon: Zap, desc: "Melatih ketangkasan dan koordinasi motorik.", benefit: "Kelincahan Fisik" },
    { name: "Pertanian", icon: Home, desc: "Edukasi kemandirian pangan dan cinta alam.", benefit: "Kemandirian Hidup" },
    { name: "Periklanan", icon: MessageCircle, desc: "Belajar strategi komunikasi visual dan pemasaran.", benefit: "Jiwa Entrepreneur" },
    { name: "Web Programming", icon: Zap, desc: "Dasar-dasar pengembangan website (Coming Soon).", benefit: "Skill Masa Depan" },
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-yellow-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-brand-blue-50 border border-brand-blue-100 text-brand-blue-700 text-xs font-bold uppercase tracking-widest mb-10 shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Program Pendidikan & Kegiatan</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-7xl lg:text-8xl font-display font-black mb-10 tracking-tight leading-[0.9] text-ink-950"
          >
            Membangun <br />
            <span className="text-gradient-blue">Generasi Qur'ani</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-ink-600 max-w-3xl mx-auto leading-relaxed font-medium mb-12 md:mb-16"
          >
            Sinergi Kurikulum Nasional & Pesantren yang terintegrasi secara komprehensif untuk mencetak generasi yang berilmu, beradab, dan adaptif.
          </motion.p>

          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            {heroStats.map((stat, idx) => (
              <StatsCard key={idx} {...stat} />
            ))}
          </div>
        </Container>
      </section>

      {/* 2. Output Section */}
      <section className="py-24 relative bg-surface-50/30">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 lg:p-20 rounded-[3rem] md:rounded-[4rem] shadow-premium-xl border border-surface-100 flex flex-col gap-12 items-center overflow-hidden relative text-center"
          >
            <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-brand-yellow-50/50 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto">
              <span className="text-brand-yellow-600 font-extrabold tracking-widest uppercase text-xs mb-4 md:mb-6 block">Output Santri</span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-ink-950 mb-6 md:mb-8 leading-tight">
                Hasil Nyata <br />
                <span className="text-brand-blue-600">Pendidikan Kita</span>
              </h2>
              <p className="text-lg md:text-xl text-ink-600 font-medium leading-relaxed mb-8 md:mb-10 text-center max-w-2xl mx-auto">
                Alhamdulillah, dengan izin Allah, santri kami telah menunjukkan perkembangan nyata baik dari sisi hafidz, pemahaman kitab, hingga mentalitas juara.
              </p>
              <div className="flex justify-center">
                <Link href="/kontak">
                  <button className="px-12 py-3 md:px-14 md:py-4 rounded-pill bg-brand-blue-900 text-white font-black text-base md:text-lg hover:bg-brand-yellow-500 shadow-premium-lg transition-all flex items-center gap-3">
                    Lihat Portofolio Santri
                  </button>
                </Link>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
              {[
                { text: "Bahasa Arab sebagai Bahasa Pengantar", icon: MessageCircle },
                { text: "Target Hafalan Berstandar Sanad (± 4 Juz/Thn)", icon: BadgeCheck },
                { text: "Lulusan Diterima di LIPIA, PTN & Timur Tengah", icon: GraduationCap },
                { text: "Juara Musabaqah Nasional & Prestasi Sains", icon: Trophy },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-5 md:p-6 rounded-[2rem] flex items-center gap-4 border border-brand-blue-100 group transition-all h-full text-left"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-brand-blue-50 shadow-sm flex items-center justify-center text-brand-blue-600 shrink-0 group-hover:bg-brand-blue-600 group-hover:text-white transition-colors border border-brand-blue-100">
                    <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className="font-black text-ink-900 text-sm md:text-lg leading-tight">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* 3. Program Utama */}
      <section className="py-24 md:py-32">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-24">
            <motion.h2 className="text-3xl md:text-6xl font-display font-black text-ink-950 mb-8">
              Kurikulum Unggulan
            </motion.h2>
            <p className="text-xl text-ink-600 font-medium leading-relaxed">
              Memberikan fondasi ilmu syar'i yang kokoh sekaligus mempersiapkan santri menghadapi tantangan global.
            </p>
          </div>

          <div className="space-y-32">
            {kegiatanUtama.map((item, idx) => (
              <FeatureCard key={idx} item={item} index={idx} />
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Jadwal Harian */}
      <section className="py-24 md:py-32 bg-surface-50/50">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-black text-ink-950 mb-8">
              Produktivitas 24 Jam
            </h2>
            <p className="text-xl text-ink-600 font-medium leading-relaxed">
              Kami membentuk karakter disiplin melalui jadwal yang terstandar dengan pendampingan penuh dari para murabbi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            {jadwalHarian.map((schedule, idx) => (
              <ScheduleCard key={idx} schedule={schedule} index={idx} />
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Weekly Program */}
      <section className="py-24 md:py-32">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-black text-ink-950 mb-6">
              Kegiatan Penunjang
            </h2>
            <p className="text-xl text-ink-600 font-medium leading-relaxed">
              Aktivitas rutin mingguan dan bulanan yang dirancang untuk mematangkan <span className="text-brand-blue-600 font-bold uppercase tracking-tight">keterampilan non-teknis</span> dan pengalaman santri.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {kegiatanMingguan.map((activity, idx) => (
              <WeeklyActivityCard key={idx} activity={activity} index={idx} />
            ))}
          </div>
        </Container>
      </section>

      {/* 6. Extracurriculars */}
      <section className="py-24 md:py-32 bg-surface-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-black text-ink-950 mb-6">
              Minat & Bakat
            </h2>
            <p className="text-xl text-ink-600 font-medium leading-relaxed">
              Wadah eksplorasi potensi santri di luar disiplin ilmu syar'i agar menjadi individu yang seimbang dan tangguh.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {ekstrakurikuler.map((ekskul, idx) => (
              <EkskulCard key={idx} ekskul={ekskul} index={idx} />
            ))}
          </div>
        </Container>
      </section>

      {/* 7. Impactful CTA */}
      <section className="py-16 md:py-24 lg:py-32 bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-brand-blue-900 bg-linear-to-br from-brand-blue-800 to-brand-blue-950 rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] p-6 sm:p-8 md:p-16 lg:p-24 text-center text-white relative overflow-hidden shadow-lg"
          >
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-black mb-4 sm:mb-6 md:mb-8 text-white leading-tight">
                Mulai Perjalanan <br /> <span className="text-brand-yellow-400">Terbaik</span> Mereka
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-brand-blue-100 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 font-medium px-2">
                Pendidikan adalah investasi terbaik. Masuklah ke lingkungan yang menjaga iman, memacu ilmu, dan membangun karakter mereka.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center px-4">
                <Link href="/ppdb">
                  <button className="w-full sm:w-auto px-10 py-3.5 sm:py-4 md:py-5 rounded-pill bg-white text-brand-blue-900 font-black text-sm sm:text-base md:text-lg hover:bg-brand-blue-50 shadow-md transition-all min-h-[48px] sm:min-h-[52px]">
                    Daftar Sekarang
                  </button>
                </Link>
                <Link href="/kontak">
                  <button className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 md:py-5 rounded-pill bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-all text-sm sm:text-base md:text-lg min-h-[48px] sm:min-h-[52px]">
                    Hubungi Admin
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}
