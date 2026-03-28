import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils/password";
import crypto from "crypto";

async function checkHeadOfIT() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("app_session");

  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value);
    // ONLY head_of_it and tim_it can manage users. Admin Super cannot.
    if (session.role === "head_of_it" || session.role === "tim_it") {
      return session;
    }
  } catch {
    // ignore parse errors
  }

  return null;
}

// GET: List all admin/staff users
export async function GET() {
  const admin = await checkHeadOfIT();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const profiles = await prisma.profile.findMany({
      where: {
        role: { in: ["admin_berkas", "admin_keuangan", "penguji", "admin_super", "admin", "penguji_calsan", "pewawancara_calsan", "pewawancara_cawalsan", "tim_it"] },
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
  const admin = await checkHeadOfIT();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, password, full_name, role, secondary_roles } = body;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.profile.findFirst({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: "User dengan email ini sudah terdaftar." }, { status: 400 });
    }

    const password_hash = await hashPassword(password);

    const profile = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        email,
        full_name,
        role,
        secondary_roles: Array.isArray(secondary_roles) ? secondary_roles : [],
        phone: "-",
        password_hash,
      },
    });

    return NextResponse.json({ success: true, user: profile });
  } catch (error: any) {
    console.error("POST /api/admin/users ERROR:", error);
    return NextResponse.json({
      error: error.message || "Database error",
    }, { status: 500 });
  }
}

// PUT: Update user (Reset Password or Change Role)
export async function PUT(request: Request) {
  const admin = await checkHeadOfIT();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, password, role, full_name, email, secondary_roles } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID User diperlukan" }, { status: 400 });
    }

    const data: any = { updated_at: new Date() };
    if (password) data.password_hash = await hashPassword(password);
    if (role) data.role = role;
    if (full_name) data.full_name = full_name;
    if (Array.isArray(secondary_roles)) data.secondary_roles = secondary_roles;

    // Email update logic
    if (email) {
      const existing = await prisma.profile.findFirst({
        where: {
          email: email,
          NOT: { id: id }
        }
      });

      if (existing) {
        return NextResponse.json({ error: "Email sudah digunakan oleh user lain" }, { status: 400 });
      }

      data.email = email;
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
  const admin = await checkHeadOfIT();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID User diperlukan" }, { status: 400 });
    }

    await prisma.profile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
