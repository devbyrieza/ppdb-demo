import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Memulai Seeding Data Presentasi Mudir (Loose Types)...');

    // 1. Seed Tahun Ajaran Aktif
    const tahunAjaran = await prisma.tahunAjaran.upsert({
        where: { id: '11111111-1111-1111-1111-111111111111' },
        update: { is_active: true, nama: '2025/2026' },
        create: {
            id: '11111111-1111-1111-1111-111111111111',
            tahun_mulai: 2025,
            tahun_selesai: 2026,
            nama: '2025/2026',
            is_active: true,
            tanggal_buka_pendaftaran: new Date('2025-01-01'),
            tanggal_tutup_pendaftaran: new Date('2025-12-31'),
            biaya_pendaftaran: 250000,
        },
    });

    console.log('✅ Tahun Ajaran Aktif:', (tahunAjaran as any).nama);

    // 2. Create Users (Admin & Pendaftar)
    const usersToCreate = [
        { email: 'mudir@ululalbaab.com', password: 'password123', role: 'admin_super', name: 'Mudir Al Andalus', phone: '081111111111', label: 'MUDIR' },
        { email: 'keuangan@ululalbaab.com', password: 'password123', role: 'admin_keuangan', name: 'Bendahara PPDB', phone: '082222222222', label: 'FINANCE' },
        
        ...Array.from({ length: 20 }).map((_, i) => ({
            email: `pendaftar${i+1}@example.com`,
            password: 'password123',
            role: 'pendaftar',
            name: `Santri Dummy ${i+1}`,
            phone: `0812345678${i.toString().padStart(2, '0')}`,
            label: `SANTRI_${i+1}`
        }))
    ];

    const createdUsers: Record<string, string> = {};
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const u of usersToCreate) {
        const profile = await (prisma.profile as any).upsert({
            where: { email: u.email },
            update: { role: u.role, full_name: u.name, phone: u.phone },
            create: {
                id: crypto.randomUUID(),
                email: u.email,
                password_hash: hashedPassword,
                role: u.role,
                full_name: u.name,
                phone: u.phone,
            }
        });
        createdUsers[u.label] = profile.id;
    }

    console.log('✅ Akun Admin & Dummy Santri Berhasil Dibuat');

    // 3. Seed Pendaftar Data
    const jenjangs = ['MTs', 'IL'];
    const genders = ['L', 'P'];
    const statuses = ['draft', 'payment_verification', 'verified', 'scheduled', 'accepted'];

    console.log('📦 Mengisi Data Pendaftar untuk Dashboard...');

    for (let i = 1; i <= 20; i++) {
        const jenjang = jenjangs[i % 2];
        const gender = genders[i % 2];
        const status = statuses[i % statuses.length];
        const nomor = `REG-2025-${i.toString().padStart(3, '0')}`;
        
        const pendaftar = await (prisma.pendaftar as any).upsert({
            where: { nomor_pendaftaran: nomor },
            update: { 
                jenjang, 
                jenis_kelamin: gender, 
                status_pendaftaran: status,
                verifikasi_status: status === 'draft' ? 'pending' : 'verified'
            },
            create: {
                user_id: createdUsers[`SANTRI_${i}`],
                tahun_ajaran_id: tahunAjaran.id,
                nomor_pendaftaran: nomor,
                nik: `3201${i.toString().padStart(12, '0')}`,
                nama_lengkap: `Calon Santri ${i}`,
                jenis_kelamin: gender,
                jenjang: jenjang,
                tempat_lahir: 'Jakarta',
                tanggal_lahir: new Date('2012-05-05'),
                status_pendaftaran: status,
                verifikasi_status: status === 'draft' ? 'pending' : 'verified',
            }
        });

        if (status !== 'draft') {
            await (prisma.pembayaran as any).deleteMany({ where: { pendaftar_id: pendaftar.id } });
            await (prisma.pembayaran as any).create({
                data: {
                    pendaftar_id: pendaftar.id,
                    tahun_ajaran_id: tahunAjaran.id,
                    metode_pembayaran: 'manual',
                    jumlah: 250000,
                    status_pembayaran: status === 'payment_verification' ? 'pending' : 'verified',
                    verified_by: createdUsers['FINANCE'],
                    verified_at: status === 'payment_verification' ? null : new Date(),
                    jenis_pembayaran: 'PENDAFTARAN',
                    tipe_cicilan: 'LUNAS'
                }
            });
        }
    }

    console.log('✅ Data Pendaftar Berhasil Disimulasikan');
    console.log('\n--- DATA LOGIN DEMO ---');
    console.log('User Admin: mudir@ululalbaab.com / password123');
    console.log('User Finance: keuangan@ululalbaab.com / password123');
    console.log('------------------------');
}

main()
    .then(async () => {
        await prisma.$disconnect();
        console.log('🚀 SEEDING SELESAI. SIAP PRESENTASI!');
    })
    .catch(async (e) => {
        console.error('❌ Error Seeding:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
