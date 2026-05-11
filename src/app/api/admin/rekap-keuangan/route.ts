import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getAdminWhereClause } from "@/lib/utils/admin";

export async function GET(request: NextRequest) {
  try {
    // 1. Auth Check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    // Allow admin, admin_super, admin_keuangan (if exists)
    // For now check if role starts with 'admin'
    if (!session.role.startsWith("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tahunAjaranId = searchParams.get("tahun_ajaran_id");

    // 2. Fetch Data
    // Get all students who PASSED
    const baseWhere = getAdminWhereClause(tahunAjaranId || undefined) as any;
    const students = await prisma.pendaftar.findMany({
      where: {
        ...baseWhere,
        nilai_ujian: {
          some: {
            status_kelulusan: "LULUS",
          },
        },
      } as any,
      select: {
        id: true,
        nomor_pendaftaran: true,
        jenjang: true,
        updated_at: true,
        nilai_ujian: {
          select: { status_kelulusan: true },
        },
        pembayaran: {
          where: {
            jenis_pembayaran: "DAFTAR_ULANG",
            status_pembayaran: "verified", // Only count verified payments
          },
          select: {
            jumlah: true,
            keringanan_reason: true,
            updated_at: true,
          },
        },
      } as any,
      orderBy: { nama_lengkap: "asc" },
    });

    // 3. Transform Data
    const rekapData = students.map((student: any, index: number) => {
      // Calculate Total Paid for Daftar Ulang
      const totalBayar = student.pembayaran.reduce(
        (sum: number, p: any) => sum + Number(p.jumlah),
        0,
      );

      // Determine Status
      let statusBayar = "BELUM_BAYAR";
      if (totalBayar >= 8500000) {
        statusBayar = "LUNAS";
      } else if (totalBayar > 0) {
        statusBayar = "CICILAN";
      }

      // Determine Last Updated (payment or student)
      const lastPayment = student.pembayaran.sort(
        (a: any, b: any) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )[0];
      const lastUpdate = lastPayment
        ? lastPayment.updated_at
        : student.updated_at;

      // Collect reasons
      const reasons = student.pembayaran
        .map((p: any) => p.keringanan_reason)
        .filter((r: any) => !!r);
      const keringanan_reason = reasons.length > 0 ? reasons.join(" | ") : null;

      return {
        no: index + 1,
        id: student.id,
        nama: student.nama_lengkap,
        nomor_pendaftaran: student.nomor_pendaftaran,
        jenjang: student.jenjang || "-",
        status_kelulusan: student.nilai_ujian[0]?.status_kelulusan || "LULUS",
        total_bayar: totalBayar,
        tipe_cicilan: statusBayar,
        keringanan_reason,
        sisa_tagihan: Math.max(0, 8500000 - totalBayar),
        last_updated: lastUpdate,
      };
    });

    return NextResponse.json({ success: true, data: rekapData });
  } catch (error) {
    console.error("Error fetching finance rekap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
