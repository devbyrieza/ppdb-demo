// src/components/ui/FloatingWhatsApp.tsx — UPGRADED
// Premium floating WhatsApp button — inspired by cekat.ai's CTA floating elements
// Features: double pulse ring, smooth spring animation, tooltip, backdrop blur
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { BRANDING } from "@/config/branding";

const WA_NUMBER = "6288809934970";
const WA_MESSAGE = `Assalamu'alaikum, saya ingin bertanya tentang PPDB ${BRANDING.schoolName} Tahun Ajaran 2026/2027.`;

const SPRING = { type: "spring", stiffness: 400, damping: 28 } as const;

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show tooltip after 5 seconds
    const t = setTimeout(() => setShowTooltip(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // Auto-hide tooltip after 8 seconds
  useEffect(() => {
    if (!showTooltip) return;
    const t = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(t);
  }, [showTooltip]);

  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-5 sm:right-6 z-50 flex flex-col items-end gap-3">
      {/* ── Tooltip Bubble ── */}
      <AnimatePresence>
        {showTooltip && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92, transition: { duration: 0.2 } }}
            transition={SPRING}
            className="relative bg-white rounded-2xl border border-surface-100 px-4 py-3 max-w-[200px] sm:max-w-[220px]"
            style={{
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full text-ink-400 hover:text-ink-700 hover:bg-surface-100 transition-all duration-150"
              aria-label="Tutup"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Online indicator */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              <span className="text-[0.625rem] font-bold text-green-600 uppercase tracking-widest">
                Online sekarang
              </span>
            </div>

            <p className="text-[0.75rem] font-bold text-ink-800 leading-snug pr-3">
              Ada pertanyaan seputar PPDB? Chat kami! 😊
            </p>
            <p className="text-[0.65rem] text-ink-500 mt-1">
              Biasanya membalas dalam beberapa menit
            </p>

            {/* Arrow pointer */}
            <div
              className="absolute -bottom-2 right-5 w-4 h-4 bg-white border-r border-b border-surface-100 rotate-45"
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WA Button ── */}
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp"
        className="relative flex items-center justify-center w-[3.5rem] h-[3.5rem] rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...SPRING, delay: 1.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          setShowTooltip(false);
          setDismissed(true);
        }}
        style={{
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          boxShadow:
            "0 4px 20px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        {/* Pulse rings — double layer */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ backgroundColor: "#25D366" }}
          aria-hidden
        />
        <span
          className="absolute inset-[-6px] rounded-full animate-ping opacity-15"
          style={{
            backgroundColor: "#25D366",
            animationDelay: "0.4s",
            animationDuration: "2s",
          }}
          aria-hidden
        />

        {/* WhatsApp SVG icon */}
        <svg
          viewBox="0 0 24 24"
          className="relative z-10 w-7 h-7"
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
          aria-hidden
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.12 1.531 5.847L.056 23.447a.5.5 0 0 0 .614.614l5.607-1.474A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 0 1-5.077-1.387l-.364-.214-3.767.989.99-3.757-.234-.381A9.95 9.95 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </motion.a>
    </div>
  );
}
