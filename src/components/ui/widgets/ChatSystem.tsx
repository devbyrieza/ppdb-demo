"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Bot, Headphones, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AiChatWidget from "./AiChatWidget";

export default function ChatSystem() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Initial tooltip logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTooltip(true);
        }, 3000);

        const hideTimer = setTimeout(() => {
            setShowTooltip(false);
        }, 12000);

        return () => {
            clearTimeout(timer);
            clearTimeout(hideTimer);
        };
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const openTawkTo = () => {
        setIsMenuOpen(false);

        // Retry mechanism: wait up to 3s for Tawk_API to be ready
        const tryOpenTawk = (attempts = 0) => {
            if (
                window.Tawk_API &&
                typeof window.Tawk_API.maximize === "function"
            ) {
                window.Tawk_API.showWidget();
                window.Tawk_API.maximize();
            } else if (attempts < 10) {
                setTimeout(() => tryOpenTawk(attempts + 1), 300);
            } else {
                // Fallback after 3s: open in new tab
                window.open(
                    "https://tawk.to/chat/69997c299d60291c30387e88/default",
                    "_blank"
                );
            }
        };

        tryOpenTawk();
    };

    const openWhatsApp = () => {
        const waNumber = "6285111524441";
        const waMessage = encodeURIComponent("Halo Panitia PPDB Pesantren Al-Andalus Al-Imam, saya ingin bertanya...");
        window.open(`https://wa.me/${waNumber}?text=${waMessage}`, "_blank");
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* Background Overlay (Mobile only when AI chat is open) */}
            <AnimatePresence>
                {isAiOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm z-9990 md:hidden"
                        onClick={() => setIsAiOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main Container */}
            <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-9999 flex flex-col items-end" ref={menuRef}>

                {/* AI Chat Widget */}
                <AnimatePresence>
                    {isAiOpen && (
                        <AiChatWidget
                            onClose={() => setIsAiOpen(false)}
                            onEscalate={openTawkTo}
                        />
                    )}
                </AnimatePresence>

                {/* Popup Menu */}
                <AnimatePresence>
                    {isMenuOpen && !isAiOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-premium-2xl border border-surface-100 p-2 mb-4 w-[280px] overflow-hidden"
                            style={{ transformOrigin: "bottom right" }}
                        >
                            <div className="px-3 pb-3 pt-2 mb-2 border-b border-surface-100 flex items-center justify-between">
                                <span className="text-[11px] font-black text-ink-500 uppercase tracking-widest px-1">Pilih Bantuan</span>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-1.5 hover:bg-surface-50 rounded-full transition-colors text-ink-400 hover:text-ink-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        setIsAiOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-maroon-50 rounded-xl transition-colors group text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-maroon-100 flex items-center justify-center shrink-0 group-hover:bg-maroon-600 transition-colors">
                                        <Bot className="w-5 h-5 text-maroon-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ink-900 group-hover:text-maroon-800 text-sm mb-0.5">💬 Tanya AI Assistant</h4>
                                        <p className="text-[11px] text-ink-500 font-medium">Bantuan cepat informasi PPDB 24/7</p>
                                    </div>
                                </button>

                                <button
                                    onClick={openTawkTo}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-teal-50 rounded-xl transition-colors group text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-600 transition-colors">
                                        <Headphones className="w-5 h-5 text-teal-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ink-900 group-hover:text-teal-800 text-sm mb-0.5">🎧 Live Chat CS</h4>
                                        <p className="text-[11px] text-ink-500 font-medium">Chat langsung dengan panitia</p>
                                    </div>
                                </button>

                                <button
                                    onClick={openWhatsApp}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl transition-colors group text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366] transition-colors">
                                        <MessageSquare className="w-5 h-5 text-[#25D366] group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-ink-900 group-hover:text-green-800 text-sm mb-0.5">📱 WhatsApp CS</h4>
                                        <p className="text-[11px] text-ink-500 font-medium">Hubungi via aplikasi WhatsApp</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-end gap-3 z-50">
                    {/* Tooltip */}
                    <AnimatePresence>
                        {showTooltip && !isMenuOpen && !isAiOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                className="bg-white px-4 py-3 rounded-2xl shadow-premium-lg border border-surface-100 items-center gap-3 mb-2 max-w-[220px] relative hidden md:flex"
                            >
                                <div className="flex-1">
                                    <p className="text-[13px] font-black text-ink-950 leading-tight mb-1">Butuh Bantuan?</p>
                                    <p className="text-[10px] text-ink-500 font-medium leading-tight">Chat AI kami atau hubungi CS langsung</p>
                                </div>
                                <button
                                    onClick={() => setShowTooltip(false)}
                                    className="p-1 hover:bg-surface-50 rounded-full transition-colors self-start -mt-1 -mr-1"
                                >
                                    <X className="w-3 h-3 text-ink-400" />
                                </button>
                                {/* Carrot */}
                                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-surface-100 transform rotate-45" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Floating Button */}
                    <AnimatePresence>
                        {!isAiOpen && (
                            <motion.button
                                onClick={() => {
                                    setIsMenuOpen(!isMenuOpen);
                                    setShowTooltip(false);
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-[60px] h-[60px] md:w-16 md:h-16 bg-maroon-700 text-white rounded-[1.2rem] md:rounded-[1.3rem] flex items-center justify-center shadow-[0_10px_30px_rgba(115,84,56,0.5)] relative transition-all duration-300"
                            >
                                {/* Pulse Effect */}
                                <span className="absolute inset-0 rounded-[1.2rem] md:rounded-[1.3rem] bg-maroon-700/40 animate-ping" style={{ animationDuration: '3s' }} />

                                <div className="relative z-10 w-full h-full flex items-center justify-center bg-maroon-700 rounded-[1.2rem] md:rounded-[1.3rem] border-2 border-maroon-600/50">
                                    {isMenuOpen ? (
                                        <X className="w-8 h-8 md:w-9 md:h-9" />
                                    ) : (
                                        <MessageCircle className="w-8 h-8 md:w-9 md:h-9" />
                                    )}
                                </div>

                                {/* Notification Badge */}
                                {!isMenuOpen && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-20">
                                        1
                                    </span>
                                )}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}
