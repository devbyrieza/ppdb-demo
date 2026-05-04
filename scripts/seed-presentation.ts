import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Specific User Seeding for Presentation...');

    const users = [
        {
            email: 'rieza@demo.com',
            full_name: 'Rieza Eka Tomara',
            role: 'head_of_it',
            secondary_roles: ['admin_super', 'admin_berkas', 'admin_keuangan'],
            password: 'Rieza26!'
        },
        {
            email: 'wahab@demo.com',
            full_name: 'Wahab Rajasam',
            role: 'admin_super',
            secondary_roles: ['head_of_it', 'admin_berkas', 'admin_keuangan'],
            password: 'Wahab26!'
        },
        {
            email: 'quran@demo.com',
            full_name: 'Penguji Al-Qur\'an',
            role: 'penguji_quran',
            secondary_roles: [],
            password: 'Quran26!'
        },
        {
            email: 'calsan@demo.com',
            full_name: 'Pewawancara Calsan',
            role: 'pewawancara_calsan',
            secondary_roles: [],
            password: 'Calsan26!'
        },
        {
            email: 'cawalsan@demo.com',
            full_name: 'Pewawancara Cawalsan',
            role: 'pewawancara_cawalsan',
            secondary_roles: [],
            password: 'Cawalsan26!'
        }
    ];

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
