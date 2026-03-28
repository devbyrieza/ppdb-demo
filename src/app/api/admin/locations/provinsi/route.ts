import { NextResponse } from "next/server";

// Cache for provinces
let provinsiCache: { data: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    // Check cache
    if (provinsiCache && Date.now() - provinsiCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({ data: provinsiCache.data });
    }

    // Fetch from external API
    const response = await fetch(
      "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch provinces");
    }

    const rawData = await response.json();

    // Transform to just names, sorted alphabetically
    const provinsis = rawData
      .map((p: { id: string; name: string }) => p.name)
      .sort((a: string, b: string) => a.localeCompare(b));

    // Cache the data
    provinsiCache = { data: provinsis, timestamp: Date.now() };

    return NextResponse.json({ data: provinsis });
  } catch (error) {
    console.error("Error fetching provinsi:", error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
