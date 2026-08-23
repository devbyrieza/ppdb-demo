// src/components/ui/ScrollProgressBar.tsx
// Thin scroll progress bar at top of page — inspired by cekat.ai & modern SaaS sites
"use client";

import { useEffect, useState } from "react";

interface ScrollProgressBarProps {
  /** Height of the bar in px (default: 2) */
  height?: number;
  /** z-index (default: 100) */
  zIndex?: number;
}

export default function ScrollProgressBar({
  height = 2,
  zIndex = 100 }: ScrollProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setProgress(pct);
    };

    window.addEventListener("scroll", update, { passive: true });
    update(); // Initial call
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        zIndex,
        pointerEvents: "none" }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, var(--color-primary-500, #14b8a6) 0%, var(--color-secondary-400, #fbbf24) 100%)",
          transition: "width 0.1s linear",
          borderRadius: "0 999px 999px 0" }}
      />
    </div>
  );
}
