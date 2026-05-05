"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, MessageCircleMore } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion, AnimatePresence } from "framer-motion";

// ─── Data ────────────────────────────────────────────
const FAQS = [
  {
    question: "Kapan pendaftaran santri baru angkatan 2026/2027 dibuka?",
    answer:
      "Pendaftaran PPDB Tahun Ajaran 2026/2027 dibuka mulai tanggal 10 Februari sampai dengan 30 Mei 2026. Namun, pendaftaran dapat ditutup lebih awal jika kuota santri baru sudah terpenuhi.",
  },
  {
    question: "Apakah santri diwajibkan untuk tinggal di asrama?",
    answer:
      "Ya, seluruh santri di Pesantren Al-Fath wajib tinggal di asrama untuk mengikuti seluruh rangkaian kegiatan tarbiyah, halaqah tahfidz, dan pembelajaran kitab turots secara maksimal.",
  },
  {
    question: "Kurikulum apa yang diterapkan di Pesantren Al-Fath?",
    answer:
      "Kami menerapkan Kurikulum Terpadu yang menggabungkan kurikulum Nasional dengan kurikulum khas Pesantren yang berfokus pada penguasaan Bahasa Arab, Tahfidz Al-Qur'an, dan Kitab Turots.",
  },
  {
    question: "Apa saja berkas persyaratan yang harus disiapkan?",
    answer:
      "Berkas utama yang diperlukan adalah Akta Kelahiran, Kartu Keluarga, Ijazah/Rapor terakhir, dan pas foto terbaru. Seluruh berkas diunggah secara digital melalui dashboard pendaftaran.",
  },
  {
    question: "Bagaimana sistem seleksi yang diterapkan?",
    answer:
      "Sistem seleksi meliputi tes lisan (tahfidz/bacaan Al-Qur'an), tes tertulis (pengetahuan dasar agama dan akademik), serta Seleksi Wawancara Calon Santri dan orang tua.",
  },
  {
    question: "Apakah tersedia program beasiswa?",
    answer:
      "Ya, Sistem PPDB Modern menyediakan program beasiswa bagi santri berprestasi (tahfidz 30 juz) dan santri dari keluarga yatim/piatu/dhuafa dengan syarat dan ketentuan yang berlaku.",
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;
const WA_URL = "https://wa.me/6288809934970";

// ─── FAQ Item ─────────────────────────────────────────
function FaqItem({
  question,
  answer,
  isOpen,
  toggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  toggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: EASE }}
    >
      <div
        className={[
          "rounded-2xl border bg-white overflow-hidden transition-all duration-300",
          isOpen
            ? "border-teal-200 shadow-premium-sm ring-1 ring-teal-100/60"
            : "border-surface-200 hover:border-teal-100 hover:shadow-xs",
        ].join(" ")}
      >
        <button
          onClick={toggle}
          className="w-full text-left flex items-center justify-between gap-4 px-6 py-5 md:px-7 md:py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-2xl"
          aria-expanded={isOpen}
        >
          <span
            className={[
              "font-bold text-[0.9375rem] md:text-base leading-snug tracking-tight transition-colors duration-200 pr-3",
              isOpen ? "text-teal-700" : "text-ink-900",
            ].join(" ")}
          >
            {question}
          </span>

          <div
            className={[
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
              isOpen
                ? "bg-teal-600 text-white rotate-180"
                : "bg-sand-100 text-teal-500 hover:bg-teal-50",
            ].join(" ")}
          >
            <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="px-6 pb-6 md:px-7 md:pb-7">
                <div className="h-px w-12 bg-sand-200 mb-5" />
                <p className="text-[0.875rem] md:text-[0.9375rem] text-ink-600 font-[450] leading-relaxed">
                  {answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────
export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-std relative overflow-hidden">
      <div
        className="absolute top-1/2 -left-32 -translate-y-1/2 w-[380px] h-[380px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(229,224,211,0.5) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute top-10 -right-20 w-[300px] h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(176,220,220,0.35) 0%, transparent 65%)",
        }}
      />

      <Container className="relative z-10">
        <div className="text-center mb-14 md:mb-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-50 border border-sand-200 text-teal-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs"
          >
            <HelpCircle className="w-3 h-3 shrink-0" strokeWidth={2} />
            <span>Tanya Jawab</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
            className="section-title mb-4"
          >
            Sering <span className="text-gradient-teal">Ditanyakan</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
            className="section-subtitle max-w-xl mx-auto"
          >
            Temukan jawaban cepat untuk pertanyaan umum seputar pendaftaran,
            biaya, dan sistem pendidikan di Pesantren kami.
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => (
            <FaqItem
              key={idx}
              index={idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === idx}
              toggle={() => setOpenIndex(openIndex === idx ? null : idx)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
          className="mt-14 md:mt-16 max-w-sm mx-auto"
        >
          <div className="group relative flex flex-col items-center gap-5 bg-sand-50 rounded-2xl p-7 border border-sand-200 text-center overflow-hidden transition-all duration-400 hover:border-teal-200 hover:shadow-premium-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xs border border-sand-200 group-hover:border-teal-100 transition-colors duration-300">
              <MessageCircleMore
                className="w-5 h-5 text-teal-500"
                strokeWidth={1.75}
              />
            </div>

            <div className="relative z-10 space-y-1.5">
              <p className="text-[0.8125rem] font-bold text-ink-900 tracking-tight">
                Masih punya pertanyaan?
              </p>
              <p className="text-[0.75rem] text-ink-500 font-[450]">
                Tim kami siap membantu via WhatsApp
              </p>
            </div>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 w-full btn-primary justify-center"
              style={{ background: "#25D366" }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-current shrink-0"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Hubungi via WhatsApp
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
