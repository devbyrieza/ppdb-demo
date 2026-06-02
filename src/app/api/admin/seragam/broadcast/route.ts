import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { createHmac } from "crypto";
import { enqueueWhatsapp } from "@/lib/whatsapp-queue";

export async function POST(req: Request) {
  try {
    const session = (await getServerSession()) as any;
    if (!session || !["admin_super", "admin"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { pendaftarIds } = await req.json();

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
            no_hp_ibu: true,
          }
        }
      }
    });

    let successCount = 0;
    let failCount = 0;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    for (const pendaftar of pendaftarList) {
      // Determine the phone number to use
      const phone = pendaftar.no_hp || pendaftar.orang_tua?.no_hp_ayah || pendaftar.orang_tua?.no_hp_ibu;
      
      if (!phone || !pendaftar.user_id) {
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

      // Construct WhatsApp message
      const message = `*PENGINGAT PENGISIAN UKURAN SERAGAM*

Assalamualaikum Warahmatullahi Wabarakatuh,
Ayah/Bunda dari Ananda *${pendaftar.nama_lengkap}* (${pendaftar.nomor_pendaftaran}).

Kami menginformasikan bahwa Ananda belum mengisi ukuran seragam.
Mohon segera mengisi ukuran seragam baju dan celana/rok melalui link berikut:

🔗 *Link Pengisian (Otomatis Login):*
${magicLink}

Atau silakan login ke dashboard pendaftaran Anda dan buka menu "Ukuran Seragam".
Pastikan untuk mengisinya secepatnya karena akan segera diproses.

Jazakumullahu khairan.
Panitia PPDB.`;

      try {
        await enqueueWhatsapp({
          phone: phone,
          messageContent: message,
          jenisNotif: "broadcast",
          pendaftarId: pendaftar.id
        });
        successCount++;
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
