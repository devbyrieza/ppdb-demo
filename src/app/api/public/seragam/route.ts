import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, baju, celana, almamater } = body;

    if (!code || !code.includes("-")) {
      return NextResponse.json({ message: "Kode tidak valid" }, { status: 400 });
    }

    const [nomor_pendaftaran, hash] = code.split("-");

    const expectedHash = createHmac("sha256", MAGIC_LINK_SECRET)
      .update(nomor_pendaftaran)
      .digest("hex")
      .slice(0, 8);

    if (hash !== expectedHash) {
      return NextResponse.json({ message: "Kode tidak valid" }, { status: 400 });
    }

    const pendaftar = await prisma.pendaftar.findUnique({
      where: { nomor_pendaftaran } });

    if (!pendaftar) {
      return NextResponse.json({ message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    await prisma.pendaftar.update({
      where: { id: pendaftar.id },
      data: {
        ukuran_seragam_baju: baju,
        ukuran_seragam_celana: celana,
        ukuran_seragam_almamater: almamater }
    });

    return NextResponse.json({ message: "Berhasil menyimpan ukuran seragam" });
  } catch (error: any) {
    console.error("Error in public seragam API:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
