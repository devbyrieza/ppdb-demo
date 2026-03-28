import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await props.params;

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

        // Check admin role
        const allowedRoles = ["admin", "admin_super", "head_of_it"];
        if (!allowedRoles.includes(session.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const {
            nama,
            is_active,
            tanggal_buka_pendaftaran,
            tanggal_tutup_pendaftaran,
            biaya_pendaftaran,
        } = body;

        // Use transaction if setting as active
        const result = await prisma.$transaction(async (tx) => {
            // If setting as active, deactivate others
            if (is_active === true) {
                await tx.tahunAjaran.updateMany({
                    where: {
                        is_active: true,
                        id: { not: id }
                    },
                    data: { is_active: false },
                });
            }

            const updateData: any = {};
            if (nama) updateData.nama = nama;
            if (typeof is_active === "boolean") updateData.is_active = is_active;
            if (tanggal_buka_pendaftaran) updateData.tanggal_buka_pendaftaran = new Date(tanggal_buka_pendaftaran);
            if (tanggal_tutup_pendaftaran) updateData.tanggal_tutup_pendaftaran = new Date(tanggal_tutup_pendaftaran);
            if (biaya_pendaftaran !== undefined) updateData.biaya_pendaftaran = biaya_pendaftaran;

            updateData.updated_at = new Date();

            return await tx.tahunAjaran.update({
                where: { id },
                data: updateData,
            });
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Tahun ajaran PATCH error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
