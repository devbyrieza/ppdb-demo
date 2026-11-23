/**
 * Konfigurasi Surat Pengumuman Hasil SPMB — Al-Imam (Khusus Putri)
 * Angkatan Pertama (001)
 * Format nomor: 001-<KODE>/SPMB-AIIS/<ROMAWI>/<TAHUN>
 */
export const SURAT_PENGUMUMAN_CONFIG = {
  nomorPrefix: "001",
  nomorSuffix: "SPMB-ALBASYIR",
  hal: "Informasi Hasil Seleksi Penerimaan Santri Baru",
  tujuan: ["Kepada Yth.", "Orangtua/Wali Ananda Calon Santri", "di", "Tempat"],
  ketuaPanitia: "Panitia Penerimaan Santri",
  kelasDiterimaDefault: "VII MTs",
  // Aset tanda tangan (null = kosongkan ruang untuk TTD basah + stempel)
  signatureImage: null as string | null,
  stampImage: null as string | null,
  nb: {
    judul: "NB :",
    subJudul: "Ketentuan pembayaran Uang Pangkal:",
    poin: [
      "1. Besaran Uang Pangkal: Rp. 9.900.000,- (sembilan juta sembilan ratus ribu rupiah)",
      "2. Pembayaran minimal 50% dari total nilai Uang Pangkal dilakukan paling lambat 1 (satu) pekan setelah pengumuman ini.",
      "3. Sisa pembayaran Uang Pangkal bisa dilakukan dalam 2 tahap hingga sebelum bulan Mei 2027.",
      "4. Pembayaran Uang Pangkal ke Rekening Resmi Pesantren & konfirmasi pembayaran ke Nomor Layanan SPMB Finance.",
      "5. Uang Pangkal yang sudah di bayarkan tidak dapat dikembalikan lagi dengan alasan apapun.",
      "6. Yang tidak membayar uang pangkal hingga batas waktu yang ditentukan dan tidak melakukan konfirmasi, maka posisinya akan digantikan Calon Santri lain",
    ],
  },
};
