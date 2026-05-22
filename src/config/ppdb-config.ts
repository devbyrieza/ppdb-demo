// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   PPDB CONFIGURATION - EASY CUSTOMIZATION
//   Ganti bagian ini saja untuk setiap pesantren baru!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PPDB_CONFIG = {
  // 🏫 INFO PESANTREN (GANTI INI DULU!)
  pesantren: {
    nama: "Pondok Pesantren Al Fath",
    singkatan: "PPDB Al Fath",
    alamat: "Jl. KH Mama Oyon, Cihaur, Kec. Cicantayan, Kabupaten Sukabumi, Jawa Barat 43155",
    telepon: "+62 812-8530-0800",
    email: "info@pesantren-alfath.or.id",
    emailPpdb: "ppdb@pesantren-alfath.or.id",
    website: "https://ppdb-demo.vercel.app",
  },

  // 🎨 BRAND COLORS (GANTI SESUAI LOGO)
  colors: {
    // Primary Colors (Maroon / Cream - Warna Khas Al Imam)
    primary: {
      50: "#fdf6e3",
      100: "#f9e8c8",
      200: "#f0cc99",
      300: "#e0a868",
      400: "#c07840",
      500: "#9b5e28",
      600: "#7c3a1e", // Warna tombol & aksi utama
      700: "#6b1c1c", // Warna teks penting
      800: "#521414",
      900: "#3d0d0d", // Warna teks gelap
    },

    // Secondary Colors (Kuning / Amber)
    secondary: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
    },

    // Accent Colors (Warna Aksen)
    accent: {
      gold: "#fbbf24", // Untuk highlight & achievement
      teal: "#14b8a6", // Untuk success & info
      red: "#ef4444", // Untuk error & warning
    },
  },

  // 📱 PROGRAM PENDIDIKAN (SESUAIKAN!)
  programs: [
    {
      id: "mts",
      name: "MTs",
      fullName: "Madrasah Tsanawiyah",
      description:
        "Program pendidikan formal setara SMP dengan kurikulum integrasi pesantren.",
      image: "/images/mts.webp",
      theme: "brown",
    },
    {
      id: "il",
      name: "I'dad Lughowi",
      fullName: "Program Persiapan Bahasa Arab",
      description:
        "Program intensif persiapan bahasa Arab untuk jenjang lebih tinggi.",
      image: "/images/il.webp",
      theme: "gold",
    },
  ],

  // 💰 BIAYA PENDAFTARAN (GANTI SESUAI)
  pricing: [
    {
      label: "Uang Pendaftaran",
      amount: "Rp 150.000",
      note: "Tidak dapat dikembalikan",
    },
    {
      label: "Uang Pangkal",
      amount: "Rp 9.800.000",
      note: "Pembayaran dapat dicicil",
    },
    {
      label: "Iuran Taawun/Tahun",
      amount: "Rp 13.200.000",
      note: "All in (SPP + Makan + Asrama)",
    },
    {
      label: "Cicilan per Bulan",
      amount: "Rp 1.100.000",
      note: "Jika memilih sistem cicilan",
    },
  ],

  // 📋 PERSYARATAN BERKAS (SESUAIKAN!)
  requirements: [
    "Fotocopy Kartu Keluarga (1 lembar)",
    "Fotocopy Akta Kelahiran (1 lembar)",
    "Fotocopy Rapor (2 semester terakhir)",
    "Pas Foto 3x4 (4 lembar)",
  ],

  // 🔗 KONTAK & SOSMED (GANTI SESUAI!)
  contact: {
    whatsapp: "+6281285300800",
    instagram: "@pesantren_alfath",
    facebook: "Pondok Pesantren Al Fath (Official Fanpage)",
    youtube: "Pondok Pesantren Al Fath",
  },

  // ⚙️ SETTING TEKNIS (UMUMNYA TIDAK PERLU DIUBAH)
  technical: {
    appName: "PPDB Al Fath",
    appDescription: "Sistem Penerimaan Peserta Didik Baru Pondok Pesantren Al Fath",
    version: "2.1.0",
    author: "Rieza Eka Tomara",
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   HELPER FUNCTIONS (Jangan diubah)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const getPesantrenInfo = () => PPDB_CONFIG.pesantren;
export const getPrograms = () => PPDB_CONFIG.programs;
export const getPricing = () => PPDB_CONFIG.pricing;
export const getRequirements = () => PPDB_CONFIG.requirements;
export const getContact = () => PPDB_CONFIG.contact;
export const getColors = () => PPDB_CONFIG.colors;

// Untuk generate CSS variables otomatis
export const generateCSSVariables = () => {
  const { colors } = PPDB_CONFIG;

  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
  };
};
