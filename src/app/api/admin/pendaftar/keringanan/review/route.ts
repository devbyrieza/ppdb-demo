import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import { invalidateAdminPendaftarCache } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin_super", "admin_keuangan", "admin"].includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { pendaftar_id, action, nominal } = body;

    if (!pendaftar_id || !action) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftar_id }
    });

    if (!pendaftar) {
      return NextResponse.json({ error: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    let dataLengkap = pendaftar.data_lengkap as any || {};
    if (typeof dataLengkap === "string") {
      try { dataLengkap = JSON.parse(dataLengkap); } catch(e) {}
    }

    if (!dataLengkap.pengajuan_keringanan || dataLengkap.pengajuan_keringanan.status !== 'pending') {
      return NextResponse.json({ error: "Tidak ada pengajuan yang berstatus pending" }, { status: 400 });
    }

    // Update status pengajuan
    dataLengkap.pengajuan_keringanan.status = action;
    dataLengkap.pengajuan_keringanan.reviewed_at = new Date().toISOString();
    dataLengkap.pengajuan_keringanan.reviewed_by = session.id;

    if (action === "approved") {
      if (!nominal || isNaN(nominal) || nominal <= 0) {
        return NextResponse.json({ error: "Nominal potongan tidak valid" }, { status: 400 });
      }
      dataLengkap.pengajuan_keringanan.nominal_disetujui = nominal;

      // Sync ke Keringanan aktif
      dataLengkap.keringanan_daftar_ulang = {
        jenis: dataLengkap.pengajuan_keringanan.jenis,
        nominal_potongan: nominal
      };
    } else if (action === "rejected") {
      dataLengkap.pengajuan_keringanan.nominal_disetujui = 0;
      // Jangan hapus Keringanan aktif yang sudah ada jika ada, atau biarkan.
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
      details: { 
        message: `Review Pengajuan Keringanan: ${action}`,
        nominal_disetujui: action === "approved" ? nominal : 0 
      } });

    await invalidateAdminPendaftarCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error reviewing keringanan:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
