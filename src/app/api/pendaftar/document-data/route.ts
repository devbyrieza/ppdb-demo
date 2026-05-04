import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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

    // Auth Check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    if (session.role === "pendaftar" && session.id !== pendaftarId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      include: {
        tahun_ajaran: {
          select: { nama: true },
        },
        jadwal_ujian: {
          select: {
            tanggal_ujian: true,
            catatan: true,
          },
        },
        pengumuman: {
          select: {
            status_kelulusan: true,
            catatan: true,
          },
        },
      },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Pendaftar not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        nomor_pendaftaran: data.nomor_pendaftaran,
        nama_lengkap: data.nama_lengkap,
        nik: data.nik,
        jenjang: data.jenjang,
        tempat_lahir: data.tempat_lahir,
        tanggal_lahir: data.tanggal_lahir?.toISOString().split("T")[0],
        status_proses: data.status_pendaftaran,
        tahun_ajaran: data.tahun_ajaran?.nama || "-",
        jadwal_ujian: data.jadwal_ujian?.[0]?.tanggal_ujian
          ? new Date(data.jadwal_ujian[0].tanggal_ujian)
              .toLocaleString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              .replace("Minggu", "Ahad")
          : null,
        status_kelulusan: data.pengumuman?.status_kelulusan || null,
      },
    });
  } catch (error) {
    console.error("Error fetching document data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
