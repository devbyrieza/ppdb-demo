const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const email = 'super@pesantren-alimam.com';
    const password = 'SuperAdmin2026!'; // The password we set

    console.log(`🔍 Checking admin account: ${email}`);

    const profile = await prisma.profile.findFirst({
        where: { email }
    });

    if (!profile) {
        console.error('❌ Profile not found!');
        return;
    }

    console.log(`✅ Profile found: ${profile.full_name} (${profile.role})`);
    console.log(`🔑 Stored Hash: ${profile.password_hash}`);

    if (!profile.password_hash) {
        console.error('❌ No password hash stored!');
        return;
    }

    console.log(`Testing password: "${password}"`);
    const isValid = await bcrypt.compare(password, profile.password_hash);

    if (isValid) {
        console.log('✅ Password matches hash!');
    } else {
        console.error('❌ Password does NOT match hash!');

        // Try re-hashing to see difference
        const newHash = await bcrypt.hash(password, 10);
        console.log(`   Expected hash format example: ${newHash}`);

        // Update with new working hash
        console.log('🔄 Updating with new hash...');
        await prisma.profile.update({
            where: { id: profile.id },
            data: { password_hash: newHash }
        });
        console.log('✅ Updated password hash. Try logging in now.');
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
