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
          nomor_pendaftaran: nomor_pendaftaran.toUpperCase() } });

      if (!pendaftar) {
        return NextResponse.json(
          {
            error:
              "NIK atau Nomor Pendaftaran tidak ditemukan. Periksa kembali data Anda." },
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
          tahun_ajaran_id: pendaftar.tahun_ajaran_id } });

      responseJson.cookies.set(
        "al_session",
        JSON.stringify({
          role: "pendaftar",
          id: pendaftar.id,
          nik: pendaftar.nik,
          nomor_pendaftaran: pendaftar.nomor_pendaftaran,
          nama_lengkap: pendaftar.nama_lengkap }),
        {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
      
          maxAge: 60 * 60 * 24 * 90,
          expires: new Date(Date.now() + 60 * 60 * 24 * 90 * 1000), // 90 Days Persistent Session
        },
      );

      return responseJson;
    }

    // ═══════════════════════════════════════════
    // LOGIN ADMIN/PENGUJI (Email + Password)
    // ═══════════════════════════════════════════
    else if (login_type === "admin") {
      const { email: rawEmail, password } = body;
      const identifier = rawEmail?.trim();

      if (!identifier || !password) {
        return NextResponse.json(
          { error: "Username / Email / No. WA dan Password wajib diisi" },
          { status: 400 },
        );
      }

      const cleanPhone = identifier.replace(/\D/g, "");
      let phoneVariations = [identifier];
      if (cleanPhone.startsWith("62")) {
        phoneVariations.push("0" + cleanPhone.substring(2));
      } else if (cleanPhone.startsWith("0")) {
        phoneVariations.push("62" + cleanPhone.substring(1));
        phoneVariations.push("+62" + cleanPhone.substring(1));
      }

      const profile = await prisma.profile.findFirst({
        where: {
          OR: [
            { email: { equals: identifier, mode: "insensitive" } },
            { username: { equals: identifier, mode: "insensitive" } },
            { phone: { in: phoneVariations } },
          ] } });

      if (!profile || !profile.password_hash) {
        return NextResponse.json(
          { error: "Email/Username atau Password salah" },
          { status: 401 },
        );
      }

      const allowedRoles = [
        "admin",
        "penguji",
        "admin_super",
        "admin_berkas",
        "admin_keuangan",
        "pewawancara_calsan",
        "pewawancara_cawalsan",
        "penguji_quran",
        "penguji_calsan",
        "penguji_cawalsan"
      ];
      const userRoleLower = profile.role.toLowerCase();
      if (!allowedRoles.includes(userRoleLower)) {
        return NextResponse.json(
          { error: "Akun ini tidak memiliki akses admin/penguji" },
          { status: 403 },
        );
      }

      const isValid = await comparePassword(password, profile.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Username / Email / No. WA atau Password salah" },
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
          available_roles: [...new Set([profile.role, ...secondaryRoles])] });
      }

      const isDefaultPassword = profile.must_change_password === true || password === "2026#@" || profile.plain_password === "2026#@";

      // Single role — login normally
      const responseJson = NextResponse.json({
        success: true,
        message: "Login berhasil",
        role: profile.role,
        is_default_password: isDefaultPassword,
        data: {
          id: profile.id,
          full_name: profile.full_name,
          phone: profile.phone,
          username: profile.username,
          role: profile.role,
          is_default_password: isDefaultPassword } });

      responseJson.cookies.set(
        "al_session",
        JSON.stringify({
          role: profile.role,
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          username: profile.username,
          is_default_password: isDefaultPassword }),
        {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
      
          maxAge: 60 * 60 * 24 * 90,
          expires: new Date(Date.now() + 60 * 60 * 24 * 90 * 1000), // 90 Days Persistent Session
        },
      );

      return responseJson;
    } else {
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



