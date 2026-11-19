import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import {
  getSpmbNotificationSettings,
  saveSpmbNotificationSettings,
  sendDailyQuotaDigest,
  buildDailyQuotaReport,
} from "@/lib/services/spmb-notification-service";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

function isSuperAdmin(session: any): boolean {
  if (!session) return false;
  const roles = [
    session.role,
    ...(session.secondary_roles || []),
    ...(session.roles || []),
  ]
    .filter(Boolean)
    .map((r: string) => String(r).toLowerCase());
  return roles.some((r) =>
    r.includes("admin_super") || r.includes("superadmin") || r.includes("head_of_it")
  );
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getSpmbNotificationSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("❌ spmb-recipients GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json(
        { error: "Hanya Admin Super yang dapat mengatur nomor WhatsApp penanggung jawab." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Opsi trigger test digest
    if (body.action === "send_digest") {
      const result = await sendDailyQuotaDigest();
      return NextResponse.json({
        success: true,
        message: `Rekap kuota berhasil dikirim ke ${result.sentCount} nomor.`,
        sentCount: result.sentCount,
        recipients: result.recipients,
      });
    }

    if (body.action === "preview_digest") {
      const report = await buildDailyQuotaReport();
      return NextResponse.json({ success: true, report: report.text, stats: report.stats });
    }

    const updated = await saveSpmbNotificationSettings({
      adminKeuangan: body.adminKeuangan,
      superAdmin: body.superAdmin,
      ketuaPanitia: body.ketuaPanitia,
      adminBerkas: body.adminBerkas,
      waitingDays: body.waitingDays ? Number(body.waitingDays) : undefined,
    });

    logAdminAction({
      action: "UPDATE_SPMB_NOTIFICATION_SETTINGS",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin Super",
      targetId: "app_settings",
      details: {
        adminKeuangan: updated.adminKeuangan.length,
        superAdmin: updated.superAdmin.length,
        ketuaPanitia: updated.ketuaPanitia.length,
        adminBerkas: updated.adminBerkas.length,
        isConfigured: updated.isConfigured,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Nomor WhatsApp penanggung jawab berhasil disimpan.",
      settings: updated,
    });
  } catch (error: any) {
    console.error("❌ spmb-recipients POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
