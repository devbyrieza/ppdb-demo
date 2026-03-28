import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getSession() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");
    if (!sessionCookie) return null;
    try {
        return JSON.parse(sessionCookie.value);
    } catch {
        return null;
    }
}

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user_id || session.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
        const assigned = await prisma.jadwalUjian.findMany({
            where: {
                OR: [
                    { penguji_santri_id: userId },
                    { penguji_quran_id: userId },
                    { penguji_ortu_id: userId },
                    { exam_session: { created_by: userId } },
                ]
            },
            include: {
                nilai_ujian: true,
                exam_session: { select: { title: true, created_by: true } },
            }
        });

        const total_jadwal = assigned.length;
        const jadwal_hari_ini = assigned.filter(item => {
            const date = new Date(item.tanggal_ujian);
            return date >= today && date < tomorrow;
        }).length;

        let selesai_dinilai = 0;
        let belum_dinilai = 0;

        assigned.forEach(item => {
            const roles: string[] = [];
            if (item.penguji_santri_id === userId) roles.push('santri');
            if (item.penguji_quran_id === userId) roles.push('quran');
            if (item.penguji_ortu_id === userId) roles.push('ortu');

            // Fallback: if matched via exam_session.created_by
            if (roles.length === 0 && item.exam_session && item.exam_session.created_by === userId) {
                const title = (item.exam_session.title || "").toLowerCase();
                if (title.includes("qur") || title.includes("quran")) roles.push('quran');
                else if (title.includes("calsan") || title.includes("santri")) roles.push('santri');
                else if (title.includes("cawalsan") || title.includes("ortu") || title.includes("orang")) roles.push('ortu');
            }

            const score = (item as any).nilai_ujian?.[0] || {};

            // Logic: Is it finished for THIS examiner?
            let isItemFinished = true;
            if (roles.includes('santri') && !score.nilai_wawancara_santri) isItemFinished = false;
            if (roles.includes('quran') && !score.nilai_tes_quran) isItemFinished = false;
            if (roles.includes('ortu') && !score.nilai_wawancara_ortu) isItemFinished = false;
            if (roles.length === 0) isItemFinished = false; // unknown role = not finished

            if (isItemFinished) selesai_dinilai++;
            else belum_dinilai++;
        });

        return NextResponse.json({
            total_jadwal,
            selesai_dinilai,
            belum_dinilai,
            jadwal_hari_ini
        });
    } catch (error: any) {
        console.error("GET penguji/stats error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
