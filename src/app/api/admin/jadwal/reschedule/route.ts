import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { enqueueWhatsapp } from "@/lib/whatsapp-queue";

// GET all pending reschedule requests
export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session || !["admin", "admin_super"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all JadwalUjian where catatan contains RESCHEDULE_REQUEST and is pending
    const jadwals = await prisma.jadwalUjian.findMany({
      where: {
        catatan: {
          contains: '"RESCHEDULE_REQUEST"'
        }
      },
      include: {
        pendaftar: {
          select: { nama_lengkap: true, no_hp: true, nomor_pendaftaran: true }
        }
      },
      orderBy: { created_at: "desc" }
    });

    const pendingRequests = jadwals.filter(j => {
      try {
        if (!j.catatan) return false;
        const parsed = JSON.parse(j.catatan);
        return parsed.type === "RESCHEDULE_REQUEST" && parsed.status === "pending";
      } catch (e) {
        return false;
      }
    });

    return NextResponse.json({ success: true, data: pendingRequests });
  } catch (error: any) {
    console.error("GET admin/jadwal/reschedule error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST approve/reject request
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || !["admin", "admin_super"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { jadwal_id, action } = data; // action = "approve" | "reject"

    if (!jadwal_id || !action) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const jadwal = await prisma.jadwalUjian.findUnique({
      where: { id: jadwal_id },
      include: {
        pendaftar: true
      }
    });

    if (!jadwal || !jadwal.catatan) {
      return NextResponse.json({ error: "Permintaan tidak ditemukan" }, { status: 404 });
    }

    let parsedNote;
    try {
      parsedNote = JSON.parse(jadwal.catatan);
      if (parsedNote.type !== "RESCHEDULE_REQUEST" || parsedNote.status !== "pending") {
        throw new Error("Invalid state");
      }
    } catch (e) {
      return NextResponse.json({ error: "Data permohonan tidak valid" }, { status: 400 });
    }

    if (action === "approve") {
      // Apply the new schedule
      const { proposed_date, proposed_start, proposed_end, penguji_id } = parsedNote;

      const newDate = new Date(`${proposed_date}T00:00:00Z`);
      const startTime = new Date(`${proposed_date}T${proposed_start}:00+07:00`);
      const endTime = new Date(`${proposed_date}T${proposed_end}:00+07:00`);

      parsedNote.status = "approved";
      parsedNote.approved_at = new Date().toISOString();

      // We preserve original catatan if it existed
      const nextCatatan = parsedNote.original_catatan || null;

      await prisma.jadwalUjian.update({
        where: { id: jadwal_id },
        data: {
          tanggal_ujian: newDate,
          waktu_mulai_santri: startTime,
          waktu_selesai_santri: endTime,
          waktu_mulai_ortu: startTime,
          waktu_selesai_ortu: endTime,
          // Clear the request so it's clean, or leave it as history?
          // It's better to clear the JSON to keep the DB clean, and restore original_catatan.
          catatan: nextCatatan
        }
      });

      // Optionally notify Penguji & Santri
      const penguji = await prisma.profile.findUnique({ where: { id: penguji_id } });
      if (penguji && penguji.phone) {
        const msg = `*PEMBERITAHUAN*\nAssalamu'alaikum,\n\nPengajuan pindah jadwal untuk santri *${jadwal.pendaftar.nama_lengkap}* telah *DISETUJUI* oleh Admin.\n\nJadwal baru:\nTanggal: ${proposed_date}\nJam: ${proposed_start} - ${proposed_end} WIB.`;
        enqueueWhatsapp({
          pendaftarId: jadwal.pendaftar_id,
          phone: penguji.phone,
          jenisNotif: "reschedule_approved_penguji",
          messageContent: msg,
          sendNow: true
        }).catch(console.error);
      }

      if (jadwal.pendaftar.no_hp) {
        const msgS = `*PERUBAHAN JADWAL WAWANCARA*\nAssalamu'alaikum,\n\nMohon maaf, jadwal wawancara untuk ananda *${jadwal.pendaftar.nama_lengkap}* telah diubah atas permintaan Ustadz/Penguji.\n\nJadwal baru:\nTanggal: ${proposed_date}\nJam: ${proposed_start} - ${proposed_end} WIB.\n\nSilakan cek dashboard pendaftar untuk informasi lengkap.`;
        enqueueWhatsapp({
          pendaftarId: jadwal.pendaftar_id,
          phone: jadwal.pendaftar.no_hp,
          jenisNotif: "reschedule_approved_santri",
          messageContent: msgS,
          sendNow: true
        }).catch(console.error);
      }

      return NextResponse.json({ success: true, message: "Perubahan jadwal disetujui dan diterapkan." });
    } else if (action === "reject") {
      const nextCatatan = parsedNote.original_catatan || null;

      await prisma.jadwalUjian.update({
        where: { id: jadwal_id },
        data: {
          catatan: nextCatatan
        }
      });

      const penguji = await prisma.profile.findUnique({ where: { id: parsedNote.penguji_id } });
      if (penguji && penguji.phone) {
        const msg = `*PEMBERITAHUAN*\nAssalamu'alaikum,\n\nMohon maaf, pengajuan pindah jadwal untuk santri *${jadwal.pendaftar.nama_lengkap}* *DITOLAK* oleh Admin. Jadwal akan tetap sesuai dengan waktu semula.\n\nJazakumullah khairan.`;
        enqueueWhatsapp({
          pendaftarId: jadwal.pendaftar_id,
          phone: penguji.phone,
          jenisNotif: "reschedule_rejected_penguji",
          messageContent: msg,
          sendNow: true
        }).catch(console.error);
      }

      return NextResponse.json({ success: true, message: "Pengajuan ditolak." });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (error: any) {
    console.error("POST admin/jadwal/reschedule error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
