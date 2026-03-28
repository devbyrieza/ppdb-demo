"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number; // Lower = slower parallax effect
  direction?: "up" | "down";
  scale?: number;
  opacity?: boolean;
}

export default function ParallaxSection({
  children,
  className = "",
  speed = 0.3,
  direction = "up",
  scale = 1,
  opacity = false,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const { ref: inViewRef } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Combine refs
  useEffect(() => {
    if (ref.current) {
      inViewRef(ref.current);
    }
  }, [inViewRef]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const element = ref.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Check if element is in view
      const inView = rect.top < windowHeight && rect.bottom > 0;
      setIsVisible(inView);

      if (inView) {
        // Calculate parallax offset based on scroll position
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distanceFromCenter = elementCenter - viewportCenter;
        
        // Apply parallax effect
        const parallaxOffset = distanceFromCenter * speed;
        setOffset(direction === "up" ? -parallaxOffset : parallaxOffset);
      }
    };

    // Use RAF for smooth scrolling
    let rafId: number;
    const rafHandler = () => {
      handleScroll();
      rafId = requestAnimationFrame(rafHandler);
    };
    rafId = requestAnimationFrame(rafHandler);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [speed, direction]);

  const opacityStyle = opacity && isVisible
    ? { opacity: Math.min(1, Math.max(0, 1 - Math.abs(offset) / 300)) }
    : {};

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate3d(0, ${offset}px, 0) scale(${scale})`,
        willChange: "transform",
        transition: isVisible ? "none" : "transform 0.1s ease-out",
        ...opacityStyle,
      }}
    >
      {children}
    </div>
  );
}
