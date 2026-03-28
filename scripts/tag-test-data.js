
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting to tag existing data as [TEST]...");

    // 1. Get all students
    const students = await prisma.pendaftar.findMany({
        select: { id: true, nama_lengkap: true, nomor_pendaftaran: true }
    });

    console.log(`Found ${students.length} students.`);

    let updatedCount = 0;

    // 2. Loop and update names
    for (const student of students) {
        // Skip if already tagged
        if (student.nama_lengkap.trim().startsWith("[TEST]")) {
            console.log(`Skipping ${student.nama_lengkap} (already tagged)`);
            continue;
        }

        // Add [TEST] prefix
        const newName = `[TEST] ${student.nama_lengkap}`;

        await prisma.pendaftar.update({
            where: { id: student.id },
            data: {
                nama_lengkap: newName,
                // Also update creation date to clearly separate them if needed? No, keep original date.
            }
        });

        console.log(`Tagged: ${student.nomor_pendaftaran} - ${newName}`);
        updatedCount++;
    }

    console.log(`\nFinished! Tagged ${updatedCount} students as test data.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
