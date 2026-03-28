import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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
    const allowedRoles = ["admin", "admin_super", "admin_berkas", "admin_keuangan"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { ids, status_proses } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "IDs array is required" },
        { status: 400 }
      );
    }

    if (!status_proses) {
      return NextResponse.json(
        { error: "status_proses is required" },
        { status: 400 }
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
      "scheduled",
      "tested",
      "announced",
      "accepted",
      "rejected",
      "enrolled",
      // Add simplified statuses if needed
      "verified",
      "payment_verification"
    ];

    if (!validStatuses.includes(status_proses)) {
      return NextResponse.json(
        { error: "Invalid status_proses" },
        { status: 400 }
      );
    }

    // Bulk update
    const result = await prisma.pendaftar.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status_pendaftaran: status_proses,
        updated_at: new Date(),
      },
    });

    // Fetch updated data to return (optional, simulating previous generic response)
    const data = await prisma.pendaftar.findMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      success: true,
      updated_count: result.count,
      data,
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
