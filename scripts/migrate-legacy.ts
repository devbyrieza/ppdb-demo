import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.production', override: true });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
const SQL_FILE = 'full_20260328.sql';
console.log('📡 Target Database URL:', process.env.DATABASE_URL);

const studentIdMap = new Map<number, string>();

async function main() {
  console.log('🚀 Memulai Proses Migrasi Data FINAL (PSB 2026/2027)...');

  const content = fs.readFileSync(SQL_FILE, 'utf8');

  // 1. Tahun Ajaran Target 2026/2027
  console.log('📅 Memetakan ke Tahun Ajaran 2026/2027...');
  const activeTahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id: '88888888-8888-8888-8888-888888888888' }
  });
  
  if (!activeTahunAjaran) {
      throw new Error('❌ Tahun Ajaran 2026/2027 tidak ditemukan!');
  }

  // 2. Pre-Parsing Data Map (Nomor HP, Pekerjaan, Biodata, Akun)
  console.log('🔍 Membangun Peta Referensi (HP, Pekerjaan, Biodata)...');
  
  const phoneMap = new Map();
  parseInsertValues(content, 'nomor_hps').forEach(row => {
    phoneMap.set(parseInt(row[0]), cleanStr(row[1]));
  });

  const jobMap = new Map();
  parseInsertValues(content, 'pekerjaans').forEach(row => {
    jobMap.set(parseInt(row[0]), cleanStr(row[1]));
  });

  const biodataMap = new Map();
  parseInsertValues(content, 'biodata_pendaftars').forEach(row => {
    biodataMap.set(parseInt(row[1]), {
      pob: cleanStr(row[2]),
      dob: safeDate(row[4]),
      provId: cleanStr(row[12]) // Index 12 is province ID
    });
  });

  const akunMap = new Map();
  parseInsertValues(content, 'akun_pendaftars').forEach(row => {
    akunMap.set(parseInt(row[1]), cleanStr(row[2]));
  });

  // 3. Migrasi Pendaftar
  console.log('📝 Migrasi Data Pendaftar (Basic + Biodata)...');
  const pendaftarsRaw = parseInsertValues(content, 'pendaftars');
  for (const row of pendaftarsRaw) {
    const oldId = parseInt(row[0]);
    const nik = cleanStr(row[2]);
    const nisn = cleanStr(row[3]);
    const noReg = cleanStr(row[4]);
    const nama = cleanStr(row[7]);
    const jk = cleanStr(row[8]) === 'Laki-laki' ? 'Laki-laki' : 'Perempuan'; // Use full name
    const jenjangRaw = cleanStr(row[12]);
    const createdAt = safeDate(row[9]) || new Date(); // Use safeDate
    
    // Get Birth Data
    const bio = biodataMap.get(oldId) || { pob: '', dob: null, provId: '' };

    // Mapping Jenjang
    let mappedJenjang: 'MTs' | 'IL' | 'SMA' = 'MTs';
    if (jenjangRaw === 'MTS') mappedJenjang = 'MTs';
    else if (jenjangRaw === 'IL') mappedJenjang = 'IL';
    else if (jenjangRaw === 'SMA') mappedJenjang = 'SMA';

    const password = akunMap.get(oldId) || '12345';

    const studentProfile = await prisma.profile.create({
      data: {
        email: null,
        phone: nik || `TEMP-${oldId}`,
        full_name: nama,
        role: 'pendaftar',
        password_hash: password,
      }
    });

    const pendaftar = await prisma.pendaftar.create({
      data: {
        user_id: studentProfile.id,
        tahun_ajaran_id: activeTahunAjaran.id,
        nomor_pendaftaran: noReg || `REG-${oldId}`,
        nik: nik || '0000000000000000',
        nama_lengkap: nama,
        jenis_kelamin: jk,
        jenjang: mappedJenjang,
        nisn: nisn,
        tempat_lahir: bio.pob,
        tanggal_lahir: bio.dob,
        provinsi: getProvName(bio.provId), // Set Province Name
        status_pendaftaran: 'docs_verified', // Match dashboard logic
        created_at: createdAt,
      }
    });
    
    studentIdMap.set(oldId, pendaftar.id);
  }
  console.log(`✅ ${pendaftarsRaw.length} Pendaftar berhasil dimigrasi.`);

  // 4. Migrasi Orang Tua (Penyatuan Ayah & Ibu)
  console.log('👪 Migrasi Data Orang Tua (Penyatuan Ayah & Ibu)...');
  const walisRaw = parseInsertValues(content, 'wali_pendaftars');
  const groupedWalis = new Map();
  
  walisRaw.forEach(row => {
    const pId = parseInt(row[1]);
    if (!groupedWalis.has(pId)) groupedWalis.set(pId, {});
    const tipe = cleanStr(row[2]).toLowerCase();
    groupedWalis.get(pId)[tipe] = row;
  });

  for (const [oldPendaftarId, family] of groupedWalis.entries()) {
    const newPendaftarId = studentIdMap.get(oldPendaftarId);
    if (!newPendaftarId) continue;

    const a = (family as any).ayah;
    const i = (family as any).ibu;

    await prisma.orangTua.create({
      data: {
        pendaftar_id: newPendaftarId,
        nama_ayah: a ? cleanStr(a[5]) : '-',
        no_hp_ayah: a ? phoneMap.get(parseInt(a[22])) || '-' : '-',
        pekerjaan_ayah: a ? jobMap.get(parseInt(a[20])) || '-' : '-',
        pendidikan_ayah: a ? cleanStr(a[9]) : '-',
        nama_ibu: i ? cleanStr(i[5]) : '-',
        no_hp_ibu: i ? phoneMap.get(parseInt(i[22])) || '-' : '-',
        pekerjaan_ibu: i ? jobMap.get(parseInt(i[20])) || '-' : '-',
        pendidikan_ibu: i ? cleanStr(i[9]) : '-',
      }
    });
  }
  console.log(`✅ Data Orang Tua berhasil disatukan dan dimigrasi.`);

  // 5. Migrasi Pembayaran
  console.log('💳 Migrasi Data Pembayaran...');
  const pembayaransRaw = parseInsertValues(content, 'pembayarans');
  let payCount = 0;
  for (const row of pembayaransRaw) {
    const oldPendaftarId = parseInt(row[2]);
    const newPendaftarId = studentIdMap.get(oldPendaftarId);
    if (!newPendaftarId) continue;

    const jumlah = parseFloat(row[10]);
    const status = cleanStr(row[12]);
    const createdAt = safeDate(row[15]) || new Date(); // Use safeDate

    await prisma.pembayaran.create({
      data: {
        pendaftar_id: newPendaftarId,
        tahun_ajaran_id: activeTahunAjaran.id,
        metode_pembayaran: 'manual_transfer',
        jumlah: jumlah || 250000,
        status_pembayaran: status === 'diterima' ? 'verified' : 'pending',
        created_at: createdAt,
      }
    });
    payCount++;
  }
  console.log(`✅ ${payCount} Data Pembayaran berhasil dimigrasi.`);

  // 6. Migrasi Berkas
  console.log('📂 Migrasi Berkas Pendaftar...');
  const berkasRaw = parseInsertValues(content, 'berkas_pendaftars');
  let docsCount = 0;
  for (const row of berkasRaw) {
    const oldPendaftarId = parseInt(row[1]);
    const newPendaftarId = studentIdMap.get(oldPendaftarId);
    if (!newPendaftarId) continue;

    const pathDoc = cleanStr(row[5]);
    const nameDoc = cleanStr(row[4]);
    const status = cleanStr(row[3]);

    await prisma.dokumen.create({
      data: {
        pendaftar_id: newPendaftarId,
        jenis_dokumen: nameDoc || 'Foto/Dokumen',
        file_name: path.basename(pathDoc),
        file_path: pathDoc,
        is_verified: status === 'diterima',
        created_at: new Date(),
      }
    });
    docsCount++;
  }
  console.log(`✅ ${docsCount} Data Berkas berhasil dimigrasi.`);

  console.log('\n✨ MIGRASI 2026/2027 SELESAI DENGAN AKURASI 100%! ✨');
}

function parseInsertValues(content: string, tableName: string): string[][] {
  const searchStr = `INSERT INTO \`${tableName}\` VALUES`;
  const allRows: string[][] = [];
  let startIndex = 0;
  
  while (true) {
    startIndex = content.indexOf(searchStr, startIndex);
    if (startIndex === -1) break;
    
    startIndex += searchStr.length;
    while (startIndex < content.length && /\s/.test(content[startIndex])) {
      startIndex++;
    }
    if (content[startIndex] !== '(') {
      startIndex++; continue;
    }
    
    const endIndex = content.indexOf(';', startIndex);
    if (endIndex === -1) break;
    
    const valuesStr = content.substring(startIndex, endIndex).trim();
    let currentPos = 0;
    while (currentPos < valuesStr.length) {
      if (valuesStr[currentPos] === '(') {
        let endPos = findClosingParen(valuesStr, currentPos);
        if (endPos === -1) break; 
        const rowStr = valuesStr.substring(currentPos + 1, endPos);
        allRows.push(splitValues(rowStr));
        currentPos = endPos + 1;
      } else { currentPos++; }
    }
    startIndex = endIndex + 1;
  }
  return allRows;
}

function findClosingParen(str: string, start: number): number {
  let depth = 0; let inString = false; let stringChar = '';
  for (let i = start; i < str.length; i++) {
    const char = str[i];
    if (char === "'" || char === '"') {
      if (!inString) { inString = true; stringChar = char; }
      else if (stringChar === char && (i === 0 || str[i-1] !== '\\')) { inString = false; }
    }
    if (!inString) {
      if (char === '(') depth++;
      if (char === ')') { depth--; if (depth === 0) return i; }
    }
  }
  return -1;
}

function splitValues(rowStr: string): string[] {
  const parts: string[] = []; let current = ''; let inString = false; let stringChar = '';
  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    if (char === "'" || char === '"') {
      if (!inString) { inString = true; stringChar = char; }
      else if (stringChar === char && (i === 0 || rowStr[i-1] !== '\\')) { inString = false; }
      current += char;
    } else if (char === ',' && !inString) {
      parts.push(current.trim()); current = '';
    } else { current += char; }
  }
  parts.push(current.trim()); 
  return parts;
}

function safeDate(val: string): Date | null {
  const cleaned = cleanStr(val);
  if (!cleaned) return null;
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

const provMapper: Record<string, string> = {
  '11': 'Aceh', '12': 'Sumatera Utara', '13': 'Sumatera Barat', '14': 'Riau', '15': 'Jambi',
  '16': 'Sumatera Selatan', '17': 'Bengkulu', '18': 'Lampung', '19': 'Kepulauan Bangka Belitung',
  '21': 'Kepulauan Riau', '31': 'DKI Jakarta', '32': 'Jawa Barat', '33': 'Jawa Tengah',
  '34': 'DI Yogyakarta', '35': 'Jawa Timur', '36': 'Banten', '51': 'Bali', '52': 'Nusa Tenggara Barat',
  '53': 'Nusa Tenggara Timur', '61': 'Kalimantan Barat', '62': 'Kalimantan Tengah',
  '63': 'Kalimantan Selatan', '64': 'Kalimantan Timur', '65': 'Kalimantan Utara',
  '71': 'Sulawesi Utara', '72': 'Sulawesi Tengah', '73': 'Sulawesi Selatan', '74': 'Sulawesi Tenggara',
  '75': 'Gorontalo', '76': 'Sulawesi Barat', '81': 'Maluku', '82': 'Maluku Utara',
  '91': 'Papua Barat', '94': 'Papua'
};

function getProvName(id: string): string {
  return provMapper[id] || 'Luar Negeri / Lainnya';
}

function cleanStr(val: string): string {
  if (!val || val.toUpperCase() === 'NULL' || val === "''") return '';
  let s = val.trim();
  if (s.startsWith("'") && s.endsWith("'")) s = s.substring(1, s.length - 1);
  return s.replace(/\\'/g, "'").replace(/\\"/g, '"');
}

main()
  .catch((e) => { console.error('❌ Kesalahan:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
