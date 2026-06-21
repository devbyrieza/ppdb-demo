// src/components/ui/InfiniteMarquee.tsx
// Infinite marquee strip — inspired by cekat.ai social proof strips
// Usage: <InfiniteMarquee items={[...]} speed="normal" />
"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeItem {
  text: string;
  icon?: React.ReactNode;
  prefix?: string;
}

interface InfiniteMarqueeProps {
  items: MarqueeItem[];
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
  itemClassName?: string;
  separator?: React.ReactNode;
  variant?: "light" | "dark" | "primary" | "transparent";
}

const SPEED_MAP = {
  slow: "40s",
  normal: "28s",
  fast: "18s",
};

export default function InfiniteMarquee({
  items,
  speed = "normal",
  direction = "left",
  pauseOnHover = true,
  className,
  itemClassName,
  separator,
  variant = "transparent",
}: InfiniteMarqueeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless loop (need at least 2 copies)
  const duplicated = [...items, ...items, ...items];

  const variantClasses = {
    light: "bg-white border-y border-surface-200",
    dark: "bg-primary-950 border-y border-white/10",
    primary: "bg-primary-50 border-y border-primary-100",
    transparent: "bg-transparent",
  };

  const itemVariantClasses = {
    light: "text-ink-600",
    dark: "text-white/70",
    primary: "text-primary-700",
    transparent: "text-ink-500",
  };

  const animDuration = SPEED_MAP[speed];
  const animDirection = direction === "right" ? "reverse" : "normal";

  return (
    <div
      className={cn(
        "relative overflow-hidden w-full",
        variantClasses[variant],
        className,
      )}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
    >
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background:
            variant === "dark"
              ? "linear-gradient(to right, var(--color-primary-950), transparent)"
              : variant === "primary"
                ? "linear-gradient(to right, var(--color-primary-50), transparent)"
                : "linear-gradient(to right, var(--color-white, #fff), transparent)",
        }}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background:
            variant === "dark"
              ? "linear-gradient(to left, var(--color-primary-950), transparent)"
              : variant === "primary"
                ? "linear-gradient(to left, var(--color-primary-50), transparent)"
                : "linear-gradient(to left, var(--color-white, #fff), transparent)",
        }}
      />

      {/* Marquee track */}
      <div
        ref={trackRef}
        className="flex items-center"
        style={{
          animation: `marquee-scroll ${animDuration} linear infinite ${animDirection}`,
          animationPlayState: isHovered ? "paused" : "running",
          width: "max-content",
        }}
      >
        {duplicated.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 px-6 py-4 whitespace-nowrap text-sm font-semibold tracking-wide transition-opacity duration-300",
              itemVariantClasses[variant],
              isHovered && "opacity-70",
              itemClassName,
            )}
          >
            {item.prefix && (
              <span className="text-[0.6rem] font-black uppercase tracking-[0.15em] opacity-50">
                {item.prefix}
              </span>
            )}
            {item.icon && (
              <span className="flex items-center shrink-0 opacity-60">
                {item.icon}
              </span>
            )}
            <span>{item.text}</span>
            {/* Separator */}
            <span className="ml-4 opacity-25 select-none">
              {separator ?? "·"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
