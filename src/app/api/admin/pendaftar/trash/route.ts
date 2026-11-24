import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import { invalidateAdminPendaftarCache } from "@/lib/redis";

// GET: List soft-deleted pendaftar (trash)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin_super can view trash
    if (session.role !== "admin_super") {
      return NextResponse.json(
        { error: "Hanya Admin Super yang dapat melihat data terhapus" },
        { status: 403 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const jenjang = searchParams.get("jenjang") || "";
    const skip = (page - 1) * limit;

    const whereClause: any = {
      deleted_at: { not: null } };

    if (search) {
      whereClause.OR = [
        { nomor_pendaftaran: { contains: search } },
        { nama_lengkap: { contains: search } },
      ];
    }
    
    if (jenjang && jenjang !== "all") {
      whereClause.jenjang = jenjang;
    }

    // Fetch soft-deleted pendaftar
    const [total, data] = await prisma.$transaction([
      prisma.pendaftar.count({
        where: whereClause }),
      prisma.pendaftar.findMany({
        where: whereClause,
        select: {
          id: true,
          nomor_pendaftaran: true,
          nama_lengkap: true,
          jenis_kelamin: true,
          jenjang: true,
          no_hp: true,
          status_pendaftaran: true,
          created_at: true,
          deleted_at: true,
          deleted_by: true,
          tahun_ajaran: {
            select: { nama: true } } },
        orderBy: { deleted_at: "desc" },
        skip,
        take: limit }),
    ]);

    // Get deleted_by names
    const deletedByIds = data
      .map((d) => d.deleted_by)
      .filter((id): id is string => Boolean(id));

    const profiles =
      deletedByIds.length > 0
        ? await prisma.profile.findMany({
            where: { id: { in: deletedByIds } },
            select: { id: true, full_name: true } })
        : [];

    const profileMap = new Map(profiles.map((p) => [p.id, p.full_name]));

    const transformedData = data.map((item) => ({
      ...item,
      deleted_by_name: item.deleted_by
        ? profileMap.get(item.deleted_by) || "Admin"
        : "Unknown" }));

    return NextResponse.json({
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Error in admin pendaftar trash API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE: Permanently delete pendaftar from trash (hard delete)
// Supports:
// 1. Single or multiple IDs: { ids: ["id1", "id2"] }
// 2. Empty all trash: { all: true }
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin_super can permanently delete
    if (session.role !== "admin_super") {
      return NextResponse.json(
        { error: "Hanya Admin Super yang berhak menghapus data secara permanen" },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { ids, all } = body;

    let targetIds: string[] = [];

    if (all === true) {
      // Find all soft-deleted pendaftar
      const trashed = await prisma.pendaftar.findMany({
        where: { deleted_at: { not: null } },
        select: { id: true, nama_lengkap: true, nomor_pendaftaran: true },
      });

      if (trashed.length === 0) {
        return NextResponse.json(
          { error: "Folder sampah sudah kosong" },
          { status: 400 },
        );
      }
      targetIds = trashed.map((p) => p.id);
    } else if (Array.isArray(ids) && ids.length > 0) {
      // Filter only valid string IDs
      const cleanIds = ids.filter(
        (id): id is string => typeof id === "string" && id.trim().length > 0,
      );

      // Ensure these pendaftar are indeed in trash (deleted_at != null)
      const trashed = await prisma.pendaftar.findMany({
        where: {
          id: { in: cleanIds },
          deleted_at: { not: null },
        },
        select: { id: true, nama_lengkap: true, nomor_pendaftaran: true },
      });

      if (trashed.length === 0) {
        return NextResponse.json(
          {
            error:
              "Data pendaftar di sampah tidak ditemukan atau sudah dihapus permanen",
          },
          { status: 404 },
        );
      }
      targetIds = trashed.map((p) => p.id);
    } else {
      return NextResponse.json(
        { error: "Parameter 'ids' (array) atau 'all: true' wajib disertakan" },
        { status: 400 },
      );
    }

    // Execute permanent deletion in a transaction:
    // 1. Clean up whatsapp_log where pendaftar_id in targetIds
    // 2. Clean up pendaftar_backup where pendaftar_id in targetIds
    // 3. Delete pendaftar records (cascading deletes will automatically remove orang_tua, dokumen, pembayaran, jadwal_ujian, nilai_ujian, dll)
    await prisma.$transaction([
      prisma.whatsappLog.deleteMany({
        where: { pendaftar_id: { in: targetIds } },
      }),
      prisma.pendaftarBackup.deleteMany({
        where: { pendaftar_id: { in: targetIds } },
      }),
      prisma.pendaftar.deleteMany({
        where: {
          id: { in: targetIds },
          deleted_at: { not: null }, // Safety double-check
        },
      }),
    ]);

    // Log admin audit action
    try {
      logAdminAction({
        action: all ? "HARD_DELETE_ALL_PENDAFTAR_TRASH" : "HARD_DELETE_PENDAFTAR",
        adminId: session.id || "system",
        adminName: session.full_name || session.name || "Admin Super",
        targetId:
          targetIds.length === 1 ? targetIds[0] : `multiple_${targetIds.length}`,
        targetName:
          targetIds.length === 1
            ? `ID: ${targetIds[0]}`
            : `${targetIds.length} Pendaftar`,
        details: {
          count: targetIds.length,
          all: Boolean(all),
          ids: targetIds,
        },
      });
    } catch (e) {
      console.warn("Failed to log admin action for hard delete:", e);
    }

    // Invalidate Redis/cache if present
    try {
      await invalidateAdminPendaftarCache();
    } catch (e) {
      // cache invalidation non-fatal
    }

    return NextResponse.json({
      success: true,
      count: targetIds.length,
      message:
        targetIds.length === 1
          ? "1 data pendaftar berhasil dihapus permanen."
          : `${targetIds.length} data pendaftar berhasil dihapus permanen.`,
    });
  } catch (error: any) {
    console.error("Error in admin pendaftar permanent delete API:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus data secara permanen" },
      { status: 500 },
    );
  }
}
