import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { invalidateAdminPendaftarCache } from "@/lib/redis";
import { logAdminAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["admin_super", "admin", "admin_keuangan"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { pendaftar_id, jenis, nominal_potongan } = body;

    if (!pendaftar_id) {
      return NextResponse.json({ error: "Pendaftar ID is required" }, { status: 400 });
    }

    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftar_id }
    });

    if (!pendaftar) {
      return NextResponse.json({ error: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    let dataLengkap = pendaftar.data_lengkap as any || {};
    
    if (typeof dataLengkap === "string") {
      try { dataLengkap = JSON.parse(dataLengkap); } catch(e) { dataLengkap = {}; }
    }

    if (jenis && nominal_potongan !== undefined) {
      dataLengkap.keringanan_daftar_ulang = {
        jenis,
        nominal_potongan: Number(nominal_potongan)
      };
    } else {
      // Hapus keringanan
      delete dataLengkap.keringanan_daftar_ulang;
    }

    await prisma.pendaftar.update({
      where: { id: pendaftar_id },
      data: { data_lengkap: dataLengkap }
    });

    logAdminAction({
      action: "UPDATE_KERINGANAN" as any,
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: pendaftar_id,
      targetName: pendaftar.nama_lengkap || "Unknown",
      details: { jenis, nominal_potongan },
    });

    await invalidateAdminPendaftarCache();

    return NextResponse.json({ success: true, message: "Keringanan berhasil diperbarui" });

  } catch (error: any) {
    console.error("Update keringanan error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
