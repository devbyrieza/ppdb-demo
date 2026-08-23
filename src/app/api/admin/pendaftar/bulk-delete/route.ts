import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import { invalidateAdminPendaftarCache } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin_super can delete
    if (session.role !== "admin_super") {
      return NextResponse.json(
        { error: "Hanya Admin Super yang dapat menghapus data pendaftar" },
        { status: 403 },
      );
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data yang dipilih untuk dihapus" },
        { status: 400 },
      );
    }

    const pendaftars = await prisma.pendaftar.findMany({
      where: { id: { in: ids }, deleted_at: null },
      include: {
        tahun_ajaran: true,
        orang_tua: true,
        dokumen: true,
        pembayaran: true,
        jadwal_ujian: true,
        nilai_ujian: true,
        pengumuman: true,
        rapor: true,
        prestasi: true,
        kesehatan: true,
        asrama: true,
        hasil_seleksi: true,
        reservasi: true,
        whatsapp_logs: true } });

    if (pendaftars.length === 0) {
      return NextResponse.json(
        { error: "Pendaftar tidak ditemukan atau sudah terhapus" },
        { status: 404 },
      );
    }

    // Process each softly
    const backupDataList = pendaftars.map((p) => ({
      pendaftar_id: p.id,
      nomor_pendaftaran: p.nomor_pendaftaran,
      nama_lengkap: p.nama_lengkap,
      backup_data: JSON.parse(JSON.stringify(p)),
      deleted_by: session.id,
      deleted_by_name: session.full_name || session.name || "Admin Super" }));

    await prisma.$transaction(async (tx) => {
      // 1. Create backups
      await tx.pendaftarBackup.createMany({
        data: backupDataList });

      // 2. Soft delete individually to ensure unique DEL_ prefixes
      for (const p of pendaftars) {
        await tx.pendaftar.update({
          where: { id: p.id },
          data: {
            nomor_pendaftaran: `DEL_${Date.now()}_${p.nomor_pendaftaran}`,
            nik: p.nik ? `DEL_${Date.now()}_${p.nik}` : `DEL_${Date.now()}_${p.id}`,
            deleted_at: new Date(),
            deleted_by: session.id,
            updated_at: new Date() } });
      }
    });

    // Audit log
    logAdminAction({
      action: "BULK_SOFT_DELETE_PENDAFTAR",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: "bulk",
      targetName: `${pendaftars.length} Pendaftar`,
      details: {
        count: pendaftars.length,
        deleted_ids: pendaftars.map(p => p.id) } });

    await invalidateAdminPendaftarCache();
    return NextResponse.json({
      success: true,
      message: `${pendaftars.length} pendaftar berhasil dipindahkan ke tempat sampah` });
  } catch (error: any) {
    console.error("Error in bulk delete API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
