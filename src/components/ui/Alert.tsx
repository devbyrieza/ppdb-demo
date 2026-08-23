// src/components/ui/alert.tsx
"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type AlertVariant = "success" | "error" | "warning" | "info";
export type AlertSize = "sm" | "md" | "lg";

export interface AlertProps {
  type?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  size?: AlertSize;
  accent?: boolean;
  filled?: boolean;
}

const variantConfig = {
  success: {
    container: "bg-[var(--color-success-50)] border-[var(--color-success-100)]",
    containerFilled:
      "bg-[var(--color-success-500)] border-transparent text-white",
    accent: "border-l-[var(--color-success-500)]",
    iconWrapper: "bg-[var(--color-success-100)]",
    iconWrapperFilled: "bg-white/20",
    icon: CheckCircle2,
    iconColor: "text-[var(--color-success-500)]",
    iconColorFilled: "text-white",
    titleColor: "text-[var(--color-success-500)]",
    titleColorFilled: "text-white",
    bodyColor: "text-[var(--color-success-500)]/80",
    bodyColorFilled: "text-white/90",
    dismissColor:
      "text-[var(--color-success-500)]/50 hover:text-[var(--color-success-500)] hover:bg-[var(--color-success-100)]",
    dismissColorFilled: "text-white/60 hover:text-white hover:bg-white/20" },
  error: {
    container: "bg-[var(--color-danger-50)] border-[var(--color-danger-100)]",
    containerFilled:
      "bg-[var(--color-danger-500)] border-transparent text-white",
    accent: "border-l-[var(--color-danger-500)]",
    iconWrapper: "bg-[var(--color-danger-100)]",
    iconWrapperFilled: "bg-white/20",
    icon: XCircle,
    iconColor: "text-[var(--color-danger-500)]",
    iconColorFilled: "text-white",
    titleColor: "text-[var(--color-danger-500)]",
    titleColorFilled: "text-white",
    bodyColor: "text-[var(--color-danger-500)]/80",
    bodyColorFilled: "text-white/90",
    dismissColor:
      "text-[var(--color-danger-500)]/50 hover:text-[var(--color-danger-500)] hover:bg-[var(--color-danger-100)]",
    dismissColorFilled: "text-white/60 hover:text-white hover:bg-white/20" },
  warning: {
    container: "bg-[var(--color-warning-50)] border-[var(--color-warning-100)]",
    containerFilled:
      "bg-[var(--color-warning-500)] border-transparent text-white",
    accent: "border-l-[var(--color-warning-500)]",
    iconWrapper: "bg-[var(--color-warning-100)]",
    iconWrapperFilled: "bg-white/20",
    icon: AlertTriangle,
    iconColor: "text-[var(--color-warning-500)]",
    iconColorFilled: "text-white",
    titleColor: "text-[var(--color-warning-500)]",
    titleColorFilled: "text-white",
    bodyColor: "text-[var(--color-warning-500)]/80",
    bodyColorFilled: "text-white/90",
    dismissColor:
      "text-[var(--color-warning-500)]/50 hover:text-[var(--color-warning-500)] hover:bg-[var(--color-warning-100)]",
    dismissColorFilled: "text-white/60 hover:text-white hover:bg-white/20" },
  // info → teal-tinted, konsisten dengan branding hijau teal template-demo
  info: {
    container: "bg-[var(--color-primary-50)] border-[var(--color-primary-100)]",
    containerFilled: "bg-[var(--color-primary-700)] border-transparent text-white",
    accent: "border-l-[var(--color-primary-600)]",
    iconWrapper: "bg-[var(--color-primary-100)]",
    iconWrapperFilled: "bg-white/20",
    icon: Info,
    iconColor: "text-[var(--color-primary-700)]",
    iconColorFilled: "text-white",
    titleColor: "text-[var(--color-primary-800)]",
    titleColorFilled: "text-white",
    bodyColor: "text-[var(--color-primary-700)]/80",
    bodyColorFilled: "text-white/90",
    dismissColor:
      "text-[var(--color-primary-600)]/50 hover:text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)]",
    dismissColorFilled: "text-white/60 hover:text-white hover:bg-white/20" } } as const;

const sizeConfig = {
  sm: {
    container: "p-3 gap-2.5 rounded-[var(--radius-md)]",
    iconWrapper: "w-7 h-7",
    icon: "w-3.5 h-3.5",
    title: "text-xs font-semibold tracking-[-0.01em]",
    body: "text-xs leading-relaxed",
    dismiss: "w-5 h-5",
    accentBorder: "border-l-[3px]" },
  md: {
    container: "p-4 gap-3 rounded-[var(--radius-lg)]",
    iconWrapper: "w-8 h-8",
    icon: "w-4 h-4",
    title: "text-sm font-semibold tracking-[-0.01em]",
    body: "text-sm leading-relaxed",
    dismiss: "w-6 h-6",
    accentBorder: "border-l-[3px]" },
  lg: {
    container: "p-5 gap-3.5 rounded-[var(--radius-xl)]",
    iconWrapper: "w-9 h-9",
    icon: "w-[18px] h-[18px]",
    title: "text-base font-semibold tracking-[-0.015em]",
    body: "text-sm leading-relaxed",
    dismiss: "w-6 h-6",
    accentBorder: "border-l-4" } } as const;

const alertMotion: Variants = {
  initial: { opacity: 0, y: -8, scale: 0.98, filter: "blur(2px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -6, scale: 0.97, filter: "blur(2px)" } };

export default function Alert({
  type = "info",
  title,
  children,
  className,
  dismissible = false,
  onDismiss,
  size = "md",
  accent = false,
  filled = false }: AlertProps) {
  const [visible, setVisible] = useState(true);
  const cfg = variantConfig[type];
  const sz = sizeConfig[size];
  const IconComponent = cfg.icon;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          aria-live="polite"
          variants={alertMotion}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex items-start border",
            sz.container,
            accent && !filled
              ? [
                  sz.accentBorder,
                  cfg.accent,
                  "border-t-0 border-r-0 border-b-0 rounded-l-none",
                ]
              : "",
            filled ? cfg.containerFilled : cfg.container,
            className,
          )}
        >
          <div
            className={cn(
              "shrink-0 flex items-center justify-center rounded-[var(--radius-sm)] transition-transform duration-200",
              sz.iconWrapper,
              filled ? cfg.iconWrapperFilled : cfg.iconWrapper,
            )}
          >
            <IconComponent
              className={cn(
                sz.icon,
                filled ? cfg.iconColorFilled : cfg.iconColor,
              )}
              strokeWidth={2}
            />
          </div>

          <div className="flex-1 min-w-0">
            {title && (
              <p
                className={cn(
                  sz.title,
                  "mb-0.5",
                  filled ? cfg.titleColorFilled : cfg.titleColor,
                )}
              >
                {title}
              </p>
            )}
            <div
              className={cn(
                sz.body,
                filled ? cfg.bodyColorFilled : cfg.bodyColor,
                "[&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium",
              )}
            >
              {children}
            </div>
          </div>

          {dismissible && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              aria-label="Tutup notifikasi"
              className={cn(
                "shrink-0 flex items-center justify-center rounded-[var(--radius-sm)] transition-all duration-150 ml-1 -mr-1 -mt-0.5",
                sz.dismiss,
                filled ? cfg.dismissColorFilled : cfg.dismissColor,
              )}
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AlertSuccess(props: Omit<AlertProps, "type">) {
  return <Alert {...props} type="success" />;
}
export function AlertError(props: Omit<AlertProps, "type">) {
  return <Alert {...props} type="error" />;
}
export function AlertWarning(props: Omit<AlertProps, "type">) {
  return <Alert {...props} type="warning" />;
}
export function AlertInfo(props: Omit<AlertProps, "type">) {
  return <Alert {...props} type="info" />;
}

interface InlineAlertProps {
  type?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

export function InlineAlert({
  type = "error",
  children,
  className }: InlineAlertProps) {
  const cfg = variantConfig[type];
  const IconComponent = cfg.icon;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium",
        cfg.iconColor,
        className,
      )}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
      <span>{children}</span>
    </motion.p>
  );
}

interface AlertBannerProps {
  type?: AlertVariant;
  children: React.ReactNode;
  dismissible?: boolean;
  className?: string;
}

export function AlertBanner({
  type = "warning",
  children,
  dismissible = true,
  className }: AlertBannerProps) {
  const [visible, setVisible] = useState(true);
  const cfg = variantConfig[type];
  const IconComponent = cfg.icon;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              "flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium",
              cfg.containerFilled,
              className,
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <IconComponent
                className="w-4 h-4 shrink-0 text-white"
                strokeWidth={2}
              />
              <span className="text-white/95 truncate">{children}</span>
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Tutup banner"
                className="shrink-0 text-white/60 hover:text-white transition-colors duration-150 rounded p-0.5 hover:bg-white/15"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
