
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
    console.log("🔐 Creating Head of IT user...\n");

    const headOfIT = {
        email: "it@pesantren-alimam.com",
        password: "HeadIT2026!",
        full_name: "Kepala IT",
        role: "head_of_it",
        phone: "081234567899",
    };

    const existingUser = await prisma.profile.findFirst({
        where: { email: headOfIT.email },
    });

    if (existingUser) {
        console.log(`⚠️  User ${headOfIT.email} already exists.`);

        // Update role if needed
        if (existingUser.role !== 'head_of_it') {
            console.log(`   Updating role to head_of_it...`);
            await prisma.profile.update({
                where: { id: existingUser.id },
                data: { role: 'head_of_it' }
            });
        }
    } else {
        const password_hash = await bcrypt.hash(headOfIT.password, 10);

        await prisma.profile.create({
            data: {
                email: headOfIT.email,
                password_hash,
                full_name: headOfIT.full_name,
                role: headOfIT.role,
                phone: headOfIT.phone,
            },
        });

        console.log(`✅ Created Head of IT: ${headOfIT.email}`);
        console.log(`   Password: ${headOfIT.password}`);
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
