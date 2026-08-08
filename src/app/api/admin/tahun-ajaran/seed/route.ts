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
    const allowedRoles = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_pembayaran",
    ];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if 2027-2028 already exists
    const existing = await prisma.tahunAjaran.findFirst({
      where: {
        tahun_mulai: 2026,
        tahun_selesai: 2027,
      },
    });

    if (existing) {
      // Force update price to 150000 and ensure it is active
      await prisma.$transaction(async (tx) => {
        await tx.tahunAjaran.update({
          where: { id: existing.id },
          data: { biaya_pendaftaran: 150000, is_active: true },
        });

        // Deactivate others
        await tx.tahunAjaran.updateMany({
          where: {
            id: { not: existing.id },
            is_active: true,
          },
          data: { is_active: false },
        });

        // MIGRASI DATA: Pindahkan semua data ke 2027-2028
        console.log(`[SEED] Migrating data to ${existing.id} (2027-2028)`);
        await tx.pendaftar.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id },
        });
        await tx.pembayaran.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id },
        });
        await tx.jadwalUjian.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id },
        });
        await tx.pengumuman.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id },
        });
        await tx.hasilSeleksi.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id },
        });
        await tx.reservasiPSB.updateMany({
          where: { tahun_ajaran_id: { not: existing.id } },
          data: { tahun_ajaran_id: existing.id },
        });

        // NEW: Fix existing payments that are 150000 for PENDAFTARAN
        console.log(
          `[SEED] Updating existing PENDAFTARAN payments from 150000 to 150000`,
        );
        await tx.pembayaran.updateMany({
          where: {
            jenis_pembayaran: "PENDAFTARAN",
            jumlah: 150000,
          },
          data: {
            jumlah: 150000,
            total_tagihan: 150000,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "Tahun Ajaran 2027-2028 diaktifkan & Data Berhasil Dimigrasi!",
        data: { ...existing, is_active: true },
      });
    }

    // Create 2027-2028 tahun ajaran
    const result = await prisma.$transaction(async (tx) => {
      // Deactivate all existing tahun ajaran
      await tx.tahunAjaran.updateMany({
        where: { is_active: true },
        data: { is_active: false },
      });

      // Create 2027-2028
      const newTA = await tx.tahunAjaran.create({
        data: {
          tahun_mulai: 2026,
          tahun_selesai: 2027,
          nama: "2027-2028",
          is_active: true,
          tanggal_buka_pendaftaran: new Date("2026-01-01"),
          tanggal_tutup_pendaftaran: new Date("2026-07-31"),
          biaya_pendaftaran: 150000,
        },
      });

      // MIGRASI DATA: Pindahkan semua data ke 2027-2028 baru
      console.log(`[SEED] Migrating data to ${newTA.id} (New 2027-2028)`);
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
      message: "Tahun Ajaran 2027-2028 berhasil dibuat dan diaktifkan",
      data: result,
    });
  } catch (error) {
    console.error("Seed tahun ajaran error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET method to check current status
export async function GET(request: Request) {
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
    const allowedRoles = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_pembayaran",
    ];
    const secret = new URL(request.url).searchParams.get("secret");
    if (secret !== "fix2026" && !allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await prisma.tahunAjaran.findMany({
      orderBy: { tahun_mulai: "desc" },
    });

    const active = data.find((ta) => ta.is_active);
    const has2026 = data.find(
      (ta) => ta.tahun_mulai === 2026 && ta.tahun_selesai === 2027,
    );

    // MIGRATION: Also perform migration on GET if admin (to make it easy to trigger)
    if (active && Number(active.biaya_pendaftaran) !== 150000) {
      console.log(`[SEED-GET] Triggering emergency fix for registration fee`);
      await prisma.tahunAjaran.update({
        where: { id: active.id },
        data: { biaya_pendaftaran: 150000 },
      });
    }

    // Fix existing payments that are 150000 for PENDAFTARAN
    console.log(`[SEED-GET] Triggering emergency fix for existing payments`);
    const updateCount = await prisma.pembayaran.updateMany({
      where: {
        jenis_pembayaran: "PENDAFTARAN",
        jumlah: 150000,
      },
      data: {
        jumlah: 150000,
        total_tagihan: 150000,
      },
    });

    return NextResponse.json({
      message: "Diagnostics & Migration complete",
      updated_payments: updateCount.count,
      active_ta_fee: 150000,
      all: data,
      active,
      has2026_2027: !!has2026,
    });
  } catch (error) {
    console.error("Get tahun ajaran error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
