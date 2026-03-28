import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function findPendaftar() {
    console.log("🔍 Searching for 'Ahmad Tes'...");
    const pendaftars = await prisma.pendaftar.findMany({
        where: {
            nama_lengkap: {
                contains: 'Ahmad Tes',
                mode: 'insensitive'
            }
        },
        orderBy: { created_at: 'desc' }
    });

    if (pendaftars.length === 0) {
        console.log("ℹ️ No pendaftar found with that name.");
    } else {
        pendaftars.forEach(p => {
            console.log(`- ID: ${p.id}`);
            console.log(`  Nomor: ${p.nomor_pendaftaran}`);
            console.log(`  Nama: ${p.nama_lengkap}`);
            console.log(`  Time: ${p.created_at.toISOString()}`);
            console.log(`  Status: ${p.status_pendaftaran}`);
            console.log("-------------------");
        });
    }
}

findPendaftar()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
