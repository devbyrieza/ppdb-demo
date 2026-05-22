import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    // 1. Validasi session manual
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Check custom role
    const allowedRoles = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_keuangan",
    ];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const jenjang = searchParams.get("jenjang") || "";
    const jenisKelamin = searchParams.get("jenis_kelamin") || "";
    const tahunAjaran = searchParams.get("tahun_ajaran") || "";
    const provinsi = searchParams.get("provinsi") || "";
    const kabupaten = searchParams.get("kabupaten") || "";
    const kecamatan = searchParams.get("kecamatan") || "";
    const kelurahan = searchParams.get("kelurahan") || "";
    const tipePendaftaran = searchParams.get("tipe_pendaftaran") || "";

    // Build query - fetch ALL records (no pagination for export)
    const where: Prisma.PendaftarWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { nama_lengkap: { contains: search, mode: "insensitive" } },
        { nik: { contains: search, mode: "insensitive" } },
        { nomor_pendaftaran: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) query_status(status, where);
    if (jenjang) {
      where.jenjang = { contains: jenjang, mode: "insensitive" };
    }
    if (jenisKelamin) {
      where.jenis_kelamin = { contains: jenisKelamin, mode: "insensitive" };
    }
    if (tahunAjaran) where.tahun_ajaran_id = tahunAjaran;
    if (provinsi) where.provinsi = provinsi;
    if (kabupaten) where.kabupaten = kabupaten;
    if (kecamatan) where.kecamatan = kecamatan;
    if (kelurahan) where.kelurahan = kelurahan;
    if (tipePendaftaran) where.tipe_pendaftaran = tipePendaftaran;

    const pendaftarData = await prisma.pendaftar.findMany({
      where,
      select: {
        id: true,
        nomor_pendaftaran: true,
        nik: true,
        nama_lengkap: true,
        jenis_kelamin: true,
        tempat_lahir: true,
        tanggal_lahir: true,
        jenjang: true,
        asal_sekolah: true,
        alamat: true,
        kelurahan: true,
        kecamatan: true,
        kabupaten: true, // mapped to kota_kabupaten in export
        provinsi: true,
        kode_pos: true,
        no_hp: true,
        email: true,
        status_pendaftaran: true,
        tipe_pendaftaran: true,
        created_at: true,
        tahun_ajaran: {
          select: { nama: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Convert to CSV
    const headers = [
      "Nomor Pendaftaran",
      "NIK",
      "Nama Lengkap",
      "Jenis Kelamin",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Jalur",
      "Jenjang",
      "Asal Sekolah",
      "Alamat",
      "Kelurahan",
      "Kecamatan",
      "Kota/Kabupaten",
      "Provinsi",
      "Kode Pos",
      "No HP",
      "Email",
      "Status",
      "Tahun Ajaran",
      "Tanggal Daftar",
    ];

    // Return as JSON for client-side export
    const exportData = pendaftarData.map((item) => ({
      "Nomor Pendaftaran": item.nomor_pendaftaran || "-",
      NIK: item.nik ? `'${item.nik}` : "-", // Text format for Excel
      "Nama Lengkap": item.nama_lengkap || "-",
      "Jenis Kelamin": ["L", "Laki-laki"].includes(item.jenis_kelamin || "")
        ? "Laki-laki"
        : "Perempuan",
      "Tempat Lahir": item.tempat_lahir || "-",
      "Tanggal Lahir": item.tanggal_lahir
        ? new Date(item.tanggal_lahir).toLocaleDateString("id-ID")
        : "-",
      Jalur: item.tipe_pendaftaran === "PINDAHAN" ? "Pindahan" : "Reguler",
      Jenjang: item.jenjang || "-",
      "Asal Sekolah": item.asal_sekolah || "-",
      Alamat: item.alamat || "-",
      Kelurahan: item.kelurahan || "-",
      Kecamatan: item.kecamatan || "-",
      "Kota/Kabupaten": item.kabupaten || "-",
      Provinsi: item.provinsi || "-",
      "Kode Pos": item.kode_pos || "-",
      "No HP": item.no_hp ? `'${item.no_hp}` : "-",
      Email: item.email || "-",
      Status: item.status_pendaftaran || "-",
      "Tahun Ajaran": item.tahun_ajaran?.nama || "-",
      "Tanggal Daftar": item.created_at
        ? new Date(item.created_at).toLocaleDateString("id-ID")
        : "-",
    }));

    return NextResponse.json({ data: exportData });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function query_status(status: string, where: any) {
  const filterMapping: Record<string, string[]> = {
    belum_bayar: ["draft", "waiting_payment", "awaiting_payment"],
    menunggu_verifikasi_pembayaran: ["payment_verification"],
    sudah_bayar: [
      "paid",
      "verified",
      "data_completed",
      "docs_uploaded",
      "docs_verified",
      "scheduled",
      "tested",
      "announced",
      "accepted",
      "enrolled",
    ],
    selection: ["selection", "scheduled", "testing", "tested"],
    pembayaran_ditolak: ["rejected", "payment_rejected"],
    belum_isi_data: ["verified", "paid"],
    sudah_isi_data: [
      "data_completed",
      "docs_uploaded",
      "docs_verified",
      "scheduled",
      "tested",
      "announced",
      "accepted",
      "enrolled",
    ],
    belum_upload_dokumen: ["data_completed"],
    menunggu_verifikasi_dokumen: ["docs_uploaded"],
    dokumen_terverifikasi: [
      "docs_verified",
      "scheduled",
      "tested",
      "passed",
      "announced",
      "accepted",
      "enrolled",
    ],
    dokumen_ditolak: ["docs_rejected"],
    terjadwal_ujian: ["scheduled"],
    belum_ujian: ["scheduled"],
    tested: ["tested", "passed", "announced", "accepted", "enrolled"],
    sudah_ujian: ["tested", "passed", "announced", "accepted", "enrolled"],
    hasil_ujian: ["passed", "announced", "accepted", "enrolled"],
    diterima: ["accepted", "passed", "enrolled"],
    belum_daftar_ulang: ["accepted"],
    sudah_daftar_ulang: ["enrolled"],
  };

  const statusValues = filterMapping[status];
  if (statusValues && statusValues.length > 0) {
    where.status_pendaftaran = { in: statusValues };
  } else {
    where.status_pendaftaran = status;
  }
}
