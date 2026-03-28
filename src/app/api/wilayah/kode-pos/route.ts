import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const kelurahan = url.searchParams.get("kelurahan");
        const kecamatan = url.searchParams.get("kecamatan");
        const kabupaten = url.searchParams.get("kabupaten");

        if (!kelurahan || !kecamatan) {
            return NextResponse.json(
                { success: false, error: "kelurahan and kecamatan are required" },
                { status: 400 }
            );
        }

        // Search query: Kelurahan Name + Kecamatan Name
        const query = `${kelurahan} ${kecamatan}`.toLowerCase();

        // Using a reliable public API for Indonesian postal codes
        const response = await fetch(
            `https://kodepos.vercel.app/search?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch postal code");
        }

        const json = await response.json();

        if (!json.status || !json.data || json.data.length === 0) {
            return NextResponse.json({ success: true, data: null });
        }

        // Attempt to find the best match
        // Filter by kabupaten if provided to be more accurate
        let match = json.data[0];

        if (kabupaten) {
            const searchCity = kabupaten.toLowerCase().replace(/kabupaten|kota/g, "").trim();
            const bestMatch = json.data.find((item: any) => {
                const itemRegency = (item.regency || item.city || "").toLowerCase();
                return itemRegency.includes(searchCity) || searchCity.includes(itemRegency);
            });
            if (bestMatch) match = bestMatch;
        }

        return NextResponse.json({
            success: true,
            data: {
                postal_code: match.code || match.postalcode || "",
                details: match
            }
        });

    } catch (error) {
        console.error("Error fetching postal code:", error);
        return NextResponse.json(
            { success: false, error: "Gagal mengambil kode pos" },
            { status: 500 }
        );
    }
}
