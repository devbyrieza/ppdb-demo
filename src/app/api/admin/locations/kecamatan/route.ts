import { NextResponse } from "next/server";

// Cache
let provincesCache: { data: any[]; timestamp: number } | null = null;
const regenciesCache: Map<string, { data: any[]; timestamp: number }> = new Map();
const kecamatanCache: Map<string, { data: string[]; timestamp: number }> = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getProvinces() {
  if (provincesCache && Date.now() - provincesCache.timestamp < CACHE_DURATION) {
    return provincesCache.data;
  }
  const response = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
  if (!response.ok) throw new Error("Failed to fetch provinces");
  const data = await response.json();
  provincesCache = { data, timestamp: Date.now() };
  return data;
}

async function getRegencies(provinceId: string) {
  const cached = regenciesCache.get(provinceId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
  if (!response.ok) throw new Error("Failed to fetch regencies");
  const data = await response.json();
  regenciesCache.set(provinceId, { data, timestamp: Date.now() });
  return data;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const provinsiName = url.searchParams.get("provinsi");
    const kabupatenName = url.searchParams.get("kabupaten");

    if (!provinsiName || !kabupatenName) {
      return NextResponse.json({ data: [] });
    }

    // Get province ID
    const provinces = await getProvinces();
    const province = provinces.find(
      (p: { id: string; name: string }) => p.name.toUpperCase() === provinsiName.toUpperCase()
    );
    if (!province) return NextResponse.json({ data: [] });

    // Get kabupaten ID
    const regencies = await getRegencies(province.id);
    const regency = regencies.find(
      (r: { id: string; name: string }) => r.name.toUpperCase() === kabupatenName.toUpperCase()
    );
    if (!regency) return NextResponse.json({ data: [] });

    // Check cache
    const cacheKey = regency.id;
    const cached = kecamatanCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ data: cached.data });
    }

    // Fetch kecamatan
    const response = await fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regency.id}.json`
    );
    if (!response.ok) throw new Error("Failed to fetch kecamatan");

    const rawData = await response.json();
    const kecamatanNames = rawData
      .map((k: { id: string; name: string }) => k.name)
      .sort((a: string, b: string) => a.localeCompare(b));

    kecamatanCache.set(cacheKey, { data: kecamatanNames, timestamp: Date.now() });

    return NextResponse.json({ data: kecamatanNames });
  } catch (error) {
    console.error("Error fetching kecamatan:", error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
