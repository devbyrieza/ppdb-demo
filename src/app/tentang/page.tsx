"use client";

// src/app/tentang/page.tsx
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import {
  Target,
  Award,
  BookOpen,
  Check,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Heart,
  Users,
  Building,
  Sparkles,
  Languages,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { BRANDING } from "@/config/branding";

export default function TentangPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-gradient-to-b from-[#FDFCF9] via-[#F8FAFC] to-white min-h-dvh pt-28 pb-20 lg:pt-36">
      
      {/* ─── 1. HERO EDITORIAL OMI ─── */}
      <section className="relative overflow-hidden pb-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMGwwIDYwIi8+PC9nPjwvc3ZnPg==')] opacity-70 pointer-events-none" />

        <Container className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Profil Resmi {BRANDING.schoolShortName}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Mengenal Lebih Dekat <br />
            <span className="text-primary">
              {BRANDING.schoolName}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Lembaga pendidikan Islam modern bertaraf internasional yang berorientasi pada{" "}
            <strong className="text-slate-900 font-semibold">kaderisasi ummat yang hanif, kontributif, dan adaptif</strong> melalui{" "}
            <strong className="text-slate-900">Bahasa Arab sangat intensif</strong>, tahfidz Al-Qur'an mutqin, pendalaman ilmu syar'i, sains akademik umum yang berdaya saing, kepemimpinan amanah, serta pola pengasuhan{" "}
            <strong className="text-primary">Mendidik Tanpa Luka</strong> berbasis keteladanan tanpa kekerasan fisik.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="/daftar"
              className="h-11 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>Daftar SPMB 2027/2028</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/program"
              className="h-11 px-6 rounded-xl bg-white text-slate-800 font-extrabold text-xs border border-slate-200 shadow-xs hover:border-emerald-200 transition-all inline-flex items-center"
            >
              <span>Lihat Kurikulum Pendidikan</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── 2. WELCOME BANNER IMAGE (OMI FRAMED PHOTO) ─── */}
      <section className="py-8">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="relative aspect-video md:aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-900">
            <Image
              src="/images/campus-landscape-hero.webp"
              alt={`Lanskap Representatif ${BRANDING.schoolName}`}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6 sm:p-10">
              <div className="text-white space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-block">
                  Kompleks Terpadu Putra &amp; Putri
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold">
                  Lingkungan Asri, Nyaman, dan Kondusif untuk Menuntut Ilmu
                </h3>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 3. SEJARAH & TRANSFORMASI (BENTO 2-COLUMN) ─── */}
      <section className="py-20">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Image with Floating Badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/5]">
                <Image
                  src="/images/campus-academic-building.webp"
                  alt={`Gedung Utama Akademik ${BRANDING.schoolName}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>

              {/* Floating Badge (OMI Style) */}
              <div className="relative sm:absolute -bottom-3 sm:-bottom-6 right-0 sm:right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xl flex items-center gap-3 mt-3 sm:mt-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-xs shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-black uppercase text-slate-400 tracking-wider">Standar Mutu</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">Internasional Boarding School</p>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/50 inline-block">
                  Pondasi & Karakter
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Visi Besar & Nilai Luhur <br />
                  <span className="text-primary">{BRANDING.schoolShortName}</span>
                </h2>
              </div>

              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  <strong className="text-slate-900 font-semibold">{BRANDING.schoolName}</strong> hadir sebagai ikhtiar mulia membangun pusat keilmuan Islam modern yang memadukan kedalaman ilmu agama (Tafaqquh Fiddin) dan keunggulan intelektual global.
                </p>
                <p>
                  Berlandaskan trilogi nilai luhur <strong className="text-primary font-bold">Hanif, Solutif, dan Progresif</strong>, Pesantren Al-Basyir berkomitmen melahirkan generasi mukmin yang bertauhid kokoh, fasih berbahasa Arab, mencintai Al-Qur'an, cerdas dalam sains akademik, serta mandiri dalam mengarungi kehidupan.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold italic border-l-4 border-l-primary">
                  &ldquo;{BRANDING.schoolTagline}&rdquo;
                </div>
              </div>

              {/* 2 Quick KPI Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-xs font-extrabold uppercase text-primary block mb-1">Standar Akademik</span>
                  <p className="text-base sm:text-lg font-black text-slate-900">Kurikulum Terpadu</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Nasional, Turots &amp; Standar Global</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-xs font-extrabold uppercase text-emerald-600 block mb-1">Pola Pengasuhan</span>
                  <p className="text-base sm:text-lg font-black text-slate-900">Mendidik Tanpa Luka</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Keteladanan penuh tanpa kekerasan fisik</p>
                </div>
              </div>

            </div>

          </div>
        </Container>
      </section>

      {/* ─── 4. VISI & MISI BENTO CARDS ─── */}
      <section className="py-20 bg-[#F8FAFC] border-y border-slate-200">
        <Container className="max-w-6xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/50 inline-block">
              Kompas Arah Pembinaan
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Visi & Misi Pesantren
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Pedoman fundamental dalam setiap aktivitas belajar, tahfidz, dan peribadatan harian santri.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Visi (Card 1) */}
            <div className="md:col-span-5 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between border-t-4 border-t-primary">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center font-bold mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Visi Pesantren</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 leading-snug">
                  &ldquo;Kaderisasi Ummat yang Hanif, Berwawasan Solutif, dan Progresif&rdquo;
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-normal leading-relaxed mt-6 pt-4 border-t border-slate-100">
                Melahirkan pribadi muslim yang istiqomah di atas kemurnian tauhid dan bimbingan Sunnah, bermanfaat nyata bagi peradaban masyarakat, serta cerdas dan tangguh menghadapi tantangan global.
              </p>
            </div>

            {/* Misi (Card 2) */}
            <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between border-t-4 border-t-emerald-600">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Misi Utama</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2 mb-4">
                  6 Komitmen Pendidikan Terpadu
                </h3>
                <div className="space-y-3">
                  {[
                    "Menanamkan aqidah shahihah, adab mulia, dan ibadah harian sesuai bimbingan Al-Qur'an dan Sunnah.",
                    "Menyelenggarakan pembelajaran Bahasa Arab sangat intensif sebagai bahasa percakapan harian dan kunci memahami turots.",
                    "Membimbing hafalan Al-Qur'an secara mutqin dengan kaidah tajwid yang benar dan bersanad.",
                    "Mengajarkan pelajaran akademik umum dan sains secara terpadu agar santri tetap pintar, kritis, dan berdaya saing.",
                    "Menumbuhkan jiwa kepemimpinan (leadership), kemandirian santri, dan kepekaan kewirausahaan (entrepreneurship).",
                    "Menerapkan sistem pengasuhan 'Mendidik Tanpa Luka' berbasis keteladanan pendidik 24 jam dan kasih sayang tanpa kekerasan fisik."
                  ].map((misi, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span className="leading-relaxed">{misi}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </Container>
      </section>

      {/* ─── 5. PILAR PENDIDIKAN (6 OMI CARDS) ─── */}
      <section className="py-24">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/50 inline-block">
              Pilar Kurikulum
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              6 Pilar Pendidikan Pesantren Al-Basyir
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Harmoni antara kemurnian ilmu syar'i, keluhuran adab, penguasaan sains, dan kemandirian hidup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Languages,
                title: "Bahasa Arab Sangat Intensif",
                desc: "Bahasa Arab mendapat perhatian penuh sebagai bahasa harian (muhadatsah harian, nahwu & shorof) dan pintu utama memahami literatur Islam."
              },
              {
                icon: BookOpen,
                title: "Tahfidz Al-Qur'an Mutqin",
                desc: "Halaqah hafalan Al-Qur'an intensif dengan bimbingan tajwid yang teliti, tasmi' berkala, dan persiapan sanad qira'ah."
              },
              {
                icon: ShieldCheck,
                title: "Pendalaman Ilmu Syar'i (Turots)",
                desc: "Kajian kitab turots Ahlussunnah wal Jama'ah meliputi aqidah, tafsir, hadits, fiqih ibadah praktis, dan adab penuntut ilmu."
              },
              {
                icon: GraduationCap,
                title: "Akademik & Sains Tetap Pintar",
                desc: "Pelajaran umum berstandar nasional diajarkan secara berkualitas agar santri tetap pintar berdaya saing dan berpikiran solutif."
              },
              {
                icon: Sparkles,
                title: "Leadership & Entrepreneurship",
                desc: "Penempaan jiwa kepemimpinan amanah, kemandirian hidup di asrama, serta etika dasar kewirausahaan islami."
              },
              {
                icon: Heart,
                title: "Mendidik Tanpa Luka",
                desc: "Pola pengasuhan berbasis keteladanan 24 jam para pendidik dan kasih sayang tanpa kekerasan fisik serta tanpa perundungan."
              }
            ].map((pilar, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-primary flex items-center justify-center font-bold mb-5 border border-emerald-200">
                    <pilar.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base mb-2">
                    {pilar.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {pilar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </Container>
      </section>

      {/* ─── 5.5 KOMITMEN PERLINDUNGAN SANTRI & MENDIDIK TANPA LUKA ─── */}
      <section className="py-20 bg-[#F8FAFC] border-y border-slate-200">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200/50 inline-block">
              Pola Asuh Rabbani & Keamanan Santri
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Komitmen Pengasuhan: <span className="text-primary">Mendidik Tanpa Luka</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
              {BRANDING.schoolName} meyakini bahwa pembentukan adab dan karakter sejati lahir dari keteladanan pendidik dan kasih sayang, bukan dari rasa takut terhadap kekerasan fisik atau intimidasi verbal.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Card: 3 Prinsip Keteladanan */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between border-t-4 border-t-emerald-600">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">Metode Tarbiyah</span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Keteladanan & Kasih Sayang</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 whitespace-nowrap shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Keteladanan Pendidik 24 Jam</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Para asatidz dan musyrif tinggal mendampingi santri secara langsung, menjadi contoh nyata dalam shalat berjamaah, adab bertutur kata, dan ibadah harian.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 whitespace-nowrap shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Pendekatan Dialogis & Penyadaran</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Setiap kekhilafan santri diarahkan melalui nasihat hikmah, konseling terarah, dan penanaman kesadaran iman tanpa melukai harga diri santri.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 whitespace-nowrap shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Mutlak Tanpa Sanksi Fisik</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Pesantren melarang keras hukuman fisik dalam bentuk apapun, meniadakan senioritas menghukum, serta mengharamkan caci maki yang melukai psikologis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 bg-emerald-50/50 -mx-8 -mb-8 p-6 rounded-b-3xl">
                <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                  Menjaga fitrah santri agar tumbuh menjadi pribadi yang percaya diri, mencintai Al-Qur'an, dan memiliki kesehatan mental yang prima.
                </p>
              </div>
            </div>

            {/* Right Card: Zero Tolerance Pelanggaran Berat */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between border-t-4 border-t-primary">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center font-bold border border-emerald-200 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">Disiplin & Integritas</span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Pencegahan & Tindakan Tegas</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {BRANDING.schoolName} berkomitmen penuh mencegah, mengantisipasi, dan menindak tegas pelanggaran berat demi ketentraman dan kesucian lingkungan belajar:
                </p>

                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  {[
                    "Bebas Rokok & Zat Terlarang",
                    "Bebas Pacaran & Pergaulan Bebas",
                    "Bebas Penyimpangan (LGBT)",
                    "Bebas Perundungan (Bullying)",
                    "Bebas Kekerasan & Perkelahian",
                    "Bebas Pencurian & Gangguan Ketentraman"
                  ].map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs font-bold text-slate-800"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                      </span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 bg-emerald-50/50 -mx-8 -mb-8 p-6 rounded-b-3xl">
                <p className="text-xs text-primary font-semibold leading-relaxed">
                  Penegakan aturan dilakukan secara terukur dan edukatif tanpa sanksi fisik, demi melindungi seluruh santri dan menjaga kenyamanan wali santri.
                </p>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* ─── 6. BOTTOM CTA (OMI ENTERPRISE BANNER) ─── */}
      <section className="py-12">
        <Container className="max-w-5xl mx-auto px-4">
          <div className="rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-br from-emerald-950 via-emerald-850 to-emerald-700 text-white shadow-xl border border-white/15 space-y-5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Tertarik Bergabung dengan Keluarga Besar {BRANDING.schoolShortName}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto font-normal leading-relaxed">
              Daftarkan putra-putri Anda sekarang dan ikuti proses seleksi penerimaan santri baru Tahun Ajaran 2027/2028.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <a
                href="/daftar"
                className="h-11 px-7 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Daftar SPMB Online</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/kontak"
                className="h-11 px-7 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-extrabold text-xs transition-all inline-flex items-center"
              >
                <span>Hubungi Panitia Admisi</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

    </main>
  );
}