// src/app/api/pendaftar/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pendaftarId = searchParams.get("pendaftar_id");

    if (!pendaftarId) {
      return NextResponse.json(
        { error: "pendaftar_id is required" },
        { status: 400 },
      );
    }

    // Query database
    const data = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: {
        id: true,
        nomor_pendaftaran: true,
        status_pendaftaran: true // Remapped from status_proses
      }
    });

    if (!data) {
      return NextResponse.json(
        { error: "Pendaftar not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: data.id,
      nomor_pendaftaran: data.nomor_pendaftaran,
      status_proses: data.status_pendaftaran || "draft",
    });
  } catch (error) {
    console.error("Error in status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
