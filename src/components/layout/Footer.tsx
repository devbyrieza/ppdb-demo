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
import { BRANDING } from "@/config/branding";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue-950 border-t border-brand-blue-900 pt-20 pb-28 md:pb-12 overflow-hidden relative">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-800/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-8">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-yellow-50 text-brand-blue-950 shadow-md overflow-hidden">
                <img src={BRANDING.logoPath} alt={`Logo ${BRANDING.schoolName}`} className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight leading-none">{BRANDING.schoolName}</h3>
                <p className="text-[10px] font-bold text-brand-yellow-100/80 uppercase tracking-widest mt-2">Islamic Boarding School</p>
              </div>
            </Link>
            <p className="text-brand-yellow-100/80 font-medium leading-relaxed max-w-xs text-justify">
              Membangun generasi Qur&apos;ani yang cerdas &amp; berakhlak mulia melalui sistem terintegrasi Al Andalus.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: BRANDING.igUrl },
                { Icon: Youtube, href: BRANDING.ytUrl },
                { Icon: Facebook, href: BRANDING.fbUrl },
                { Icon: Twitter, href: "#" }
              ].map(({ Icon, href }, i) => (
                <Link key={i} href={href} className="w-10 h-10 rounded-xl bg-brand-blue-900 border border-brand-blue-800 flex items-center justify-center text-brand-yellow-100 hover:bg-brand-yellow-400 hover:text-brand-blue-950 hover:border-brand-yellow-400 transition-all duration-300 shadow-sm">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-brand-yellow-400 uppercase tracking-widest">Lembaga</h4>
            <ul className="space-y-4">
              {['Tentang Kami', 'Program Studi', 'Fasilitas', 'Kegiatan Santri'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-brand-yellow-100/80 font-bold hover:text-white flex items-center gap-2 group transition-colors">
                    {item}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-brand-yellow-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-brand-yellow-400 uppercase tracking-widest">Informasi</h4>
            <ul className="space-y-4">
              {['Pendaftaran PPDB', 'Biaya Pendidikan', 'Beasiswa Tahfidz', 'Kalender Akademik'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-brand-yellow-100/80 font-bold hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-brand-yellow-400 uppercase tracking-widest">Kontak Kami</h4>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-blue-900 flex items-center justify-center text-brand-yellow-400 shrink-0 border border-brand-blue-800">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-brand-yellow-100/80 text-left pt-1">
                  <div dangerouslySetInnerHTML={{ __html: BRANDING.address.replace(/,/g, ',<br />') }} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-blue-900 flex items-center justify-center text-brand-yellow-400 shrink-0 border border-brand-blue-800">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white text-left pt-1">
                  {BRANDING.phone}
                  <p className="text-[10px] text-brand-yellow-100/80 font-medium tracking-wide mt-0.5">Layanan Pelanggan</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-blue-900 flex items-center justify-center text-brand-yellow-400 shrink-0 border border-brand-blue-800">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white text-left pt-2.5 break-all">
                  {BRANDING.email}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-blue-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-medium text-brand-yellow-100/50 order-2 md:order-1 text-center md:text-left">
            &copy; {currentYear} {BRANDING.schoolName}. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-bold text-brand-yellow-100/60 order-1 md:order-2">
            <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-white transition-colors">Syarat &amp; Ketentuan</Link>
            <div className="flex items-center gap-2 bg-brand-blue-900 px-3 py-1.5 rounded-lg border border-brand-blue-800 text-brand-yellow-100">
              <Globe className="w-4 h-4" />
              <span className="text-xs">ID / AR</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
