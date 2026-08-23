import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { invalidateAdminPendaftarCache } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi session manual
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Check custom role
    const allowedRoles = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_keuangan",
    ];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { ids, status_proses, status_pendaftaran, alasan } = body;
    const newStatus = status_proses || status_pendaftaran;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "IDs array is required" },
        { status: 400 },
      );
    }

    if (!newStatus) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 },
      );
    }

    // Validate status
    const validStatuses = [
      "draft",
      "awaiting_payment",
      "paid",
      "data_completed",
      "docs_uploaded",
      "docs_verified",
      "selection",
      "scheduled",
      "testing",
      "tested",
      "announced",
      "accepted",
      "rejected",
      "enrolled",
      "enrolled_full",
      "verified",
      "payment_verification",
      "mengundurkan_diri"
    ];

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 },
      );
    }

    if (alasan || newStatus === "mengundurkan_diri") {
      const existing = await prisma.pendaftar.findMany({
        where: { id: { in: ids } },
        select: { id: true, data_lengkap: true, nomor_pendaftaran: true }
      });
      
      await prisma.$transaction(
        existing.map((p) => {
          let parsedData = p.data_lengkap;
          if (typeof parsedData === "string") {
            try { parsedData = JSON.parse(parsedData); } catch(e) { parsedData = {}; }
          }
          if (typeof parsedData !== "object" || parsedData === null) {
            parsedData = {};
          }
          
          const newDataLengkap = {
            ...(parsedData as any) };
          if (alasan) {
            newDataLengkap.alasan_mengundurkan_diri = alasan;
          }
          
          const safeDataLengkap = JSON.parse(JSON.stringify(newDataLengkap));
            
          const updateData: any = {
            status_pendaftaran: newStatus,
            data_lengkap: safeDataLengkap,
            updated_at: new Date() };

          // Rename nomor_pendaftaran to free it up for gap filling
          if (newStatus === "mengundurkan_diri" && !p.nomor_pendaftaran.startsWith("WD_")) {
            updateData.nomor_pendaftaran = `WD_${Date.now()}_${p.nomor_pendaftaran}`;
          }

          return prisma.pendaftar.update({
            where: { id: p.id },
            data: updateData
          });
        })
      );
      
      await invalidateAdminPendaftarCache();
      return NextResponse.json({
        success: true,
        updated_count: ids.length });
    } else {
      // Bulk update
      const result = await prisma.pendaftar.updateMany({
        where: {
          id: { in: ids } },
        data: {
          status_pendaftaran: newStatus,
          updated_at: new Date() } });

      await invalidateAdminPendaftarCache();
      return NextResponse.json({
        success: true,
        updated_count: result.count });
    }
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
