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

      const cleanVal = (val: any) => {
        if (val === null || val === undefined) return "";
        const str = String(val).trim();
        return (str === "-" || str === "") ? "" : str;
      };

      const isMeninggal = (status: any) => {
        if (!status) return false;
        const s = String(status).toLowerCase();
        return s.includes("meninggal") || s.includes("wafat") || s.includes("almarhum");
      };

      const getCleanPhone = (phones: any[]) => {
        for (const ph of phones) {
          const clean = cleanVal(ph);
          if (clean && clean !== "0" && clean !== "+62" && clean !== "62") {
            return clean;
          }
        }
        return "";
      };

      const isAyahMeninggal = isMeninggal(ayah.status_hidup) || isMeninggal(ot.status_ayah);
      const isIbuMeninggal = isMeninggal(ibu.status_hidup) || isMeninggal(ot.status_ibu);

      let nama_ayah = cleanVal(ot.nama_ayah) || cleanVal(ayah.nama_lengkap) || "-";
      if (isAyahMeninggal) {
        nama_ayah = nama_ayah !== "-" ? `${nama_ayah} (Sudah Meninggal)` : "Sudah Meninggal";
      }
      const pekerjaan_ayah = isAyahMeninggal ? "Sudah Meninggal" : (cleanVal(ot.pekerjaan_ayah) || cleanVal(ayah.pekerjaan) || "-");
      const hp_ayah = isAyahMeninggal ? "Sudah Meninggal" : (getCleanPhone([ot.no_hp_ayah, ayah.no_hp, ayah.no_wa]) || "-");

      let nama_ibu = cleanVal(ot.nama_ibu) || cleanVal(ibu.nama_lengkap) || "-";
      if (isIbuMeninggal) {
        nama_ibu = nama_ibu !== "-" ? `${nama_ibu} (Sudah Meninggal)` : "Sudah Meninggal";
      }
      const pekerjaan_ibu = isIbuMeninggal ? "Sudah Meninggal" : (cleanVal(ot.pekerjaan_ibu) || cleanVal(ibu.pekerjaan) || "-");
      const hp_ibu = isIbuMeninggal ? "Sudah Meninggal" : (getCleanPhone([ot.no_hp_ibu, ibu.no_hp, ibu.no_wa]) || "-");

      return {
        nik: cleanVal(p?.nik) || cleanVal(santri.nik) || "-",
        phone_santri: getCleanPhone([p?.no_hp, santri.no_hp, santri.phone]) || "-",
        nama_ayah,
        pekerjaan_ayah,
        hp_ayah,
        nama_ibu,
        pekerjaan_ibu,
        hp_ibu,
        status_kelulusan: p?.hasil_seleksi?.status_seleksi || p?.status_pendaftaran || "DITERIMA"
      };
    };

    const translateStatus = (status: string) => {
      if (!status) return "-";
      const s = status.toLowerCase().trim();
      const statusMap: Record<string, string> = {
        draft: "Draft",
        awaiting_payment: "Draft (Menunggu Pembayaran)",
        payment_verification: "Menunggu Verifikasi Bayar",
        paid: "Terdaftar (Menunggu Berkas)",
        verified: "Terdaftar (Menunggu Berkas)",
        data_completed: "Data Lengkap (Menunggu Dokumen)",
        docs_uploaded: "Dokumen Diunggah (Menunggu Verifikasi)",
        docs_verified: "Berkas Terverifikasi",
        scheduled: "Jadwal Ujian Ditentukan",
        testing: "Sedang Ujian",
        tested: "Selesai Ujian",
        exam_completed: "Selesai Seleksi",
        announced: "Cadangan",
        cadangan: "Cadangan",
        accepted: "Diterima",
        rejected: "Ditolak",
        mengundurkan_diri: "Mengundurkan Diri",
        enrolled: "Sudah Daftar Ulang",
        enrolled_full: "Lunas Daftar Ulang",
      };
      return statusMap[s] || status.toUpperCase();
    };

    const buildSheet = (sheetName: string, dataList: typeof listBeasiswa, discountValue: number) => {
      const sheet = workbook.addWorksheet(sheetName);

      sheet.pageSetup.orientation = "landscape";
      sheet.pageSetup.fitToPage = true;

      const headerColor = "800000";
      const headerTextColor = "FFFFFF";

      sheet.mergeCells("A1:S1");
      const titleCell = sheet.getCell("A1");
      titleCell.value = `LAPORAN PENERIMA ${sheetName.toUpperCase()} - PESANTREN AL-ANDALUS`;
      titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: headerColor } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      sheet.getRow(1).height = 40;

      sheet.mergeCells("A2:S2");
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
        "Potongan Uang Pangkal", "Potongan SPP", "Total Potongan",
        "Sisa Uang Pangkal", "Sisa SPP", "Total Sisa Tagihan",
        "Status"
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
        
        let dl: any = {};
        if (p?.data_lengkap) {
          if (typeof p.data_lengkap === "string") {
            try { dl = JSON.parse(p.data_lengkap); } catch (e) { dl = {}; }
          } else {
            dl = p.data_lengkap;
          }
        }
        
        const keringananJson = dl.keringanan_daftar_ulang || {};
        
        let potUP = 0;
        let potSPP = 0;
        let isParsed = false;
        
        if (keringananJson.jenis_bantuan) {
          const cakupan = keringananJson.cakupan || "KEDUANYA";
          if (keringananJson.jenis_bantuan === "BEASISWA") {
            potUP = (cakupan === "UANG_PANGKAL" || cakupan === "KEDUANYA") ? 7500000 : 0;
            potSPP = (cakupan === "SPP" || cakupan === "KEDUANYA") ? 1000000 : 0;
          } else { // KERINGANAN
            potUP = Number(keringananJson.potongan_uang_pangkal || 0);
            potSPP = Number(keringananJson.potongan_spp || 0);
          }
          isParsed = true;
        }
        
        if (!isParsed) {
          if (item.jenis_pengajuan === "BEASISWA_PRESTASI") {
            potUP = 7500000;
            potSPP = 1000000;
          } else {
            const legacyNominal = Number(keringananJson.nominal_potongan ?? item.nominal_potongan ?? discountValue);
            potUP = legacyNominal;
            potSPP = 0;
          }
        }
        
        const totalPotongan = potUP + potSPP;
        const sisaUP = Math.max(0, 7500000 - potUP);
        const sisaSPP = Math.max(0, 1000000 - potSPP);
        const totalSisa = sisaUP + sisaSPP;

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
          potUP,
          potSPP,
          totalPotongan,
          sisaUP,
          sisaSPP,
          totalSisa,
          translateStatus(info.status_kelulusan)
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

          if (colIndex === 1 || colIndex === 2 || colIndex === 5 || colIndex === 19) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          } else if (colIndex >= 13 && colIndex <= 18) {
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
