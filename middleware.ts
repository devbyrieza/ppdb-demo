// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE: Role-Based Protection & Domain Routing
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
  const host = request.headers.get("host") || "";

  // ═══════════════════════════════════════════
  // DOMAIN ROUTING (Main Domain vs PPDB Subdomain)
  // ═══════════════════════════════════════════
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("192.168.");
  
  if (!isLocalhost) {
    const isPpdbDomain = host.startsWith("ppdb.");
    const ppdbPaths = [
      "/ppdb", "/login", "/daftar", "/daftar-pindahan", "/daftar-sukses", 
      "/dashboard", "/admin", "/auth", "/pilih-verifikasi", "/send-otp", "/verifikasi-otp"
    ];
    const isPpdbPath = ppdbPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
    
    // Only redirect if not an API or internal Next.js path
    const isStaticOrApi = pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".");
    
    if (!isStaticOrApi) {
      if (isPpdbDomain && !isPpdbPath && pathname !== "/") {
        // If on PPDB domain but trying to access non-PPDB path (like /tentang), redirect to main domain
        const mainDomain = host.replace("ppdb.", "");
        return NextResponse.redirect(new URL(pathname, `https://${mainDomain}`));
      }
      
      if (!isPpdbDomain && isPpdbPath) {
        // If on main domain but trying to access PPDB path, redirect to PPDB domain
        return NextResponse.redirect(new URL(pathname, `https://ppdb.${host}`));
      }
      
      if (isPpdbDomain && pathname === "/") {
        // Rewrite root of PPDB domain to /ppdb
        return NextResponse.rewrite(new URL("/ppdb", request.url));
      }
    }
  }

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
    const allowedAdminRoles = ["admin_berkas", "admin_keuangan", "admin_super", "admin"];
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
    } else if (["admin_berkas", "admin_keuangan", "admin_super", "admin"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    } else if (["penguji", "pewawancara_calsan", "pewawancara_cawalsan"].includes(userRole)) {
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
    } else if (["admin_berkas", "admin_keuangan", "admin_super", "admin"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    } else if (["penguji", "pewawancara_calsan", "pewawancara_cawalsan"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard/penguji", request.url));
    }
  }

  // ═══════════════════════════════════════════
  // REDIRECT: /daftar if already logged in
  // ═══════════════════════════════════════════
  if (pathname.startsWith("/daftar") && userRole === "pendaftar") {
    return NextResponse.redirect(new URL("/dashboard/pendaftar", request.url));
  }

  const response = NextResponse.next();

  // ═══════════════════════════════════════════
  // ROLLING SESSION: Automatically renew session cookie duration
  // ═══════════════════════════════════════════
  const rawSessionCookie = request.cookies.get("app_session");
  if (rawSessionCookie && userRole) {
    const maxAge = userRole === "pendaftar"
      ? 60 * 60 * 24 * 30  // 30 Days
      : 60 * 60 * 24 * 90; // 90 Days
      
    response.cookies.set("app_session", rawSessionCookie.value, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
