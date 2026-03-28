/**
 * 🪄 SCRIPT AJAIB - RESTORE DATA PENDAFTAR OTOMATIS
 * 
 * CARA PAKAI SUPER MUDAH:
 * 1. SSH ke VPS: ssh root@72.61.141.50
 * 2. Jalankan: npx tsx scripts/restore-ajaib.ts
 * 
 * SELESAI! Data akan otomatis pulih.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('\n🪄 SCRIPT AJAIB - RESTORE DATA PENDAFTAR\n');
    console.log('='.repeat(50));
    
    // Data dari Excel output (yang kita punya)
    const data = [
        { nama: 'muhammad Azzam Al hafiz', noReg: 'A250076', jenjang: 'MTs' },
        { nama: 'Raylan Akbar', noReg: 'C250026', jenjang: 'SMA' },
        { nama: 'Ahmad Sukari Tes', noReg: 'MTI2500001', jenjang: 'MTs' }
    ];

    console.log('\n📋 MENCARI DATA DI DATABASE...\n');

    for (const item of data) {
        // Cari berdasarkan nomor pendaftaran
        let pendaftar = await prisma.pendaftar.findFirst({
            where: { nomor_pendaftaran: item.noReg }
        });

        // Kalau tidak ada, cari berdasarkan nama
        if (!pendaftar) {
            pendaftar = await prisma.pendaftar.findFirst({
                where: { nama_lengkap: { contains: item.nama.split(' ')[0], mode: 'insensitive' } }
            });
        }

        if (pendaftar) {
            console.log(`✅ DITEMUKAN: ${item.nama}`);
            console.log(`   No. Pendaftaran: ${pendaftar.nomor_pendaftaran}`);
            console.log(`   NIK Saat Ini: ${pendaftar.nik}`);
            console.log(`   Status Login: ${pendaftar.user_id ? '✅ BISA LOGIN' : '❌ TIDAK BISA LOGIN'}`);
            
            // Jika tidak ada user_id, buat profile
            if (!pendaftar.user_id) {
                const { PrismaClient } = require('@prisma/client');
                const crypto = require('crypto');
                const bcrypt = require('bcryptjs');
                
                const passwordHash = await bcrypt.hash(pendaftar.nik, 10);
                
                const profile = await prisma.profile.create({
                    data: {
                        id: crypto.randomUUID(),
                        full_name: pendaftar.nama_lengkap,
                        phone: pendaftar.no_hp || '',
                        email: pendaftar.email || null,
                        role: 'pendaftar',
                        password_hash: passwordHash
                    }
                });
                
                await prisma.pendaftar.update({
                    where: { id: pendaftar.id },
                    data: { user_id: profile.id }
                });
                
                console.log(`   ✅ Profile dibuat! Sekarang bisa login.`);
            }
            console.log('');
        } else {
            console.log(`❌ TIDAK DITEMUKAN: ${item.nama}`);
            console.log(`   Membuat data baru...\n`);
            
            // Buat data baru
            const { PrismaClient } = require('@prisma/client');
            const crypto = require('crypto');
            const bcrypt = require('bcryptjs');
            
            const nik = '320100000000000' + Math.floor(Math.random() * 9);
            const passwordHash = await bcrypt.hash(nik, 10);
            
            const profile = await prisma.profile.create({
                data: {
                    id: crypto.randomUUID(),
                    full_name: item.nama,
                    phone: '',
                    email: null,
                    role: 'pendaftar',
                    password_hash: passwordHash
                }
            });
            
            const tahunAjaran = await prisma.tahunAjaran.findFirst({
                where: { is_active: true }
            });
            
            await prisma.pendaftar.create({
                data: {
                    id: crypto.randomUUID(),
                    user_id: profile.id,
                    tahun_ajaran_id: tahunAjaran?.id || '11111111-1111-1111-1111-111111111111',
                    nomor_pendaftaran: item.noReg,
                    nik: nik,
                    nama_lengkap: item.nama,
                    jenis_kelamin: 'L',
                    jenjang: item.jenjang,
                    status_pendaftaran: 'submitted'
                }
            });
            
            console.log(`   ✅ Data baru dibuat!`);
            console.log(`   NIK: ${nik}`);
            console.log(`   Password: ${nik}`);
            console.log('');
        }
    }

    console.log('='.repeat(50));
    console.log('✅ RESTORE SELESAI!\n');
    console.log('📝 LOGIN:');
    console.log('   Username = Nomor Pendaftaran');
    console.log('   Password = NIK (16 digit)\n');
    console.log('💡 Jika NIK masih placeholder, update manual di database.\n');
}

main()
    .catch(e => {
        console.error('❌ Error:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
