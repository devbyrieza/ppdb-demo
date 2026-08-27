import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding super complete dummy data...');

    let tahunAjaran = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });

    if (!tahunAjaran) {
        tahunAjaran = await prisma.tahunAjaran.create({
            data: {
                tahun_mulai: 2025,
                tahun_selesai: 2026,
                is_active: true,
                nama: '2025/2026',
                tanggal_buka_pendaftaran: new Date('2025-01-01'),
                tanggal_tutup_pendaftaran: new Date('2025-12-31'),
                biaya_pendaftaran: 250000,
            }
        });
        console.log(`Created new Tahun Ajaran: 2025/2026`);
    }

    // 1. CREATE ADMIN & PENGUJI ACCOUNTS
    const staffToCreate = [
        { email: 'admin@ppdb-demo.com', role: 'admin_super', name: 'Super Admin', phone: '08111111111', label: 'ADMIN_SUPER' },
        { email: 'berkas@ppdb-demo.com', role: 'admin_berkas', name: 'Admin Berkas', phone: '08111111112', label: 'ADMIN_BERKAS' },
        { email: 'keuangan@ppdb-demo.com', role: 'admin_keuangan', name: 'Admin Keuangan', phone: '08111111113', label: 'ADMIN_KEUANGAN' },
        
        // Penguji (Fake Names)
        { email: 'ust.abdullah@ppdb-demo.com', role: 'penguji', name: 'Ustadz Abdullah', phone: '08111111121', label: 'PENGUJI_A' },
        { email: 'ust.abdurrahman@ppdb-demo.com', role: 'penguji', name: 'Ustadz Abdurrahman', phone: '08111111122', label: 'PENGUJI_B' },
        { email: 'ust.umar@ppdb-demo.com', role: 'pewawancara_calsan', name: 'Ustadz Umar', phone: '08111111123', label: 'PENGUJI_C' },
        { email: 'ust.ahmad@ppdb-demo.com', role: 'pewawancara_cawalsan', name: 'Ustadz Ahmad', phone: '08111111124', label: 'PENGUJI_D' },
        { email: 'ustazah.fatimah@ppdb-demo.com', role: 'penguji', name: 'Ustadzah Fatimah', phone: '08111111125', label: 'PENGUJI_E' },
    ];

    const passwordHash = await bcrypt.hash("Andalus2026!", 10);
    const createdUsers: Record<string, string> = {};

    for (const u of staffToCreate) {
        let user = await prisma.profile.findFirst({ where: { email: u.email } });
        if (!user) {
            user = await prisma.profile.create({
                data: {
                    email: u.email,
                    password_hash: passwordHash,
                    role: u.role,
                    full_name: u.name,
                    phone: u.phone,
                    secondary_roles: u.role === 'penguji' ? ['penguji_hafalan', 'penguji_bahasa_arab', 'pewawancara_calsan', 'pewawancara_cawalsan'] : [],
                }
            });
        } else {
            user = await prisma.profile.update({
                where: { id: user.id },
                data: { role: u.role, password_hash: passwordHash, full_name: u.name, phone: u.phone, secondary_roles: u.role === 'penguji' ? ['penguji_hafalan', 'penguji_bahasa_arab', 'pewawancara_calsan', 'pewawancara_cawalsan'] : [] }
            });
        }
        createdUsers[u.label] = user.id;
    }
    console.log('✅ Admin & Penguji created.');

    // 2. CREATE PENGUJI SESSIONS (Ketersediaan)
    const pengujiIds = [createdUsers['PENGUJI_A'], createdUsers['PENGUJI_B'], createdUsers['PENGUJI_C'], createdUsers['PENGUJI_D'], createdUsers['PENGUJI_E']];
    for (const pid of pengujiIds) {
        const check = await prisma.ketersediaanPenguji.count({ where: { penguji_id: pid } });
        if (check === 0) {
            await prisma.ketersediaanPenguji.create({
                data: {
                    penguji_id: pid,
                    tanggal: new Date(),
                    waktu_mulai: new Date('2025-01-01T08:00:00Z'),
                    waktu_selesai: new Date('2025-01-01T15:00:00Z'),
                    jenis_ujian: 'ALL',
                    is_available: true
                }
            });
        }
    }

    // 3. CREATE SANTRI DUMMY DATA
    // We will generate 30 students to populate all charts
    const fakes = [
        // Lulus (Accepted & Enrolled) - 10 students
        { no: 'MTA2500001', nik: '32010101010001', name: 'Muhammad Fulan', gender: 'L', jenjang: 'MTs', status: 'enrolled_full', skor: 95 },
        { no: 'MTA2500002', nik: '32010101010002', name: 'Ahmad Fulan', gender: 'L', jenjang: 'MTs', status: 'enrolled', skor: 90 },
        { no: 'MTA2500003', nik: '32010101010003', name: 'Ibrahim Fulan', gender: 'L', jenjang: 'MTs', status: 'accepted', skor: 88 },
        { no: 'MTA2500004', nik: '32010101010004', name: 'Yusuf Fulan', gender: 'L', jenjang: 'MTs', status: 'accepted', skor: 85 },
        { no: 'ILA2600005', nik: '32010101010005', name: 'Ismail Fulan', gender: 'L', jenjang: 'MA', status: 'enrolled_full', skor: 92 },
        { no: 'ILI2600006', nik: '32010101010006', name: 'Fulanah Binti Fulan', gender: 'P', jenjang: 'MA', status: 'enrolled', skor: 91 },
        { no: 'MTI2600007', nik: '32010101010007', name: 'Aisyah Fulanah', gender: 'P', jenjang: 'MTs', status: 'accepted', skor: 89 },
        { no: 'MTI2600008', nik: '32010101010008', name: 'Fatimah Fulanah', gender: 'P', jenjang: 'MTs', status: 'accepted', skor: 86 },
        { no: 'ILI2600009', nik: '32010101010009', name: 'Khadijah Fulanah', gender: 'P', jenjang: 'MA', status: 'enrolled_full', skor: 94 },
        { no: 'ILA2600010', nik: '32010101010010', name: 'Umar Fulan', gender: 'L', jenjang: 'MA', status: 'accepted', skor: 87 },

        // Pengumuman / Tested (Menunggu Hasil) - 5 students
        { no: 'MTA2500011', nik: '32010101010011', name: 'Hasan Fulan', gender: 'L', jenjang: 'MTs', status: 'announced', skor: 80, seleksi: 'CADANGAN' },
        { no: 'MTA2500012', nik: '32010101010012', name: 'Husein Fulan', gender: 'L', jenjang: 'MTs', status: 'announced', skor: 70, seleksi: 'DITOLAK' },
        { no: 'ILI2600013', nik: '32010101010013', name: 'Zainab Fulanah', gender: 'P', jenjang: 'MA', status: 'tested', skor: 82 },
        { no: 'MTI2600014', nik: '32010101010014', name: 'Ruqayyah Fulanah', gender: 'P', jenjang: 'MTs', status: 'tested', skor: 81 },
        { no: 'ILA2600015', nik: '32010101010015', name: 'Ali Fulan', gender: 'L', jenjang: 'MA', status: 'scheduled', skor: null },

        // Berkas / Verified - 5 students
        { no: 'MTA2500016', nik: '32010101010016', name: 'Zaid Fulan', gender: 'L', jenjang: 'MTs', status: 'docs_verified', skor: null },
        { no: 'ILI2600017', nik: '32010101010017', name: 'Hafshah Fulanah', gender: 'P', jenjang: 'MA', status: 'docs_uploaded', skor: null },
        { no: 'ILA2600018', nik: '32010101010018', name: 'Usman Fulan', gender: 'L', jenjang: 'MA', status: 'verified', skor: null },
        { no: 'MTI2600019', nik: '32010101010019', name: 'Maimunah Fulanah', gender: 'P', jenjang: 'MTs', status: 'verified', skor: null },
        { no: 'MTA2500020', nik: '32010101010020', name: 'Tariq Fulan', gender: 'L', jenjang: 'MTs', status: 'payment_verification', skor: null },

        // Draft / Menunggu Bayar - 10 students
        { no: 'MTA2500021', nik: '32010101010021', name: 'Khalid Fulan', gender: 'L', jenjang: 'MTs', status: 'awaiting_payment', skor: null },
        { no: 'ILI2600022', nik: '32010101010022', name: 'Safiyyah Fulanah', gender: 'P', jenjang: 'MA', status: 'draft', skor: null },
        { no: 'MTA2500023', nik: '32010101010023', name: 'Amr Fulan', gender: 'L', jenjang: 'MTs', status: 'draft', skor: null },
        { no: 'MTI2600024', nik: '32010101010024', name: 'Asma Fulanah', gender: 'P', jenjang: 'MTs', status: 'draft', skor: null },
        { no: 'ILA2600025', nik: '32010101010025', name: 'Hamzah Fulan', gender: 'L', jenjang: 'MA', status: 'draft', skor: null },
        { no: 'ILI2600026', nik: '32010101010026', name: 'Salma Fulanah', gender: 'P', jenjang: 'MA', status: 'draft', skor: null },
        { no: 'MTA2500027', nik: '32010101010027', name: 'Salman Fulan', gender: 'L', jenjang: 'MTs', status: 'draft', skor: null },
        { no: 'MTI2600028', nik: '32010101010028', name: 'Juwayriyyah Fulanah', gender: 'P', jenjang: 'MTs', status: 'draft', skor: null },
        { no: 'ILA2600029', nik: '32010101010029', name: 'Anas Fulan', gender: 'L', jenjang: 'MA', status: 'draft', skor: null },
        { no: 'MTA2500030', nik: '32010101010030', name: 'Fatih Fulan', gender: 'L', jenjang: 'MTs', status: 'draft', skor: null },
    ];

    console.log('Generating Santri data...');

    for (let i = 0; i < fakes.length; i++) {
        const d = fakes[i];
        const email = `santri_${i+1}@example.com`;
        const phone = `081200000${i.toString().padStart(3, '0')}`;
        
        let user = await prisma.profile.findFirst({ where: { email } });
        if (!user) {
            user = await prisma.profile.create({
                data: {
                    email,
                    password_hash: passwordHash,
                    role: 'pendaftar',
                    full_name: d.name,
                    phone
                }
            });
        }
        const userId = user.id;

        const isAccepted = ['accepted', 'enrolled', 'enrolled_full'].includes(d.status);

        const pendaftar = await prisma.pendaftar.upsert({
            where: { nomor_pendaftaran: d.no },
            update: {
                user_id: userId,
                nama_lengkap: d.name,
                status_pendaftaran: d.status,
                ukuran_seragam_baju: isAccepted ? 'M' : null,
                ukuran_seragam_celana: isAccepted ? 'M' : null,
                ukuran_seragam_almamater: isAccepted ? 'L' : null,
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
                alamat: 'Jl. Simulasi Data No. 123',
                provinsi: 'DKI JAKARTA',
                kabupaten: 'JAKARTA SELATAN',
                kode_pos: '12345',
                no_hp: phone,
                status_pendaftaran: d.status,
                verifikasi_status: d.status === 'draft' ? 'pending' : 'verified',
                ukuran_seragam_baju: isAccepted ? 'M' : null,
                ukuran_seragam_celana: isAccepted ? 'M' : null,
                ukuran_seragam_almamater: isAccepted ? 'L' : null,
                data_lengkap: JSON.stringify({
                    provinsi: 'DKI JAKARTA',
                    kabupaten_kota: 'JAKARTA SELATAN',
                    kecamatan: "Kebayoran",
                    kelurahan_desa: "Senayan"
                })
            },
        });

        // 4. PEMBAYARAN PENDAFTARAN
        if (d.status !== 'draft') {
            const count = await prisma.pembayaran.count({ where: { pendaftar_id: pendaftar.id, jenis_pembayaran: 'PENDAFTARAN' } });
            if (count === 0) {
                await prisma.pembayaran.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        metode_pembayaran: 'manual',
                        jumlah: 250000,
                        status_pembayaran: d.status === 'payment_verification' ? 'pending' : 'verified',
                        verified_by: d.status !== 'payment_verification' ? createdUsers['ADMIN_KEUANGAN'] : null,
                        verified_at: d.status !== 'payment_verification' ? new Date() : null,
                        jenis_pembayaran: 'PENDAFTARAN',
                    }
                });
            } else {
                 const p = await prisma.pembayaran.findFirst({ where: { pendaftar_id: pendaftar.id, jenis_pembayaran: 'PENDAFTARAN' } });
                 await prisma.pembayaran.update({
                     where: { id: p!.id },
                     data: {
                        status_pembayaran: d.status === 'payment_verification' ? 'pending' : 'verified',
                     }
                 });
            }
        }

        // 5. PEMBAYARAN DAFTAR ULANG
        if (isAccepted) {
            const countDU = await prisma.pembayaran.count({ where: { pendaftar_id: pendaftar.id, jenis_pembayaran: 'DAFTAR_ULANG' } });
            if (countDU === 0) {
                await prisma.pembayaran.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        metode_pembayaran: 'manual',
                        jumlah: 25000000,
                        status_pembayaran: d.status === 'enrolled_full' ? 'verified' : (d.status === 'enrolled' ? 'pending' : 'pending'),
                        jenis_pembayaran: 'DAFTAR_ULANG',
                        tipe_cicilan: 'LUNAS',
                        total_tagihan: 25000000,
                        verified_by: d.status === 'enrolled_full' ? createdUsers['ADMIN_KEUANGAN'] : null,
                        verified_at: d.status === 'enrolled_full' ? new Date() : null,
                    }
                });
            } else {
                 const p = await prisma.pembayaran.findFirst({ where: { pendaftar_id: pendaftar.id, jenis_pembayaran: 'DAFTAR_ULANG' } });
                 await prisma.pembayaran.update({
                     where: { id: p!.id },
                     data: {
                        status_pembayaran: d.status === 'enrolled_full' ? 'verified' : 'pending',
                     }
                 });
            }
        }

        // 6. DOKUMEN & KESEHATAN
        if (['verified', 'docs_uploaded', 'docs_verified', 'scheduled', 'tested', 'announced', 'accepted', 'enrolled', 'enrolled_full'].includes(d.status)) {
            const doks = ['kartu_keluarga', 'akta_kelahiran', 'rapor'];
            for (const doc of doks) {
                const docCount = await prisma.dokumen.count({ where: { pendaftar_id: pendaftar.id, jenis_dokumen: doc } });
                if (docCount === 0) {
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

            const kesCount = await prisma.dataKesehatan.count({ where: { pendaftar_id: pendaftar.id } });
            if (kesCount === 0) {
                await prisma.dataKesehatan.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tinggi_badan: 160,
                        berat_badan: 50,
                        is_verified: true,
                    }
                });
            }
        }

        // 7. JADWAL & NILAI (FEE PENGUJI)
        if (['scheduled', 'tested', 'announced', 'accepted', 'enrolled', 'enrolled_full'].includes(d.status)) {
            // Randomly assign penguji
            const pengujiQuran = pengujiIds[i % 5];
            const pengujiSantri = pengujiIds[(i + 1) % 5];
            const pengujiOrtu = pengujiIds[(i + 2) % 5];
            const pengujiHafalan = pengujiIds[(i + 3) % 5];
            const pengujiArab = pengujiIds[(i + 4) % 5];

            // Spread out schedule times to avoid conflicts!
            const startTimeQuran = new Date(`2025-01-01T${(8 + (i % 6)).toString().padStart(2, '0')}:00:00Z`);
            const endTimeQuran = new Date(`2025-01-01T${(9 + (i % 6)).toString().padStart(2, '0')}:00:00Z`);
            
            const startTimeSantri = new Date(`2025-01-01T${(9 + (i % 6)).toString().padStart(2, '0')}:00:00Z`);
            const endTimeSantri = new Date(`2025-01-01T${(10 + (i % 6)).toString().padStart(2, '0')}:00:00Z`);
            
            const startTimeOrtu = new Date(`2025-01-01T${(10 + (i % 6)).toString().padStart(2, '0')}:00:00Z`);
            const endTimeOrtu = new Date(`2025-01-01T${(11 + (i % 6)).toString().padStart(2, '0')}:00:00Z`);
            
            const startTimeHafalan = new Date(`2025-01-01T${(11 + (i % 6)).toString().padStart(2, '0')}:00:00Z`);
            const endTimeHafalan = new Date(`2025-01-01T${(12 + (i % 6)).toString().padStart(2, '0')}:00:00Z`);
            
            const startTimeArab = new Date(`2025-01-01T${(12 + (i % 6)).toString().padStart(2, '0')}:00:00Z`);
            const endTimeArab = new Date(`2025-01-01T${(13 + (i % 6)).toString().padStart(2, '0')}:00:00Z`);

            let jadwal = await prisma.jadwalUjian.findFirst({ where: { pendaftar_id: pendaftar.id } });
            if (!jadwal) {
                jadwal = await prisma.jadwalUjian.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        tanggal_ujian: new Date(),
                        metode_ujian: 'offline',
                        waktu_mulai_santri: startTimeSantri,
                        waktu_selesai_santri: endTimeSantri,
                        tempat_santri: 'Ruang A',
                        penguji_santri_id: pengujiSantri,
                        status_santri: d.skor ? 'completed' : 'scheduled',

                        waktu_mulai_ortu: startTimeOrtu,
                        waktu_selesai_ortu: endTimeOrtu,
                        tempat_ortu: 'Ruang B',
                        penguji_ortu_id: pengujiOrtu,
                        status_ortu: d.skor ? 'completed' : 'scheduled',

                        penguji_quran_id: pengujiQuran,
                        status_quran: d.skor ? 'completed' : 'scheduled',

                        waktu_mulai_hafalan: startTimeHafalan,
                        waktu_selesai_hafalan: endTimeHafalan,
                        tempat_hafalan: 'Ruang C',
                        penguji_hafalan_id: pengujiHafalan,
                        status_hafalan: d.skor ? 'completed' : 'scheduled',

                        waktu_mulai_arab: startTimeArab,
                        waktu_selesai_arab: endTimeArab,
                        tempat_arab: 'Ruang D',
                        penguji_arab_id: pengujiArab,
                        status_arab: d.skor ? 'completed' : 'scheduled',
                    }
                });
            }

            if (d.skor) {
                const nilaiCount = await prisma.nilaiUjian.count({ where: { pendaftar_id: pendaftar.id } });
                let s_kelulusan = 'LULUS';
                if ((d as any).seleksi === 'CADANGAN') s_kelulusan = 'CADANGAN';
                if ((d as any).seleksi === 'DITOLAK') s_kelulusan = 'TIDAK_LULUS';

                if (nilaiCount === 0) {
                    await prisma.nilaiUjian.create({
                        data: {
                            pendaftar_id: pendaftar.id,
                            jadwal_ujian_id: jadwal.id,
                            nilai_tes_tertulis_total: d.skor,
                            nilai_santri_total: d.skor - 2,
                            nilai_tes_quran: d.skor + 1,
                            nilai_wawancara_ortu: d.skor - 1,
                            score_hafalan: d.skor,
                            score_arab: d.skor - 3,
                            nilai_total: d.skor,
                            status_kelulusan: s_kelulusan,
                            
                            // To ensure Fee Penguji calculates correctly:
                            input_by_quran: pengujiQuran,
                            input_by_santri: pengujiSantri,
                            input_by_ortu: pengujiOrtu,
                            input_by_hafalan: pengujiHafalan,
                            input_by_arab: pengujiArab,

                            input_at_quran: new Date(),
                            input_at_santri: new Date(),
                            input_at_ortu: new Date(),
                            input_at_hafalan: new Date(),
                            input_at_arab: new Date(),
                            
                            // To ensure Monitoring Dashboard detects completion:
                            detail_quran: { rekomendasi: 'Disarankan', nama_penguji: 'Ustadz Penguji' },
                            detail_wawancara: { rekomendasi: 'Disarankan', nama_penguji: 'Ustadz Penguji' },
                            detail_cawalsan: { rekomendasi: 'Disarankan', nama_penguji: 'Ustadz Penguji' },
                        }
                    });
                } else {
                    const existingNilai = await prisma.nilaiUjian.findFirst({ where: { pendaftar_id: pendaftar.id } });
                    await prisma.nilaiUjian.update({
                        where: { id: existingNilai!.id },
                        data: {
                            detail_quran: { rekomendasi: 'Disarankan', nama_penguji: 'Ustadz Penguji' },
                            detail_wawancara: { rekomendasi: 'Disarankan', nama_penguji: 'Ustadz Penguji' },
                            detail_cawalsan: { rekomendasi: 'Disarankan', nama_penguji: 'Ustadz Penguji' },
                        }
                    });
                }
            }
        }

        // 8. HASIL SELEKSI & PENGUMUMAN
        if (['announced', 'accepted', 'enrolled', 'enrolled_full'].includes(d.status)) {
            let status_seleksi = 'DITERIMA';
            if ((d as any).seleksi === 'CADANGAN') status_seleksi = 'CADANGAN';
            if ((d as any).seleksi === 'DITOLAK') status_seleksi = 'DITOLAK';

            const hsCount = await prisma.hasilSeleksi.count({ where: { pendaftar_id: pendaftar.id } });
            if (hsCount === 0) {
                await prisma.hasilSeleksi.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        status_seleksi: status_seleksi as any,
                        nilai_akhir: d.skor || 0,
                        ditentukan_oleh: createdUsers['ADMIN_SUPER'],
                        ditentukan_pada: new Date(),
                    }
                });
            }

            const pCount = await prisma.pengumuman.count({ where: { pendaftar_id: pendaftar.id } });
            if (pCount === 0) {
                await prisma.pengumuman.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        status_kelulusan: status_seleksi as any,
                        is_published: true,
                        published_at: new Date(),
                        published_by: createdUsers['ADMIN_SUPER'],
                    }
                });
            }
        }

        // 9. BEASISWA / BANTUAN BIAYA
        if (['ILI2600006', 'MTI2600007', 'MTA2500016'].includes(d.no)) {
            const bsCount = await prisma.pengajuanBeasiswa.count({ where: { pendaftar_id: pendaftar.id } });
            if (bsCount === 0) {
                await prisma.pengajuanBeasiswa.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        jenis_pengajuan: 'KERINGANAN_BIAYA',
                        alasan_pengajuan: 'Keluarga kurang mampu',
                        status: d.no === 'ILI2600006' ? 'DISETUJUI' : (d.no === 'MTI2600007' ? 'DISETUJUI' : 'PENDING'),
                        disetujui_oleh: d.no !== 'MTA2500016' ? createdUsers['ADMIN_SUPER'] : null,
                        disetujui_pada: d.no !== 'MTA2500016' ? new Date() : null,
                    }
                });
            }
        }

    }

    console.log('✅ Santri data and related records generated.');
    console.log('Seeding completed successfully.');
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
