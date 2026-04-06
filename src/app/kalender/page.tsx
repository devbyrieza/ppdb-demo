"use client";

import { Container } from "@/components/layout/Container";
import { Calendar, Construction } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
  return (
    <main className="bg-surface-50 min-h-screen flex items-center justify-center">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-brand-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse border border-brand-blue-100 shadow-sm">
            <Construction className="w-12 h-12 text-brand-blue-700" />
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-black text-ink-950 mb-4 tracking-tight">
            Sedang Dalam <br />
            <span className="text-gradient-blue">Pengembangan</span>
          </h1>

          <p className="text-lg text-ink-600 mb-10 leading-relaxed font-medium">
            Mohon maaf, halaman Kalender Akademik sedang dalam tahap penyempurnaan.
            Kami sedang menyusun jadwal terbaik untuk santri Ulul Albaab.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="inline-flex items-center justify-center px-10 py-4 rounded-pill bg-brand-blue-900 text-white font-black text-lg hover:bg-brand-blue-800 shadow-premium-lg transition-all">
              Kembali ke Beranda
            </Link>
            <Link href="/kontak" className="inline-flex items-center justify-center px-10 py-4 rounded-pill bg-white border border-surface-200 text-ink-950 font-black text-lg hover:bg-surface-50 transition-all shadow-premium-sm" >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
