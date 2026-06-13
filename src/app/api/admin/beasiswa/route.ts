import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import { invalidateAdminPendaftarCache } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allowedRoles = ["admin_super", "admin", "admin_keuangan"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const tahunAjaranId = url.searchParams.get("tahun_ajaran_id");
    
    let whereClause: any = {};
    if (tahunAjaranId) {
      whereClause.tahun_ajaran_id = tahunAjaranId;
    }

    const pengajuan = await prisma.pengajuanBeasiswa.findMany({
      where: whereClause,
      include: {
        pendaftar: {
          select: {
            nama_lengkap: true,
            nomor_pendaftaran: true,
            jenjang: true,
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ success: true, data: pengajuan });
  } catch (error: any) {
    console.error("GET admin beasiswa error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// POST: Untuk Admin yang input pengajuan baru atas nama user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Hanya admin super dan admin keuangan yang boleh input
    const allowedRoles = ["admin_super", "admin_keuangan"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      pendaftar_id,
      jenis_pengajuan, 
      alasan_pengajuan, 
      nominal_kesanggupan, 
      file_sktm_path, 
      file_slip_gaji_path, 
      file_ktp_path, 
      file_prestasi_path 
    } = body;

    if (!pendaftar_id || !jenis_pengajuan || !alasan_pengajuan) {
      return NextResponse.json({ error: "Data pengajuan tidak lengkap" }, { status: 400 });
    }

    // Validasi Dokumen Wajib bagi admin
    if (!file_sktm_path || !file_slip_gaji_path || !file_ktp_path) {
      return NextResponse.json({ error: "SKTM, Slip Gaji/Surat Penghasilan, dan KTP wajib diunggah" }, { status: 400 });
    }

    if (jenis_pengajuan === "BEASISWA_PRESTASI" && !file_prestasi_path) {
      return NextResponse.json({ error: "Bukti Hafalan / Peringkat wajib diunggah untuk Beasiswa Prestasi" }, { status: 400 });
    }

    const pendaftar = await prisma.pendaftar.findUnique({ where: { id: pendaftar_id } });
    if (!pendaftar) return NextResponse.json({ error: "Pendaftar tidak ditemukan" }, { status: 404 });

    const pengajuan = await prisma.pengajuanBeasiswa.upsert({
      where: { pendaftar_id },
      update: {
        jenis_pengajuan,
        alasan_pengajuan,
        nominal_kesanggupan: nominal_kesanggupan ? Number(nominal_kesanggupan) : null,
        file_sktm_path,
        file_slip_gaji_path,
        file_ktp_path,
        file_prestasi_path,
        diajukan_oleh_id: session.id,
        diajukan_oleh_role: "ADMIN",
        status: "PENDING", // Status PENDING untuk disetujui
        updated_at: new Date()
      },
      create: {
        pendaftar_id,
        tahun_ajaran_id: pendaftar.tahun_ajaran_id,
        jenis_pengajuan,
        alasan_pengajuan,
        nominal_kesanggupan: nominal_kesanggupan ? Number(nominal_kesanggupan) : null,
        file_sktm_path,
        file_slip_gaji_path,
        file_ktp_path,
        file_prestasi_path,
        diajukan_oleh_id: session.id,
        diajukan_oleh_role: "ADMIN",
        status: "PENDING"
      }
    });

    logAdminAction({
      action: "INPUT_BEASISWA" as any,
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: pendaftar_id,
      targetName: pendaftar.nama_lengkap || "Unknown",
      details: { jenis_pengajuan },
    });

    return NextResponse.json({ success: true, message: "Pengajuan berhasil dikirim", data: pengajuan });
  } catch (error: any) {
    console.error("POST admin beasiswa error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allowedRoles = ["admin_super", "admin_keuangan", "pewawancara_cawalsan"];
    const baseRole = session.role || "";
    const isAllowed = allowedRoles.includes(baseRole) || baseRole.includes("cawalsan");
    
    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { pengajuan_id, pendaftar_id, status, nominal_potongan, catatan_keputusan } = body;

    if (!status) {
      return NextResponse.json({ error: "Status diperlukan" }, { status: 400 });
    }

    let pengajuan;
    if (pengajuan_id) {
      pengajuan = await prisma.pengajuanBeasiswa.findUnique({ where: { id: pengajuan_id }});
    } else if (pendaftar_id) {
      pengajuan = await prisma.pengajuanBeasiswa.findUnique({ where: { pendaftar_id }});
    }

    const pId = pendaftar_id || pengajuan?.pendaftar_id;
    if (!pId) return NextResponse.json({ error: "Pendaftar ID atau Pengajuan ID diperlukan" }, { status: 400 });

    if (!pengajuan && status === "DISETUJUI") {
       return NextResponse.json({ error: "Pengajuan beasiswa tidak ditemukan. Pastikan sudah mengisi Form Input Pengajuan." }, { status: 400 });
    }

    const now = new Date();
    
    if (pengajuan) {
      pengajuan = await prisma.pengajuanBeasiswa.update({
        where: { id: pengajuan.id },
        data: {
          status,
          nominal_potongan: nominal_potongan != null ? Number(nominal_potongan) : null,
          catatan_keputusan,
          disetujui_oleh: status === "DISETUJUI" ? session.id : null,
          disetujui_pada: status === "DISETUJUI" ? now : null,
          updated_at: now
        }
      });
    }

    // Sync to Pendaftar data_lengkap.keringanan_daftar_ulang for compatibility with Billing system
    const pendaftar = await prisma.pendaftar.findUnique({ where: { id: pId } });
    if (pendaftar) {
      let dataLengkap = pendaftar.data_lengkap as any || {};
      if (typeof dataLengkap === "string") {
        try { dataLengkap = JSON.parse(dataLengkap); } catch(e) { dataLengkap = {}; }
      }

      if (status === "DISETUJUI" && nominal_potongan != null) {
        dataLengkap.keringanan_daftar_ulang = {
          jenis: pengajuan?.jenis_pengajuan || "KERINGANAN_BIAYA",
          nominal_potongan: Number(nominal_potongan)
        };
      } else if (status === "DITOLAK") {
        delete dataLengkap.keringanan_daftar_ulang;
      }

      await prisma.pendaftar.update({
        where: { id: pId },
        data: { data_lengkap: dataLengkap }
      });
      
      try {
        logAdminAction({
          action: "UPDATE_KERINGANAN" as any,
          adminId: session.id || "system",
          adminName: session.full_name || session.name || "Admin",
          targetId: pId,
          targetName: pendaftar.nama_lengkap || "Unknown",
          details: { status, nominal_potongan, catatan_keputusan },
        });
        await invalidateAdminPendaftarCache();
      } catch (e) {}
    }

    return NextResponse.json({ success: true, message: "Pengajuan berhasil diupdate", data: pengajuan });
  } catch (error: any) {
    console.error("PATCH admin beasiswa error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
