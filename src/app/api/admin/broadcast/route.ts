import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/wablas";
import { getServerSession } from "@/lib/session";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session || !["admin", "admin_super", "head_of_it"].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { ids, message, header, footer, includeName } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "Recipient IDs are required" }, { status: 400 });
        }

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Fetch pendaftar data
        const recipients = await prisma.pendaftar.findMany({
            where: {
                id: { in: ids },
            },
            select: {
                id: true,
                nama_lengkap: true,
                no_hp: true,
            },
        });

        const results = [];
        const formattedHeader = header ? `${header.trim()}\n\n` : "";
        const formattedFooter = footer ? `\n\n${footer.trim()}` : "";

        for (const recipient of recipients) {
            if (!recipient.no_hp) {
                results.push({ id: recipient.id, status: "failed", error: "No phone number" });
                continue;
            }

            let personalizedMessage = message;
            const salutation = includeName ? `${recipient.nama_lengkap}, ` : "";
            const finalMessage = `${formattedHeader}${salutation}${personalizedMessage}${formattedFooter}`;

            try {
                const response = await sendMessage({
                    phone: recipient.no_hp,
                    message: finalMessage,
                });

                if (response.status) {
                    results.push({ id: recipient.id, status: "success" });
                } else {
                    results.push({ id: recipient.id, status: "failed", error: response.message });
                }
            } catch (error: any) {
                results.push({ id: recipient.id, status: "failed", error: error.message });
            }
        }

        return NextResponse.json({
            success: true,
            total: recipients.length,
            sent: results.filter((r) => r.status === "success").length,
            failed: results.filter((r) => r.status === "failed").length,
            details: results,
        });
    } catch (error: any) {
        console.error("Broadcast error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
