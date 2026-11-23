import { cookies } from "next/headers";
import { UserRole } from "@/lib/access-control";
import AdminSidebar from "./AdminSidebar";
import { prisma } from "@/lib/prisma";
import { getAdminWhereClause, resolveTahunAjaran } from "@/lib/utils/admin";

export default async function AdminDashboardLayout({
  children }: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");

  let userRole: UserRole | null = null;
  let adminName = "Admin";
  let userId = "";
  let availableRoles: string[] = [];
  let unverifiedPaymentsCount = 0;
  let unverifiedDocsCount = 0;
  let pendingDataRequestsCount = 0;
  let pendingRescheduleCount = 0;

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      userRole = session.role as UserRole;
      adminName = session.full_name || "Admin";
      userId = session.id;

      if (userId && userRole !== "pendaftar") {
        const profile = await prisma.profile.findUnique({
          where: { id: userId },
          select: { role: true, secondary_roles: true } });
        if (profile) {
          availableRoles = [profile.role, ...(profile.secondary_roles || [])];
        }

        // Fetch real-time count badges for the admin sidebar (filtered for active Tahun Ajaran 2027/2028)
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

        unverifiedPaymentsCount = pendingPayments.filter((p) => {
          if (!p.pendaftar) return false;
          return resolveTahunAjaran(p.pendaftar) === "2027/2028";
        }).length;

        unverifiedDocsCount = pendingDocs.filter((d) => {
          if (!d.pendaftar) return false;
          return resolveTahunAjaran(d.pendaftar) === "2027/2028";
        }).length;

        pendingDataRequestsCount = pendingRequests.filter((r) => {
          if (!r.pendaftar) return false;
          return resolveTahunAjaran(r.pendaftar) === "2027/2028";
        }).length;

        pendingRescheduleCount = pendingReschedules.filter((j) => {
          try {
            if (!j.catatan || !j.pendaftar) return false;
            if (resolveTahunAjaran(j.pendaftar) !== "2027/2028") return false;
            const parsed = JSON.parse(j.catatan);
            return parsed.type === "RESCHEDULE_REQUEST" && parsed.status === "pending";
          } catch {
            return false;
          }
        }).length;

      }
    } catch (error) {
      console.error("Failed to parse session cookie or query sidebar stats:", error);
    }
  }

  return (
    <AdminSidebar
      userRole={userRole}
      adminName={adminName}
      userId={userId}
      availableRoles={availableRoles}
      unverifiedPaymentsCount={unverifiedPaymentsCount}
      unverifiedDocsCount={unverifiedDocsCount}
      pendingDataRequestsCount={pendingDataRequestsCount}
      pendingRescheduleCount={pendingRescheduleCount}
    >
      {children}
    </AdminSidebar>
  );
}
