
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:kbzoN2OhN@127.0.0.1:5433/ppdb_alimam?schema=public",
        },
    },
});

async function main() {
    console.log("Checking database...");

    try {
        const pendaftarCount = await prisma.pendaftar.count();
        console.log(`Total Pendaftar: ${pendaftarCount}`);

        const pembayaranCount = await prisma.pembayaran.count();
        console.log(`Total Pembayaran: ${pembayaranCount}`);

        const bukhari = await prisma.pendaftar.findFirst({
            where: {
                nama_lengkap: { contains: "Bukhari", mode: "insensitive" }
            },
            include: {
                pembayaran: true
            }
        });

        if (bukhari) {
            console.log("Found Bukhari:");
            console.log("ID:", bukhari.id);
            console.log("Nama:", bukhari.nama_lengkap);
            console.log("Status Pendaftaran:", bukhari.status_pendaftaran);
            console.log("Tahun Ajaran ID:", bukhari.tahun_ajaran_id);
        } else {
            console.log("Bukhari not found in Pendaftar table");
        }

        // Check recent pendaftar
        const recent = await prisma.pendaftar.findMany({
            take: 5,
            orderBy: { created_at: "desc" },
            select: { id: true, nama_lengkap: true, status_pendaftaran: true }
        });
        console.log("Recent 5 Pendaftar:", recent);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
