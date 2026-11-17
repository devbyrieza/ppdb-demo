import { BRANDING } from "@/config/branding";

export type JenjangType = "MTs" | "SMP IT" | "IL" | "SMA" | "MA";

/**
 * Deteksi tipe institusi berdasarkan branding:
 * - ANDALUS_PUSAT: Al-Andalus Pusat Putra & Putri (HANYA jenjang SMP IT dan IL)
 * - AL_IMAM: Pesantren Al-Imam Al-Islami Putri (Jenjang MTs, IL, dan MA)
 * - ULUL_ALBAAB: Pesantren Ulul Albaab Putra (Jenjang MTs, IL, dan SMA)
 */
export function getInstitutionType(): "ULUL_ALBAAB" | "AL_IMAM" | "ANDALUS_PUSAT" {
  const b = BRANDING as any;
  const schoolName = (b?.schoolName || "").toLowerCase();
  const schoolShortName = (b?.schoolShortName || "").toLowerCase();
  const gender = (b?.gender || "").toLowerCase();
  const subtitle = (b?.subtitle || "").toLowerCase();

  // 1. Al-Andalus Pusat (Putra & Putri)
  if (
    schoolName.includes("internasional al-andalus") ||
    schoolName.includes("andalus pusat") ||
    (schoolShortName === "al-andalus" && !schoolName.includes("ulul albaab") && !schoolName.includes("al-imam"))
  ) {
    return "ANDALUS_PUSAT";
  }

  // 2. Al-Imam (Putri)
  if (
    gender === "putri" ||
    schoolName.includes("al-imam") ||
    schoolShortName.includes("al-imam") ||
    subtitle.includes("putri")
  ) {
    return "AL_IMAM";
  }

  // 3. Ulul Albaab (Putra)
  return "ULUL_ALBAAB";
}

/**
 * Daftar jenjang resmi yang dibuka di institusi saat ini:
 * - Ulul Albaab: MTs, IL, SMA
 * - Al-Imam: MTs, IL, MA
 * - Al-Andalus Pusat: SMP IT, IL
 */
export function getAvailableJenjang(): string[] {
  const inst = getInstitutionType();
  if (inst === "ANDALUS_PUSAT") {
    return ["SMP IT", "IL"];
  }
  if (inst === "AL_IMAM") {
    return ["MTs", "IL", "MA"];
  }
  return ["MTs", "IL", "SMA"];
}

/**
 * Format label deskriptif jenjang untuk form / select dropdown
 */
export function getJenjangLabel(jenjang: string): string {
  const norm = normalizeJenjang(jenjang);
  switch (norm) {
    case "SMP IT":
      return "SMP IT (Sekolah Menengah Pertama IT)";
    case "MTs":
      return "MTs (Madrasah Tsanawiyah)";
    case "IL":
      return "I'dad Lughowi (IL - Persiapan Bahasa Arab)";
    case "SMA":
      return "SMA (Sekolah Menengah Atas)";
    case "MA":
      return "MA (Madrasah Aliyah)";
    default:
      return norm;
  }
}

/**
 * Normalisasi nama jenjang agar konsisten sesuai institusi:
 * - Di Ulul Albaab: "MA" otomatis jadi "SMA", "MTS" -> "MTs"
 * - Di Al-Imam: "SMA" otomatis jadi "MA", "MTS" -> "MTs"
 * - Di Al-Andalus Pusat: "MTs" / "SMP" / "SMA" / "MA" -> "SMP IT", "IL" -> "IL"
 */
export function normalizeJenjang(jenjang?: string | null): string {
  if (!jenjang) {
    const list = getAvailableJenjang();
    return list[0];
  }
  const clean = jenjang.trim().toUpperCase();
  const inst = getInstitutionType();

  if (inst === "ANDALUS_PUSAT") {
    if (clean.includes("IL") || clean.includes("IDAD") || clean.includes("LUGHAW")) {
      return "IL";
    }
    return "SMP IT";
  }

  if (inst === "AL_IMAM") {
    if (clean.includes("IL") || clean.includes("IDAD") || clean.includes("LUGHAW")) {
      return "IL";
    }
    if (clean.includes("MA") || clean.includes("SMA") || clean.includes("ALIYAH") || clean.includes("SLTA")) {
      return "MA";
    }
    return "MTs";
  }

  // Ulul Albaab (Putra)
  if (clean.includes("IL") || clean.includes("IDAD") || clean.includes("LUGHAW")) {
    return "IL";
  }
  if (clean.includes("SMA") || clean.includes("MA") || clean.includes("ALIYAH") || clean.includes("SLTA")) {
    return "SMA";
  }
  return "MTs";
}

/**
 * Helper deteksi jenjang tingkat atas tanpa IL (SMA / MA)
 * yang memerlukan 8 komponen nilai lengkap
 */
export function isJenjangTanpaIL(jenjang?: string | null): boolean {
  if (!jenjang) return false;
  const clean = jenjang.trim().toUpperCase();
  if (clean === "IL" || clean === "I'DAD LUGHAWI" || clean === "IDAD") {
    return false;
  }
  if (
    clean.includes("NON-IL") ||
    clean.includes("NON IL") ||
    clean.includes("TANPA IL") ||
    clean === "MA" ||
    clean === "SMA" ||
    clean.startsWith("MA ") ||
    clean.startsWith("SMA ") ||
    clean.includes("ALIYAH") ||
    clean.includes("SLTA")
  ) {
    return true;
  }
  return false;
}
