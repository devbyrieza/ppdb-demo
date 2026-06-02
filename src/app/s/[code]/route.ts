import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMagicToken } from "@/lib/utils/magic-link";
import { createHmac } from "crypto";

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev";

export async function GET(req: Request, { params }: { params: { code: string } }) {
  try {
    const { code } = params;
    
    if (!code || !code.includes("-")) {
      return NextResponse.redirect(new URL("/login?error=Link_tidak_valid", req.url));
    }

    const [nomor_pendaftaran, hash] = code.split("-");

    // Reconstruct the expected hash
    const expectedHash = createHmac("sha256", MAGIC_LINK_SECRET)
      .update(nomor_pendaftaran)
      .digest("hex")
      .slice(0, 8);

    if (hash !== expectedHash) {
      return NextResponse.redirect(new URL("/login?error=Link_tidak_valid", req.url));
    }

    // Hash is valid, let's find the pendaftar
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { nomor_pendaftaran },
      select: { user_id: true, nama_lengkap: true }
    });

    if (!pendaftar || !pendaftar.user_id) {
      return NextResponse.redirect(new URL("/login?error=Pendaftar_tidak_ditemukan", req.url));
    }

    // Determine redirect target based on query param, default to seragam
    const url = new URL(req.url);
    const targetQuery = url.searchParams.get("t");
    let redirectPath = "/dashboard/pendaftar/seragam";
    
    if (targetQuery === "jadwal") {
      redirectPath = "/dashboard/pendaftar/jadwal";
    }
    // Add more types here in the future if needed

    // Generate the actual magic token (valid for 48 hours)
    const token = generateMagicToken(
      pendaftar.user_id,
      "pendaftar",
      pendaftar.nama_lengkap,
      48,
      redirectPath
    );

    // Redirect to the internal magic auth handler
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL(`/api/auth/magic?token=${token}`, baseUrl));
  } catch (error) {
    console.error("Short Link Error:", error);
    return NextResponse.redirect(new URL("/login?error=Terjadi_kesalahan", req.url));
  }
}
