/**
 * 🎯 CTA BUTTON COMPONENTS
 * Reusable CTA buttons dengan conversion funnel strategy yang benar
 *
 * USAGE:
 * - Awareness Stage: <CTAInfoPPDB />
 * - Decision Stage: <CTADaftarSekarang />
 * - Consultation: <CTAKonsultasi />
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Phone, FileText, Clock, ArrowRight } from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AWARENESS STAGE - untuk Homepage, About, Features, dll
// User belum informed, perlu education first
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Primary CTA - Info PPDB (Soft, Educational)
 * Use in: Hero, About, Features, Gallery
 */
export function CTAInfoPPDB({
  size = "lg",
  variant = "primary",
  className = "",
  showUrgency = false,
}: {
  size?: "sm" | "lg" | "xl";
  variant?: "primary" | "outline";
  className?: string;
  showUrgency?: boolean;
}) {
  const sizeClasses = {
    sm: "px-6 py-2.5 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-lg",
  };

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className={`
          group shadow-lg hover:shadow-xl font-bold transition-all duration-300 hover:-translate-y-1
          ${
            variant === "primary"
              ? "bg-gradient-to-r from-[var(--color-brown-700)] to-[var(--color-brown-900)] hover:from-[var(--color-brown-800)] hover:to-[var(--color-brown-950)] text-white"
              : "border-2 border-[var(--color-brown-700)] text-[var(--color-brown-700)] hover:bg-[var(--color-brown-50)]"
          }
          ${sizeClasses[size]}
          ${className}
        `}
        asChild
      >
        <Link href="/ppdb" className="flex items-center justify-center gap-2">
          <FileText className="w-5 h-5" />
          <span>Pelajari PPDB 2027-2028</span>
        </Link>
      </Button>

      {showUrgency && (
        <p className="text-xs text-center text-[var(--color-text-500)]">
          Pendaftaran dibuka hingga{" "}
          <span className="font-bold text-[var(--color-gold-700)]">
            31 Maret 2026
          </span>
        </p>
      )}
    </div>
  );
}

/**
 * Alternative CTA - Lihat Syarat & Jadwal
 * Use in: About, Features
 */
export function CTASyaratJadwal({
  size = "lg",
  className = "",
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className={`
          group shadow-lg hover:shadow-xl font-bold transition-all duration-300 hover:-translate-y-1
          bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] 
          hover:from-[var(--color-primary-700)] hover:to-[var(--color-primary-800)] text-white
          ${size === "sm" ? "px-6 py-2.5 text-sm" : "px-8 py-4 text-base"}
          ${className}
        `}
        asChild
      >
        <Link
          href="/ppdb#syarat"
          className="flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          <span>Lihat Syarat & Jadwal</span>
        </Link>
      </Button>

      <p className="text-xs text-center text-[var(--color-text-500)]">
        <span className="font-bold text-[var(--color-gold-700)]">
          50 kuota tersisa
        </span>{" "}
        untuk tahun ajaran ini
      </p>
    </div>
  );
}

/**
 * Secondary CTA - Konsultasi Gratis
 * Use in: Hero, Navbar, Footer
 */
export function CTAKonsultasi({
  size = "lg",
  variant = "outline",
  className = "",
}: {
  size?: "sm" | "lg";
  variant?: "outline" | "soft";
  className?: string;
}) {
  return (
    <Button
      size="lg"
      variant={variant === "outline" ? "outline" : undefined}
      className={`
        group font-semibold transition-all duration-300 hover:-translate-y-1
        ${
          variant === "outline"
            ? "border-2 border-[var(--color-primary-600)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] shadow-md hover:shadow-lg"
            : "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)] shadow-sm hover:shadow-md"
        }
        ${size === "sm" ? "px-6 py-2.5 text-sm" : "px-8 py-4 text-base"}
        ${className}
      `}
      asChild
    >
      <Link href="/kontak" className="flex items-center justify-center gap-2">
        <Phone className="w-4 h-4" />
        <span>Konsultasi Gratis</span>
      </Link>
    </Button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DECISION STAGE - untuk PPDB Info Page ONLY!
// User sudah informed, siap untuk action
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Aggressive CTA - Daftar Sekarang (High Urgency)
 * ⚠️ ONLY use in /ppdb page! NOT in homepage!
 */
export function CTADaftarSekarang({
  size = "lg",
  showSparkles = true,
  urgencyMessage = "default",
  className = "",
}: {
  size?: "sm" | "lg" | "xl";
  showSparkles?: boolean;
  urgencyMessage?: "default" | "countdown" | "scarcity" | "none";
  className?: string;
}) {
  const sizeClasses = {
    sm: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-6 text-lg",
  };

  const urgencyMessages = {
    default: "Hanya tersisa 50 kuota untuk tahun ajaran 2027-2028",
    countdown: "Pendaftaran ditutup dalam 15 hari lagi!",
    scarcity: "50 dari 500 kuota sudah terisi - Buruan daftar!",
    none: null,
  };

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        className={`
          group relative shadow-xl hover:shadow-2xl font-bold transition-all duration-300 hover:-translate-y-1
          bg-gradient-to-r from-[var(--color-gold-500)] to-[var(--color-gold-600)] 
          hover:from-[var(--color-gold-600)] hover:to-[var(--color-gold-700)] 
          text-white animate-pulse hover:animate-none
          ${sizeClasses[size]}
          ${className}
        `}
        asChild
      >
        <Link href="/daftar" className="flex items-center justify-center gap-2">
          {showSparkles && <Sparkles className="w-5 h-5 animate-pulse" />}
          <span>Daftar Sekarang - Kuota Terbatas!</span>
        </Link>
      </Button>

      {urgencyMessage !== "none" && (
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-600)]">
          <Clock className="w-4 h-4 text-[var(--color-gold-600)]" />
          <span>
            <span className="font-bold text-[var(--color-gold-700)]">
              {urgencyMessages[urgencyMessage]}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Sticky Bottom CTA - untuk PPDB Page
 * Always visible di bottom screen
 */
export function CTAStickyDaftar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[var(--color-secondary-200)] shadow-2xl p-4 animate-fadeInUp">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--color-text-900)] mb-1">
            Sudah Siap Bergabung?
          </p>
          <p className="text-xs text-[var(--color-text-600)]">
            Hanya{" "}
            <span className="font-bold text-[var(--color-gold-700)]">
              50 kuota tersisa
            </span>{" "}
            - Jangan sampai kehabisan!
          </p>
        </div>

        <Button
          size="lg"
          className="shadow-xl hover:shadow-2xl font-bold transition-all duration-300 hover:scale-105 bg-gradient-gold text-white"
          asChild
        >
          <Link href="/daftar" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Daftar Sekarang
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NAVBAR SPECIFIC CTAs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Navbar Primary CTA - Compact version
 */
export function NavbarCTAPPDB() {
  return (
    <Button
      size="sm"
      className="shadow-md hover:shadow-xl shadow-gold text-white font-semibold transition-all duration-300 hover:-translate-y-1 bg-gradient-gold"
      asChild
    >
      <Link href="/ppdb" className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        Info PPDB 2026
      </Link>
    </Button>
  );
}

/**
 * Navbar Secondary CTA - Login
 */
export function NavbarCTALogin() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="font-semibold transition-all duration-300 hover:shadow-md shadow-sm"
      style={{
        borderColor: "var(--color-brown-700)",
        color: "var(--color-brown-700)",
      }}
      asChild
    >
      <Link href="/login">
        <i className="fas fa-lock mr-2" />
        Login
      </Link>
    </Button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOBILE SPECIFIC CTAs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Mobile Menu CTA - Full width version
 */
export function MobileCTAPPDB() {
  return (
    <div className="space-y-3">
      {/* Urgency Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-[var(--color-gold-50)] to-[var(--color-gold-100)] border border-[var(--color-gold-200)]">
        <Clock className="w-5 h-5 text-[var(--color-gold-600)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-[var(--color-text-900)] mb-1">
            Pendaftaran Ditutup 31 Maret 2026
          </p>
          <p className="text-xs text-[var(--color-text-600)]">
            Hanya tersisa{" "}
            <span className="font-bold text-[var(--color-gold-700)]">
              50 kuota
            </span>{" "}
            untuk tahun ajaran ini
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <Button
        size="sm"
        className="w-full text-white font-bold shadow-lg hover:shadow-xl shadow-gold bg-gradient-gold"
        asChild
      >
        <Link href="/ppdb" className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Pelajari PPDB 2026</span>
        </Link>
      </Button>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USAGE EXAMPLES & DOCUMENTATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * EXAMPLE USAGE IN HERO SECTION:
 *
 * import { CTAInfoPPDB, CTAKonsultasi } from "@/components/cta/CTAButtons";
 *
 * <div className="flex gap-4">
 *   <CTAInfoPPDB size="xl" showUrgency />
 *   <CTAKonsultasi size="lg" />
 * </div>
 */

/**
 * EXAMPLE USAGE IN ABOUT SECTION:
 *
 * import { CTASyaratJadwal } from "@/components/cta/CTAButtons";
 *
 * <CTASyaratJadwal size="lg" />
 */

/**
 * EXAMPLE USAGE IN PPDB INFO PAGE:
 *
 * import { CTADaftarSekarang, CTAStickyDaftar } from "@/components/cta/CTAButtons";
 *
 * // Multiple CTAs throughout page
 * <CTADaftarSekarang urgencyMessage="countdown" />
 *
 * // At bottom of page
 * <CTAStickyDaftar />
 */

/**
 * EXAMPLE USAGE IN NAVBAR:
 *
 * import { NavbarCTAPPDB, NavbarCTALogin } from "@/components/cta/CTAButtons";
 *
 * <div className="flex gap-3">
 *   <NavbarCTAPPDB />
 *   <NavbarCTALogin />
 * </div>
 */
