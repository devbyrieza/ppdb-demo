// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   PPDB CONFIGURATION - EASY CUSTOMIZATION
//   Ganti bagian ini saja untuk setiap pesantren baru!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PPDB_CONFIG = {
  // 🏫 INFO PESANTREN (GANTI INI DULU!)
  pesantren: {
    nama: "Pesantren Al-Andalus Ulul Albaab",
    singkatan: "Al-Andalus Ulul Albaab",
    alamat: "Jl. KH Mama Oyon, Cihaur, Kec. Cicantayan, Kabupaten Sukabumi, Jawa Barat 43155",
    telepon: "+62 888-0993-4970",
    email: "alandalus.ululalbaab@gmail.com",
    emailPpdb: "alandalus.ululalbaab@gmail.com",
    website: "https://www.pesantren-ululalbaab.com",
  },

  // 🎨 BRAND COLORS (GANTI SESUAI LOGO)
  colors: {
    // Primary Colors (Biru Muda / Sky)
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",  // Warna tombol & aksi utama
      700: "#0369a1",  // Warna teks penting
      800: "#075985",
      900: "#0c4a6e",  // Warna teks gelap
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
      gold: "#fbbf24",     // Untuk highlight & achievement
      teal: "#14b8a6",     // Untuk success & info
      red: "#ef4444",      // Untuk error & warning
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
    whatsapp: "+6288809934970",
    instagram: "@pesantrenululalbaab",
    facebook: "Pesantren Al-Andalus Ulul Albaab (Official Fanpage)",
    youtube: "Al-Andalus Ulul Albaab"
  },

  // ⚙️ SETTING TEKNIS (UMUMNYA TIDAK PERLU DIUBAH)
  technical: {
    appName: "PPDB Al-Andalus Ulul Albaab",
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

// Untuk generate CSS variables otomatis
export const generateCSSVariables = () => {
  const { colors } = PPDB_CONFIG;

  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent
  };
};
