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

    const allowedRoles = ["admin_super", "admin", "admin_berkas"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const dokumen = await prisma.dokumen.findUnique({
      where: { id: params.id },
      include: { pendaftar: true },
    });

    if (!dokumen) {
      return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });
    }

    if (dokumen.is_verified) {
      return NextResponse.json(
        { error: "Dokumen yang sudah diverifikasi tidak dapat dihapus. Batalkan verifikasi terlebih dahulu." },
        { status: 400 }
      );
    }

    // Delete file physically
    if (dokumen.file_path) {
      deleteFileLocal(dokumen.file_path);
    }

    // Delete from database
    await prisma.dokumen.delete({
      where: { id: params.id },
    });

    await prisma.pendaftar.update({
      where: { id: dokumen.pendaftar_id },
      data: { updated_at: new Date() },
    });

    await logAdminAction({
      action: "DELETE_DOKUMEN" as any,
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: dokumen.pendaftar_id,
      targetName: dokumen.pendaftar?.nama_lengkap || "Unknown",
      details: { jenis_dokumen: dokumen.jenis_dokumen, dokumen_id: params.id },
    });

    await invalidateAdminPendaftarCache();

    return NextResponse.json({
      success: true,
      message: "Dokumen berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
