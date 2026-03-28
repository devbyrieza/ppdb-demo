"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const WA_NUMBER = "6285111524441";
const WA_MESSAGE = "Assalamu'alaikum, saya ingin bertanya tentang PPDB Al-Andalus Al-Imam Tahun Ajaran 2026/2027.";

export default function FloatingWhatsApp() {
    const [showTooltip, setShowTooltip] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Show tooltip after 4 seconds
        const t = setTimeout(() => setShowTooltip(true), 4000);
        return () => clearTimeout(t);
    }, []);

    const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && !dismissed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="relative bg-white rounded-2xl shadow-premium-xl border border-surface-100 p-4 max-w-[220px]"
                    >
                        <button
                            onClick={() => setDismissed(true)}
                            className="absolute top-2 right-2 text-ink-400 hover:text-ink-700 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-xs font-bold text-ink-700 leading-relaxed pr-4">
                            Ada pertanyaan tentang PPDB? Chat kami sekarang! 😊
                        </p>
                        {/* Arrow */}
                        <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white border-r border-b border-surface-100 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* WA Button */}
            <motion.a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-premium-xl hover:shadow-premium-2xl transition-all duration-300"
                style={{ backgroundColor: "#25D366" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTooltip(false)}
            >
                {/* WhatsApp SVG logo */}
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.12 1.531 5.847L.056 23.447a.5.5 0 0 0 .614.614l5.607-1.474A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 0 1-5.077-1.387l-.364-.214-3.767.989.99-3.757-.234-.381A9.95 9.95 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>

                {/* Pulse ring */}
                <span className="absolute w-14 h-14 rounded-full animate-ping opacity-20" style={{ backgroundColor: "#25D366" }} />
            </motion.a>
        </div>
    );
}
