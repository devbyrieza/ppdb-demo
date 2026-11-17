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
        subTitle: `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })}`,
        header,
        data: rows },
    ] });
};


/**
 * Professional Export to Excel using ExcelJS
 * Supports multiple sheets, styling, and merging
 */
export const exportToExcelProfessional = async ({
  fileName,
  sheets }: {
  fileName: string;
  sheets: {
    name: string;
    header: string[];
    subHeader?: string[]; // For merged headers
    data: any[][];
    title?: string;
    subTitle?: string;
    centeredColumns?: number[]; // Array of 1-based column indices to center align
  }[];
}) => {
  const workbook = new ExcelJS.Workbook();
  const usedSheetNames = new Set<string>();

  for (let sIdx = 0; sIdx < sheets.length; sIdx++) {
    const sheetInfo = sheets[sIdx];

    // Sanitize sheet name: Excel forbids \ / ? * : [ ] and max 31 chars
    let cleanName = (sheetInfo.name || `Sheet${sIdx + 1}`)
      .replace(/[\*\?\:\\\/\[\]]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleanName) cleanName = `Sheet${sIdx + 1}`;
    cleanName = cleanName.substring(0, 31);

    // Ensure unique sheet name within workbook (case-insensitive)
    let uniqueName = cleanName;
    let counter = 1;
    while (usedSheetNames.has(uniqueName.toLowerCase())) {
      const suffix = ` (${counter})`;
      uniqueName = `${cleanName.substring(0, 31 - suffix.length)}${suffix}`;
      counter++;
    }
    usedSheetNames.add(uniqueName.toLowerCase());

    const worksheet = workbook.addWorksheet(uniqueName);
    let currentRow = 1;

    const brandColor = (BRANDING?.primaryColor || "#0977E6").replace("#", "");

    // Title
    if (sheetInfo.title) {
      const titleRow = worksheet.getRow(currentRow);
      titleRow.height = 40;
      const colSpan = Math.max(sheetInfo.header?.length || 1, 1);
      worksheet.mergeCells(currentRow, 1, currentRow, colSpan);
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
      const colSpan = Math.max(sheetInfo.header?.length || 1, 1);
      worksheet.mergeCells(currentRow, 1, currentRow, colSpan);
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

    // Auto-width columns with intelligent wrapping and padding
    const wrapColumns = new Set<number>();
    sheetInfo.header.forEach((h, i) => {
      const colIndex = i + 1;
      const headerStr = (h || "").toString();
      let maxLen = headerStr.length;
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
      // Bold headers need ~35% extra optical space in Excel
      const minHeaderWidth = Math.ceil(headerStr.length * 1.35) + 4;
      let calculatedWidth = Math.max(maxLen + 5, minHeaderWidth, 14);

      const lower = headerStr.toLowerCase();
      if (lower.includes("total") || lower.includes("skor") || lower.includes("score")) {
        calculatedWidth = Math.max(calculatedWidth, 16);
      } else if (lower.includes("catatan") || lower.includes("komentar")) {
        calculatedWidth = Math.min(Math.max(calculatedWidth, 42), 70);
        wrapColumns.add(colIndex);
      } else if (lower.includes("nama") || lower.includes("penguji") || lower.includes("pewawancara")) {
        calculatedWidth = Math.max(calculatedWidth, 26);
      } else if (lower.includes("rekomendasi") || lower.includes("keputusan")) {
        calculatedWidth = Math.max(calculatedWidth, 38);
        wrapColumns.add(colIndex);
      } else if (lower.includes("daftar") || lower.includes("pendaftaran")) {
        calculatedWidth = Math.max(calculatedWidth, 18);
      }

      column.width = calculatedWidth;
    });

    // Style data cells & calculate dynamic row heights for multiline text
    const lastRow = currentRow + sheetInfo.data.length - 1;
    for (let r = currentRow; r <= lastRow; r++) {
      const row = worksheet.getRow(r);
      let maxLinesInRow = 1;

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
        const valStr = val != null ? val.toString() : "";
        const isWrapCol = wrapColumns.has(colIndex);

        if (isWrapCol && valStr.trim().length > 0 && valStr.trim() !== "-") {
          const colWidth = worksheet.getColumn(colIndex).width || 42;
          const charLimitPerLine = Math.max(25, Math.floor(colWidth * 0.85));
          const lines = valStr.split("\n").reduce((acc, part) => {
            return acc + Math.max(1, Math.ceil(part.length / charLimitPerLine));
          }, 0);
          if (lines > maxLinesInRow) maxLinesInRow = lines;

          cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
        } else if (sheetInfo.centeredColumns && sheetInfo.centeredColumns.includes(colIndex)) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else if (typeof val === "number") {
          cell.alignment = { vertical: "middle", horizontal: "right" };
          cell.numFmt = "#,##0";
        } else if (
          colIndex === 1 || // No
          colIndex === 2 || // No. Pendaftaran
          (val && typeof val === "string" && (
            val.trim().startsWith("MTI") || 
            val.trim().startsWith("ILI") || 
            val.trim().startsWith("MAI") || 
            val.trim().startsWith("MTA") || 
            val.trim().startsWith("ILA") ||
            val.trim().toLowerCase() === "laki-laki" || 
            val.trim().toLowerCase() === "perempuan" ||
            val.trim().toLowerCase() === "l" || 
            val.trim().toLowerCase() === "p" ||
            val.trim().toLowerCase() === "s" ||
            val.trim().toLowerCase() === "m" ||
            val.trim().toLowerCase() === "xl" ||
            val.trim().toLowerCase() === "xxl" ||
            val.trim().toLowerCase() === "3xl" ||
            val.trim().toLowerCase() === "tk" ||
            val.trim().toLowerCase() === "sd" ||
            val.trim().toLowerCase() === "mi" ||
            val.trim().toLowerCase() === "smp" ||
            val.trim().toLowerCase() === "mts" ||
            val.trim().toLowerCase() === "sma" ||
            val.trim().toLowerCase() === "ma" ||
            val.trim().toLowerCase() === "il" ||
            val.trim() === "-"
          ))
        ) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        }
      });

      // Set dynamic row height
      if (maxLinesInRow > 1) {
        row.height = Math.max(26, maxLinesInRow * 17 + 8);
      } else {
        row.height = 24;
      }
    }
  }

  // Generate Buffer & trigger safe browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const safeFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  anchor.download = safeFileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => window.URL.revokeObjectURL(url), 3000);
};

export interface PDFDetailTable {
  title: string;
  columns: string[];
  data: any[][];
}

/**
 * Export data to PDF file
 * @param title Title of the document
 * @param columns Array of column headers
 * @param data Array of arrays containing row data
 * @param fileName Name of the file (without extension)
 * @param orientation 'portrait' or 'landscape'
 * @param detailTable Optional second table (e.g. Catatan Penguji Rapat Pleno)
 */
export const exportToPDF = (
  title: string,
  columns: string[],
  data: any[][],
  fileName: string,
  orientation: "portrait" | "landscape" = "landscape",
  detailTable?: PDFDetailTable,
) => {
  const doc = new jsPDF({
    orientation: orientation,
    unit: "mm",
    format: "a4" });

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
    margin: { top: 35, bottom: 20 },
    styles: { 
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
      font: 'helvetica'
    },
    headStyles: { 
      fillColor: [12, 94, 43], // Darker professional green
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: { 
      fillColor: [245, 250, 245] 
    },
    columnStyles: {
      0: { halign: 'center' } // Align 'No' to center
    },
    didDrawPage: (data) => {
      // Footer
      const str = "Halaman " + (doc.internal as any).getNumberOfPages();
      doc.setFontSize(8);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, data.settings.margin.left, pageHeight - 10);
    }
  });

  // Optional Section 2: Detail Table (e.g. Catatan Penguji Rapat Pleno)
  if (detailTable && detailTable.data.length > 0) {
    doc.addPage("a4", orientation);
    doc.setFontSize(16);
    doc.text(detailTable.title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 29);

    autoTable(doc, {
      head: [detailTable.columns],
      body: detailTable.data,
      startY: 34,
      margin: { top: 34, bottom: 20 },
      styles: { 
        fontSize: 7.5,
        cellPadding: 2.5,
        valign: 'top',
        font: 'helvetica'
      },
      headStyles: { 
        fillColor: [12, 94, 43],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { 
        fillColor: [245, 250, 245] 
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 24 },
        2: { cellWidth: 32 },
      },
      didDrawPage: (data) => {
        const str = "Halaman " + (doc.internal as any).getNumberOfPages();
        doc.setFontSize(8);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });
  }

  doc.save(`${fileName}.pdf`);
};
