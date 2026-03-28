"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ArrowRight,
  Send
} from "lucide-react";
import { motion } from "framer-motion";

const CONTACT_INFO = [
  {
    icon: MapPin,
    title: "Lokasi Pesantren",
    content: "Jl. Pelabuhan Ratu II KM 18",
    detail: "Cikembar, Sukabumi",
    color: "maroon",
  },
  {
    icon: Phone,
    title: "Layanan Telepon",
    content: "+62 851-1152-4441",
    detail: "Senin-Sabtu (08.00 - 16.00)",
    color: "teal",
  },
  {
    icon: Mail,
    title: "Email Resmi",
    content: "pesantrenalimamsukabumi@gmail.com",
    detail: "Kirim pertanyaan kapan saja",
    color: "gold",
  },
] as const;

export default function ContactSection() {
  return (
    <section id="kontak" className="py-20 md:py-28 bg-white border-b border-cream-200 relative overflow-hidden">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-cream-50 rounded-[2.5rem] lg:rounded-[3rem] p-8 md:p-12 lg:p-16 border border-cream-200 relative overflow-hidden shadow-sm"
        >
          {/* Background Map Decoration (Abstract) */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('/grid-pattern.svg')] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white border border-cream-200 text-maroon-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Pusat Bantuan</span>
              </div>
              <h2 className="section-title mb-6">
                Ada Pertanyaan? <br />
                <span className="text-gradient-maroon">Kami Siap Membantu</span>
              </h2>
              <p className="section-subtitle lg:ml-0 text-center lg:text-left mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0">
                Jangan ragu untuk menghubungi kami. Tim administrasi kami siap melayani pertanyaan seputar pendaftaran, kurikulum, dan informasi pesantren.
              </p>

              <Link href="/kontak" className="inline-block w-full sm:w-auto">
                <button className="btn-primary w-full sm:w-auto px-10 flex items-center justify-center gap-2 mx-auto lg:mx-0">
                  Hubungi Kami Sekarang
                  <Send className="w-4 h-4 ml-1" />
                </button>
              </Link>
            </div>

            {/* Cards Grid */}
            <div className="lg:w-1/2 grid sm:grid-cols-2 gap-4 sm:gap-6 w-full">
              {CONTACT_INFO.map((item, idx) => (
                <div key={idx} className={`app-card p-6 md:p-8 flex flex-col items-start group ${idx === 0 ? 'sm:col-span-2' : ''}`}>
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-5 md:mb-6 transition-colors shadow-sm group-hover:scale-110 duration-500 shrink-0 ${
                      item.color === 'maroon' ? 'bg-maroon-50 text-maroon-600' :
                      item.color === 'teal' ? 'bg-teal-50 text-teal-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>
                    <item.icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-ink-950 font-bold text-lg md:text-xl mb-1.5 md:mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-ink-700 font-bold text-sm md:text-base break-all leading-snug mb-1">{item.content}</p>
                  <p className="text-ink-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">{item.detail}</p>
                </div>
              ))}
            </div>

          </div>
        </motion.div>
      </Container>
    </section>
  );
}