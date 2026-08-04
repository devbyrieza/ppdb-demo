import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil",
  });

  // Clear auth session cookie
  
  response.cookies.delete({ name: "app_session", domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined });
  response.cookies.delete({ name: "siakad_session", domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined });
  response.cookies.delete({ name: "ppdb_session", domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined });
  // local un-domained cleanup fallback
  response.cookies.delete("app_session");
  response.cookies.delete("siakad_session");
  response.cookies.delete("ppdb_session");
                    
  
  response.cookies.delete({ name: "app_session", domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined });
  response.cookies.delete({ name: "siakad_session", domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined });
  response.cookies.delete({ name: "ppdb_session", domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined });
  // local un-domained cleanup fallback
  response.cookies.delete("app_session");
  response.cookies.delete("siakad_session");
  response.cookies.delete("ppdb_session");
                    

  return response;
}
