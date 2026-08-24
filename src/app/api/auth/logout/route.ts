import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const host = request.headers.get("host") || "";
  // Extract base domain if possible (e.g., "pesantren-ululalbaab.com" from "www.pesantren-ululalbaab.com")
  const domainParts = host.split('.');
  const baseDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : host.split(':')[0];

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const cookiesToClear = ["al_session", "siakad_session", "ppdb_session"];

  cookiesToClear.forEach(cookie => {
    // 1. Clear without domain (for cookies set dynamically)
    headers.append("Set-Cookie", `${cookie}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
    // 2. Clear with exact host
    headers.append("Set-Cookie", `${cookie}=; Path=/; Domain=${host.split(':')[0]}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
    // 3. Clear with base domain (for cookies set explicitly before the fix)
    headers.append("Set-Cookie", `${cookie}=; Path=/; Domain=${baseDomain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
    // 4. Clear with leading dot base domain (legacy compat)
    headers.append("Set-Cookie", `${cookie}=; Path=/; Domain=.${baseDomain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  });

  return new Response(JSON.stringify({ success: true, message: "Logout berhasil" }), {
    status: 200,
    headers: headers
  });
}
