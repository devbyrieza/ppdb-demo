import * as React from "react";
import { cn } from "@/lib/utils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTAINER COMPONENT
// Responsive max-width wrapper untuk semua section
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size variant of the container
   * - sm: max-w-4xl (768px)
   * - md: max-w-6xl (1152px)
   * - lg: max-w-7xl (1280px)
   * - full: w-full (no max-width)
   */
  size?: "sm" | "md" | "lg" | "full";
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "lg", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full px-4 sm:px-6 lg:px-8",
          {
            "max-w-4xl": size === "sm",
            "max-w-6xl": size === "md",
            "max-w-7xl": size === "lg",
            "max-w-full": size === "full",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };
