import { cookies } from "next/headers";
import { UserRole } from "@/lib/access-control";
import AdminSidebar from "./AdminSidebar";
import { prisma } from "@/lib/prisma";

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
      }
    } catch (error) {
      console.error("Failed to parse session cookie", error);
    }
  }

  return (
    <AdminSidebar userRole={userRole} adminName={adminName} userId={userId} availableRoles={availableRoles}>
      {children}
    </AdminSidebar>
  );
}
