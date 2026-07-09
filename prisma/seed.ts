import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    let tahunAjaran = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });

    if (!tahunAjaran) {
        tahunAjaran = await prisma.tahunAjaran.create({
            data: {
                tahun_mulai: 2025,
                tahun_selesai: 2026,
                is_active: true,
            }
        });
        console.log(`Created new Tahun Ajaran: 2025/2026`);
    }

    const usersToCreate = [
        { email: 'admin@ppdb-demo.com', role: 'ADMIN_SUPER', name: 'Super Admin', phone: '080000000000' },
        { email: 'berkas@ppdb-demo.com', role: 'ADMIN_BERKAS', name: 'Admin Berkas', phone: '080000000001' },
        { email: 'keuangan@ppdb-demo.com', role: 'ADMIN_KEUANGAN', name: 'Admin Keuangan', phone: '080000000002' },
        { email: 'quran@ppdb-demo.com', role: 'PENGUJI_QURAN', name: 'Ust. Penguji Quran', phone: '080000000003' },
        { email: 'calsan@ppdb-demo.com', role: 'PENGUJI_CALSAN', name: 'Ust. Penguji Santri', phone: '080000000004' },
        { email: 'cawalsan@ppdb-demo.com', role: 'PENGUJI_CAWALSAN', name: 'Ust. Penguji Ortu', phone: '080000000005' },
    ];

    const passwordHash = await bcrypt.hash('password123', 10);
    const createdUsers: Record<string, string> = {};

    for (const u of usersToCreate) {
        let existingUser = await prisma.profile.findFirst({ where: { email: u.email } });
        let userId = '';
        if (existingUser) {
            await prisma.profile.update({
                where: { id: existingUser.id },
                data: { role: u.role, password_hash: passwordHash, full_name: u.name, phone: u.phone }
            });
            userId = existingUser.id;
        } else {
            const newUser = await prisma.profile.create({
                data: {
                    email: u.email,
                    password_hash: passwordHash,
                    role: u.role,
                    full_name: u.name,
                    phone: u.phone
                }
            });
            userId = newUser.id;
        }
        createdUsers[u.role] = userId;
    }

    const dummyData = [
        { no: 'MTA2500001', nik: '3201010101010001', name: 'Daud Jordan', gender: 'L', jenjang: 'MTs', status: 'accepted', vStatus: 'verified', prov: 'DKI JAKARTA', kab: 'JAKARTA SELATAN', hasExam: true, scores: { akademi: 95, keprib: 90, quran: 85, sesuai: 90 }, email: 'daud@example.com' },
        { no: 'MTA2500002', nik: '3201010101010002', name: 'Zaid Bin Tsabit', gender: 'L', jenjang: 'MTs', status: 'accepted', vStatus: 'verified', prov: 'JAWA BARAT', kab: 'KOTA BANDUNG', hasExam: true, scores: { akademi: 88, keprib: 92, quran: 85, sesuai: 88 }, email: 'zaid@example.com' },
        { no: 'ILI2600001', nik: '3201010101010003', name: 'Khadijah Bint Khuwaylid', gender: 'P', jenjang: 'MA', status: 'accepted', vStatus: 'verified', prov: 'BANTEN', kab: 'KOTA TANGERANG SELATAN', hasExam: true, scores: { akademi: 90, keprib: 95, quran: 90, sesuai: 92 }, email: 'khadijah@example.com' },
        { no: 'ILA2600003', nik: '3201010101010004', name: 'Hasan Bin Ali', gender: 'L', jenjang: 'MA', status: 'accepted', vStatus: 'verified', prov: 'DKI JAKARTA', kab: 'JAKARTA TIMUR', hasExam: true, scores: { akademi: 85, keprib: 90, quran: 95, sesuai: 85 }, email: 'hasan@example.com' },
        { no: 'MTA2500007', nik: '3201010101010011', name: 'Fatih Al-Ayyubi', gender: 'L', jenjang: 'MTs', status: 'accepted', vStatus: 'verified', prov: 'JAWA TENGAH', kab: 'KOTA SEMARANG', hasExam: true, scores: { akademi: 92, keprib: 88, quran: 88, sesuai: 90 }, email: 'fatih.ay@example.com' },
        { no: 'ILI2600004', nik: '3201010101010012', name: 'Maryam Al-Qibtiyyah', gender: 'P', jenjang: 'MA', status: 'accepted', vStatus: 'verified', prov: 'JAWA TIMUR', kab: 'KOTA SURABAYA', hasExam: true, scores: { akademi: 89, keprib: 91, quran: 94, sesuai: 90 }, email: 'maryam@example.com' },
        { no: 'MTA2500008', nik: '3201010101010013', name: 'Thariq Bin Ziyad', gender: 'L', jenjang: 'MTs', status: 'accepted', vStatus: 'verified', prov: 'SUMATERA BARAT', kab: 'KOTA PADANG', hasExam: true, scores: { akademi: 94, keprib: 90, quran: 86, sesuai: 89 }, email: 'thariq@example.com' },
        
        { no: 'MTA2600005', nik: '3201010101010005', name: 'Khalid Bin Walid', gender: 'L', jenjang: 'MTs', status: 'verified', vStatus: 'verified', prov: 'JAWA TENGAH', kab: 'KOTA SURAKARTA', hasExam: true, scores: { akademi: 70, keprib: 75, quran: 80, sesuai: 75 }, email: 'khalid@example.com', isCadangan: true },
        { no: 'ILI2600005', nik: '3201010101010014', name: 'Hafshah Bint Umar', gender: 'P', jenjang: 'MA', status: 'verified', vStatus: 'verified', prov: 'BANTEN', kab: 'KOTA SERANG', hasExam: true, scores: { akademi: 75, keprib: 78, quran: 72, sesuai: 76 }, email: 'hafshah@example.com', isCadangan: true },
        
        { no: 'MTA2500009', nik: '3201010101010015', name: 'Abu Jahal', gender: 'L', jenjang: 'MTs', status: 'verified', vStatus: 'verified', prov: 'JAWA BARAT', kab: 'KABUPATEN BOGOR', hasExam: true, scores: { akademi: 40, keprib: 50, quran: 45, sesuai: 55 }, email: 'abu.j@example.com', isDitolak: true },
        
        { no: 'MTI2600002', nik: '3201010101010006', name: 'Fatimah Az-zahra', gender: 'P', jenjang: 'MTs', status: 'verified', vStatus: 'verified', prov: 'BANTEN', kab: 'KABUPATEN SERANG', hasExam: true, scores: { akademi: 95, keprib: 85, quran: 90, sesuai: 90 }, email: 'fatimah@example.com' },
        { no: 'ILA2600001', nik: '3201010101010007', name: 'Umar Bin Khattab', gender: 'L', jenjang: 'MA', status: 'verified', vStatus: 'verified', prov: 'DKI JAKARTA', kab: 'JAKARTA PUSAT', hasExam: true, scores: { akademi: 80, keprib: 85, quran: 82, sesuai: 85 }, email: 'umar@example.com' },
        { no: 'MTI2600006', nik: '3201010101010016', name: 'Aisyah Bint Abu Bakar', gender: 'P', jenjang: 'MTs', status: 'verified', vStatus: 'verified', prov: 'JAWA TENGAH', kab: 'KABUPATEN BANYUMAS', hasExam: true, scores: null, email: 'aisyah2@example.com' },
        { no: 'MTA2500010', nik: '3201010101010017', name: 'Ali Bin Abi Thalib', gender: 'L', jenjang: 'MTs', status: 'verified', vStatus: 'verified', prov: 'JAWA BARAT', kab: 'KOTA BEKASI', hasExam: true, scores: null, email: 'ali2@example.com' },

        { no: 'MTI2600001', nik: '3201010101010008', name: 'Aisyah Azzahra', gender: 'P', jenjang: 'MTs', status: 'payment_verification', vStatus: 'verified', prov: 'JAWA TIMUR', kab: 'KOTA MALANG', hasExam: false, scores: null, email: 'aisyah@example.com' },
        { no: 'ILA2600002', nik: '3201010101010009', name: 'Ali Bin Abi Thalib 1', gender: 'L', jenjang: 'MA', status: 'payment_verification', vStatus: 'unverified', prov: 'JAWA TENGAH', kab: 'KABUPATEN KLATEN', hasExam: false, scores: null, email: 'ali@example.com' },

        { no: 'ILI2600003', nik: '3201010101010010', name: 'Asma Bint Abu Bakar', gender: 'P', jenjang: 'MA', status: 'docs_uploaded', vStatus: 'unverified', prov: 'DKI JAKARTA', kab: 'JAKARTA BARAT', hasExam: false, scores: null, email: 'asma@example.com' },
        { no: 'MTA2500011', nik: '3201010101010018', name: 'Bilal Bin Rabah', gender: 'L', jenjang: 'MTs', status: 'docs_uploaded', vStatus: 'unverified', prov: 'BANTEN', kab: 'KOTA CILEGON', hasExam: false, scores: null, email: 'bilal@example.com' },

        { no: 'MTI2600003', nik: '3201010101010019', name: 'Ruqayyah Bint Muhammad', gender: 'P', jenjang: 'MTs', status: 'draft', vStatus: 'unverified', prov: 'JAWA BARAT', kab: 'KOTA DEPOK', hasExam: false, scores: null, email: 'ruqayyah@example.com' },
        { no: 'ILI2600002', nik: '3201010101010020', name: 'Zainab Bint Ali', gender: 'P', jenjang: 'MA', status: 'draft', vStatus: 'unverified', prov: 'DI YOGYAKARTA', kab: 'KOTA YOGYAKARTA', hasExam: false, scores: null, email: 'zainab@example.com' },
        { no: 'MTA2600001', nik: '3201010101010021', name: 'Muhammad Al-fatih', gender: 'L', jenjang: 'MTs', status: 'draft', vStatus: 'unverified', prov: 'BANTEN', kab: 'KABUPATEN TANGERANG', hasExam: false, scores: null, email: 'alfatih@example.com' },
    ];

    for (let i = 0; i < dummyData.length; i++) {
        const d = dummyData[i];
        
        let user = await prisma.profile.findFirst({ where: { email: d.email } });
        let userId = '';
        if (!user) {
            user = await prisma.profile.create({
                data: {
                    email: d.email,
                    password_hash: passwordHash,
                    role: 'pendaftar',
                    full_name: d.name,
                    phone: `081234567${i.toString().padStart(3, '0')}`
                }
            });
        }
        userId = user.id;

        const pendaftar = await prisma.pendaftar.upsert({
            where: { nomor_pendaftaran: d.no },
            update: {
                user_id: userId,
                nik: d.nik,
                nama_lengkap: d.name,
                status_pendaftaran: d.status,
                verifikasi_status: d.vStatus,
                provinsi: d.prov,
                kabupaten: d.kab,
                ukuran_seragam_baju: d.status === 'accepted' ? 'M' : null,
                ukuran_seragam_celana: d.status === 'accepted' ? 'M' : null,
                ukuran_seragam_almamater: d.status === 'accepted' ? 'M' : null,
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
                no_hp: `081234567${i.toString().padStart(3, '0')}`,
                status_pendaftaran: d.status,
                verifikasi_status: d.vStatus,
                ukuran_seragam_baju: d.status === 'accepted' ? 'M' : null,
                ukuran_seragam_celana: d.status === 'accepted' ? 'M' : null,
                ukuran_seragam_almamater: d.status === 'accepted' ? 'M' : null,
                data_lengkap: JSON.stringify({
                    provinsi: d.prov,
                    kabupaten_kota: d.kab,
                    kecamatan: "Contoh Kecamatan",
                    kelurahan_desa: "Contoh Kelurahan"
                })
            },
        });

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
                
                let s_kelulusan = 'MENUNGGU';
                if (d.status === 'accepted') s_kelulusan = 'LULUS';
                else if (d.isCadangan) s_kelulusan = 'CADANGAN';
                else if (d.isDitolak) s_kelulusan = 'TIDAK_LULUS';

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
                            status_kelulusan: s_kelulusan,
                        }
                    });
                } else {
                    const e = await prisma.nilaiUjian.findFirst({ where: { pendaftar_id: pendaftar.id } });
                    await prisma.nilaiUjian.update({
                        where: { id: e!.id },
                        data: {
                            nilai_tes_tertulis_total: d.scores.akademi,
                            nilai_santri_total: d.scores.keprib,
                            nilai_tes_quran: d.scores.quran,
                            nilai_wawancara_ortu: d.scores.sesuai,
                            nilai_total: (d.scores.akademi! + d.scores.keprib! + d.scores.quran! + d.scores.sesuai!) / 4,
                            status_kelulusan: s_kelulusan,
                        }
                    });
                }
            }
        }

        if (d.status === 'accepted' || d.isCadangan || d.isDitolak) {
            let status_seleksi = 'DITERIMA';
            if (d.isCadangan) status_seleksi = 'CADANGAN';
            if (d.isDitolak) status_seleksi = 'DITOLAK';

            const nilaiAkhir = d.scores ? (d.scores.akademi! + d.scores.keprib! + d.scores.quran! + d.scores.sesuai!) / 4 : 0;

            const hasilCount = await prisma.hasilSeleksi.count({ where: { pendaftar_id: pendaftar.id } });
            if (hasilCount === 0) {
                await prisma.hasilSeleksi.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        status_seleksi: status_seleksi as any,
                        nilai_akhir: nilaiAkhir,
                        ditentukan_oleh: createdUsers['ADMIN_SUPER'],
                        ditentukan_pada: new Date(),
                    }
                });
            } else {
                const e = await prisma.hasilSeleksi.findFirst({ where: { pendaftar_id: pendaftar.id } });
                await prisma.hasilSeleksi.update({
                    where: { id: e!.id },
                    data: { status_seleksi: status_seleksi as any }
                });
            }

            const pengumumanCount = await prisma.pengumuman.count({ where: { pendaftar_id: pendaftar.id } });
            if (pengumumanCount === 0) {
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
            } else {
                const e = await prisma.pengumuman.findFirst({ where: { pendaftar_id: pendaftar.id } });
                await prisma.pengumuman.update({
                    where: { id: e!.id },
                    data: { status_kelulusan: status_seleksi as any }
                });
            }
        }

        if (d.status === 'accepted') {
            const countDU = await prisma.pembayaran.count({ where: { pendaftar_id: pendaftar.id, jenis_pembayaran: 'DAFTAR_ULANG' } });
            if (countDU === 0) {
                await prisma.pembayaran.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        metode_pembayaran: 'manual',
                        jumlah: 5000000,
                        status_pembayaran: 'verified',
                        verified_by: createdUsers['ADMIN_KEUANGAN'],
                        verified_at: new Date(),
                        jenis_pembayaran: 'DAFTAR_ULANG'
                    }
                });
            }

            const resCount = await prisma.reservasiPSB.count({ where: { pendaftar_id: pendaftar.id } });
            if (resCount === 0) {
                await prisma.reservasiPSB.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        tanggal_kedatangan: new Date('2026-07-18'),
                        jumlah_penginap: 2,
                        status: 'approved',
                        data_penginap: {
                            statusKehadiran: "HADIR",
                            jumlahPendamping: 2,
                            totalPengantar: 3,
                            catatanTambahan: "Kami akan menggunakan 1 mobil",
                            jumlahMobil: 1,
                            jumlahMotor: 0
                        }
                    }
                });
            }
        }
        
        if (d.no === 'ILI2600001' || d.no === 'MTI2600002') {
            const beasiswaCount = await prisma.pengajuanBeasiswa.count({ where: { pendaftar_id: pendaftar.id } });
            if (beasiswaCount === 0) {
                await prisma.pengajuanBeasiswa.create({
                    data: {
                        pendaftar_id: pendaftar.id,
                        tahun_ajaran_id: tahunAjaran.id,
                        jenis_pengajuan: 'Keringanan Biaya Masuk',
                        alasan_pengajuan: 'Anak yatim dari keluarga kurang mampu',
                        status: d.no === 'ILI2600001' ? 'disetujui' : 'menunggu',
                    }
                });
            }
        }
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
