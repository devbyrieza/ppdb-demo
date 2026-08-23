import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/utils/password";
import crypto from "crypto";

async function checkAdminPrivilege() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("al_session");

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
          not: "pendaftar" },
        OR: [
          { username: { not: "wahabrajasam" } },
          { username: null },
        ]
      },
      orderBy: { created_at: "desc" } });

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
    const { email: rawEmail, username: rawUsername, password, full_name, role, secondary_roles, phone, jenis_kelamin } = body;
    const email = rawEmail?.trim()?.toLowerCase();
    const username = rawUsername?.trim()?.toLowerCase() || null;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const isExaminerOrInterviewer = 
      ["penguji", "pewawancara_calsan", "pewawancara_cawalsan", "penguji_hafalan", "penguji_bahasa_arab"].includes(role) ||
      (Array.isArray(secondary_roles) && secondary_roles.some((r: string) => 
        ["penguji", "pewawancara_calsan", "pewawancara_cawalsan", "penguji_hafalan", "penguji_bahasa_arab"].includes(r)
      ));

    if (isExaminerOrInterviewer && (!phone || phone === "-" || phone.trim().length < 6)) {
      return NextResponse.json(
        { error: "Penguji/Pewawancara wajib memiliki nomor WhatsApp aktif untuk verifikasi PIN 4 digit terakhir." },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existing = await prisma.profile.findFirst({
      where: { email } });

    if (existing) {
      const adminRoles = [
        "admin_berkas",
        "admin_keuangan",
        "penguji",
        "admin_super",
        "admin",
        "pewawancara_calsan",
        "pewawancara_cawalsan",
        "penguji_hafalan",
        "penguji_bahasa_arab",
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
          username: username || existing.username,
          password_hash,
          updated_at: new Date() } });

      if (isExaminerOrInterviewer && updatedProfile.phone && updatedProfile.phone !== "-") {
        const { notifyNewStaffAccess } = await import("@/lib/wablas");
        try {
          await notifyNewStaffAccess({
            phone: updatedProfile.phone,
            nama: updatedProfile.full_name,
            role: updatedProfile.role,
            profileId: updatedProfile.id });
        } catch (err) {
          console.error("Wablas notifyNewStaffAccess error:", err);
        }
      }

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
        username: username,
        jenis_kelamin: jenis_kelamin || null,
        password_hash } });

    if (isExaminerOrInterviewer && profile.phone && profile.phone !== "-") {
      const { notifyNewStaffAccess } = await import("@/lib/wablas");
      try {
        await notifyNewStaffAccess({
          phone: profile.phone,
          nama: profile.full_name,
          role: profile.role,
          profileId: profile.id });
      } catch (err) {
        console.error("Wablas notifyNewStaffAccess error:", err);
      }
    }

    return NextResponse.json({ success: true, user: profile });
  } catch (error: any) {
    console.error("POST /api/admin/users ERROR:", error);
    return NextResponse.json(
      {
        error: error.message || "Database error" },
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
    const { id, password, role, full_name, email, username, secondary_roles, phone, jenis_kelamin } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID User diperlukan" },
        { status: 400 },
      );
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { id } });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    const finalRole = role || existingProfile.role;
    const finalSecondaryRoles = Array.isArray(secondary_roles) ? secondary_roles : existingProfile.secondary_roles;
    const finalPhone = phone !== undefined ? phone : existingProfile.phone;

    const isExaminerOrInterviewer = 
      ["penguji", "pewawancara_calsan", "pewawancara_cawalsan", "penguji_hafalan", "penguji_bahasa_arab"].includes(finalRole) ||
      (Array.isArray(finalSecondaryRoles) && finalSecondaryRoles.some((r: string) => 
        ["penguji", "pewawancara_calsan", "pewawancara_cawalsan", "penguji_hafalan", "penguji_bahasa_arab"].includes(r)
      ));

    if (isExaminerOrInterviewer && (!finalPhone || finalPhone === "-" || finalPhone.trim().length < 6)) {
      return NextResponse.json(
        { error: "Penguji/Pewawancara wajib memiliki nomor WhatsApp aktif untuk verifikasi PIN 4 digit terakhir." },
        { status: 400 },
      );
    }

    const data: any = { updated_at: new Date() };
    if (password) data.password_hash = await hashPassword(password);
    if (role) data.role = role;
    if (full_name) data.full_name = full_name;
    if (Array.isArray(secondary_roles)) data.secondary_roles = secondary_roles;
    if (phone !== undefined) data.phone = phone;
    if (username !== undefined) data.username = username?.trim()?.toLowerCase() || null;
    if (jenis_kelamin !== undefined) data.jenis_kelamin = jenis_kelamin;

    // Email update logic
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = await prisma.profile.findFirst({
        where: {
          email: cleanEmail,
          NOT: { id: id } } });

      if (existing) {
        return NextResponse.json(
          { error: "Email sudah digunakan oleh user lain" },
          { status: 400 },
        );
      }

      data.email = cleanEmail;
    }

    const roleChanged = role && role !== existingProfile.role;
    const phoneChanged = phone !== undefined && phone !== existingProfile.phone;

    const updatedProfile = await prisma.profile.update({
      where: { id },
      data });

    if (isExaminerOrInterviewer && (roleChanged || phoneChanged)) {
      if (updatedProfile.phone && updatedProfile.phone !== "-") {
        const { notifyNewStaffAccess } = await import("@/lib/wablas");
        try {
          await notifyNewStaffAccess({
            phone: updatedProfile.phone,
            nama: updatedProfile.full_name,
            role: updatedProfile.role,
            profileId: updatedProfile.id });
        } catch (err) {
          console.error("Wablas notifyNewStaffAccess error:", err);
        }
      }
    }

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

