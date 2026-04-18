"use client";

import { usePathname } from "next/navigation";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatSystem from "@/components/ui/widgets/ChatSystem";
import TawkToScript from "@/components/ui/widgets/TawkToScript";
import ScrollToTop from "@/components/ui/widgets/ScrollToTop";
import PageTransition from "@/components/ui/PageTransition";
import UrgencyBar from "@/components/ui/UrgencyBar";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import LiveActivityToast from "@/components/ui/LiveActivityToast";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  useScrollRestoration();

  // Tentukan apakah perlu tampilkan navbar dan footer
  const hideNavbarFooter =
    pathname.startsWith("/login") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/daftar");

  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      {/* ✅ NAVBAR - Hanya tampil di halaman utama (tidak di login/dashboard) */}
      {!hideNavbarFooter && <Navbar />}

      {/* ✅ MAIN CONTENT - Page content dengan conditional offset */}
      <main className={hideNavbarFooter ? "flex-1" : "flex-1 pt-20 md:pt-24"}>
        {/* URGENCY BAR - Banner PPDB di bawah Navbar, scrolls naturally */}
        {!hideNavbarFooter && <UrgencyBar />}
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* ✅ FOOTER - Hanya tampil di halaman utama (tidak di login/dashboard) */}
      {!hideNavbarFooter && <Footer />}

      {/* ✅ FLOATING WIDGETS - Always visible on public pages */}
      {!hideNavbarFooter && (
        <>
          {/* <TawkToScript /> */}
          <ChatSystem />
          <ScrollToTop />
          <LiveActivityToast />
        </>
      )}

    </div>
  );
}