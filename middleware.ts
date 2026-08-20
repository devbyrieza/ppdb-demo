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
    const isSafinaDomain = host.startsWith("safina.") || host.startsWith("keuangan.");
    const isAppDomain = isPpdbDomain || isSafinaDomain;

    const ppdbPaths = [
      "/ppdb", "/login", "/daftar", "/daftar-pindahan", "/daftar-sukses", 
      "/dashboard", "/admin", "/auth", "/pilih-verifikasi", "/send-otp", "/verifikasi-otp",
      "/panitia", "/bank-soal"
    ];
    const isPpdbPath = ppdbPaths.some(p => pathname === p || pathname.startsWith(p + "/"));
    
    // Only redirect if not an API or internal Next.js path
    const isStaticOrApi = pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".");
    
    if (!isStaticOrApi) {
      if (isSafinaDomain) {
        // Auto-redirect keuangan.* to safina.* for brand consistency
        if (host.startsWith("keuangan.")) {
          const redirectUrl = new URL(pathname, `https://${host.replace("keuangan.", "safina.")}`);
          redirectUrl.search = request.nextUrl.search;
          return NextResponse.redirect(redirectUrl);
        }

        // If accessing root of Safina, go straight to login
        if (pathname === "/") {
          const redirectUrl = new URL("/login", request.url);
          redirectUrl.search = request.nextUrl.search;
          return NextResponse.redirect(redirectUrl);
        }
      }

      if (isAppDomain && !isPpdbPath && pathname !== "/") {
        // If on App domain (PPDB/Safina) but trying to access non-App path (like /tentang), redirect to main website
        const mainDomain = host.replace("ppdb.", "").replace("safina.", "").replace("keuangan.", "");
        const redirectUrl = new URL(pathname, `https://${mainDomain}`);
        redirectUrl.search = request.nextUrl.search;
        return NextResponse.redirect(redirectUrl);
      }
      
      if (!isAppDomain && isPpdbPath) {
        // If on main website domain but trying to access App path, redirect to PPDB domain
        const baseHost = host.replace(/^www\./, "");
        const newPathname = pathname === "/ppdb" ? "/" : pathname;
        const redirectUrl = new URL(newPathname, `https://ppdb.${baseHost}`);
        redirectUrl.search = request.nextUrl.search;
        return NextResponse.redirect(redirectUrl);
      }
      
      if (isPpdbDomain) {
        if (pathname === "/ppdb") {
          const redirectUrl = new URL("/", request.url);
          redirectUrl.search = request.nextUrl.search;
          return NextResponse.redirect(redirectUrl);
        }

        if (pathname === "/") {
          // Rewrite root of PPDB domain to /ppdb
          return NextResponse.rewrite(new URL("/ppdb", request.url));
        }
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
    const maxAge = 60 * 60 * 24 * 90; // 90 Days
    const expires = new Date(Date.now() + maxAge * 1000);
      
    response.cookies.set("app_session", rawSessionCookie.value, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      expires,
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
