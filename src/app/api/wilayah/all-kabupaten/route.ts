import { NextResponse } from "next/server";

// Cache for 24 hours (kabupaten names don't change often)
let allKabupatenCache: { data: string[]; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    if (
      allKabupatenCache &&
      Date.now() - allKabupatenCache.timestamp < CACHE_DURATION
    ) {
      return NextResponse.json({ success: true, data: allKabupatenCache.data });
    }

    // 1. Get all provinces
    const provincesRes = await fetch(
      "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
    );
    if (!provincesRes.ok) throw new Error("Failed to fetch provinces");
    const provinces = await provincesRes.json();

    // 2. Fetch all regencies for each province in parallel
    const allRegenciesPromises = provinces.map(async (p: { id: string }) => {
      const res = await fetch(
        `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${p.id}.json`,
      );
      if (!res.ok) return [];
      return res.json();
    });

    const regenciesResults = await Promise.all(allRegenciesPromises);

    // 3. Flatten and extract names, sort them
    const allNames = regenciesResults
      .flat()
      .map((r: { name: string }) => r.name)
      .sort((a, b) => a.localeCompare(b));

    // 4. Cache and return
    allKabupatenCache = { data: allNames, timestamp: Date.now() };

    return NextResponse.json({ success: true, data: allNames });
  } catch (error) {
    console.error("Error fetching all kabupaten:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data wilayah" },
      { status: 500 },
    );
  }
}
