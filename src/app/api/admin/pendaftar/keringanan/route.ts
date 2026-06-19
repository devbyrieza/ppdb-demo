import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { invalidateAdminPendaftarCache } from "@/lib/redis";
import { logAdminAction } from "@/lib/audit";

/**
 * POST /api/admin/pendaftar/keringanan
 *
 * Body (format baru — no migration needed, saved as JSON in data_lengkap):
 * {
 *   pendaftar_id: string,
 *   jenis_bantuan: "BEASISWA" | "KERINGANAN" | null,  // null = hapus
 *   cakupan: "UANG_PANGKAL" | "SPP" | "KEDUANYA",
 *   potongan_uang_pangkal: number,   // 0-7500000
 *   potongan_spp: number,            // 0-1000000
 *   catatan: string | null
 * }
 *
 * Backward compat: juga menerima { jenis, nominal_potongan } (format lama)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["admin_super", "admin", "admin_keuangan"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      pendaftar_id,
      // Format baru
      jenis_bantuan,
      cakupan,
      potongan_uang_pangkal,
      potongan_spp,
      catatan,
      // Format lama (backward compat)
      jenis,
      nominal_potongan,
      kesanggupan_bayar,
    } = body;

    if (!pendaftar_id) {
      return NextResponse.json({ error: "Pendaftar ID is required" }, { status: 400 });
    }

    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftar_id },
    });

    if (!pendaftar) {
      return NextResponse.json({ error: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    let dataLengkap = (pendaftar.data_lengkap as any) || {};
    if (typeof dataLengkap === "string") {
      try {
        dataLengkap = JSON.parse(dataLengkap);
      } catch (e) {
        dataLengkap = {};
      }
    }

    // --- Deteksi format ---
    const isNewFormat = jenis_bantuan !== undefined || (jenis_bantuan === null && pendaftar_id);
    const isFormatLama = jenis !== undefined && nominal_potongan !== undefined;

    if (isNewFormat && jenis_bantuan !== null) {
      // FORMAT BARU
      const pUP = Number(potongan_uang_pangkal ?? 0);
      const pSPP = Number(potongan_spp ?? 0);

      dataLengkap.keringanan_daftar_ulang = {
        jenis_bantuan,           // "BEASISWA" | "KERINGANAN"
        cakupan: cakupan || "UANG_PANGKAL",
        potongan_uang_pangkal: pUP,
        potongan_spp: pSPP,
        // Backward compat: nominal_potongan = total untuk sistem lama
        nominal_potongan: pUP + pSPP,
        catatan: catatan || null,
        // Jenis lama untuk kompatibilitas
        jenis: jenis_bantuan === "BEASISWA" ? "BEASISWA_FULL" : "KERINGANAN_BIAYA",
      };

      await prisma.pengajuanBeasiswa.upsert({
        where: { pendaftar_id },
        update: {
          jenis_pengajuan: jenis_bantuan === "BEASISWA" ? "BEASISWA_PRESTASI" : "KERINGANAN_BIAYA",
          status: "DISETUJUI",
          nominal_potongan: pUP + pSPP,
          catatan_keputusan: catatan || null,
          updated_at: new Date()
        },
        create: {
          pendaftar_id,
          tahun_ajaran_id: pendaftar.tahun_ajaran_id,
          jenis_pengajuan: jenis_bantuan === "BEASISWA" ? "BEASISWA_PRESTASI" : "KERINGANAN_BIAYA",
          status: "DISETUJUI",
          nominal_potongan: pUP + pSPP,
          catatan_keputusan: catatan || null
        }
      });
    } else if (isNewFormat && jenis_bantuan === null) {
      // HAPUS bantuan biaya
      delete dataLengkap.keringanan_daftar_ulang;
      await prisma.pengajuanBeasiswa.deleteMany({
        where: { pendaftar_id }
      });
    } else if (isFormatLama) {
      // FORMAT LAMA (backward compat)
      if (jenis && nominal_potongan !== undefined) {
        dataLengkap.keringanan_daftar_ulang = {
          jenis,
          nominal_potongan: Number(nominal_potongan),
          potongan_uang_pangkal: Number(nominal_potongan),
          potongan_spp: 0,
          cakupan: "UANG_PANGKAL",
          jenis_bantuan: "KERINGANAN",
          ...(kesanggupan_bayar !== undefined && kesanggupan_bayar > 0
            ? { kesanggupan_bayar: Number(kesanggupan_bayar) }
            : {}),
        };

        await prisma.pengajuanBeasiswa.upsert({
          where: { pendaftar_id },
          update: {
            jenis_pengajuan: jenis,
            status: "DISETUJUI",
            nominal_potongan: Number(nominal_potongan),
            updated_at: new Date()
          },
          create: {
            pendaftar_id,
            tahun_ajaran_id: pendaftar.tahun_ajaran_id,
            jenis_pengajuan: jenis,
            status: "DISETUJUI",
            nominal_potongan: Number(nominal_potongan)
          }
        });
      } else {
        delete dataLengkap.keringanan_daftar_ulang;
        await prisma.pengajuanBeasiswa.deleteMany({
          where: { pendaftar_id }
        });
      }
    }

    await prisma.pendaftar.update({
      where: { id: pendaftar_id },
      data: { data_lengkap: dataLengkap },
    });

    logAdminAction({
      action: "UPDATE_KERINGANAN" as any,
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: pendaftar_id,
      targetName: pendaftar.nama_lengkap || "Unknown",
      details: isNewFormat
        ? { jenis_bantuan, cakupan, potongan_uang_pangkal, potongan_spp }
        : { jenis, nominal_potongan },
    });

    await invalidateAdminPendaftarCache();

    return NextResponse.json({
      success: true,
      message: "Bantuan biaya berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Update keringanan error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
