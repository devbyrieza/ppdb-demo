import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { getAdminWhereClause } from "@/lib/utils/admin";

export async function GET(req: Request) {
  try {
    const session = (await getServerSession()) as any;
    if (!session || !["admin_super", "admin"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const whereClause = getAdminWhereClause();

    // Ambil data santri yang status pendaftarannya DITERIMA (minimal accepted)
    const pendaftar = await prisma.pendaftar.findMany({
      where: {
        ...whereClause,
        status_pendaftaran: {
          in: ["accepted", "re_registered", "enrolled"],
        },
      },
      select: {
        id: true,
        nomor_pendaftaran: true,
        nama_lengkap: true,
        jenjang: true,
        jenis_kelamin: true,
        status_pendaftaran: true,
        ukuran_seragam_baju: true,
        ukuran_seragam_celana: true,
        no_hp: true,
        orang_tua: {
          select: {
            no_hp_ayah: true,
            no_hp_ibu: true,
          }
        }
      },
      orderBy: { nama_lengkap: "asc" }
    });

    return NextResponse.json(pendaftar);
  } catch (error: any) {
    console.error("Error in GET /api/admin/seragam:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
