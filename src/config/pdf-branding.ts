/**
 * Single Source of Truth for Institutional PDF Branding
 * "Locked" specifications for headers, backgrounds, and signatures.
 *
 * template: "full_image" → pakai gambar kop surat penuh sebagai background halaman
 * template: "programmatic" → render kop surat secara programatik (jsPDF elements)
 */

export const PDF_BRANDING = {
  // Template Mode
  template: "full_image" as "full_image" | "programmatic",

  // Institution Labels
  institution: {
    name: "PESANTREN AL IMAM AL ISLAMI",
    subtitle: "Islamic Boarding School Managed by Al Andalus IIBS",
    committee: "PANITIA PENERIMAAN SANTRI BARU",
    academic_year: "2027/2028",
    address:
      "Jl. Pelabuhan II KM 18 Kampung Pupunjul, RT./RW/RW.01, 02, Cikembar, Kec. Cikembar, Kabupaten Sukabumi, Jawa Barat 43157",
    contact:
      "Website: https://pesantren-alimam.com | Email: alandalusalimam@gmail.com",
    phones: "WhatsApp: 0851-1152-4441" },

  // Resource Paths
  assets: {
    logo: "/images/kop-surat.png",
    kop_full: "/images/kop-surat-full.jpg", // Gambar kop surat penuh (full letterhead)
    stamp: "/images/stempel-pesantren.jpg", // Dikembalikan ke stempel lama bawaan (stempel-pesantren.jpg)
    signature: "/images/ttd-mudir.png" },

  // Content Area Coordinates (berlaku ketika template = "full_image")
  // Berdasarkan posisi area kosong di kop-surat-full.jpg
  content_area: {
    y_start: 70,    // Diubah dari 85 ke 70 agar tidak terlalu jauh dari kop
    y_end: 255,     // Y akhir konten (sebelum footer kop)
    x_left: 18,     // Margin kiri
    x_right: 192,   // Margin kanan (210 - 18)
    width: 174,     // Lebar konten (x_right - x_left)
  },

  // Precise Coordinate Standards (jsPDF based) — digunakan saat template = "programmatic"
  coords: {
    header: {
      logo: { x: 18, y: 11, w: 20, h: 28 },
      vertical_bar: { x1: 44, y1: 13, x2: 44, y2: 39, width: 0.2 },
      text_x: 48,
      horizontal_sep: {
        y_thick: 45,
        y_thin: 46.5,
        thickness_thick: 1.2,
        thickness_thin: 0.3 } },
    signature: {
      stamp: { w: 35, h: 35 },
      ttd: { w: 35, h: 35 },
      margin_right: 95, // Diubah dari 80 ke 95 agar bergeser ke kiri dan tidak menimpa Kemenkumham stamp di background
      y_offset_ttd: 5 } },

  // Official Mudir / Authority
  authority: {
    name: "Wahab Rajasam, M.Pd",
    role: "Ketua Panitia",
    city: "Sukabumi" } };

