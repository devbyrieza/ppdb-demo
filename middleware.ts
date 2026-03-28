// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Role-Based Protection via app_session cookie
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse, type NextRequest } from "next/server";

function getSessionFromCookie(request: NextRequest): {
  role: string | null;
  id: string | null;
} {
  const sessionCookie = request.cookies.get("app_session");

  if (!sessionCookie) {
    return { role: null, id: null };
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    return {
      role: session.role || null,
      id: session.id || null,
    };
  } catch {
    return { role: null, id: null };
  }
}

export async function middleware(request: NextRequest) {
  const { role: userRole } = getSessionFromCookie(request);
  const { pathname } = request.nextUrl;

  // ═══════════════════════════════════════════
  // PROTECT: /dashboard/pendaftar
  // ═══════════════════════════════════════════
  if (pathname.startsWith("/dashboard/pendaftar")) {
    if (!userRole || userRole !== "pendaftar") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ═══════════════════════════════════════════
  // PROTECT: /dashboard/admin
  // ═══════════════════════════════════════════
  if (pathname.startsWith("/dashboard/admin")) {
    const allowedAdminRoles = ["admin_berkas", "admin_keuangan", "admin_super", "admin", "head_of_it", "tim_it"];
    if (!userRole || !allowedAdminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ═══════════════════════════════════════════
  // PROTECT: /dashboard/penguji
  // ═══════════════════════════════════════════
  if (pathname.startsWith("/dashboard/penguji")) {
    const allowedPengujiRoles = ["penguji", "penguji_calsan", "pewawancara_calsan", "pewawancara_cawalsan", "admin_super"];
    if (!userRole || !allowedPengujiRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ═══════════════════════════════════════════
  // REDIRECT: /dashboard (root) based on role
  // ═══════════════════════════════════════════
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (!userRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (userRole === "pendaftar") {
      return NextResponse.redirect(new URL("/dashboard/pendaftar", request.url));
    } else if (["admin_berkas", "admin_keuangan", "admin_super", "admin", "head_of_it", "tim_it"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    } else if (["penguji", "penguji_calsan", "pewawancara_calsan", "pewawancara_cawalsan"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/penguji", request.url));
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ═══════════════════════════════════════════
  // REDIRECT: /login if already logged in
  // ═══════════════════════════════════════════
  if (pathname === "/login" && userRole) {
    if (userRole === "pendaftar") {
      return NextResponse.redirect(new URL("/dashboard/pendaftar", request.url));
    } else if (["admin_berkas", "admin_keuangan", "admin_super", "admin", "head_of_it", "tim_it"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    } else if (["penguji", "penguji_calsan", "pewawancara_calsan", "pewawancara_cawalsan"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/penguji", request.url));
    }
  }

  // ═══════════════════════════════════════════
  // REDIRECT: /daftar if already logged in
  // ═══════════════════════════════════════════
  if (pathname.startsWith("/daftar") && userRole === "pendaftar") {
    return NextResponse.redirect(new URL("/dashboard/pendaftar", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
