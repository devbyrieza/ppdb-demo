import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { recalculateNilaiUjian } from "@/lib/scoring";
import { markExamComponentAsComplete } from "@/lib/exam-status";

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

        if (!assignment && !isAdmin) {
            return NextResponse.json({ error: "Forbidden: Not assigned to this student" }, { status: 403 });
        }

        // Fallback: derive role from session title
        let isWawancaraFallback = false;
        let isQuranFallback = false;
        let isOrtuFallback = false;

        if (!isWawancara && !isQuran && !isOrtu && assignment && assignment.exam_session && assignment.exam_session.created_by === userId) {
            const title = (assignment.exam_session.title || "").toLowerCase();
            const hasQuranMatch = title.includes("qur") || title.includes("quran");
            const hasWawancaraMatch = title.includes("calsan") || title.includes("santri") || title.includes("wawancara");
            const hasOrtuMatch = title.includes("cawalsan") || title.includes("ortu") || title.includes("orang");

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
        
        const baseRole = session.role || "";
        const canEditQuran = isAdmin || isQuran || isQuranFallback || (baseRole.includes("quran") || baseRole === "penguji" || baseRole === "penguji_calsan");
        const canEditWawancara = isAdmin || isWawancara || isWawancaraFallback || baseRole.includes("calsan") || baseRole === "pewawancara_calsan";
        const canEditOrtu = isAdmin || isOrtu || isOrtuFallback || baseRole.includes("cawalsan") || baseRole === "pewawancara_cawalsan";

        // Pre-fetch existing record
        const existing = await prisma.nilaiUjian.findFirst({ 
            where: { pendaftar_id: pendaftarId },
            orderBy: { created_at: 'desc' }
        });

        const updateData: any = {};
        const now = new Date();
        const LOCK_TIME = 24 * 60 * 60 * 1000; // 24 hours in ms

        // 1. Quran Update
        if (canEditQuran && body.detail_quran !== undefined) {
            if (existing?.input_at_quran && !isAdmin) {
                const diff = now.getTime() - new Date(existing.input_at_quran).getTime();
                if (diff > LOCK_TIME) {
                    return NextResponse.json({ error: "Masa edit (24 jam) untuk Tes Quran sudah habis. Silakan hubungi Admin Super." }, { status: 403 });
                }
            }

            if (body.nilai_tes_quran !== undefined) updateData.nilai_tes_quran = body.nilai_tes_quran;
            if (body.catatan_quran !== undefined) updateData.catatan_quran = body.catatan_quran;
            if (body.detail_quran !== undefined) updateData.detail_quran = body.detail_quran;
            if (body.score_quran !== undefined) updateData.score_quran = body.score_quran;
            updateData.input_by_quran = userId;
            if (!existing?.input_at_quran) updateData.input_at_quran = now;
        }

        // 2. Santri (Calsan) Update
        if (canEditWawancara && body.detail_wawancara !== undefined) {
             if (existing?.input_at_santri && !isAdmin) {
                const diff = now.getTime() - new Date(existing.input_at_santri).getTime();
                if (diff > LOCK_TIME) {
                    return NextResponse.json({ error: "Masa edit (24 jam) untuk Wawancara Santri sudah habis. Silakan hubungi Admin Super." }, { status: 403 });
                }
            }

            if (body.nilai_wawancara_santri !== undefined) updateData.nilai_wawancara_santri = body.nilai_wawancara_santri;
            if (body.catatan_santri !== undefined) updateData.catatan_santri = body.catatan_santri;
            if (body.detail_wawancara !== undefined) updateData.detail_wawancara = body.detail_wawancara;
            if (body.score_wawancara !== undefined) updateData.score_wawancara = body.score_wawancara;
            updateData.input_by_santri = userId;
            if (!existing?.input_at_santri) updateData.input_at_santri = now;
        }

        // 3. Ortu (Cawalsan) Update
        if (canEditOrtu && body.detail_cawalsan !== undefined) {
            if (existing?.input_at_ortu && !isAdmin) {
                const diff = now.getTime() - new Date(existing.input_at_ortu).getTime();
                if (diff > LOCK_TIME) {
                    return NextResponse.json({ error: "Masa edit (24 jam) untuk Wawancara Wali Santri sudah habis. Silakan hubungi Admin Super." }, { status: 403 });
                }
            }

            if (body.nilai_wawancara_ortu !== undefined) updateData.nilai_wawancara_ortu = body.nilai_wawancara_ortu;
            if (body.catatan_ortu !== undefined) updateData.catatan_ortu = body.catatan_ortu;
            if (body.detail_cawalsan !== undefined) updateData.detail_cawalsan = body.detail_cawalsan;
            updateData.input_by_ortu = userId;
            if (!existing?.input_at_ortu) updateData.input_at_ortu = now;
        }

        if (existing) {
            await prisma.nilaiUjian.update({
                where: { id: existing.id },
                data: {
                    ...updateData,
                    jadwal_ujian_id: assignment?.id,
                    updated_at: now,
                }
            });
        } else {
            await prisma.nilaiUjian.create({
                data: {
                    pendaftar_id: pendaftarId,
                    jadwal_ujian_id: assignment?.id,
                    ...updateData,
                }
            });
        }

        await recalculateNilaiUjian(pendaftarId);

        if (assignment) {
            try {
                let componentType: 'santri' | 'quran' | 'ortu' | undefined = undefined;
                if (body.detail_quran) componentType = 'quran';
                else if (body.detail_wawancara) componentType = 'santri';
                else if (body.detail_cawalsan) componentType = 'ortu';

                if (componentType) {
                    await markExamComponentAsComplete({
                        jadwalId: assignment.id,
                        userId,
                        componentType
                    });
                }
            } catch (err) {
                console.error("Automation Error (Ignored):", err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("PATCH penguji/nilai error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
