import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil" });

  const host = request.headers.get("host") || "";
  let baseDomain = "";
  if (host.includes("pesantren-alandalus-putra.com")) {
    baseDomain = "pesantren-alandalus-putra.com";
  } else if (host.includes("pesantren-alandalus-putri.com")) {
    baseDomain = "pesantren-alandalus-putri.com";
  } else if (host.includes("alandalus-ululalbaab.com")) {
    baseDomain = "alandalus-ululalbaab.com";
  } else if (host.includes("pesantren-alimam.com")) {
    baseDomain = "pesantren-alimam.com";
  }

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  if (baseDomain) {
    headers.append("Set-Cookie", `al_session=; Path=/; Max-Age=0; Domain=${baseDomain}`);
    headers.append("Set-Cookie", `siakad_session=; Path=/; Max-Age=0; Domain=${baseDomain}`);
    headers.append("Set-Cookie", `ppdb_session=; Path=/; Max-Age=0; Domain=${baseDomain}`);
  }

  headers.append("Set-Cookie", "al_session=; Path=/; Max-Age=0");
  headers.append("Set-Cookie", "siakad_session=; Path=/; Max-Age=0");
  headers.append("Set-Cookie", "ppdb_session=; Path=/; Max-Age=0");

  return new Response(JSON.stringify({ success: true, message: "Logout berhasil" }), {
    status: 200,
    headers: headers });
}

