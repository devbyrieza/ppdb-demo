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
      const lenis = (window as any).lenis;
      if (lenis) {
        // Langsung panggil stop dan kunci secara presisi di titik 0
        lenis.stop();
        lenis.scrollTo(0, { immediate: true, force: true, lock: true });
      }
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

        // Delay minimum 100ms menggunakan requestAnimationFrame persis sesuai instruksi
        setTimeout(() => {
          requestAnimationFrame(restoreScroll);
        }, 100);

        // Safety net untuk DOM yang butuh waktu lebih lama merender images/assets
        setTimeout(restoreScroll, 250);
        setTimeout(restoreScroll, 500);
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
