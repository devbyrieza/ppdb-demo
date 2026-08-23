import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
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
      "penguji",
    ];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { request_id, action, admin_note } = body;

    if (!request_id || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    let updateData: any = {
      admin_note: admin_note || undefined };

    if (action === "approve_edit") {
      updateData.status = "approved_to_edit";
      updateData.approved_at = new Date();
    } else if (action === "reject") {
      updateData.status = "rejected";
      updateData.completed_at = new Date(); // Rejected is also a form of completion
    } else if (action === "finalize") {
      updateData.status = "completed";
      updateData.completed_at = new Date();
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 },
      );
    }

    const updatedRequest = await prisma.dataPerubahanRequest.update({
      where: { id: request_id },
      data: updateData });

    return NextResponse.json({
      success: true,
      data: updatedRequest });
  } catch (error: any) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
