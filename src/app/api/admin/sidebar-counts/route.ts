import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminWhereClause, resolveTahunAjaran } from "@/lib/utils/admin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const userRole = session.role;

    if (userRole === "pendaftar") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const baseWhere = await getAdminWhereClause();

    const [pendingPayments, pendingDocs, pendingRequests, pendingReschedules] = await Promise.all([
      prisma.pembayaran.findMany({
        where: {
          status_pembayaran: { notIn: ["verified", "rejected"] },
          pendaftar: baseWhere,
        },
        select: {
          id: true,
          pendaftar: {
            select: {
              nomor_pendaftaran: true,
              created_at: true,
              tahun_ajaran: { select: { nama: true } },
            },
          },
        },
      }),
      prisma.dokumen.findMany({
        where: {
          is_verified: false,
          catatan: null,
          pendaftar: baseWhere,
        },
        select: {
          id: true,
          pendaftar: {
            select: {
              nomor_pendaftaran: true,
              created_at: true,
              tahun_ajaran: { select: { nama: true } },
            },
          },
        },
      }),
      prisma.dataPerubahanRequest.findMany({
        where: {
          status: { in: ["pending", "submitted"] },
          pendaftar: baseWhere,
        },
        select: {
          id: true,
          pendaftar: {
            select: {
              nomor_pendaftaran: true,
              created_at: true,
              tahun_ajaran: { select: { nama: true } },
            },
          },
        },
      }),
      prisma.jadwalUjian.findMany({
        where: {
          catatan: { contains: "RESCHEDULE_REQUEST" },
          pendaftar: baseWhere,
        },
        select: {
          id: true,
          catatan: true,
          pendaftar: {
            select: {
              nomor_pendaftaran: true,
              created_at: true,
              tahun_ajaran: { select: { nama: true } },
            },
          },
        },
      }),
    ]);

    const unverifiedPaymentsCount = pendingPayments.filter((p) => {
      if (!p.pendaftar) return false;
      return resolveTahunAjaran(p.pendaftar) === "2027/2028";
    }).length;

    const unverifiedDocsCount = pendingDocs.filter((d) => {
      if (!d.pendaftar) return false;
      return resolveTahunAjaran(d.pendaftar) === "2027/2028";
    }).length;

    const pendingDataRequestsCount = pendingRequests.filter((r) => {
      if (!r.pendaftar) return false;
      return resolveTahunAjaran(r.pendaftar) === "2027/2028";
    }).length;

    const pendingRescheduleCount = pendingReschedules.filter((j) => {
      try {
        if (!j.catatan || !j.pendaftar) return false;
        if (resolveTahunAjaran(j.pendaftar) !== "2027/2028") return false;
        const parsed = JSON.parse(j.catatan);
        return parsed.type === "RESCHEDULE_REQUEST" && parsed.status === "pending";
      } catch {
        return false;
      }
    }).length;

    return NextResponse.json({
      unverifiedPaymentsCount,
      unverifiedDocsCount,
      pendingDataRequestsCount,
      pendingRescheduleCount,
    });
  } catch (error) {
    console.error("Error fetching sidebar counts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
