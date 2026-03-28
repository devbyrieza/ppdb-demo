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

// GET: List assigned exams for the logged-in examiner
export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user_id || session.id;

    try {
        // Fetch user profile to check admin status
        const userProfile = await prisma.profile.findUnique({
            where: { id: userId },
            select: { role: true, secondary_roles: true }
        });
        const allRoles = userProfile ? [userProfile.role, ...(userProfile.secondary_roles || [])] : [];
        const isAdmin = allRoles.some((r: string) => ['admin_super', 'admin', 'head_of_it'].includes(r));

        // Determine which field to check based on role? 
        // Actually, just check all fields since a person might have multiple roles or assignments
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

        const jadwal = await prisma.jadwalUjian.findMany({
            where: whereClause,
            include: {
                pendaftar: {
                    select: {
                        id: true,
                        nama_lengkap: true,
                        nomor_pendaftaran: true,
                        jenjang: true,
                        jenis_kelamin: true,
                        nik: true,
                        tempat_lahir: true,
                        tanggal_lahir: true,
                        alamat: true,
                        no_hp: true,
                        asal_sekolah: true,
                        orang_tua: {
                            select: {
                                nama_ayah: true,
                                nama_ibu: true,
                                no_hp_ayah: true,
                                no_hp_ibu: true,
                                pekerjaan_ayah: true,
                                pekerjaan_ibu: true,
                            }
                        }
                    }
                },
                tahun_ajaran: {
                    select: { nama: true }
                },
                exam_session: {
                    select: {
                        title: true,
                        start_time: true,
                        end_time: true,
                        location: true,
                        created_by: true,
                    }
                }
            },
            orderBy: { tanggal_ujian: 'asc' }
        });

        // Transform data to be friendly
        const formattedJadwal = jadwal.map((item: any) => {
            let jenis_tugas = [];
            if (isAdmin) {
                // Admin can see all assignment types
                jenis_tugas.push("Tes Al-Qur'an", "Wawancara Calsan", "Wawancara Cawalsan");
            } else {
                if (item.penguji_santri_id === userId) jenis_tugas.push("Wawancara Calsan");
                if (item.penguji_quran_id === userId) jenis_tugas.push("Tes Al-Qur'an");
                if (item.penguji_ortu_id === userId) jenis_tugas.push("Wawancara Cawalsan");

                // Fallback: if matched via exam_session.created_by, derive from session title
                if (jenis_tugas.length === 0 && item.exam_session?.created_by === userId) {
                    const title = (item.exam_session?.title || "").toLowerCase();
                    if (title.includes("qur") || title.includes("quran")) jenis_tugas.push("Tes Al-Qur'an");
                    else if (title.includes("calsan") || title.includes("santri")) jenis_tugas.push("Wawancara Calsan");
                    else if (title.includes("cawalsan") || title.includes("ortu") || title.includes("orang")) jenis_tugas.push("Wawancara Cawalsan");
                    else jenis_tugas.push(item.exam_session?.title || "Ujian");
                }
            }

            return {
                id: item.id,
                pendaftar: item.pendaftar,
                tanggal_ujian: item.tanggal_ujian,
                waktu_mulai: item.exam_session?.start_time || item.waktu_mulai_santri, // Fallback if no session
                waktu_selesai: item.exam_session?.end_time || item.waktu_selesai_santri,
                lokasi: item.exam_session?.location || item.tempat_santri,
                jenis_tugas: jenis_tugas.join(", "),
                status: "scheduled",
                session_title: item.exam_session?.title,
                // Granular Statuses
                status_santri: item.status_santri,
                status_quran: item.status_quran,
                status_ortu: item.status_ortu,
                // Assignee IDs for frontend logic
                penguji_santri_id: item.penguji_santri_id,
                penguji_quran_id: item.penguji_quran_id,
                penguji_ortu_id: item.penguji_ortu_id,
                // Also pass created_by so frontend can check
                session_created_by: item.exam_session?.created_by,
            };
        });

        return NextResponse.json({ data: formattedJadwal });
    } catch (error: any) {
        console.error("GET penguji/jadwal error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
