import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const FIRST_NAMES = ['Ahmad', 'Zaid', 'Umar', 'Ali', 'Utsman', 'Abu', 'Fatih', 'Hamzah', 'Ibrahim', 'Yusuf', 'Ismail', 'Musa', 'Isa', 'Yahya', 'Zakaria', 'Sulaiman', 'Dawud', 'Ayyub', 'Harun', 'Luqman', 'Maryam', 'Aisyah', 'Fatimah', 'Khadijah', 'Zainab', 'Ruqayyah', 'Ummu', 'Safiyyah', 'Juwayriyah', 'Hafshah'];
const LAST_NAMES = ['Abdullah', 'Abdurrahman', 'Al-Fatih', 'Hidayat', 'Pratama', 'Putra', 'Putri', 'Sari', 'Lestari', 'Wijaya', 'Kusuma', 'Santoso', 'Budi', 'Setiawan', 'Ramadhan', 'Saputra', 'Anwar', 'Aziz', 'Hakim', 'Mubarak'];
const PROVINCES = ['Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'DKI Jakarta', 'Banten', 'DI Yogyakarta', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau'];
const CITIES: Record<string, string[]> = {
    'Jawa Barat': ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Sukabumi', 'Cianjur', 'Garut', 'Tasikmalaya'],
    'Jawa Tengah': ['Semarang', 'Surakarta', 'Magelang', 'Tegal', 'Pekalongan'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Sidoarjo', 'Gresik', 'Kediri'],
    'DKI Jakarta': ['Jakarta Selatan', 'Jakarta Timur', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Utara'],
    'Banten': ['Tangerang', 'Tangerang Selatan', 'Serang', 'Cilegon'],
    'DI Yogyakarta': ['Yogyakarta', 'Sleman', 'Bantul'],
    'Sumatera Utara': ['Medan', 'Binjai', 'Pematangsiantar'],
    'Sumatera Barat': ['Padang', 'Bukittinggi', 'Payakumbuh'],
    'Riau': ['Pekanbaru', 'Dumai'],
    'Kepulauan Riau': ['Batam', 'Tanjung Pinang']
};

function getRandom(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateNIK() {
    return Math.random().toString().slice(2, 18).padEnd(16, '0');
}

async function main() {
    console.log('Starting Massive Random Pendaftar Seeding for Stats Demo...');

    const tahunAjaran = await prisma.tahunAjaran.findFirst({ where: { is_active: true } });
    if (!tahunAjaran) {
        console.error('No active tahun ajaran found!');
        return;
    }

    const yearSuffix = String(tahunAjaran.tahun_mulai).slice(-2);
    const countPerCategory = 15; // 15 for each (MTA, MTI, ILA, ILI) = 60 total random pendaftar
    const categories = [
        { prefix: 'MTA', jenjang: 'MTs', jk: 'L' },
        { prefix: 'MTI', jenjang: 'MTs', jk: 'P' },
        { prefix: 'ILA', jenjang: 'IL', jk: 'L' },
        { prefix: 'ILI', jenjang: 'IL', jk: 'P' }
    ];

    let totalCreated = 0;

    for (const cat of categories) {
        for (let i = 1; i <= countPerCategory; i++) {
            const nomer = `${cat.prefix}${yearSuffix}${String(i + 10).padStart(5, '0')}`; // Start from 00011 to avoid overlap with previous manual demo accounts
            const firstName = getRandom(FIRST_NAMES);
            const lastName = getRandom(LAST_NAMES);
            const fullName = `${firstName} ${lastName}`;
            const province = getRandom(PROVINCES);
            const city = getRandom(CITIES[province]);
            const nik = generateNIK();

            await prisma.pendaftar.upsert({
                where: { nomor_pendaftaran: nomer },
                update: {},
                create: {
                    id: crypto.randomUUID(),
                    nomor_pendaftaran: nomer,
                    nik: nik,
                    nama_lengkap: fullName,
                    jenis_kelamin: cat.jk,
                    jenjang: cat.jenjang,
                    provinsi: province,
                    kabupaten: city,
                    tanggal_lahir: new Date('2010-01-01'),
                    no_hp: '0812' + Math.random().toString().slice(2, 10),
                    status_pendaftaran: getRandom(['LENGKAP', 'BELUM_LENGKAP', 'VERIFIKASI_BERKAS', 'SUDAH_TES']),
                    tahun_ajaran_id: tahunAjaran.id,
                }
            });
            totalCreated++;
        }
    }

    console.log(`Seeding finished. Total random pendaftar created: ${totalCreated}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
