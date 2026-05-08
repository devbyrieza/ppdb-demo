/**
 * Single Source of Truth for Institutional PDF Branding
 * "Locked" specifications for headers, lines, and signatures.
 */

export const PDF_BRANDING = {
  // Institution Labels
  institution: {
    name: "PONDOK PESANTREN AL-FATH",
    subtitle: "Sistem Penerimaan Santri Baru Modern",
    committee: "PANITIA PENERIMAAN SANTRI BARU",
    academic_year: "2026-2027",
    address: "Jl. KH Mama Oyon, Cihaur, Kec. Cicantayan, Kabupaten Sukabumi, Jawa Barat 43155",
    contact:
      "Website: https://ppdb-demo.vercel.app | Email: info@pesantren-alfath.or.id",
    phones: "WhatsApp: 0812-8530-0800", // Base phone
  },

  // Resource Paths
  assets: {
    logo: "/images/logo.png",
    stamp: "/images/stempel-pesantren.jpg",
    signature: "/images/ttd-mudir.png",
  },

  // Precise Coordinate Standards (jsPDF based)
  coords: {
    header: {
      logo: { x: 18, y: 11, w: 20, h: 28 },
      vertical_bar: { x1: 44, y1: 13, x2: 44, y2: 39, width: 0.2 },
      text_x: 48,
      horizontal_sep: {
        y_thick: 45,
        y_thin: 46.5,
        thickness_thick: 1.2,
        thickness_thin: 0.3,
      },
    },
    signature: {
      stamp: { w: 35, h: 35 },
      ttd: { w: 35, h: 35 },
      margin_right: 80,
      y_offset_ttd: 5,
    },
  },

  // Official Mudir / Authority
  authority: {
    name: "Ust. Muhammad Al Fath, Lc.",
    role: "Mudir",
    city: "Sukabumi",
  },
};
