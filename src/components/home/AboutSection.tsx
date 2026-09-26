"use client";

// src/components/home/AboutSection.tsx
import { Container } from "@/components/layout/Container";
import Image from "next/image";
import { Check } from "lucide-react";
import { BRANDING } from "@/config/branding";

const PILLARS = [
  "Bahasa Arab sangat intensif & kajian turots sunnah.",
  "Tahfidz Al-Qur'an mutqin & pembiasaan ibadah harian.",
  "Akademik umum & sains tetap pintar dan berdaya saing.",
  "Mendidik tanpa luka: nol perundungan & tanpa sanksi fisik.",
];

export default function AboutSection() {
  return (
    <section id="tentang" className="py-24 bg-white border-b border-slate-200 scroll-mt-20">
      <Container className="max-w-7xl mx-auto px-4 md:px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="section-label section-label-primary inline-flex">Landasan &amp; Visi Pendidikan</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Tentang {BRANDING.schoolShortName}
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Ekosistem kaderisasi ummat yang hanif, kontributif, dan adaptif — memadukan Bahasa Arab intensif, tahfidz
            Al-Qur&apos;an mutqin, ilmu syar&apos;i, sains akademik unggul, serta mendidik tanpa luka pengasuhan.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Branding Card */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-secondary/15 via-white to-slate-50 border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-32 h-32 relative mx-auto mb-4">
                <Image src={BRANDING.logoPath} alt={`Logo ${BRANDING.schoolName}`} fill className="object-contain drop-shadow-sm" />
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="font-extrabold text-slate-900 text-base">{BRANDING.schoolName}</h4>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  Pondok Pesantren Berbasis Sunnah &amp; Kurikulum Modern
                </p>
              </div>
            </div>
          </div>

          {/* Right: Policy & 4 Core Pillars */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-4 text-slate-700 text-sm leading-relaxed shadow-sm">
              <p>
                <strong className="text-slate-900">{BRANDING.schoolName}</strong> didirikan dengan komitmen kuat melahirkan
                kaderisasi ummat yang hanif, kontributif, dan adaptif — menguasai{" "}
                <strong className="text-slate-900">Bahasa Arab secara intensif</strong>, mutqin dalam hafalan Al-Qur&apos;an,
                mendalami ilmu syar&apos;i dan adab sunnah, serta tetap berprestasi cemerlang dalam pelajaran sains dan
                akademik umum.
              </p>
              <p>
                Dalam pembinaan karakter, Al-Imam teguh memegang prinsip <strong className="text-primary">Mendidik Tanpa Luka</strong> —
                mengedepankan keteladanan 24 jam para pendidik dan asatidz, pendekatan kasih sayang dan dialog penyadaran{" "}
                <strong className="text-slate-900">tanpa sanksi fisik</strong>, sembari bertindak tegas mencegah pelanggaran
                berat seperti rokok, pergaulan bebas, penyimpangan, dan perundungan (bullying).
              </p>
            </div>

            {/* 4 Feature Badges */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              {PILLARS.map((text, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 p-4 rounded-xl flex items-start gap-3 shadow-sm hover:border-secondary transition-colors"
                >
                  <span className="w-6 h-6 rounded-lg bg-secondary/25 text-primary font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span className="text-xs text-slate-700 font-semibold leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}