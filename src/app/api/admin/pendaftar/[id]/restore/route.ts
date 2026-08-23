import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";

// POST: Restore a soft-deleted pendaftar
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin_super can restore
    if (session.role !== "admin_super") {
      return NextResponse.json(
        { error: "Hanya Admin Super yang dapat merestore data pendaftar" },
        { status: 403 },
      );
    }

    // Check if pendaftar exists and is soft-deleted
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: params.id } });

    if (!pendaftar) {
      return NextResponse.json(
        { error: "Pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    if (!pendaftar.deleted_at) {
      return NextResponse.json(
        { error: "Pendaftar ini tidak dalam keadaan terhapus" },
        { status: 400 },
      );
    }

    // Prepare original unique fields
    const originalNomor = pendaftar.nomor_pendaftaran.replace(/^DEL_\d+_/, "");
    const originalNik = pendaftar.nik.replace(/^DEL_\d+_/, "");

    // Check if original is taken
    const conflict = await prisma.pendaftar.findFirst({
      where: {
        OR: [
          { nomor_pendaftaran: originalNomor },
        ],
        deleted_at: null }
    });

    if (conflict) {
       return NextResponse.json(
         { error: "Gagal memulihkan: Nomor pendaftaran sudah digunakan oleh pendaftar lain." },
         { status: 400 }
       );
    }

    // Restore and update backup record in a transaction
    await prisma.$transaction([
      // 1. Restore pendaftar
      prisma.pendaftar.update({
        where: { id: params.id },
        data: {
          nomor_pendaftaran: originalNomor,
          nik: originalNik,
          deleted_at: null,
          deleted_by: null,
          updated_at: new Date() } }),
      // 2. Mark backup as restored
      prisma.pendaftarBackup.updateMany({
        where: {
          pendaftar_id: params.id,
          restored_at: null },
        data: {
          restored_at: new Date(),
          restored_by: session.id } }),
    ]);

    // Audit log
    logAdminAction({
      action: "RESTORE_PENDAFTAR",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: params.id,
      targetName: pendaftar.nama_lengkap,
      details: {
        nomor_pendaftaran: pendaftar.nomor_pendaftaran } });

    return NextResponse.json({
      success: true,
      message: `Data ${pendaftar.nama_lengkap} berhasil dipulihkan/direstore.` });
  } catch (error) {
    console.error("Error in admin pendaftar restore API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
