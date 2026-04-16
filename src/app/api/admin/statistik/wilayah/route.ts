import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session || !["admin", "admin_super", "admin_berkas"].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        let tahunAjaranId = searchParams.get("tahun_ajaran_id");

        // If no year specified, default to active academic year to prevent cross-year data pollution
        if (!tahunAjaranId) {
            const activeTA = await prisma.tahunAjaran.findFirst({
                where: { is_active: true }
            });
            tahunAjaranId = activeTA?.id || null;
        }

        const where: any = {
            deleted_at: null,
        };
        if (tahunAjaranId) {
            where.tahun_ajaran_id = tahunAjaranId;
        }

        // Aggregate Santri by Region
        const santriRaw = await prisma.pendaftar.groupBy({
            by: ["provinsi", "kabupaten"],
            _count: {
                id: true,
            },
            where: {
                ...where,
                provinsi: { not: null },
            },
        });

        // Families
        const allFamilyData = await prisma.orangTua.findMany({
            where: {
                pendaftar: {
                    ...where,
                }
            },
            include: {
                pendaftar: {
                    select: {
                        provinsi: true,
                        kabupaten: true
                    }
                }
            }
        });

        const toTitleCase = (str: string) => {
            if (!str) return "Lainnya";
            return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        };

        const formatGroupedData = (raw: any[], provField: string, kabField: string) => {
            const grouped: any = {};
            raw.forEach((item) => {
                const prov = toTitleCase(item[provField]);
                const kab = toTitleCase(item[kabField]);
                const count = item._count?.id || 1;

                if (!grouped[prov]) {
                    grouped[prov] = { total: 0, cities: {} as Record<string, number> };
                }
                grouped[prov].total += count;
                grouped[prov].cities[kab] = (grouped[prov].cities[kab] || 0) + count;
            });

            // Convert to UI format (cities array)
            const finalGrouped: any = {};
            Object.entries(grouped).forEach(([prov, data]: [string, any]) => {
                finalGrouped[prov] = {
                    total: data.total,
                    cities: Object.entries(data.cities).map(([name, count]) => ({
                        name,
                        count
                    }))
                };
            });
            return finalGrouped;
        };

        const waliGroups: any = {};
        allFamilyData.forEach((ot) => {
            const santriProv = ot.pendaftar?.provinsi || "Lainnya";
            const santriKab = ot.pendaftar?.kabupaten || "Lainnya";
            const pWali = toTitleCase(ot.provinsi_wali || santriProv);
            const kWali = toTitleCase(ot.kabupaten_wali || santriKab);
            
            if (!waliGroups[pWali]) {
                waliGroups[pWali] = { total: 0, cities: {} as Record<string, number> };
            }
            waliGroups[pWali].total += 1;
            waliGroups[pWali].cities[kWali] = (waliGroups[pWali].cities[kWali] || 0) + 1;
        });

        const formattedWali: any = {};
        Object.entries(waliGroups).forEach(([prov, data]: [string, any]) => {
            formattedWali[prov] = {
                total: data.total,
                cities: Object.entries(data.cities).map(([name, count]) => ({ name, count }))
            };
        });

        return NextResponse.json({
            success: true,
            santri: formatGroupedData(santriRaw, "provinsi", "kabupaten"),
            wali: formattedWali,
        });
    } catch (error: any) {
        console.error("Statistik error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
