import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["admin", "admin_super", "admin_berkas", "admin_keuangan"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      statusKehadiran,
      jumlahPendamping,
      totalPengantar,
      catatanTambahan,
      jumlahMobil,
      jumlahMotor } = await request.json();

    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: params.id },
      include: { reservasi: true } });

    if (!pendaftar) {
      return NextResponse.json({ error: "Pendaftar not found" }, { status: 404 });
    }

    // Default to the first reservasi if exists
    let existingReservasi = pendaftar.reservasi[0];

    // If no reservasi exists, we need to create one. But we need tahun_ajaran_id.
    if (!existingReservasi) {
      const pendaftarData = await prisma.pendaftar.findUnique({
        where: { id: params.id },
        select: { tahun_ajaran_id: true }
      });
      
      if (!pendaftarData) {
        return NextResponse.json({ error: "Pendaftar not found" }, { status: 404 });
      }

      existingReservasi = await prisma.reservasiPSB.create({
        data: {
          pendaftar_id: params.id,
          tahun_ajaran_id: pendaftarData.tahun_ajaran_id,
          tanggal_kedatangan: new Date(), // placeholder
          jumlah_penginap: 0,
          status: "approved",
          data_penginap: {
            statusKehadiran,
            jumlahPendamping,
            totalPengantar,
            catatanTambahan,
            jumlahMobil,
            jumlahMotor,
            updatedByAdmin: true,
            updatedAt: new Date().toISOString()
          } }
      });
    } else {
      // Update existing
      const currentData = existingReservasi.data_penginap as Record<string, any> || {};
      const newData = {
        ...currentData,
        statusKehadiran,
        jumlahPendamping,
        totalPengantar,
        catatanTambahan,
        jumlahMobil,
        jumlahMotor,
        updatedByAdmin: true,
        updatedAt: new Date().toISOString()
      };

      await prisma.reservasiPSB.update({
        where: { id: existingReservasi.id },
        data: {
          data_penginap: newData
        }
      });
    }

    // Log the action
    await logAdminAction(
      session.userId,
      "UPDATE_WELCOME_DAY",
      "Pendaftar",
      params.id,
      {
        pendaftarId: params.id,
        action: "Admin updated welcome day info" }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating Welcome Day by Admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
