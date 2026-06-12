import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { invalidateAdminPendaftarCache } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi session manual
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

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

    if (alasan) {
      const existing = await prisma.pendaftar.findMany({
        where: { id: { in: ids } },
        select: { id: true, data_lengkap: true }
      });
      
      await prisma.$transaction(
        existing.map((p) => {
          const newDataLengkap = p.data_lengkap 
            ? { ...(p.data_lengkap as any), alasan_mengundurkan_diri: alasan }
            : { alasan_mengundurkan_diri: alasan };
            
          return prisma.pendaftar.update({
            where: { id: p.id },
            data: {
              status_pendaftaran: newStatus,
              data_lengkap: newDataLengkap,
              updated_at: new Date(),
            }
          });
        })
      );
      
      await invalidateAdminPendaftarCache();
      return NextResponse.json({
        success: true,
        updated_count: ids.length,
      });
    } else {
      // Bulk update
      const result = await prisma.pendaftar.updateMany({
        where: {
          id: { in: ids },
        },
        data: {
          status_pendaftaran: newStatus,
          updated_at: new Date(),
        },
      });

      await invalidateAdminPendaftarCache();
      return NextResponse.json({
        success: true,
        updated_count: result.count,
      });
    }
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
