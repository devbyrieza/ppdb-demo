"use client";

import { Users, User, Star } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import Image from "next/image";

// ─── Data ────────────────────────────────────────────
const BOARD_MEMBERS = [
  {
    name: "Ustadz Dr. Muhammad Arifin Badri, Lc, M.A",
    image: "/images/muhammad-arifin-badri.webp",
  },
  {
    name: "Ustadz Nurdin Apud Sarbini, Lc, M.Pd",
    image: "/images/nurdin-apud-sabrini.webp",
  },
  { name: "H. Tarmen Tascha, SE", image: "/images/tarmen-tascha.webp" },
  {
    name: "Ustadz Aminullah Yasin, Lc, M.Pd",
    image: "/images/aminullah-yasin.webp",
  },
  { name: "Ustadz Wahab Rajasam, M.Pd", image: "/images/wahab-rajasam.webp" },
  { name: "Ustadz Thoriq Ziyad, Lc", image: "/images/thoriq-ziyad.webp" },
] as const;

// ─── Animation ───────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Member Card ─────────────────────────────────────
function MemberCard({
  name,
  image,
  index,
}: {
  name: string;
  image: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: EASE }}
      className="group flex items-center gap-5 p-4 md:p-5 bg-white rounded-2xl border border-surface-200 shadow-premium-sm hover:shadow-premium-md hover:border-teal-200 transition-all duration-400"
    >
      {/* Avatar */}
      <div className="relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 bg-sand-50 border border-sand-100 shadow-xs transition-transform duration-500 group-hover:scale-[1.04]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="80px"
            priority={index < 4}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sand-50 group-hover:bg-teal-50 transition-colors duration-400">
            <User className="w-7 h-7 text-teal-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/8 transition-colors duration-400" />
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-[0.9rem] md:text-[0.9375rem] text-ink-900 leading-snug tracking-tight group-hover:text-teal-700 transition-colors duration-300">
          {name}
        </h4>
        <div className="mt-2 h-[2px] w-5 rounded-full bg-teal-100 group-hover:w-10 group-hover:bg-teal-500 transition-all duration-500" />
      </div>

      <Star
        className="w-3.5 h-3.5 shrink-0 text-sand-400 fill-sand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden
      />
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────
export default function BoardSection() {
  return (
    <section id="pembina" className="section-std relative overflow-hidden">
      <div
        className="absolute -top-32 -right-32 w-[480px] h-[480px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(176,220,220,0.35) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-[360px] h-[360px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(229,224,211,0.4) 0%, transparent 65%)",
        }}
      />

      <Container className="relative z-10">
        <div className="text-center mb-14 md:mb-18 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-50 border border-sand-200 text-teal-700 text-[0.65rem] font-bold uppercase tracking-[0.12em] mb-5 shadow-xs"
          >
            <Users className="w-3 h-3 shrink-0" strokeWidth={2} />
            <span>Struktur Organisasi</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
            className="section-title mb-4"
          >
            Dewan <span className="text-gradient-teal">Pembina</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
            className="section-subtitle max-w-xl mx-auto"
          >
            Dibimbing oleh para asatidz dan tokoh yang berpengalaman dalam
            membangun peradaban Islam melalui jalur pendidikan dan dakwah.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-4 max-w-5xl mx-auto">
          {BOARD_MEMBERS.map((member, idx) => (
            <MemberCard
              key={idx}
              name={member.name}
              image={member.image}
              index={idx}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
