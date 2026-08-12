"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, GraduationCap, ChevronDown, BookOpen, Users, Star } from "lucide-react";
import {
  scrollToSection,
  scrollToTop,
  navigateToDetail,
} from "@/lib/navigation-scroll";
import Image from "next/image";
import { BRANDING } from "@/config/branding";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Fetch active session dynamically
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setSession(data.session);
          }
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };
    fetchSession();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/tentang", label: "Tentang" },
    { href: "/program", label: "Program" },
    { href: "/fasilitas", label: "Fasilitas" },
    { href: "/kegiatan", label: "Kegiatan" },
    { href: "/galeri", label: "Galeri" },
    { href: "/kontak", label: "Kontak" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href === "/") {
      handleBerandaClick(e);
      return;
    }

    if (typeof window !== "undefined" && window.location.hostname.startsWith("ppdb.")) {
      e.preventDefault();
      const mainDomain = window.location.hostname.replace("ppdb.", "");
      window.location.href = `https://${mainDomain}${href}`;
      return;
    }

    if (href.startsWith("#") && pathname === "/") {
      e.preventDefault();
      scrollToSection(href, 100);
      return;
    }
    if (href.startsWith("#") && pathname !== "/") {
      e.preventDefault();
      sessionStorage.setItem("scroll_to_section", href);
      window.location.href = "/";
      return;
    }
    if (
      [
        "/tentang",
        "/program",
        "/fasilitas",
        "/kegiatan",
        "/galeri",
        "/kontak",
      ].includes(href)
    ) {
      e.preventDefault();
      const sectionMap: Record<string, string> = {
        "/tentang": "#about",
        "/program": "#program",
        "/fasilitas": "#fasilitas",
        "/kegiatan": "#kegiatan",
        "/galeri": "#gallery",
        "/kontak": "#kontak",
      };
      navigateToDetail(href, sectionMap[href]);
    }
  };

  const handleBerandaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (typeof window !== "undefined" && window.location.hostname.startsWith("ppdb.")) {
      const mainDomain = window.location.hostname.replace("ppdb.", "");
      window.location.href = `https://${mainDomain}/`;
      return;
    }

    if (pathname === "/") {
      scrollToTop();
    } else {
      sessionStorage.removeItem("scroll_to_section");
      sessionStorage.removeItem("scroll_to_position");
      window.location.href = "/";
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass-panel border-b border-[var(--color-primary-100)] py-2"
            : "bg-transparent py-4 lg:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* ── Logo ── */}
            <Link
              href="/"
              onClick={handleBerandaClick}
              className="flex items-center gap-3 group min-h-[44px]"
            >
              <div className="relative">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center border overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3 ${
                    isScrolled
                      ? "bg-white border-[var(--color-primary-100)] shadow-[var(--shadow-premium-sm)]"
                      : "bg-white/90 border-white/70 shadow-[0_2px_12px_rgba(3,105,199,0.12)]"
                  }`}
                >
                  <Image
                    src={BRANDING.logoPath}
                    alt={`Logo ${BRANDING.schoolName}`}
                    width={44}
                    height={44}
                    className="w-full h-full object-contain p-0.5"
                    priority
                    sizes="44px"
                  />
                </div>
                {/* Status dot — blue green */}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[var(--color-primary-600)] border-2 border-white rounded-full z-10 shadow-sm" />
              </div>

              <div className="block">
                <h1
                  className={`text-base sm:text-lg font-black leading-none tracking-tight transition-colors duration-300 ${
                    isScrolled
                      ? "text-[var(--color-ink-900)]"
                      : "text-[var(--color-ink-950)]"
                  }`}
                >
                  {BRANDING.schoolShortName}
                </h1>
                <p className="text-[9px] sm:text-[10px] font-bold text-[var(--color-ink-400)] uppercase tracking-widest mt-0.5 leading-tight">
                  Managed by Al Andalus IIBS
                </p>
              </div>
            </Link>

            {/* ── Desktop Nav (lg+) ── */}
            <nav
              className={`hidden lg:flex items-center gap-0.5 p-1.5 rounded-full border transition-all duration-300 ${
                isScrolled
                  ? "bg-white/80 border-[var(--color-primary-100)] shadow-sm"
                  : "bg-white/70 backdrop-blur-md border-white/65 shadow-[0_2px_16px_rgba(3,105,199,0.10)]"
              }`}
            >
              {navLinks.map((link) => {
                if (link.label === "Program") {
                  return (
                    <div 
                      key={link.href} 
                      className="relative group"
                      onMouseEnter={() => setActiveMegaMenu("Program")}
                      onMouseLeave={() => setActiveMegaMenu(null)}
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 min-h-[40px] flex items-center gap-1.5 ${
                          isActive(link.href)
                            ? "bg-[var(--color-primary-800)] text-[var(--color-secondary-100)] shadow-[var(--shadow-primary)]"
                            : "text-[var(--color-ink-600)] hover:text-[var(--color-primary-800)] hover:bg-[var(--color-primary-50)]"
                        }`}
                      >
                        {link.label}
                        <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                      </Link>
                      
                      {/* Mega Menu Dropdown */}
                      <AnimatePresence>
                        {activeMegaMenu === "Program" && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px] z-50"
                          >
                            <div className="mega-menu-content p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-surface-100" />
                              
                              <Link href="/program#mts" className="group/item p-4 rounded-2xl hover:bg-primary-50 transition-colors border border-transparent hover:border-primary-100">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                    <BookOpen className="w-5 h-5" />
                                  </div>
                                  <h4 className="font-bold text-ink-900 group-hover/item:text-primary-700">MTs (Setara SMP)</h4>
                                </div>
                                <p className="text-sm text-ink-500">Program menengah pertama berfokus pada tahfidz dan adab dasar.</p>
                              </Link>
                              
                              <Link href="/program#il" className="group/item p-4 rounded-2xl hover:bg-primary-50 transition-colors border border-transparent hover:border-primary-100">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-xl bg-secondary-100 text-secondary-700 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                    <Star className="w-5 h-5" />
                                  </div>
                                  <h4 className="font-bold text-ink-900 group-hover/item:text-primary-700">I'dad Lughowi (IL)</h4>
                                </div>
                                <p className="text-sm text-ink-500">Program pemantapan bahasa Arab sebelum jenjang Aliyah.</p>
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 min-h-[40px] flex items-center ${
                      isActive(link.href)
                        ? "bg-[var(--color-primary-800)] text-[var(--color-secondary-100)] shadow-[var(--shadow-primary)]"
                        : "text-[var(--color-ink-600)] hover:text-[var(--color-primary-800)] hover:bg-[var(--color-primary-50)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* ── CTA Buttons (lg+) ── */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSwitcher />
              {session ? (
                <Link
                  href="/dashboard"
                  className="btn-primary flex items-center gap-2 group text-sm px-6 py-2.5 glow-ring-primary scale-[1.02] transition-all active:scale-100 font-black"
                >
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-bold text-[var(--color-ink-600)] hover:text-[var(--color-primary-800)] transition-colors duration-200 px-4 py-2 min-h-[40px] flex items-center rounded-full hover:bg-[var(--color-primary-50)]"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/ppdb"
                    className="btn-primary flex items-center gap-2 group text-sm px-5 py-2.5 glow-ring-primary"
                  >
                    Daftar PPDB
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </>
              )}
            </div>

            {/* ── Hamburger (below lg) ── */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-3 rounded-2xl transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center border ${
                isScrolled
                  ? "bg-white border-[var(--color-primary-100)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)] shadow-[var(--shadow-xs)]"
                  : "bg-white/85 backdrop-blur-sm border-white/70 text-[var(--color-ink-800)] hover:bg-white/95 shadow-[0_2px_12px_rgba(3,105,199,0.10)]"
              }`}
              aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Menu className="w-5 h-5 stroke-[2.5]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu — Bottom Sheet ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--color-primary-950)]/40 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="absolute bottom-0 inset-x-0 rounded-t-[2rem] overflow-hidden max-h-[88vh] flex flex-col"
              style={{
                background:
                  "linear-gradient(180deg, var(--color-surface-50) 0%, #fff 100%)",
                borderTop: "1px solid var(--color-primary-100)",
                boxShadow: "0 -8px 40px rgba(3,105,199,0.10)",
              }}
            >
              {/* Drag Handle */}
              <div
                className="w-full flex justify-center pt-4 pb-2 cursor-pointer flex-shrink-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-10 h-1 bg-[var(--color-primary-200)] rounded-full" />
              </div>

              {/* School identity strip */}
              <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--color-primary-50)] flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] flex items-center justify-center overflow-hidden">
                  <Image
                    src={BRANDING.logoPath}
                    alt=""
                    width={36}
                    height={36}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-[var(--color-ink-900)] leading-none">
                    {BRANDING.schoolShortName}
                  </p>
                  <p className="text-[10px] sm:text-xs text-black/50 truncate hidden sm:block">
                    Managed by Yayasan Pendidikan Islam Al-Fath
                  </p>
                </div>
              </div>

              {/* Scrollable Nav */}
              <div className="overflow-y-auto flex-1 px-4 py-4 pb-safe overscroll-contain custom-scrollbar">
                <p className="text-[10px] font-black text-[var(--color-ink-400)] uppercase tracking-[0.12em] px-3 mb-3">
                  Navigasi
                </p>

                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.22 }}
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => {
                          handleNavClick(e, link.href);
                          setIsMenuOpen(false);
                        }}
                        className={`px-4 py-4 rounded-xl text-base font-bold transition-all min-h-[56px] flex items-center justify-between group ${
                          isActive(link.href)
                            ? "bg-[var(--color-primary-800)] text-[var(--color-secondary-100)] shadow-[var(--shadow-primary)]"
                            : "text-[var(--color-ink-800)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
                        }`}
                      >
                        <span>{link.label}</span>
                        {isActive(link.href) && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-300)]/70" />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-primary-100)] to-transparent my-5" />

                <div className="flex flex-col gap-3">
                  {session ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-primary w-full justify-center gap-3 min-h-[56px] relative overflow-hidden shadow-md active:scale-98 transition-all"
                    >
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                      </span>
                      <span>Buka Dashboard Anda</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-4 text-sm font-bold rounded-xl border border-[var(--color-primary-100)] text-[var(--color-primary-700)] bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)] text-center transition-all min-h-[52px] flex items-center justify-center gap-2"
                      >
                        Masuk ke Dashboard
                      </Link>
                      <Link
                        href="/ppdb"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn-primary w-full justify-center gap-2 min-h-[52px]"
                      >
                        <GraduationCap className="w-4 h-4" />
                        Daftar PPDB Online
                      </Link>
                    </>
                  )}
                </div>

                <div className="h-6" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
