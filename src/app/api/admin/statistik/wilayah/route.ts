import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session || !["admin", "admin_super", "admin_berkas"].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Aggregate Santri by Region
        const santriRaw = await prisma.pendaftar.groupBy({
            by: ["provinsi", "kabupaten"],
            _count: {
                id: true,
            },
            where: {
                provinsi: { not: null },
            },
        });

        // Aggregate Wali by Region
        const waliRaw = await prisma.orangTua.groupBy({
            by: ["provinsi_wali", "kabupaten_wali"],
            _count: {
                id: true,
            },
            where: {
                provinsi_wali: { not: null },
            },
        });

        // Aggregate Schools by Region (Schools are in Pendaftar.provinsi_sekolah/kabupaten_sekolah?)
        // Wait, let me check Pendaftar model again.
        // [Pendaftar model only has asal_sekolah, npsn, alamat_sekolah]
        // It doesn't have explicit school region fields yet. 
        // Usually school region is same as student or extracted from alamat_sekolah.
        // For now, I'll aggregate Santri and Wali.

        const formatData = (raw: any[], provField: string, kabField: string) => {
            const grouped: any = {};
            raw.forEach((item) => {
                const prov = item[provField] || "Lainnya";
                const kab = item[kabField] || "Lainnya";
                const count = item._count.id;

                if (!grouped[prov]) {
                    grouped[prov] = {
                        total: 0,
                        cities: [],
                    };
                }

                grouped[prov].total += count;
                grouped[prov].cities.push({
                    name: kab,
                    count: count,
                });
            });
            return grouped;
        };

        const santriData = formatData(santriRaw, "provinsi", "kabupaten");
        const waliData = formatData(waliRaw, "provinsi_wali", "kabupaten_wali");

        return NextResponse.json({
            success: true,
            santri: santriData,
            wali: waliData,
        });
    } catch (error: any) {
        console.error("Statistik error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
