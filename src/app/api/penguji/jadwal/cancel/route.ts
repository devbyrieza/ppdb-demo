import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  enqueueWhatsapp,
  buildMessagePembatalanJadwal,
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

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user_id || session.id;

  try {
    const body = await request.json();
    const { jadwal_id, alasan } = body;

    if (!jadwal_id) {
      return NextResponse.json(
        { error: "Jadwal ID is required" },
        { status: 400 },
      );
    }

    // 1. Get Jadwal with all relations
    const jadwal = await prisma.jadwalUjian.findUnique({
      where: { id: jadwal_id },
      include: {
        pendaftar: {
          select: {
            id: true,
            nama_lengkap: true,
            no_hp: true,
            orang_tua: { select: { no_hp_ayah: true, no_hp_ibu: true } },
          },
        },
        exam_session: true,
      },
    });

    if (!jadwal) {
      return NextResponse.json({ error: "Jadwal not found" }, { status: 404 });
    }

    // 2. Permission Check: Only assigned examiners or session creators
    const isAssigned =
      jadwal.penguji_santri_id === userId ||
      jadwal.penguji_quran_id === userId ||
      jadwal.penguji_ortu_id === userId;

    const isCreator = jadwal.exam_session?.created_by === userId;

    if (!isAssigned && !isCreator) {
      return NextResponse.json(
        { error: "You do not have permission to cancel this schedule" },
        { status: 403 },
      );
    }

    // 3. Determine Examination Type for the message
    let jenisUjian = "Ujian Seleksi";
    if (jadwal.exam_session?.title) {
      jenisUjian = jadwal.exam_session.title;
    } else if (jadwal.penguji_santri_id === userId) {
      jenisUjian = "Seleksi Wawancara Calon Santri";
    } else if (jadwal.penguji_quran_id === userId) {
      jenisUjian = "Seleksi Al Qur'an";
    } else if (jadwal.penguji_ortu_id === userId) {
      jenisUjian = "Seleksi Wawancara Orang Tua";
    }

    const dateFormatted = new Date(jadwal.tanggal_ujian)
      .toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace("Minggu", "Ahad");

    const timeFormatted = new Date(
      jadwal.exam_session?.start_time || jadwal.waktu_mulai_santri,
    ).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 4. Perform Transaction: Delete booking and Slot
    await prisma.$transaction(async (tx) => {
      // Delete the booking
      await tx.jadwalUjian.delete({
        where: { id: jadwal_id },
      });

      // Delete the slot (ExamSession) as per "Safety First" recommendation
      if (jadwal.exam_session_id) {
        await tx.examSession.delete({
          where: { id: jadwal.exam_session_id },
        });
      }
    });

    // 5. Enqueue WhatsApp Notification to Pendaftar
    const phone =
      jadwal.pendaftar.no_hp ||
      jadwal.pendaftar.orang_tua?.no_hp_ayah ||
      jadwal.pendaftar.orang_tua?.no_hp_ibu;
    if (phone) {
      const message = buildMessagePembatalanJadwal(
        jadwal.pendaftar.nama_lengkap,
        jenisUjian,
        dateFormatted,
        timeFormatted,
        alasan || "Ustadz Berhalangan Hadir",
      );

      await enqueueWhatsapp({
        pendaftarId: jadwal.pendaftar.id,
        phone,
        jenisNotif: "pembatalan_jadwal",
        messageContent: message,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Jadwal berhasil dibatalkan dan santri telah dinotifikasi.",
    });
  } catch (error: any) {
    console.error("POST /api/penguji/jadwal/cancel error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
