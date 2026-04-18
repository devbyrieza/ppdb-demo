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
                pendaftar: {
                    include: {
                        nilai_ujian: true
                    }
                },
                exam_session: { select: { title: true, created_by: true } },
            }
        });

        const isEmpty = (v: any) => {
            if (v == null || v === "") return true;
            if (typeof v === 'object') {
                if (Array.isArray(v)) return v.length === 0;
                const keys = Object.keys(v);
                if (keys.length === 0) return true;
                return keys.every(key => v[key] == null || v[key] === "");
            }
            return false;
        };

        // Deduplicate by pendaftar.id to get unique students
        const pesertaMap = new Map<string, any>();

        for (const item of assigned) {
            const pendaftarId = item.pendaftar.id;
            
            const roles: string[] = [];
            if (item.penguji_santri_id === userId) roles.push('santri');
            if (item.penguji_quran_id === userId) roles.push('quran');
            if (item.penguji_ortu_id === userId) roles.push('ortu');

            if (roles.length === 0 && item.exam_session && item.exam_session.created_by === userId) {
                const title = (item.exam_session.title || "").toLowerCase();
                if (title.includes("qur") || title.includes("quran")) roles.push('quran');
                if (title.includes("calsan") || title.includes("santri") || title.includes("wawancara")) roles.push('santri');
                if (title.includes("cawalsan") || title.includes("ortu") || title.includes("orang")) roles.push('ortu');
            }

            if (pesertaMap.has(pendaftarId)) {
                const existing = pesertaMap.get(pendaftarId);
                roles.forEach(r => {
                    if (!existing.roles.includes(r)) existing.roles.push(r);
                });
                // Update today status if this schedule is today
                const date = new Date(item.tanggal_ujian);
                if (date >= today && date < tomorrow) existing.isToday = true;
            } else {
                const date = new Date(item.tanggal_ujian);
                pesertaMap.set(pendaftarId, {
                    id: pendaftarId,
                    roles: roles,
                    isToday: date >= today && date < tomorrow,
                    nilai_ujian: item.pendaftar.nilai_ujian || []
                });
            }
        }

        const uniquePeserta = Array.from(pesertaMap.values());
        const total_jadwal = uniquePeserta.length;
        const jadwal_hari_ini = uniquePeserta.filter(p => p.isToday).length;

        let selesai_dinilai = 0;
        let belum_dinilai = 0;

        uniquePeserta.forEach(p => {
            // Build a merged score view for this student from all their records
            const mergedScore: any = {};
            [...p.nilai_ujian].sort((a: any, b: any) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            ).forEach(s => {
                Object.entries(s).forEach(([k, v]) => {
                    if (!isEmpty(v)) mergedScore[k] = v;
                });
            });

            // Logic: Is it finished for THIS examiner?
            let isItemFinished = true;
            if (p.roles.includes('santri') && !mergedScore.nilai_wawancara_santri) isItemFinished = false;
            if (p.roles.includes('quran') && !mergedScore.nilai_tes_quran) isItemFinished = false;
            if (p.roles.includes('ortu') && !mergedScore.nilai_wawancara_ortu) isItemFinished = false;
            if (p.roles.length === 0) isItemFinished = false;

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
