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

    // --- SELF-HEALING & SYNC LOGIC ---
    // Fetch pendaftar status to ensure consistency
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: { status_pendaftaran: true, updated_at: true, tahun_ajaran_id: true },
    });

    const announcedStatuses = ["accepted", "rejected", "cadangan", "announced", "enrolled"];
    
    // If Pendaftar status is already in a final state, PRIORITIZE it over Pengumuman table
    if (pendaftar && announcedStatuses.includes(pendaftar.status_pendaftaran)) {
      const statusMapped = pendaftar.status_pendaftaran === "accepted" || pendaftar.status_pendaftaran === "enrolled"
        ? "diterima"
        : pendaftar.status_pendaftaran === "rejected"
          ? "ditolak"
          : "cadangan";

      return NextResponse.json({
        data: {
          id: pengumuman?.id || pendaftarId,
          status_kelulusan: statusMapped,
          catatan: pengumuman?.catatan || "Hasil seleksi telah diumumkan. Silakan cek detail di atas.",
          tanggal_pengumuman: pengumuman?.published_at?.toISOString() || pendaftar.updated_at.toISOString(),
        },
      });
    }

    // Fallback to Pengumuman table if exists and published (for those not in final statuses yet)
    if (pengumuman && pengumuman.is_published) {
      return NextResponse.json({
        data: {
          id: pengumuman.id,
          status_kelulusan:
            pengumuman.status_kelulusan === "Lulus"
              ? "diterima"
              : (pengumuman.status_kelulusan === "Tidak Lulus" || pengumuman.status_kelulusan === "Ditolak")
                ? "ditolak"
                : "cadangan",
          catatan: pengumuman.catatan,
          tanggal_pengumuman: pengumuman.published_at?.toISOString() || pengumuman.created_at.toISOString(),
        },
      });
    }

    return NextResponse.json({ data: null });
  } catch (error) {
    console.error("GET /api/pendaftar/pengumuman error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
