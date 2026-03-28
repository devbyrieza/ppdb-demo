import { NextResponse } from "next/server";

// Cache for provinces (to get ID from name)
let provincesCache: { data: any[]; timestamp: number } | null = null;
// Cache for kabupaten per province ID
const kabupatenCache: Map<string, { data: string[]; timestamp: number }> = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getProvinces() {
  if (provincesCache && Date.now() - provincesCache.timestamp < CACHE_DURATION) {
    return provincesCache.data;
  }

  const response = await fetch(
    "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json"
  );
  if (!response.ok) throw new Error("Failed to fetch provinces");

  const data = await response.json();
  provincesCache = { data, timestamp: Date.now() };
  return data;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const provinsiName = url.searchParams.get("provinsi");

    if (!provinsiName) {
      return NextResponse.json({ data: [] });
    }

    // Get provinces to find the ID
    const provinces = await getProvinces();
    const province = provinces.find(
      (p: { id: string; name: string }) =>
        p.name.toUpperCase() === provinsiName.toUpperCase()
    );

    if (!province) {
      console.error("Province not found:", provinsiName);
      return NextResponse.json({ data: [] });
    }

    // Check cache for kabupaten
    const cached = kabupatenCache.get(province.id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ data: cached.data });
    }

    // Fetch kabupaten from external API
    const response = await fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${province.id}.json`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch kabupaten");
    }

    const rawData = await response.json();

    // Extract just the names, sorted
    const kabupatenNames = rawData
      .map((k: { id: string; name: string }) => k.name)
      .sort((a: string, b: string) => a.localeCompare(b));

    // Cache
    kabupatenCache.set(province.id, { data: kabupatenNames, timestamp: Date.now() });

    return NextResponse.json({ data: kabupatenNames });
  } catch (error) {
    console.error("Error fetching kabupaten:", error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
