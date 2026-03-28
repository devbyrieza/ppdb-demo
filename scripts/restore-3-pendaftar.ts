/**
 * SCRIPT RESTORE DATA PENDAFTAR - 3 Pendaftar
 * 
 * Data diambil dari Excel output (tmp_excel_output_utf8.txt)
 * 
 * Sumber data:
 * - Muhammad Azzam Al Hafizh: A250076, MTs Putra
 * - Raylan Akbar: C250026, SMA Putra
 * - Ahmad Sukari Tes: (perlu nomor pendaftaran asli)
 * 
 * CATATAN PENTING:
 * - NIK tidak ditemukan di backup Excel
 * - Gunakan NIK sementara (16 digit) atau minta ke pendaftar langsung
 * - Password login = NIK
 */

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL
        }
    }
});

// Data dari Excel output
const RESTORE_DATA = [
    {
        nama_lengkap: 'Ahmad Sukari Tes',
        nomor_pendaftaran: 'MTI2500001', // ⚠️ UPDATE dengan nomor asli jika ada
        nik: '3201000000000001', // ⚠️ UPDATE dengan NIK asli!
        email: '',
        phone: '',
        jenis_kelamin: 'L',
        jenjang: 'MTs',
        tempat_lahir: '',
        tanggal_lahir: '2010-01-01'
    },
    {
        nama_lengkap: 'muhammad Azzam Al hafiz',
        nomor_pendaftaran: 'A250076', // Dari Excel
        nik: '3201000000000002', // ⚠️ UPDATE dengan NIK asli!
        email: '',
        phone: '',
        jenis_kelamin: 'L',
        jenjang: 'MTs',
        tempat_lahir: '',
        tanggal_lahir: '2010-06-01' // Perkiraan usia ~15-16 tahun
    },
    {
        nama_lengkap: 'Raylan Akbar',
        nomor_pendaftaran: 'C250026', // Dari Excel
        nik: '3201000000000003', // ⚠️ UPDATE dengan NIK asli!
        email: '',
        phone: '',
        jenis_kelamin: 'L',
        jenjang: 'SMA',
        tempat_lahir: '',
        tanggal_lahir: '2008-03-01' // Perkiraan usia ~17-18 tahun
    }
];

async function main() {
    console.log('🚀 RESTORE DATA PENDAFTAR - 3 Pendaftar\n');
    console.log('📊 Data sumber: tmp_excel_output_utf8.txt\n');

    // Get active tahun ajaran
    const tahunAjaran = await prisma.tahunAjaran.findFirst({
        where: { is_active: true },
        orderBy: { created_at: 'desc' }
    });

    if (!tahunAjaran) {
        console.error('❌ No active tahun ajaran found!');
        return;
    }

    console.log(`📅 Using tahun ajaran: ${tahunAjaran.nama} (${tahunAjaran.id})\n`);

    for (const data of RESTORE_DATA) {
        console.log('='.repeat(60));
        console.log(`📋 Processing: ${data.nama_lengkap}`);
        console.log(`   Nomor Pendaftaran: ${data.nomor_pendaftaran}`);
        console.log(`   NIK: ${data.nik}`);
        console.log(`   Jenjang: ${data.jenjang}`);

        // Check if pendaftar already exists
        let pendaftar = await prisma.pendaftar.findFirst({
            where: {
                OR: [
                    { nomor_pendaftaran: data.nomor_pendaftaran },
                    { nama_lengkap: { contains: data.nama_lengkap.split(' ')[0], mode: 'insensitive' } }
                ]
            }
        });

        if (pendaftar) {
            console.log(`   ✓ Found existing pendaftar (ID: ${pendaftar.id})`);
            console.log(`   Current NIK: ${pendaftar.nik}`);
            
            // Update with correct NIK and data
            await prisma.pendaftar.update({
                where: { id: pendaftar.id },
                data: {
                    nik: data.nik,
                    nama_lengkap: data.nama_lengkap,
                    jenis_kelamin: data.jenis_kelamin,
                    jenjang: data.jenjang,
                    no_hp: data.phone || pendaftar.no_hp,
                    email: data.email || pendaftar.email
                }
            });
            console.log(`   ✓ Updated NIK and data`);
        } else {
            console.log(`   ⚠ Pendaftar not found, creating new...`);
            
            // Create new Profile first
            const profile = await prisma.profile.create({
                data: {
                    id: crypto.randomUUID(),
                    full_name: data.nama_lengkap,
                    email: data.email || null,
                    phone: data.phone || '',
                    role: 'pendaftar',
                    password_hash: await hashPassword(data.nik) // Use NIK as default password
                }
            });
            console.log(`   ✓ Created profile (ID: ${profile.id})`);

            // Create Pendaftar
            pendaftar = await prisma.pendaftar.create({
                data: {
                    id: crypto.randomUUID(),
                    user_id: profile.id,
                    tahun_ajaran_id: tahunAjaran.id,
                    nomor_pendaftaran: data.nomor_pendaftaran,
                    nik: data.nik,
                    nama_lengkap: data.nama_lengkap,
                    jenis_kelamin: data.jenis_kelamin,
                    jenjang: data.jenjang,
                    no_hp: data.phone,
                    email: data.email,
                    tempat_lahir: data.tempat_lahir,
                    tanggal_lahir: new Date(data.tanggal_lahir),
                    status_pendaftaran: 'submitted'
                }
            });
            console.log(`   ✓ Created pendaftar (ID: ${pendaftar.id})`);
        }

        console.log('');
    }

    console.log('='.repeat(60));
    console.log('✅ RESTORE COMPLETED!\n');
    console.log('📝 LOGIN CREDENTIALS:');
    console.log('   - Username: Nomor Pendaftaran atau NIK');
    console.log('   - Password: NIK (16 digit)\n');
    console.log('⚠️  PENTING:');
    console.log('   1. Update NIK di script ini dengan NIK asli sebelum production!');
    console.log('   2. Minta NIK asli ke pendaftar melalui WhatsApp/telepon');
    console.log('   3. Atau gunakan NIK sementara dan update manual di database\n');
}

async function hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
