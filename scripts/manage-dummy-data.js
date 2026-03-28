const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
    console.log('🔄 Starting Dummy Data Management...');

    // 1. Get Active Academic Year
    let tahunAjaran = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });

    if (!tahunAjaran) {
        console.log('⚠️ No active academic year found. Using the latest one.');
        tahunAjaran = await prisma.tahunAjaran.findFirst({
            orderBy: { created_at: 'desc' }
        });
    }

    if (!tahunAjaran) {
        console.error('❌ No academic year found at all. Cannot process.');
        process.exit(1);
    }

    console.log(`📅 Using Academic Year: ${tahunAjaran.nama} (${tahunAjaran.id})`);

    // 2. Identify Preserved Accounts
    const preservedNames = ['Dedenn', 'wahab rajasam'];
    const preservedIds = [];

    console.log('🔍 Searching for preserved accounts...');

    for (const name of preservedNames) {
        // Find pendaftar with similar name
        const found = await prisma.pendaftar.findFirst({
            where: {
                nama_lengkap: {
                    contains: name,
                    mode: 'insensitive'
                }
            }
        });

        if (found) {
            console.log(`✅ Found preserved account: ${found.nama_lengkap} (${found.id})`);
            preservedIds.push(found.id);

            let newName = found.nama_lengkap;
            if (!newName.toUpperCase().includes('[TEST]')) {
                newName = newName + " [TEST]";
                await prisma.pendaftar.update({
                    where: { id: found.id },
                    data: { nama_lengkap: newName }
                });
                console.log(`   Updated name to: ${newName}`);
            }

        } else {
            console.log(`⚠️ Count not find account matching: ${name}`);
        }
    }

    // 3. Delete Non-Preserved Accounts (Initial Sweep)
    console.log('🗑️ Deleting non-preserved accounts...');

    const allPendaftar = await prisma.pendaftar.findMany({
        select: { id: true, nama_lengkap: true }
    });

    const toDelete = allPendaftar.filter(p => !preservedIds.includes(p.id));

    console.log(`   Found ${toDelete.length} accounts to delete.`);

    for (const p of toDelete) {
        try {
            await prisma.pendaftar.delete({ where: { id: p.id } });
            console.log(`   Deleted: ${p.nama_lengkap}`);
        } catch (e) {
            console.error(`   Failed to delete ${p.nama_lengkap}: ${e.message}`);
        }
    }

    // 4. Generate New Dummy Data
    console.log('🌱 Seeding new dummy data...');

    const dummyData = [
        { name: 'Ahmad Santoso [DUMMY]', gender: 'L', jenjang: 'SMP', status: 'draft', payment: 'pending', origin: 'Jakarta' },
        { name: 'Siti Aminah [DUMMY]', gender: 'P', jenjang: 'SMA', status: 'verified', payment: 'paid', origin: 'Bandung' },
        { name: 'Budi Pratama [DUMMY]', gender: 'L', jenjang: 'SMA', status: 'submitted', payment: 'pending', origin: 'Surabaya' },
        { name: 'Dewi Sartika [DUMMY]', gender: 'P', jenjang: 'SMP', status: 'draft', payment: 'pending', origin: 'Yogyakarta' },
        { name: 'Rizky Ramadhan [DUMMY]', gender: 'L', jenjang: 'SMP', status: 'verified', payment: 'paid', origin: 'Bekasi' },
        { name: 'Nurul Hidayah [DUMMY]', gender: 'P', jenjang: 'SMA', status: 'rejected', payment: 'rejected', origin: 'Bogor' },
        { name: 'Fajar Nugraha [DUMMY]', gender: 'L', jenjang: 'SMA', status: 'submitted', payment: 'paid', origin: 'Depok' },
        { name: 'Rina Wati [DUMMY]', gender: 'P', jenjang: 'SMP', status: 'verified', payment: 'paid', origin: 'Tangerang' },
    ];

    for (const data of dummyData) {
        const email = data.name.toLowerCase().replace(/\s+/g, '.').replace('[dummy]', '').replace('[test]', '').replace(/\.$/, '') + '@example.com';
        const phone = '08' + Math.floor(Math.random() * 10000000000);
        const nomer = 'REG-' + Math.floor(Math.random() * 10000);

        console.log(`\n👉 Processing ${data.name} (${email})...`);

        // Aggressive Cleanup per User
        try {
            // Delete by email in Pendaftar if exists
            await prisma.pendaftar.deleteMany({ where: { email: email } });

            // Find Profile
            const existingProfile = await prisma.profile.findFirst({ where: { email: email } });
            if (existingProfile) {
                // Delete Pendaftar by user_id just in case
                await prisma.pendaftar.deleteMany({ where: { user_id: existingProfile.id } });
                // Delete Profile
                await prisma.profile.delete({ where: { id: existingProfile.id } });
                console.log(`   Deleted existing profile for ${email}`);
            }
        } catch (e) {
            console.log(`   Cleanup warning: ${e.message}`);
        }

        // Create Fresh Profile
        let userId = null;
        try {
            const user = await prisma.profile.create({
                data: {
                    id: crypto.randomUUID(), // Explicitly generate ID
                    full_name: data.name,
                    email: email,
                    phone: phone,
                    role: 'pendaftar',
                    password_hash: '$2b$10$dummyhashformockingonly'
                }
            });
            userId = user.id;
            console.log(`   Created profile: ${userId}`);
        } catch (e) {
            console.error(`   ❌ Failed to create profile: ${e.message}`);
            continue;
        }

        // Create Pendaftar
        try {
            await prisma.pendaftar.create({
                data: {
                    id: crypto.randomUUID(), // Explicitly generate ID
                    nama_lengkap: data.name,
                    user_id: userId,
                    email: email,
                    no_hp: phone,
                    jenis_kelamin: data.gender,
                    jenjang: data.jenjang,
                    nomor_pendaftaran: nomer,
                    nik: '1234567890' + Math.floor(Math.random() * 1000000),
                    status_pendaftaran: data.status,
                    tahun_ajaran_id: tahunAjaran.id,
                    alamat: 'Jl. Merdeka No. ' + Math.floor(Math.random() * 100),
                    kabupaten: data.origin,
                    provinsi: 'Jawa Barat',
                    pembayaran: data.payment !== 'pending' ? {
                        create: {
                            id: crypto.randomUUID(), // Explicitly generate ID
                            tahun_ajaran_id: tahunAjaran.id,
                            metode_pembayaran: 'manual',
                            jumlah: 250000,
                            status_pembayaran: data.payment,
                            bukti_transfer_path: '/dummy.jpg'
                        }
                    } : undefined
                }
            });
            console.log(`   ✅ Created pendaftar successfully.`);
        } catch (e) {
            console.error(`   ❌ Failed to create pendaftar: ${e.message}`);
        }
    }

    console.log('✅ Dummy data management completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
