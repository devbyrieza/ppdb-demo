const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const projects = [
  'template-demo',
  'alandalus-ululalbaab',
  'alandalus-alimam'
];

async function optimizeImages() {
  console.log("🚀 Memulai Optimasi Massal Gambar...");

  for (const project of projects) {
    const dir = path.join(rootDir, project, 'public', 'images');
    if (!fs.existsSync(dir)) {
      continue;
    }

    console.log(`\n📂 Memeriksa folder: ${project}/public/images`);
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      const sizeKB = Math.round(stat.size / 1024);

      if (sizeKB > 200) {
        console.log(`   ⏳ Mengompres: ${file} (${sizeKB} KB)...`);
        
        try {
          const buffer = fs.readFileSync(filePath);
          const compressedBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer();
          
          fs.writeFileSync(filePath, compressedBuffer);
          
          const newStat = fs.statSync(filePath);
          const newSizeKB = Math.round(newStat.size / 1024);
          console.log(`   ✅ Selesai: ${file} (Turun dari ${sizeKB}KB menjadi ${newSizeKB}KB)`);
        } catch (error) {
          console.error(`   ❌ Gagal mengompres ${file}:`, error.message);
        }
      }
    }
  }
  
  console.log("\n🎉 Optimasi Selesai!");
}

optimizeImages();
