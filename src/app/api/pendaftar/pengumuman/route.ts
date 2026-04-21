import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("app_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const pendaftarId = session.role === "pendaftar" ? session.id : null;

    if (!pendaftarId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Attempt to fetch from Pengumuman table
    const pengumuman = await prisma.pengumuman.findUnique({
      where: { pendaftar_id: pendaftarId },
    });

    // If exists and published, return it
    if (pengumuman && pengumuman.is_published) {
      return NextResponse.json({
        data: {
          id: pengumuman.id,
          // Handle various status mappings to ensure frontend compatibility
          status_kelulusan: 
            pengumuman.status_kelulusan === "Lulus" ? "diterima" : 
            pengumuman.status_kelulusan === "Tidak Lulus" ? "tidak lulus" :
            pengumuman.status_kelulusan === "Cadangan" ? "cadangan" :
            pengumuman.status_kelulusan.toLowerCase(),
          catatan: pengumuman.catatan,
          tanggal_pengumuman: pengumuman.published_at?.toISOString() || pengumuman.created_at.toISOString(),
        },
      });
    }

    // FALLBACK: If missing from Pengumuman table but Pendaftar status is accepted/rejected/cadangan
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: { status_pendaftaran: true, updated_at: true }
    });

    const announcedStatuses = ["accepted", "rejected", "cadangan"];
    if (pendaftar && announcedStatuses.includes(pendaftar.status_pendaftaran)) {
      let statusMapped = pendaftar.status_pendaftaran;
      if (statusMapped === "accepted") statusMapped = "diterima";
      if (statusMapped === "rejected") statusMapped = "tidak lulus";

      return NextResponse.json({
        data: {
          id: pendaftarId,
          status_kelulusan: statusMapped,
          catatan: "Hasil seleksi telah diumumkan. Silakan cek detail di atas.",
          tanggal_pengumuman: pendaftar.updated_at.toISOString(),
        },
      });
    }
    
    return NextResponse.json({ data: null });
  } catch (error) {
    console.error("GET /api/pendaftar/pengumuman error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
