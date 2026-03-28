/**
 * Cron endpoint to process WhatsApp queue.
 * Called by external cron every 1 minute.
 * Protected by CRON_SECRET header.
 */

import { NextResponse } from "next/server";
import { processWhatsappQueue, getQueueStats } from "@/lib/whatsapp-queue";

const CRON_SECRET = process.env.CRON_SECRET || "ppdb-alimam-cron-2026";

export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const urlSecret = new URL(request.url).searchParams.get("secret");
    const secret = authHeader?.replace("Bearer ", "") || urlSecret;

    if (secret !== CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await processWhatsappQueue();
        const stats = await getQueueStats();

        return NextResponse.json({
            success: true,
            result,
            stats,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("❌ Cron WhatsApp error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
