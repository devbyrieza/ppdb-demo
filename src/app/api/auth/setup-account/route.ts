import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUsernameFormat, isUsernameStandard } from "@/lib/utils/username";
import { hashPassword } from "@/lib/utils/password";
import { DASHBOARD_ROUTES, UserRole } from "@/lib/access-control";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, username, new_password, chosen_role } = body;

    if (!profile_id) {
      return NextResponse.json(
        { error: "ID Akun (profile_id) wajib disertakan" },
        { status: 400 },
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { id: profile_id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Akun profil tidak ditemukan" },
        { status: 404 },
      );
    }

    if (profile.role === "pendaftar") {
      return NextResponse.json(
        { error: "Akun calon santri/pendaftar tidak menggunakan username/password staf" },
        { status: 403 },
      );
    }

    // 1. Validasi & Normalisasi Username
    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: "Username wajib diisi" },
        { status: 400 },
      );
    }

    const usernameCheck = validateUsernameFormat(username);
    if (!usernameCheck.isValid || !usernameCheck.normalized) {
      return NextResponse.json(
        { error: usernameCheck.error || "Format username tidak memenuhi standar" },
        { status: 400 },
      );
    }

    const cleanUsername = usernameCheck.normalized;

    // Cek duplikasi username di database
    const existingUser = await prisma.profile.findFirst({
      where: {
        username: { equals: cleanUsername, mode: "insensitive" },
        id: { not: profile.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: `Username "${cleanUsername}" sudah digunakan oleh akun lain. Silakan pilih variasi lain.` },
        { status: 400 },
      );
    }

    // 2. Validasi Password (jika dikirim atau jika password saat ini masih default)
    let updatedPasswordHash: string | undefined = undefined;
    if (new_password) {
      if (new_password.length < 8) {
        return NextResponse.json(
          { error: "Kata sandi baru minimal 8 karakter" },
          { status: 400 },
        );
      }
      if (!/[A-Z]/.test(new_password)) {
        return NextResponse.json(
          { error: "Kata sandi harus mengandung minimal 1 huruf besar (A-Z)" },
          { status: 400 },
        );
      }
      if (!/[a-z]/.test(new_password)) {
        return NextResponse.json(
          { error: "Kata sandi harus mengandung minimal 1 huruf kecil (a-z)" },
          { status: 400 },
        );
      }
      if (!/\d/.test(new_password)) {
        return NextResponse.json(
          { error: "Kata sandi harus mengandung minimal 1 angka (0-9)" },
          { status: 400 },
        );
      }
      if (!/[!@#$%^&*(),.?":{}|<>\-_=+]/.test(new_password)) {
        return NextResponse.json(
          { error: "Kata sandi harus mengandung minimal 1 karakter khusus / simbol" },
          { status: 400 },
        );
      }
      if (cleanUsername.length >= 4 && new_password.toLowerCase().includes(cleanUsername.toLowerCase())) {
        return NextResponse.json(
          { error: "Kata sandi tidak boleh mengandung username Anda" },
          { status: 400 },
        );
      }

      updatedPasswordHash = await hashPassword(new_password);
    }

    // 3. Update database
    const updateData: any = {
      username: cleanUsername,
      updated_at: new Date(),
    };

    if (updatedPasswordHash) {
      updateData.password_hash = updatedPasswordHash;
      updateData.plain_password = new_password;
      updateData.must_change_password = false;
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: updateData,
    });

    // 4. Buat session baru
    const effectiveRole = chosen_role || updatedProfile.role;
    const redirectTo = DASHBOARD_ROUTES[effectiveRole as UserRole] || "/dashboard";

    const response = NextResponse.json({
      success: true,
      message: "Kredensial akun berhasil diperbarui dan disimpan.",
      data: {
        id: updatedProfile.id,
        username: updatedProfile.username,
        full_name: updatedProfile.full_name,
        role: effectiveRole,
      },
      redirectTo,
    });

    response.cookies.set(
      "al_session",
      JSON.stringify({
        role: effectiveRole,
        id: updatedProfile.id,
        full_name: updatedProfile.full_name,
        email: updatedProfile.email,
        username: updatedProfile.username,
        is_default_password: false,
      }),
      {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 90,
        expires: new Date(Date.now() + 60 * 60 * 24 * 90 * 1000),
      },
    );

    return response;
  } catch (error: any) {
    console.error("Setup account error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui kredensial akun" },
      { status: 500 },
    );
  }
}
