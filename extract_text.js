const fs = require('fs');
const JSZip = require('./node_modules/jszip/dist/jszip.js');

const buf = fs.readFileSync('Draft_KKS_PPDB_2026.docx');
JSZip.loadAsync(buf).then(zip => {
    return zip.file('word/document.xml').async('string');
}).then(xml => {
    // Strip XML tags to get raw text
    const text = xml.replace(/<w:p[^>]*>/g, '\n').replace(/<[^>]+>/g, '').trim();
    fs.writeFileSync('kks_text.txt', text);
    console.log('Teks berhasil diekstrak.');
});
