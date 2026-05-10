"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function useScrollRestoration() {
  const pathname = usePathname();
  const isPopState = useRef(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const handlePopState = () => {
      isPopState.current = true;
      // Keep flag active but don't force scroll here, let the effect hook restore position.
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const handleScroll = (e: any) => {
      // Gunakan posisi virtual langsung dari Lenis agar sinkron
      sessionStorage.setItem(`scroll-pos-${pathname}`, e.scroll.toString());
    };

    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.on("scroll", handleScroll);
    } else {
      // Fallback
      window.addEventListener(
        "scroll",
        () => {
          sessionStorage.setItem(
            `scroll-pos-${pathname}`,
            window.scrollY.toString(),
          );
        },
        { passive: true },
      );
    }

    if (isPopState.current) {
      const savedScroll = sessionStorage.getItem(`scroll-pos-${pathname}`);
      if (savedScroll !== null) {
        const restoreScroll = () => {
          const lenisInstance = (window as any).lenis;
          const pos = parseInt(savedScroll, 10);

          if (lenisInstance) {
            lenisInstance.start();
            lenisInstance.scrollTo(pos, {
              immediate: true,
              force: true,
              lock: true,
            });
          } else {
            window.scrollTo({
              top: pos,
              behavior: "instant",
            });
          }
        };

        // Smart firing tailored to PageTransition duration
        setTimeout(restoreScroll, 50);  // Ultra fast attempt
        setTimeout(restoreScroll, 450); // Post-transition arrival
        setTimeout(restoreScroll, 850); // Solid final fallback catch
      }
      isPopState.current = false;
    }

    return () => {
      if (lenis) {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", () => {
          sessionStorage.setItem(
            `scroll-pos-${pathname}`,
            window.scrollY.toString(),
          );
        });
      }
    };
  }, [pathname]);
}
