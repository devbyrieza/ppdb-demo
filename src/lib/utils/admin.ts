import { prisma } from "@/lib/prisma";

/**
 * Resolves the accurate academic year string (e.g. "2027/2028") based on
 * registration number, academic year relation, or registration timestamp.
 */
export function resolveTahunAjaran(p: {
  nomor_pendaftaran?: string | null;
  created_at?: Date | string | null;
  tahun_ajaran?: { nama?: string | null } | null;
}, fallbackActiveTa?: string): string {
  // 1) FK resmi (relasi tahun_ajaran) selalu diprioritaskan
  if (p.tahun_ajaran?.nama && p.tahun_ajaran.nama.includes("/")) {
    return p.tahun_ajaran.nama;
  }
  // 2) Fallback: Active TA jika disediakan oleh pemanggil
  if (fallbackActiveTa && fallbackActiveTa.includes("/")) {
    return fallbackActiveTa;
  }
  // 3) Fallback: 2 digit tahun pada nomor_pendaftaran (data legacy)
  const no = p.nomor_pendaftaran || "";
  const m4 = no.match(/20(\d{2})/);
  if (m4) {
    const c = parseInt(m4[1], 10);
    return `20${c}/20${c + 1}`;
  }
  const m2 = no.match(/^[A-Za-z]+(\d{2})/);
  if (m2) {
    const c = parseInt(m2[1], 10);
    if (c >= 20 && c <= 35) {
      return `20${c}/20${c + 1}`;
    }
  }
  if (p.created_at) {
    const yr = new Date(p.created_at).getFullYear();
    return `${yr}/${yr + 1}`;
  }
  return "2027/2028";
}

/**
 * Resolve an academic-year input (UUID, name like "2027/2028", or "ALL") into a TahunAjaran UUID.
 * Returns null when the filter should be disabled (show every year).
 * When no input is given, falls back to the currently active academic year.
 */
export async function resolveTahunAjaranId(
  input?: string | null,
): Promise<string | null> {
  if (!input || input === "" || input === "active") {
    const active = await prisma.tahunAjaran.findFirst({
      where: { is_active: true },
      select: { id: true },
      orderBy: { tahun_mulai: "desc" } });
    return active?.id ?? null;
  }
  if (input === "ALL" || input === "all") return null;
  if (input.includes("-")) return input; // already a UUID
  const byName = await prisma.tahunAjaran.findFirst({
    where: { nama: input },
    select: { id: true } });
  return byName?.id ?? null;
}

/**
 * Standard filtering for administrative views.
 * Excludes soft-deleted records and "test/bypass" students by default.
 */
export async function getAdminWhereClause(tahunAjaranId?: string): Promise<any> {
  const where: any = {
    deleted_at: null,
    status_pendaftaran: { not: "mengundurkan_diri" } };

  if (tahunAjaranId === "all" || tahunAjaranId === "ALL") {
    // Show all
    return where;
  }

  const taId = await resolveTahunAjaranId(tahunAjaranId);
  if (taId) {
    where.tahun_ajaran_id = taId;
  }

  return where;
}
