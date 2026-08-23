// ============================================================================
// SERVER-SIDE PERMISSION CHECK HELPER
// Menggantikan pola allowedRoles.includes() yang berulang di setiap API route
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { ROLE_PERMISSIONS, type UserRole } from "@/lib/access-control";

export interface PermissionCheckResult {
  session: {
    id: string;
    role: UserRole;
    full_name?: string;
    name?: string;
  };
}

/**
 * Validasi permission di API route.
 * Return session jika authorized, throw NextResponse jika tidak.
 *
 * @example
 * ```ts
 * export async function GET() {
 *   const result = await requirePermission(['view_payment_list']);
 *   if (result instanceof NextResponse) return result; // 401/403
 *   const { session } = result;
 *   // ... logic
 * }
 * ```
 */
export async function requirePermission(
  requiredPermissions: string[],
): Promise<PermissionCheckResult | NextResponse> {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { error: "Tidak terautentikasi. Silakan login kembali." },
      { status: 401 },
    );
  }

  const role = session.role as UserRole;
  const userPermissions = ROLE_PERMISSIONS[role];

  if (!userPermissions) {
    return NextResponse.json(
      { error: "Role tidak dikenali." },
      { status: 403 },
    );
  }

  // Check if user has ALL required permissions
  const hasAll = requiredPermissions.every((perm) =>
    userPermissions.includes(perm),
  );

  if (!hasAll) {
    return NextResponse.json(
      {
        error: "Anda tidak memiliki izin untuk mengakses fitur ini.",
        required: requiredPermissions,
        your_role: role },
      { status: 403 },
    );
  }

  return { session: session as PermissionCheckResult["session"] };
}

/**
 * Validasi hanya berdasarkan role (tanpa cek permission detail).
 * Cocok untuk route yang hanya perlu cek "apakah admin" saja.
 */
export async function requireRole(
  allowedRoles: UserRole[],
): Promise<PermissionCheckResult | NextResponse> {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { error: "Tidak terautentikasi. Silakan login kembali." },
      { status: 401 },
    );
  }

  const role = session.role as UserRole;

  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      {
        error: "Anda tidak memiliki akses ke halaman ini.",
        your_role: role },
      { status: 403 },
    );
  }

  return { session: session as PermissionCheckResult["session"] };
}

/**
 * Helper: cek apakah response adalah NextResponse (error).
 */
export function isPermissionError(
  result: PermissionCheckResult | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
