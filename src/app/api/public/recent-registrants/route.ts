import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/recent-registrants
 * Returns recent registrants for social proof toast (LiveActivityToast).
 * Only returns first name + initial, city, and program — no sensitive data.
 */
export async function GET() {
  try {
    const registrants = await prisma.pendaftar.findMany({
      where: {
        deleted_at: null,
        kabupaten: {
          not: null },
        status_pendaftaran: {
          notIn: ['mengundurkan_diri', 'ditolak', 'batal', 'cabut_berkas', 'sampah', 'deleted']
        }
      },
      select: {
        nama_lengkap: true,
        kabupaten: true,
        jenjang: true,
        created_at: true },
      orderBy: { created_at: "desc" },
      take: 20 });

    // Filter out empty strings in memory if any
    const validRegistrants = registrants.filter(
      (r) => r.kabupaten && r.kabupaten.trim() !== "",
    );

    // Privacy: show "First Name L." format (e.g. "Raylan A.")
    const safe = validRegistrants.map((r) => {
      const parts = r.nama_lengkap.trim().split(/\s+/);
      const firstName = parts[0];
      const lastInitial =
        parts.length > 1 ? ` ${parts[parts.length - 1][0]}.` : "";
      const displayName = `${firstName}${lastInitial}`;

      // Map jenjang to friendly program name
      const programMap: Record<string, string> = {
        mts: "SMP IT",
        ma: "SMA IT",
        idad: "I'dad Lughowi",
        "i'dad": "I'dad Lughowi",
        "i'dad lughowi": "I'dad Lughowi" };
      const program =
        programMap[r.jenjang?.toLowerCase() || ""] ||
        r.jenjang ||
        "SMP IT";

      // City: use kabupaten, strip "Kab. " or "Kota " prefix for brevity
      const city = (r.kabupaten || "")
        .replace(/^Kab\.\s*/i, "")
        .replace(/^Kabupaten\s*/i, "")
        .replace(/^Kota\s*/i, "")
        .trim();

      return { name: displayName, city, program };
    });

    return NextResponse.json({ registrants: safe });
  } catch (error) {
    console.error("Error fetching recent registrants:", error);
    return NextResponse.json({ registrants: [] });
  }
}
