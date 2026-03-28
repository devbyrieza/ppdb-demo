import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            // Use production database URL if provided, otherwise use local
            url: process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL
        }
    }
});

// Data ketiga pendaftar yang harus dipulihkan
// ⚠️ PENTING: Update NIK dengan NIK asli dari data pendaftar!
const RESTORE_DATA = [
    {
        nama_lengkap: 'Ahmad Sukari Tes',
        nomor_pendaftaran: 'MTI2500001', // Update dengan nomor pendaftaran asli
        nik: '3201000000000001', // ⚠️ UPDATE DENGAN NIK ASLI!
        email: 'ahmad.sukari@example.com',
        phone: '081234567890',
        jenis_kelamin: 'L',
        jenjang: 'MTs',
        tempat_lahir: 'KABUPATEN TEST',
        tanggal_lahir: '2010-01-01'
    },
    {
        nama_lengkap: 'muhammad Azzam Al hafiz',
        nomor_pendaftaran: 'A250076', // Dari data Excel
        nik: '3201000000000002', // ⚠️ UPDATE DENGAN NIK ASLI!
        email: 'azzam@example.com',
        phone: '081234567891',
        jenis_kelamin: 'L',
        jenjang: 'MTs',
        tempat_lahir: 'KABUPATEN TEST',
        tanggal_lahir: '2010-02-02'
    },
    {
        nama_lengkap: 'Raylan Akbar',
        nomor_pendaftaran: 'C250026', // Dari data Excel
        nik: '3201000000000003', // ⚠️ UPDATE DENGAN NIK ASLI!
        email: 'raylan@example.com',
        phone: '081234567892',
        jenis_kelamin: 'L',
        jenjang: 'SMA',
        tempat_lahir: 'KABUPATEN TEST',
        tanggal_lahir: '2008-03-03'
    }
];

async function main() {
    console.log('🚀 Starting restore process for 3 pendaftars...\n');

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
        console.log(`📋 Processing: ${data.nama_lengkap}`);
        console.log(`   Nomor Pendaftaran: ${data.nomor_pendaftaran}`);
        console.log(`   NIK: ${data.nik}`);

        // Check if pendaftar already exists
        let pendaftar = await prisma.pendaftar.findFirst({
            where: {
                nomor_pendaftaran: data.nomor_pendaftaran
            }
        });

        if (pendaftar) {
            console.log(`   ✓ Found existing pendaftar (ID: ${pendaftar.id})`);
            
            // Update with correct NIK and data
            await prisma.pendaftar.update({
                where: { id: pendaftar.id },
                data: {
                    nik: data.nik,
                    nama_lengkap: data.nama_lengkap,
                    jenis_kelamin: data.jenis_kelamin,
                    jenjang: data.jenjang,
                    no_hp: data.phone,
                    email: data.email
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
                    email: data.email,
                    phone: data.phone,
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
                    status_pendaftaran: 'submitted'
                }
            });
            console.log(`   ✓ Created pendaftar (ID: ${pendaftar.id})`);
        }

        // Ensure profile exists and is linked
        if (pendaftar && !pendaftar.user_id) {
            // Find or create profile
            let profile = await prisma.profile.findFirst({
                where: {
                    email: data.email
                }
            });

            if (!profile) {
                profile = await prisma.profile.create({
                    data: {
                        id: crypto.randomUUID(),
                        full_name: data.nama_lengkap,
                        email: data.email,
                        phone: data.phone,
                        role: 'pendaftar',
                        password_hash: await hashPassword(data.nik)
                    }
                });
            }

            // Link profile to pendaftar
            await prisma.pendaftar.update({
                where: { id: pendaftar.id },
                data: { user_id: profile.id }
            });
            console.log(`   ✓ Linked to profile (ID: ${profile.id})`);
        }

        console.log('');
    }

    console.log('✅ Restore process completed!');
    console.log('\n📝 Login credentials:');
    console.log('   - Username: Nomor Pendaftaran or NIK');
    console.log('   - Password: NIK (16 digits)');
    console.log('\n⚠️  IMPORTANT: Please update the NIK values in this script with the actual NIKs before running in production!');
}

// Simple password hash function (match your app's implementation)
async function hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
