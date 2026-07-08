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
        { nik: '1234567890123451', no: 'MTA2600001', name: 'Muhammad Al-Fatih', gender: 'L', jenjang: 'MTs', status: 'draft', vStatus: 'pending', phone: '081234567891', email: 'fatih@example.com', prov: 'BANTEN', kab: 'KABUPATEN SERANG', hasExam: false },
        { nik: '1234567890123452', no: 'MTI2600001', name: 'Aisyah Azzahra', gender: 'P', jenjang: 'MTs', status: 'payment_verification', vStatus: 'verified', phone: '081234567892', email: 'aisyah@example.com', prov: 'DKI JAKARTA', kab: 'JAKARTA SELATAN', hasExam: true, scores: { quran: 85, akademi: 90, keprib: 88, sesuai: 90 } },
        { nik: '1234567890123453', no: 'ILA2600001', name: 'Umar Bin Khattab', gender: 'L', jenjang: 'MA', status: 'verified', vStatus: 'verified', phone: '081234567893', email: 'umar@example.com', prov: 'JAWA BARAT', kab: 'KOTA DEPOK', hasExam: true, scores: { quran: null, akademi: null, keprib: null, sesuai: null } },
        { nik: '1234567890123454', no: 'ILI2600001', name: 'Khadijah Bint Khuwaylid', gender: 'P', jenjang: 'MA', status: 'accepted', vStatus: 'verified', phone: '081234567894', email: 'khadijah@example.com', prov: 'BANTEN', kab: 'KOTA SERANG', hasExam: true, scores: { quran: 95, akademi: 85, keprib: 92, sesuai: 95 } },
    
        // Additional realistic demo data
        { nik: '3201000000000005', no: 'MTA2600002', name: 'Zaid Bin Tsabit', gender: 'L', jenjang: 'MTs', status: 'accepted', vStatus: 'verified', phone: '081234567895', email: 'zaid@example.com', prov: 'JAWA TENGAH', kab: 'KOTA SEMARANG', hasExam: true, scores: { quran: 90, akademi: 88, keprib: 90, sesuai: 85 } },
        { nik: '3201000000000006', no: 'MTI2600002', name: 'Fatimah Az-Zahra', gender: 'P', jenjang: 'MTs', status: 'verified', vStatus: 'verified', phone: '081234567896', email: 'fatimah@example.com', prov: 'JAWA TIMUR', kab: 'KOTA SURABAYA', hasExam: true, scores: { quran: 92, akademi: 95, keprib: 85, sesuai: 88 } },
        { nik: '3201000000000007', no: 'ILA2600002', name: 'Ali Bin Abi Thalib', gender: 'L', jenjang: 'MA', status: 'payment_verification', vStatus: 'pending', phone: '081234567897', email: 'ali@example.com', prov: 'BANTEN', kab: 'KOTA TANGERANG', hasExam: false },
        { nik: '3201000000000008', no: 'ILI2600002', name: 'Zainab Bint Ali', gender: 'P', jenjang: 'MA', status: 'draft', vStatus: 'pending', phone: '081234567898', email: 'zainab@example.com', prov: 'DKI JAKARTA', kab: 'JAKARTA TIMUR', hasExam: false },
        { nik: '3201000000000009', no: 'MTA2600003', name: 'Khalid Bin Walid', gender: 'L', jenjang: 'MTs', status: 'verified', vStatus: 'verified', phone: '081234567899', email: 'khalid@example.com', prov: 'JAWA BARAT', kab: 'KOTA BANDUNG', hasExam: true, scores: { quran: 75, akademi: 80, keprib: 70, sesuai: 75 } },
        { nik: '3201000000000010', no: 'MTI2600003', name: 'Ruqayyah Bint Muhammad', gender: 'P', jenjang: 'MTs', status: 'draft', vStatus: 'pending', phone: '081234567800', email: 'ruqayyah@example.com', prov: 'BANTEN', kab: 'KABUPATEN PANDEGLANG', hasExam: false },
        { nik: '3201000000000011', no: 'ILA2600003', name: 'Hasan Bin Ali', gender: 'L', jenjang: 'MA', status: 'accepted', vStatus: 'verified', phone: '081234567811', email: 'hasan@example.com', prov: 'JAWA BARAT', kab: 'KABUPATEN BOGOR', hasExam: true, scores: { quran: 88, akademi: 92, keprib: 85, sesuai: 90 } },
        { nik: '3201000000000012', no: 'ILI2600003', name: 'Asma Bint Abu Bakar', gender: 'P', jenjang: 'MA', status: 'payment_verification', vStatus: 'verified', phone: '081234567812', email: 'asma@example.com', prov: 'DKI JAKARTA', kab: 'JAKARTA BARAT', hasExam: true, scores: { quran: null, akademi: null, keprib: null, sesuai: null } },
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
                provinsi: d.prov,
                kabupaten: d.kab,
                data_lengkap: JSON.stringify({
                    provinsi: d.prov,
                    kabupaten_kota: d.kab,
                    kecamatan: "Contoh Kecamatan",
                    kelurahan_desa: "Contoh Kelurahan"
                })
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
                provinsi: d.prov,
                kabupaten: d.kab,
                kode_pos: '12345',
                no_hp: d.phone,
                status_pendaftaran: d.status,
                verifikasi_status: d.vStatus,
                data_lengkap: JSON.stringify({
                    provinsi: d.prov,
                    kabupaten_kota: d.kab,
                    kecamatan: "Contoh Kecamatan",
                    kelurahan_desa: "Contoh Kelurahan"
                })
            },
        });

        // Add dummy parent data
        await prisma.orangTua.upsert({
            where: { pendaftar_id: pendaftar.id },
            update: {},
            create: {
                pendaftar_id: pendaftar.id,
                nama_ayah: `Ayah dari ${d.name}`,
                nik_ayah: `3201${d.nik.substring(4)}`,
                pekerjaan_ayah: 'Pegawai Swasta',
                no_hp_ayah: '08111111111',
                nama_ibu: `Ibu dari ${d.name}`,
                nik_ibu: `3202${d.nik.substring(4)}`,
                pekerjaan_ibu: 'Ibu Rumah Tangga',
                no_hp_ibu: '08222222222',
            }
        });

        // Add Data Asrama
        const asramaCount = await prisma.dataAsrama.count({ where: { pendaftar_id: pendaftar.id } });
        if (asramaCount === 0) {
            await prisma.dataAsrama.create({
                data: {
                    pendaftar_id: pendaftar.id,
                    pilihan_asrama: true,
                    bersedia_cabang: true
                }
            });
        }

        // Add Data Kesehatan
        const kesehatanCount = await prisma.dataKesehatan.count({ where: { pendaftar_id: pendaftar.id } });
        if (kesehatanCount === 0) {
            await prisma.dataKesehatan.create({
                data: {
                    pendaftar_id: pendaftar.id,
                    tinggi_badan: 160,
                    berat_badan: 50,
                    is_verified: d.vStatus === 'verified',
                }
            });
        }

        // Add verified docs and payment if verified/accepted
        if (d.vStatus === 'verified') {
            const doks = ['kartu_keluarga', 'akta_kelahiran', 'rapor_sem1', 'rapor_sem2'];
            for (const doc of doks) {
                const count = await prisma.dokumen.count({ where: { pendaftar_id: pendaftar.id, jenis_dokumen: doc } });
                if (count === 0) {
                    await prisma.dokumen.create({
                        data: {
                            pendaftar_id: pendaftar.id,
                            jenis_dokumen: doc,
                            file_name: `${doc}.jpg`,
                            file_path: `uploads/${doc}.jpg`,
                            file_data: Buffer.from('dummybase64'),
                            is_verified: true,
                            verified_by: createdUsers['ADMIN_BERKAS'],
                            verified_at: new Date(),
                        }
                    });
                }
            }

            if (d.status === 'verified' || d.status === 'accepted') {
                const paymentCount = await prisma.pembayaran.count({ where: { pendaftar_id: pendaftar.id, jenis_pembayaran: 'PENDAFTARAN' } });
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
                            jenis_pembayaran: 'PENDAFTARAN'
                        }
                    });
                }
            }
        }

        // Add Exam data
        if (d.hasExam) {
            const jadwalCount = await prisma.jadwalUjian.count({ where: { pendaftar_id: pendaftar.id } });
            let jadwalId;
            if (jadwalCount === 0) {
                const jadwal = await prisma.jadwalUjian.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        tanggal_ujian: new Date(),
                        metode_ujian: 'offline',
                        waktu_mulai_santri: new Date('2025-01-01T08:00:00Z'),
                        waktu_selesai_santri: new Date('2025-01-01T10:00:00Z'),
                        tempat_santri: 'Gedung A',
                        waktu_mulai_ortu: new Date('2025-01-01T10:00:00Z'),
                        waktu_selesai_ortu: new Date('2025-01-01T11:00:00Z'),
                        tempat_ortu: 'Gedung B',
                        status_santri: d.scores ? 'completed' : 'scheduled',
                        status_ortu: d.scores ? 'completed' : 'scheduled',
                        status_quran: d.scores ? 'completed' : 'scheduled',
                    }
                });
                jadwalId = jadwal.id;
            } else {
                const existing = await prisma.jadwalUjian.findFirst({ where: { pendaftar_id: pendaftar.id } });
                jadwalId = existing!.id;
            }

            if (d.scores) {
                const nilaiCount = await prisma.nilaiUjian.count({ where: { pendaftar_id: pendaftar.id } });
                if (nilaiCount === 0) {
                    await prisma.nilaiUjian.create({
                        data: {
                            pendaftar_id: pendaftar.id,
                            jadwal_ujian_id: jadwalId,
                            nilai_tes_tertulis_total: d.scores.akademi,
                            nilai_santri_total: d.scores.keprib,
                            nilai_tes_quran: d.scores.quran,
                            nilai_wawancara_ortu: d.scores.sesuai,
                            nilai_total: (d.scores.akademi! + d.scores.keprib! + d.scores.quran! + d.scores.sesuai!) / 4,
                            status_kelulusan: d.status === 'accepted' ? 'LULUS' : 'MENUNGGU',
                        }
                    });
                }
            }
        }

        // Add Hasil Seleksi and Pengumuman if accepted
        if (d.status === 'accepted') {
            const hasilCount = await prisma.hasilSeleksi.count({ where: { pendaftar_id: pendaftar.id } });
            if (hasilCount === 0) {
                await prisma.hasilSeleksi.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        status_seleksi: 'DITERIMA',
                        nilai_akhir: 90,
                        ditentukan_oleh: createdUsers['ADMIN_SUPER'],
                        ditentukan_pada: new Date(),
                    }
                });
            }
            const pengumumanCount = await prisma.pengumuman.count({ where: { pendaftar_id: pendaftar.id } });
            if (pengumumanCount === 0) {
                await prisma.pengumuman.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        status_kelulusan: 'DITERIMA',
                        is_published: true,
                        published_at: new Date(),
                        published_by: createdUsers['ADMIN_SUPER'],
                    }
                });
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
