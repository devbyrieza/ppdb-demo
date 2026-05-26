import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

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
      deleted_at: { not: null },
    };

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
        where: whereClause,
      }),
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
            select: { nama: true },
          },
        },
        orderBy: { deleted_at: "desc" },
        skip,
        take: limit,
      }),
    ]);

    // Get deleted_by names
    const deletedByIds = data
      .map((d) => d.deleted_by)
      .filter((id): id is string => Boolean(id));

    const profiles =
      deletedByIds.length > 0
        ? await prisma.profile.findMany({
            where: { id: { in: deletedByIds } },
            select: { id: true, full_name: true },
          })
        : [];

    const profileMap = new Map(profiles.map((p) => [p.id, p.full_name]));

    const transformedData = data.map((item) => ({
      ...item,
      deleted_by_name: item.deleted_by
        ? profileMap.get(item.deleted_by) || "Admin"
        : "Unknown",
    }));

    return NextResponse.json({
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in admin pendaftar trash API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
