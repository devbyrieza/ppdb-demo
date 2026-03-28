"use client";

import { useState, useEffect } from "react";
import { X, Clock, Zap } from "lucide-react";
import Link from "next/link";

// PPDB deadline: 30 Mei 2026
const DEADLINE = new Date("2026-05-30T23:59:59+07:00");

function getCountdown() {
    const now = new Date();
    const diff = DEADLINE.getTime() - now.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
}

export default function UrgencyBar() {
    const [visible, setVisible] = useState(true);
    const [countdown, setCountdown] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

    useEffect(() => {
        setCountdown(getCountdown());
        const t = setInterval(() => setCountdown(getCountdown()), 1000);
        return () => clearInterval(t);
    }, []);

    if (!visible || !countdown) return null;

    return (
        <div className="relative w-full bg-maroon-900 text-white overflow-hidden">
            {/* On mobile: 2-row layout. On sm+: single row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-y-1 gap-x-3 px-3 sm:px-8 py-1.5 sm:py-2">

                {/* Row 1 (mobile) / Left section (desktop): Badge + Countdown */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-maroon-200 whitespace-nowrap">
                            PPDB 2026/2027 Dibuka
                        </span>
                    </div>

                    {/* Countdown */}
                    <div className="flex items-center gap-1 sm:gap-1.5">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cream-400 shrink-0" />
                        <div className="flex items-center gap-0.5 font-display font-black text-[11px] sm:text-sm">
                            <div className="flex items-center gap-0.5">
                                <span className="bg-white/10 rounded px-1.5 py-0.5 tabular-nums">{String(countdown.days).padStart(2, "0")}</span>
                                <span className="text-maroon-300 text-[9px] sm:text-[10px]">h</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <span className="bg-white/10 rounded px-1.5 py-0.5 tabular-nums">{String(countdown.hours).padStart(2, "0")}</span>
                                <span className="text-maroon-300 text-[9px] sm:text-[10px]">j</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <span className="bg-white/10 rounded px-1.5 py-0.5 tabular-nums">{String(countdown.minutes).padStart(2, "0")}</span>
                                <span className="text-maroon-300 text-[9px] sm:text-[10px]">m</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <span className="bg-white/10 rounded px-1.5 py-0.5 tabular-nums">{String(countdown.seconds).padStart(2, "0")}</span>
                                <span className="text-maroon-300 text-[9px] sm:text-[10px]">d</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2 (mobile) / Right section (desktop): hint + CTA */}
                <div className="flex items-center gap-2">
                    <span className="text-[9px] sm:text-xs text-maroon-300 whitespace-nowrap">
                        lagi • Kuota terbatas
                    </span>

                    {/* CTA Button */}
                    <Link
                        href="/ppdb"
                        className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 rounded-full bg-cream-100 text-maroon-900 text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-white transition-colors whitespace-nowrap shrink-0 shadow-sm"
                    >
                        <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Sekarang
                    </Link>

                    {/* Dismiss button - mobile friendly, inline */}
                    <button
                        onClick={() => setVisible(false)}
                        className="sm:hidden text-maroon-400 hover:text-white transition-colors p-0.5"
                        aria-label="Tutup"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Dismiss button - desktop, absolute */}
            <button
                onClick={() => setVisible(false)}
                className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-maroon-400 hover:text-white transition-colors p-1"
                aria-label="Tutup"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
