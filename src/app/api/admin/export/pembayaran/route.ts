import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import ExcelJS from 'exceljs';
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Validate session
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
    const allowedRoles = ["admin", "admin_super", "admin_berkas", "admin_keuangan", "penguji"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "all"; // all, lunas, pending
    const format = url.searchParams.get("format") || "csv";

    // Fetch data using Prisma
    const data = await prisma.pendaftar.findMany({
      select: {
        id: true,
        nomor_pendaftaran: true,
        nama_lengkap: true,
        nik: true,
        jenis_kelamin: true,
        jenjang: true,
        no_hp: true,
        email: true,
        provinsi: true,
        kabupaten: true,
        status_pendaftaran: true,
        created_at: true,
        pembayaran: {
          select: {
            id: true,
            jumlah: true,
            metode_pembayaran: true,
            status_pembayaran: true,
            created_at: true,
            verified_at: true,
          },
          // Take the latest payment if multiple exists (though usually one related to registration)
          orderBy: { created_at: "desc" },
          take: 1,
        }
      },
      orderBy: { created_at: "desc" },
    });

    // Process data
    const processedData = data.map((p) => {
      const pembayaran = p.pembayaran?.[0];
      return {
        nomor_pendaftaran: p.nomor_pendaftaran,
        nama_lengkap: p.nama_lengkap,
        nik: p.nik,
        jenis_kelamin: p.jenis_kelamin,
        jenjang: p.jenjang,
        no_hp: p.no_hp || "",
        email: p.email || "",
        provinsi: p.provinsi || "",
        kabupaten: p.kabupaten || "",
        status_pendaftaran: p.status_pendaftaran,
        tanggal_daftar: new Date(p.created_at).toLocaleDateString("id-ID"),
        jumlah_pembayaran: pembayaran?.jumlah ? Number(pembayaran.jumlah) : 0,
        metode_pembayaran: pembayaran?.metode_pembayaran || "",
        status_pembayaran: pembayaran?.status_pembayaran || "belum_bayar",
        tanggal_pembayaran: pembayaran?.created_at
          ? new Date(pembayaran.created_at).toLocaleDateString("id-ID")
          : "",
        tanggal_verifikasi: pembayaran?.verified_at
          ? new Date(pembayaran.verified_at).toLocaleDateString("id-ID")
          : "",
      };
    });

    // Filter by type
    let filteredData = processedData;
    if (type === "lunas") {
      filteredData = processedData.filter((p) => p.status_pembayaran === "verified");
    } else if (type === "pending") {
      filteredData = processedData.filter(
        (p) =>
          p.status_pembayaran === "pending" ||
          p.status_pembayaran === "belum_bayar" ||
          p.status_pembayaran === "payment_verification"
      );
    }

    // Generate Excel
    if (format === 'excel' || format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Pembayaran');

      // Define columns
      worksheet.columns = [
        { header: 'No. Pendaftaran', key: 'nomor_pendaftaran', width: 20 },
        { header: 'Nama Lengkap', key: 'nama_lengkap', width: 30 },
        { header: 'NIK', key: 'nik', width: 20 },
        { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
        { header: 'Jenjang', key: 'jenjang', width: 10 },
        { header: 'No. HP', key: 'no_hp', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Provinsi', key: 'provinsi', width: 20 },
        { header: 'Kabupaten', key: 'kabupaten', width: 20 },
        { header: 'Status Pendaftaran', key: 'status_pendaftaran', width: 20 },
        { header: 'Tanggal Daftar', key: 'tanggal_daftar', width: 15 },
        { header: 'Jumlah Pembayaran', key: 'jumlah_pembayaran', width: 20 },
        { header: 'Metode Pembayaran', key: 'metode_pembayaran', width: 20 },
        { header: 'Status Pembayaran', key: 'status_pembayaran', width: 20 },
        { header: 'Tanggal Pembayaran', key: 'tanggal_pembayaran', width: 15 },
        { header: 'Tanggal Verifikasi', key: 'tanggal_verifikasi', width: 20 },
      ];

      // Add rows
      worksheet.addRows(filteredData);

      // Style header
      worksheet.getRow(1).font = { bold: true };

      // Buffer
      const buffer = await workbook.xlsx.writeBuffer();

      const filename = `pembayaran_ppdb_${type}_${new Date().toISOString().split("T")[0]}.xlsx`;

      return new NextResponse(buffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    // Default: Generate CSV
    const headers = [
      "No. Pendaftaran",
      "Nama Lengkap",
      "NIK",
      "Jenis Kelamin",
      "Jenjang",
      "No. HP",
      "Email",
      "Provinsi",
      "Kabupaten",
      "Status Pendaftaran",
      "Tanggal Daftar",
      "Jumlah Pembayaran",
      "Metode Pembayaran",
      "Status Pembayaran",
      "Tanggal Pembayaran",
      "Tanggal Verifikasi",
    ];

    const rows = filteredData.map((item) => [
      item.nomor_pendaftaran,
      item.nama_lengkap,
      item.nik,
      item.jenis_kelamin,
      item.jenjang,
      item.no_hp,
      item.email,
      item.provinsi,
      item.kabupaten,
      item.status_pendaftaran,
      item.tanggal_daftar,
      item.jumlah_pembayaran,
      item.metode_pembayaran,
      item.status_pembayaran,
      item.tanggal_pembayaran,
      item.tanggal_verifikasi,
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Add BOM for Excel UTF-8 compatibility
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    // Return as downloadable file
    const filename = `pembayaran_ppdb_${type}_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
