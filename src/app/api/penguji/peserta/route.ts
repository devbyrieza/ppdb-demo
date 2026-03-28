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
                    { penguji_santri_id: userId }, // Wawancara Calsan (or general Interview)
                    { penguji_quran_id: userId },   // Tes Quran
                    { penguji_ortu_id: userId },    // Wawancara Cawalsan
                    { exam_session: { created_by: userId } }, // Sessions created by this penguji
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
                    }
                },
                nilai_ujian: true, // Fetch scores
                exam_session: { select: { title: true, created_by: true } },
            },
            orderBy: { tanggal_ujian: 'asc' }
        });

        // Build a map to deduplicate by pendaftar.id
        const pesertaMap = new Map<string, any>();

        for (const item of assigned) {
            const pendaftarId = item.pendaftar.id;

            // Determine roles for this jadwal record
            const roles: string[] = [];
            if (isAdmin) {
                roles.push('wawancara', 'quran', 'ortu');
            } else {
                if (item.penguji_santri_id === userId) roles.push('wawancara');
                if (item.penguji_quran_id === userId) roles.push('quran');
                if (item.penguji_ortu_id === userId) roles.push('ortu');

                // Fallback: if matched via exam_session.created_by, derive role from session title
                if (roles.length === 0 && item.exam_session?.created_by === userId) {
                    const title = (item.exam_session?.title || "").toLowerCase();
                    if (title.includes("qur") || title.includes("quran")) roles.push('quran');
                    else if (title.includes("calsan") || title.includes("santri")) roles.push('wawancara');
                    else if (title.includes("cawalsan") || title.includes("ortu") || title.includes("orang")) roles.push('ortu');
                }
            }

            const score = item.nilai_ujian?.[0] || {};

            if (pesertaMap.has(pendaftarId)) {
                // Merge: add new roles (avoid duplicates) and update score if available
                const existing = pesertaMap.get(pendaftarId);
                for (const r of roles) {
                    if (!existing.roles.includes(r)) existing.roles.push(r);
                }
                // If this record has score data, merge it in (prefer non-null values)
                if (score.id) {
                    existing.nilai_id = existing.nilai_id || score.id;
                    existing.nilai_wawancara_santri = existing.nilai_wawancara_santri ?? score.nilai_wawancara_santri;
                    existing.nilai_tes_quran = existing.nilai_tes_quran ?? score.nilai_tes_quran;
                    existing.nilai_wawancara_ortu = existing.nilai_wawancara_ortu ?? score.nilai_wawancara_ortu;
                    existing.catatan_santri = existing.catatan_santri ?? score.catatan_santri;
                    existing.catatan_quran = existing.catatan_quran ?? score.catatan_quran;
                    existing.catatan_ortu = existing.catatan_ortu ?? score.catatan_ortu;
                    existing.detail_quran = existing.detail_quran ?? score.detail_quran;
                    existing.detail_wawancara = existing.detail_wawancara ?? score.detail_wawancara;
                    existing.detail_cawalsan = existing.detail_cawalsan ?? score.detail_cawalsan;
                    existing.score_quran = existing.score_quran ?? score.score_quran;
                    existing.score_wawancara = existing.score_wawancara ?? score.score_wawancara;
                }
            } else {
                pesertaMap.set(pendaftarId, {
                    id: pendaftarId,
                    jadwal_id: item.id,
                    nomor_pendaftaran: item.pendaftar.nomor_pendaftaran,
                    nama_lengkap: item.pendaftar.nama_lengkap,
                    jenjang: item.pendaftar.jenjang,
                    roles: roles,
                    nilai_wawancara_santri: score.nilai_wawancara_santri,
                    nilai_tes_quran: score.nilai_tes_quran,
                    nilai_wawancara_ortu: score.nilai_wawancara_ortu,
                    catatan_santri: score.catatan_santri,
                    catatan_quran: score.catatan_quran,
                    catatan_ortu: score.catatan_ortu,
                    detail_quran: score.detail_quran,
                    detail_wawancara: score.detail_wawancara,
                    detail_cawalsan: score.detail_cawalsan,
                    score_quran: score.score_quran,
                    score_wawancara: score.score_wawancara,
                    nilai_id: score.id,
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
