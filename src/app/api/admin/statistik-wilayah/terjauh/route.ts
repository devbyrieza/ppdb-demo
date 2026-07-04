import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import fs from "fs/promises";
import path from "path";
import { getAdminWhereClause } from "@/lib/utils/admin";

const PESANTREN_COORD = {
  lat: -6.9749, // Koordinat aproksimasi Pesantren Al-Imam (Cikembar)
  lon: 106.7725,
};

// Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CACHE_FILE = path.join(process.cwd(), ".terjauh-geocode-cache.json");

async function getGeocodeCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

async function saveGeocodeCache(cache: any) {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    // ignore
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || session.user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tahun_ajaran, jenjang } = await req.json();

    if (!tahun_ajaran || !jenjang) {
      return NextResponse.json({
        success: false,
        error: "tahun_ajaran dan jenjang wajib diisi",
      });
    }

    const baseWhere = getAdminWhereClause();

    // Ambil pendaftar
    const pendaftarList = await prisma.pendaftar.findMany({
      where: {
        ...baseWhere,
        tahun_ajaran: {
          nama: tahun_ajaran
        },
        jenjang,
        deleted_at: null,
        // Hanya ambil pendaftar yang statusnya minimal diterima
        status_pendaftaran: {
          in: [
            "diterima",
            "accepted",
            "enrolled"
          ],
        },
      },
      select: {
        id: true,
        data_lengkap: true,
        status_pendaftaran: true,
      },
    });

    if (!pendaftarList.length) {
      return NextResponse.json({
        success: false,
        error: "Tidak ada data pendaftar (diterima/tes) untuk kriteria ini",
      });
    }

    const cache = await getGeocodeCache();
    let hasNewCache = false;
    const allCandidates: any[] = [];

    for (const p of pendaftarList) {
      const dataLengkap: any = p.data_lengkap;
      if (!dataLengkap?.santri) continue;

      const {
        nama_lengkap,
        alamat,
        kecamatan,
        kabupaten,
        provinsi,
        rt,
        rw,
        kelurahan,
      } = dataLengkap.santri;
      
      if (!kabupaten || !provinsi) continue;

      const query = `${kecamatan ? kecamatan + ", " : ""}${kabupaten}, ${provinsi}`;

      let lat, lon;
      if (cache[query]) {
        lat = cache[query].lat;
        lon = cache[query].lon;
      } else {
        // Fetch from Nominatim (delay 1s to respect limits)
        await new Promise((r) => setTimeout(r, 1000));
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&limit=1`,
          {
            headers: {
              "User-Agent": "AlAndalusPesantrenApp/1.0",
            },
          }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lon = parseFloat(data[0].lon);
          cache[query] = { lat, lon };
          hasNewCache = true;
        } else {
          // Tandai kosong agar tidak dicari ulang terus menerus
          cache[query] = { lat: null, lon: null };
          hasNewCache = true;
        }
      }

      if (lat && lon) {
        const distance = calculateDistance(
          PESANTREN_COORD.lat,
          PESANTREN_COORD.lon,
          lat,
          lon
        );
        allCandidates.push({
          nama: nama_lengkap,
          alamat_lengkap: `${alamat || ""}, RT ${rt || "00"}/RW ${
            rw || "00"
          }, ${kelurahan || ""}, ${kecamatan || ""}, ${kabupaten}, ${provinsi}`,
          jarak_km: Math.round(distance * 100) / 100,
          status: p.status_pendaftaran,
          koordinat: `${lat}, ${lon}`
        });
      }
    }

    if (hasNewCache) {
      await saveGeocodeCache(cache);
    }

    if (allCandidates.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Gagal menghitung jarak untuk seluruh pendaftar, data alamat mungkin tidak valid",
      });
    }

    const top5 = allCandidates.sort((a, b) => b.jarak_km - a.jarak_km).slice(0, 5);

    return NextResponse.json({ success: true, data: top5 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
