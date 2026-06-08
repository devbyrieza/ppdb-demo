import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/pendaftar/data-lengkap
 * Mengambil data lengkap pendaftar yang sedang login
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan" },
        { status: 401 },
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid" },
        { status: 401 },
      );
    }

    if (session.role !== "pendaftar") {
      return NextResponse.json(
        { success: false, error: "Akses tidak diizinkan" },
        { status: 403 },
      );
    }

    const pendaftarId = session.id;
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
    });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Data pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    const dataLengkap: any = pendaftar.data_lengkap || {};

    // Merge top-level data from database columns as source of truth for main identity
    const responseData = {
      santri: {
        ...dataLengkap.santri,
        nik: pendaftar.nik || dataLengkap.santri?.nik || "",
        nama_lengkap:
          pendaftar.nama_lengkap || dataLengkap.santri?.nama_lengkap || "",
        tanggal_lahir: pendaftar.tanggal_lahir
          ? new Date(pendaftar.tanggal_lahir).toISOString().split("T")[0]
          : dataLengkap.santri?.tanggal_lahir || "",
        jenis_kelamin: ["L", "Laki-laki"].includes(
          pendaftar.jenis_kelamin || "",
        )
          ? "Laki-laki"
          : ["P", "Perempuan"].includes(pendaftar.jenis_kelamin || "")
            ? "Perempuan"
            : dataLengkap.santri?.jenis_kelamin || "",
        no_hp: pendaftar.no_hp || dataLengkap.santri?.no_hp || "",
      },
      ayah: dataLengkap.ayah || { status_hidup: "Masih Hidup" },
      ibu: dataLengkap.ibu || { status_hidup: "Masih Hidup" },
      wali: dataLengkap.wali || {},
      wali_sama_dengan_ortu: dataLengkap.wali_sama_dengan_ortu ?? true,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...responseData,
        jenjang: pendaftar.jenjang,
        status_pendaftaran: pendaftar.status_pendaftaran,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/pendaftar/data-lengkap:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/pendaftar/data-lengkap
 * Menyimpan data lengkap pendaftar (termasuk auto-save draft)
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan" },
        { status: 401 },
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid" },
        { status: 401 },
      );
    }

    const pendaftarId = session.id;
    const body = await request.json();
    const { santri, ayah, ibu, wali, wali_sama_dengan_ortu, is_draft } = body;

    const parseSafeInt = (val: any) => {
      if (val === undefined || val === null || val === "") return undefined;
      const parsed = parseInt(val.toString());
      return isNaN(parsed) ? undefined : parsed;
    };

    const parseSafeFloat = (val: any) => {
      if (val === undefined || val === null || val === "") return undefined;
      const parsed = parseFloat(val.toString());
      return isNaN(parsed) ? undefined : parsed;
    };

    const parseSafeDate = (val: any) => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    // Relaxation: If is_draft, we don't require anything.
    // If not draft (manual Save), we still keep some sanity checks but less strict.
    if (!is_draft) {
      if (!santri?.nama_lengkap) {
        return NextResponse.json(
          { success: false, error: "Nama lengkap santri wajib diisi" },
          { status: 400 },
        );
      }
    }

    // Prepare data for individual columns (identity sync)
    let jenisKelaminDb = null;
    if (["L", "Laki-laki"].includes(santri?.jenis_kelamin))
      jenisKelaminDb = "L";
    else if (["P", "Perempuan"].includes(santri?.jenis_kelamin))
      jenisKelaminDb = "P";

    // Reconstruct data_lengkap object to be saved
    const dataLengkapObj = {
      santri: santri || {},
      ayah: ayah || {},
      ibu: ibu || {},
      wali: wali || {},
      wali_sama_dengan_ortu: wali_sama_dengan_ortu ?? true,
    };

    // Update main pendaftar record
    const updateData: any = {
      data_lengkap: dataLengkapObj,
      updated_at: new Date(),
    };

    // Sync individual columns for the Santri (Main Pendaftar Table)
    if (santri) {
      // Identity Sync
      if (santri.nama_lengkap) updateData.nama_lengkap = santri.nama_lengkap;
      if (santri.nik) updateData.nik = santri.nik;
      if (santri.tanggal_lahir) {
        const d = parseSafeDate(santri.tanggal_lahir);
        if (d) updateData.tanggal_lahir = d;
      }
      if (jenisKelaminDb) updateData.jenis_kelamin = jenisKelaminDb;
      if (santri.no_hp) updateData.no_hp = santri.no_hp;

      // Alamat & Wilayah Sync
      if (santri.alamat) updateData.alamat = santri.alamat;
      if (santri.rt) updateData.rt = santri.rt;
      if (santri.rw) updateData.rw = santri.rw;
      if (santri.kelurahan) updateData.kelurahan = santri.kelurahan;
      if (santri.kecamatan) updateData.kecamatan = santri.kecamatan;
      if (santri.kabupaten) updateData.kabupaten = santri.kabupaten;
      if (santri.provinsi) updateData.provinsi = santri.provinsi;
      if (santri.kode_pos) updateData.kode_pos = santri.kode_pos;

      // Academic & Bio Sync (Safely handle 0 and NaN)
      if (santri.asal_sekolah) updateData.asal_sekolah = santri.asal_sekolah;
      if (santri.nisn) updateData.nisn = santri.nisn;

      const anakKe = parseSafeInt(santri.anak_ke);
      if (anakKe !== undefined) updateData.anak_ke = anakKe;

      const jumlahSaudara = parseSafeInt(santri.berapa_bersaudara);
      if (jumlahSaudara !== undefined)
        updateData.jumlah_saudara = jumlahSaudara;

      if (santri.tempat_lahir) updateData.tempat_lahir = santri.tempat_lahir;
      if (santri.golongan_darah)
        updateData.golongan_darah = santri.golongan_darah;
      if (santri.hobi) updateData.hobi = santri.hobi;
      if (santri.cita_cita) updateData.cita_cita = santri.cita_cita;
      if (santri.alamat_sekolah)
        updateData.alamat_sekolah = santri.alamat_sekolah;

      const tahunLulus = parseSafeInt(santri.tahun_lulus);
      if (tahunLulus !== undefined) updateData.tahun_lulus = tahunLulus;
    }

    // UPDATE PENDAFTAR
    const updatedPendaftar = await prisma.pendaftar.update({
      where: { id: pendaftarId },
      data: updateData,
    });

    // SYNC TO ORANG_TUA TABLE
    if (ayah || ibu || wali) {
      const parentData = {
        // Ayah
        nama_ayah: ayah?.nama_lengkap,
        nik_ayah: ayah?.nik,
        tempat_lahir_ayah: ayah?.tempat_lahir,
        tanggal_lahir_ayah: parseSafeDate(ayah?.tanggal_lahir),
        pendidikan_ayah: ayah?.pendidikan_terakhir,
        pekerjaan_ayah: ayah?.pekerjaan,
        penghasilan_ayah: ayah?.penghasilan,
        no_hp_ayah: ayah?.no_hp,
        alamat_ayah: ayah?.alamat,
        // Ibu
        nama_ibu: ibu?.nama_lengkap,
        nik_ibu: ibu?.nik,
        tempat_lahir_ibu: ibu?.tempat_lahir,
        tanggal_lahir_ibu: parseSafeDate(ibu?.tanggal_lahir),
        pendidikan_ibu: ibu?.pendidikan_terakhir,
        pekerjaan_ibu: ibu?.pekerjaan,
        penghasilan_ibu: ibu?.penghasilan,
        no_hp_ibu: ibu?.no_hp,
        alamat_ibu: ibu?.alamat,
        // Wali
        nama_wali: wali?.nama_lengkap,
        no_hp_wali: wali?.no_hp,
        hubungan_wali: wali?.hubungan_status,
        alamat_wali: wali?.alamat,
        tanggal_lahir_wali: parseSafeDate(wali?.tanggal_lahir),
      };

      await prisma.orangTua.upsert({
        where: { pendaftar_id: pendaftarId },
        create: {
          pendaftar_id: pendaftarId,
          ...parentData,
        },
        update: parentData,
      });
    }

    // SYNC TO DATA_KESEHATAN TABLE
    if (santri) {
      const kesehatanData = {
        tinggi_badan: parseSafeInt(santri.tinggi_badan) ?? null,
        berat_badan: parseSafeFloat(santri.berat_badan) ?? null,
        riwayat_penyakit: santri.riwayat_penyakit || null,
      };

      await prisma.dataKesehatan.upsert({
        where: { pendaftar_id: pendaftarId },
        create: {
          pendaftar_id: pendaftarId,
          ...kesehatanData,
        },
        update: kesehatanData,
      });
    }

    return NextResponse.json({
      success: true,
      message: is_draft ? "Draft tersimpan" : "Data berhasil disimpan",
    });
  } catch (error: any) {
    console.error("Error in POST /api/pendaftar/data-lengkap:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat menyimpan data" },
      { status: 500 },
    );
  }
}
