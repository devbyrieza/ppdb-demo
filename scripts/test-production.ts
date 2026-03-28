import { PrismaClient } from '@prisma/client';

async function main() {
    // URL from check_prod_users.ts
    const prodUrl = "postgresql://postgres.hcknodoayqarjbrzcgrp:SKBalimam26%21@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

    console.log('Testing Production (Supabase Pooler) Connection...');
    const prisma = new PrismaClient({
        datasources: {
            db: { url: prodUrl }
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

        console.log('--- FOUND IN PRODUCTION ---');
        list.forEach(p => {
            console.log(`- [${p.nomor_pendaftaran}] ${p.nama_lengkap} (ID: ${p.id})`);
        });

        const count = await prisma.pendaftar.count();
        console.log(`Total pendaftars in Production: ${count}`);

    } catch (err: any) {
        console.error('Production Connection Failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
