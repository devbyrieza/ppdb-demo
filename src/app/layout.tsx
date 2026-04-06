import type { Metadata } from "next";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// ✅ IMPORT NAVBAR & FOOTER YANG SUDAH ADA
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FONT CONFIGURATIONS - Using system fonts for reliability
// Using local font display via CSS (see globals.css)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { BRANDING } from "@/config/branding";

// METADATA CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const metadata: Metadata = {
  metadataBase: new URL(BRANDING.websiteUrl),

  title: {
    default: `${BRANDING.schoolName} | PPDB 2026/2027`,
    template: `%s | ${BRANDING.schoolName}`,
  },
  description:
    `Pendaftaran Santri Baru ${BRANDING.schoolName}. Pendidikan berbasis Al-Qur'an dan As-Sunnah sesuai pemahaman salafush shalih.`,
  keywords: [
    BRANDING.schoolName,
    "pesantren sukabumi",
    "ppdb 2026",
    "pendaftaran santri",
    "pesantren salafi",
    "tahfidz quran",
    "pendidikan islam",
  ],

  authors: [{ name: BRANDING.schoolName }],
  creator: BRANDING.schoolName,
  publisher: BRANDING.schoolName,

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: BRANDING.faviconPath,
    apple: "/apple-touch-icon.png",
    shortcut: BRANDING.faviconPath,
  },

  openGraph: {
    title: `${BRANDING.schoolName} | PPDB 2026/2027`,
    description:
      "Pendidikan berbasis Al-Qur'an dan As-Sunnah sesuai pemahaman salafush shalih. Daftar sekarang untuk tahun ajaran 2026/2027.",
    url: BRANDING.websiteUrl,
    siteName: BRANDING.schoolName,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: BRANDING.schoolName,
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: `${BRANDING.schoolName} | PPDB 2026/2027`,
    description:
      "Pendidikan berbasis Al-Qur'an dan As-Sunnah sesuai pemahaman salafush shalih.",
    images: ["/twitter-image.jpg"],
    creator: "@alandalus_ppdb",
  },

  verification: {
    google: "your-google-verification-code",
  },

  alternates: {
    canonical: BRANDING.websiteUrl,
    languages: {
      "id-ID": BRANDING.websiteUrl,
    },
  },

  category: "education",
  classification: "Islamic Education",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROOT LAYOUT COMPONENT (✅ DENGAN NAVBAR & FOOTER)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={BRANDING.primaryColor} />
        <meta name="msapplication-navbutton-color" content={BRANDING.primaryColor} />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="color-scheme" content="light only" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --brand-primary: ${BRANDING.primaryColor};
            --brand-secondary: ${BRANDING.secondaryColor};
          }
        `}} />
      </head>
      <body
        className="font-sans antialiased bg-white text-ink-900 overflow-x-hidden transition-colors duration-500"
        suppressHydrationWarning
      >
        <SmoothScrollProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ThemeProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}