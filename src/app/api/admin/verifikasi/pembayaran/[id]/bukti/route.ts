import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteFileLocal } from "@/lib/storage/local";
import { logAdminAction } from "@/lib/audit";
import { invalidateAdminPendaftarCache } from "@/lib/redis";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["admin_super", "admin", "admin_keuangan"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id: params.id },
      include: { pendaftar: true },
    });

    if (!pembayaran) {
      return NextResponse.json({ error: "Data pembayaran tidak ditemukan" }, { status: 404 });
    }

    if (pembayaran.status_pembayaran === "verified" || pembayaran.status_pembayaran === "paid") {
      return NextResponse.json(
        { error: "Pembayaran yang sudah diverifikasi tidak dapat dihapus buktinya. Tolak verifikasi terlebih dahulu." },
        { status: 400 }
      );
    }

    // Delete file physically
    if (pembayaran.bukti_transfer_path) {
      deleteFileLocal(pembayaran.bukti_transfer_path);
    }

    // Update DB to remove bukti_transfer
    await prisma.pembayaran.update({
      where: { id: params.id },
      data: {
        bukti_transfer_path: null,
        bukti_transfer_filename: null,
        status_pembayaran: "pending",
        updated_at: new Date()
      },
    });

    await prisma.pendaftar.update({
      where: { id: pembayaran.pendaftar_id },
      data: { updated_at: new Date() },
    });

    logAdminAction({
      action: "DELETE_BUKTI_PEMBAYARAN",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: pembayaran.pendaftar_id,
      targetName: pembayaran.pendaftar?.nama_lengkap || "Unknown",
      details: { pembayaran_id: params.id },
    });

    await invalidateAdminPendaftarCache();

    return NextResponse.json({
      success: true,
      message: "Bukti transfer berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Delete bukti pembayaran error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
