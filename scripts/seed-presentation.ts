import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Specific User Seeding for Presentation...');

    // 1. Emails to DELETE (Old Demo Accounts)
    const emailsToDelete = [
        'quran@demo.com',
        'calsan@demo.com',
        'cawalsan@demo.com'
    ];

    console.log('Cleaning up old demo accounts...');
    for (const email of emailsToDelete) {
        await prisma.profile.deleteMany({
            where: { email }
        });
    }

    // 2. Users to UPSERT (Create or Update)
    const users = [
        {
            email: 'rieza@ppdb-demo.com',
            full_name: 'Rieza Eka Tomara',
            role: 'admin_super',
            secondary_roles: ['admin_berkas', 'admin_keuangan'],
            password: 'Rieza26!'
        },
        {
            email: 'wahab@ppdb-demo.com',
            full_name: 'Wahab Rajasam',
            role: 'admin_super',
            secondary_roles: ['admin_berkas', 'admin_keuangan'],
            password: 'Wahab26!'
        },
        {
            email: 'admin@ppdb-demo.com',
            full_name: 'Admin Super Demo',
            role: 'admin_super',
            secondary_roles: ['admin_berkas', 'admin_keuangan'],
            password: 'Admin26!'
        },
        {
            email: 'keuangan@ppdb-demo.com',
            full_name: 'Admin Keuangan Demo',
            role: 'admin_keuangan',
            secondary_roles: [],
            password: 'Keuangan26!'
        },
        {
            email: 'berkas@ppdb-demo.com',
            full_name: 'Admin Berkas Demo',
            role: 'admin_berkas',
            secondary_roles: [],
            password: 'Berkas26!'
        },
        {
            email: 'quran@ppdb-demo.com',
            full_name: 'Penguji Al-Qur\'an Demo',
            role: 'penguji_calsan',
            secondary_roles: [],
            password: 'Quran26!'
        },
        {
            email: 'calsan@ppdb-demo.com',
            full_name: 'Pewawancara Calsan Demo',
            role: 'pewawancara_calsan',
            secondary_roles: [],
            password: 'Calsan26!'
        },
        {
            email: 'cawalsan@ppdb-demo.com',
            full_name: 'Pewawancara Cawalsan Demo',
            role: 'pewawancara_cawalsan',
            secondary_roles: [],
            password: 'Cawalsan26!'
        }
    ];

    // Handle Rename from old @demo.com if exists
    console.log('Checking for Wahab/Rieza renames...');
    const renames = [
        { old: 'wahab@demo.com', new: 'wahab@ppdb-demo.com' },
        { old: 'rieza@demo.com', new: 'rieza@ppdb-demo.com' }
    ];

    for (const r of renames) {
        const oldUser = await prisma.profile.findFirst({ where: { email: r.old } });
        if (oldUser) {
            await prisma.profile.update({
                where: { id: oldUser.id },
                data: { email: r.new }
            });
            console.log(`Renamed ${r.old} to ${r.new}`);
        }
    }

    for (const u of users) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        
        const existingUser = await prisma.profile.findFirst({
            where: { email: u.email }
        });

        if (existingUser) {
            await prisma.profile.update({
                where: { id: existingUser.id },
                data: {
                    full_name: u.full_name,
                    role: u.role,
                    secondary_roles: u.secondary_roles,
                    password_hash: hashedPassword,
                    phone: '081234567890'
                }
            });
            console.log(`User ${u.full_name} (${u.email}) updated.`);
        } else {
            await prisma.profile.create({
                data: {
                    id: crypto.randomUUID(),
                    email: u.email,
                    full_name: u.full_name,
                    role: u.role,
                    secondary_roles: u.secondary_roles,
                    password_hash: hashedPassword,
                    phone: '081234567890'
                }
            });
            console.log(`User ${u.full_name} (${u.email}) created.`);
        }
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
