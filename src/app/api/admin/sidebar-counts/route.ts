import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminWhereClause } from "@/lib/utils/admin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userRole = session.role;

    if (userRole === "pendaftar") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const baseWhere = getAdminWhereClause();

    const [unverifiedPaymentsCount, unverifiedDocsCount, pendingDataRequestsCount] = await Promise.all([
      prisma.pembayaran.count({
        where: {
          status_pembayaran: { notIn: ["verified", "rejected"] },
          pendaftar: baseWhere,
        },
      }),
      prisma.dokumen.count({
        where: {
          is_verified: false,
          catatan: null,
          pendaftar: baseWhere,
        },
      }),
      prisma.dataPerubahanRequest.count({
        where: {
          status: { in: ["pending", "submitted"] },
          pendaftar: baseWhere,
        },
      })
    ]);

    return NextResponse.json({
      unverifiedPaymentsCount,
      unverifiedDocsCount,
      pendingDataRequestsCount,
    });
  } catch (error) {
    console.error("Error fetching sidebar counts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
