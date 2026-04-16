import { prisma } from "@/lib/prisma";
import { notifyAllExamsComplete } from "@/lib/wablas";

/**
 * Utility to manage and update exam component completion states.
 * Logic ported from Al-Imam reference project.
 */

interface ExamCompletionResult {
    santri: boolean;
    quran: boolean;
    ortu: boolean;
    isAllComplete: boolean;
}

/**
 * Checks if all exam components (Santri, Quran, Ortu) are marked as completed 
 * across ANY jadwal records for a student.
 */
export async function checkStudentExamCompletion(pendaftarId: string): Promise<ExamCompletionResult> {
    const schedules = await prisma.jadwalUjian.findMany({
        where: { pendaftar_id: pendaftarId },
        select: {
            status_santri: true,
            status_quran: true,
            status_ortu: true,
            penguji_santri_id: true,
            penguji_quran_id: true,
            penguji_ortu_id: true
        }
    });

    // A component is "complete" if it's marked 'completed' OR if it was never assigned
    const result = {
        santri: schedules.every(s => !s.penguji_santri_id || s.status_santri === 'completed'),
        quran: schedules.every(s => !s.penguji_quran_id || s.status_quran === 'completed'),
        ortu: schedules.every(s => !s.penguji_ortu_id || s.status_ortu === 'completed'),
    };

    return {
        ...result,
        isAllComplete: result.santri && result.quran && result.ortu
    };
}

/**
 * Marks a specific component as complete for a student.
 * If all components are then finished, triggers the 'All Exams Complete' notification.
 */
export async function markExamComponentAsComplete({
    jadwalId,
    userId,
    componentType
}: {
    jadwalId: string,
    userId: string,
    componentType?: 'santri' | 'quran' | 'ortu'
}) {
    console.log(`[exam-status] Marking ${componentType || 'assigned component'} for schedule ${jadwalId} as complete...`);

    // 1. Fetch current jadwal
    const currentJadwal = await prisma.jadwalUjian.findUnique({
        where: { id: jadwalId },
        select: {
            pendaftar_id: true,
            penguji_santri_id: true,
            penguji_quran_id: true,
            penguji_ortu_id: true
        }
    });

    if (!currentJadwal) throw new Error("Jadwal not found");

    // 2. Determine what to update
    const updateData: any = {};
    if (componentType) {
        if (componentType === 'santri') updateData.status_santri = 'completed';
        else if (componentType === 'quran') updateData.status_quran = 'completed';
        else if (componentType === 'ortu') updateData.status_ortu = 'completed';
    } else {
        // Fallback to auto-detection based on userId
        if (currentJadwal.penguji_santri_id === userId) updateData.status_santri = 'completed';
        if (currentJadwal.penguji_quran_id === userId) updateData.status_quran = 'completed';
        if (currentJadwal.penguji_ortu_id === userId) updateData.status_ortu = 'completed';
    }

    if (Object.keys(updateData).length === 0) {
        console.warn(`[exam-status] Nothing to update for user ${userId} on schedule ${jadwalId}`);
        return { isAllComplete: false };
    }

    await prisma.jadwalUjian.update({
        where: { id: jadwalId },
        data: updateData
    });

    // 3. Update the pendaftar status to 'tested' (Telah Diuji)
    await prisma.pendaftar.update({
        where: { id: currentJadwal.pendaftar_id },
        data: { status_pendaftaran: 'tested' }
    });

    // 4. Check if this was the last component needed
    const { isAllComplete } = await checkStudentExamCompletion(currentJadwal.pendaftar_id);

    if (isAllComplete) {
        console.log(`[exam-status] ALL components complete for ${currentJadwal.pendaftar_id}. Triggering notification...`);
        
        // Fetch student details for notification
        const student = await prisma.pendaftar.findUnique({
            where: { id: currentJadwal.pendaftar_id },
            select: {
                nama_lengkap: true,
                no_hp: true,
                nomor_pendaftaran: true
            }
        });

        if (student && student.no_hp) {
            try {
                await notifyAllExamsComplete({
                    phone: student.no_hp,
                    nama: student.nama_lengkap
                });
                console.log(`[exam-status] Notification sent successfully to ${student.no_hp}`);
            } catch (err) {
                console.error(`[exam-status] Failed to send notification:`, err);
            }
        }
    }

    return { isAllComplete };
}

/**
 * Returns a score lock status (24 hours after input).
 * Admin roles bypass this lock.
 */
export function getScoreLockStatus(inputAt: Date | null | string, role: string) {
    if (!inputAt) return { isLocked: false, remainingText: "" };
    
    // Admins are never locked out
    if (['admin_super', 'admin', 'head_of_it'].includes(role)) {
        return { isLocked: false, remainingText: "Akses Admin" };
    }

    const inputDate = new Date(inputAt);
    const lockDate = new Date(inputDate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const isLocked = now > lockDate;
    
    if (isLocked) {
        return { isLocked: true, remainingText: "Terkunci (Batas 24 jam)" };
    } else {
        const diffMs = lockDate.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return { isLocked: false, remainingText: `${diffHours}j ${diffMins}m` };
    }
}
