import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Validasi session manual
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Check custom role
    const allowedRoles = ["admin", "admin_super", "head_of_it"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if 2026/2027 already exists
    const existing = await prisma.tahunAjaran.findFirst({
      where: {
        tahun_mulai: 2026,
        tahun_selesai: 2027,
      },
    });

    if (existing) {
      // Force update price to 200000 and ensure it is active
      await prisma.$transaction(async (tx) => {
        await tx.tahunAjaran.update({
          where: { id: existing.id },
          data: { biaya_pendaftaran: 200000, is_active: true },
        });

        // Deactivate others
        await tx.tahunAjaran.updateMany({
          where: { 
            id: { not: existing.id },
            is_active: true 
          },
          data: { is_active: false },
        });

        // MIGRASI DATA: Pindahkan semua data ke 2026/2027
        console.log(`[SEED] Migrating data to ${existing.id} (2026/2027)`);
        await tx.pendaftar.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id }
        });
        await tx.pembayaran.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id }
        });
        await tx.jadwalUjian.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id }
        });
        await tx.pengumuman.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id }
        });
        await tx.hasilSeleksi.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id }
        });
        await tx.reservasiPSB.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id }
        });
      });

      return NextResponse.json({
        success: true,
        message: "Tahun Ajaran 2026/2027 diaktifkan & Data Berhasil Dimigrasi!",
        data: { ...existing, is_active: true },
      });
    }

    // Create 2026/2027 tahun ajaran
    const result = await prisma.$transaction(async (tx) => {
      // Deactivate all existing tahun ajaran
      await tx.tahunAjaran.updateMany({
        where: { is_active: true },
        data: { is_active: false },
      });

      // Create 2026/2027
      const newTA = await tx.tahunAjaran.create({
        data: {
          tahun_mulai: 2026,
          tahun_selesai: 2027,
          nama: "2026/2027",
          is_active: true,
          tanggal_buka_pendaftaran: new Date("2026-01-01"),
          tanggal_tutup_pendaftaran: new Date("2026-07-31"),
          biaya_pendaftaran: 200000,
        },
      });

      // MIGRASI DATA: Pindahkan semua data ke 2026/2027 baru
      console.log(`[SEED] Migrating data to ${newTA.id} (New 2026/2027)`);
      await tx.pendaftar.updateMany({ data: { tahun_ajaran_id: newTA.id } });
      await tx.pembayaran.updateMany({ data: { tahun_ajaran_id: newTA.id } });
      await tx.jadwalUjian.updateMany({ data: { tahun_ajaran_id: newTA.id } });
      await tx.pengumuman.updateMany({ data: { tahun_ajaran_id: newTA.id } });
      await tx.hasilSeleksi.updateMany({ data: { tahun_ajaran_id: newTA.id } });
      await tx.reservasiPSB.updateMany({ data: { tahun_ajaran_id: newTA.id } });

      return newTA;
    });

    return NextResponse.json({
      success: true,
      message: "Tahun Ajaran 2026/2027 berhasil dibuat dan diaktifkan",
      data: result,
    });
  } catch (error) {
    console.error("Seed tahun ajaran error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET method to check current status
export async function GET() {
  try {
    // 1. Validasi session manual
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Check custom role
    const allowedRoles = ["admin", "admin_super", "head_of_it"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await prisma.tahunAjaran.findMany({
      orderBy: { tahun_mulai: "desc" },
    });

    const active = data.find((ta) => ta.is_active);
    const has2026 = data.find((ta) => ta.tahun_mulai === 2026 && ta.tahun_selesai === 2027);

    return NextResponse.json({
      all: data,
      active,
      has2026_2027: !!has2026,
    });
  } catch (error) {
    console.error("Get tahun ajaran error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
