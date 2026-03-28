
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve('REKAP HASIL TES.xlsx');

try {
    const workbook = XLSX.readFile(filePath);

    // 1. Get Scores from 'Akademik' Sheet
    const academicSheet = workbook.Sheets['Akademik'];
    const academicData = XLSX.utils.sheet_to_json(academicSheet);

    // Map Name -> Score (Numeric)
    // "Score" column format is usually "20 / 100" or just "20"
    const scoreMap = {};
    academicData.forEach(row => {
        const name = row['Nama Lengkap'] ? row['Nama Lengkap'].toUpperCase().trim() : '';
        let scoreRaw = row['Score'];
        if (scoreRaw) {
            // Handle "20 / 100" format
            let scoreNum = 0;
            if (typeof scoreRaw === 'string' && scoreRaw.includes('/')) {
                scoreNum = parseInt(scoreRaw.split('/')[0].trim());
            } else {
                scoreNum = parseInt(scoreRaw);
            }
            if (name) scoreMap[name] = scoreNum;
        }
    });

    console.log(`Found ${Object.keys(scoreMap).length} academic scores.`);

    // 2. Get Grades from 'SMA' Sheet (and potentially IL/MTs if they exist)
    // 'SMA' Row 0: ["NP","Nama","Jenjang","Al-Quran","Akademik","Kepribadian","Kesesuaian","Kesiapan"]
    const smaSheet = workbook.Sheets['SMA'];
    const smaData = XLSX.utils.sheet_to_json(smaSheet);

    // Correlate Score -> Grade
    const correlations = [];
    smaData.forEach(row => {
        const name = row['Nama'] ? row['Nama'].toUpperCase().trim() : '';
        const grade = row['Akademik']; // "A", "B", "C"...
        if (name && grade && scoreMap[name] !== undefined) {
            correlations.push({ score: scoreMap[name], grade });
        }
    });

    // 3. Analyze Ranges
    // Group scores by Grade
    const ranges = { 'A': [], 'B': [], 'C': [], 'D': [], 'E': [] };
    correlations.forEach(item => {
        if (ranges[item.grade]) ranges[item.grade].push(item.score);
    });

    console.log("\n--- Score to Grade Correlation ---");
    for (const [grade, scores] of Object.entries(ranges)) {
        if (scores.length > 0) {
            const min = Math.min(...scores);
            const max = Math.max(...scores);
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            console.log(`Grade ${grade}: Min ${min}, Max ${max}, Count ${scores.length}`);
        }
    }

} catch (error) {
    console.error(`Error: ${error.message}`);
}
