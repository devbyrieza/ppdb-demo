"use client";

import { Container } from "@/components/layout/Container";
import { Calendar, Construction } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
  return (
    <main className="bg-surface-50 min-h-screen flex items-center justify-center">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse border border-cream-200 shadow-sm">
            <Construction className="w-12 h-12 text-maroon-700" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-ink-900 mb-4 tracking-tight">
            Sedang Dalam <br />
            <span className="text-gradient-maroon">Pengembangan</span>
          </h1>

          <p className="text-lg text-ink-500 mb-10 leading-relaxed">
            Mohon maaf, halaman Kalender Akademik sedang dalam tahap penyempurnaan.
            Kami sedang menyusun jadwal terbaik untuk santri [Template Demo].
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary">
              Kembali ke Beranda
            </Link>
            <Link href="/kontak" className="btn-secondary" >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
