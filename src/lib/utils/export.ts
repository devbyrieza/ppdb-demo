import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { BRANDING } from "@/config/branding";

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the worksheet
 */
export const exportToExcel = async (
  data: any[],
  fileName: string,
  sheetName: string = "Data",
) => {
  if (!data || data.length === 0) return;
  const header = Object.keys(data[0] || {});
  const rows = data.map((item) => Object.values(item));

  await exportToExcelProfessional({
    fileName,
    sheets: [
      {
        name: sheetName.substring(0, 31),
        title: sheetName,
        subTitle: `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")}`,
        header,
        data: rows,
      },
    ],
  });
};


/**
 * Professional Export to Excel using ExcelJS
 * Supports multiple sheets, styling, and merging
 */
export const exportToExcelProfessional = async ({
  fileName,
  sheets,
}: {
  fileName: string;
  sheets: {
    name: string;
    header: string[];
    subHeader?: string[]; // For merged headers
    data: any[][];
    title?: string;
    subTitle?: string;
  }[];
}) => {
  const workbook = new ExcelJS.Workbook();

  for (const sheetInfo of sheets) {
    const worksheet = workbook.addWorksheet(sheetInfo.name);
    let currentRow = 1;

    const brandColor = BRANDING.primaryColor.replace("#", "");

    // Title
    if (sheetInfo.title) {
      const titleRow = worksheet.getRow(currentRow);
      titleRow.height = 40;
      worksheet.mergeCells(currentRow, 1, currentRow, sheetInfo.header.length);
      const titleCell = worksheet.getCell(currentRow, 1);
      titleCell.value = sheetInfo.title.toUpperCase();
      titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: brandColor } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      currentRow += 1;
    }

    // SubTitle
    if (sheetInfo.subTitle) {
      const subTitleRow = worksheet.getRow(currentRow);
      subTitleRow.height = 20;
      worksheet.mergeCells(currentRow, 1, currentRow, sheetInfo.header.length);
      const subTitleCell = worksheet.getCell(currentRow, 1);
      subTitleCell.value = sheetInfo.subTitle;
      subTitleCell.font = { name: "Arial", size: 11, italic: true };
      subTitleCell.alignment = { vertical: "middle", horizontal: "center" };
      currentRow += 2; // Extra gap
    } else {
      currentRow += 1;
    }

    // Header
    const headerRow = worksheet.getRow(currentRow);
    headerRow.height = 30;
    headerRow.values = sheetInfo.header;
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

    currentRow += 1;

    // SubHeader (Optional for specific structures)
    if (sheetInfo.subHeader) {
      const subHeaderRow = worksheet.getRow(currentRow);
      subHeaderRow.values = sheetInfo.subHeader;
      subHeaderRow.font = { name: "Arial", bold: true };
      subHeaderRow.alignment = { vertical: "middle", horizontal: "center" };
      currentRow += 1;
    }

    // Data
    worksheet.addRows(sheetInfo.data);

    // Style data cells
    const lastRow = currentRow + sheetInfo.data.length - 1;
    for (let r = currentRow; r <= lastRow; r++) {
      const row = worksheet.getRow(r);
      row.height = 22;
      row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
        cell.font = { name: "Arial", size: 9 };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };

        // Auto align values
        const val = cell.value;
        if (typeof val === "number") {
          cell.alignment = { vertical: "middle", horizontal: "right" };
          cell.numFmt = "#,##0";
        } else if (
          colIndex === 1 || // No
          colIndex === 2 || // No. Pendaftaran
          (val && typeof val === "string" && (
            val.startsWith("MTA26") || 
            val.startsWith("ILA26") ||
            val.toLowerCase() === "laki-laki" || 
            val.toLowerCase() === "perempuan" ||
            val.toLowerCase() === "l" || 
            val.toLowerCase() === "p"
          ))
        ) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        }
      });
    }

    // Auto-width columns
    sheetInfo.header.forEach((h, i) => {
      const colIndex = i + 1;
      let maxLen = h.length;
      worksheet.eachRow((row, rowIndex) => {
        if (rowIndex >= currentRow) {
          const val = row.getCell(colIndex).value;
          if (val) {
            const len = val.toString().length;
            if (len > maxLen) maxLen = len;
          }
        }
      });
      const column = worksheet.getColumn(colIndex);
      column.width = Math.max(maxLen + 4, 12);
    });
  }

  // Generate Buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileName}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Export data to PDF file
 * @param title Title of the document
 * @param columns Array of column headers
 * @param data Array of arrays containing row data
 * @param fileName Name of the file (without extension)
 * @param orientation 'portrait' or 'landscape'
 */
export const exportToPDF = (
  title: string,
  columns: string[],
  data: any[][],
  fileName: string,
  orientation: "portrait" | "landscape" = "landscape",
) => {
  const doc = new jsPDF({
    orientation: orientation,
    unit: "mm",
    format: "a4",
  });

  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 30);

  // Table
  autoTable(doc, {
    head: [columns],
    body: data,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 163, 74] }, // Green-600 to match branding
    alternateRowStyles: { fillColor: [240, 253, 244] }, // Light green
  });

  doc.save(`${fileName}.pdf`);
};
