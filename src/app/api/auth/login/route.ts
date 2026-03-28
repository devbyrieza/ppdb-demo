import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/utils/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { login_type } = body;

    // ═══════════════════════════════════════════
    // LOGIN PENDAFTAR (NIK + Nomor Pendaftaran)
    // ═══════════════════════════════════════════
    if (login_type === "pendaftar") {
      const { nik, nomor_pendaftaran } = body;

      if (!nik || !nomor_pendaftaran) {
        return NextResponse.json(
          { error: "NIK dan Nomor Pendaftaran wajib diisi" },
          { status: 400 },
        );
      }

      if (!/^\d{16}$/.test(nik)) {
        return NextResponse.json(
          { error: "NIK harus 16 digit angka" },
          { status: 400 },
        );
      }

      const pendaftar = await prisma.pendaftar.findFirst({
        where: {
          nik,
          nomor_pendaftaran: nomor_pendaftaran.toUpperCase(),
        },
      });

      if (!pendaftar) {
        return NextResponse.json(
          {
            error:
              "NIK atau Nomor Pendaftaran tidak ditemukan. Periksa kembali data Anda.",
          },
          { status: 404 },
        );
      }

      const responseJson = NextResponse.json({
        success: true,
        message: "Login berhasil",
        role: "pendaftar",
        data: {
          id: pendaftar.id,
          nomor_pendaftaran: pendaftar.nomor_pendaftaran,
          nik: pendaftar.nik,
          nama_lengkap: pendaftar.nama_lengkap,
          jenis_kelamin: pendaftar.jenis_kelamin,
          jenjang: pendaftar.jenjang,
          status_pendaftaran: pendaftar.status_pendaftaran,
          tahun_ajaran_id: pendaftar.tahun_ajaran_id,
        },
      });

      responseJson.cookies.set(
        "app_session",
        JSON.stringify({
          role: "pendaftar",
          id: pendaftar.id,
          nik: pendaftar.nik,
          nomor_pendaftaran: pendaftar.nomor_pendaftaran,
          nama_lengkap: pendaftar.nama_lengkap,
        }),
        {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        }
      );

      return responseJson;
    }

    // ═══════════════════════════════════════════
    // LOGIN ADMIN/PENGUJI (Email + Password)
    // ═══════════════════════════════════════════
    else if (login_type === "admin") {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email dan Password wajib diisi" },
          { status: 400 },
        );
      }

      const profile = await prisma.profile.findFirst({
        where: { email },
      });

      if (!profile || !profile.password_hash) {
        return NextResponse.json(
          { error: "Email atau Password salah" },
          { status: 401 },
        );
      }

      const allowedRoles = ["admin", "penguji", "admin_super", "admin_berkas", "admin_keuangan", "head_of_it", "tim_it", "penguji_calsan", "pewawancara_calsan", "pewawancara_cawalsan"];
      if (!allowedRoles.includes(profile.role)) {
        return NextResponse.json(
          { error: "Akun ini tidak memiliki akses admin/penguji" },
          { status: 403 },
        );
      }

      const isValid = await comparePassword(password, profile.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Email atau Password salah" },
          { status: 401 },
        );
      }

      // Check for multi-role: if secondary_roles exist, require role selection
      const secondaryRoles: string[] = profile.secondary_roles || [];
      if (secondaryRoles.length > 0) {
        // Return role selection prompt — no cookie yet
        return NextResponse.json({
          success: true,
          requires_role_selection: true,
          profile_id: profile.id,
          full_name: profile.full_name,
          available_roles: [profile.role, ...secondaryRoles],
        });
      }

      // Single role — login normally
      const responseJson = NextResponse.json({
        success: true,
        message: "Login berhasil",
        role: profile.role,
        data: {
          id: profile.id,
          full_name: profile.full_name,
          phone: profile.phone,
          role: profile.role,
        },
      });

      responseJson.cookies.set(
        "app_session",
        JSON.stringify({
          role: profile.role,
          id: profile.id,
          full_name: profile.full_name,
        }),
        {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
        }
      );

      return responseJson;
    }

    else {
      return NextResponse.json(
        { error: "Tipe login tidak valid" },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat login" },
      { status: 500 },
    );
  }
}
