import { isPutriInstitution } from "@/lib/utils/jenjang";

export interface SizeOption {
  value: string;
  label: string;
}

export const AKHWAT_SIZES: SizeOption[] = [
  { value: "SS", label: "Ukuran SS (Sangat Kecil)" },
  { value: "S", label: "Ukuran S" },
  { value: "M", label: "Ukuran M" },
  { value: "L", label: "Ukuran L" },
  { value: "XL", label: "Ukuran XL" },
  { value: "XXL", label: "Ukuran XXL" },
  { value: ">XXL", label: "Ukuran >XXL (Khusus / Custom)" },
];

export const IKHWAN_SIZES: SizeOption[] = [
  { value: "S", label: "Ukuran S" },
  { value: "M", label: "Ukuran M" },
  { value: "L", label: "Ukuran L" },
  { value: "XL", label: "Ukuran XL" },
  { value: "XXL", label: "Ukuran XXL" },
  { value: ">XXL", label: "Ukuran >XXL (Khusus / Custom)" },
];

/**
 * Data panduan ukuran resmi Gamis Akhwat sesuai referensi PUAS (bit.ly/UkuranSeragamPUAS):
 * Ss | S | M | L | Xl | Xxl
 * Ld: 96, 100, 105, 110, 115, 120
 * Lebar Bahu: 36, 38, 41, 45, 46, 48
 * Panjang Lengan: 52, 55, 57, 59, 62, 65
 * Pb (Panjang Baju/Gamis): 130, 132, 135, 138, 141, 145
 */
export const AKHWAT_MEASUREMENTS = [
  { size: "SS", ld: 96, bahu: 36, lengan: 52, pb: 130 },
  { size: "S", ld: 100, bahu: 38, lengan: 55, pb: 132 },
  { size: "M", ld: 105, bahu: 41, lengan: 57, pb: 135 },
  { size: "L", ld: 110, bahu: 45, lengan: 59, pb: 138 },
  { size: "XL", ld: 115, bahu: 46, lengan: 62, pb: 141 },
  { size: "XXL", ld: 120, bahu: 48, lengan: 65, pb: 145 },
];

/**
 * Data panduan ukuran resmi Seragam Ikhwan (Putra):
 * Baju:
 * S: LD 88, TB 64, Pundak 40, Pjg Tangan 21
 * M: LD 96, TB 65, Pundak 42, Pjg Tangan 23.5
 * L: LD 106, TB 67, Pundak 44, Pjg Tangan 23.5
 * XL: LD 112, TB 69, Pundak 46, Pjg Tangan 24
 * XXL: LD 116, TB 71, Pundak 46, Pjg Tangan 24.5
 * Celana:
 * S: LP 76, TC 84, Paha 30
 * M: LP 80, TC 86, Paha 31
 * L: LP 84, TC 88, Paha 32
 * XL: LP 88, TC 93, Paha 34
 * XXL: LP 92, TC 98, Paha 36
 */
export const IKHWAN_MEASUREMENTS = [
  { size: "S", bajuLd: 88, bajuTb: 64, celanaLp: 76, celanaTc: 84 },
  { size: "M", bajuLd: 96, bajuTb: 65, celanaLp: 80, celanaTc: 86 },
  { size: "L", bajuLd: 106, bajuTb: 67, celanaLp: 84, celanaTc: 88 },
  { size: "XL", bajuLd: 112, bajuTb: 69, celanaLp: 88, celanaTc: 93 },
  { size: "XXL", bajuLd: 116, bajuTb: 71, celanaLp: 92, celanaTc: 98 },
];

export function getUniformConfig() {
  const isPutri = isPutriInstitution();

  if (isPutri) {
    return {
      isPutri: true,
      genderLabel: "Santriwati (Putri)",
      title: "Pendataan Ukuran Seragam Santriwati",
      subtitle: "Silakan pilih ukuran seragam gamis dan perlengkapan santriwati sesuai panduan ukuran putri di bawah ini. Pastikan ukuran yang dipilih sudah benar.",
      baju: {
        label: "Ukuran Gamis / Setelan Seragam *",
        sublabel: "Seragam Gamis Santriwati",
        placeholder: "-- Pilih Ukuran Gamis --",
      },
      celana: {
        label: "Ukuran Rok / Celana Panjang (Dalaman) *",
        sublabel: "Bawahan Santriwati",
        placeholder: "-- Pilih Ukuran Bawahan --",
      },
      almamater: {
        label: "Ukuran Jas Almamater *",
        sublabel: "Jas Almamater Santriwati",
        placeholder: "-- Pilih Ukuran Almamater --",
      },
      sizeOptions: AKHWAT_SIZES,
      chartTitle: "Panduan Ukuran Gamis Santriwati (Size Chart Putri)",
      chartImageSrc: "/images/size_chart_akhwat.jpg",
      chartDescription: "Standar ukuran seragam gamis resmi Pesantren Al-Andalus Putri (PUAS). Ukuran meliputi Lingkar Dada (LD), Lebar Bahu, Panjang Lengan, dan Panjang Baju/Gamis (PB) dalam satuan centimeter (cm)."
    };
  }

  return {
    isPutri: false,
    genderLabel: "Santri (Putra)",
    title: "Pendataan Ukuran Seragam Santri",
    subtitle: "Silakan pilih ukuran baju dan celana santri sesuai dengan panduan ukuran di bawah ini. Pastikan ukuran yang dipilih sudah benar.",
    baju: {
      label: "Ukuran Baju / Kemeja *",
      sublabel: "Baju Santri Putra",
      placeholder: "-- Pilih Ukuran Baju --",
    },
    celana: {
      label: "Ukuran Celana Panjang *",
      sublabel: "Celana Santri Putra",
      placeholder: "-- Pilih Ukuran Celana --",
    },
    almamater: {
      label: "Ukuran Jas Almamater *",
      sublabel: "Jas Almamater Santri Putra",
      placeholder: "-- Pilih Ukuran Almamater --",
    },
    sizeOptions: IKHWAN_SIZES,
    chartTitle: "Panduan Ukuran Seragam Santri (Size Chart Putra)",
    chartImageSrc: "/images/size_chart_ikhwan.jpg",
    chartDescription: "Standar ukuran kemeja dan celana seragam resmi Pesantren Putra. Ukuran meliputi Lingkar Dada (LD), Tinggi Baju, Lingkar Pinggang (LP), dan Tinggi Celana dalam satuan centimeter (cm)."
  };
}

/**
 * Helper untuk mem-parsing string ukuran custom seperti:
 * ">XXL (LD: 125 cm, PB: 148 cm)" atau ">XXL (LD: 125, PB: 148)"
 */
export function parseCustomSize(value: string | null | undefined): {
  baseSize: string;
  isCustom: boolean;
  ld: string;
  pbOrTb: string;
} {
  if (!value) return { baseSize: "", isCustom: false, ld: "", pbOrTb: "" };
  if (value.startsWith(">XXL")) {
    const ldMatch = value.match(/LD:\s*([0-9\.]+)/i);
    const pbMatch = value.match(/(?:PB|TB|Tinggi):\s*([0-9\.]+)/i);
    return {
      baseSize: ">XXL",
      isCustom: true,
      ld: ldMatch ? ldMatch[1] : "",
      pbOrTb: pbMatch ? pbMatch[1] : "",
    };
  }
  return { baseSize: value, isCustom: false, ld: "", pbOrTb: "" };
}

/**
 * Format ukuran sebelum disimpan ke database
 */
export function formatSizeValue(baseSize: string, isCustom: boolean, ld: string, pbOrTb: string, isPutri: boolean): string {
  if (baseSize === ">XXL" || isCustom) {
    const ldVal = ld.trim();
    const pbVal = pbOrTb.trim();
    const secondLabel = isPutri ? "PB" : "TB";
    if (ldVal || pbVal) {
      return `>XXL (LD: ${ldVal || "-"} cm, ${secondLabel}: ${pbVal || "-"} cm)`;
    }
    return ">XXL";
  }
  return baseSize;
}
