import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { delCache } from "@/lib/redis";
import { saveFileLocal } from "@/lib/storage/local";

export const runtime = "nodejs";

async function checkSuperAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    return session.role === "admin_super" || session.role === "admin" ? session : null;
  } catch {
    return null;
  }
}

/**
 * POST — upload surat pengumuman resmi manual (PDF / JPG / PNG).
 * FormData: pendaftar_id, nomor_surat?, kelas_diterima?, kirim_wa?, file
 * Setelah upload: publish Pengumuman + status pendaftar accepted + kirim WA.
 */
export async function POST(request: Request) {
  const admin = await checkSuperAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized. Hanya Admin Super yang berwenang." },
      { status: 403 }
    );
  }

  try {
    const form = await request.formData();
    const pendaftarId = form.get("pendaftar_id") as string | null;
    const nomorSurat = ((form.get("nomor_surat") as string) || "").trim();
    const kelasDiterima = (form.get("kelas_diterima") as string) || null;
    const kirimWa = form.get("kirim_wa") !== "false";
    const file = form.get("file") as File | null;

    if (!pendaftarId || !file) {
      return NextResponse.json(
        { error: "Pendaftar dan file surat resmi wajib diisi." },
        { status: 400 }
      );
    }

    const okTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!okTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format file harus PDF, JPG, atau PNG." }, { status: 400 });
    }

    const pendaftar = await prisma.pendaftar.findFirst({
      where: { id: pendaftarId, deleted_at: null },
      select: {
        id: true,
        tahun_ajaran_id: true,
        nama_lengkap: true,
        no_hp: true,
        jenjang: true,
      },
    });
    if (!pendaftar) {
      return NextResponse.json({ error: "Pendaftar tidak ditemukan." }, { status: 404 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName =
      `Surat Pengumuman Hasil PSB ${pendaftar.nama_lengkap}.${file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg"}`.replace(
        /[^a-zA-Z0-9 .-]/g,
        "-"
      );
    const suratPath = await saveFileLocal(bytes, "pengumuman", pendaftarId, safeName);

    const pengumuman = await prisma.$transaction(async (tx) => {
      const p = await tx.pengumuman.upsert({
        where: { pendaftar_id: pendaftarId },
        update: {
          status_kelulusan: "Diterima",
          surat_pengumuman_path: suratPath,
          is_published: true,
          published_at: new Date(),
          published_by: admin.id,
          updated_at: new Date(),
        },
        create: {
          pendaftar_id: pendaftarId,
          tahun_ajaran_id: pendaftar.tahun_ajaran_id,
          status_kelulusan: "Diterima",
          surat_pengumuman_path: suratPath,
          is_published: true,
          published_at: new Date(),
          published_by: admin.id,
        },
      });
      await tx.pendaftar.update({
        where: { id: pendaftarId },
        data: { status_pendaftaran: "accepted" },
      });
      return p;
    });

    await delCache(`pengumuman_${pendaftarId}`);

    logAdminAction({
      action: "UPLOAD_SURAT_PENGUMUMAN_MANUAL" as any,
      adminId: admin.id,
      adminName: admin.name || admin.username || "admin_super",
      targetId: pendaftarId,
      targetName: pendaftar.nama_lengkap,
      details: { nomor_surat: nomorSurat, surat_path: suratPath },
    });

    let waSent = false;
    if (kirimWa && pendaftar.no_hp) {
      try {
        const { sendDocumentMessage } = await import("@/lib/wablas");
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pesantren-alandalus.com";
        const { signFilePath } = await import("@/lib/storage/file-signing");
        const docResult = await sendDocumentMessage({
          phone: pendaftar.no_hp,
          message:
            "Alhamdulillah, ananda ${pendaftar.nama_lengkap} DITERIMA sebagai Santri Baru TA 2027/2028. Terlampir Surat Pengumuman Hasil Resmi. Jazakumullohu khoiron katsiron.",
          documentUrl: `${appUrl}/api/files/${suratPath}?k=${signFilePath(suratPath)}`,
        });
        waSent = !!docResult.status;
        await prisma.pengumuman.update({
          where: { id: pengumuman.id },
          data: { wa_blast_sent: waSent, wa_blast_sent_at: waSent ? new Date() : null },
        });
      } catch (waErr) {
        console.error("[SuratPengumuman] Kirim WA gagal (surat tetap tersimpan):", waErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: { pengumuman_id: pengumuman.id, surat_path: suratPath, wa_sent: waSent },
    });
  } catch (error: any) {
    console.error("POST /api/admin/surat-pengumuman/upload error:", error);
    return NextResponse.json({ error: error.message || "Gagal upload surat" }, { status: 500 });
  }
}
