import { NextResponse } from "next/server";

// Cache
let provincesCache: { data: any[]; timestamp: number } | null = null;
const regenciesCache: Map<string, { data: any[]; timestamp: number }> = new Map();
const districtsCache: Map<string, { data: any[]; timestamp: number }> = new Map();
const kelurahanCache: Map<string, { data: string[]; timestamp: number }> = new Map();
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

async function getDistricts(regencyId: string) {
  const cached = districtsCache.get(regencyId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`);
  if (!response.ok) throw new Error("Failed to fetch districts");
  const data = await response.json();
  districtsCache.set(regencyId, { data, timestamp: Date.now() });
  return data;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const provinsiName = url.searchParams.get("provinsi");
    const kabupatenName = url.searchParams.get("kabupaten");
    const kecamatanName = url.searchParams.get("kecamatan");

    if (!provinsiName || !kabupatenName || !kecamatanName) {
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

    // Get kecamatan ID
    const districts = await getDistricts(regency.id);
    const district = districts.find(
      (d: { id: string; name: string }) => d.name.toUpperCase() === kecamatanName.toUpperCase()
    );
    if (!district) return NextResponse.json({ data: [] });

    // Check cache
    const cacheKey = district.id;
    const cached = kelurahanCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ data: cached.data });
    }

    // Fetch kelurahan
    const response = await fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${district.id}.json`
    );
    if (!response.ok) throw new Error("Failed to fetch kelurahan");

    const rawData = await response.json();
    const kelurahanNames = rawData
      .map((k: { id: string; name: string }) => k.name)
      .sort((a: string, b: string) => a.localeCompare(b));

    kelurahanCache.set(cacheKey, { data: kelurahanNames, timestamp: Date.now() });

    return NextResponse.json({ data: kelurahanNames });
  } catch (error) {
    console.error("Error fetching kelurahan:", error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
