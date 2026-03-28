const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/images');
const files = fs.readdirSync(dir);

async function optimize() {
    console.log('Starting image optimization...');
    for (const file of files) {
        if (!/\.(png|jpg|jpeg|JPG|JPEG|PNG)$/i.test(file)) continue;

        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Threshold: 1MB
        if (stat.size > 1 * 1024 * 1024) {
            console.log(`Optimizing ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);

            try {
                const image = sharp(filePath);
                const metadata = await image.metadata();

                let pipeline = image;
                if (metadata.width > 2000) {
                    console.log(`  Resizing from ${metadata.width}px to 2000px...`);
                    pipeline = pipeline.resize({ width: 2000, withoutEnlargement: true });
                }

                if (metadata.format === 'png') {
                    // Use palette to reduce colors for PNGs, acting like lossy compression
                    // This is effective for photographs saved as PNG
                    pipeline = pipeline.png({ compressionLevel: 9, quality: 80, palette: true });
                } else if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
                }

                const outputBuffer = await pipeline.toBuffer();
                fs.writeFileSync(filePath, outputBuffer);

                const newStat = fs.statSync(filePath);
                console.log(`  Done. New size: ${(newStat.size / 1024 / 1024).toFixed(2)} MB`);
            } catch (e) {
                console.error(`  Failed to optimize ${file}:`, e);
            }
        }
    }
    console.log('Optimization complete.');
}

optimize();
