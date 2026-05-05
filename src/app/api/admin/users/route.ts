import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils/password";
import crypto from "crypto";

async function checkAdminPrivilege() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");

  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value);
    // ONLY admin_super and admin can manage users.
    if (session.role === "admin_super" || session.role === "admin") {
      return session;
    }
  } catch {
    // ignore parse errors
  }

  return null;
}

// GET: List all admin/staff users
export async function GET() {
  const admin = await checkAdminPrivilege();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const profiles = await prisma.profile.findMany({
      where: {
        role: {
          in: [
            "admin_berkas",
            "admin_keuangan",
            "penguji",
            "admin_super",
            "admin",
            "penguji_calsan",
            "pewawancara_calsan",
            "pewawancara_cawalsan",
          ],
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ data: profiles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create new user
export async function POST(request: Request) {
  const admin = await checkAdminPrivilege();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email: rawEmail, password, full_name, role, secondary_roles, phone } = body;
    const email = rawEmail?.trim().toLowerCase();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existing = await prisma.profile.findFirst({
      where: { email },
    });

    if (existing) {
      const adminRoles = [
        "admin_berkas",
        "admin_keuangan",
        "penguji",
        "admin_super",
        "admin",
        "penguji_calsan",
        "pewawancara_calsan",
        "pewawancara_cawalsan",
      ];
      
      // If it's already an admin, don't allow duplicate
      if (adminRoles.includes(existing.role)) {
        return NextResponse.json(
          { error: "User dengan email ini sudah terdaftar sebagai admin/staf." },
          { status: 400 },
        );
      }

      // If it's a pendaftar, we "promote" it to admin
      const password_hash = await hashPassword(password);
      const updatedProfile = await prisma.profile.update({
        where: { id: existing.id },
        data: {
          full_name,
          role,
          secondary_roles: Array.isArray(secondary_roles) ? secondary_roles : [],
          phone: phone || existing.phone || "-",
          password_hash,
          updated_at: new Date(),
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: "Akun pendaftar berhasil ditingkatkan menjadi admin.",
        user: updatedProfile 
      });
    }

    const password_hash = await hashPassword(password);

    const profile = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        email,
        full_name,
        role,
        secondary_roles: Array.isArray(secondary_roles) ? secondary_roles : [],
        phone: phone || "-",
        password_hash,
      },
    });

    return NextResponse.json({ success: true, user: profile });
  } catch (error: any) {
    console.error("POST /api/admin/users ERROR:", error);
    return NextResponse.json(
      {
        error: error.message || "Database error",
      },
      { status: 500 },
    );
  }
}

// PUT: Update user (Reset Password or Change Role)
export async function PUT(request: Request) {
  const admin = await checkAdminPrivilege();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, password, role, full_name, email, secondary_roles, phone } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID User diperlukan" },
        { status: 400 },
      );
    }

    const data: any = { updated_at: new Date() };
    if (password) data.password_hash = await hashPassword(password);
    if (role) data.role = role;
    if (full_name) data.full_name = full_name;
    if (Array.isArray(secondary_roles)) data.secondary_roles = secondary_roles;
    if (phone !== undefined) data.phone = phone;

    // Email update logic
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = await prisma.profile.findFirst({
        where: {
          email: cleanEmail,
          NOT: { id: id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Email sudah digunakan oleh user lain" },
          { status: 400 },
        );
      }

      data.email = cleanEmail;
    }

    await prisma.profile.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete user
export async function DELETE(request: Request) {
  const admin = await checkAdminPrivilege();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID User diperlukan" },
        { status: 400 },
      );
    }

    await prisma.profile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
