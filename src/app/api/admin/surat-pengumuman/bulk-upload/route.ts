import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BRANDING } from "@/config/branding";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { delCache, invalidateAdminPendaftarCache } from "@/lib/redis";
import { saveFileLocal } from "@/lib/storage/local";
import { signFilePath } from "@/lib/storage/file-signing";
import { enqueueWhatsapp } from "@/lib/whatsapp-queue";
import { sendDocumentMessage } from "@/lib/wablas";

export const runtime = "nodejs";

async function checkAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    const allowed = ["admin_super", "admin", "superadmin", "head_of_it"];
    return allowed.includes(session.role) ? session : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Khusus Admin." }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const mappingsRaw = form.get("mappings") as string | null;
    const kirimWa = form.get("kirim_wa") !== "false";

    if (!mappingsRaw) {
      return NextResponse.json({ error: "Data mapping santri dan file tidak ada." }, { status: 400 });
    }

    const mappings = JSON.parse(mappingsRaw) as {
      pendaftarId: string;
      filename: string;
      nomorSurat?: string;
      kelasDiterima?: string;
    }[];

    if (!Array.isArray(mappings) || mappings.length === 0) {
      return NextResponse.json({ error: "Daftar mapping kosong." }, { status: 400 });
    }

    const fileEntries = form.getAll("files") as File[];
    const fileMap = new Map<string, File>();
    for (const f of fileEntries) {
      if (f && f.name) {
        fileMap.set(f.name, f);
      }
    }

    const b = BRANDING as any;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || b.websiteUrl || "https://pesantren-alandalus.com";
    const results: any[] = [];

    for (const m of mappings) {
      const pendaftar = await prisma.pendaftar.findUnique({
        where: { id: m.pendaftarId },
        include: { tahun_ajaran: true },
      });

      if (!pendaftar) {
        results.push({ pendaftarId: m.pendaftarId, success: false, error: "Pendaftar tidak ditemukan" });
        continue;
      }

      const file = fileMap.get(m.filename);
      if (!file) {
        results.push({
          pendaftarId: m.pendaftarId,
          nama: pendaftar.nama_lengkap,
          success: false,
          error: `File ${m.filename} tidak ditemukan dalam unggahan`,
        });
        continue;
      }

      const assignedNomorSurat = m.nomorSurat?.trim() || null;
      const targetKelas = m.kelasDiterima || pendaftar.jenjang || "Reguler";

      // Save file to local storage
      const bytes = Buffer.from(await file.arrayBuffer());
      const safeName = `Surat Pengumuman Hasil PSB ${pendaftar.nama_lengkap.trim().replace(/[^a-zA-Z0-9 .-]/g, "-")}.pdf`;
      const suratPath = await saveFileLocal(bytes, "pengumuman", pendaftar.id, safeName);

      // Upsert pengumuman + update status
      await prisma.$transaction(async (tx) => {
        await tx.pengumuman.upsert({
          where: { pendaftar_id: pendaftar.id },
          update: {
            status_kelulusan: "Diterima",
            surat_pengumuman_path: suratPath,
            is_published: true,
            published_at: new Date(),
            published_by: admin.id,
            updated_at: new Date(),
          },
          create: {
            pendaftar_id: pendaftar.id,
            tahun_ajaran_id: pendaftar.tahun_ajaran_id,
            status_kelulusan: "Diterima",
            surat_pengumuman_path: suratPath,
            is_published: true,
            published_at: new Date(),
            published_by: admin.id,
          },
        });

        await tx.pendaftar.update({
          where: { id: pendaftar.id },
          data: { status_pendaftaran: "accepted" },
        });
      });

      await delCache(`pengumuman_${pendaftar.id}`);

      // WhatsApp delivery
      let waSent = false;
      if (kirimWa && pendaftar.no_hp) {
        try {
          const token = signFilePath(suratPath);
          const suratDownloadUrl = `${appUrl}/api/files/${encodeURI(suratPath)}?k=${token}`;

          const santriWord = b.santri || "Santri";
          const shalehWord = b.shaleh || "sholeh";

          const messageContent = `📋 *PENGUMUMAN HASIL KELULUSAN SELEKSI PSB*
*${(b.schoolName || "PESANTREN AL-ANDALUS").toUpperCase()}*

Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bapak/Ibu Orang Tua / Wali dari:
👤 *${pendaftar.nama_lengkap}*
No. Pendaftaran: *${pendaftar.nomor_pendaftaran}*

Alhamdulillah, ananda dinyatakan *DITERIMA* sebagai ${santriWord} Baru di ${b.schoolName || "Pesantren Al-Andalus"}:
🎓 *Jenjang / Kelas:* ${targetKelas}
${assignedNomorSurat ? `📜 *No. Surat Keputusan:* ${assignedNomorSurat}\n` : ""}
📄 *Unduh Surat Keputusan Resmi (PDF):*
${suratDownloadUrl}

📝 *Tahap Selanjutnya (Daftar Ulang):*
Silakan masuk ke portal pendaftar untuk melihat rincian pengumuman dan panduan daftar ulang:
🔗 ${appUrl}/login

Semoga Allah ﷻ memberkahi ananda dan menjadikannya ${santriWord.toLowerCase()} yang ${shalehWord}, berilmu, dan berakhlak mulia. Aamiin.

Jazakumullahu khairan katsiran.
Wassalamu'alaikum Warahmatullahi Wabarakatuh.
---
*Panitia PSB ${b.schoolName || "Pesantren Al-Andalus"}*`;

          const enqResult = await enqueueWhatsapp({
            pendaftarId: pendaftar.id,
            phone: pendaftar.no_hp,
            jenisNotif: "hasil_seleksi",
            messageContent,
            force: true,
            sendNow: true,
          });

          waSent = !!enqResult.queued;

          try {
            await sendDocumentMessage({
              phone: pendaftar.no_hp,
              message: `📄 Surat Keputusan Kelulusan — ${pendaftar.nama_lengkap}`,
              documentUrl: suratDownloadUrl,
            });
          } catch {}

          await prisma.pengumuman.update({
            where: { pendaftar_id: pendaftar.id },
            data: { wa_blast_sent: waSent, wa_blast_sent_at: waSent ? new Date() : null },
          });
        } catch (waErr) {
          console.error(`[BulkUpload] WA gagal untuk ${pendaftar.nama_lengkap}:`, waErr);
        }
      }

      results.push({
        pendaftarId: pendaftar.id,
        nama: pendaftar.nama_lengkap,
        suratPath,
        waSent,
        success: true,
      });
    }

    await invalidateAdminPendaftarCache();

    logAdminAction({
      action: "BULK_UPLOAD_SURAT_PENGUMUMAN" as any,
      adminId: admin.id,
      adminName: admin.name || admin.username || "admin",
      targetId: "bulk",
      details: { count: results.filter((r) => r.success).length, results },
    });

    return NextResponse.json({
      success: true,
      count: results.filter((r) => r.success).length,
      data: results,
    });
  } catch (error: any) {
    console.error("POST /api/admin/surat-pengumuman/bulk-upload error:", error);
    return NextResponse.json({ error: error.message || "Gagal upload massal" }, { status: 500 });
  }
}
