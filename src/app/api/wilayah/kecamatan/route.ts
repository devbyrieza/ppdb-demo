import { NextResponse } from "next/server";

// Cache per kabupaten
const kecamatanCache: Map<string, { data: any[]; timestamp: number }> = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const kabupatenId = url.searchParams.get("kabupaten_id");

    if (!kabupatenId) {
      return NextResponse.json(
        { success: false, error: "kabupaten_id is required" },
        { status: 400 }
      );
    }

    // Check cache
    const cached = kecamatanCache.get(kabupatenId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ success: true, data: cached.data });
    }

    const response = await fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${kabupatenId}.json`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch districts");
    }

    const rawData = await response.json();

    // Sort alphabetically by name
    const data = rawData.sort((a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name)
    );

    // Cache the data
    kecamatanCache.set(kabupatenId, { data, timestamp: Date.now() });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching kecamatan:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data kecamatan" },
      { status: 500 }
    );
  }
}
