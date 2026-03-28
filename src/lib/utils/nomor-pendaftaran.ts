import { prisma } from "@/lib/prisma";

// ===================================
// NOMOR PENDAFTARAN GENERATION
// ===================================

/**
 * Generate Nomor Pendaftaran with Gender-based Prefix
 * Format: [PREFIX][YY][NNNNN]
 *
 * Prefixes:
 * - MTI = MTs Putra (Laki-laki)
 * - MTA = MTs Putri (Perempuan)
 * - ILI = I'dad Lughowi Putra
 * - ILA = I'dad Lughowi Putri
 * - MAI = SMA Putra (Laki-laki)
 * - MAA = SMA Putri (Perempuan)
 *
 * Example: MTI2600001, MTA2600045, ILI2600123
 *
 * @param jenjang - MTs, IL, or SMA
 * @param jenis_kelamin - L (Laki-laki) or P (Perempuan)
 * @param tahunAjaranId - ID tahun ajaran (optional, akan dicari aktif jika tidak diisi)
 * @returns Generated nomor pendaftaran
 * @throws Error if tahun ajaran aktif tidak ditemukan
 */
export async function generateNomorPendaftaran(
  jenjang: string,
  jenis_kelamin: string,
  tahunAjaranId?: string,
): Promise<string> {
  let tahunAjaranData;

  if (tahunAjaranId) {
    // Use provided tahun ajaran ID
    const data = await prisma.tahunAjaran.findUnique({
      where: { id: tahunAjaranId },
      select: { id: true, tahun_mulai: true },
    });

    if (!data) {
      throw new Error("Tahun ajaran tidak ditemukan");
    }
    tahunAjaranData = data;
  } else {
    // Get active tahun ajaran
    const data = await prisma.tahunAjaran.findFirst({
      where: { is_active: true },
      select: { id: true, tahun_mulai: true },
    });

    if (!data) {
      throw new Error("Tahun ajaran aktif tidak ditemukan");
    }
    tahunAjaranData = data;
  }

  // Generate prefix based on jenjang + gender
  const prefix = generatePrefix(jenjang, jenis_kelamin);

  // Get year from tahun ajaran (last 2 digits)
  const tahun = String(tahunAjaranData.tahun_mulai).slice(-2);

  // Get last nomor for this prefix + tahun ajaran
  const lastPendaftar = await prisma.pendaftar.findFirst({
    where: {
      tahun_ajaran_id: tahunAjaranData.id,
      nomor_pendaftaran: {
        startsWith: `${prefix}${tahun}`,
      },
    },
    orderBy: {
      nomor_pendaftaran: "desc",
    },
    select: {
      nomor_pendaftaran: true,
    },
  });

  let nextNumber = 1;

  if (lastPendaftar?.nomor_pendaftaran) {
    // Extract number from last nomor
    // Format: MTI2600001 -> extract 00001 -> increment
    const match = lastPendaftar.nomor_pendaftaran.match(/\d{5}$/);
    if (match) {
      const lastNumber = parseInt(match[0], 10);
      nextNumber = lastNumber + 1;
    }
  }

  // Check if reached maximum (99999)
  if (nextNumber > 99999) {
    throw new Error(
      `Nomor pendaftaran ${prefix} telah mencapai batas maksimum untuk tahun ini`,
    );
  }

  // Format: MTI2600001
  const nomorPendaftaran = `${prefix}${tahun}${String(nextNumber).padStart(5, "0")}`;

  return nomorPendaftaran;
}

// ===================================
// GENERATE PREFIX BASED ON JENJANG + GENDER
// ===================================

/**
 * Generate prefix based on jenjang and gender
 *
 * @param jenjang - MTs, IL, or SMA
 * @param jenis_kelamin - L (Laki-laki) or P (Perempuan)
 * @returns Prefix string (MTI, MTA, ILI, ILA, MAI, MAA)
 */
export function generatePrefix(jenjang: string, jenis_kelamin: string): string {
  let prefix = "";

  // Jenjang code
  if (jenjang === "MTs") {
    prefix = "MT";
  } else if (jenjang === "IL") {
    prefix = "IL";
  } else if (jenjang === "SMA" || jenjang === "MA") {
    prefix = "MA";
  } else {
    throw new Error(`Jenjang tidak valid: ${jenjang}`);
  }

  // Gender suffix
  if (jenis_kelamin === "L") {
    prefix += "I"; // Putra
  } else if (jenis_kelamin === "P") {
    prefix += "A"; // Putri
  } else {
    throw new Error(`Jenis kelamin tidak valid: ${jenis_kelamin}`);
  }

  return prefix;
}

// ===================================
// NOMOR PENDAFTARAN VALIDATION
// ===================================

/**
 * Validate nomor pendaftaran format
 * Expected format: [PREFIX][YY][NNNNN] (e.g., MTI2600001)
 *
 * @param nomorPendaftaran - Nomor to validate
 * @returns True if valid format
 */
export function validateNomorPendaftaranFormat(
  nomorPendaftaran: string,
): boolean {
  // Check length: 3 char prefix + 2 char year + 5 digit number = 10 chars
  if (nomorPendaftaran.length !== 10) return false;

  // Check format: Valid prefix + 2 digits + 5 digits
  const regex = /^(MTI|MTA|ILI|ILA|MAI|MAA)\d{7}$/;
  return regex.test(nomorPendaftaran);
}

/**
 * Parse nomor pendaftaran into components
 *
 * @param nomorPendaftaran - Nomor to parse
 * @returns Object with prefix, jenjang, gender, year, and sequence
 */
export function parseNomorPendaftaran(nomorPendaftaran: string): {
  prefix: string;
  jenjang: string;
  jenis_kelamin: string;
  tahun: string;
  sequence: number;
  fullYear: string;
} | null {
  if (!validateNomorPendaftaranFormat(nomorPendaftaran)) {
    return null;
  }

  const prefix = nomorPendaftaran.slice(0, 3);
  const tahun = nomorPendaftaran.slice(3, 5);
  const sequence = parseInt(nomorPendaftaran.slice(5), 10);

  // Parse jenjang and gender from prefix
  let jenjang = "";
  let jenis_kelamin = "";

  if (prefix.startsWith("MT")) {
    jenjang = "MTs";
  } else if (prefix.startsWith("IL")) {
    jenjang = "IL";
  } else if (prefix.startsWith("MA")) {
    jenjang = "SMA";
  }

  if (prefix.endsWith("I")) {
    jenis_kelamin = "L"; // Putra
  } else if (prefix.endsWith("A")) {
    jenis_kelamin = "P"; // Putri
  }

  // Convert 2-digit year to full year (assuming 2000s)
  const fullYear = `20${tahun}`;

  return {
    prefix,
    jenjang,
    jenis_kelamin,
    tahun,
    sequence,
    fullYear,
  };
}

// ===================================
// CHECK AVAILABILITY
// ===================================

/**
 * Check if nomor pendaftaran already exists
 *
 * @param nomorPendaftaran - Nomor to check
 * @returns True if already exists
 */
export async function isNomorPendaftaranExists(
  nomorPendaftaran: string,
): Promise<boolean> {
  const data = await prisma.pendaftar.findFirst({
    where: { nomor_pendaftaran: nomorPendaftaran },
    select: { id: true },
  });

  return !!data;
}

/**
 * Check if NIK already exists
 *
 * @param nik - NIK to check
 * @returns True if already exists
 */
export async function isNIKExists(nik: string): Promise<boolean> {
  const data = await prisma.pendaftar.findFirst({
    where: { nik: nik },
    select: { id: true },
  });

  return !!data;
}

// ===================================
// STATISTICS
// ===================================

/**
 * Get registration statistics for current year
 *
 * @returns Object with total, by jenjang, by gender, etc.
 */
export async function getRegistrationStats(): Promise<{
  total: number;
  byJenjang: Record<string, number>;
  byGender: Record<string, number>;
  byPrefix: Record<string, number>;
}> {
  // Get active tahun ajaran
  const tahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { is_active: true },
    select: { id: true },
  });

  if (!tahunAjaran) {
    return { total: 0, byJenjang: {}, byGender: {}, byPrefix: {} };
  }

  // Get all pendaftar for this tahun ajaran
  const pendaftar = await prisma.pendaftar.findMany({
    where: { tahun_ajaran_id: tahunAjaran.id },
    select: {
      jenjang: true,
      jenis_kelamin: true,
      nomor_pendaftaran: true,
    },
  });

  // Calculate statistics
  const total = pendaftar.length;
  const byJenjang: Record<string, number> = {};
  const byGender: Record<string, number> = {};
  const byPrefix: Record<string, number> = {};

  pendaftar.forEach((p) => {
    // By jenjang
    if (p.jenjang) {
      byJenjang[p.jenjang] = (byJenjang[p.jenjang] || 0) + 1;
    }

    // By gender
    if (p.jenis_kelamin) {
      const genderLabel = p.jenis_kelamin === "L" ? "Putra" : "Putri";
      byGender[genderLabel] = (byGender[genderLabel] || 0) + 1;
    }

    // By prefix
    if (p.nomor_pendaftaran) {
      const prefix = p.nomor_pendaftaran.slice(0, 3);
      byPrefix[prefix] = (byPrefix[prefix] || 0) + 1;
    }
  });

  return { total, byJenjang, byGender, byPrefix };
}

// ===================================
// PREFIX HELPER
// ===================================

/**
 * Get human-readable label for prefix
 *
 * @param prefix - MTI, MTA, ILI, ILA, MAI, MAA
 * @returns Human-readable label
 */
export function getPrefixLabel(prefix: string): string {
  const labels: Record<string, string> = {
    MTI: "MTs Putra (Laki-laki)",
    MTA: "MTs Putri (Perempuan)",
    ILI: "I'dad Lughowi Putra (Laki-laki)",
    ILA: "I'dad Lughowi Putri (Perempuan)",
    MAI: "SMA Putra (Laki-laki)",
    MAA: "SMA Putri (Perempuan)",
  };

  return labels[prefix] || prefix;
}

/**
 * Get prefix from jenjang and jenis kelamin
 *
 * @param jenjang - MTs, IL, or SMA
 * @param jenis_kelamin - L or P
 * @returns Prefix
 */
export function getPrefixFromJenjang(
  jenjang: string,
  jenis_kelamin: string,
): string {
  return generatePrefix(jenjang, jenis_kelamin);
}

// ===================================
// VALIDATION HELPERS
// ===================================

/**
 * Validate NIK format (16 digits)
 *
 * @param nik - NIK to validate
 * @returns True if valid format
 */
export function validateNIKFormat(nik: string): boolean {
  return /^\d{16}$/.test(nik);
}

/**
 * Validate phone number format (Indonesia)
 *
 * @param phone - Phone number to validate
 * @returns True if valid format
 */
export function validatePhoneFormat(phone: string): boolean {
  const normalized = phone.replace(/[\s\-\(\)]/g, "");
  return /^(08|628|\+628)\d{8,12}$/.test(normalized);
}

// ===================================
// SEQUENCE MANAGEMENT
// ===================================

/**
 * Get next sequence number for a specific prefix and year
 *
 * @param prefix - Prefix (MTI, MTA, etc.)
 * @param tahun - 2-digit year
 * @param tahunAjaranId - Tahun ajaran ID
 * @returns Next sequence number
 */
export async function getNextSequence(
  prefix: string,
  tahun: string,
  tahunAjaranId: string,
): Promise<number> {
  const lastPendaftar = await prisma.pendaftar.findFirst({
    where: {
      tahun_ajaran_id: tahunAjaranId,
      nomor_pendaftaran: {
        startsWith: `${prefix}${tahun}`,
      },
    },
    orderBy: {
      nomor_pendaftaran: "desc",
    },
    select: {
      nomor_pendaftaran: true,
    },
  });

  if (lastPendaftar?.nomor_pendaftaran) {
    const match = lastPendaftar.nomor_pendaftaran.match(/\d{5}$/);
    if (match) {
      return parseInt(match[0], 10) + 1;
    }
  }

  return 1;
}

/**
 * Generate multiple nomor pendaftaran for batch operations
 *
 * @param jenjang - Jenjang
 * @param jenis_kelamin - Jenis kelamin
 * @param count - Number of nomor to generate
 * @returns Array of nomor pendaftaran
 */
export async function generateBatchNomorPendaftaran(
  jenjang: string,
  jenis_kelamin: string,
  count: number = 1,
): Promise<string[]> {
  if (count < 1 || count > 100) {
    throw new Error("Count must be between 1 and 100");
  }

  const prefix = generatePrefix(jenjang, jenis_kelamin);

  // Get active tahun ajaran
  const tahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { is_active: true },
    select: { id: true, tahun_mulai: true },
  });

  if (!tahunAjaran) {
    throw new Error("Tahun ajaran aktif tidak ditemukan");
  }

  const tahun = String(tahunAjaran.tahun_mulai).slice(-2);
  const startSequence = await getNextSequence(prefix, tahun, tahunAjaran.id);

  const nomorList: string[] = [];

  for (let i = 0; i < count; i++) {
    const sequence = startSequence + i;
    if (sequence > 99999) {
      throw new Error(
        `Nomor pendaftaran ${prefix} telah mencapai batas maksimum untuk tahun ini`,
      );
    }

    const nomorPendaftaran = `${prefix}${tahun}${String(sequence).padStart(5, "0")}`;
    nomorList.push(nomorPendaftaran);
  }

  return nomorList;
}
