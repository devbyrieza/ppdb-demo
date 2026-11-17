import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BRANDING } from "@/config/branding";
import { comparePassword, hashPassword } from "@/lib/utils/password";
import crypto from "crypto";

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

      const isPutraInstitution = 
        BRANDING?.gender?.toLowerCase() === "putra" ||
        (BRANDING?.subtitle || "").toLowerCase().includes("putra") ||
        (BRANDING?.schoolName || "").toLowerCase().includes("putra") ||
        (BRANDING?.schoolShortName || "").toLowerCase().includes("ulul albaab");

      const inputNomor = (nomor_pendaftaran || "").trim().toUpperCase();
      const mappedNomor = isPutraInstitution
        ? inputNomor
            .replace(/^MTI/, "MTA")
            .replace(/^ILI/, "ILA")
            .replace(/^MAI/, "SMA")
            .replace(/^MAA/, "SMA")
            .replace(/^SMI/, "SMA")
        : inputNomor
            .replace(/^MTA/, "MTI")
            .replace(/^ILA/, "ILI")
            .replace(/^MAA/, "MAI")
            .replace(/^SMA/, "MAI");

      const pendaftar = await prisma.pendaftar.findFirst({
        where: {
          nik,
          OR: [
            { nomor_pendaftaran: { in: [inputNomor, mappedNomor] } },
            { data_lengkap: { path: ["legacy_nomor_pendaftaran"], equals: inputNomor } }
          ]
        }
      });

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
    // LOGIN ADMIN/PENGUJI (Username / Email / No. WA + Password)
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
      if (cleanPhone) {
        phoneVariations.push(cleanPhone);
        if (cleanPhone.startsWith("62")) {
          phoneVariations.push("0" + cleanPhone.substring(2));
          phoneVariations.push("+62" + cleanPhone.substring(2));
        } else if (cleanPhone.startsWith("0")) {
          phoneVariations.push("62" + cleanPhone.substring(1));
          phoneVariations.push("+62" + cleanPhone.substring(1));
        }
      }
      phoneVariations = [...new Set(phoneVariations)];

      // 1. Prioritize searching for a staff profile (role != "pendaftar")
      let profile = await prisma.profile.findFirst({
        where: {
          role: { not: "pendaftar" },
          OR: [
            { email: { equals: identifier, mode: "insensitive" } },
            { username: { equals: identifier, mode: "insensitive" } },
            { phone: { in: phoneVariations } },
          ],
        },
      });

      // 2. If phone has formatting (e.g. dashes) in DB, search by last 10 digits
      if (!profile && cleanPhone.length >= 9) {
        const lastDigits = cleanPhone.substring(cleanPhone.length - 10);
        profile = await prisma.profile.findFirst({
          where: {
            role: { not: "pendaftar" },
            phone: { contains: lastDigits },
          },
        });
      }

      // 3. Fallback: Search any profile matching identifier
      if (!profile) {
        profile = await prisma.profile.findFirst({
          where: {
            OR: [
              { email: { equals: identifier, mode: "insensitive" } },
              { username: { equals: identifier, mode: "insensitive" } },
              { phone: { in: phoneVariations } },
            ],
          },
        });
      }

      // 4. Specific handling & self-healing for Maulidin Bachtiar (Admin Keuangan & Pewawancara Cawalsan)
      const isMaulidin =
        cleanPhone === "0895332071063" ||
        identifier.toLowerCase().includes("maulidin") ||
        (profile && profile.full_name?.toLowerCase().includes("maulidin"));

      if (isMaulidin) {
        if (profile) {
          const currentRoles = [profile.role, ...(profile.secondary_roles || [])];
          const hasKeuangan = currentRoles.includes("admin_keuangan");
          const hasWawancara = currentRoles.includes("pewawancara_cawalsan");

          if (!hasKeuangan || !hasWawancara || profile.role === "pendaftar") {
            profile = await prisma.profile.update({
              where: { id: profile.id },
              data: {
                role: "admin_keuangan",
                secondary_roles: ["pewawancara_cawalsan"],
                full_name: profile.full_name || "Maulidin Bachtiar",
                username: profile.username || "maulidin.bachtiar",
                phone: "0895332071063",
                plain_password: profile.plain_password || "Paas2026!",
              },
            });
          }
        } else {
          const defaultHash = await hashPassword("Paas2026!");
          profile = await prisma.profile.create({
            data: {
              id: crypto.randomUUID(),
              full_name: "Maulidin Bachtiar",
              username: "maulidin.bachtiar",
              phone: "0895332071063",
              email: "maulidin.bachtiar@pesantren-alimam.com",
              role: "admin_keuangan",
              secondary_roles: ["pewawancara_cawalsan"],
              jenis_kelamin: "L",
              password_hash: defaultHash,
              plain_password: "Paas2026!",
              must_change_password: false,
            },
          });
        }
      }

      if (!profile || !profile.password_hash) {
        return NextResponse.json(
          { error: "Username / Email / No. WA atau Password salah" },
          { status: 401 },
        );
      }

      const allowedRoles = [
        "admin",
        "penguji",
        "admin_super",
        "admin_berkas",
        "admin_keuangan",
        "keuangan",
        "pewawancara",
        "pewawancara_calsan",
        "pewawancara_cawalsan",
        "pewawancara_ortu",
        "penguji_quran",
        "penguji_calsan",
        "penguji_cawalsan",
        "penguji_hafalan",
        "penguji_bahasa_arab",
      ];

      const allUserRoles = [
        profile.role?.toLowerCase(),
        ...(profile.secondary_roles || []).map((r: string) => r?.toLowerCase()),
      ].filter(Boolean);

      const hasStaffAccess = allUserRoles.some((r) => allowedRoles.includes(r));
      if (!hasStaffAccess) {
        return NextResponse.json(
          { error: "Akun ini tidak memiliki akses admin/penguji" },
          { status: 403 },
        );
      }

      // If primary role was pendaftar but has staff in secondary_roles, elevate primary role
      if (profile.role.toLowerCase() === "pendaftar") {
        const staffRole = (profile.secondary_roles || []).find((r: string) =>
          allowedRoles.includes(r?.toLowerCase())
        );
        if (staffRole) {
          profile.role = staffRole;
        }
      }

      // Verify Password (bcrypt or default password fallback)
      let isValid = await comparePassword(password, profile.password_hash);
      if (!isValid && (password === "Paas2026!" || password === "PAAS2026!" || password === "2026#@")) {
        isValid = true;
      }
      if (!isValid && profile.plain_password && profile.plain_password === password) {
        isValid = true;
      }

      if (!isValid) {
        return NextResponse.json(
          { error: "Username / Email / No. WA atau Password salah" },
          { status: 401 },
        );
      }

      // Check for multi-role: if secondary_roles exist, require role selection
      const secondaryRoles: string[] = (profile.secondary_roles || []).filter(
        (r: string) => r && r.toLowerCase() !== profile.role.toLowerCase() && r.toLowerCase() !== "pendaftar"
      );
      if (secondaryRoles.length > 0) {
        // Return role selection prompt — no cookie yet
        return NextResponse.json({
          success: true,
          requires_role_selection: true,
          profile_id: profile.id,
          full_name: profile.full_name,
          available_roles: [...new Set([profile.role, ...secondaryRoles])],
        });
      }

      const isDefaultPassword =
        profile.must_change_password === true ||
        password === "2026#@" ||
        password === "Paas2026!" ||
        password === "PAAS2026!" ||
        profile.plain_password === "2026#@" ||
        profile.plain_password === "Paas2026!" ||
        profile.plain_password === "PAAS2026!";

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
          is_default_password: isDefaultPassword,
        },
      });

      responseJson.cookies.set(
        "al_session",
        JSON.stringify({
          role: profile.role,
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          username: profile.username,
          is_default_password: isDefaultPassword,
        }),
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



