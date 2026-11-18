import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  enqueueWhatsapp,
  buildMessageKonfirmasiJadwalPendaftar,
  buildMessageKonfirmasiJadwalInterviewer,
  buildMessageReminderH1Santri,
  buildMessageReminderH1Penguji } from "@/lib/whatsapp-queue";
import { generateMagicToken } from "@/lib/utils/magic-link";
import { getLeastLoadedExaminerFromPool } from "@/lib/utils/assignment";

function getExamCategory(title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("hafalan")) return "HAFALAN";
  if (t.includes("quran") || t.includes("qur'an") || t.includes("bacaan")) return "QURAN";
  if (t.includes("arab") || t.includes("lisan")) return "LISAN_ARAB";
  // W_ORTU must be checked BEFORE W_SANTRI because titles often contain "Orangtua/Wali Santri", "Calon Wali Santri", "Cawalsan", etc.
  if (
    t.includes("cawalsan") ||
    t.includes("ortu") ||
    t.includes("orang tua") ||
    t.includes("orangtua") ||
    t.includes("wali")
  ) {
    return "W_ORTU";
  }
  if (t.includes("calsan") || t.includes("santri")) return "W_SANTRI";
  return "OTHER";
}

function sanitizeTitle(title: string): string {
  // Remove anything in parentheses (e.g. examiner names)
  return (title || "").replace(/\s*\(.*?\)\s*/g, "").trim();
}

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);

  } catch {
    return null;
  }
}

// GET: Fetch existing schedule for pendaftar
// JADWAL H+1 s/d H+14 (Maksimal 2 Pekan):
// 1. Pendaftar hanya dapat memilih jadwal mulai BESOK (H+1). Jadwal hari ini tidak dapat dipilih.
// 2. Pendaftar hanya dapat memilih jadwal maksimal 14 hari (2 pekan) ke depan.
function getEarliestSelectableDate(): Date {
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
  return new Date(
    Date.UTC(
      nowWIB.getUTCFullYear(),
      nowWIB.getUTCMonth(),
      nowWIB.getUTCDate() + 1,
      0, 0, 0, 0
    ) - WIB_OFFSET_MS,
  );
}

function getLatestSelectableDate(): Date {
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
  const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
  return new Date(
    Date.UTC(
      nowWIB.getUTCFullYear(),
      nowWIB.getUTCMonth(),
      nowWIB.getUTCDate() + 14,
      23, 59, 59, 999
    ) - WIB_OFFSET_MS,
  );
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "pendaftar") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jadwal = await prisma.jadwalUjian.findMany({
      where: { pendaftar_id: session.id },
      include: {
        exam_session: true },
      orderBy: { created_at: "desc" } });

    // Transform to match front-end expectation
    const data = jadwal.map((item) => ({
      id: item.id,
      jenis_ujian: sanitizeTitle(
        item.exam_session?.title || "Seleksi Santri Baru",
      ),
      category: getExamCategory(item.exam_session?.title || ""),
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
  if (!session || session.role !== "pendaftar") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { exam_session_id, target_category } = body;

    if (!exam_session_id) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 },
      );
    }

    // 1. Validate Session First
    const examSession = await prisma.examSession.findUnique({
      where: { id: exam_session_id },
      include: { _count: { select: { bookings: true } } } });

    if (!examSession)
      return NextResponse.json(
        { error: "Sesi tidak ditemukan" },
        { status: 404 },
      );
    if (!examSession.is_active)
      return NextResponse.json({ error: "Sesi tidak aktif" }, { status: 400 });
    if (examSession._count.bookings >= examSession.quota) {
      return NextResponse.json({ error: "Kuota penuh" }, { status: 400 });
    }

    // JADWAL H+1 s/d H+14 (Maksimal 2 Pekan):
    // 1. Paling awal: Mulai besok (H+1). Jadwal hari ini tidak dapat dipilih.
    if (new Date(examSession.start_time).getTime() < getEarliestSelectableDate().getTime()) {
      return NextResponse.json(
        { error: "Jadwal untuk hari ini tidak dapat dipilih. Silakan pilih jadwal mulai besok (H+1)." },
        { status: 400 },
      );
    }

    // 2. Paling akhir: Maksimal 14 hari (2 pekan) ke depan.
    if (new Date(examSession.start_time).getTime() > getLatestSelectableDate().getTime()) {
      return NextResponse.json(
        { error: "Jadwal yang dipilih melebihi batas 14 hari (2 pekan) ke depan." },
        { status: 400 },
      );
    }

    // 2. Check for categorical duplication (Quran, Hafalan, Arab, Santri, Ortu)
    const existingBookings = await prisma.jadwalUjian.findMany({
      where: { pendaftar_id: session.id },
      include: { exam_session: true } });

    const currentCategory = target_category || getExamCategory(examSession.title || "");

    // Check if any existing booking has the same category
    const duplicateCategory = existingBookings.find((booking) => {
      const bookedTitle = booking.exam_session?.title || "";
      return getExamCategory(bookedTitle) === currentCategory;
    });

    if (duplicateCategory) {
      const categoryLabel =
        currentCategory === "HAFALAN"
          ? "Tes Hafalan Al-Qur'an"
          : currentCategory === "LISAN_ARAB"
          ? "Tes Lisan Bahasa Arab"
          : currentCategory === "QURAN"
          ? "Tes Bacaan Al-Qur'an"
          : currentCategory === "W_SANTRI"
          ? "Seleksi Wawancara Calon Santri"
          : currentCategory === "W_ORTU"
          ? "Wawancara Calon Orang Tua/Wali"
          : "Ujian ini";

      return NextResponse.json(
        {
          error: `Anda sudah memiliki jadwal untuk ${categoryLabel}.` },
        { status: 400 },
      );
    }

    // 2b. Guard: Mencegah pendaftar memilih dua ujian berbeda pada rentang waktu yang sama (bentrok waktu santri)
    const sStart = new Date(examSession.start_time).getTime();
    const sEnd = new Date(examSession.end_time).getTime();
    const overlappingCandidateBooking = existingBookings.find((b) => {
      if (!b.exam_session) return false;
      const bStart = new Date(b.exam_session.start_time).getTime();
      const bEnd = new Date(b.exam_session.end_time).getTime();
      return sStart < bEnd && sEnd > bStart;
    });

    if (overlappingCandidateBooking) {
      const bookedCat = getExamCategory(overlappingCandidateBooking.exam_session?.title || "");
      const bookedLabel =
        bookedCat === "HAFALAN"
          ? "Tes Hafalan Al-Qur'an"
          : bookedCat === "LISAN_ARAB"
          ? "Tes Lisan Bahasa Arab"
          : bookedCat === "QURAN"
          ? "Tes Bacaan Al-Qur'an"
          : bookedCat === "W_SANTRI"
          ? "Seleksi Wawancara Calon Santri"
          : bookedCat === "W_ORTU"
          ? "Wawancara Calon Orang Tua/Wali"
          : overlappingCandidateBooking.exam_session?.title || "Ujian lain";

      return NextResponse.json(
        {
          error: `Jadwal bentrok: Anda sudah memiliki jadwal untuk ${bookedLabel} pada rentang waktu yang sama. Silakan pilih jam atau hari lain agar jadwal tidak tumpang tindih.`
        },
        { status: 400 }
      );
    }

    // Fetch pendaftar first (outside transaction to avoid deadlocks)
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: session.id } });
    if (!pendaftar) {
      return NextResponse.json(
        { error: "Data pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    // Guard: Tes Hafalan dan Bahasa Arab HANYA boleh dipilih oleh pendaftar jenjang SMA/MA langsung (bukan MTs/SMP/IL)
    const jenjangStr = pendaftar.jenjang || "";
    const cleanJenjang = jenjangStr.trim().toUpperCase();
    const isDirectSMAorMA = !(
      cleanJenjang === "IL" ||
      cleanJenjang.includes("IL ") ||
      cleanJenjang.includes(" IL") ||
      cleanJenjang.includes("(IL)") ||
      cleanJenjang.includes("I'DAD") ||
      cleanJenjang.includes("IDAD") ||
      cleanJenjang.includes("IDADIYAH") ||
      cleanJenjang.includes("SMP") ||
      cleanJenjang.includes("MTS") ||
      cleanJenjang.includes("TSANAWIYAH")
    ) && (
      cleanJenjang.includes("SMA") ||
      cleanJenjang.includes("MA") ||
      cleanJenjang.includes("ALIYAH") ||
      cleanJenjang.includes("SLTA")
    );

    if (currentCategory === "LISAN_ARAB" || currentCategory === "HAFALAN") {
      if (!isDirectSMAorMA) {
        return NextResponse.json(
          { error: "Tes Hafalan Al-Qur'an dan Tes Lisan Bahasa Arab khusus diperuntukkan bagi pendaftar jenjang SMA/MA langsung." },
          { status: 400 }
        );
      }
    }

    // RUN LOAD BALANCING (outside transaction to avoid connection pool deadlock)
    const balancedAssignment = await getLeastLoadedExaminerFromPool(
      examSession.start_time,
      currentCategory,
      pendaftar.tahun_ajaran_id,
      pendaftar.jenis_kelamin,
    );

    // Transaction to book (Write operations only)
    const result = await prisma.$transaction(async (tx) => {
      // Increment count first to lock
      const updatedSession = await tx.examSession.update({
        where: { id: exam_session_id },
        data: { booked_count: { increment: 1 } } });

      if (updatedSession.booked_count > updatedSession.quota) {
        throw new Error("Kuota penuh (race condition)");
      }

      let pengujiFields: Record<string, string | null> = {};
      const finalExaminerId =
        balancedAssignment?.examiner_id || examSession.created_by;
      const finalSessionId = balancedAssignment?.session_id || exam_session_id;

      if (finalExaminerId) {
        const interviewer = await tx.profile.findUnique({
          where: { id: finalExaminerId },
          select: { role: true, secondary_roles: true, google_meet_link: true, full_name: true, phone: true } });

        const isCreatorAdmin = interviewer?.role === "admin" || interviewer?.role === "admin_super";

        // Atomic Dual-Role Conflict Guard: hanya cek untuk penguji riil (bukan admin pembuat batch sesi)
        if (!isCreatorAdmin) {
          const conflictingBooking = await tx.jadwalUjian.findFirst({
            where: {
              OR: [
                { penguji_quran_id: finalExaminerId },
                { penguji_hafalan_id: finalExaminerId },
                { penguji_santri_id: finalExaminerId },
                { penguji_ortu_id: finalExaminerId },
                { penguji_arab_id: finalExaminerId },
              ],
              exam_session: {
                start_time: { lt: examSession.end_time },
                end_time: { gt: examSession.start_time },
              },
            },
          });

          if (conflictingBooking) {
            throw new Error("Penguji ini baru saja terisi untuk sesi ujian lain di waktu yang sama. Silakan pilih sesi atau waktu lainnya.");
          }
        }

        if (currentCategory === "LISAN_ARAB") {
          pengujiFields = {
            penguji_arab_id: finalExaminerId,
            zoom_link_arab: interviewer?.google_meet_link || null
          };
        } else if (currentCategory === "HAFALAN") {
          pengujiFields = {
            penguji_hafalan_id: finalExaminerId,
            penguji_quran_id: finalExaminerId,
            zoom_link_hafalan: interviewer?.google_meet_link || null,
            google_meet_link: interviewer?.google_meet_link || null
          };
        } else if (currentCategory === "QURAN") {
          pengujiFields = {
            penguji_quran_id: finalExaminerId,
            penguji_hafalan_id: finalExaminerId,
            zoom_link_quran: interviewer?.google_meet_link || null,
            google_meet_link: interviewer?.google_meet_link || null
          };
        } else if (currentCategory === "W_SANTRI") {
          pengujiFields = {
            penguji_santri_id: finalExaminerId,
            zoom_link_santri: interviewer?.google_meet_link || null,
            google_meet_link: interviewer?.google_meet_link || null
          };
        } else if (currentCategory === "W_ORTU") {
          pengujiFields = {
            penguji_ortu_id: finalExaminerId,
            zoom_link_ortu: interviewer?.google_meet_link || null,
            google_meet_link: interviewer?.google_meet_link || null
          };
        }
      }

      const jadwal = await tx.jadwalUjian.create({
        data: {
          tahun_ajaran_id: pendaftar.tahun_ajaran_id,
          pendaftar_id: session.id,
          exam_session_id: finalSessionId || exam_session_id,
          tanggal_ujian: examSession.start_time, // Date part
          waktu_mulai_santri: examSession.start_time, // Temporarily copy session time to specific fields for compat
          waktu_selesai_santri: examSession.end_time,
          tempat_santri: examSession.location || "Pesantren",
          waktu_mulai_ortu: examSession.start_time,
          waktu_selesai_ortu: examSession.end_time,
          tempat_ortu: examSession.location || "Pesantren",
          status_santri: "scheduled",
          status_quran: "scheduled",
          status_hafalan: "scheduled",
          status_ortu: "scheduled",
          status_arab: "scheduled",
          status_online_test: "pending",
          ...pengujiFields } });

      // 1.5. Update pendaftar status to 'scheduled'
      await tx.pendaftar.update({
        where: { id: session.id },
        data: { status_pendaftaran: "scheduled" } });

      // 2. Initialize NilaiUjian
      await tx.nilaiUjian.create({
        data: {
          pendaftar_id: session.id,
          jadwal_ujian_id: jadwal.id } });

      // 3. Trigger immediate merge/recalculation to absorb any existing scores
      const { recalculateNilaiUjian } = await import("@/lib/scoring");
      await recalculateNilaiUjian(session.id);

      return { jadwal, pengujiFields };
    });

    const { jadwal, pengujiFields } = result;

    // Send WhatsApp via Queue (Layer 2: Non-blocking, through queue)
    const pendaftarInfo = await prisma.pendaftar.findUnique({
      where: { id: session.id },
      select: { nama_lengkap: true, no_hp: true, nomor_pendaftaran: true } });

    if (pendaftarInfo && pendaftarInfo.no_hp) {
      const startTime = new Date(examSession.start_time);
      const dateStr = startTime.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta" });
      const timeStr =
        startTime.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta" }) + " WIB";
      const lokasi = examSession.location || "Pesantren Al Imam Al Islami";
      const jenisUjian = sanitizeTitle(
        examSession.title || "Seleksi Santri Baru",
      );

      // 1. Notify Pendaftar — SEGERA setelah booking jadwal
      const konfirmasiMsg = buildMessageKonfirmasiJadwalPendaftar(
        pendaftarInfo.nama_lengkap,
        jenisUjian,
        dateStr,
        timeStr,
        examSession.location || lokasi,
      );
      enqueueWhatsapp({
        pendaftarId: session.id,
        phone: pendaftarInfo.no_hp,
        jenisNotif: "konfirmasi_jadwal_pendaftar",
        messageContent: konfirmasiMsg }).catch((err: any) => console.error("Failed to enqueue jadwal confirmation to pendaftar:", err));

      // 2. Notify Interviewer — SEGERA setelah booking (Level Diamond Instant Dispatch)
      const finalId =
        pengujiFields.penguji_quran_id ||
        pengujiFields.penguji_santri_id ||
        pengujiFields.penguji_ortu_id ||
        pengujiFields.penguji_arab_id ||
        examSession.created_by;
      if (finalId) {
        const interviewer = await prisma.profile.findUnique({
          where: { id: finalId },
          select: { id: true, full_name: true, phone: true, jenis_kelamin: true, google_meet_link: true } });

        if (interviewer && interviewer.phone) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spmb.pesantren-alimam.com";
          const { generateExaminerInputLink } = await import("@/lib/utils/magic-link");
          const shortUrlKonfirmasi = generateExaminerInputLink(
            interviewer.id,
            pendaftarInfo.nomor_pendaftaran,
            appUrl
          );

          const intMessage = buildMessageKonfirmasiJadwalInterviewer(
            interviewer.full_name,
            pendaftarInfo.nama_lengkap,
            dateStr,
            timeStr,
            interviewer.google_meet_link || lokasi,
            jenisUjian,
            shortUrlKonfirmasi,
            interviewer.jenis_kelamin
          );

          // Delay 1 menit untuk menghindari burst pesan berturut-turut
          const scheduledAtInt = new Date();
          scheduledAtInt.setMinutes(scheduledAtInt.getMinutes() + 1);

          enqueueWhatsapp({
            pendaftarId: session.id,
            phone: interviewer.phone,
            jenisNotif: "konfirmasi_jadwal_interviewer",
            messageContent: intMessage,
            scheduledAt: scheduledAtInt }).catch((err: any) => console.error("Failed to enqueue interviewer notification:", err));
        }
      }


    }

    return NextResponse.json({ success: true, data: result.jadwal });
  } catch (error: any) {
    console.error("POST pendaftar/jadwal error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal booking jadwal" },
      { status: 500 },
    );
  }
}

