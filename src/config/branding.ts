export const BRANDING = {
  schoolName:
    process.env.NEXT_PUBLIC_SCHOOL_NAME || "Pondok Pesantren Al Fath",
  schoolShortName:
    process.env.NEXT_PUBLIC_SCHOOL_SHORT_NAME || "Al Fath",
  schoolTagline:
    process.env.NEXT_PUBLIC_SCHOOL_TAGLINE ||
    "Mencetak Generasi Rabbani, Unggul, dan Berintegritas",
  schoolNetwork:
    process.env.NEXT_PUBLIC_SCHOOL_NETWORK || "Perpaduan Kurikulum Nasional dan Khas Al-Fath",
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#0D6E6E", // Teal Emerald
  secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#A6945E", // Warm Sand
  logoPath: process.env.NEXT_PUBLIC_LOGO_PATH || "/images/logo.jpg",
  faviconPath: process.env.NEXT_PUBLIC_FAVICON_PATH || "/favicon.ico",
  websiteUrl:
    process.env.NEXT_PUBLIC_WEBSITE_URL || "https://ppdb-demo.vercel.app",
  dashboardTitle: process.env.NEXT_PUBLIC_DASHBOARD_TITLE || "Panel Admin PPDB",
  address:
    process.env.NEXT_PUBLIC_ADDRESS || "Jl. Pesantren Raya No. 1, Kota Madani",
  phone: process.env.NEXT_PUBLIC_PHONE || "+62 800-0000-0000",
  email: process.env.NEXT_PUBLIC_EMAIL || "demo@ppdbmodern.com",
  igUrl: process.env.NEXT_PUBLIC_IG_URL || "#",
  ytUrl: process.env.NEXT_PUBLIC_YT_URL || "#",
  fbUrl: process.env.NEXT_PUBLIC_FB_URL || "#",
};
