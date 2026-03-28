/**
 * Undangan Seleksi API — Main data endpoint for the dashboard.
 *
 * Returns:
 * - Grup A test completion status (akademik, kepribadian, kesiapan)
 * - Grup B available sessions and booked schedules
 * - Condition state (jadwal tersedia or belum)
 * - Triggers notification enqueue (flag-guarded, no duplicate)
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
    enqueueWhatsapp,
    buildMessageJadwalBelum,
    buildMessageJadwalLangsungTersedia,
} from "@/lib/whatsapp-queue";

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
    if (!session || session.role !== "pendaftar") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const pendaftarId = session.id;

        // 1. Fetch pendaftar with notification flags
        const pendaftar = await prisma.pendaftar.findUnique({
            where: { id: pendaftarId },
            select: {
                id: true,
                nama_lengkap: true,
                no_hp: true,
                notif_belum_jadwal_terkirim: true,
                notif_jadwal_tersedia_terkirim: true,
                notif_hasil_tes_terkirim: true,
            },
        });

        if (!pendaftar) {
            return NextResponse.json(
                { error: "Data pendaftar tidak ditemukan" },
                { status: 404 }
            );
        }

        // 2. Fetch Grup A — Online test completion status
        const nilaiUjian = await prisma.nilaiUjian.findMany({
            where: { pendaftar_id: pendaftarId },
            select: {
                score_akademik: true,
                score_kepribadian: true,
                score_kesiapan: true,
                detail_akademik: true,
                detail_kepribadian: true,
                detail_kesiapan: true,
            },
        });

        // Combine to check completion
        const hasAkademik = nilaiUjian.some(
            (n) => n.score_akademik !== null || n.detail_akademik !== null
        );
        const hasKepribadian = nilaiUjian.some(
            (n) => n.score_kepribadian !== null || n.detail_kepribadian !== null
        );
        const hasKesiapan = nilaiUjian.some(
            (n) => n.score_kesiapan !== null || n.detail_kesiapan !== null
        );

        const grupA = {
            akademik: { completed: hasAkademik, label: "Kemampuan Dasar Akademik" },
            kepribadian: {
                completed: hasKepribadian,
                label: "Identifikasi Kepribadian",
            },
            kesiapan: { completed: hasKesiapan, label: "Tes Kesiapan" },
        };

        // 3. Fetch Grup B — Available exam sessions (future, active)
        const availableSessions = await prisma.examSession.findMany({
            where: {
                is_active: true,
                start_time: { gte: new Date() },
            },
            include: {
                _count: { select: { bookings: true } },
            },
            orderBy: { start_time: "asc" },
        });

        // 4. Fetch booked schedules for this pendaftar
        const bookedJadwal = await prisma.jadwalUjian.findMany({
            where: { pendaftar_id: pendaftarId },
            include: {
                exam_session: {
                    select: {
                        id: true,
                        title: true,
                        start_time: true,
                        end_time: true,
                        location: true,
                        notes: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });

        // 5. Determine condition
        const hasGrupBSessions = availableSessions.length > 0;

        // 6. Trigger WhatsApp notifications (flag-guarded, async, non-blocking)
        if (pendaftar.no_hp) {
            if (!hasGrupBSessions && !pendaftar.notif_belum_jadwal_terkirim) {
                // Kondisi 1: No sessions yet, send "jadwal belum tersedia"
                const message = buildMessageJadwalBelum(pendaftar.nama_lengkap);
                enqueueWhatsapp({
                    pendaftarId: pendaftar.id,
                    phone: pendaftar.no_hp,
                    jenisNotif: "jadwal_belum",
                    messageContent: message,
                }).catch((err) =>
                    console.error("Enqueue jadwal_belum error:", err)
                );
            } else if (
                hasGrupBSessions &&
                !pendaftar.notif_jadwal_tersedia_terkirim
            ) {
                // Kondisi 2: Sessions available from the start (or passively), send "jadwal langsung tersedia"
                const message = buildMessageJadwalLangsungTersedia(pendaftar.nama_lengkap);
                enqueueWhatsapp({
                    pendaftarId: pendaftar.id,
                    phone: pendaftar.no_hp,
                    jenisNotif: "jadwal_langsung_tersedia",
                    messageContent: message,
                }).catch((err) =>
                    console.error("Enqueue jadwal_langsung_tersedia error:", err)
                );
            }
        }

        // 7. Build response
        const openSlots = availableSessions
            .filter((s) => s._count.bookings < s.quota)
            .map((s) => ({
                id: s.id,
                title: s.title,
                start_time: s.start_time,
                end_time: s.end_time,
                quota: s.quota,
                booked: s._count.bookings,
                location: s.location,
                notes: s.notes,
                isFull: s._count.bookings >= s.quota,
            }));

        // Transform booked jadwal
        const booked = bookedJadwal.map((j) => ({
            id: j.id,
            jenis_ujian: j.exam_session?.title || "Seleksi Santri Baru",
            tanggal_ujian: j.tanggal_ujian,
            waktu_mulai: j.exam_session?.start_time || j.waktu_mulai_santri,
            waktu_selesai: j.exam_session?.end_time || j.waktu_selesai_santri,
            lokasi: j.exam_session?.location || j.tempat_santri,
            keterangan: j.catatan || j.exam_session?.notes,
            online_test_link: j.online_test_link,
            status_santri: j.status_santri,
            status_quran: j.status_quran,
            status_ortu: j.status_ortu,
        }));

        // Calculate overall progress
        // Grup B: only count as completed when status is "completed", not just "scheduled"
        const totalTests = 6; // 3 Grup A + 3 Grup B
        const grupBCompleted = bookedJadwal.filter((j) => {
            const title = j.exam_session?.title || "";
            if (title.includes("Qur'an") || title.includes("Quran")) {
                return j.status_quran === "completed";
            } else if (title.includes("Cawalsan") || title.includes("Orang Tua") || title.includes("Ortu")) {
                return j.status_ortu === "completed";
            } else {
                // Wawancara Calsan / Wawancara Santri
                return j.status_santri === "completed";
            }
        }).length;
        const completedTests =
            [hasAkademik, hasKepribadian, hasKesiapan].filter(Boolean).length +
            grupBCompleted;
        const progress = Math.round((completedTests / totalTests) * 100);

        return NextResponse.json({
            data: {
                grupA,
                grupB: {
                    hasSchedules: hasGrupBSessions,
                    availableSlots: openSlots,
                    booked,
                },
                progress: {
                    completed: completedTests,
                    total: totalTests,
                    percentage: Math.min(progress, 100),
                },
                condition: hasGrupBSessions ? "jadwal_tersedia" : "jadwal_belum",
            },
        });
    } catch (error: any) {
        console.error("GET undangan-seleksi error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
