import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { full_name, phone } = body;

    if (!full_name) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi" },
        { status: 400 },
      );
    }

    // Update profile using the ID from the session
    // In this system, profile.id is stored in session.id for interviewers/admins
    const updatedProfile = await prisma.profile.update({
      where: { id: session.id },
      data: {
        full_name,
        phone: phone || "",
      },
    });

    // Update the session cookie with new info
    const newSession = {
      ...session,
      full_name: updatedProfile.full_name,
      phone: updatedProfile.phone,
    };

    const cookieStore = await cookies();
    cookieStore.set("app_session", JSON.stringify(newSession), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({
      success: true,
      message: "Profil Anda berhasil diperbarui.",
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error("POST profile/update error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui profil" },
      { status: 500 },
    );
  }
}
