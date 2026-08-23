import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("al_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const pendaftarId = session.role === "pendaftar" ? session.id : null;

    if (!pendaftarId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // === REDIS CACHE CHECK ===
    const cacheKey = `pengumuman_${pendaftarId}`;
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      console.log(`⚡ [API Pengumuman] Mengembalikan data dari Redis Cache untuk ${pendaftarId}`);
      return NextResponse.json(cachedData);
    }
    // =========================

    // Attempt to fetch from Pengumuman table
    const pengumuman = await prisma.pengumuman.findUnique({
      where: { pendaftar_id: pendaftarId } });

    // --- SELF-HEALING & SYNC LOGIC ---
    // Fetch pendaftar status to ensure consistency
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: { status_pendaftaran: true, updated_at: true, tahun_ajaran_id: true } });

    const announcedStatuses = ["accepted", "rejected", "cadangan", "announced", "enrolled", "enrolled_full"];
    
    // If Pendaftar status is already in a final state, PRIORITIZE it over Pengumuman table
    if (pendaftar && announcedStatuses.includes(pendaftar.status_pendaftaran)) {
      const statusMapped = ["accepted", "enrolled", "enrolled_full"].includes(pendaftar.status_pendaftaran)
        ? "diterima"
        : pendaftar.status_pendaftaran === "rejected"
          ? "ditolak"
          : "cadangan";

      const responseData = {
        data: {
          id: pengumuman?.id || pendaftarId,
          status_kelulusan: statusMapped,
          catatan: pengumuman?.catatan || "Hasil seleksi telah diumumkan. Silakan cek detail di atas.",
          tanggal_pengumuman: pengumuman?.published_at?.toISOString() || pendaftar.updated_at.toISOString() } };
      
      await setCache(cacheKey, responseData, 300); // Cache 5 menit
      return NextResponse.json(responseData);
    }

    // Fallback to Pengumuman table if exists and published (for those not in final statuses yet)
    if (pengumuman && pengumuman.is_published) {
      const responseData = {
        data: {
          id: pengumuman.id,
          status_kelulusan:
            pengumuman.status_kelulusan === "Lulus"
              ? "diterima"
              : (pengumuman.status_kelulusan === "Tidak Lulus" || pengumuman.status_kelulusan === "Ditolak")
                ? "ditolak"
                : "cadangan",
          catatan: pengumuman.catatan,
          tanggal_pengumuman: pengumuman.published_at?.toISOString() || pengumuman.created_at.toISOString() } };

      await setCache(cacheKey, responseData, 300); // Cache 5 menit
      return NextResponse.json(responseData);
    }

    await setCache(cacheKey, { data: null }, 300); // Cache response kosong
    return NextResponse.json({ data: null });
  } catch (error) {
    console.error("GET /api/pendaftar/pengumuman error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
