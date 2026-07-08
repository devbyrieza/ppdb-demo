import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Seed Tahun Ajaran
    let tahunAjaran = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });

    if (tahunAjaran) {
        console.log('Found existing active Tahun Ajaran:', tahunAjaran.id);
        try {
            tahunAjaran = await prisma.tahunAjaran.update({
                where: { id: tahunAjaran.id },
                data: {
                    nama: '2025/2026',
                    tahun_mulai: 2025,
                    tahun_selesai: 2026,
                }
            });
        } catch (e) {
            console.log('Update active year failed, using as is.');
        }
    } else {
        console.log('No active year found, attempting to create seed year...');
        try {
            tahunAjaran = await prisma.tahunAjaran.upsert({
                where: { id: '11111111-1111-1111-1111-111111111111' },
                update: { is_active: true },
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
        } catch (error) {
            tahunAjaran = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
            if (!tahunAjaran) throw error;
        }
    }

    console.log('Using Tahun Ajaran:', tahunAjaran.nama);

    // 2. Create Users (Profiles) DIRECTLY in Database
    const adminUsers = [
        { email: 'admin@ppdb-demo.com', password: 'Admin26!', role: 'admin_super', name: 'Super Admin', phone: '081234567890', label: 'ADMIN_SUPER' },
        { email: 'berkas@ppdb-demo.com', password: 'Berkas26!', role: 'admin_berkas', name: 'Admin Berkas', phone: '081234567801', label: 'ADMIN_BERKAS' },
        { email: 'keuangan@ppdb-demo.com', password: 'Keuangan26!', role: 'admin_keuangan', name: 'Admin Keuangan', phone: '081234567802', label: 'ADMIN_KEUANGAN' },
        { email: 'quran@ppdb-demo.com', password: 'Quran26!', role: 'penguji', name: 'Ustadz Penguji Al-Quran', phone: '081234567803', label: 'PENGUJI' },
        { email: 'calsan@ppdb-demo.com', password: 'Santri26!', role: 'pewawancara_calsan', name: 'Ustadz Pewawancara Calsan', phone: '081234567804', label: 'PENGUJI' },
        { email: 'cawalsan@ppdb-demo.com', password: 'Orang Tua26!', role: 'pewawancara_cawalsan', name: 'Ustadz Pewawancara Wali', phone: '081234567805', label: 'PENGUJI' },
    ];

    const dummyPendaftar = [
        // The 4 required by the UI for 1-click login:
        { nik: '1234567890123451', no: 'MTA2600001', name: 'Muhammad Al-Fatih', gender: 'L', jenjang: 'MTs', status: 'draft', vStatus: 'pending', phone: '081234567891', email: 'fatih@example.com' },
        { nik: '1234567890123452', no: 'MTI2600001', name: 'Aisyah Azzahra', gender: 'P', jenjang: 'MTs', status: 'payment_verification', vStatus: 'verified', phone: '081234567892', email: 'aisyah@example.com' },
        { nik: '1234567890123453', no: 'ILA2600001', name: 'Umar Bin Khattab', gender: 'L', jenjang: 'MA', status: 'verified', vStatus: 'verified', phone: '081234567893', email: 'umar@example.com' },
        { nik: '1234567890123454', no: 'ILI2600001', name: 'Khadijah Bint Khuwaylid', gender: 'P', jenjang: 'MA', status: 'accepted', vStatus: 'verified', phone: '081234567894', email: 'khadijah@example.com' },
    
        // Additional realistic demo data
        { nik: '3201000000000005', no: 'MTA2600002', name: 'Zaid Bin Tsabit', gender: 'L', jenjang: 'MTs', status: 'accepted', vStatus: 'verified', phone: '081234567895', email: 'zaid@example.com' },
        { nik: '3201000000000006', no: 'MTI2600002', name: 'Fatimah Az-Zahra', gender: 'P', jenjang: 'MTs', status: 'verified', vStatus: 'verified', phone: '081234567896', email: 'fatimah@example.com' },
        { nik: '3201000000000007', no: 'ILA2600002', name: 'Ali Bin Abi Thalib', gender: 'L', jenjang: 'MA', status: 'payment_verification', vStatus: 'pending', phone: '081234567897', email: 'ali@example.com' },
        { nik: '3201000000000008', no: 'ILI2600002', name: 'Zainab Bint Ali', gender: 'P', jenjang: 'MA', status: 'draft', vStatus: 'pending', phone: '081234567898', email: 'zainab@example.com' },
        { nik: '3201000000000009', no: 'MTA2600003', name: 'Khalid Bin Walid', gender: 'L', jenjang: 'MTs', status: 'verified', vStatus: 'verified', phone: '081234567899', email: 'khalid@example.com' },
        { nik: '3201000000000010', no: 'MTI2600003', name: 'Ruqayyah Bint Muhammad', gender: 'P', jenjang: 'MTs', status: 'draft', vStatus: 'pending', phone: '081234567800', email: 'ruqayyah@example.com' },
        { nik: '3201000000000011', no: 'ILA2600003', name: 'Hasan Bin Ali', gender: 'L', jenjang: 'MA', status: 'accepted', vStatus: 'verified', phone: '081234567811', email: 'hasan@example.com' },
        { nik: '3201000000000012', no: 'ILI2600003', name: 'Asma Bint Abu Bakar', gender: 'P', jenjang: 'MA', status: 'payment_verification', vStatus: 'verified', phone: '081234567812', email: 'asma@example.com' },
    ];

    const allUsers = [...adminUsers, ...dummyPendaftar.map(d => ({
        email: d.email, password: 'password123', role: 'pendaftar', name: d.name, phone: d.phone, label: d.no
    }))];

    const createdUsers: Record<string, string> = {};

    for (const u of allUsers) {
        console.log(`Processing user: ${u.email}...`);

        const existingProfile = await prisma.profile.findFirst({
            where: { email: u.email }
        });

        let userId = existingProfile?.id;
        const hashedPassword = await bcrypt.hash(u.password, 10);

        if (!existingProfile) {
            userId = crypto.randomUUID();
            await prisma.profile.create({
                data: {
                    id: userId,
                    email: u.email,
                    password_hash: hashedPassword,
                    role: u.role,
                    full_name: u.name,
                    phone: u.phone,
                    updated_at: new Date(),
                }
            });
            console.log(`Created new user: ${u.email}`);
        } else {
            await prisma.profile.update({
                where: { id: userId },
                data: {
                    role: u.role,
                    full_name: u.name,
                    phone: u.phone,
                    password_hash: hashedPassword,
                    updated_at: new Date(),
                }
            });
            console.log(`Updated existing user: ${u.email}`);
        }

        createdUsers[u.label] = userId!;
    }

    console.log('Created/Verified Users & Profiles');

    // 3. Seed Pendaftar Data
    console.log('Seeding Pendaftar Data...');
    
    for (const d of dummyPendaftar) {
        const userId = createdUsers[d.no];
        
        const pendaftar = await prisma.pendaftar.upsert({
            where: { nomor_pendaftaran: d.no },
            update: {
                user_id: userId,
                nama_lengkap: d.name,
                no_hp: d.phone,
                status_pendaftaran: d.status,
                verifikasi_status: d.vStatus,
            },
            create: {
                user_id: userId,
                tahun_ajaran_id: tahunAjaran.id,
                nomor_pendaftaran: d.no,
                nik: d.nik,
                nama_lengkap: d.name,
                jenis_kelamin: d.gender,
                jenjang: d.jenjang,
                tempat_lahir: 'Jakarta',
                tanggal_lahir: new Date('2010-01-01'),
                alamat: 'Jl. Contoh Data Demo No. 123',
                no_hp: d.phone,
                status_pendaftaran: d.status,
                verifikasi_status: d.vStatus,
            },
        });

        // Add dummy parent data
        await prisma.orangTua.upsert({
            where: { pendaftar_id: pendaftar.id },
            update: {},
            create: {
                pendaftar_id: pendaftar.id,
                nama_ayah: `Ayah dari ${d.name}`,
                no_hp_ayah: '08111111111',
            }
        });

        // Add verified docs and payment if verified/accepted
        if (d.vStatus === 'verified') {
            const doks = ['kartu_keluarga', 'akta_kelahiran'];
            for (const doc of doks) {
                const count = await prisma.dokumen.count({ where: { pendaftar_id: pendaftar.id, jenis_dokumen: doc } });
                if (count === 0) {
                    await prisma.dokumen.create({
                        data: {
                            pendaftar_id: pendaftar.id,
                            jenis_dokumen: doc,
                            file_name: `${doc}.pdf`,
                            file_path: `uploads/${doc}.pdf`,
                            is_verified: true,
                            verified_by: createdUsers['ADMIN_BERKAS'],
                            verified_at: new Date(),
                        }
                    });
                }
            }

            // Only add verified payment if status > payment_verification
            if (d.status === 'verified' || d.status === 'accepted') {
                const paymentCount = await prisma.pembayaran.count({ where: { pendaftar_id: pendaftar.id } });
                if (paymentCount === 0) {
                    await prisma.pembayaran.create({
                        data: {
                            pendaftar_id: pendaftar.id,
                            tahun_ajaran_id: tahunAjaran.id,
                            metode_pembayaran: 'manual',
                            jumlah: 250000,
                            status_pembayaran: 'verified',
                            verified_by: createdUsers['ADMIN_KEUANGAN'],
                            verified_at: new Date(),
                        }
                    });
                }
            }
        }
    }

    // Clean up old bad data (REG-2025-00x)
    console.log('Cleaning up old test data...');
    const oldRegs = ['REG-2025-001', 'REG-2025-002', 'REG-2025-003', 'REG-2025-004'];
    for (const reg of oldRegs) {
        await prisma.pendaftar.deleteMany({ where: { nomor_pendaftaran: reg } });
    }

    console.log('Seeding finished successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
