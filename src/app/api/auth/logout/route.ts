import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil"
  });

  // Delete all possible session cookies reliably
  response.cookies.delete("al_session");
  response.cookies.delete("siakad_session");
  response.cookies.delete("ppdb_session");
  
  return response;
}
