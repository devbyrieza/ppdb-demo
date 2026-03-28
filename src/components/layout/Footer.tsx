"use client";

import Link from "next/link";
import {
  Youtube,
  Instagram,
  Facebook,
  MapPin,
  Phone,
  Mail,
  Twitter,
  Globe,
  ArrowUpRight
} from "lucide-react";
import { Container } from "@/components/layout/Container";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-maroon-950 border-t border-maroon-900 pt-20 pb-28 md:pb-12 overflow-hidden relative">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-maroon-800/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-8">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-cream-50 text-maroon-900 shadow-md overflow-hidden">
                <img src="/images/logo.webp" alt="Logo Al-Andalus Al-Imam" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight leading-none">Al-Andalus Al-Imam</h3>
                <p className="text-[10px] font-bold text-cream-200/80 uppercase tracking-widest mt-2">Boarding School</p>
              </div>
            </Link>
            <p className="text-cream-50/80 font-medium leading-relaxed max-w-xs text-justify">
              Membangun generasi Qur'ani yang cerdas & berakhlak mulia sesuai pemahaman salafush shalih.
            </p>
            <div className="flex gap-3">
              {[Instagram, Youtube, Facebook, Twitter].map((Icon, i) => (
                <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-maroon-900 border border-maroon-800 flex items-center justify-center text-cream-200 hover:bg-cream-400 hover:text-maroon-950 hover:border-cream-300 transition-all duration-300 shadow-sm">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-cream-400 uppercase tracking-widest">Lembaga</h4>
            <ul className="space-y-4">
              {['Tentang Kami', 'Program Studi', 'Fasilitas', 'Kegiatan Santri'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-cream-50/80 font-bold hover:text-white flex items-center gap-2 group transition-colors">
                    {item}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-cream-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-cream-400 uppercase tracking-widest">Informasi</h4>
            <ul className="space-y-4">
              {['Pendaftaran PPDB', 'Biaya Pendidikan', 'Beasiswa Tahfidz', 'Kalender Akademik'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-cream-50/80 font-bold hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-cream-400 uppercase tracking-widest">Kontak Kami</h4>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-maroon-900 flex items-center justify-center text-cream-400 flex-shrink-0 border border-maroon-800">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-cream-50/80 text-left pt-1">
                  Jl. Cikembar No. 12, Sukabumi,<br />Jawa Barat 43157
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-maroon-900 flex items-center justify-center text-cream-400 flex-shrink-0 border border-maroon-800">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white text-left pt-1">
                  +62 851-1152-4441
                  <p className="text-[10px] text-cream-400/80 font-medium tracking-wide mt-0.5">Layanan Pelanggan</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-maroon-900 flex items-center justify-center text-cream-400 flex-shrink-0 border border-maroon-800">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white text-left pt-2.5 break-all">
                  pesantrenalimamsukabumi@gmail.com
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-maroon-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-medium text-cream-50/50 order-2 md:order-1 text-center md:text-left">
            &copy; {currentYear} Pesantren Al-Andalus Al-Imam. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-bold text-cream-50/60 order-1 md:order-2">
            <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
            <div className="flex items-center gap-2 bg-maroon-900 px-3 py-1.5 rounded-lg border border-maroon-800 text-cream-100">
              <Globe className="w-4 h-4" />
              <span className="text-xs">ID / AR</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
