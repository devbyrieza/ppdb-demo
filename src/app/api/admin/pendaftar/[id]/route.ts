import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check custom role
    const allowedRoles = ["admin", "admin_super", "admin_berkas", "admin_keuangan", "penguji"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("Fetching pendaftar with ID:", params.id);

    // Fetch pendaftar with all related data
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: params.id },
      include: {
        tahun_ajaran: {
          select: {
            id: true,
            nama: true,
            tahun_mulai: true,
            tahun_selesai: true,
            biaya_pendaftaran: true,
          },
        },
        orang_tua: true,
        dokumen: true,
        pembayaran: true,
        jadwal_ujian: true,
        nilai_ujian: true,
        pengumuman: true,
        rapor: true,
        prestasi: true,
        kesehatan: true,
        asrama: true,
      },
    });

    if (!pendaftar) {
      return NextResponse.json(
        { error: "Pendaftar not found" },
        { status: 404 }
      );
    }

    // -- DATA SYNC BACKUP LOGIC --
    // If flattened columns are null, try to fill them from data_lengkap JSON
    // This fixes the issue where data exists in JSON but not in columns
    const dataLengkap: any = pendaftar.data_lengkap || {};
    const santri = dataLengkap.santri || {};
    const ayah = dataLengkap.ayah || {};
    const ibu = dataLengkap.ibu || {};
    const wali = dataLengkap.wali || {};

    const mergedPendaftar = {
      ...pendaftar,
      nilai_ujian: pendaftar.nilai_ujian && pendaftar.nilai_ujian.length > 0 ? pendaftar.nilai_ujian[0] : null,
      // Identity
      tempat_lahir: pendaftar.tempat_lahir || santri.tempat_lahir || null,
      tanggal_lahir: pendaftar.tanggal_lahir || (santri.tanggal_lahir ? new Date(santri.tanggal_lahir) : null),
      golongan_darah: pendaftar.golongan_darah || santri.golongan_darah || null,
      hobi: pendaftar.hobi || santri.hobi || null,
      cita_cita: pendaftar.cita_cita || santri.cita_cita || null,

      // Address - Main
      alamat: pendaftar.alamat || santri.alamat || null,
      rt: pendaftar.rt || santri.rt || null,
      rw: pendaftar.rw || santri.rw || null,
      kelurahan: pendaftar.kelurahan || santri.kelurahan || null,
      kecamatan: pendaftar.kecamatan || santri.kecamatan || null,
      kabupaten: pendaftar.kabupaten || santri.kabupaten || null,
      provinsi: pendaftar.provinsi || santri.provinsi || null,
      kode_pos: pendaftar.kode_pos || santri.kode_pos || null,

      // School
      asal_sekolah: pendaftar.asal_sekolah || santri.asal_sekolah || null,
      alamat_sekolah: pendaftar.alamat_sekolah || santri.alamat_sekolah || null,
      tahun_lulus: pendaftar.tahun_lulus || (santri.tahun_lulus ? parseInt(santri.tahun_lulus) : null),
      nisn: pendaftar.nisn || santri.nisn || null,
      anak_ke: pendaftar.anak_ke || (santri.anak_ke ? parseInt(santri.anak_ke) : null),
      jumlah_saudara: pendaftar.jumlah_saudara || (santri.berapa_bersaudara ? parseInt(santri.berapa_bersaudara) : null),

      // Parents (Nested object override)
      orang_tua: pendaftar.orang_tua ? {
        ...pendaftar.orang_tua,
        // Ayah
        nama_ayah: pendaftar.orang_tua.nama_ayah || ayah.nama_lengkap || null,
        nik_ayah: pendaftar.orang_tua.nik_ayah || ayah.nik || null,
        tempat_lahir_ayah: pendaftar.orang_tua.tempat_lahir_ayah || ayah.tempat_lahir || null,
        tanggal_lahir_ayah: pendaftar.orang_tua.tanggal_lahir_ayah || (ayah.tanggal_lahir ? new Date(ayah.tanggal_lahir) : null),
        pekerjaan_ayah: pendaftar.orang_tua.pekerjaan_ayah || ayah.pekerjaan || null,
        pendidikan_ayah: pendaftar.orang_tua.pendidikan_ayah || ayah.pendidikan_terakhir || null,
        penghasilan_ayah: pendaftar.orang_tua.penghasilan_ayah || ayah.penghasilan || null,
        no_hp_ayah: pendaftar.orang_tua.no_hp_ayah || ayah.no_hp || null,
        alamat_ayah: pendaftar.orang_tua.alamat_ayah || ayah.alamat || null,
        status_ayah: pendaftar.orang_tua.status_ayah || ayah.status_hidup || "Masih Hidup",
        // Ibu
        nama_ibu: pendaftar.orang_tua.nama_ibu || ibu.nama_lengkap || null,
        nik_ibu: pendaftar.orang_tua.nik_ibu || ibu.nik || null,
        tempat_lahir_ibu: pendaftar.orang_tua.tempat_lahir_ibu || ibu.tempat_lahir || null,
        tanggal_lahir_ibu: pendaftar.orang_tua.tanggal_lahir_ibu || (ibu.tanggal_lahir ? new Date(ibu.tanggal_lahir) : null),
        pekerjaan_ibu: pendaftar.orang_tua.pekerjaan_ibu || ibu.pekerjaan || null,
        pendidikan_ibu: pendaftar.orang_tua.pendidikan_ibu || ibu.pendidikan_terakhir || null,
        penghasilan_ibu: pendaftar.orang_tua.penghasilan_ibu || ibu.penghasilan || null,
        no_hp_ibu: pendaftar.orang_tua.no_hp_ibu || ibu.no_hp || null,
        alamat_ibu: pendaftar.orang_tua.alamat_ibu || ibu.alamat || null,
        status_ibu: pendaftar.orang_tua.status_ibu || ibu.status_hidup || "Masih Hidup",
      } : null
    };

    return NextResponse.json({ data: mergedPendaftar });
  } catch (error) {
    console.error("Error in admin pendaftar detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update pendaftar status
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check custom role
    const allowedRoles = ["admin", "admin_super", "admin_berkas", "admin_keuangan", "penguji"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { status_proses } = body;

    if (!status_proses) {
      return NextResponse.json(
        { error: "status_proses is required" },
        { status: 400 }
      );
    }

    // Update pendaftar status
    const data = await prisma.pendaftar.update({
      where: { id: params.id },
      data: {
        status_pendaftaran: status_proses,
        updated_at: new Date(),
      },
    });

    // Logging audit action
    logAdminAction({
      action: status_proses === 'draft' ? 'FORCE_UNLOCK_FORM' : 'VERIFY_DOCUMENT',
      adminId: session.id || 'system',
      adminName: session.full_name || session.name || 'Admin',
      targetId: params.id,
      targetName: data.nama_lengkap,
      details: { previous_status: 'unknown', new_status: status_proses }
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in admin pendaftar update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete pendaftar (admin_super only)
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin_super can delete
    if (session.role !== "admin_super") {
      return NextResponse.json(
        { error: "Hanya Admin Super yang dapat menghapus data pendaftar" },
        { status: 403 }
      );
    }

    // Fetch full pendaftar data with ALL relations for backup
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: params.id },
      include: {
        tahun_ajaran: true,
        orang_tua: true,
        dokumen: true,
        pembayaran: true,
        jadwal_ujian: true,
        nilai_ujian: true,
        pengumuman: true,
        rapor: true,
        prestasi: true,
        kesehatan: true,
        asrama: true,
        hasil_seleksi: true,
        reservasi: true,
        whatsapp_logs: true,
      },
    });

    if (!pendaftar) {
      return NextResponse.json(
        { error: "Pendaftar tidak ditemukan" },
        { status: 404 }
      );
    }

    if (pendaftar.deleted_at) {
      return NextResponse.json(
        { error: "Pendaftar sudah dihapus sebelumnya" },
        { status: 400 }
      );
    }

    // Create full backup snapshot and soft-delete in a transaction
    await prisma.$transaction([
      // 1. Save full backup snapshot
      prisma.pendaftarBackup.create({
        data: {
          pendaftar_id: pendaftar.id,
          nomor_pendaftaran: pendaftar.nomor_pendaftaran,
          nama_lengkap: pendaftar.nama_lengkap,
          backup_data: JSON.parse(JSON.stringify(pendaftar)),
          deleted_by: session.id,
          deleted_by_name: session.full_name || session.name || "Admin Super",
        },
      }),
      // 2. Soft delete the pendaftar
      prisma.pendaftar.update({
        where: { id: params.id },
        data: {
          deleted_at: new Date(),
          deleted_by: session.id,
          updated_at: new Date(),
        },
      }),
    ]);

    // Audit log
    logAdminAction({
      action: "SOFT_DELETE_PENDAFTAR",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: params.id,
      targetName: pendaftar.nama_lengkap,
      details: {
        nomor_pendaftaran: pendaftar.nomor_pendaftaran,
        status_sebelum: pendaftar.status_pendaftaran,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Data ${pendaftar.nama_lengkap} berhasil dihapus (soft delete). Data cadangan telah disimpan dan bisa direstore kapan saja.`,
    });
  } catch (error) {
    console.error("Error in admin pendaftar soft delete API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
