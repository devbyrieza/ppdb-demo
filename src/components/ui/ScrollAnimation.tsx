"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  viewport?: {
    once?: boolean;
    margin?: string;
    amount?: number | "some" | "all";
  };
  stagger?: number;
  staggerChildren?: boolean;
}

export default function ScrollAnimation({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.7,
  viewport = { once: true, margin: "-20%", amount: "some" },
  stagger = 0.1,
  staggerChildren = false,
}: ScrollAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  // Premium easing curve - "smooth as butter"
  const easeOutExpo = [0.16, 1, 0.3, 1] as const; // Custom cubic-bezier for premium feel

  const getVariants = (): Variants => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
    }

    const variants = {
      hidden: {
        opacity: 0,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(10px)",
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
          duration,
          delay,
          ease: easeOutExpo,
        },
      },
    };

    switch (direction) {
      case "up":
        variants.hidden.y = 60;
        break;
      case "down":
        variants.hidden.y = -60;
        break;
      case "left":
        variants.hidden.x = -60;
        break;
      case "right":
        variants.hidden.x = 60;
        break;
      case "none":
      default:
        break;
    }

    return variants;
  };

  // Stagger container for child elements
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(5px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: easeOutExpo,
      },
    },
  };

  if (staggerChildren) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={containerVariants}
        className={className}
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <motion.div
                key={index}
                variants={childVariants}
                className="contents"
              >
                {child}
              </motion.div>
            ))
          : children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
}
