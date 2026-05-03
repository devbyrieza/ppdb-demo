"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BUTTON — Al-Andalus Template (Master)
   Primary: Hijau Army  |  Accent: Gold + Warm
   Token dari globals.css al-andalus:

   ARMY  (Template default — primary identity)
   · --shadow-army, --shadow-army-lg
   · --color-army-*, --color-warm-*

   GOLD / WARM (Accent premium)
   · --shadow-gold, --shadow-gold-lg, --shadow-warm
   · --color-gold-*, --color-warm-*

   MAROON / BLUE (backward compat aliases)
   · --shadow-maroon, --shadow-maroon-lg
   · --shadow-blue, --shadow-blue-lg
   · --color-maroon-*, --color-cream-*
   · --color-brand-blue-*, --color-brand-yellow-*

   SHARED
   · --radius-full, --radius-md, --radius-lg
   · --ease-spring, --ease-smooth
   · --duration-fast, --duration-base
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const buttonVariants = cva(
  /* ─── Base — berlaku semua variant ─── */
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-sans font-semibold tracking-[-0.01em]",
    "select-none cursor-pointer",
    "transition-all",
    "duration-[var(--duration-base)]",
    "[transition-timing-function:var(--ease-spring)]",
    /* Focus ring — army sebagai default template */
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--color-army-600)]",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--color-surface-50)]",
    /* Disabled */
    "disabled:pointer-events-none disabled:opacity-45",
    /* Active scale global */
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ════════════════════════════════════
           ARMY GROUP — Template Default
           (Al-Andalus primary identity)
           ════════════════════════════════════ */

        /* ─── PRIMARY ARMY ─── */
        primary: [
          "relative overflow-hidden",
          "bg-gradient-to-br from-[var(--color-army-600)] to-[var(--color-army-900)]",
          "text-[var(--color-warm-100)]",
          "[box-shadow:var(--shadow-army)]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-white/[0.10] before:to-transparent",
          "before:pointer-events-none",
          "hover:-translate-y-[2px]",
          "hover:[box-shadow:var(--shadow-army-lg)]",
          "hover:brightness-[1.08]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── SECONDARY ARMY ─── */
        secondary: [
          "bg-[var(--color-white)]",
          "text-[var(--color-army-700)]",
          "border border-[var(--color-army-200)]",
          "[box-shadow:var(--shadow-xs)]",
          "hover:bg-[var(--color-army-50)]",
          "hover:border-[var(--color-army-400)]",
          "hover:[box-shadow:var(--shadow-sm)]",
          "hover:-translate-y-[1px]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── OUTLINE ARMY ─── */
        outline: [
          "bg-transparent",
          "text-[var(--color-army-700)]",
          "border-[1.5px] border-[var(--color-army-300)]",
          "hover:bg-[var(--color-army-900)]",
          "hover:text-[var(--color-warm-100)]",
          "hover:border-[var(--color-army-900)]",
          "hover:[box-shadow:var(--shadow-army)]",
          "hover:-translate-y-[1px]",
          "active:translate-y-0",
        ].join(" "),

        /* ════════════════════════════════════
           MAROON GROUP — Al-Imam variant
           ════════════════════════════════════ */

        /* ─── PRIMARY MAROON ─── */
        "primary-maroon": [
          "relative overflow-hidden",
          "bg-gradient-to-br from-[var(--color-maroon-700)] to-[var(--color-maroon-950)]",
          "text-[var(--color-cream-100)]",
          "[box-shadow:var(--shadow-maroon)]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-white/[0.10] before:to-transparent",
          "before:pointer-events-none",
          "hover:-translate-y-[2px]",
          "hover:[box-shadow:var(--shadow-maroon-lg)]",
          "hover:brightness-[1.07]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── SECONDARY MAROON ─── */
        "secondary-maroon": [
          "bg-[var(--color-white)]",
          "text-[var(--color-maroon-800)]",
          "border border-[var(--color-maroon-200)]",
          "[box-shadow:var(--shadow-xs)]",
          "hover:bg-[var(--color-maroon-50)]",
          "hover:border-[var(--color-maroon-400)]",
          "hover:[box-shadow:var(--shadow-sm)]",
          "hover:-translate-y-[1px]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── OUTLINE MAROON ─── */
        "outline-maroon": [
          "bg-transparent",
          "text-[var(--color-maroon-700)]",
          "border-[1.5px] border-[var(--color-maroon-300)]",
          "hover:bg-[var(--color-maroon-950)]",
          "hover:text-[var(--color-cream-100)]",
          "hover:border-[var(--color-maroon-950)]",
          "hover:[box-shadow:var(--shadow-maroon)]",
          "hover:-translate-y-[1px]",
          "active:translate-y-0",
        ].join(" "),

        /* ════════════════════════════════════
           BLUE GROUP — Ulul Albaab variant
           (backward compat)
           ════════════════════════════════════ */

        /* ─── PRIMARY BLUE ─── */
        "primary-blue": [
          "relative overflow-hidden",
          "bg-gradient-to-br from-[var(--color-brand-blue-500)] to-[var(--color-brand-blue-800)]",
          "text-white",
          "[box-shadow:var(--shadow-blue)]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-white/[0.12] before:to-transparent",
          "before:pointer-events-none",
          "hover:-translate-y-[2px]",
          "hover:[box-shadow:var(--shadow-blue-lg)]",
          "hover:brightness-[1.08]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── SECONDARY BLUE ─── */
        "secondary-blue": [
          "bg-[var(--color-white)]",
          "text-[var(--color-brand-blue-700)]",
          "border border-[var(--color-brand-blue-200)]",
          "[box-shadow:var(--shadow-xs)]",
          "hover:bg-[var(--color-brand-blue-50)]",
          "hover:border-[var(--color-brand-blue-400)]",
          "hover:[box-shadow:var(--shadow-sm)]",
          "hover:-translate-y-[1px]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── OUTLINE BLUE ─── */
        "outline-blue": [
          "bg-transparent",
          "text-[var(--color-brand-blue-600)]",
          "border-[1.5px] border-[var(--color-brand-blue-300)]",
          "hover:bg-[var(--color-brand-blue-800)]",
          "hover:text-white",
          "hover:border-[var(--color-brand-blue-800)]",
          "hover:[box-shadow:var(--shadow-blue)]",
          "hover:-translate-y-[1px]",
          "active:translate-y-0",
        ].join(" "),

        /* ════════════════════════════════════
           ACCENT GROUP — Shared semua brand
           ════════════════════════════════════ */

        /* ─── GOLD — Premium, semua brand ─── */
        gold: [
          "relative overflow-hidden",
          "bg-gradient-to-br from-[var(--color-gold-300)] to-[var(--color-gold-500)]",
          "text-[var(--color-army-950)]",
          "[box-shadow:var(--shadow-gold)]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-white/20 before:to-transparent",
          "before:pointer-events-none",
          "hover:-translate-y-[2px]",
          "hover:brightness-[1.05]",
          "hover:[box-shadow:var(--shadow-gold-lg)]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── WARM — Krem hangat accent ─── */
        warm: [
          "relative overflow-hidden",
          "bg-gradient-to-br from-[var(--color-warm-200)] to-[var(--color-warm-400)]",
          "text-[var(--color-army-900)]",
          "border border-[var(--color-warm-400)]",
          "[box-shadow:var(--shadow-warm)]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-white/20 before:to-transparent",
          "before:pointer-events-none",
          "hover:-translate-y-[2px]",
          "hover:brightness-[1.04]",
          "hover:[box-shadow:0_8px_24px_-4px_rgba(226,181,85,0.45)]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── YELLOW — Ulul Albaab accent (alias warm) ─── */
        yellow: [
          "relative overflow-hidden",
          "bg-gradient-to-br from-[var(--color-brand-yellow-300)] to-[var(--color-brand-yellow-500)]",
          "text-[var(--color-brand-blue-900)]",
          "[box-shadow:var(--shadow-yellow)]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-white/20 before:to-transparent",
          "before:pointer-events-none",
          "hover:-translate-y-[2px]",
          "hover:brightness-[1.06]",
          "hover:[box-shadow:var(--shadow-yellow-lg)]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── CREAM — Al-Imam accent ─── */
        cream: [
          "relative overflow-hidden",
          "bg-gradient-to-br from-[var(--color-cream-200)] to-[var(--color-cream-400)]",
          "text-[var(--color-maroon-900)]",
          "border border-[var(--color-cream-400)]",
          "[box-shadow:var(--shadow-cream)]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-white/20 before:to-transparent",
          "before:pointer-events-none",
          "hover:-translate-y-[2px]",
          "hover:brightness-[1.04]",
          "hover:[box-shadow:0_8px_24px_-4px_rgba(228,193,111,0.45)]",
          "active:translate-y-0",
        ].join(" "),

        /* ════════════════════════════════════
           NEUTRAL GROUP — Semua brand
           ════════════════════════════════════ */

        /* ─── GHOST ─── */
        ghost: [
          "bg-transparent",
          "text-[var(--color-ink-600)]",
          "border border-transparent",
          "hover:bg-[var(--color-army-50)]",
          "hover:text-[var(--color-army-800)]",
          "hover:border-[var(--color-army-100)]",
          "[transition-timing-function:var(--ease-smooth)]",
          "duration-[var(--duration-fast)]",
        ].join(" "),

        /* ─── DANGER ─── */
        danger: [
          "bg-[var(--color-danger-500)]",
          "text-white",
          "[box-shadow:0_4px_14px_-2px_rgba(220,38,38,0.28),0_2px_6px_rgba(0,0,0,0.06)]",
          "hover:brightness-[1.08]",
          "hover:-translate-y-[2px]",
          "hover:[box-shadow:0_8px_24px_-4px_rgba(220,38,38,0.38)]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── LINK — Inline text, army default ─── */
        link: [
          "bg-transparent p-0 h-auto",
          "text-[var(--color-army-700)]",
          "font-medium underline-offset-4",
          "hover:underline hover:text-[var(--color-army-900)]",
          "[transition-timing-function:var(--ease-smooth)]",
          "duration-[var(--duration-fast)]",
          "active:scale-100",
        ].join(" "),

        /* ─── LINK MAROON — Inline text, Al-Imam ─── */
        "link-maroon": [
          "bg-transparent p-0 h-auto",
          "text-[var(--color-maroon-700)]",
          "font-medium underline-offset-4",
          "hover:underline hover:text-[var(--color-maroon-950)]",
          "[transition-timing-function:var(--ease-smooth)]",
          "duration-[var(--duration-fast)]",
          "active:scale-100",
        ].join(" "),

        /* ─── LINK BLUE — Inline text, Ulul Albaab ─── */
        "link-blue": [
          "bg-transparent p-0 h-auto",
          "text-[var(--color-brand-blue-600)]",
          "font-medium underline-offset-4",
          "hover:underline hover:text-[var(--color-brand-blue-900)]",
          "[transition-timing-function:var(--ease-smooth)]",
          "duration-[var(--duration-fast)]",
          "active:scale-100",
        ].join(" "),
      },

      size: {
        xs: "h-8 px-3 text-xs rounded-[var(--radius-md)]",
        sm: "h-9 px-4 text-[0.8125rem] rounded-[var(--radius-full)]",
        md: "h-11 px-6 text-[0.9375rem] rounded-[var(--radius-full)]",
        lg: "h-12 px-8 text-base rounded-[var(--radius-full)]",
        xl: "h-14 px-10 text-lg rounded-[var(--radius-full)]",
        icon: "h-10 w-10 rounded-[var(--radius-md)] p-0",
        "icon-sm": "h-8 w-8 rounded-[var(--radius-md)] p-0",
        "icon-lg": "h-12 w-12 rounded-[var(--radius-lg)] p-0",
      },

      fullWidth: {
        true: "w-full",
      },

      loading: {
        true: "pointer-events-none",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SPINNER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  /** Render sebagai child element (mis. Link dari Next.js) */
  asChild?: boolean;
  /** Tampilkan spinner + disable pointer events */
  isLoading?: boolean;
  /** Label aksesibilitas saat loading */
  loadingText?: string;
  /** Icon di sisi kiri konten */
  leftIcon?: React.ReactNode;
  /** Icon di sisi kanan konten */
  rightIcon?: React.ReactNode;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const computedClass = cn(
      buttonVariants({ variant, size, fullWidth, loading: isLoading, className })
    );

    const content = (
      <>
        {isLoading ? (
          <Spinner />
        ) : leftIcon ? (
          <span className="shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">
            {leftIcon}
          </span>
        ) : null}

        {isLoading && loadingText ? (
          <span>{loadingText}</span>
        ) : isLoading ? (
          <span className="sr-only">Memuat…</span>
        ) : (
          children
        )}

        {!isLoading && rightIcon ? (
          <span className="shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">
            {rightIcon}
          </span>
        ) : null}
      </>
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<Record<string, unknown>>,
        { className: computedClass, ref, ...props }
      );
    }

    return (
      <button
        ref={ref}
        className={computedClass}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };