import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { enqueueWhatsapp, buildMessageJadwalTersedia } from "@/lib/whatsapp-queue";

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

// GET: List exam sessions
export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Permission Check
    const { searchParams } = new URL(request.url);
    const creator_id = searchParams.get("creator_id");
    const is_active = searchParams.get("is_active");

    const allowedRoles = ['admin_super', 'admin', 'head_of_it', 'penguji', 'admin_berkas', 'penguji_calsan', 'pewawancara_calsan', 'pewawancara_cawalsan'];
    const isAdminOrExaminer = allowedRoles.includes(session.role);
    const isPendaftar = session.role === 'pendaftar';

    if (!isAdminOrExaminer && !isPendaftar) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const whereClause: any = {};

        // Pendaftar Restriction: Must be active + future
        if (isPendaftar) {
            whereClause.is_active = true;
            whereClause.start_time = { gte: new Date() };

            // Pendaftar cannot see other filters
            if (creator_id) {
                // ignore creator_id or return error? better ignore to prevent probing
            }
        } else {
            // Admin/Examiner Logic
            if (creator_id === 'me') {
                whereClause.created_by = session.user_id || session.id;
            } else if (creator_id) {
                whereClause.created_by = creator_id;
            }

            if (is_active === 'true') {
                whereClause.is_active = true;
                whereClause.start_time = { gte: new Date() };
            }
        }

        const sessions = await prisma.examSession.findMany({
            where: whereClause,
            include: {
                creator: isPendaftar ? false : { select: { full_name: true } },
                _count: { select: { bookings: true } }
            },
            orderBy: { start_time: 'asc' }
        });

        return NextResponse.json({ data: sessions });
    } catch (error: any) {
        console.error("GET exam-sessions error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create new exam session (Examiner/Admin)
export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission: Any admin or examiner can create slots
    const allowedRoles = ['admin_super', 'admin', 'head_of_it', 'penguji', 'admin_berkas', 'penguji_calsan', 'pewawancara_calsan', 'pewawancara_cawalsan'];
    if (!allowedRoles.includes(session.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { title, start_time, end_time, quota, location, notes } = body;

        // Basic validation
        if (!start_time || !end_time || !quota) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newSession = await prisma.examSession.create({
            data: {
                title: title || "Sesi Ujian",
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                quota: parseInt(quota),
                location,
                notes,
                created_by: session.user_id || session.id, // Ensure correct ID usage
            }
        });

        // BACKGROUND TASK: Enqueue WA notifications to all Pendaftars who haven't received it yet
        try {
            const pendaftarsToNotify = await prisma.pendaftar.findMany({
                where: {
                    notif_jadwal_tersedia_terkirim: false,
                    no_hp: { not: null, notIn: [""] },
                    status_pendaftaran: { in: ['docs_verified', 'scheduled'] } // 👈 ONLY NOTIFY COMPLETED/ELIGIBLE APPLICANTS
                },
                select: { id: true, nama_lengkap: true, no_hp: true }
            });

            for (const p of pendaftarsToNotify) {
                if (p.no_hp) {
                    enqueueWhatsapp({
                        pendaftarId: p.id,
                        phone: p.no_hp,
                        jenisNotif: "jadwal_tersedia",
                        messageContent: buildMessageJadwalTersedia(p.nama_lengkap),
                    }).catch(err => console.error("Failed to enqueue WA for", p.nama_lengkap, err));
                }
            }
        } catch (error) {
            console.error("Error batching WA notifications for exam session:", error);
        }

        return NextResponse.json({ success: true, data: newSession });
    } catch (error: any) {
        console.error("POST exam-sessions error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Cancel session
export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
        // Check if session exists and owned by user (or is admin)
        const targetSession = await prisma.examSession.findUnique({
            where: { id },
            include: { _count: { select: { bookings: true } } }
        });

        if (!targetSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });

        // Permission check
        const isAdmin = ['admin_super', 'admin', 'head_of_it', 'penguji', 'admin_berkas', 'penguji_calsan', 'pewawancara_calsan', 'pewawancara_cawalsan'].includes(session.role);
        const isOwner = targetSession.created_by === (session.user_id || session.id);

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check if bookings exist
        if (targetSession._count.bookings > 0) {
            return NextResponse.json({ error: "Cannot delete session with existing bookings" }, { status: 400 });
        }

        await prisma.examSession.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
