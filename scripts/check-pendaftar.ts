
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching ALL pendaftar IDs...");
    const pendaftarList = await prisma.pendaftar.findMany({
        select: { id: true, nama_lengkap: true, status_pendaftaran: true }
    });

    const fs = require('fs');
    const content = pendaftarList.map(p => `[${p.id}] ${p.nama_lengkap} (${p.status_pendaftaran})`).join('\n');
    fs.writeFileSync('temp_ids.txt', content);
    console.log("IDs written to temp_ids.txt");
}

main();
