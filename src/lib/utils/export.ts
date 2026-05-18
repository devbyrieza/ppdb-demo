import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the worksheet
 */
export const exportToExcel = (
  data: any[],
  fileName: string,
  sheetName: string = "Data",
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set professional auto-fit column widths to prevent truncation
  if (data && data.length > 0) {
    const keys = Object.keys(data[0]);
    const wscols = keys.map((key) => {
      const maxLength = data.reduce((max, row) => {
        const val = row[key] !== undefined && row[key] !== null ? row[key].toString() : "";
        return Math.max(max, val.length);
      }, key.length);
      // Extra safety margin of 4 characters and minimum width of 12
      return { wch: Math.max(maxLength + 4, 12) };
    });
    worksheet["!cols"] = wscols;
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
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

    // Title
    if (sheetInfo.title) {
      const titleRow = worksheet.getRow(currentRow);
      titleRow.values = [sheetInfo.title];
      titleRow.font = { size: 16, bold: true };
      worksheet.mergeCells(currentRow, 1, currentRow, sheetInfo.header.length);
      currentRow += 1;
    }

    // SubTitle
    if (sheetInfo.subTitle) {
      const subTitleRow = worksheet.getRow(currentRow);
      subTitleRow.values = [sheetInfo.subTitle];
      subTitleRow.font = { size: 12, italic: true };
      worksheet.mergeCells(currentRow, 1, currentRow, sheetInfo.header.length);
      currentRow += 2; // Extra gap
    }

    // Header
    const headerRow = worksheet.getRow(currentRow);
    headerRow.values = sheetInfo.header;
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF16A34A" }, // Green-600
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Auto-width columns
    sheetInfo.header.forEach((h, i) => {
      const column = worksheet.getColumn(i + 1);
      column.width = Math.max(h.length + 5, 15);
    });

    currentRow += 1;

    // SubHeader (Optional for specific structures)
    if (sheetInfo.subHeader) {
      const subHeaderRow = worksheet.getRow(currentRow);
      subHeaderRow.values = sheetInfo.subHeader;
      subHeaderRow.font = { bold: true };
      subHeaderRow.alignment = { horizontal: "center" };
      currentRow += 1;
    }

    // Data
    worksheet.addRows(sheetInfo.data);

    // Add Borders to all data cells
    const lastRow = currentRow + sheetInfo.data.length - 1;
    for (
      let r = currentRow - (sheetInfo.subHeader ? 2 : 1);
      r <= lastRow;
      r++
    ) {
      const row = worksheet.getRow(r);
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
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
