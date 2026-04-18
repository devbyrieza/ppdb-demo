import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const data = [
    { name: "Abah", phone: "087836270966" },
    { name: "Agus Cahyono", phone: "081251971250" },
    { name: "Fuad Khomsatun", phone: "085692512479" },
    { name: "Jusman", phone: "081241295968" },
    { name: "Maulidin Bachtiar", phone: "0895332071063" },
    { name: "Muhajir", phone: "085826330927" },
    { name: "Muhammad Syauqi Al Faruq", phone: "08568719310" },
    { name: "Teguh", phone: "081398225358" },
];

export async function GET() {
    try {
        console.log("🚀 DEBUG: Memulai seeding nomor HP penguji...");
        const results = [];
        
        for (const item of data) {
            const result = await prisma.profile.updateMany({
                where: {
                    full_name: { contains: item.name, mode: "insensitive" }
                },
                data: { phone: item.phone }
            });
            results.push({ name: item.name, updated: result.count });
        }

        return NextResponse.json({ 
            success: true, 
            message: "Data penguji berhasil diperbarui secara massal",
            details: results 
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
