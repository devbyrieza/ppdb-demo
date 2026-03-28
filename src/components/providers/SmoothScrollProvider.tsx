"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with smooth, inertia-based scrolling
    const lenis = new Lenis({
      // Core scrolling behavior - "smooth as butter"
      duration: 1.2, // Longer duration = smoother, more inertia

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

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      lenis.destroy();
    };
  }, []);

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
