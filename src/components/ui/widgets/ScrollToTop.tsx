"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility, { passive: true });
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        // Smooth scroll to top using native API (works with Lenis)
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        
        // Alternative: If using Lenis directly
        // if (typeof window !== 'undefined' && (window as any).lenis) {
        //     (window as any).lenis.scrollTo(0, { offset: 0 });
        // }
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-40 md:bottom-36 right-4 sm:right-6 z-50 p-3 bg-white text-brown-600 rounded-full shadow-clay-md border border-surface-200 hover:bg-brown-50 hover:text-brown-800 hover:scale-110 transition-all duration-300 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
                }`}
            aria-label="Scroll to top"
        >
            <ArrowUp size={20} strokeWidth={2.5} />
        </button>
    );
}
