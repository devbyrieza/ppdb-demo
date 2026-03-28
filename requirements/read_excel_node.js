
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve('REKAP HASIL TES.xlsx');
console.log(`Reading file: ${filePath}`);

try {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log(`Sheet Names: ${sheetNames.join(', ')}`);

    sheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        // Convert to JSON (first 5 rows)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, defval: '' });

        // Print header and first 5 rows
        const rowsToShow = jsonData.slice(0, 6);
        rowsToShow.forEach((row, index) => {
            console.log(`Row ${index}: ${JSON.stringify(row)}`);
        });

    });

} catch (error) {
    console.error(`Error reading Excel file: ${error.message}`);
}
