import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { canAccessSeragam, type StatusProses } from "@/lib/access-control";

export async function PUT(req: Request) {
  try {
    const session = (await getServerSession()) as any;
    if (!session || !session.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pendaftarId = session.id;
    const body = await req.json();
    const { ukuran_seragam_baju, ukuran_seragam_celana, ukuran_seragam_almamater } = body;

    // Pastikan status_pendaftaran valid untuk mengisi seragam (minimal accepted/re_registered atau bypass)
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: { status_pendaftaran: true, nomor_pendaftaran: true }
    });

    if (!pendaftar) {
      return NextResponse.json({ message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    const isAuthorized = canAccessSeragam(
      (pendaftar.status_pendaftaran || "draft") as StatusProses,
      pendaftar.nomor_pendaftaran
    );

    if (!isAuthorized) {
      return NextResponse.json({ message: "Akses ditolak. Anda belum sampai pada tahap ini." }, { status: 403 });
    }

    // Update ukuran seragam
    await prisma.pendaftar.update({
      where: { id: pendaftarId },
      data: {
        ukuran_seragam_baju,
        ukuran_seragam_celana,
        ukuran_seragam_almamater,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data ukuran seragam berhasil disimpan",
    });
  } catch (error: any) {
    console.error("Error in PUT /api/pendaftar/seragam:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
