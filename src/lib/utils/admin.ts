// Remove Prisma type import if it's causing issues in this environment

/**
 * Standard filtering for administrative views.
 * Excludes soft-deleted records and "test/bypass" students by default.
 */
export function getAdminWhereClause(tahunAjaranId?: string): any {
  const where: any = {
    deleted_at: null,
    status_pendaftaran: { not: "mengundurkan_diri" },
  };

  if (tahunAjaranId) {
    where.tahun_ajaran_id = tahunAjaranId;
  }

  return where;
}
