import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { enqueueWhatsapp } from "@/lib/whatsapp-queue";
import { generateMagicToken, getPermanentAuthUrl } from "@/lib/utils/magic-link";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Find all active schedules from today onwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingSchedules = await prisma.jadwalUjian.findMany({
      where: {
        jadwal_status: "SCHEDULED",
        exam_session: {
          start_time: { gte: today },
        },
      },
      include: {
        exam_session: true,
      },
    });

    if (upcomingSchedules.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "Tidak ada jadwal ujian ke depan." });
    }

    // 2. Collect unique Penguji IDs
    const pengujiIds = new Set<string>();
    upcomingSchedules.forEach((j) => {
      if (j.penguji_santri_id) pengujiIds.add(j.penguji_santri_id);
      if (j.penguji_quran_id) pengujiIds.add(j.penguji_quran_id);
      if (j.penguji_ortu_id) pengujiIds.add(j.penguji_ortu_id);
      if (j.penguji_hafalan_id) pengujiIds.add(j.penguji_hafalan_id);
      if (j.penguji_arab_id) pengujiIds.add(j.penguji_arab_id);
    });

    if (pengujiIds.size === 0) {
      return NextResponse.json({ success: true, count: 0, message: "Tidak ada penguji yang ditugaskan." });
    }

    // 3. Fetch Penguji Profiles
    const pengujiProfiles = await prisma.profile.findMany({
      where: {
        id: { in: Array.from(pengujiIds) },
      },
    });

    let successCount = 0;

    // 4. Send WA to each Penguji
    for (const profile of pengujiProfiles) {
      if (!profile.phone) continue;

      const title = profile.gender === "P" ? "Ustadzah" : "Ustadz";
      const token = await generateMagicToken(profile.id, "penguji");
      const shortUrl = await getPermanentAuthUrl(token);

      const message = `*PEMBERITAHUAN JADWAL MENGUJI*

Assalamu'alaikum ${title} *${profile.full_name}*,

Mengingatkan bahwa Anda telah dijadwalkan untuk menguji pada sesi seleksi penerimaan santri baru PPDB Al-Andalus.

Untuk melihat rincian lengkap daftar santri, waktu, dan form penilaian, silakan klik tautan masuk otomatis berikut:
${shortUrl}

_Link ini terenkripsi dan otomatis memasukkan Anda ke dashboard tanpa password._

Jazakumullahu khairan.
Panitia PPDB Al-Andalus`;

      await enqueueWhatsapp({
        pendaftarId: "penguji-broadcast", // dummy ID since we don't have a single pendaftar
        phone: profile.phone,
        jenisNotif: "broadcast_penguji",
        messageContent: message,
        scheduledAt: new Date(),
        sendNow: true, // Force send now
      });

      successCount++;
    }

    return NextResponse.json({
      success: true,
      count: successCount,
      message: `Berhasil mengirim notifikasi ke ${successCount} penguji.`,
    });
  } catch (error: any) {
    console.error("Broadcast Penguji error:", error);
    return NextResponse.json({ error: error.message || "Failed to broadcast" }, { status: 500 });
  }
}
