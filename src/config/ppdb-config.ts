// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   PPDB CONFIGURATION - EASY CUSTOMIZATION
//   Ganti bagian ini saja untuk setiap pesantren baru!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PPDB_CONFIG = {
  // 🏫 INFO PESANTREN (GANTI INI DULU!)
  pesantren: {
    nama: "Pesantren Al-Andalus [Nama Cabang]",
    singkatan: "Al-Andalus [Cabang]",
    alamat: "[Alamat Pesantren — Sesuaikan!]",
    telepon: "[Nomor Telepon — Sesuaikan!]",
    email: "[Email Pesantren — Sesuaikan!]",
    emailPpdb: "[Email PPDB — Sesuaikan!]",
    website: "https://www.pesantren-alandalus.com",
  },

  // 🎨 BRAND COLORS (GANTI SESUAI LOGO)
  colors: {
    primary: {
      50: "#fdf8f6",
      100: "#f2e8e5",
      200: "#eaddd7",
      300: "#e0cec7",
      400: "#d2bab0",
      500: "#a18072",
      600: "#8d6e63",
      700: "#5d4037",
      800: "#4e342e",
      900: "#3e2723",
    },
    secondary: {
      50: "#fffcf5",
      100: "#fdf8f3",
      200: "#f5ebe0",
      300: "#ebe0d1",
      400: "#d4b06e",
    },
    accent: {
      gold: "#fbbf24",
      teal: "#14b8a6",
      red: "#ef4444",
    }
  },

  // 📱 PROGRAM PENDIDIKAN (SESUAIKAN!)
  programs: [
    {
      id: "mts",
      name: "MTs",
      fullName: "Madrasah Tsanawiyah",
      description: "Program pendidikan formal setara SMP dengan kurikulum integrasi pesantren.",
      image: "/images/mts.webp",
      theme: "brown"
    },
    {
      id: "il",
      name: "I'dad Lughowi",
      fullName: "Program Persiapan Bahasa Arab",
      description: "Program intensif persiapan bahasa Arab untuk jenjang lebih tinggi.",
      image: "/images/il.webp",
      theme: "gold"
    }
  ],

  // 💰 BIAYA PENDAFTARAN (GANTI SESUAI)
  pricing: [
    {
      label: "Uang Pendaftaran",
      amount: "Rp 200.000",
      note: "Tidak dapat dikembalikan"
    },
    {
      label: "Uang Pangkal",
      amount: "Rp 9.800.000",
      note: "Pembayaran dapat dicicil"
    },
    {
      label: "Iuran Taawun/Tahun",
      amount: "Rp 13.200.000",
      note: "All in (SPP + Makan + Asrama)"
    },
    {
      label: "Cicilan per Bulan",
      amount: "Rp 1.100.000",
      note: "Jika memilih sistem cicilan"
    }
  ],

  // 📋 PERSYARATAN BERKAS (SESUAIKAN!)
  requirements: [
    "Fotocopy Kartu Keluarga (1 lembar)",
    "Fotocopy Akta Kelahiran (1 lembar)",
    "Fotocopy Rapor (2 semester terakhir)",
    "Pas Foto 3x4 (4 lembar)"
  ],

  // 🔗 KONTAK & SOSMED (GANTI SESUAI!)
  contact: {
    whatsapp: "[Nomor WhatsApp — Sesuaikan!]",
    instagram: "@pesantrenalandalus",
    facebook: "Pesantren Al-Andalus (Official Fanpage)",
    youtube: "Al-Andalus Official"
  },

  // ⚙️ SETTING TEKNIS
  technical: {
    appName: "PPDB Al-Andalus [Nama Cabang]",
    appDescription: "Sistem Penerimaan Peserta Didik Baru",
    version: "2.0.0",
    author: "Rieza Eka Tomara"
  }
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

export const generateCSSVariables = () => {
  const { colors } = PPDB_CONFIG;
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent
  };
};
