"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Lenis with smooth, inertia-based scrolling
    const lenis = new Lenis({
      // Core scrolling behavior - cukup smooth, tetap responsif
      duration: 0.8, // Dikurangi dari 1.2 agar tidak terasa lambat

      // Smoothness settings
      smoothWheel: true,

      // Advanced settings
      infinite: false,
    });

    // Expose lenis instance globally for custom hooks (like scrollRestoration)
    (window as any).lenis = lenis;

    // Store reference
    lenisRef.current = lenis;

    // Request Animation Frame loop
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Handle resize
    const handleResize = () => {
      lenis.resize();
    };
    window.addEventListener("resize", handleResize);

    // Bulletproof Auto-Resize: Listen to document height changes (dynamic loads, images, hydration)
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    // Delayed initial resize to ensure hydration layout is complete
    const initialResizeTimeout = setTimeout(() => {
      lenis.resize();
    }, 150);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      clearTimeout(initialResizeTimeout);
      lenis.destroy();
    };
  }, []);

  // Force recalculation when navigating between pages (route transitions)
  useEffect(() => {
    const lenis = lenisRef.current;
    if (lenis) {
      const navigationTimeout = setTimeout(() => {
        lenis.resize();
      }, 100);
      return () => clearTimeout(navigationTimeout);
    }
  }, [pathname]);

  return (
    <>
      <style jsx global>{`
        html.lenis,
        html.lenis body {
          height: auto;
        }

        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }

        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }

        .lenis.lenis-stopped {
          overflow: hidden;
        }

        .lenis.lenis-scrolling iframe {
          pointer-events: none;
        }
      `}</style>
      {children}
    </>
  );
}
