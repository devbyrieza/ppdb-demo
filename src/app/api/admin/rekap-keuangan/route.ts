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
        status_pendaftaran: {
          not: "mengundurkan_diri",
        },
        OR: [
          {
            nilai_ujian: {
              some: {
                status_kelulusan: { in: ["LULUS", "DITERIMA"] },
              },
            },
          },
          {
            hasil_seleksi: {
              status_seleksi: { in: ["DITERIMA", "CADANGAN"] },
            },
          },
          {
            pengumuman: {
              status_kelulusan: { in: ["Lulus", "Diterima", "Cadangan"] },
            },
          },
          {
            status_pendaftaran: { in: ["accepted", "announced", "cadangan", "passed", "enrolled"] },
          },
        ],
      } as any,
      select: {
        id: true,
        nomor_pendaftaran: true,
        nama_lengkap: true,
        jenjang: true,
        no_hp: true,
        email: true,
        data_lengkap: true,
        updated_at: true,
        status_pendaftaran: true,
        nilai_ujian: {
          select: { status_kelulusan: true },
        },
        orang_tua: {
          select: {
            nama_ayah: true,
            pekerjaan_ayah: true,
            penghasilan_ayah: true,
            no_hp_ayah: true,
            nama_ibu: true,
            pekerjaan_ibu: true,
            penghasilan_ibu: true,
            no_hp_ibu: true,
          },
        },
        pengajuan_beasiswa: {
          select: {
            status: true,
            jenis_pengajuan: true,
            nominal_potongan: true,
          },
        },
        pembayaran: {
          where: {
            jenis_pembayaran: "DAFTAR_ULANG",
          },
          select: {
            id: true,
            jumlah: true,
            status_pembayaran: true,
            metode_pembayaran: true,
            bukti_transfer_path: true,
            bukti_transfer_filename: true,
            catatan_verifikasi: true,
            keringanan_reason: true,
            cicilan_ke: true,
            created_at: true,
            updated_at: true,
          },
        },
      } as any,
      orderBy: { nama_lengkap: "asc" },
    });

    // 3. Transform Data
    const rekapData = students.map((student: any, index: number) => {
      // Calculate Total Paid for Daftar Ulang (only verified payments)
      const verifiedPayments = student.pembayaran.filter(
        (p: any) => p.status_pembayaran === "verified",
      );
      const totalBayar = verifiedPayments.reduce(
        (sum: number, p: any) => sum + Number(p.jumlah),
        0,
      );

      // Fetch approved scholarship details from database or fallback from JSON
      const dataLengkap = (student.data_lengkap as any) || {};
      const keringananJson = dataLengkap.keringanan_daftar_ulang || {};
      const isApproved = student.pengajuan_beasiswa?.status === "DISETUJUI" || !!keringananJson.nominal_potongan;
      const nominalPotongan = Number(
        (student.pengajuan_beasiswa?.status === "DISETUJUI" ? student.pengajuan_beasiswa?.nominal_potongan : null) ?? 
        keringananJson.nominal_potongan ?? 
        0
      );
      const requiredAmount = 8500000 - nominalPotongan;

      // Determine Status
      let statusBayar = "BELUM_BAYAR";
      if (totalBayar >= requiredAmount) {
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
      const reasons = verifiedPayments
        .map((p: any) => p.keringanan_reason)
        .filter((r: any) => !!r);

      let diskon_label: string | null = null;
      if (isApproved) {
        let beasiswaLabel = "Keringanan Biaya";
        if (keringananJson.jenis) {
          beasiswaLabel = keringananJson.jenis;
        } else if (student.pengajuan_beasiswa?.status === "DISETUJUI") {
          const rawJenis = student.pengajuan_beasiswa.jenis_pengajuan || "";
          if (rawJenis === "BEASISWA_PRESTASI") {
            beasiswaLabel = "Beasiswa Prestasi";
          } else if (rawJenis === "KERINGANAN_BIAYA") {
            beasiswaLabel = "Keringanan Biaya";
          } else if (rawJenis) {
            beasiswaLabel = rawJenis
              .toLowerCase()
              .split("_")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }
        }
        diskon_label = beasiswaLabel;
        reasons.unshift(`${beasiswaLabel} (Potongan: Rp ${nominalPotongan.toLocaleString("id-ID")})`);
      }
      const keringanan_reason = reasons.length > 0 ? reasons.join(" | ") : null;

      return {
        no: index + 1,
        id: student.id,
        nama: student.nama_lengkap,
        nomor_pendaftaran: student.nomor_pendaftaran,
        jenjang: student.jenjang || "-",
        status_kelulusan: ["accepted", "passed", "enrolled"].includes(student.status_pendaftaran)
          ? "DITERIMA"
          : (student.nilai_ujian[0]?.status_kelulusan || "LULUS"),
        total_bayar: totalBayar,
        tipe_cicilan: statusBayar,
        keringanan_reason,
        diskon_label,
        sisa_tagihan: Math.max(0, requiredAmount - totalBayar),
        last_updated: lastUpdate,
        pembayaran_list: student.pembayaran, // Pass all payments to the frontend
        no_hp: student.no_hp || "-",
        email: student.email || "-",
        ortu: (() => {
          const dataLengkap: any = student.data_lengkap || {};
          const ayah = dataLengkap.ayah || {};
          const ibu = dataLengkap.ibu || {};

          const cleanVal = (val: any) => {
            if (val === null || val === undefined) return null;
            const str = val.toString().trim();
            return str === "" || str === "-" ? null : str;
          };

          return {
            nama_ayah: cleanVal(student.orang_tua?.nama_ayah) || cleanVal(ayah.nama_lengkap) || "-",
            pekerjaan_ayah: cleanVal(student.orang_tua?.pekerjaan_ayah) || cleanVal(ayah.pekerjaan) || "-",
            penghasilan_ayah: cleanVal(student.orang_tua?.penghasilan_ayah) || cleanVal(ayah.penghasilan) || "-",
            no_hp_ayah: cleanVal(student.orang_tua?.no_hp_ayah) || cleanVal(ayah.no_hp) || "-",
            nama_ibu: cleanVal(student.orang_tua?.nama_ibu) || cleanVal(ibu.nama_lengkap) || "-",
            pekerjaan_ibu: cleanVal(student.orang_tua?.pekerjaan_ibu) || cleanVal(ibu.pekerjaan) || "-",
            penghasilan_ibu: cleanVal(student.orang_tua?.penghasilan_ibu) || cleanVal(ibu.penghasilan) || "-",
            no_hp_ibu: cleanVal(student.orang_tua?.no_hp_ibu) || cleanVal(ibu.no_hp) || "-",
          };
        })(),
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
