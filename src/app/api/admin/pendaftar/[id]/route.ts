import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";

const parseSafeInt = (val: any) => {
  if (val === undefined || val === null || val === "") return null;
  const parsed = parseInt(val.toString());
  return isNaN(parsed) ? null : parsed;
};

const parseSafeDate = (val: any) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check custom role
    const allowedRoles = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_keuangan",
      "penguji",
    ];
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
        nilai_ujian: {
          orderBy: { updated_at: "desc" },
        },
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
        { status: 404 },
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

    const isEmpty = (v: any) => {
      if (v == null || v === "") return true;
      if (typeof v === "object") {
        if (Array.isArray(v)) return v.length === 0;
        const keys = Object.keys(v);
        if (keys.length === 0) return true;
        return keys.every((key) => v[key] == null || v[key] === "");
      }
      return false;
    };

    // Merge multiple NilaiUjian records if exists
    const scores = (pendaftar.nilai_ujian as any[]) || [];
    let mergedNilai = null;

    if (scores.length > 0) {
      const master: any = {};
      scores.forEach((s) => {
        Object.entries(s).forEach(([k, v]) => {
          if (!isEmpty(v) && isEmpty(master[k])) {
            master[k] = v;
          }
        });
      });
      mergedNilai = master;
    }

    const mergedPendaftar = {
      ...pendaftar,
      nilai_ujian: mergedNilai,
      status_proses: pendaftar.status_pendaftaran,
      // Identity
      tempat_lahir: pendaftar.tempat_lahir || santri.tempat_lahir || null,
      tanggal_lahir:
        pendaftar.tanggal_lahir || parseSafeDate(santri.tanggal_lahir),
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
      tahun_lulus:
        pendaftar.tahun_lulus || parseSafeInt(santri.tahun_lulus),
      nisn: pendaftar.nisn || santri.nisn || null,
      anak_ke: pendaftar.anak_ke || parseSafeInt(santri.anak_ke),
      jumlah_saudara:
        pendaftar.jumlah_saudara ||
        parseSafeInt(santri.berapa_bersaudara) ||
        parseSafeInt(santri.jumlah_saudara) ||
        null,

      // Parents (Nested object override)
      orang_tua: pendaftar.orang_tua
        ? {
            ...pendaftar.orang_tua,
            // Ayah
            nama_ayah:
              pendaftar.orang_tua.nama_ayah || ayah.nama_lengkap || null,
            nik_ayah: pendaftar.orang_tua.nik_ayah || ayah.nik || null,
            tempat_lahir_ayah:
              pendaftar.orang_tua.tempat_lahir_ayah ||
              ayah.tempat_lahir ||
              null,
            tanggal_lahir_ayah:
              pendaftar.orang_tua.tanggal_lahir_ayah ||
              parseSafeDate(ayah.tanggal_lahir),
            pekerjaan_ayah:
              pendaftar.orang_tua.pekerjaan_ayah || ayah.pekerjaan || null,
            pendidikan_ayah:
              pendaftar.orang_tua.pendidikan_ayah ||
              ayah.pendidikan_terakhir ||
              null,
            penghasilan_ayah:
              pendaftar.orang_tua.penghasilan_ayah || ayah.penghasilan || null,
            no_hp_ayah: pendaftar.orang_tua.no_hp_ayah || ayah.no_hp || null,
            alamat_ayah: pendaftar.orang_tua.alamat_ayah || ayah.alamat || null,
            status_ayah:
              pendaftar.orang_tua.status_ayah ||
              ayah.status_hidup ||
              "Masih Hidup",
            // Ibu
            nama_ibu: pendaftar.orang_tua.nama_ibu || ibu.nama_lengkap || null,
            nik_ibu: pendaftar.orang_tua.nik_ibu || ibu.nik || null,
            tempat_lahir_ibu:
              pendaftar.orang_tua.tempat_lahir_ibu || ibu.tempat_lahir || null,
            tanggal_lahir_ibu:
              pendaftar.orang_tua.tanggal_lahir_ibu ||
              parseSafeDate(ibu.tanggal_lahir),
            pekerjaan_ibu:
              pendaftar.orang_tua.pekerjaan_ibu || ibu.pekerjaan || null,
            pendidikan_ibu:
              pendaftar.orang_tua.pendidikan_ibu ||
              ibu.pendidikan_terakhir ||
              null,
            penghasilan_ibu:
              pendaftar.orang_tua.penghasilan_ibu || ibu.penghasilan || null,
            no_hp_ibu: pendaftar.orang_tua.no_hp_ibu || ibu.no_hp || null,
            alamat_ibu: pendaftar.orang_tua.alamat_ibu || ibu.alamat || null,
            status_ibu:
              pendaftar.orang_tua.status_ibu ||
              ibu.status_hidup ||
              "Masih Hidup",
          }
        : null,
    };

    return NextResponse.json({ data: mergedPendaftar });
  } catch (error) {
    console.error("Error in admin pendaftar detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH: Update pendaftar status
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check custom role
    const allowedRoles = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_keuangan",
      "penguji",
    ];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { status_proses, no_hp, is_edit_full, santri, orang_tua } = body;

    // SCENARIO 0: Full Profile Edit (Admin Super Only)
    if (is_edit_full) {
      if (session.role !== "admin_super") {
        return NextResponse.json(
          { error: "Hanya Admin Super yang dapat mengedit data lengkap pendaftar" },
          { status: 403 },
        );
      }

      await prisma.$transaction(async (tx) => {
        // Sync to JSON data_lengkap for backward compatibility
        const dataLengkapObj = {
          santri: santri || {},
          ayah: orang_tua ? {
            nama_lengkap: orang_tua.nama_ayah,
            nik: orang_tua.nik_ayah,
            tempat_lahir: orang_tua.tempat_lahir_ayah,
            tanggal_lahir: orang_tua.tanggal_lahir_ayah,
            pendidikan_terakhir: orang_tua.pendidikan_ayah,
            pekerjaan: orang_tua.pekerjaan_ayah,
            penghasilan: orang_tua.penghasilan_ayah,
            no_hp: orang_tua.no_hp_ayah,
            status_hidup: orang_tua.status_ayah,
            alamat: orang_tua.alamat_ayah,
          } : {},
          ibu: orang_tua ? {
            nama_lengkap: orang_tua.nama_ibu,
            nik: orang_tua.nik_ibu,
            tempat_lahir: orang_tua.tempat_lahir_ibu,
            tanggal_lahir: orang_tua.tanggal_lahir_ibu,
            pendidikan_terakhir: orang_tua.pendidikan_ibu,
            pekerjaan: orang_tua.pekerjaan_ibu,
            penghasilan: orang_tua.penghasilan_ibu,
            no_hp: orang_tua.no_hp_ibu,
            status_hidup: orang_tua.status_ibu,
            alamat: orang_tua.alamat_ibu,
          } : {},
          wali: orang_tua ? {
            nama_lengkap: orang_tua.nama_wali,
            nik: orang_tua.nik_wali,
            tempat_lahir: orang_tua.tempat_lahir_wali,
            tanggal_lahir: orang_tua.tanggal_lahir_wali,
            pendidikan_terakhir: orang_tua.pendidikan_wali,
            pekerjaan: orang_tua.pekerjaan_wali,
            penghasilan: orang_tua.penghasilan_wali,
            no_hp: orang_tua.no_hp_wali,
            alamat: orang_tua.alamat_wali,
            hubungan: orang_tua.hubungan_wali,
          } : {},
          wali_sama_dengan_ortu: orang_tua?.nama_wali ? false : true,
        };

        // Update Pendaftar Columns
        await tx.pendaftar.update({
          where: { id: params.id },
          data: {
            nama_lengkap: santri.nama_lengkap,
            nik: santri.nik,
            tempat_lahir: santri.tempat_lahir,
            tanggal_lahir: parseSafeDate(santri.tanggal_lahir),
            jenis_kelamin: santri.jenis_kelamin,
            no_hp: santri.no_hp,
            email: santri.email,
            golongan_darah: santri.golongan_darah,
            anak_ke: parseSafeInt(santri.anak_ke),
            jumlah_saudara: parseSafeInt(santri.jumlah_saudara),
            hobi: santri.hobi,
            cita_cita: santri.cita_cita,
            alamat: santri.alamat,
            rt: santri.rt,
            rw: santri.rw,
            kelurahan: santri.kelurahan,
            kecamatan: santri.kecamatan,
            kabupaten: santri.kabupaten,
            provinsi: santri.provinsi,
            kode_pos: santri.kode_pos,
            asal_sekolah: santri.asal_sekolah,
            alamat_sekolah: santri.alamat_sekolah,
            tahun_lulus: parseSafeInt(santri.tahun_lulus),
            nisn: santri.nisn,
            // Pindahan fields
            tipe_pendaftaran: santri.tipe_pendaftaran || "BARU",
            kelas_masuk: parseSafeInt(santri.kelas_masuk),
            asal_institusi: santri.asal_institusi,
            nomor_induk_lama: santri.nomor_induk_lama,
            catatan_pindahan: santri.catatan_pindahan,
            data_lengkap: dataLengkapObj,
            updated_at: new Date(),
          },
        });

        // Update OrangTua Columns
        if (orang_tua) {
          const parentData = {
            nama_ayah: orang_tua.nama_ayah,
            nik_ayah: orang_tua.nik_ayah,
            tempat_lahir_ayah: orang_tua.tempat_lahir_ayah,
            tanggal_lahir_ayah: parseSafeDate(orang_tua.tanggal_lahir_ayah),
            pendidikan_ayah: orang_tua.pendidikan_ayah,
            pekerjaan_ayah: orang_tua.pekerjaan_ayah,
            penghasilan_ayah: orang_tua.penghasilan_ayah,
            no_hp_ayah: orang_tua.no_hp_ayah,
            status_ayah: orang_tua.status_ayah,
            alamat_ayah: orang_tua.alamat_ayah,
            nama_ibu: orang_tua.nama_ibu,
            nik_ibu: orang_tua.nik_ibu,
            tempat_lahir_ibu: orang_tua.tempat_lahir_ibu,
            tanggal_lahir_ibu: parseSafeDate(orang_tua.tanggal_lahir_ibu),
            pendidikan_ibu: orang_tua.pendidikan_ibu,
            pekerjaan_ibu: orang_tua.pekerjaan_ibu,
            penghasilan_ibu: orang_tua.penghasilan_ibu,
            no_hp_ibu: orang_tua.no_hp_ibu,
            status_ibu: orang_tua.status_ibu,
            alamat_ibu: orang_tua.alamat_ibu,
            nama_wali: orang_tua.nama_wali,
            nik_wali: orang_tua.nik_wali,
            tempat_lahir_wali: orang_tua.tempat_lahir_wali,
            tanggal_lahir_wali: parseSafeDate(orang_tua.tanggal_lahir_wali),
            pendidikan_wali: orang_tua.pendidikan_wali,
            pekerjaan_wali: orang_tua.pekerjaan_wali,
            penghasilan_wali: orang_tua.penghasilan_wali,
            no_hp_wali: orang_tua.no_hp_wali,
            alamat_wali: orang_tua.alamat_wali,
            hubungan_wali: orang_tua.hubungan_wali,
            updated_at: new Date(),
          };

          await tx.orangTua.upsert({
            where: { pendaftar_id: params.id },
            create: {
              pendaftar_id: params.id,
              ...parentData,
            },
            update: parentData,
          });
        }

        // Sync with related user profile
        const pendaftarRecord = await tx.pendaftar.findUnique({
          where: { id: params.id },
          select: { user_id: true },
        });

        if (pendaftarRecord?.user_id) {
          await tx.profile.update({
            where: { id: pendaftarRecord.user_id },
            data: {
              full_name: santri.nama_lengkap,
              phone: santri.no_hp,
              email: santri.email,
              updated_at: new Date(),
            },
          });
        }
      });

      // Audit Log
      logAdminAction({
        action: "EDIT_PENDAFTAR_FULL",
        adminId: session.id || "system",
        adminName: session.full_name || session.name || "Admin",
        targetId: params.id,
        targetName: santri.nama_lengkap,
        details: { nomor_pendaftaran: santri.nomor_pendaftaran },
      });

      return NextResponse.json({
        success: true,
        message: "Data pendaftar berhasil diperbarui secara lengkap",
      });
    }



    // SCENARIO 1: Update Phone Number (Admin Super Only)
    if (no_hp) {
      if (session.role !== "admin_super") {
        return NextResponse.json(
          { error: "Hanya Admin Super yang dapat mengubah nomor HP pendaftar" },
          { status: 403 },
        );
      }

      // 1. Fetch current pendaftar to get user_id
      const pendaftar = await prisma.pendaftar.findUnique({
        where: { id: params.id },
        select: { user_id: true, nama_lengkap: true, no_hp: true },
      });

      if (!pendaftar) {
        return NextResponse.json(
          { error: "Pendaftar not found" },
          { status: 404 },
        );
      }

      // 2. Update both Pendaftar and Profile in a transaction
      await prisma.$transaction(async (tx) => {
        // Update Pendaftar
        await tx.pendaftar.update({
          where: { id: params.id },
          data: { no_hp, updated_at: new Date() },
        });

        // Update Profile (User) if linked
        if (pendaftar.user_id) {
          await tx.profile.update({
            where: { id: pendaftar.user_id },
            data: { phone: no_hp, updated_at: new Date() },
          });
        }
      });

      // Logging audit action
      logAdminAction({
        action: "UPDATE_PHONE_NUMBER",
        adminId: session.id || "system",
        adminName: session.full_name || session.name || "Admin",
        targetId: params.id,
        targetName: pendaftar.nama_lengkap,
        details: { previous_phone: pendaftar.no_hp, new_phone: no_hp },
      });

      return NextResponse.json({
        success: true,
        message: "Nomor HP berhasil diperbarui",
      });
    }

    // SCENARIO 2: Update Status
    if (!status_proses) {
      return NextResponse.json(
        { error: "status_proses is required" },
        { status: 400 },
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

    // SYNC TO PENGUMUMAN: If status is final, ensure student dashboard matches
    const finalStatuses = ["accepted", "rejected", "announced", "cadangan"];
    if (finalStatuses.includes(status_proses)) {
      const displayLabel = status_proses === "accepted" ? "Diterima" : (status_proses === "rejected" ? "Ditolak" : "Cadangan");
      
      await prisma.pengumuman.upsert({
        where: { pendaftar_id: params.id },
        update: { 
          status_kelulusan: displayLabel, 
          is_published: true, 
          published_at: new Date() 
        },
        create: { 
          pendaftar_id: params.id, 
          status_kelulusan: displayLabel, 
          is_published: true, 
          published_at: new Date(),
          tahun_ajaran_id: data.tahun_ajaran_id
        },
      });
    }

    // Logging audit action
    logAdminAction({
      action:
        status_proses === "draft" ? "FORCE_UNLOCK_FORM" : "VERIFY_DOCUMENT",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: params.id,
      targetName: data.nama_lengkap,
      details: { previous_status: "unknown", new_status: status_proses },
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in admin pendaftar update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE: Soft delete pendaftar (admin_super only)
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
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
        { status: 403 },
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
        { status: 404 },
      );
    }

    if (pendaftar.deleted_at) {
      return NextResponse.json(
        { error: "Pendaftar sudah dihapus sebelumnya" },
        { status: 400 },
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
          nomor_pendaftaran: `DEL_${Date.now()}_${pendaftar.nomor_pendaftaran}`,
          nik: `DEL_${Date.now()}_${pendaftar.nik}`,
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
      { status: 500 },
    );
  }
}
