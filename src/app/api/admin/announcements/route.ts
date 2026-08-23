import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { enqueueWhatsapp, buildMessageHasilTes } from "@/lib/whatsapp-queue";

async function checkSuperAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");

  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value);
    // Only Admin Super can publish announcements
    if (session.role === "admin_super") {
      return session;
    }
  } catch {
    // ignore
  }
  return null;
}

// POST: Create or Update Announcement
export async function POST(request: Request) {
  const admin = await checkSuperAdmin();
  if (!admin) {
    return NextResponse.json(
      {
        error: "Unauthorized. Hanya Admin Super yang bisa membuat pengumuman." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { pendaftar_id, status_kelulusan, catatan, surat_keputusan_url } =
      body;

    if (!pendaftar_id || !status_kelulusan) {
      return NextResponse.json(
        { error: "Data pendaftar_id dan status_kelulusan wajib diisi." },
        { status: 400 },
      );
    }

    // 1. Get Pendaftar to find Tahun Ajaran and details for notification
    const pendaftar = await prisma.pendaftar.findFirst({
      where: {
        id: pendaftar_id,
        deleted_at: null },
      select: {
        id: true,
        tahun_ajaran_id: true,
        nama_lengkap: true,
        no_hp: true,
        jenjang: true } });

    if (!pendaftar) {
      return NextResponse.json(
        { error: "Pendaftar tidak ditemukan." },
        { status: 404 },
      );
    }

    // 2. Upsert Pengumuman
    const pengumuman = await prisma.pengumuman.upsert({
      where: { pendaftar_id: pendaftar_id },
      update: {
        status_kelulusan,
        catatan,
        // @ts-ignore: Prisma types lag
        surat_keputusan_url,
        published_by: admin.id,
        updated_at: new Date(),
        is_published: true,
        published_at: new Date() },
      create: {
        pendaftar_id,
        tahun_ajaran_id: pendaftar.tahun_ajaran_id,
        status_kelulusan,
        catatan,
        // @ts-ignore: Prisma types lag
        surat_keputusan_url,
        published_by: admin.id,
        is_published: true,
        published_at: new Date() } });

    // 3. Update Pendaftar Status based on Status Kelulusan
    let newStatus = "announced";
    if (status_kelulusan === "Lulus") newStatus = "accepted";
    else if ((status_kelulusan === "Tidak Lulus" || status_kelulusan === "Ditolak")) newStatus = "rejected";
    // "Cadangan" remains "announced" or use a specific status if available.

    await prisma.pendaftar.update({
      where: { id: pendaftar_id },
      data: { status_pendaftaran: newStatus } });

    // 4. Send Notification via Queue
    if (pendaftar.no_hp) {
      try {
        // Build message using queue builder
        const message = buildMessageHasilTes(pendaftar.nama_lengkap);

        await enqueueWhatsapp({
          pendaftarId: pendaftar.id,
          phone: pendaftar.no_hp,
          jenisNotif: "hasil_tes",
          messageContent: message,
          force: true, // Always send even if previous hasil_tes existed (re-publish)
        });

        // Mark as sent/queued
        await prisma.pengumuman.update({
          where: { id: pengumuman.id },
          // @ts-ignore: Prisma types lag
          data: { wa_blast_sent: true, wa_blast_sent_at: new Date() } });
      } catch (e) {
        console.error("Failed to enqueue announcement notification", e);
      }
    }

    return NextResponse.json({ success: true, data: pengumuman });
  } catch (error: any) {
    console.error("POST /api/admin/announcements error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan pengumuman" },
      { status: 500 },
    );
  }
}
