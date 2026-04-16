import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
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

export async function GET() {
    const session = await getSession();
    if (!session || !['admin_super', 'admin', 'head_of_it'].includes(session.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Count eligible pendaftars (paid/docs_verified and not yet notified)
        const eligibleCount = await prisma.pendaftar.count({
            where: {
                status_pendaftaran: { in: ['paid', 'docs_verified'] },
                notif_jadwal_tersedia_terkirim: false,
                no_hp: { not: null, notIn: [""] },
                jadwal_ujian: { none: {} } // Has no schedule yet
            }
        });

        // 2. Count total available slots
        const sessions = await prisma.examSession.findMany({
            where: {
                is_active: true,
                start_time: { gte: new Date() }
            },
            include: {
                _count: { select: { bookings: true } }
            }
        });

        const totalAvailableSlots = sessions.reduce((acc, s) => {
            return acc + Math.max(0, s.quota - s._count.bookings);
        }, 0);

        return NextResponse.json({
            data: {
                eligibleCount,
                totalAvailableSlots
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || !['admin_super', 'admin', 'head_of_it'].includes(session.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { reset_flags } = body;

        // 1. If reset_flags is true, reset all paid/docs_verified applicants' flags
        if (reset_flags) {
            await prisma.pendaftar.updateMany({
                where: {
                    status_pendaftaran: { in: ['paid', 'docs_verified'] },
                    jadwal_ujian: { none: {} }
                },
                data: {
                    notif_jadwal_tersedia_terkirim: false
                }
            });
        }

        // 2. Fetch target pendaftars
        const targets = await prisma.pendaftar.findMany({
            where: {
                status_pendaftaran: { in: ['paid', 'docs_verified'] },
                notif_jadwal_tersedia_terkirim: false,
                no_hp: { not: null, notIn: [""] },
                jadwal_ujian: { none: {} }
            },
            select: { id: true, nama_lengkap: true, no_hp: true }
        });

        if (targets.length === 0) {
            return NextResponse.json({ message: "Tidak ada pendaftar yang perlu dikirimi notifikasi." });
        }

        // 3. Enqueue notifications (staggered is handled by the queue logic itself)
        let successCount = 0;
        for (const p of targets) {
            if (p.no_hp) {
                await enqueueWhatsapp({
                    pendaftarId: p.id,
                    phone: p.no_hp,
                    jenisNotif: "jadwal_tersedia",
                    messageContent: buildMessageJadwalTersedia(p.nama_lengkap),
                });
                
                // Mark as sent (enqueued)
                await prisma.pendaftar.update({
                    where: { id: p.id },
                    data: { notif_jadwal_tersedia_terkirim: true }
                });
                
                successCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `${successCount} notifikasi telah masuk antrean pengiriman.`,
            count: successCount
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
