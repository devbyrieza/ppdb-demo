import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function PUT(req: Request) {
  try {
    const session = (await getServerSession()) as any;
    if (!session || !session.pendaftar_id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pendaftarId = session.pendaftar_id;
    const body = await req.json();
    const { ukuran_seragam_baju, ukuran_seragam_celana } = body;

    // Pastikan status_pendaftaran valid untuk mengisi seragam (minimal accepted/re_registered)
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: { status_pendaftaran: true }
    });

    if (!pendaftar) {
      return NextResponse.json({ message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    if (!["accepted", "re_registered", "enrolled"].includes(pendaftar.status_pendaftaran)) {
      return NextResponse.json({ message: "Akses ditolak. Anda belum sampai pada tahap ini." }, { status: 403 });
    }

    // Update ukuran seragam
    await prisma.pendaftar.update({
      where: { id: pendaftarId },
      data: {
        ukuran_seragam_baju,
        ukuran_seragam_celana,
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
