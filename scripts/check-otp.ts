import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkOTP() {
    console.log("🔍 Checking recent OTP verifications...");
    const recentOTPs = await prisma.otpVerification.findMany({
        take: 10,
        orderBy: { created_at: 'desc' }
    });

    if (recentOTPs.length === 0) {
        console.log("ℹ️ No OTP verifications found.");
    } else {
        recentOTPs.forEach(otp => {
            console.log(`- Time: ${otp.created_at.toISOString()}`);
            console.log(`  Phone: ${otp.phone}`);
            console.log(`  Channel: ${otp.otp_channel}`);
            console.log(`  Expires: ${otp.expires_at.toISOString()}`);
            console.log(`  Verified at: ${otp.verified_at || 'Pending'}`);
            console.log(`  Attempts: ${otp.attempts}`);
            console.log("-------------------");
        });
    }

    const currentLocalTime = new Date();
    console.log(`Current Time: ${currentLocalTime.toISOString()}`);
}

checkOTP()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
