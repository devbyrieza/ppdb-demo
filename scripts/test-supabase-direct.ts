import { PrismaClient } from '@prisma/client';

async function main() {
    // Direct URL from .env comment
    const supabaseDirectUrl = "postgresql://postgres:SKBalimam26%21@db.hcknodoayqarjbrzcgrp.supabase.co:5432/postgres";

    console.log('Testing Supabase Direct Connection...');
    const prisma = new PrismaClient({
        datasources: {
            db: { url: supabaseDirectUrl }
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

        console.log('--- FOUND IN SUPABASE DIRECT ---');
        list.forEach(p => {
            console.log(`- [${p.nomor_pendaftaran}] ${p.nama_lengkap} (ID: ${p.id})`);
        });

        const count = await prisma.pendaftar.count();
        console.log(`Total pendaftars in Supabase Direct: ${count}`);

    } catch (err: any) {
        console.error('Supabase Direct Connection Failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
