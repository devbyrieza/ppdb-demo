import { NextResponse } from "next/server";

// Cache for 1 hour
let provinsiCache: { data: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    // Check cache
    if (provinsiCache && Date.now() - provinsiCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({ success: true, data: provinsiCache.data });
    }

    const response = await fetch(
      "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch provinces");
    }

    const rawData = await response.json();

    // Sort alphabetically by name
    const data = rawData.sort((a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name)
    );

    // Cache the data
    provinsiCache = { data, timestamp: Date.now() };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching provinsi:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data provinsi" },
      { status: 500 }
    );
  }
}
