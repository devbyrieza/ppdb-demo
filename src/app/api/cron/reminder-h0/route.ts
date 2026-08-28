/**
 * Cron endpoint for H-0 reminders (1 hour before exam).
 * NOTE: Deactivated per standard policy — pendaftar & penguji now receive
 * exactly 1x comprehensive reminder 4 hours before exam (via /api/cron/reminder).
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "disabled",
    message: "H-0 reminder is deactivated. Standard single 4-hour reminder is active via /api/cron/reminder."
  });
}
