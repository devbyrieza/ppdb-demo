const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/itpua/Dev/Work/al-andalus/template-demo/src/app';

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && name === 'page.tsx') {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

walkSync(dir, function(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Apply Form Autosave
    if (content.includes('useForm(') && !content.includes('localStorage.getItem(')) {
        console.log('Needs autosave:', filePath);
        // We will just mark it for now to see which ones need it
    }

    // Apply Color Harmonization
    // Replace hardcoded primary/emerald badges with diverse ones based on a simple logic
    // Just identifying which files have forms or old container classes
    if (content.includes('p-4') || content.includes('max-w-7xl') || content.includes('bg-primary-500 text-white px-2 py-1')) {
        console.log('Needs UI upgrade:', filePath);
    }
});
