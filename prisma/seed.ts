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

    // 2. Create Users (Profiles) DIRECTLY in Database (No Supabase Auth)
    const usersToCreate = [
        { email: 'admin@alimam.com', password: 'password123', role: 'admin_super', name: 'Super Admin', phone: '081234567890', label: 'ADMIN_SUPER' },

        // Specific Role Admins
        { email: 'admin.berkas@alimam.com', password: 'password123', role: 'admin_berkas', name: 'Admin Berkas', phone: '081234567801', label: 'ADMIN_BERKAS' },
        { email: 'admin.keuangan@alimam.com', password: 'password123', role: 'admin_keuangan', name: 'Admin Keuangan', phone: '081234567802', label: 'ADMIN_KEUANGAN' },
        { email: 'penguji@alimam.com', password: 'password123', role: 'penguji', name: 'Ustadz Penguji', phone: '081234567803', label: 'PENGUJI' },

        // Pendaftar Test Accounts
        { email: 'user.draft@example.com', password: 'password123', role: 'pendaftar', name: 'Ahmad Draft', phone: '081234567891', label: 'DRAFT' },
        { email: 'user.pending@example.com', password: 'password123', role: 'pendaftar', name: 'Budi Pending', phone: '081234567892', label: 'PENDING' },
        { email: 'user.verified@example.com', password: 'password123', role: 'pendaftar', name: 'Citra Verified', phone: '081234567893', label: 'VERIFIED' },
        { email: 'user.completed@example.com', password: 'password123', role: 'pendaftar', name: 'Dewi Completed', phone: '081234567894', label: 'COMPLETED' },
    ];

    const createdUsers: Record<string, string> = {};

    for (const u of usersToCreate) {
        console.log(`Processing user: ${u.email}...`);

        // Check if profile exists by email
        const existingProfile = await prisma.profile.findFirst({
            where: { email: u.email }
        });

        let userId = existingProfile?.id;

        if (!existingProfile) {
            // Create new profile
            userId = crypto.randomUUID();
            const hashedPassword = await bcrypt.hash(u.password, 10);

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
            // Update existing profile (optional, to ensure password matches)
            const hashedPassword = await bcrypt.hash(u.password, 10);
            await prisma.profile.update({
                where: { id: userId },
                data: {
                    password_hash: hashedPassword,
                    role: u.role,
                    full_name: u.name,
                    phone: u.phone
                }
            });
            console.log(`Updated existing user: ${u.email}`);
        }

        createdUsers[u.label] = userId!;
    }

    console.log('Created/Verified Users & Profiles');

    // 3. Seed Pendaftar
    const { ADMIN, ADMIN_SUPER, ADMIN_BERKAS, ADMIN_KEUANGAN, PENGUJI, DRAFT, PENDING, VERIFIED, COMPLETED } = createdUsers;

    // --- Case 1: Draft (MTs) ---
    console.log('Seeding DRAFT...');
    await prisma.pendaftar.upsert({
        where: { nomor_pendaftaran: 'REG-2025-001' },
        update: {},
        create: {
            user_id: DRAFT,
            tahun_ajaran_id: tahunAjaran.id,
            nomor_pendaftaran: 'REG-2025-001',
            nik: '3201000000000001',
            nama_lengkap: 'Ahmad Draft',
            jenis_kelamin: 'L',
            jenjang: 'MTs',
            status_pendaftaran: 'draft',
            verifikasi_status: 'pending',
        },
    });

    // --- Case 2: Pending (MA) - Represents Payment Verification ---
    console.log('Seeding PENDING...');
    const pendaftarPending = await prisma.pendaftar.upsert({
        where: { nomor_pendaftaran: 'REG-2025-002' },
        update: {},
        create: {
            user_id: PENDING,
            tahun_ajaran_id: tahunAjaran.id,
            nomor_pendaftaran: 'REG-2025-002',
            nik: '3201000000000002',
            nama_lengkap: 'Budi Pending',
            jenis_kelamin: 'L',
            jenjang: 'MA',
            tempat_lahir: 'Jakarta',
            tanggal_lahir: new Date('2010-01-01'),
            alamat: 'Jl. Merdeka No. 1',
            no_hp: '081234567892',
            status_pendaftaran: 'payment_verification',
            verifikasi_status: 'verified',
        },
    });

    await prisma.orangTua.upsert({
        where: { pendaftar_id: pendaftarPending.id },
        update: {},
        create: {
            pendaftar_id: pendaftarPending.id,
            nama_ayah: 'Ayah Budi',
            no_hp_ayah: '08111111111',
        }
    });

    // --- Case 3: Verified (MTs) ---
    console.log('Seeding VERIFIED...');
    const pendaftarVerified = await prisma.pendaftar.upsert({
        where: { nomor_pendaftaran: 'REG-2025-003' },
        update: {},
        create: {
            user_id: VERIFIED,
            tahun_ajaran_id: tahunAjaran.id,
            nomor_pendaftaran: 'REG-2025-003',
            nik: '3201000000000003',
            nama_lengkap: 'Citra Verified',
            jenis_kelamin: 'P',
            jenjang: 'MTs',
            tempat_lahir: 'Bandung',
            tanggal_lahir: new Date('2010-02-02'),
            alamat: 'Jl. Asia Afrika No. 10',
            status_pendaftaran: 'verified',
            verifikasi_status: 'verified',
        },
    });

    // CORRECTED: document types
    const doks = ['kartu_keluarga', 'akta_kelahiran'];
    for (const d of doks) {
        const count = await prisma.dokumen.count({ where: { pendaftar_id: pendaftarVerified.id, jenis_dokumen: d } });
        if (count === 0) {
            await prisma.dokumen.create({
                data: {
                    pendaftar_id: pendaftarVerified.id,
                    jenis_dokumen: d,
                    file_name: `${d}.pdf`,
                    file_path: `uploads/${d}.pdf`,
                    is_verified: true,
                    verified_by: createdUsers['ADMIN_BERKAS'] || ADMIN,
                    verified_at: new Date(),
                }
            });
        }
    }

    await prisma.pembayaran.deleteMany({ where: { pendaftar_id: pendaftarVerified.id } });
    await prisma.pembayaran.create({
        data: {
            pendaftar_id: pendaftarVerified.id,
            tahun_ajaran_id: tahunAjaran.id,
            metode_pembayaran: 'manual', // CORRECTED: 'manual_transfer' -> 'manual'
            jumlah: 250000,
            status_pembayaran: 'verified',
            verified_by: createdUsers['ADMIN_KEUANGAN'] || ADMIN,
            verified_at: new Date(),
        }
    });

    // --- Case 4: Completed (MA) ---
    console.log('Seeding ACCEPTED...');
    const pendaftarCompleted = await prisma.pendaftar.upsert({
        where: { nomor_pendaftaran: 'REG-2025-004' },
        update: {},
        create: {
            user_id: COMPLETED,
            tahun_ajaran_id: tahunAjaran.id,
            nomor_pendaftaran: 'REG-2025-004',
            nik: '3201000000000004',
            nama_lengkap: 'Dewi Completed',
            jenis_kelamin: 'P',
            jenjang: 'MA',
            status_pendaftaran: 'accepted',
            verifikasi_status: 'verified',
        },
    });

    console.log('Seeding finished successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        const fs = await import('fs');
        fs.writeFileSync('seed_error.txt', JSON.stringify(e, null, 2) + '\n' + e.toString());
        await prisma.$disconnect();
        process.exit(1);
    });
