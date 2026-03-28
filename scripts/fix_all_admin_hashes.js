const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const admins = [
        { email: 'super@pesantren-alimam.com', password: 'SuperAdmin2026!' },
        { email: 'berkas@pesantren-alimam.com', password: 'AdminBerkas2026!' },
        { email: 'keuangan@pesantren-alimam.com', password: 'AdminKeuangan2026!' },
        { email: 'penguji@pesantren-alimam.com', password: 'Penguji2026!' },
    ];

    console.log('🔄 Fixing all admin passwords...');

    for (const admin of admins) {
        const hash = await bcrypt.hash(admin.password, 10);

        // Check if user exists
        const user = await prisma.profile.findFirst({ where: { email: admin.email } });

        if (user) {
            await prisma.profile.update({
                where: { id: user.id },
                data: { password_hash: hash }
            });
            console.log(`✅ Updated password for ${admin.email}`);
        } else {
            console.log(`⚠️ User not found: ${admin.email}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
