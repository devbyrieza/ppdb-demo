const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
    console.log('🔍 Checking for Wahab Rajasam...');

    const found = await prisma.pendaftar.findFirst({
        where: {
            nama_lengkap: {
                contains: 'wahab',
                mode: 'insensitive'
            }
        }
    });

    if (found) {
        console.log(`✅ Found: ${found.nama_lengkap} (${found.id})`);

        // Ensure [TEST] tag
        if (!found.nama_lengkap.toUpperCase().includes('[TEST]')) {
            await prisma.pendaftar.update({
                where: { id: found.id },
                data: { nama_lengkap: found.nama_lengkap + ' [TEST]' }
            });
            console.log('   Updated with [TEST] tag');
        }
    } else {
        console.log('❌ Not found. Creating new account...');

        // Get active academic year
        const tahunAjaran = await prisma.tahunAjaran.findFirst({
            orderBy: { created_at: 'desc' }
        });

        const name = 'Wahab Rajasam [TEST]';
        const email = 'wahab@example.com';
        const phone = '081234567890';

        // Create Profile
        const profile = await prisma.profile.create({
            data: {
                id: crypto.randomUUID(),
                full_name: name,
                email: email,
                phone: phone,
                role: 'pendaftar',
                password_hash: '$2b$10$dummyhashformockingonly'
            }
        });

        // Create Pendaftar
        await prisma.pendaftar.create({
            data: {
                id: crypto.randomUUID(),
                user_id: profile.id,
                nama_lengkap: name,
                email: email,
                no_hp: phone,
                jenis_kelamin: 'L',
                jenjang: 'SMA',
                nomor_pendaftaran: 'REG-WAHAB',
                nik: '1234567890123456',
                status_pendaftaran: 'submitted',
                tahun_ajaran_id: tahunAjaran.id,
                alamat: 'Jl. Test No. 1'
            }
        });

        console.log(`✅ Created ${name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
