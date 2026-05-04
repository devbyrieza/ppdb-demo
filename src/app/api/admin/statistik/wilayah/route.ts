import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { getAdminWhereClause } from "@/lib/utils/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (
      !session ||
      !["admin", "admin_super", "admin_berkas"].includes(session.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let tahunAjaranId = searchParams.get("tahun_ajaran_id");

    const where = getAdminWhereClause(tahunAjaranId || undefined) as any;

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

    // Aggregate Family by Region
    const allFamilyData = await prisma.orangTua.findMany({
      where: {
        pendaftar: {
          ...where,
        },
      },
      include: {
        pendaftar: {
          select: {
            provinsi: true,
            kabupaten: true,
          },
        },
      },
    });

    const waliGroups: any = {};
    const ayahGroups: any = {};
    const ibuGroups: any = {};

    const toTitleCase = (str: string) => {
      if (!str) return "Lainnya";
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    allFamilyData.forEach((ot) => {
      const santriProv = ot.pendaftar?.provinsi || "Lainnya";
      const santriKab = ot.pendaftar?.kabupaten || "Lainnya";

      const pWali = ot.provinsi_wali || santriProv;
      const kWali = ot.kabupaten_wali || santriKab;

      const pAyah = santriProv;
      const kAyah = santriKab;

      const pIbu = santriProv;
      const kIbu = santriKab;

      const processGroup = (group: any, provRaw: string, kabRaw: string) => {
        const prov = toTitleCase(provRaw);
        const kab = toTitleCase(kabRaw);

        if (prov === "Lainnya" && kab === "Lainnya") return;
        if (!group[prov]) {
          group[prov] = { total: 0, cities: {} as Record<string, number> };
        }
        group[prov].total += 1;
        group[prov].cities[kab] = (group[prov].cities[kab] || 0) + 1;
      };

      processGroup(waliGroups, pWali, kWali);
      processGroup(ayahGroups, pAyah, kAyah);
      processGroup(ibuGroups, pIbu, kIbu);
    });

    const formatGroupData = (groups: any) => {
      const formatted: any = {};
      Object.keys(groups).forEach((prov) => {
        formatted[prov] = {
          total: groups[prov].total,
          cities: Object.entries(groups[prov].cities).map(([name, count]) => ({
            name,
            count,
          })),
        };
      });
      return formatted;
    };

    const formatSantriData = (
      raw: any[],
      provField: string,
      kabField: string,
    ) => {
      const grouped: any = {};
      raw.forEach((item) => {
        const prov = toTitleCase(item[provField]);
        const kab = toTitleCase(item[kabField]);
        const count = item._count.id;

        if (!grouped[prov]) {
          grouped[prov] = {
            total: 0,
            cities: {} as Record<string, number>,
          };
        }

        grouped[prov].total += count;
        grouped[prov].cities[kab] = (grouped[prov].cities[kab] || 0) + count;
      });

      // Final transform to matches UI expectation (cities array)
      const finalGrouped: any = {};
      Object.entries(grouped).forEach(([prov, data]: [string, any]) => {
        finalGrouped[prov] = {
          total: data.total,
          cities: Object.entries(data.cities).map(([name, count]) => ({
            name,
            count,
          })),
        };
      });
      return finalGrouped;
    };

    return NextResponse.json({
      success: true,
      santri: formatSantriData(santriRaw, "provinsi", "kabupaten"),
      ayah: formatGroupData(ayahGroups),
      ibu: formatGroupData(ibuGroups),
      wali: formatGroupData(waliGroups),
    });
  } catch (error: any) {
    console.error("Statistik error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
