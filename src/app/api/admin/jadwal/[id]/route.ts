import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;`n    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ID jadwal tidak valid" }, { status: 400 });
    }

    // Check if jadwal exists
    const jadwal = await prisma.jadwalUjian.findUnique({
      where: { id },
      include: { pendaftar: true },
    });

    if (!jadwal) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    // Start a transaction: Delete jadwal and reset pendaftar notification flag
    await prisma.$transaction([
      prisma.jadwalUjian.delete({
        where: { id },
      }),
      prisma.pendaftar.update({
        where: { id: jadwal.pendaftar_id },
        data: {
          
          notif_jadwal_tersedia_terkirim: false,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Jadwal berhasil dihapus" });
  } catch (error: any) {
    console.error("Delete jadwal error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus jadwal" },
      { status: 500 }
    );
  }
}

