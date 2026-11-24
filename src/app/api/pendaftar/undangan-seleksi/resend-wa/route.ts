import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { enqueueWhatsapp } from "@/lib/whatsapp-queue";

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

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json(
        { error: "Sesi telah berakhir. Silakan login kembali." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jadwal_id, target_phone } = body;

    if (!jadwal_id) {
      return NextResponse.json(
        { error: "ID Jadwal seleksi wajib disertakan." },
        { status: 400 }
      );
    }

    // Identifikasi pendaftar berdasarkan sesi
    const pendaftar = await prisma.pendaftar.findFirst({
      where: {
        OR: [
          { profile_id: session.id },
          { id: session.id }
        ]
      },
      include: {
        orang_tua: true,
      }
    });

    if (!pendaftar) {
      return NextResponse.json(
        { error: "Data pendaftar tidak ditemukan." },
        { status: 404 }
      );
    }

    // Ambil detail jadwal dan pastikan milik pendaftar ini
    const jadwal = await prisma.jadwalUjian.findFirst({
      where: {
        id: jadwal_id,
        pendaftar_id: pendaftar.id,
      },
      include: {
        exam_session: {
          include: {
            creator: {
              select: {
                id: true,
                full_name: true,
                google_meet_link: true,
              }
            }
          }
        },
        penguji_santri: { select: { id: true, full_name: true, google_meet_link: true } },
        penguji_ortu: { select: { id: true, full_name: true, google_meet_link: true } },
        penguji_quran: { select: { id: true, full_name: true, google_meet_link: true } },
        penguji_arab: { select: { id: true, full_name: true, google_meet_link: true } },
        penguji_hafalan: { select: { id: true, full_name: true, google_meet_link: true } },
      }
    });

    if (!jadwal) {
      return NextResponse.json(
        { error: "Jadwal seleksi tidak ditemukan atau tidak sesuai hak akses." },
        { status: 404 }
      );
    }

    // Tentukan nomor tujuan WhatsApp
    let rawPhone = target_phone || pendaftar.no_hp;
    if (!rawPhone) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tujuan wajib diisi." },
        { status: 400 }
      );
    }

    // Sanitasi nomor telepon ke format E.164 (628xxx)
    let cleaned = rawPhone.replace(/[\s\-\(\)\+]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    } else if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned;
    }

    if (!/^628\d{8,13}$/.test(cleaned)) {
      return NextResponse.json(
        { error: "Format nomor WhatsApp tidak valid. Masukkan nomor yang benar (contoh: 081234567890)." },
        { status: 400 }
      );
    }

    // Deteksi kategori sesi
    const rawTitle = jadwal.exam_session?.title || "Sesi Ujian Seleksi";
    const t = rawTitle.toLowerCase();
    let cat = "OTHER";
    if (t.includes("quran") || t.includes("qur'an") || t.includes("bacaan")) cat = "QURAN";
    else if (t.includes("ortu") || t.includes("cawalsan") || t.includes("orang tua") || t.includes("orangtua") || t.includes("wali")) cat = "W_ORTU";
    else if (t.includes("calsan") || t.includes("santri")) cat = "W_SANTRI";
    else if (t.includes("arab") || t.includes("lisan")) cat = "LISAN_ARAB";
    else if (t.includes("hafalan")) cat = "HAFALAN";

    // Cari link meet terbaik
    const meetLink =
      (cat === "QURAN" && (jadwal.penguji_quran?.google_meet_link || (jadwal as any).zoom_link_quran)) ||
      (cat === "W_ORTU" && (jadwal.penguji_ortu?.google_meet_link || (jadwal as any).zoom_link_ortu)) ||
      (cat === "W_SANTRI" && (jadwal.penguji_santri?.google_meet_link || (jadwal as any).zoom_link_santri)) ||
      (cat === "LISAN_ARAB" && (jadwal.penguji_arab?.google_meet_link || (jadwal as any).zoom_link_arab)) ||
      (cat === "HAFALAN" && (jadwal.penguji_hafalan?.google_meet_link || (jadwal as any).zoom_link_hafalan)) ||
      jadwal.google_meet_link ||
      jadwal.online_test_link ||
      (jadwal.exam_session?.location?.startsWith("http") ? jadwal.exam_session.location : null) ||
      jadwal.exam_session?.creator?.google_meet_link ||
      null;

    // Format tanggal dan jam WIB
    const startTimeObj = new Date(jadwal.exam_session?.start_time || jadwal.tanggal_ujian);
    const dateStr = startTimeObj.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta"
    });
    const timeStr = startTimeObj.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta"
    }).replace(".", ":");

    let messageContent = "";
    if (meetLink) {
      messageContent =
        `*INFORMASI TAUTAN SELEKSI (GOOGLE MEET)*\n\n` +
        `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
        `Berikut adalah salinan tautan Google Meet untuk seleksi calon santri:\n\n` +
        `👤 *Nama Santri:* ${pendaftar.nama_lengkap}\n` +
        `📝 *Sesi Seleksi:* ${rawTitle}\n` +
        `📅 *Hari/Tanggal:* ${dateStr}\n` +
        `⏰ *Waktu:* ${timeStr} WIB\n\n` +
        `🔗 *Tautan Google Meet:*\n${meetLink}\n\n` +
        `_Mohon bersiap di ruangan yang kondusif dan bergabung 5-10 menit sebelum jadwal dimulai._\n\n` +
        `Barakallahu fiikum.\nPanitia PPDB Online`;
    } else {
      messageContent =
        `*PEMBERITAHUAN JADWAL SELEKSI*\n\n` +
        `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
        `Berikut adalah rincian jadwal seleksi calon santri:\n\n` +
        `👤 *Nama Santri:* ${pendaftar.nama_lengkap}\n` +
        `📝 *Sesi Seleksi:* ${rawTitle}\n` +
        `📅 *Hari/Tanggal:* ${dateStr}\n` +
        `⏰ *Waktu:* ${timeStr} WIB\n\n` +
        `ℹ️ _Tautan Google Meet sedang disiapkan oleh panitia penguji dan dapat diakses langsung melalui dashboard pendaftar sebelum sesi dimulai._\n\n` +
        `Barakallahu fiikum.\nPanitia PPDB Online`;
    }

    await enqueueWhatsapp({
      pendaftarId: pendaftar.id,
      phone: cleaned,
      jenisNotif: "resend_meet_link",
      messageContent,
      force: true,
      sendNow: true
    });

    return NextResponse.json({
      success: true,
      message: `Tautan & rincian jadwal berhasil dikirimkan ke WhatsApp +${cleaned}.`,
      target_phone: cleaned
    });
  } catch (error: any) {
    console.error("Error resend-wa route:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
