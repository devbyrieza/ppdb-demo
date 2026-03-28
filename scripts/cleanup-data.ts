import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Cleanup Started ---');

    // 1. Get the 5 most recent pendaftar
    const recentPendaftar = await prisma.pendaftar.findMany({
        orderBy: { created_at: 'desc' },
        take: 5,
        select: { id: true, nama_lengkap: true }
    });

    const keepIds = recentPendaftar.map(p => p.id);
    console.log(`Keeping ${keepIds.length} recent pendaftar:`);
    recentPendaftar.forEach(p => console.log(` - ${p.nama_lengkap} (${p.id})`));

    // 2. Mark kept ones as TEST
    for (const p of recentPendaftar) {
        if (!p.nama_lengkap.startsWith('TEST')) {
            await prisma.pendaftar.update({
                where: { id: p.id },
                data: { nama_lengkap: `TEST ${p.nama_lengkap}` }
            });
            console.log(`Updated name for: ${p.nama_lengkap}`);
        }
    }

    // 3. Find pendaftar to delete
    const toDelete = await prisma.pendaftar.findMany({
        where: {
            id: { notIn: keepIds }
        },
        select: { id: true, user_id: true }
    });

    console.log(`Found ${toDelete.length} pendaftar to delete.`);

    // 4. Delete associated profiles (pendaftar role) first to avoid orphans if needed
    // Note: Pendaftar -> Profile is not cascade delete in schema.
    const profileIdsToDelete = toDelete
        .map(p => p.user_id)
        .filter((id): id is string => id !== null);

    // 5. Delete Pendaftar (Cascades will handle related data)
    const deleteResult = await prisma.pendaftar.deleteMany({
        where: {
            id: { notIn: keepIds }
        }
    });
    console.log(`Deleted ${deleteResult.count} pendaftar records.`);

    // 6. Delete associated profiles
    if (profileIdsToDelete.length > 0) {
        // Only delete if they are not used elsewhere (though in this system pendaftar profiles are usually 1:1)
        // To be safe, we check if they are still linked to any pendaftar (shouldn't be)
        const deletedProfiles = await prisma.profile.deleteMany({
            where: {
                id: { in: profileIdsToDelete },
                role: 'pendaftar'
            }
        });
        console.log(`Deleted ${deletedProfiles.count} associated pendaftar profiles.`);
    }

    console.log('--- Database Cleanup Completed ---');
}

main()
    .catch(e => {
        console.error('Error during cleanup:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
