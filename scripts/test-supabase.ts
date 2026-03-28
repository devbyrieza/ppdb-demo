import { PrismaClient } from '@prisma/client';

async function main() {
    const supabaseUrl = "postgresql://postgres:SKBalimam26%21@db.hcknodoayqarjbrzcgrp.supabase.co:5432/postgres";

    console.log('Testing Supabase Connection...');
    const prisma = new PrismaClient({
        datasources: {
            db: { url: supabaseUrl }
        }
    });

    try {
        const list = await prisma.pendaftar.findMany({
            select: {
                id: true,
                nama_lengkap: true,
                nomor_pendaftaran: true
            },
            where: {
                OR: [
                    { nama_lengkap: { contains: 'Raylan', mode: 'insensitive' } },
                    { nama_lengkap: { contains: 'Azzam', mode: 'insensitive' } },
                    { nama_lengkap: { contains: 'Sukari', mode: 'insensitive' } }
                ]
            }
        });

        console.log('--- FOUND IN SUPABASE ---');
        list.forEach(p => {
            console.log(`- [${p.nomor_pendaftaran}] ${p.nama_lengkap} (ID: ${p.id})`);
        });

        const count = await prisma.pendaftar.count();
        console.log(`Total pendaftars in Supabase: ${count}`);

    } catch (err: any) {
        console.error('Supabase Connection Failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
