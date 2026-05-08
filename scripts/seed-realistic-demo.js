const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const BOYS_FIRST = ['Ahmad', 'Muhammad', 'Zaid', 'Umar', 'Ali', 'Utsman', 'Fatih', 'Hamzah', 'Ibrahim', 'Yusuf', 'Ismail', 'Musa', 'Dawud', 'Sulaiman', 'Yahya', 'Harun', 'Luqman', 'Fajar', 'Budi', 'Rizky', 'Hassan', 'Hussein', 'Abdurrahman', 'Zakir', 'Farhan'];
const BOYS_LAST = ['Fauzan', 'Ramadhan', 'Al-Fatih', 'Abdurrahman', 'Mustofa', 'Hakim', 'Wijaya', 'Pratama', 'Hidayat', 'Saputra', 'Anwar', 'Mubarak', 'Zakaria', 'Putra', 'Santoso', 'Prasetyo', 'Setiawan', 'Aziz', 'Mubarok', 'Kusuma'];

const GIRLS_FIRST = ['Siti', 'Dewi', 'Nurul', 'Rina', 'Zainab', 'Fatimah', 'Khadijah', 'Aisyah', 'Ruqayyah', 'Safiyyah', 'Hafshah', 'Maryam', 'Juwayriyah', 'Sarah', 'Rahma', 'Nabila', 'Indah', 'Fitri', 'Salma', 'Anisa'];
const GIRLS_LAST = ['Aminah', 'Sartika', 'Hidayah', 'Wati', 'Wijaya', 'Setiawan', 'Anwar', 'Putri', 'Lestari', 'Sari', 'Nabila', 'Al-Zahra', 'Wardah', 'Kulsum', 'Indah', 'Permata', 'Azzahra', 'Kubro', 'Kartika', 'Amalia'];

const PROVINCES = ['Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'DKI Jakarta', 'Banten', 'DI Yogyakarta'];
const CITIES = {
    'Jawa Barat': ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Tasikmalaya'],
    'Jawa Tengah': ['Semarang', 'Surakarta', 'Magelang', 'Tegal'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Sidoarjo', 'Gresik'],
    'DKI Jakarta': ['Jakarta Selatan', 'Jakarta Timur', 'Jakarta Pusat', 'Jakarta Barat'],
    'Banten': ['Tangerang', 'Tangerang Selatan', 'Serang'],
    'DI Yogyakarta': ['Yogyakarta', 'Sleman', 'Bantul']
};

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateNIK() {
    return '320' + Math.random().toString().slice(2, 15).padEnd(13, '0');
}

async function main() {
    console.log('🔄 Starting Realistic Demo Seeding...');

    // 1. Get Active Academic Year
    let tahunAjaran = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });

    if (!tahunAjaran) {
        tahunAjaran = await prisma.tahunAjaran.findFirst({
            orderBy: { created_at: 'desc' }
        });
    }

    if (!tahunAjaran) {
        console.error('❌ No academic year found. Cannot process.');
        process.exit(1);
    }

    console.log(`📅 Using Academic Year: ${tahunAjaran.nama} (${tahunAjaran.id})`);

    // 2. Identify and Preserve Preserved Accounts (like Dedenn, rieza, wahab, admin)
    const preservedProfiles = await prisma.profile.findMany({
        where: {
            role: { in: ['admin_super', 'admin', 'admin_berkas', 'admin_keuangan', 'penguji'] }
        }
    });
    const preservedUserIds = preservedProfiles.map(p => p.id);
    console.log(`🛡️ Preserved ${preservedProfiles.length} staff/admin profiles.`);

    // 3. Clear Existing Demo/Dummy Pendaftar & User accounts safely
    console.log('🗑️ Cleaning up existing pendaftar and non-staff profiles...');
    
    // Delete payments first due to foreign keys
    await prisma.pembayaran.deleteMany({});
    // Delete documents
    await prisma.dokumen.deleteMany({});
    // Delete exam schedules
    await prisma.jadwalUjian.deleteMany({});
    // Delete exam scores
    await prisma.nilaiUjian.deleteMany({});
    // Delete parents
    await prisma.orangTua.deleteMany({});
    // Delete health profiles
    await prisma.dataKesehatan.deleteMany({});
    // Delete dormitory profiles
    await prisma.dataAsrama.deleteMany({});
    // Delete announcements
    await prisma.pengumuman.deleteMany({});
    // Delete selection results
    await prisma.hasilSeleksi.deleteMany({});
    // Delete registrants
    await prisma.pendaftar.deleteMany({});

    // Delete non-staff user profiles
    await prisma.profile.deleteMany({
        where: {
            id: { notIn: preservedUserIds },
            role: 'pendaftar'
        }
    });

    console.log('🧹 Cleanup completed successfully!');

    // 4. Generate the exactly 68 realistic registrants
    // MTs Putra: 18, MTs Putri: 18, IL Putra: 16, IL Putri: 16
    const categories = [
        { jenjang: 'MTS', jk: 'L', count: 18, prefix: 'MTA' },
        { jenjang: 'MTS', jk: 'P', count: 18, prefix: 'MTI' },
        { jenjang: 'IL', jk: 'L', count: 16, prefix: 'ILA' },
        { jenjang: 'IL', jk: 'P', count: 16, prefix: 'ILI' }
    ];

    const yearSuffix = String(tahunAjaran.tahun_mulai).slice(-2);
    let totalCreated = 0;

    // We will distribute the statuses to match:
    // Total: 68
    // Sudah Bayar: 67 (which means status !== 'draft')
    // Data Lengkap: 67 (which means status !== 'draft')
    // Berkas Lengkap: 1 (status = 'accepted' or 'docs_verified')
    // Diterima: 1 (status = 'accepted')
    // Cadangan: 0
    // Ditolak: 0
    // Sudah Daftar Ulang: 0

    // To do this, we'll make:
    // - 1 record is 'draft' (MTS L)
    // - 66 records are 'verified' (KK and Akta uploaded & verified, Payment paid & verified)
    // - 1 record is 'accepted' (KK and Akta verified, Payment verified, NilaiUjian filled, status_kelulusan = 'DITERIMA')

    let draftCreated = false;
    let acceptedCreated = false;

    // Find a staff profile to use as verifier
    const verifierId = preservedUserIds[0] || crypto.randomUUID();

    for (const cat of categories) {
        for (let i = 1; i <= cat.count; i++) {
            const nomer = `${cat.prefix}${yearSuffix}${String(i).padStart(5, '0')}`;
            
            let firstName, lastName;
            if (cat.jk === 'L') {
                firstName = getRandom(BOYS_FIRST);
                lastName = getRandom(BOYS_LAST);
            } else {
                firstName = getRandom(GIRLS_FIRST);
                lastName = getRandom(GIRLS_LAST);
            }
            const fullName = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${nomer.toLowerCase()}@demo-ppdb.com`;
            const phone = '08' + Math.floor(100000000 + Math.random() * 900000000);
            const province = getRandom(PROVINCES);
            const city = getRandom(CITIES[province]);
            const nik = generateNIK();

            // Determine status
            let status = 'docs_verified';
            if (cat.jenjang === 'MTS' && cat.jk === 'L') {
                if (i === 1) status = 'draft';
                else if (i >= 2 && i <= 3) status = 'announced'; // Cadangan
                else if (i >= 4 && i <= 9) status = 'accepted';  // Diterima
                else if (i >= 10 && i <= 13) status = 'enrolled'; // Sudah Daftar Ulang
                else status = 'docs_verified'; // Berkas Lengkap
            } else if (cat.jenjang === 'MTS' && cat.jk === 'P') {
                if (i === 1) status = 'rejected';
                else if (i === 2) status = 'announced'; // Cadangan
                else if (i >= 3 && i <= 9) status = 'accepted'; // Diterima
                else if (i >= 10 && i <= 13) status = 'enrolled'; // Sudah Daftar Ulang
                else status = 'docs_verified'; // Berkas Lengkap
            } else if (cat.jenjang === 'IL' && cat.jk === 'L') {
                if (i === 1) status = 'rejected';
                else if (i === 2) status = 'announced'; // Cadangan
                else if (i >= 3 && i <= 8) status = 'accepted'; // Diterima
                else if (i >= 9 && i <= 12) status = 'enrolled'; // Sudah Daftar Ulang
                else status = 'docs_verified'; // Berkas Lengkap
            } else if (cat.jenjang === 'IL' && cat.jk === 'P') {
                if (i === 1) status = 'announced'; // Cadangan
                else if (i >= 2 && i <= 7) status = 'accepted'; // Diterima
                else if (i >= 8 && i <= 10) status = 'enrolled'; // Sudah Daftar Ulang
                else status = 'docs_verified'; // Berkas Lengkap
            }

            // Create Profile for Registrant
            const userId = crypto.randomUUID();
            await prisma.profile.create({
                data: {
                    id: userId,
                    full_name: fullName,
                    email: email,
                    phone: phone,
                    role: 'pendaftar',
                    password_hash: '$2b$10$dummyhashformockingonly'
                }
            });

            // Create Pendaftar
            const pendaftarId = crypto.randomUUID();
            const pendaftar = await prisma.pendaftar.create({
                data: {
                    id: pendaftarId,
                    user_id: userId,
                    tahun_ajaran_id: tahunAjaran.id,
                    nomor_pendaftaran: nomer,
                    nik: nik,
                    nama_lengkap: fullName,
                    jenis_kelamin: cat.jk,
                    jenjang: cat.jenjang,
                    tempat_lahir: city,
                    tanggal_lahir: new Date('2011-05-15'),
                    alamat: `Jl. Kebon Jeruk No. ${Math.floor(Math.random() * 150)}`,
                    kabupaten: city,
                    provinsi: province,
                    no_hp: phone,
                    email: email,
                    status_pendaftaran: status,
                    verifikasi_status: status === 'draft' ? 'pending' : 'verified'
                }
            });

            // Create OrangTua
            await prisma.orangTua.create({
                data: {
                    id: crypto.randomUUID(),
                    pendaftar_id: pendaftarId,
                    nama_ayah: `Ayah ${firstName}`,
                    no_hp_ayah: phone,
                    nama_ibu: `Ibu ${lastName}`,
                    no_hp_ibu: phone
                }
            });

            // If not draft, seed payments & docs
            if (status !== 'draft') {
                // Seed verified Payment
                await prisma.pembayaran.create({
                    data: {
                        id: crypto.randomUUID(),
                        pendaftar_id: pendaftarId,
                        tahun_ajaran_id: tahunAjaran.id,
                        metode_pembayaran: 'manual',
                        jumlah: 250000,
                        status_pembayaran: 'verified',
                        verified_by: verifierId,
                        verified_at: new Date()
                    }
                });

                // Seed verified Documents
                const documentTypes = ['kartu_keluarga', 'akta_kelahiran'];
                for (const docType of documentTypes) {
                    await prisma.dokumen.create({
                        data: {
                            id: crypto.randomUUID(),
                            pendaftar_id: pendaftarId,
                            jenis_dokumen: docType,
                            file_name: `${docType}.pdf`,
                            file_path: `/uploads/${docType}.pdf`,
                            is_verified: true,
                            verified_by: verifierId,
                            verified_at: new Date()
                        }
                    });
                }
            }

            // If accepted, enrolled, announced, or rejected, seed exams and scores
            if (['accepted', 'enrolled', 'announced', 'rejected'].includes(status)) {
                // Create exam schedule
                const examId = crypto.randomUUID();
                await prisma.jadwalUjian.create({
                    data: {
                        id: examId,
                        tahun_ajaran_id: tahunAjaran.id,
                        pendaftar_id: pendaftarId,
                        tanggal_ujian: new Date(),
                        waktu_mulai_santri: new Date(),
                        waktu_selesai_santri: new Date(),
                        tempat_santri: cat.jenjang === 'MTS' ? 'Gedung Seleksi Al-Fath' : 'Gedung Seleksi Ulul Albaab',
                        waktu_mulai_ortu: new Date(),
                        waktu_selesai_ortu: new Date(),
                        tempat_ortu: 'Ruang Wawancara Ortu',
                        status_santri: 'tested',
                        status_ortu: 'tested'
                    }
                });

                // Determine score and result based on status
                let statusKelulusan = 'DITERIMA';
                let nilaiTotal = 85 + Math.random() * 10; // 85 to 95
                if (status === 'announced') {
                    statusKelulusan = 'CADANGAN';
                    nilaiTotal = 75 + Math.random() * 5; // 75 to 80
                } else if (status === 'rejected') {
                    statusKelulusan = 'DITOLAK';
                    nilaiTotal = 50 + Math.random() * 10; // 50 to 60
                }

                // Create exam scores
                await prisma.nilaiUjian.create({
                    data: {
                        id: crypto.randomUUID(),
                        jadwal_ujian_id: examId,
                        pendaftar_id: pendaftarId,
                        nilai_wawancara_santri: Math.round(nilaiTotal),
                        nilai_tes_quran: Math.round(nilaiTotal - 2),
                        nilai_wawancara_ortu: Math.round(nilaiTotal + 1),
                        nilai_total: Math.round(nilaiTotal * 10) / 10,
                        status_kelulusan: statusKelulusan
                    }
                });

                // Create selection result
                await prisma.hasilSeleksi.create({
                    data: {
                        id: crypto.randomUUID(),
                        pendaftar_id: pendaftarId,
                        tahun_ajaran_id: tahunAjaran.id,
                        status_seleksi: statusKelulusan,
                        nilai_akhir: Math.round(nilaiTotal * 10) / 10,
                        ditentukan_oleh: verifierId,
                        ditentukan_pada: new Date()
                    }
                });
            }

            totalCreated++;
        }
    }

    console.log(`\n🎉 Seed completed! Created exactly ${totalCreated} beautiful, realistic registrants.`);
    console.log(`- MTs Putra: 18`);
    console.log(`- MTs Putri: 18`);
    console.log(`- IL Putra: 16`);
    console.log(`- IL Putri: 16`);
    console.log(`- Draft: 1`);
    console.log(`- Berkas Lengkap: 20`);
    console.log(`- Diterima (Belum Daftar Ulang): 25`);
    console.log(`- Sudah Daftar Ulang: 15`);
    console.log(`- Cadangan: 5`);
    console.log(`- Ditolak: 2`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
