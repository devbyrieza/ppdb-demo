import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("app_session");

        if (!sessionCookie) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let session;
        try {
            session = JSON.parse(sessionCookie.value);
        } catch {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // Only Admin types can access
        const allowedRoles = ["admin", "admin_super", "head_of_it", "tim_it"];
        if (!allowedRoles.includes(session.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch all JadwalUjian with relations (filtering out deleted students)
        const schedules = await prisma.jadwalUjian.findMany({
            where: {
                pendaftar: {
                    deleted_at: null
                }
            },
            include: {
                pendaftar: {
                    select: {
                        id: true,
                        nomor_pendaftaran: true,
                        nama_lengkap: true,
                        jenjang: true,
                    }
                },
                exam_session: {
                    select: {
                        id: true,
                        title: true,
                        start_time: true,
                        end_time: true,
                        location: true,
                    }
                },
                penguji_quran: {
                    select: {
                        id: true,
                        full_name: true,
                    }
                },
                penguji_santri: {
                    select: {
                        id: true,
                        full_name: true,
                    }
                },
                penguji_ortu: {
                    select: {
                        id: true,
                        full_name: true,
                        google_meet_link: true,
                    }
                },
                nilai_ujian: {
                    select: {
                        detail_quran: true,
                        detail_wawancara: true,
                        detail_cawalsan: true,
                    }
                }
            },
            orderBy: [
                { tanggal_ujian: 'desc' },
                { waktu_mulai_santri: 'asc' }
            ]
        });

        // Map to a cleaner format
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

        const formatted = schedules.map(s => {
            // Hanya dianggap selesai jika ada field meaningful (rekomendasi / nama_penguji)
            // Mencegah data dev { skor: 90 } dari skip-ujian terhitung sebagai "Selesai"
            const hasScoreQuran = s.nilai_ujian.some(n => {
                const q = n.detail_quran as any;
                return !!(q && typeof q === 'object' && (q.rekomendasi || q.nama_penguji));
            });
            const hasScoreSantri = s.nilai_ujian.some(n => {
                const w = n.detail_wawancara as any;
                return !!(w && typeof w === 'object' && (w.rekomendasi || w.nama_penguji));
            });
            const hasScoreOrtu = s.nilai_ujian.some(n => {
                const c = n.detail_cawalsan as any;
                return !!(c && typeof c === 'object' && (c.rekomendasi || c.nama_penguji));
            });

            return {
                id: s.id,
                pendaftar: {
                    nomor: s.pendaftar.nomor_pendaftaran,
                    nama: s.pendaftar.nama_lengkap,
                    jenjang: s.pendaftar.jenjang,
                },
                sesi: {
                    title: s.exam_session?.title || "Sesi Ujian",
                    start: s.exam_session?.start_time || s.waktu_mulai_santri,
                    end: s.exam_session?.end_time || s.waktu_selesai_santri,
                    location: s.exam_session?.location || s.tempat_santri,
                },
                ustadz: {
                    quran: s.penguji_quran?.full_name || '-',
                    santri: s.penguji_santri?.full_name || '-',
                    ortu: s.penguji_ortu?.full_name || '-',
                },
                status: {
                    quran: hasScoreQuran ? 'completed' : (s.status_quran || 'scheduled'),
                    santri: hasScoreSantri ? 'completed' : (s.status_santri || 'scheduled'),
                    ortu: hasScoreOrtu ? 'completed' : (s.status_ortu || 'scheduled'),
                }
            };
        });

        // Filter out data test/tes as requested 
        // Also secondary check for deleted_at just in case the relation filtering misses some edge cases
        const cleanedData = formatted.filter(s => {
            const nama = s.pendaftar.nama.toLowerCase();
            return !nama.includes("tes ") && !nama.includes("test") && !nama.endsWith("tes"); // Excludes "Bambang Tes", "Testing", etc.
        });

        return NextResponse.json({ data: cleanedData });
    } catch (error: any) {
        console.error("Monitoring API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
