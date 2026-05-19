import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import { getAdminWhereClause } from "@/lib/utils/admin";
import { generateNomorPendaftaran } from "@/lib/utils/nomor-pendaftaran";

// GET: List semua siswa pindahan
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allowedRoles = ["admin", "admin_super", "admin_berkas", "admin_keuangan"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const tahunAjaranId = searchParams.get("tahun_ajaran_id");
    const jenjang = searchParams.get("jenjang");
    const status = searchParams.get("status");

    const where: any = {
      ...getAdminWhereClause(tahunAjaranId || undefined),
      tipe_pendaftaran: "PINDAHAN",
    };

    if (jenjang) where.jenjang = jenjang;
    if (status && status !== "all") where.status_pendaftaran = status;

    const data = await prisma.pendaftar.findMany({
      where,
      select: {
        id: true,
        nomor_pendaftaran: true,
        nama_lengkap: true,
        jenis_kelamin: true,
        jenjang: true,
        kelas_masuk: true,
        asal_institusi: true,
        nomor_induk_lama: true,
        catatan_pindahan: true,
        tipe_pendaftaran: true,
        no_hp: true,
        email: true,
        nik: true,
        tempat_lahir: true,
        tanggal_lahir: true,
        status_pendaftaran: true,
        created_at: true,
        updated_at: true,
        tahun_ajaran: {
          select: { id: true, nama: true, tahun_mulai: true, tahun_selesai: true },
        },
        orang_tua: {
          select: {
            nama_ayah: true,
            no_hp_ayah: true,
            nama_ibu: true,
            no_hp_ibu: true,
          },
        },
        dokumen: {
          select: { id: true, jenis_dokumen: true, is_verified: true },
        },
        pembayaran: {
          select: {
            id: true,
            jumlah: true,
            status_pembayaran: true,
            jenis_pembayaran: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ data, total: data.length });
  } catch (error) {
    console.error("Error fetching pindahan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Daftarkan siswa pindahan baru (oleh admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allowedRoles = ["admin", "admin_super"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only Admin or Admin Super can register transfer students" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      nama_lengkap,
      nik,
      jenis_kelamin,
      jenjang,
      kelas_masuk,
      asal_institusi,
      nomor_induk_lama,
      catatan_pindahan,
      no_hp,
      email,
      tempat_lahir,
      tanggal_lahir,
      tahun_ajaran_id,
      status_pendaftaran = "submitted",
    } = body;

    // Validasi field wajib
    if (!nama_lengkap || !nik || !jenis_kelamin || !jenjang || !kelas_masuk || !asal_institusi) {
      return NextResponse.json(
        { error: "Field wajib: nama_lengkap, nik, jenis_kelamin, jenjang, kelas_masuk, asal_institusi" },
        { status: 400 }
      );
    }

    // Cek NIK duplikat
    const existingNIK = await prisma.pendaftar.findFirst({
      where: { nik, deleted_at: null },
      select: { id: true, nama_lengkap: true },
    });
    if (existingNIK) {
      return NextResponse.json(
        { error: `NIK sudah terdaftar atas nama: ${existingNIK.nama_lengkap}` },
        { status: 409 }
      );
    }

    // Dapatkan tahun ajaran
    let tahunAjaran;
    if (tahun_ajaran_id) {
      tahunAjaran = await prisma.tahunAjaran.findUnique({
        where: { id: tahun_ajaran_id },
      });
    } else {
      tahunAjaran = await prisma.tahunAjaran.findFirst({
        where: { is_active: true },
      });
    }
    if (!tahunAjaran) {
      return NextResponse.json({ error: "Tahun ajaran aktif tidak ditemukan" }, { status: 400 });
    }

    // Generate nomor pendaftaran otomatis
    const nomor_pendaftaran = await generateNomorPendaftaran(
      jenjang,
      jenis_kelamin,
      tahunAjaran.id
    );

    // Buat record pendaftar pindahan
    const pendaftar = await prisma.pendaftar.create({
      data: {
        nama_lengkap: nama_lengkap.trim(),
        nik: nik.trim(),
        jenis_kelamin,
        jenjang,
        kelas_masuk: Number(kelas_masuk),
        asal_institusi: asal_institusi.trim(),
        nomor_induk_lama: nomor_induk_lama?.trim() || null,
        catatan_pindahan: catatan_pindahan?.trim() || null,
        no_hp: no_hp?.trim() || null,
        email: email?.trim() || null,
        tempat_lahir: tempat_lahir?.trim() || null,
        tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
        tipe_pendaftaran: "PINDAHAN",
        nomor_pendaftaran,
        status_pendaftaran,
        tahun_ajaran_id: tahunAjaran.id,
        asal_sekolah: asal_institusi.trim(),
      },
    });

    logAdminAction({
      action: "REGISTER_PINDAHAN",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: pendaftar.id,
      targetName: pendaftar.nama_lengkap,
      details: { nomor_pendaftaran, jenjang, kelas_masuk, asal_institusi },
    });

    return NextResponse.json({
      success: true,
      data: pendaftar,
      message: `Siswa pindahan berhasil didaftarkan dengan nomor ${nomor_pendaftaran}`,
    });
  } catch (error: any) {
    console.error("Error creating pindahan:", error);
    if (error?.message?.includes("tidak valid") || error?.message?.includes("tidak ditemukan")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: Update status siswa pindahan (termasuk tandai pindah_keluar)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allowedRoles = ["admin", "admin_super", "admin_keuangan"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { pendaftar_id, status_pendaftaran, catatan_pindahan } = body;

    if (!pendaftar_id || !status_pendaftaran) {
      return NextResponse.json(
        { error: "pendaftar_id dan status_pendaftaran wajib diisi" },
        { status: 400 }
      );
    }

    const validStatuses = ["pindah_keluar", "enrolled", "enrolled_full", "submitted", "verified", "payment_verification"];
    if (!validStatuses.includes(status_pendaftaran)) {
      return NextResponse.json(
        { error: `Status tidak valid. Gunakan salah satu: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updateData: any = {
      status_pendaftaran,
      updated_at: new Date(),
    };
    if (catatan_pindahan !== undefined) {
      updateData.catatan_pindahan = catatan_pindahan;
    }

    const updated = await prisma.pendaftar.update({
      where: { id: pendaftar_id },
      data: updateData,
      select: {
        id: true,
        nama_lengkap: true,
        nomor_pendaftaran: true,
        status_pendaftaran: true,
      },
    });

    logAdminAction({
      action: status_pendaftaran === "pindah_keluar" ? "MARK_PINDAH_KELUAR" : "UPDATE_PINDAHAN_STATUS",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: updated.id,
      targetName: updated.nama_lengkap,
      details: { status_pendaftaran, nomor_pendaftaran: updated.nomor_pendaftaran },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message:
        status_pendaftaran === "pindah_keluar"
          ? `${updated.nama_lengkap} berhasil ditandai sebagai Pindah Keluar`
          : `Status ${updated.nama_lengkap} berhasil diperbarui`,
    });
  } catch (error) {
    console.error("Error updating pindahan status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
