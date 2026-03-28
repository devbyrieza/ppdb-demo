import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { recalculateNilaiUjian } from "@/lib/scoring";

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

// PATCH: Update score (Upsert)
// PATCH: Update score (Upsert)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pendaftarId } = await params;
    const userId = session.user_id || session.id;

    try {
        const body = await request.json();

        // Check assignment authorization
        const assignment = await prisma.jadwalUjian.findFirst({
            where: {
                pendaftar_id: pendaftarId,
                OR: [
                    { penguji_santri_id: userId },
                    { penguji_quran_id: userId },
                    { penguji_ortu_id: userId },
                    { exam_session: { created_by: userId } },
                ]
            },
            include: {
                exam_session: { select: { title: true, created_by: true } }
            }
        });

        // If examiner, only specific fields.
        const isWawancara = assignment?.penguji_santri_id === userId;
        const isQuran = assignment?.penguji_quran_id === userId;
        const isOrtu = assignment?.penguji_ortu_id === userId;

        // Fetch user profile to see if they're actually an admin who switched roles
        const userProfile = await prisma.profile.findUnique({
            where: { id: userId },
            select: { role: true, secondary_roles: true }
        });
        const allRoles = userProfile ? [userProfile.role, ...(userProfile.secondary_roles || [])] : [];
        const isAdmin = allRoles.some(r => ['admin_super', 'admin', 'head_of_it'].includes(r));

        // Let admins bypass the assignment check
        if (!assignment && !isAdmin) {
            return NextResponse.json({ error: "Forbidden: Not assigned to this student" }, { status: 403 });
        }

        // Fallback: if matched via exam_session.created_by, derive role from session title
        let isWawancaraFallback = false;
        let isQuranFallback = false;
        let isOrtuFallback = false;

        if (!isWawancara && !isQuran && !isOrtu && assignment && assignment.exam_session && assignment.exam_session.created_by === userId) {
            const title = (assignment.exam_session.title || "").toLowerCase();
            const hasQuranMatch = title.includes("qur") || title.includes("quran");
            const hasWawancaraMatch = title.includes("calsan") || title.includes("santri") || title.includes("wawancara");
            const hasOrtuMatch = title.includes("cawalsan") || title.includes("ortu") || title.includes("orang");

            // If the title is generic (e.g. "Tes PPDB 1"), grant access to all forms (matches frontend behavior roles: [])
            if (!hasQuranMatch && !hasWawancaraMatch && !hasOrtuMatch) {
                isQuranFallback = true;
                isWawancaraFallback = true;
                isOrtuFallback = true;
            } else {
                isQuranFallback = hasQuranMatch;
                isWawancaraFallback = hasWawancaraMatch;
                isOrtuFallback = hasOrtuMatch;
            }
        }

        const updateData: any = {};

        // If user is Admin, they get access to completely bypass the assignment and update all fields provided.
        // Otherwise, they only update the fields they're assigned to.

        // Only update Quran if payload contains detail_quran
        if ((isAdmin || isQuran || isQuranFallback) && body.detail_quran !== undefined) {
            if (body.nilai_tes_quran !== undefined) updateData.nilai_tes_quran = body.nilai_tes_quran;
            if (body.catatan_quran !== undefined) updateData.catatan_quran = body.catatan_quran;
            if (body.detail_quran !== undefined) updateData.detail_quran = body.detail_quran;
            if (body.score_quran !== undefined) updateData.score_quran = body.score_quran;
            if (session.user_id) updateData.input_by_quran = session.user_id;
            updateData.input_at_quran = new Date();
        }

        // Only update Santri (Calsan) if payload contains detail_wawancara
        if ((isAdmin || isWawancara || isWawancaraFallback) && body.detail_wawancara !== undefined) {
            if (body.nilai_wawancara_santri !== undefined) updateData.nilai_wawancara_santri = body.nilai_wawancara_santri;
            if (body.catatan_santri !== undefined) updateData.catatan_santri = body.catatan_santri;
            if (body.detail_wawancara !== undefined) updateData.detail_wawancara = body.detail_wawancara;
            if (body.score_wawancara !== undefined) updateData.score_wawancara = body.score_wawancara;
            if (session.user_id) updateData.input_by_santri = session.user_id;
            updateData.input_at_santri = new Date();
        }

        // Only update Ortu (Cawalsan) if payload contains detail_cawalsan
        if ((isAdmin || isOrtu || isOrtuFallback) && body.detail_cawalsan !== undefined) {
            if (body.nilai_wawancara_ortu !== undefined) updateData.nilai_wawancara_ortu = body.nilai_wawancara_ortu;
            if (body.catatan_ortu !== undefined) updateData.catatan_ortu = body.catatan_ortu;
            if (body.detail_cawalsan !== undefined) updateData.detail_cawalsan = body.detail_cawalsan;
            if (session.user_id) updateData.input_by_ortu = session.user_id;
            updateData.input_at_ortu = new Date();
        }
        // Upsert
        // Check if exists
        const existing = await prisma.nilaiUjian.findFirst({ where: { pendaftar_id: pendaftarId } });

        if (existing) {
            await prisma.nilaiUjian.update({
                where: { id: existing.id },
                data: {
                    ...updateData,
                    updated_at: new Date(),
                }
            });
        } else {
            await prisma.nilaiUjian.create({
                data: {
                    pendaftar_id: pendaftarId,
                    jadwal_ujian_id: assignment?.id, // Link if assignment exists
                    ...updateData,
                }
            });
        }

        // 4. Trigger Recalculation
        await recalculateNilaiUjian(pendaftarId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("PATCH penguji/nilai error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
