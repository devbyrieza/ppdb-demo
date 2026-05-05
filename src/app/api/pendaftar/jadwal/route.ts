import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  enqueueWhatsapp,
  buildMessageKonfirmasiJadwal,
  buildMessageKonfirmasiJadwalInterviewer,
  buildMessageReminderH1Santri,
  buildMessageReminderH1Penguji,
} from "@/lib/whatsapp-queue";
import { generateMagicToken } from "@/lib/utils/magic-link";
import { getLeastLoadedExaminerFromPool } from "@/lib/utils/assignment";

function getExamCategory(title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("quran") || t.includes("qur'an")) return "QURAN";
  if (t.includes("calsan") || t.includes("santri")) return "W_SANTRI";
  if (t.includes("cawalsan") || t.includes("ortu") || t.includes("orang tua"))
    return "W_ORTU";
  return "OTHER";
}

function sanitizeTitle(title: string): string {
  // Remove anything in parentheses (e.g. examiner names)
  return (title || "").replace(/\s*\(.*?\)\s*/g, "").trim();
}

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
  if (!session || session.role !== "pendaftar") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jadwal = await prisma.jadwalUjian.findMany({
      where: { pendaftar_id: session.id },
      include: {
        exam_session: true,
      },
      orderBy: { created_at: "desc" },
    });

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
    const { exam_session_id } = body;

    if (!exam_session_id) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 },
      );
    }

    // 1. Validate Session First
    const examSession = await prisma.examSession.findUnique({
      where: { id: exam_session_id },
      include: { _count: { select: { bookings: true } } },
    });

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

    // 2. Check for categorical duplication (Quran, Santri, Ortu)
    const existingBookings = await prisma.jadwalUjian.findMany({
      where: { pendaftar_id: session.id },
      include: { exam_session: true },
    });

    const currentCategory = getExamCategory(examSession.title || "");

    // Check if any existing booking has the same category
    const duplicateCategory = existingBookings.find((booking) => {
      const bookedTitle = booking.exam_session?.title || "";
      return getExamCategory(bookedTitle) === currentCategory;
    });

    if (duplicateCategory) {
      const categoryLabel =
        currentCategory === "QURAN"
          ? "Ujian Al-Quran"
          : currentCategory === "W_SANTRI"
            ? "Seleksi Wawancara Calon Santri"
            : currentCategory === "W_ORTU"
              ? "Wawancara Orang Tua"
              : "Ujian ini";

      return NextResponse.json(
        {
          error: `Anda sudah memiliki jadwal untuk ${categoryLabel}.`,
        },
        { status: 400 },
      );
    }

    // Transaction to book
    // 1. Create Jadwal
    // 2. No need to increment counter manually if using _count, but if we have booked_count field we should update it.
    // My schema has `booked_count` int field. I should update it.

    const result = await prisma.$transaction(async (tx) => {
      // Increment count first to lock? Prisma doesn't lock automatically like that easily, but atomic increment works.
      const updatedSession = await tx.examSession.update({
        where: { id: exam_session_id },
        data: { booked_count: { increment: 1 } },
      });

      if (updatedSession.booked_count > updatedSession.quota) {
        throw new Error("Kuota penuh (race condition)");
      }

      // Create Jadwal
      // Need `tahun_ajaran_id`. How to get?
      // Usually Pendaftar is linked to TahunAjaran. I should fetch Pendaftar first.
      const pendaftar = await tx.pendaftar.findUnique({
        where: { id: session.id },
      });
      if (!pendaftar) throw new Error("Data pendaftar tidak ditemukan");

      let pengujiFields: Record<string, string | null> = {};
      const sessionTitle = (examSession.title || "").toLowerCase();
      const currentCategory = getExamCategory(examSession.title || "");

      // IMPLEMENTASI LOAD BALANCING (PEMERATAAN PENGUJI)
      // Cari penguji yang memiliki beban kerja paling sedikit di jam yang sama
      const balancedAssignment = await getLeastLoadedExaminerFromPool(
        examSession.start_time,
        currentCategory,
        pendaftar.tahun_ajaran_id,
      );

      const finalExaminerId =
        balancedAssignment?.examiner_id || examSession.created_by;
      const finalSessionId = balancedAssignment?.session_id || exam_session_id;

      if (finalExaminerId) {
        const interviewer = await tx.profile.findUnique({
          where: { id: finalExaminerId },
          select: { google_meet_link: true, full_name: true, phone: true },
        });

        if (currentCategory === "QURAN") {
          pengujiFields = {
            penguji_quran_id: finalExaminerId,
            google_meet_link: interviewer?.google_meet_link || null,
          };
        } else if (currentCategory === "W_SANTRI") {
          pengujiFields = {
            penguji_santri_id: finalExaminerId,
            google_meet_link: interviewer?.google_meet_link || null,
          };
        } else if (currentCategory === "W_ORTU") {
          pengujiFields = {
            penguji_ortu_id: finalExaminerId,
            google_meet_link: interviewer?.google_meet_link || null,
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
          status_ortu: "scheduled",
          status_online_test: "pending",
          ...pengujiFields,
        },
      });

      // 1.5. Update pendaftar status to 'scheduled'
      await tx.pendaftar.update({
        where: { id: session.id },
        data: { status_pendaftaran: "scheduled" },
      });

      // 2. Initialize NilaiUjian
      await tx.nilaiUjian.create({
        data: {
          pendaftar_id: session.id,
          jadwal_ujian_id: jadwal.id,
        },
      });

      return { jadwal, pengujiFields };
    });

    const { jadwal, pengujiFields } = result;

    // Send WhatsApp via Queue (Layer 2: Non-blocking, through queue)
    const pendaftarInfo = await prisma.pendaftar.findUnique({
      where: { id: session.id },
      select: { nama_lengkap: true, no_hp: true },
    });

    if (pendaftarInfo && pendaftarInfo.no_hp) {
      const startTime = new Date(examSession.start_time);
      const dateStr = startTime.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      });
      const timeStr =
        startTime.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }) + " WIB";
      const lokasi = examSession.location || "Pesantren PPDB";
      const jenisUjian = sanitizeTitle(
        examSession.title || "Seleksi Santri Baru",
      );

      /* 
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
            */

      // 2. Notify Interviewer (Layer 2.1: Delayed notification for staff)
      const finalId =
        pengujiFields.penguji_quran_id ||
        pengujiFields.penguji_santri_id ||
        pengujiFields.penguji_ortu_id ||
        examSession.created_by;
      if (finalId) {
        const interviewer = await prisma.profile.findUnique({
          where: { id: finalId },
          select: { full_name: true, phone: true, google_meet_link: true },
        });

        if (interviewer && interviewer.phone) {
          // Generate Magic Link for this interviewer
          const redirectPathPath = `/dashboard/penguji/input-nilai?search=${encodeURIComponent(pendaftarInfo.nama_lengkap)}`; // Fallback search by name if nomor_pendaftaran is not easily accessible here
          const token = generateMagicToken(
            finalId,
            "penguji",
            interviewer.full_name,
            72, // 3 days expiry for confirmation
            redirectPathPath,
          );
          const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://demo-ppdb.vercel.app"}/api/auth/magic?token=${token}`;

          /* 
                    const intMessage = buildMessageKonfirmasiJadwalInterviewer(
                        interviewer.full_name,
                        pendaftarInfo.nama_lengkap,
                        dateStr,
                        timeStr,
                        interviewer.google_meet_link || lokasi,
                        jenisUjian,
                        magicLink
                    );

                    // Stall interviewer notification by 1 minute to avoid consecutive message bursts (Anti-BAN)
                    const scheduledAt = new Date();
                    scheduledAt.setMinutes(scheduledAt.getMinutes() + 1);

                    enqueueWhatsapp({
                        pendaftarId: session.id,
                        phone: interviewer.phone,
                        jenisNotif: "konfirmasi_jadwal_interviewer",
                        messageContent: intMessage,
                        scheduledAt: scheduledAt,
                    }).catch((err: any) => console.error("Failed to enqueue interviewer notification:", err));
                    */
        }
      }

      // 3. SCHEDULE 4-HOUR REMINDERS (Sent 4 hours before exam)
      try {
        const examStartTime = new Date(examSession.start_time);
        // Calculate individualized scheduled time (StartTime - 4 hours)
        const reminderTime = new Date(
          examStartTime.getTime() - 4 * 60 * 60 * 1000,
        );

        // Schedule if in the future, or send now if already within 16h window
        const now = new Date();
        const finalScheduledAt = reminderTime < now ? now : reminderTime;

        // Get interviewer info early for Google Meet link
        let interviewerGoogleMeetLink = null;
        if (examSession.created_by) {
          const interviewer = await prisma.profile.findUnique({
            where: { id: examSession.created_by },
            select: { google_meet_link: true },
          });
          interviewerGoogleMeetLink = interviewer?.google_meet_link;
        }

        // Build location with Google Meet link if available
        const lokasiWithMeet = interviewerGoogleMeetLink
          ? interviewerGoogleMeetLink.startsWith("http")
            ? interviewerGoogleMeetLink
            : `Online (${interviewerGoogleMeetLink})`
          : lokasi;

        // 3.1. Reminder for Santri
        const remSantriMsg = buildMessageReminderH1Santri(
          pendaftarInfo.nama_lengkap,
          dateStr.split(",")[0] || "", // Removed "Besok"
          dateStr,
          timeStr,
          lokasiWithMeet,
          jenisUjian,
        );

        enqueueWhatsapp({
          pendaftarId: session.id,
          phone: pendaftarInfo.no_hp,
          jenisNotif: "reminder_h1",
          messageContent: remSantriMsg,
          scheduledAt: finalScheduledAt,
        })
          .then(async () => {
            // Update flag safely - using try catch to avoid crash if DB not pushed yet
            try {
              await prisma.jadwalUjian.update({
                where: { id: jadwal.id },
                data: { notif_h1_pendaftar_terkirim: true },
              });
            } catch (e) {
              console.warn(
                "Could not update H1 santri flag (DB sync might be pending)",
              );
            }
          })
          .catch((err) =>
            console.error("Failed to enqueue H1 santri reminder:", err),
          );

        // 3.2. Reminder for Interviewer
        const finalIdRem =
          pengujiFields.penguji_quran_id ||
          pengujiFields.penguji_santri_id ||
          pengujiFields.penguji_ortu_id ||
          examSession.created_by;
        if (finalIdRem) {
          const interviewer = await prisma.profile.findUnique({
            where: { id: finalIdRem },
            select: { full_name: true, phone: true, google_meet_link: true },
          });

          if (interviewer && interviewer.phone) {
            // Generate Magic Link for 4-hour reminder
            const redirectPathH1 = `/dashboard/penguji/input-nilai?search=${encodeURIComponent(pendaftarInfo.nama_lengkap)}`;
            const tokenH1 = generateMagicToken(
              finalIdRem,
              "penguji",
              interviewer.full_name,
              48, // 2 days
              redirectPathH1,
            );
            const magicLinkRem4h = `${process.env.NEXT_PUBLIC_APP_URL || "https://demo-ppdb.vercel.app"}/api/auth/magic?token=${tokenH1}`;

            // Use manual tinyurl if available for this user, otherwise generate automatic
            const { getManualTinyUrl, generateTinyUrl } =
              await import("@/lib/utils/magic-link");
            const manualTinyUrl = getManualTinyUrl(interviewer.full_name);
            const shortUrlRem4h =
              manualTinyUrl || (await generateTinyUrl(magicLinkRem4h));

            const remIntMessage = buildMessageReminderH1Penguji(
              interviewer.full_name,
              pendaftarInfo.nama_lengkap,
              dateStr.split(",")[0] || "",
              dateStr,
              timeStr,
              interviewer.google_meet_link || lokasi,
              jenisUjian,
              shortUrlRem4h,
            );

            const finalScheduledAtInt = new Date(finalScheduledAt);
            finalScheduledAtInt.setMinutes(
              finalScheduledAtInt.getMinutes() + 5,
            );

            enqueueWhatsapp({
              pendaftarId: session.id,
              phone: interviewer.phone,
              jenisNotif: "reminder_h1", // Keep same key for DB compatibility or use a new one
              messageContent: remIntMessage,
              scheduledAt: finalScheduledAtInt,
            })
              .then(async () => {
                // Update flag safely
                try {
                  await prisma.jadwalUjian.update({
                    where: { id: jadwal.id },
                    data: { notif_h1_penguji_terkirim: true },
                  });
                } catch (e) {
                  console.warn(
                    "Could not update H1 interviewer flag (DB sync might be pending)",
                  );
                }
              })
              .catch((err) =>
                console.error("Failed to enqueue 4h penguji reminder:", err),
              );
          }
        }
      } catch (error) {
        console.error("Error scheduling H1 reminders:", error);
      }
    }

    return NextResponse.json({ success: true, data: jadwal });
  } catch (error: any) {
    console.error("POST pendaftar/jadwal error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal booking jadwal" },
      { status: 500 },
    );
  }
}
