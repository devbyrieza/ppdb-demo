"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { scrollToSection, scrollToTop, navigateToDetail } from "@/lib/navigation-scroll";

import { BRANDING } from "@/config/branding";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Handle anchor links on homepage
    if (href.startsWith("#") && pathname === "/") {
      e.preventDefault();
      scrollToSection(href, 100);
      return;
    }

    // Handle section links from other pages
    if (href.startsWith("#") && pathname !== "/") {
      e.preventDefault();
      sessionStorage.setItem('scroll_to_section', href);
      window.location.href = '/';
      return;
    }

    // Handle detail page navigation
    if (['/tentang', '/program', '/fasilitas', '/kegiatan', '/galeri', '/kontak'].includes(href)) {
      e.preventDefault();
      const sectionMap: Record<string, string> = {
        '/tentang': '#about',
        '/program': '#program',
        '/fasilitas': '#fasilitas',
        '/kegiatan': '#kegiatan',
        '/galeri': '#gallery',
        '/kontak': '#kontak',
      };
      navigateToDetail(href, sectionMap[href]);
    }
  };

  const handleBerandaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === "/") {
      scrollToTop();
    } else {
      sessionStorage.removeItem('scroll_to_section');
      sessionStorage.removeItem('scroll_to_position');
      window.location.href = '/';
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "glass border-b border-brand-blue-100/50 py-2 shadow-sm"
          : "bg-transparent py-4 lg:py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" onClick={handleBerandaClick} className="flex items-center gap-3 group min-h-[44px]">
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center bg-brand-blue-700 shadow-brand-blue-900/20 shadow-lg transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3 overflow-hidden">
                  <img src={BRANDING.logoPath} alt={`Logo ${BRANDING.schoolName}`} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full z-10" />
              </div>
              <div className="block">
                <h1 className="text-base sm:text-lg font-black text-brand-blue-900 leading-none tracking-tight">
                  {BRANDING.schoolShortName}
                </h1>
                <p className="text-[9px] sm:text-[10px] font-bold text-brand-blue-600/70 uppercase tracking-widest mt-0.5 leading-tight">
                  {BRANDING.schoolName.includes("Al-Andalus") ? "Islamic Boarding School" : "Managed by Al-Andalus"}
                </p>
              </div>
            </Link>

            {/* Desktop Nav - visible from lg (1024px+) */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/60 backdrop-blur-md p-1.5 rounded-pill border border-brand-blue-100">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-4 py-2 text-sm font-bold rounded-pill transition-all duration-300 min-h-[40px] flex items-center ${isActive(link.href)
                    ? "bg-brand-blue-600 text-white shadow-md shadow-brand-blue-600/20"
                    : "text-brand-blue-900/70 hover:text-brand-blue-900 hover:bg-brand-yellow-400/20"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons - visible from lg */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 px-1">
              <Link href="/login" className="text-sm font-bold text-brand-blue-700 hover:text-brand-blue-900 transition-colors px-4 py-2 min-h-[40px] flex items-center">
                Masuk
              </Link>
              <Link href="/ppdb" className="btn-primary flex items-center gap-2 group">
                PPDB 2025
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Hamburger - visible below lg */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 rounded-2xl bg-white border border-brand-yellow-400 text-brand-blue-800 hover:bg-brand-yellow-50 transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center shadow-sm"
              aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Bottom Sheet Style */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-brand-blue-950/40 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 bg-white shadow-xl rounded-t-[2.5rem] border-t border-brand-blue-100 overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Drag Handle Area */}
              <div className="w-full flex justify-center py-5 bg-white sticky top-0 z-10" onClick={() => setIsMenuOpen(false)}>
                <div className="w-14 h-1.5 bg-brand-blue-50 rounded-full" />
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto px-6 pb-8 pt-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-black text-brand-blue-800 uppercase tracking-widest pl-4 mb-2 mt-2">Menu</h3>

                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        handleNavClick(e, link.href);
                        setIsMenuOpen(false);
                      }}
                      className={`px-6 py-5 rounded-2xl text-base font-bold transition-all min-h-[60px] flex items-center ${isActive(link.href)
                        ? "bg-brand-blue-600 text-white shadow-lg shadow-brand-blue-600/20"
                        : "text-brand-blue-950 hover:bg-brand-blue-50"
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="h-px bg-brand-blue-50 my-5" />

                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-4 text-base font-bold rounded-2xl bg-brand-yellow-100 text-brand-blue-800 hover:bg-brand-yellow-200 text-center transition-all min-h-[56px] flex items-center justify-center mb-3"
                  >
                    Masuk ke Dashboard
                  </Link>
                  <Link
                    href="/ppdb"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-4 text-base font-bold rounded-2xl bg-brand-blue-700 text-white hover:bg-brand-blue-800 text-center transition-all min-h-[56px] flex items-center justify-center shadow-lg shadow-brand-blue-700/20"
                  >
                    Daftar PPDB 2025
                  </Link>

                  <div className="h-6" /> {/* Safe padding */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
