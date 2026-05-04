import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.profile.findMany({
            where: {
                role: {
                    in: ["admin", "admin_super", "admin_berkas", "admin_keuangan"]
                }
            },
            select: {
                email: true,
                role: true,
                full_name: true
            }
        });

        return NextResponse.json({
            success: true,
            users
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
