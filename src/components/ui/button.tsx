import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-brown-600 to-brown-700 text-white shadow-lg shadow-brown-900/10 hover:from-brown-700 hover:to-brown-800 hover:shadow-xl hover:shadow-brown-900/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        secondary:
          "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md hover:from-teal-600 hover:to-teal-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]",
        accent:
          "bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-md hover:from-gold-600 hover:to-gold-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]",
        outline:
          "border-2 border-brown-600 text-brown-600 bg-white hover:bg-brown-50 hover:border-brown-700 hover:text-brown-700 hover:-translate-y-0.5 active:scale-[0.98]",
        ghost: "text-ink-600 hover:bg-surface-100 hover:text-ink-900",
        link: "text-brown-600 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props,
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
