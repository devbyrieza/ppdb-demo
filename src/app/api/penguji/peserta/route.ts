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

// GET: List all exam participants assigned to this reviewer
export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user_id || session.id;

    try {
        // Fetch user profile to see if they're an admin
        const userProfile = await prisma.profile.findUnique({
            where: { id: userId },
            select: { role: true, secondary_roles: true }
        });
        const allRoles = userProfile ? [userProfile.role, ...(userProfile.secondary_roles || [])] : [];
        const isAdmin = allRoles.some(r => ['admin_super', 'admin', 'head_of_it'].includes(r));

        let whereClause: any = {};
        if (!isAdmin) {
            whereClause = {
                OR: [
                    { penguji_santri_id: userId },
                    { penguji_quran_id: userId },
                    { penguji_ortu_id: userId },
                    { exam_session: { created_by: userId } },
                ]
            };
        }

        const assigned = await prisma.jadwalUjian.findMany({
            where: whereClause,
            include: {
                pendaftar: {
                    select: {
                        id: true,
                        nama_lengkap: true,
                        nomor_pendaftaran: true,
                        jenjang: true,
                        nilai_ujian: true,
                    }
                },
                exam_session: { select: { title: true, created_by: true } },
            },
            orderBy: { tanggal_ujian: 'asc' }
        });

        // Fetch ALL jadwal records for the exam sessions we're dealing with
        const examSessionIds = [...new Set(assigned.map(j => j.exam_session_id).filter((id): id is string => Boolean(id)))];
        const allJadwalInSessions = examSessionIds.length > 0 ? await prisma.jadwalUjian.findMany({
            where: {
                exam_session_id: { in: examSessionIds }
            },
            select: {
                id: true,
                exam_session_id: true
            }
        }) : [];

        // Helper to check if an object is effectively empty
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

        const pesertaMap = new Map<string, any>();

        for (const item of assigned) {
            const pendaftarId = item.pendaftar.id;

            const roles: string[] = [];
            if (isAdmin) {
                roles.push('wawancara', 'quran', 'ortu');
            } else {
                if (item.penguji_santri_id === userId) roles.push('wawancara');
                if (item.penguji_quran_id === userId) roles.push('quran');
                if (item.penguji_ortu_id === userId) roles.push('ortu');

                if (roles.length === 0 && item.exam_session?.created_by === userId) {
                    const title = (item.exam_session?.title || "").toLowerCase();
                    const hasQuranMatch = title.includes("qur") || title.includes("quran");
                    const hasWawancaraMatch = title.includes("calsan") || title.includes("santri") || title.includes("wawancara");
                    const hasOrtuMatch = title.includes("cawalsan") || title.includes("ortu") || title.includes("orang");

                    if (hasQuranMatch) roles.push('quran');
                    if (hasWawancaraMatch) roles.push('wawancara');
                    if (hasOrtuMatch) roles.push('ortu');
                }
            }

            const allScoresInSession = (item.pendaftar.nilai_ujian || []).filter(
                (s: any) => {
                    if (s.jadwal_ujian_id) {
                        const scoreJadwal = allJadwalInSessions.find((j: any) => j.id === s.jadwal_ujian_id);
                        return (scoreJadwal && scoreJadwal.exam_session_id === item.exam_session_id) || 
                               (s.score_quran != null || s.nilai_tes_quran != null || s.detail_quran != null);
                    }
                    return true;
                }
            );

            const mergedSessionScore: any = {};
            allScoresInSession.forEach((s: any) => {
                Object.entries(s).forEach(([k, v]) => {
                    if (!isEmpty(v)) {
                        if (mergedSessionScore[k] == null || mergedSessionScore[k] === "") {
                            mergedSessionScore[k] = v;
                        }
                    }
                });
            });

            const scoreData: any = Object.keys(mergedSessionScore).length > 0 ? mergedSessionScore : {};

            if (pesertaMap.has(pendaftarId)) {
                const existing = pesertaMap.get(pendaftarId);
                for (const r of roles) {
                    if (!existing.roles.includes(r)) existing.roles.push(r);
                }

                Object.entries(scoreData).forEach(([k, v]) => {
                    if (!isEmpty(v) && isEmpty(existing[k])) {
                        existing[k] = v;
                    }
                });
            } else {
                pesertaMap.set(pendaftarId, {
                    id: pendaftarId,
                    nama_lengkap: item.pendaftar.nama_lengkap,
                    nomor_pendaftaran: item.pendaftar.nomor_pendaftaran,
                    jenjang: item.pendaftar.jenjang,
                    jadwal_id: item.id,
                    roles: roles,
                    nilai_id: scoreData.id || null,
                    nilai_wawancara_santri: scoreData.nilai_wawancara_santri,
                    nilai_tes_quran: scoreData.nilai_tes_quran,
                    nilai_wawancara_ortu: scoreData.nilai_wawancara_ortu,
                    catatan_santri: scoreData.catatan_santri,
                    catatan_quran: scoreData.catatan_quran,
                    catatan_ortu: scoreData.catatan_ortu,
                    detail_quran: scoreData.detail_quran,
                    detail_wawancara: scoreData.detail_wawancara,
                    detail_cawalsan: scoreData.detail_cawalsan,
                    input_at_quran: scoreData.input_at_quran,
                    input_at_santri: scoreData.input_at_santri,
                    input_at_ortu: scoreData.input_at_ortu,
                });
            }
        }

        const data = Array.from(pesertaMap.values());

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error("GET penguji/peserta error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
