"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function FloatingCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Tampilkan setelah scroll melewati 400px (hero section)
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-primary/10 rounded-full p-2 flex items-center gap-2 pointer-events-auto">
            <a
              href="https://spmb.pesantren-alimam.com/daftar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-[#fdf8f0] bg-gradient-to-r from-primary to-primary-dark shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.2)] hover:shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.3),_0_8px_20px_-4px_rgba(85,0,0,0.4)] hover:-translate-y-1 transition-all duration-300"
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            
            <a
              href="https://wa.me/6285111524441"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hubungi via WhatsApp"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 shadow-[inset_0_0_0_1.5px_rgba(16,185,129,0.3)] hover:bg-emerald-500 hover:text-white hover:shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.3),_0_8px_16px_-4px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
