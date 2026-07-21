import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
import { getAdminWhereClause } from "@/lib/utils/admin";

const toTitleCase = (str: string) => {
  if (!str) return "-";
  return str
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const translateStatus = (status: string, dataLengkap?: any) => {
  if (!status) return "-";
  const s = status.toLowerCase().trim();
  const statusMap: Record<string, string> = {
    draft: "Draft",
    awaiting_payment: "Draft",
    payment_verification: "Verifikasi Bayar",
    paid: "Terdaftar",
    verified: "Terdaftar",
    data_completed: "Data Lengkap",
    docs_uploaded: "Data Lengkap",
    docs_verified: "Berkas Lengkap",
    scheduled: "Proses Seleksi",
    testing: "Proses Seleksi",
    tested: "Proses Seleksi",
    exam_completed: "Proses Seleksi",
    announced: "Cadangan",
    cadangan: "Cadangan",
    accepted: "Diterima",
    rejected: "Ditolak",
    mengundurkan_diri: "Mengundurkan Diri",
    enrolled: "Proses Daftar Ulang",
    enrolled_full: "Lunas Daftar Ulang",
    pindah_keluar: "Pindah Keluar",
  };
  return statusMap[s] || status.toUpperCase();
};

const translatePaymentStatus = (status: string) => {
  if (!status) return "-";
  const s = status.toLowerCase().trim();
  const statusMap: Record<string, string> = {
    pending: "Menunggu Verifikasi",
    verified: "Lunas / Terverifikasi",
    rejected: "Ditolak",
    belum_bayar: "Belum Bayar",
  };
  return statusMap[s] || status.toUpperCase();
};

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

    // Get query params
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "all"; // all, lunas, pending
    const format = url.searchParams.get("format") || "csv";

    // Fetch data using Prisma
    const data = await prisma.pendaftar.findMany({
      where: getAdminWhereClause(),
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
        data_lengkap: true,
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
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Process data
    const processedData = data.map((p) => {
      const pembayaran = p.pembayaran?.[0];
      return {
        nomor_pendaftaran: p.nomor_pendaftaran || "-",
        nama_lengkap: p.nama_lengkap ? toTitleCase(p.nama_lengkap) : "-",
        nik: p.nik || "-",
        jenis_kelamin: ["L", "Laki-laki"].includes(p.jenis_kelamin || "") ? "Laki-laki" : "Perempuan",
        jenjang: p.jenjang || "-",
        no_hp: p.no_hp || "-",
        email: p.email || "-",
        provinsi: p.provinsi || "-",
        kabupaten: p.kabupaten || "-",
        status_pendaftaran: translateStatus(p.status_pendaftaran, p.data_lengkap),
        tanggal_daftar: new Date(p.created_at).toLocaleDateString("id-ID"),
        jumlah_pembayaran: pembayaran?.jumlah ? Number(pembayaran.jumlah) : 0,
        metode_pembayaran: pembayaran?.metode_pembayaran || "-",
        status_pembayaran: translatePaymentStatus(pembayaran?.status_pembayaran || "belum_bayar"),
        tanggal_pembayaran: pembayaran?.created_at
          ? new Date(pembayaran.created_at).toLocaleDateString("id-ID")
          : "-",
        tanggal_verifikasi: pembayaran?.verified_at
          ? new Date(pembayaran.verified_at).toLocaleDateString("id-ID")
          : "-",
      };
    });

    // Filter by type
    let filteredData = processedData;
    if (type === "lunas") {
      filteredData = processedData.filter(
        (p) => p.status_pembayaran === "Lunas / Terverifikasi",
      );
    } else if (type === "pending") {
      filteredData = processedData.filter(
        (p) =>
          p.status_pembayaran === "Menunggu Verifikasi" ||
          p.status_pembayaran === "Belum Bayar",
      );
    }

    // Generate Excel with premium styling
    if (format === "excel" || format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Pembayaran");

      worksheet.pageSetup.orientation = "landscape";
      worksheet.pageSetup.fitToPage = true;

      const brandColor = "800000";

      // Merged Title cell (17 columns)
      worksheet.mergeCells("A1:Q1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "LAPORAN PEMBAYARAN PPDB - PESANTREN AL-ANDALUS";
      titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: brandColor } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(1).height = 40;

      // Merged Subtitle cell
      worksheet.mergeCells("A2:Q2");
      const subtitleCell = worksheet.getCell("A2");
      subtitleCell.value = `Kategori: ${type.toUpperCase()} | Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")}`;
      subtitleCell.font = { name: "Arial", size: 11, italic: true };
      subtitleCell.alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(2).height = 20;

      // Empty gap row
      worksheet.addRow([]);

      const headers = [
        "No",
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
        "Tanggal Verifikasi"
      ];

      // Add Headers Row
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 30;

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: brandColor }
        };
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "medium" },
          right: { style: "thin" }
        };
      });

      // Add data rows with index
      filteredData.forEach((item, index) => {
        const rowValues = [
          index + 1,
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
          item.tanggal_verifikasi
        ];

        const r = worksheet.addRow(rowValues);
        r.height = 22;

        r.eachCell((cell, colIndex) => {
          cell.font = { name: "Arial", size: 9 };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
          };

          // Alignment logic
          if (
            colIndex === 1 || // No
            colIndex === 2 || // No. Pendaftaran
            colIndex === 5 || // Jenis Kelamin
            colIndex === 6 || // Jenjang
            colIndex === 11 || // Status Pendaftaran
            colIndex === 12 || // Tanggal Daftar
            colIndex === 15 || // Status Pembayaran
            colIndex === 16 || // Tanggal Pembayaran
            colIndex === 17    // Tanggal Verifikasi
          ) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else if (colIndex === 13) { // Jumlah Pembayaran
            cell.alignment = { vertical: "middle", horizontal: "right" };
            cell.numFmt = "#,##0";
          } else {
            cell.alignment = { vertical: "middle", horizontal: "left" };
          }
        });
      });

      // Auto-fit columns
      worksheet.columns.forEach((col, colIndex) => {
        let maxLen = 0;
        worksheet.eachRow((row, rowIndex) => {
          if (rowIndex > 4) {
            const val = row.getCell(colIndex + 1).value;
            if (val) {
              const len = val.toString().length;
              if (len > maxLen) maxLen = len;
            }
          }
        });
        col.width = Math.max(maxLen + 4, 12);
      });
      worksheet.getColumn(1).width = 6;
      worksheet.getColumn(3).width = 25;

      const buffer = await workbook.xlsx.writeBuffer();
      const filename = `pembayaran_ppdb_${type}_${new Date().toISOString().split("T")[0]}.xlsx`;

      return new NextResponse(buffer as any, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
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

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
