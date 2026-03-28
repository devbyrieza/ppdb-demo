import * as React from "react";
import { cn } from "@/lib/utils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION COMPONENT
// Wrapper untuk semua section homepage dengan consistent spacing
// PENTING: Section HANYA handle vertical spacing (py-*)
//          Horizontal padding/margin di-handle oleh Container component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Vertical spacing only (no horizontal padding!)
   * - sm: py-12 md:py-16
   * - md: py-16 md:py-20
   * - lg: py-20 md:py-28
   */
  spacing?: "sm" | "md" | "lg";
  /**
   * Background variant
   */
  background?: "white" | "gray" | "gradient" | "green" | "transparent";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      spacing = "md",
      background = "transparent",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          // ✅ ONLY VERTICAL SPACING - NO HORIZONTAL PADDING!
          {
            "py-12 md:py-16": spacing === "sm",
            "py-16 md:py-20": spacing === "md",
            "py-20 md:py-28": spacing === "lg",
          },
          // Background
          {
            "bg-white": background === "white",
            "bg-surface-50": background === "gray",
            "bg-gradient-islamic": background === "gradient",
            "bg-green-50": background === "green",
            "bg-transparent": background === "transparent",
          },
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section };
