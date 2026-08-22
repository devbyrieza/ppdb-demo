import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils/password";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan. Silakan login kembali." },
        { status: 401 },
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    if (!session || !session.id) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const userId = session.id;

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password baru minimal 8 karakter." },
        { status: 400 },
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password baru harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus (@, #, !, dsb)." },
        { status: 400 },
      );
    }

    // Verify user exists
    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Profil tidak ditemukan." },
        { status: 404 },
      );
    }

    if (user.username && newPassword.toLowerCase().includes(user.username.toLowerCase())) {
      return NextResponse.json(
        { error: "Password baru tidak boleh mengandung username Anda." },
        { status: 400 },
      );
    }

    const password_hash = await hashPassword(newPassword);

    await prisma.profile.update({
      where: { id: userId },
      data: {
        password_hash,
        must_change_password: false,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui.",
    });
  } catch (error: any) {
    console.error("API /api/profile/password Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal." },
      { status: 500 },
    );
  }
}
