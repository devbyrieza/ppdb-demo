const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning up dummy data...');

    // Find Dedenn to ensure we don't delete him
    const dedenn = await prisma.pendaftar.findFirst({
        where: {
            nama_lengkap: {
                contains: 'Dedenn',
                mode: 'insensitive'
            }
        }
    });

    if (!dedenn) {
        console.error('❌ Dedenn not found! Aborting to prevent full data loss.');
        return;
    }

    console.log(`✅ Preserving: ${dedenn.nama_lengkap} (${dedenn.id})`);

    // Delete everyone ELSE
    const deleted = await prisma.pendaftar.deleteMany({
        where: {
            id: {
                not: dedenn.id
            }
        }
    });

    console.log(`🗑️ Deleted ${deleted.count} dummy records.`);

    // Also clean up profiles that are not admins and not Dedenn's profile
    // Get Dedenn's profile ID
    const dedennProfileId = dedenn.user_id;

    // Admin emails to preserve
    const adminEmails = [
        'super@pesantren-alimam.com',
        'berkas@pesantren-alimam.com',
        'keuangan@pesantren-alimam.com',
        'penguji@pesantren-alimam.com'
    ];

    if (dedennProfileId) {
        console.log('🧹 Cleaning up unused profiles...');
        const deletedProfiles = await prisma.profile.deleteMany({
            where: {
                id: {
                    not: dedennProfileId
                },
                email: {
                    notIn: adminEmails
                },
                role: {
                    notIn: ['admin_super', 'admin_berkas', 'admin_keuangan', 'penguji']
                }
            }
        });
        console.log(`🗑️ Deleted ${deletedProfiles.count} unused profiles.`);
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
