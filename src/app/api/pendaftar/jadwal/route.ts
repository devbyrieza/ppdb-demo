import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { enqueueWhatsapp, buildMessageKonfirmasiJadwal } from "@/lib/whatsapp-queue";

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

// GET: Fetch existing schedule for pendaftar
export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'pendaftar') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const jadwal = await prisma.jadwalUjian.findMany({
            where: { pendaftar_id: session.id },
            include: {
                exam_session: true
            },
            orderBy: { created_at: 'desc' }
        });

        // Transform to match front-end expectation
        const data = jadwal.map(item => ({
            id: item.id,
            jenis_ujian: "Seleksi Santri Baru", // Static label or derive
            tanggal_ujian: item.tanggal_ujian,
            waktu_mulai: item.exam_session?.start_time || item.waktu_mulai_santri,
            waktu_selesai: item.exam_session?.end_time || item.waktu_selesai_santri,
            lokasi: item.exam_session?.location || item.tempat_santri,
            keterangan: item.catatan || item.exam_session?.notes,
            online_test_link: item.online_test_link, // For Phase 1
        }));

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error("GET pendaftar/jadwal error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Book a slot (Create Schedule)
export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'pendaftar') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { exam_session_id } = body;

        if (!exam_session_id) {
            return NextResponse.json({ error: "Session ID required" }, { status: 400 });
        }

        // 1. Validate Session First
        const examSession = await prisma.examSession.findUnique({
            where: { id: exam_session_id },
            include: { _count: { select: { bookings: true } } }
        });

        if (!examSession) return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
        if (!examSession.is_active) return NextResponse.json({ error: "Sesi tidak aktif" }, { status: 400 });
        if (examSession._count.bookings >= examSession.quota) {
            return NextResponse.json({ error: "Kuota penuh" }, { status: 400 });
        }

        // 2. Check for reduced duplication (Same Exam Type)
        const existingBookings = await prisma.jadwalUjian.findMany({
            where: { pendaftar_id: session.id },
            include: { exam_session: true }
        });

        // Check if any existing booking has the same title/type
        const duplicateType = existingBookings.find(booking => {
            // If booking has a session, compare titles
            if (booking.exam_session?.title && examSession.title) {
                return booking.exam_session.title === examSession.title;
            }
            // If legacy booking (no session) or untitled, maybe block to be safe? 
            // Or assume manual schedule covers everything?
            // For now, let's assume if titles match, it's a duplicate.
            return false;
        });

        if (duplicateType) {
            return NextResponse.json({
                error: `Anda sudah memiliki jadwal untuk ${examSession.title || 'Ujian ini'}.`
            }, { status: 400 });
        }

        // Transaction to book
        // 1. Create Jadwal
        // 2. No need to increment counter manually if using _count, but if we have booked_count field we should update it.
        // My schema has `booked_count` int field. I should update it.

        const result = await prisma.$transaction(async (tx) => {
            // Increment count first to lock? Prisma doesn't lock automatically like that easily, but atomic increment works.
            const updatedSession = await tx.examSession.update({
                where: { id: exam_session_id },
                data: { booked_count: { increment: 1 } }
            });

            if (updatedSession.booked_count > updatedSession.quota) {
                throw new Error("Kuota penuh (race condition)");
            }

            // Create Jadwal
            // Need `tahun_ajaran_id`. How to get? 
            // Usually Pendaftar is linked to TahunAjaran. I should fetch Pendaftar first.
            const pendaftar = await tx.pendaftar.findUnique({ where: { id: session.id } });
            if (!pendaftar) throw new Error("Data pendaftar tidak ditemukan");

            let pengujiFields: Record<string, string> = {};
            const sessionTitle = (examSession.title || "").toLowerCase();
            if (examSession.created_by) {
                if (sessionTitle.includes("qur") || sessionTitle.includes("quran")) {
                    pengujiFields = { penguji_quran_id: examSession.created_by };
                } else if (sessionTitle.includes("calsan") || sessionTitle.includes("santri")) {
                    pengujiFields = { penguji_santri_id: examSession.created_by };
                } else if (sessionTitle.includes("cawalsan") || sessionTitle.includes("ortu") || sessionTitle.includes("orang")) {
                    pengujiFields = { penguji_ortu_id: examSession.created_by };
                }
            }

            const jadwal = await tx.jadwalUjian.create({
                data: {
                    tahun_ajaran_id: pendaftar.tahun_ajaran_id,
                    pendaftar_id: session.id,
                    exam_session_id: exam_session_id,
                    tanggal_ujian: examSession.start_time, // Date part
                    waktu_mulai_santri: examSession.start_time, // Temporarily copy session time to specific fields for compat
                    waktu_selesai_santri: examSession.end_time,
                    tempat_santri: examSession.location || "Pesantren",
                    waktu_mulai_ortu: examSession.start_time,
                    waktu_selesai_ortu: examSession.end_time,
                    tempat_ortu: examSession.location || "Pesantren",
                    status_santri: "scheduled",
                    status_quran: "scheduled",
                    status_ortu: "scheduled",
                    status_online_test: "pending",
                    ...pengujiFields
                }
            });

            // 1.5. Update pendaftar status to 'scheduled'
            await tx.pendaftar.update({
                where: { id: session.id },
                data: { status_pendaftaran: 'scheduled' }
            });

            // 2. Initialize NilaiUjian
            await tx.nilaiUjian.create({
                data: {
                    pendaftar_id: session.id,
                    jadwal_ujian_id: jadwal.id,
                }
            });

            return jadwal;
        });

        // Send WhatsApp via Queue (Layer 2: Non-blocking, through queue)
        const pendaftarInfo = await prisma.pendaftar.findUnique({
            where: { id: session.id },
            select: { nama_lengkap: true, no_hp: true }
        });

        if (pendaftarInfo && pendaftarInfo.no_hp) {
            const startTime = new Date(examSession.start_time);
            const dateStr = startTime.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const timeStr = startTime.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + ' WIB';
            const lokasi = examSession.location || "Pesantren Al-Andalus Ulul Albaab";
            const jenisUjian = examSession.title || "Seleksi Santri Baru";

            const message = buildMessageKonfirmasiJadwal(
                pendaftarInfo.nama_lengkap,
                dateStr,
                timeStr,
                lokasi,
                jenisUjian
            );

            // Enqueue via WhatsApp queue (all 6 layers applied)
            enqueueWhatsapp({
                pendaftarId: session.id,
                phone: pendaftarInfo.no_hp,
                jenisNotif: "konfirmasi_jadwal",
                messageContent: message,
            }).catch((err: any) => console.error("Failed to enqueue jadwal confirmation:", err));
        }

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error("POST pendaftar/jadwal error:", error);
        return NextResponse.json({ error: error.message || "Gagal booking jadwal" }, { status: 500 });
    }
}
