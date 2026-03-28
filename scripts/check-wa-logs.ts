import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkLogs() {
    console.log("🔍 Checking recent WhatsApp logs...");
    const recentLogs = await prisma.whatsappLog.findMany({
        take: 20,
        orderBy: { created_at: 'desc' }
    });

    if (recentLogs.length === 0) {
        console.log("ℹ️ No WhatsApp logs found.");
    } else {
        recentLogs.forEach(log => {
            console.log(`- Time: ${log.created_at.toISOString()}`);
            console.log(`  Phone: ${log.phone}`);
            console.log(`  Type: ${log.jenis_notif}`);
            console.log(`  Status: ${log.status}`);
            console.log(`  Sent At: ${log.sent_at || 'N/A'}`);
            console.log(`  Error: ${log.error_message || 'None'}`);
            // console.log(`  Content: ${log.message_content?.substring(0, 50)}...`);
            console.log("-------------------");
        });
    }

    const currentLocalTime = new Date();
    console.log(`Current Time: ${currentLocalTime.toISOString()}`);
}

checkLogs()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
