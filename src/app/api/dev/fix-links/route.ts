import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const links = [
        { name: "Agus Cahyono", link: "https://tinyurl.com/alimam-agus" },
        { name: "Fuad Khomsatun", link: "https://tinyurl.com/alimam-fuad" },
        { name: "Jusman", link: "https://tinyurl.com/alimam-jusman" },
        { name: "Muhajir", link: "https://tinyurl.com/alimam-muhajir" },
        { name: "Muhammad Syauqi", link: "https://tinyurl.com/alimam-syauqi" } // partial match to be safe
    ];

    try {
        let results = [];
        for (const l of links) {
            // Find all profiles containing the name
            const users = await prisma.profile.findMany({
                where: { full_name: { contains: l.name } }
            });
            
            for (const user of users) {
                await prisma.profile.update({
                    where: { id: user.id },
                    data: { google_meet_link: l.link }
                });
                results.push(`Updated ${user.full_name} to ${l.link}`);
            }
            if (users.length === 0) {
                results.push(`Not found: ${l.name}`);
            }
        }
        return NextResponse.json({ success: true, results });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
