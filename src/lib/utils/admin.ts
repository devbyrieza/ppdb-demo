// Remove Prisma type import if it's causing issues in this environment

/**
 * Standard filtering for administrative views.
 * Excludes soft-deleted records and "test/bypass" students by default.
 */
export function getAdminWhereClause(tahunAjaranId?: string): any {
  const where: any = {
    deleted_at: null,
    NOT: [
      {
        AND: [
          { nama_lengkap: { contains: " Tes", mode: "insensitive" } },
          { NOT: { nama_lengkap: { contains: "Rieza Tes", mode: "insensitive" } } }
        ]
      },
      { nama_lengkap: { startsWith: "TEST ", mode: "insensitive" } },
      { nama_lengkap: { contains: "BYPASS", mode: "insensitive" } }
    ]
  };

  if (tahunAjaranId) {
    where.tahun_ajaran_id = tahunAjaranId;
  }

  return where;
}
