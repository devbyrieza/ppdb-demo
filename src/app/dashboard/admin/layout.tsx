import { cookies } from "next/headers";
import { UserRole } from "@/lib/access-control";
import AdminSidebar from "./AdminSidebar";
import { prisma } from "@/lib/prisma";
import { getAdminWhereClause } from "@/lib/utils/admin";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");

  let userRole: UserRole | null = null;
  let adminName = "Admin";
  let userId = "";
  let availableRoles: string[] = [];
  let unverifiedPaymentsCount = 0;
  let unverifiedDocsCount = 0;
  let pendingDataRequestsCount = 0;

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      userRole = session.role as UserRole;
      adminName = session.full_name || "Admin";
      userId = session.id;

      if (userId && userRole !== "pendaftar") {
        const profile = await prisma.profile.findUnique({
          where: { id: userId },
          select: { role: true, secondary_roles: true },
        });
        if (profile) {
          availableRoles = [profile.role, ...(profile.secondary_roles || [])];
        }

        // Fetch real-time count badges for the admin sidebar
        const baseWhere = getAdminWhereClause();

        // 1. Payments waiting for verification (status is not verified and not rejected)
        unverifiedPaymentsCount = await prisma.pembayaran.count({
          where: {
            status_pembayaran: { notIn: ["verified", "rejected"] },
            pendaftar: baseWhere,
          },
        });

        // 2. Documents waiting for verification (is_verified is false, no verification notes/catatan yet)
        unverifiedDocsCount = await prisma.dokumen.count({
          where: {
            is_verified: false,
            catatan: null,
            pendaftar: baseWhere,
          },
        });

        // 3. Edit profile requests waiting for action (status is pending or submitted)
        pendingDataRequestsCount = await prisma.dataPerubahanRequest.count({
          where: {
            status: { in: ["pending", "submitted"] },
            pendaftar: baseWhere,
          },
        });
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
    >
      {children}
    </AdminSidebar>
  );
}
