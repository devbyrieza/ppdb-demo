import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMagicToken } from "@/lib/utils/magic-link";

export async function POST(request: NextRequest) {
  try {
    const { id, digits, p } = await request.json();

    if (!id || !digits || digits.length !== 4) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    // Fetch all penguji/staff profiles
    const profiles = await prisma.profile.findMany({
      where: { role: { not: "pendaftar" } },
      select: { id: true, role: true, full_name: true, secondary_roles: true, phone: true }
    });

    const user = profiles.find(pr => pr.id.startsWith(id));

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const cleanPhone = (user.phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 4) {
       return NextResponse.json({ error: "Nomor terdaftar tidak valid" }, { status: 400 });
    }

    const last4 = cleanPhone.slice(-4);
    if (last4 !== digits) {
       return NextResponse.json({ error: "4 digit nomor WA salah" }, { status: 401 });
    }

    let activeRole = user.role;
    if (user.role.includes("admin") && Array.isArray(user.secondary_roles) && user.secondary_roles.length > 0) {
      const secRole = user.secondary_roles.find(
        (r: any) => typeof r === 'string' && (r.includes("penguji") || r.includes("pewawancara"))
      );
      if (secRole) activeRole = secRole as string;
    }

    const redirectPath = p
      ? `/dashboard/penguji/input-nilai?search=${encodeURIComponent(p)}`
      : `/dashboard/penguji`;

    const token = generateMagicToken(
      user.id,
      activeRole,
      user.full_name,
      48,
      redirectPath
    );

    return NextResponse.json({ url: `/api/auth/magic?token=${token}` });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
