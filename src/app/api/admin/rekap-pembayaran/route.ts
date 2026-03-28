import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        // 1. Auth Check
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("app_session");
        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);
        if (!session.role.startsWith("admin")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Fetch all pendaftar with their PENDAFTARAN payment(s)
        const pendaftar = await prisma.pendaftar.findMany({
            where: {
                deleted_at: null,
            },
            select: {
                id: true,
                nama_lengkap: true,
                nomor_pendaftaran: true,
                status_pendaftaran: true,
                created_at: true,
                updated_at: true,
                pembayaran: {
                    where: {
                        jenis_pembayaran: "PENDAFTARAN" as any,
                    },
                    select: {
                        id: true,
                        jumlah: true,
                        status_pembayaran: true,
                        metode_pembayaran: true,
                        created_at: true,
                        updated_at: true,
                    },
                    orderBy: { created_at: "desc" },
                },
            } as any,
            orderBy: { created_at: "desc" },
        });

        // 3. Transform
        const data = (pendaftar as any[]).map((p, index) => {
            const payments = p.pembayaran || [];
            const latestPayment = payments[0] || null;

            // Determine overall payment status
            const verifiedPayment = payments.find((pay: any) => pay.status_pembayaran === "verified");
            const pendingPayment = payments.find((pay: any) =>
                !["verified", "rejected"].includes(pay.status_pembayaran)
            );

            let statusPembayaran = "BELUM_UPLOAD";
            let statusColor = "gray";
            if (verifiedPayment) {
                statusPembayaran = "TERVERIFIKASI";
                statusColor = "green";
            } else if (pendingPayment) {
                statusPembayaran = "MENUNGGU_VERIFIKASI";
                statusColor = "orange";
            } else if (payments.some((pay: any) => pay.status_pembayaran === "rejected")) {
                statusPembayaran = "DITOLAK";
                statusColor = "red";
            }

            const totalBayar = payments
                .filter((pay: any) => pay.status_pembayaran === "verified")
                .reduce((sum: number, pay: any) => sum + Number(pay.jumlah), 0);

            return {
                no: index + 1,
                id: p.id,
                nama: p.nama_lengkap,
                nomor_pendaftaran: p.nomor_pendaftaran,
                status_pendaftaran: p.status_pendaftaran,
                total_bayar: totalBayar,
                jumlah_pembayaran: latestPayment ? Number(latestPayment.jumlah) : 0,
                status_pembayaran: statusPembayaran,
                status_color: statusColor,
                metode: latestPayment?.metode_pembayaran || "-",
                tanggal_daftar: p.created_at,
                last_updated: latestPayment?.updated_at || p.updated_at,
            };
        });

        // 4. Summary stats
        const summary = {
            total: data.length,
            terverifikasi: data.filter(d => d.status_pembayaran === "TERVERIFIKASI").length,
            menunggu: data.filter(d => d.status_pembayaran === "MENUNGGU_VERIFIKASI").length,
            belum_upload: data.filter(d => d.status_pembayaran === "BELUM_UPLOAD").length,
            ditolak: data.filter(d => d.status_pembayaran === "DITOLAK").length,
            total_terkumpul: data.reduce((sum, d) => sum + d.total_bayar, 0),
        };

        return NextResponse.json({ success: true, data, summary });

    } catch (error) {
        console.error("Error fetching pembayaran pendaftaran rekap:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
