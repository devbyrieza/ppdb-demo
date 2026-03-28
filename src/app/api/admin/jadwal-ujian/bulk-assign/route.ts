import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session || !["admin", "admin_super", "penguji"].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { exam_session_id } = body;

        if (!exam_session_id) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        // 1. Get Exam Session details (Link, Time)
        const examSession = await prisma.examSession.findUnique({
            where: { id: exam_session_id },
        });

        if (!examSession) {
            return NextResponse.json({ error: "Sesi Ujian tidak ditemukan" }, { status: 404 });
        }

        // 2. Find eligible students
        // Condition: status 'docs_verified' AND NOT already assigned to this session
        const students = await prisma.pendaftar.findMany({
            where: {
                status_pendaftaran: 'docs_verified',
                jadwal_ujian: {
                    none: { exam_session_id: exam_session_id }
                }
            },
            select: {
                id: true,
                nama_lengkap: true,
                no_hp: true,
                tahun_ajaran_id: true,
            }
        });

        if (students.length === 0) {
            return NextResponse.json({ message: "Tidak ada siswa baru yang perlu di-assign.", queue: [] });
        }

        // 3. Current Time for schedule
        const tanggalUjian = examSession.start_time; // Use session start time as the date

        const notificationQueue: any[] = [];
        let successCount = 0;

        // 4. Process each student (Database Creation Only - Fast)
        for (const student of students) {
            try {
                // 3.5. Update status in a transaction
                await prisma.$transaction([
                    // Create Jadwal Ujian
                    prisma.jadwalUjian.create({
                        data: {
                            pendaftar_id: student.id,
                            tahun_ajaran_id: student.tahun_ajaran_id,
                            exam_session_id: examSession.id,
                            tanggal_ujian: tanggalUjian,
                            metode_ujian: "online",
                            online_test_link: examSession.location || "", // Copy link from session location
                            status_online_test: "pending",
                            // Default times based on session
                            waktu_mulai_santri: examSession.start_time,
                            waktu_selesai_santri: examSession.end_time,
                            tempat_santri: examSession.location || "Online",
                            // Dummy for schema compat
                            tempat_ortu: "Online",
                            waktu_mulai_ortu: examSession.start_time,
                            waktu_selesai_ortu: examSession.end_time,
                        }
                    }),
                    // Update Pendaftar status to 'scheduled'
                    prisma.pendaftar.update({
                        where: { id: student.id },
                        data: { status_pendaftaran: 'scheduled' }
                    })
                ]);

                // Add to Notification Queue for Frontend Processing
                if (student.no_hp) {
                    notificationQueue.push({
                        pendaftar_id: student.id,
                        phone: student.no_hp,
                        nama: student.nama_lengkap,
                        tanggal: tanggalUjian.toLocaleDateString("id-ID", {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        }),
                        waktu: `${examSession.start_time.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB`,
                        tempat: examSession.location || "Online (Link di Dashboard)"
                    });
                }

                successCount++;
            } catch (error) {
                console.error(`Failed to assign student ${student.id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Berhasil assign ${successCount} siswa. Siap kirim notifikasi.`,
            queue: notificationQueue
        });

    } catch (error: any) {
        console.error("Bulk Assign Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
