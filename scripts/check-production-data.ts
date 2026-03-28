/**
 * SCRIPT: CEK DATA PENDAFTAR DI PRODUCTION
 * 
 * Script ini akan connect ke database production VPS
 * dan menampilkan data lengkap 3 pendaftar (Azzam, Raylan, Sukari)
 * termasuk NIK asli mereka.
 * 
 * CARA PAKAI:
 * 1. Set PRODUCTION_DATABASE_URL di .env atau command line
 * 2. Jalankan: npx tsx scripts/check-production-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

// Cek apakah ada PRODUCTION_DATABASE_URL
const dbUrl = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL tidak ditemukan!');
    console.log('\n📝 Silakan set DATABASE_URL di file .env:');
    console.log('   DATABASE_URL="postgresql://user:password@host:5432/database"');
    console.log('\nAtau jalankan dengan:');
    console.log('   PRODUCTION_DATABASE_URL="postgresql://..." npx tsx scripts/check-production-data.ts');
    process.exit(1);
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

async function main() {
    console.log('🔍 CEK DATA PENDAFTAR DI PRODUCTION\n');
    console.log('📊 Database:', dbUrl!.split('@')[1]?.split('/')[0] || 'Unknown');
    console.log('='.repeat(60) + '\n');

    // 1. Cek total pendaftar
    const totalCount = await prisma.pendaftar.count();
    console.log(`📈 Total Pendaftar di Database: ${totalCount}\n`);

    // 2. Cari 3 pendaftar yang kita cari
    const targetNames = ['Azzam', 'Raylan', 'Sukari'];

    console.log('🔎 MENCARI PENDAFTAR DENGAN NAMA:\n');

    for (const name of targetNames) {
        console.log(`\n--- Mencari: "${name}" ---`);

        const pendaftar = await prisma.pendaftar.findMany({
            where: {
                nama_lengkap: {
                    contains: name,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                nomor_pendaftaran: true,
                nik: true,
                nama_lengkap: true,
                jenis_kelamin: true,
                jenjang: true,
                no_hp: true,
                email: true,
                user_id: true,
                status_pendaftaran: true,
                created_at: true
            }
        });

        if (pendaftar.length === 0) {
            console.log('   ❌ TIDAK DITEMUKAN');
        } else {
            console.log(`   ✅ DITEMUKAN ${pendaftar.length} data:\n`);

            pendaftar.forEach((p, idx) => {
                console.log(`   ${idx + 1}. ${p.nama_lengkap}`);
                console.log(`      - Nomor Pendaftaran: ${p.nomor_pendaftaran}`);
                console.log(`      - NIK: ${p.nik}`);
                console.log(`      - Jenis Kelamin: ${p.jenis_kelamin}`);
                console.log(`      - Jenjang: ${p.jenjang}`);
                console.log(`      - No HP: ${p.no_hp || '-'}`);
                console.log(`      - Email: ${p.email || '-'}`);
                console.log(`      - User ID: ${p.user_id || '❌ TIDAK ADA (tidak bisa login!)'}`);
                console.log(`      - Status: ${p.status_pendaftaran}`);
                console.log(`      - Created: ${p.created_at}`);
                console.log('');
            });
        }
    }

    // 3. Tampilkan semua pendaftar (jika total < 20)
    if (totalCount < 20) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 SEMUA PENDAFTAR DI DATABASE:\n');

        const allPendaftars = await prisma.pendaftar.findMany({
            select: {
                nomor_pendaftaran: true,
                nama_lengkap: true,
                nik: true,
                jenjang: true,
                user_id: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        console.log('No. | No. Reg | Nama | NIK | Jenjang | Login');
        console.log('-'.repeat(80));

        allPendaftars.forEach((p, idx) => {
            const canLogin = p.user_id ? '✅' : '❌';
            console.log(`${idx + 1}. | ${p.nomor_pendaftaran} | ${p.nama_lengkap} | ${p.nik} | ${p.jenjang} | ${canLogin}`);
        });
    }

    // 4. Generate summary untuk restore
    console.log('\n' + '='.repeat(60));
    console.log('📝 REKOMENDASI UNTUK RESTORE:\n');

    const foundPendaftars = await prisma.pendaftar.findMany({
        where: {
            OR: [
                { nama_lengkap: { contains: 'Azzam', mode: 'insensitive' } },
                { nama_lengkap: { contains: 'Raylan', mode: 'insensitive' } },
                { nama_lengkap: { contains: 'Sukari', mode: 'insensitive' } }
            ]
        },
        select: {
            nama_lengkap: true,
            nomor_pendaftaran: true,
            nik: true,
            no_hp: true,
            email: true,
            jenis_kelamin: true,
            jenjang: true
        }
    });

    if (foundPendaftars.length > 0) {
        console.log('Copy data ini untuk update script restore:\n');
        console.log('const RESTORE_DATA = [');

        foundPendaftars.forEach((p) => {
            console.log('    {');
            console.log(`        nama_lengkap: '${p.nama_lengkap}',`);
            console.log(`        nomor_pendaftaran: '${p.nomor_pendaftaran}',`);
            console.log(`        nik: '${p.nik}',`);
            console.log(`        email: '${p.email || ''}',`);
            console.log(`        phone: '${p.no_hp || ''}',`);
            console.log(`        jenis_kelamin: '${p.jenis_kelamin}',`);
            console.log(`        jenjang: '${p.jenjang}'`);
            console.log('    },');
        });

        console.log('];');
    } else {
        console.log('❌ Data tidak ditemukan di production!');
        console.log('   Mungkin data belum di-redeploy atau sudah terhapus.');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ SELESAI\n');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e.message);
        console.log('\n💡 Tips:');
        console.log('   - Pastikan DATABASE_URL sudah benar');
        console.log('   - Untuk production VPS, gunakan connection string langsung');
        console.log('   - Contoh: postgresql://postgres:password@72.61.141.50:5432/ppdb_alimam');
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
