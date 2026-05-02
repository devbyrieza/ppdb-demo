import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const email = "admin@ululalbaab.com";
        const newPassword = "Admin26!";
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.profile.findFirst({ where: { email } });
        if (!user) throw new Error("User not found");

        const updated = await prisma.profile.update({
            where: { id: user.id },
            data: {
                password_hash: hashedPassword
            }
        });

        return NextResponse.json({
            success: true,
            message: `Password for ${email} has been reset to ${newPassword}`,
            user: {
                email: updated.email,
                role: updated.role,
                full_name: updated.full_name
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
