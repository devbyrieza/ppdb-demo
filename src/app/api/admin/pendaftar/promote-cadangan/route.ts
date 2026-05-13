import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";

/**
 * POST /api/admin/pendaftar/promote-cadangan
 * Mempromosikan Pendaftar dari status Cadangan (announced) ke Diterima (accepted).
 *
 * Body:
 *   { ids?: string[] }
 *   - Jika ids tidak ada atau kosong → promosikan SEMUA yang berstatus 'announced'
 *   - Jika ids ada → promosikan yang dipilih saja
 *
 * Access: admin_super only
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hanya admin_super yang boleh melakukan aksi ini
    if (session.role !== "admin_super" && session.role !== "admin") {
      return NextResponse.json(
        { error: "Hanya Admin Super yang dapat mempromosikan status Cadangan ke Diterima" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { ids } = body as { ids?: string[] };

    const promoteAll = !ids || ids.length === 0;

    // Tentukan where clause
    const whereClause = promoteAll
      ? { status_pendaftaran: "announced" }
      : { id: { in: ids }, status_pendaftaran: "announced" };

    // Ambil list pendaftar yang akan dipromosikan (untuk audit log & upsert pengumuman)
    const candidates = await prisma.pendaftar.findMany({
      where: whereClause,
      select: { id: true, nama_lengkap: true, nomor_pendaftaran: true, tahun_ajaran_id: true },
    });

    if (candidates.length === 0) {
      return NextResponse.json(
        { success: true, updated_count: 0, message: "Tidak ada Pendaftar Cadangan yang ditemukan." },
        { status: 200 }
      );
    }

    const candidateIds = candidates.map((c) => c.id);

    // Jalankan dalam transaksi: update status + upsert pengumuman
    await prisma.$transaction(async (tx) => {
      // 1. Update status_pendaftaran ke 'accepted'
      await tx.pendaftar.updateMany({
        where: { id: { in: candidateIds } },
        data: {
          status_pendaftaran: "accepted",
          updated_at: new Date(),
        },
      });

      // 2. Upsert tabel pengumuman agar dashboard santri juga berubah
      for (const candidate of candidates) {
        await tx.pengumuman.upsert({
          where: { pendaftar_id: candidate.id },
          update: {
            status_kelulusan: "Diterima",
            is_published: true,
            published_at: new Date(),
          },
          create: {
            pendaftar_id: candidate.id,
            status_kelulusan: "Diterima",
            is_published: true,
            published_at: new Date(),
            tahun_ajaran_id: candidate.tahun_ajaran_id,
          },
        });
      }
    });

    // Audit log
    logAdminAction({
      action: "PROMOTE_CADANGAN_TO_DITERIMA",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin Super",
      targetId: promoteAll ? "ALL_CADANGAN" : candidateIds.join(","),
      targetName: promoteAll
        ? `Semua Cadangan (${candidates.length} orang)`
        : candidates.map((c) => c.nama_lengkap).join(", "),
      details: {
        promoted_count: candidates.length,
        mode: promoteAll ? "all" : "selected",
        ids: candidateIds,
      },
    });

    return NextResponse.json({
      success: true,
      updated_count: candidates.length,
      message: `${candidates.length} Pendaftar berhasil dipindahkan dari Cadangan ke Diterima.`,
    });
  } catch (error) {
    console.error("Promote cadangan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
