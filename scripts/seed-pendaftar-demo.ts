import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Pendaftar Demo Seeding...');

    // Get active tahun ajaran
    const tahunAjaran = await prisma.tahunAjaran.findFirst({
        where: { is_active: true }
    });

    if (!tahunAjaran) {
        console.error('No active tahun ajaran found!');
        return;
    }

    const year = String(tahunAjaran.tahun_mulai).slice(-2);

    const pendaftarDemo = [
        {
            nomor_pendaftaran: `MTA${year}00001`,
            nama_lengkap: 'Demo MTs Putra',
            jenjang: 'MTs',
            jenis_kelamin: 'L',
            nik: '1234567890123451'
        },
        {
            nomor_pendaftaran: `MTI${year}00001`,
            nama_lengkap: 'Demo MTs Putri',
            jenjang: 'MTs',
            jenis_kelamin: 'P',
            nik: '1234567890123452'
        },
        {
            nomor_pendaftaran: `ILA${year}00001`,
            nama_lengkap: 'Demo IL Putra',
            jenjang: 'IL',
            jenis_kelamin: 'L',
            nik: '1234567890123453'
        },
        {
            nomor_pendaftaran: `ILI${year}00001`,
            nama_lengkap: 'Demo IL Putri',
            jenjang: 'IL',
            jenis_kelamin: 'P',
            nik: '1234567890123454'
        }
    ];

    for (const p of pendaftarDemo) {
        await prisma.pendaftar.upsert({
            where: { nomor_pendaftaran: p.nomor_pendaftaran },
            update: {
                nama_lengkap: p.nama_lengkap,
                jenjang: p.jenjang,
                jenis_kelamin: p.jenis_kelamin,
                nik: p.nik,
                status_pendaftaran: 'BELUM_LENGKAP'
            },
            create: {
                id: crypto.randomUUID(),
                nomor_pendaftaran: p.nomor_pendaftaran,
                nama_lengkap: p.nama_lengkap,
                nik: p.nik,
                tanggal_lahir: new Date('2010-01-01'),
                no_hp: '081234567890',
                jenjang: p.jenjang,
                jenis_kelamin: p.jenis_kelamin,
                tahun_ajaran_id: tahunAjaran.id,
                status_pendaftaran: 'BELUM_LENGKAP'
            }
        });
        console.log(`Pendaftar ${p.nama_lengkap} (${p.nomor_pendaftaran}) created/updated.`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
