
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the worksheet
 */
export const exportToExcel = (
    data: any[],
    fileName: string,
    sheetName: string = "Data"
) => {
    console.log("Starting export to Excel... (Build: " + process.env.NEXT_BUILD_ID + ")");
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
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
    orientation: "portrait" | "landscape" = "landscape"
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
    });

    doc.save(`${fileName}.pdf`);
};
