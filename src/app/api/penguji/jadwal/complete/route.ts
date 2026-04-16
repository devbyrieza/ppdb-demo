import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { markExamComponentAsComplete } from "@/lib/exam-status";
import { notifyAllExamsComplete } from "@/lib/wablas";

/**
 * Endpoint for examiners to manually mark a schedule as 'finished' testing.
 * Triggers status updates and automated notifications if all components are done.
 * Logic ported from Al-Imam reference project.
 */

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user_id || session.id;
        const { jadwal_id } = await req.json();

        if (!jadwal_id) {
            return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 });
        }

        // 1. Fetch details for component mapping
        const jadwal = await prisma.jadwalUjian.findUnique({
            where: { id: jadwal_id },
            include: { pendaftar: true }
        });

        if (!jadwal) {
            return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
        }

        // 2. Perform the update via centralized utility
        const { isAllComplete } = await markExamComponentAsComplete({
            jadwalId: jadwal.id,
            userId: userId
        });

        const student = await prisma.pendaftar.findUnique({
            where: { id: jadwal.pendaftar_id }
        });

        if (isAllComplete) {
            if (student && student.no_hp) {
                try {
                    await notifyAllExamsComplete({
                        phone: student.no_hp,
                        nama: student.nama_lengkap
                    });
                    console.log(`[exam-status] Notification sent successfully to ${student.no_hp}`);
                } catch (err) {
                    console.error("[exam-status] Notification failed:", err);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Status ujian berhasil diperbarui menjadi SELESAI.`,
            isAllDone: isAllComplete
        });

    } catch (error: any) {
        console.error("[jadwal-complete] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
