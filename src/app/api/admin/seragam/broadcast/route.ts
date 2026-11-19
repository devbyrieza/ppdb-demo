import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { createHmac } from "crypto";
import { enqueueWhatsapp } from "@/lib/whatsapp-queue";
import { isPutriInstitution } from "@/lib/utils/jenjang";

export async function POST(req: Request) {
  try {
    const session = (await getServerSession()) as any;
    if (!session || !["admin_super", "admin"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { pendaftarIds, isSpecial } = await req.json();

    if (!Array.isArray(pendaftarIds) || pendaftarIds.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada pendaftar yang dipilih" },
        { status: 400 }
      );
    }

    const pendaftarList = await prisma.pendaftar.findMany({
      where: {
        id: { in: pendaftarIds }
      },
      select: {
        id: true,
        user_id: true,
        nama_lengkap: true,
        nomor_pendaftaran: true,
        no_hp: true,
        orang_tua: {
          select: {
            no_hp_ayah: true,
            no_hp_ibu: true }
        }
      }
    });

    let successCount = 0;
    let failCount = 0;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pesantren-alimam.com";

    for (const pendaftar of pendaftarList) {
      // Determine the phone number to use
      const phone = pendaftar.no_hp || pendaftar.orang_tua?.no_hp_ayah || pendaftar.orang_tua?.no_hp_ibu;
      
      if (!phone) {
        failCount++;
        continue;
      }

      // Generate internal short link using HMAC hash
      const hash = createHmac("sha256", process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev")
        .update(pendaftar.nomor_pendaftaran)
        .digest("hex")
        .slice(0, 8);
      
      const shortCode = `${pendaftar.nomor_pendaftaran}-${hash}`;
      const magicLink = `${baseUrl}/s/${shortCode}?t=seragam`;
      const directDashboardLink = `${baseUrl}/dashboard/pendaftar/seragam`;

      let message;
      const isPutri = isPutriInstitution();
      const seragamLabel = isPutri ? "ukuran seragam gamis dan perlengkapan santriwati" : "ukuran seragam baju dan celana santri";
      const santriLabel = isPutri ? "santriwati" : "santri";

      if (isSpecial) {
        message = `*PENDATAAN AWAL UKURAN SERAGAM*

Assalamualaikum Warahmatullahi Wabarakatuh,
Abu/Ummu dari Ananda *${pendaftar.nama_lengkap}* (${pendaftar.nomor_pendaftaran}).

Sebagai persiapan awal, kami memohon kesediaan Abu/Ummu untuk mengisikan data ukuran seragam ${santriLabel} meskipun saat ini Ananda belum melakukan pembayaran Daftar Ulang.

Mohon untuk mengisi ${seragamLabel} melalui link dashboard akun Anda berikut:

🔗 *Link Pengisian (Login Otomatis):*
${magicLink}

Atau silakan login mandiri ke:
${directDashboardLink}
(Gunakan Nomor Pendaftaran: ${pendaftar.nomor_pendaftaran} & NIK Ananda)

Jazakumullahu khairan.
Panitia SPMB.`;
      } else {
        message = `*PENGINGAT PENGISIAN UKURAN SERAGAM*

Assalamualaikum Warahmatullahi Wabarakatuh,
Abu/Ummu dari Ananda *${pendaftar.nama_lengkap}* (${pendaftar.nomor_pendaftaran}).

Kami menginformasikan bahwa Ananda belum mengisi ukuran seragam.
Mengingat Ananda telah melakukan pembayaran Daftar Ulang, mohon untuk segera mengisi ${seragamLabel} melalui link dashboard akun Anda berikut:

🔗 *Link Pengisian (Login Otomatis):*
${magicLink}

Atau silakan login ke dashboard akun santri di menu "Ukuran Seragam":
${directDashboardLink}
(Nomor Pendaftaran: ${pendaftar.nomor_pendaftaran})

Pastikan untuk mengisinya secepatnya karena seragam akan segera diproses konveksi.

Jazakumullahu khairan.
Panitia SPMB.`;
      }

      try {
        const result = await enqueueWhatsapp({
          phone: phone,
          messageContent: message,
          jenisNotif: "broadcast",
          pendaftarId: pendaftar.id,
          force: true
        });
        
        if (result.queued) {
          successCount++;
        } else {
          console.log(`Skipped/Failed to queue WA for ${pendaftar.id}: ${result.reason}`);
          failCount++;
        }
      } catch (err) {
        console.error("Failed to enqueue WA for", pendaftar.id, err);
        failCount++;
      }
    }

    return NextResponse.json({
      message: `Berhasil memproses ${successCount} pengingat. Gagal: ${failCount}`,
      success: successCount,
      failed: failCount
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/seragam/broadcast:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
