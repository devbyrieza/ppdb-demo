import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allowedRoles = ["admin_super", "admin", "admin_keuangan"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const listBeasiswa = await prisma.pengajuanBeasiswa.findMany({
      where: {
        status: "DISETUJUI"
      },
      include: {
        pendaftar: {
          include: {
            orang_tua: true,
            hasil_seleksi: true
          }
        }
      },
      orderBy: {
        created_at: "asc"
      }
    });

    const beasiswaFull = listBeasiswa.filter(item => item.jenis_pengajuan === "BEASISWA_PRESTASI");
    const keringananPotongan = listBeasiswa.filter(item => item.jenis_pengajuan === "KERINGANAN_BIAYA");

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PPDB Al-Andalus";
    workbook.created = new Date();

    const normalTotal = 8500000;

    const getParentInfo = (item: any) => {
      const p = item.pendaftar;
      const ot = p?.orang_tua || {};
      
      let dl: any = {};
      if (p?.data_lengkap) {
        if (typeof p.data_lengkap === "string") {
          try { dl = JSON.parse(p.data_lengkap); } catch (e) { dl = {}; }
        } else {
          dl = p.data_lengkap;
        }
      }

      const ayah = dl.ayah || {};
      const ibu = dl.ibu || {};
      const santri = dl.santri || {};

      return {
        nik: p?.nik || santri.nik || "-",
        phone_santri: p?.no_hp || santri.no_hp || santri.phone || "-",
        nama_ayah: ot.nama_ayah || ayah.nama_lengkap || "-",
        pekerjaan_ayah: ot.pekerjaan_ayah || ayah.pekerjaan || "-",
        hp_ayah: ot.no_hp_ayah || ayah.no_hp || ayah.no_wa || "-",
        nama_ibu: ot.nama_ibu || ibu.nama_lengkap || "-",
        pekerjaan_ibu: ot.pekerjaan_ibu || ibu.pekerjaan || "-",
        hp_ibu: ot.no_hp_ibu || ibu.no_hp || ibu.no_wa || "-",
        status_kelulusan: p?.hasil_seleksi?.status_seleksi || p?.status_pendaftaran || "DITERIMA"
      };
    };

    const buildSheet = (sheetName: string, dataList: typeof listBeasiswa, discountValue: number) => {
      const sheet = workbook.addWorksheet(sheetName);

      sheet.pageSetup.orientation = "landscape";
      sheet.pageSetup.fitToPage = true;

      const headerColor = "800000";
      const headerTextColor = "FFFFFF";

      sheet.mergeCells("A1:O1");
      const titleCell = sheet.getCell("A1");
      titleCell.value = `LAPORAN PENERIMA ${sheetName.toUpperCase()} - PESANTREN AL-ANDALUS`;
      titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: headerColor } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      sheet.getRow(1).height = 40;

      sheet.mergeCells("A2:O2");
      const subtitleCell = sheet.getCell("A2");
      subtitleCell.value = `Tahun Ajaran: 2026/2027 | Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")}`;
      subtitleCell.font = { name: "Arial", size: 11, italic: true };
      subtitleCell.alignment = { vertical: "middle", horizontal: "center" };
      sheet.getRow(2).height = 20;

      sheet.addRow([]);

      const headers = [
        "No", "No. Pendaftaran", "NIK Santri", "Nama Santri", "Jenjang", "No. HP Santri",
        "Nama Ayah", "Pekerjaan Ayah", "No. HP Ayah",
        "Nama Ibu", "Pekerjaan Ibu", "No. HP Ibu",
        "Nominal Potongan", "Sisa Tagihan", "Status"
      ];

      const headerRow = sheet.addRow(headers);
      headerRow.height = 30;

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: headerColor }
        };
        cell.font = { name: "Arial", size: 10, bold: true, color: { argb: headerTextColor } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "medium" },
          right: { style: "thin" }
        };
      });

      dataList.forEach((item, index) => {
        const p = item.pendaftar;
        const info = getParentInfo(item);
        const pot = Number(item.nominal_potongan) || discountValue;
        const sisa = normalTotal - pot;

        const rowValues = [
          index + 1,
          p?.nomor_pendaftaran || "-",
          info.nik,
          p?.nama_lengkap || "-",
          p?.jenjang || "-",
          info.phone_santri,
          info.nama_ayah,
          info.pekerjaan_ayah,
          info.hp_ayah,
          info.nama_ibu,
          info.pekerjaan_ibu,
          info.hp_ibu,
          pot,
          sisa,
          info.status_kelulusan.replace("_", " ").toUpperCase()
        ];

        const r = sheet.addRow(rowValues);
        r.height = 22;

        r.eachCell((cell, colIndex) => {
          cell.font = { name: "Arial", size: 9 };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
          };

          if (colIndex === 1 || colIndex === 2 || colIndex === 5 || colIndex === 15) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else if (colIndex === 13 || colIndex === 14) {
            cell.alignment = { vertical: "middle", horizontal: "right" };
            cell.numFmt = "#,##0";
          } else {
            cell.alignment = { vertical: "middle", horizontal: "left" };
          }
        });
      });

      sheet.columns.forEach((col, colIndex) => {
        let maxLen = 0;
        sheet.eachRow((row, rowIndex) => {
          if (rowIndex > 3) {
            const val = row.getCell(colIndex + 1).value;
            if (val) {
              const len = val.toString().length;
              if (len > maxLen) maxLen = len;
            }
          }
        });
        col.width = Math.max(maxLen + 4, 12);
      });
      sheet.getColumn(1).width = 5;
      sheet.getColumn(4).width = 25;
      sheet.getColumn(7).width = 22;
      sheet.getColumn(10).width = 22;
    };

    buildSheet("Beasiswa Full", beasiswaFull, 7500000);
    buildSheet("Keringanan Potongan", keringananPotongan, 1500000);

    const buffer = await workbook.xlsx.writeBuffer();

    logAdminAction({
      action: "EXPORT_BEASISWA" as any,
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: "all",
      targetName: "Scholarship Students",
      details: { count: listBeasiswa.length }
    });

    const response = new NextResponse(buffer);
    response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.headers.set("Content-Disposition", "attachment; filename=Laporan_Beasiswa_dan_Keringanan_Lazsip.xlsx");

    return response;
  } catch (error: any) {
    console.error("GET export beasiswa error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat membuat laporan" }, { status: 500 });
  }
}
