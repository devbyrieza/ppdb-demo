import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  enqueueWhatsapp,
  buildMessagePaymentVerified,
  buildMessageDaftarUlangVerified,
  buildMessagePaymentRejected,
} from "@/lib/whatsapp-queue";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import { getAdminWhereClause } from "@/lib/utils/admin";
import { createHmac } from "crypto";

// GET: List pembayaran yang perlu diverifikasi
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check custom role
    const allowedRoles = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_keuangan",
      "penguji",
    ];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending";
    const jenis = searchParams.get("jenis"); // PENDAFTARAN, DAFTAR_ULANG, or SPP

    // Build filter
    const where: any = {
      // Use global admin filter to exclude tests and soft-deleted records
      pendaftar: {
        is: getAdminWhereClause(),
      },
    };
    if (status === "all") {
      // No additional filter
    } else if (status === "pending") {
      where.status_pembayaran = { notIn: ["verified", "rejected"] };
    } else {
      where.status_pembayaran = status;
    }

    if (jenis) {
      where.jenis_pembayaran = jenis;
    }

    // Fetch pembayaran
    const data = await prisma.pembayaran.findMany({
      where,
      select: {
        id: true,
        jumlah: true,
        metode_pembayaran: true,
        status_pembayaran: true,
        catatan_verifikasi: true,
        keringanan_reason: true,
        bukti_transfer_path: true,
        bukti_transfer_filename: true,
        created_at: true,
        updated_at: true,
        tipe_cicilan: true,
        cicilan_ke: true,
        total_tagihan: true,
        pendaftar: {
          select: {
            id: true,
            nomor_pendaftaran: true,
            nama_lengkap: true,
            jenjang: true,
            no_hp: true,
            jenis_kelamin: true,
            tipe_pendaftaran: true,
            data_lengkap: true,
            pembayaran: {
              where: {
                status_pembayaran: "verified",
                jenis_pembayaran: { in: ["DAFTAR_ULANG", "SPP"] as any },
              },
              select: { id: true, jenis_pembayaran: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Generate URLs (Mock for now as we removed Supabase Storage)
    const dataWithUrls = data.map((pembayaran) => {
      let bukti_transfer_url: string | null = null;
      if (pembayaran.bukti_transfer_path) {
        bukti_transfer_url = `/api/files/${pembayaran.bukti_transfer_path}`;
      }

      return {
        id: pembayaran.id,
        jumlah: pembayaran.jumlah,
        metode_pembayaran: pembayaran.metode_pembayaran,
        status_pembayaran: pembayaran.status_pembayaran,
        catatan: pembayaran.catatan_verifikasi,
        keringanan_reason: pembayaran.keringanan_reason,
        bukti_transfer_url,
        tanggal_pembayaran: pembayaran.created_at,
        created_at: pembayaran.created_at,
        updated_at: pembayaran.updated_at,
        pendaftar: {
          id: pembayaran.pendaftar?.id,
          nomor_pendaftaran: pembayaran.pendaftar?.nomor_pendaftaran,
          nama_lengkap: pembayaran.pendaftar?.nama_lengkap,
          jenjang: pembayaran.pendaftar?.jenjang,
          no_hp: pembayaran.pendaftar?.no_hp,
          jenis_kelamin: pembayaran.pendaftar?.jenis_kelamin,
          tipe_pendaftaran: pembayaran.pendaftar?.tipe_pendaftaran,
          data_lengkap: pembayaran.pendaftar?.data_lengkap,
        },
        tipe_cicilan: pembayaran.tipe_cicilan,
        cicilan_ke: pembayaran.cicilan_ke,
        total_tagihan: pembayaran.total_tagihan,
        verified_count: pembayaran.pendaftar?.pembayaran.length || 0,
      };
    });

    // Fetch counts for pending status explicitly
    const baseWhere = getAdminWhereClause() as any;
    
    const countPendaftaran = await prisma.pembayaran.count({
      where: {
        status_pembayaran: { notIn: ["verified", "rejected"] },
        jenis_pembayaran: "PENDAFTARAN",
        pendaftar: baseWhere
      }
    });

    const countDaftarUlang = await prisma.pembayaran.count({
      where: {
        status_pembayaran: { notIn: ["verified", "rejected"] },
        jenis_pembayaran: "DAFTAR_ULANG",
        pendaftar: baseWhere
      }
    });

    const countSpp = await prisma.pembayaran.count({
      where: {
        status_pembayaran: { notIn: ["verified", "rejected"] },
        jenis_pembayaran: "SPP" as any,
        pendaftar: baseWhere
      }
    });
    
    const counts = {
      PENDAFTARAN: countPendaftaran,
      DAFTAR_ULANG: countDaftarUlang,
      SPP: countSpp,
    };

    return NextResponse.json({ data: dataWithUrls, counts });
  } catch (error) {
    console.error("Error in pembayaran verification API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH: Verify or reject pembayaran
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check custom role
    const allowedRoles = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_keuangan",
      "penguji",
    ];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { pembayaran_id, status_pembayaran, catatan, jumlah, tipe_cicilan, cicilan_ke } =
      body;

    if (!pembayaran_id || !status_pembayaran) {
      return NextResponse.json(
        { error: "pembayaran_id and status_pembayaran are required" },
        { status: 400 },
      );
    }

    if (!["verified", "rejected", "pending"].includes(status_pembayaran)) {
      return NextResponse.json(
        { error: "status_pembayaran must be verified, rejected or pending" },
        { status: 400 },
      );
    }

    // Updated pembayaran
    const pembayaran = await prisma.pembayaran.update({
      where: { id: pembayaran_id },
      data: {
        status_pembayaran,
        catatan_verifikasi: catatan,
        jumlah: jumlah ? Number(jumlah) : undefined,
        tipe_cicilan: tipe_cicilan || undefined,
        cicilan_ke: cicilan_ke !== undefined ? Number(cicilan_ke) : undefined,
      },
      include: {
        pendaftar: {
          select: {
            nama_lengkap: true,
            no_hp: true,
            status_pendaftaran: true,
            nomor_pendaftaran: true,
          },
        },
      },
    });

    // Also update pendaftar status
    const { getStatusIndex } = await import("@/lib/access-control");
    let newPendaftarStatus = pembayaran.pendaftar.status_pendaftaran;

    if (status_pembayaran === "verified") {
      // Automatically promote status based on payment type
      if (pembayaran.jenis_pembayaran === "DAFTAR_ULANG" || (pembayaran.jenis_pembayaran as any) === "SPP") {
        // Fetch ALL verified daftar ulang payments
        const allDaftarUlangVerified = await prisma.pembayaran.findMany({
          where: {
            pendaftar_id: pembayaran.pendaftar_id,
            jenis_pembayaran: "DAFTAR_ULANG",
            status_pembayaran: "verified",
          },
        });
        // Fetch ALL verified SPP payments
        const allSppVerified = await prisma.pembayaran.findMany({
          where: {
            pendaftar_id: pembayaran.pendaftar_id,
            jenis_pembayaran: "SPP" as any,
            status_pembayaran: "verified",
          },
        });

        // Fetch pendaftar data for keringanan info
        const pendaftarData = await prisma.pendaftar.findUnique({
          where: { id: pembayaran.pendaftar_id },
          select: { data_lengkap: true },
        });
        let expectedDU = 7500000;
        if (pendaftarData?.data_lengkap) {
          try {
            const dl = typeof pendaftarData.data_lengkap === "string"
              ? JSON.parse(pendaftarData.data_lengkap as string)
              : pendaftarData.data_lengkap as any;
            if (dl?.keringanan_daftar_ulang?.nominal_potongan) {
              expectedDU -= Number(dl.keringanan_daftar_ulang.nominal_potongan);
            }
          } catch(e) {}
        }

        const totalDUPaid = allDaftarUlangVerified.reduce((acc, p) => acc + Number(p.jumlah), 0);
        const totalSPPPaid = allSppVerified.reduce((acc, p) => acc + Number(p.jumlah), 0);

        const duLunas = totalDUPaid >= expectedDU;
        const sppLunas = totalSPPPaid >= 1000000;

        if (duLunas && sppLunas) {
          newPendaftarStatus = "enrolled_full";
        } else if (totalDUPaid > 0 || totalSPPPaid > 0) {
          newPendaftarStatus = "enrolled";
        }
      } else if (
        getStatusIndex(newPendaftarStatus as any) <
        getStatusIndex("verified" as any)
      ) {
        newPendaftarStatus = "verified";
      }
    } else if (status_pembayaran === "rejected") {
      if (
        getStatusIndex(newPendaftarStatus as any) <=
        getStatusIndex("payment_verification" as any)
      ) {
        newPendaftarStatus = "payment_rejected";
      }
    }

    if (newPendaftarStatus !== pembayaran.pendaftar.status_pendaftaran) {
      await prisma.pendaftar.update({
        where: { id: pembayaran.pendaftar_id },
        data: {
          status_pendaftaran: newPendaftarStatus,
          updated_at: new Date(),
        },
      });
    }

    // Logging audit action
    logAdminAction({
      action: "VERIFY_PAYMENT",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: pembayaran.pendaftar_id,
      targetName: pembayaran.pendaftar.nama_lengkap,
      details: { status_pembayaran, payment_id: pembayaran_id },
    });

    // Send WhatsApp notification via Queue
    try {
      if (pembayaran.pendaftar?.no_hp && status_pembayaran !== "pending") {
        const isVerifiedPayment = status_pembayaran === "verified";
        const isDaftarUlang = pembayaran.jenis_pembayaran === "DAFTAR_ULANG";

        // Determine appropriate notification type code
        const activeJenisNotif = isVerifiedPayment
          ? isDaftarUlang
            ? "daftar_ulang_verified"
            : "payment_verified"
          : "payment_rejected";

        // Prevent duplicate confirmation notifications
        let shouldSendNotif = true;
        if (isVerifiedPayment) {
          const existingVerifiedNotif = await prisma.whatsappLog.findFirst({
            where: {
              pendaftar_id: pembayaran.pendaftar_id,
              jenis_notif: activeJenisNotif,
              status: { in: ["pending", "processing", "sent"] },
            },
          });
          if (existingVerifiedNotif) {
            shouldSendNotif = false;
          }
        }

        if (shouldSendNotif) {
          const formattedAmount = `Rp ${parseInt(pembayaran.jumlah.toString()).toLocaleString("id-ID")}`;
          const paymentDate = new Date(
            pembayaran.created_at,
          ).toLocaleDateString("id-ID");

          // Choose correct message builder based on scenario
          let finalMessage = "";
          if (isVerifiedPayment) {
            const metodePembayaran = pembayaran.metode_pembayaran || "Transfer";
            
            if (isDaftarUlang) {
              const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev";
              const nomorPendaftaran = pembayaran.pendaftar.nomor_pendaftaran || "";
              const expectedHash = createHmac("sha256", MAGIC_LINK_SECRET)
                .update(nomorPendaftaran)
                .digest("hex")
                .slice(0, 8);
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
              const longUrl = `${baseUrl}/s/${nomorPendaftaran}-${expectedHash}?t=seragam`;
              
              const { generateShortLink } = await import("@/lib/utils/magic-link");
              const shortUrl = await generateShortLink(longUrl);

              finalMessage = buildMessageDaftarUlangVerified(
                pembayaran.pendaftar.nama_lengkap,
                formattedAmount,
                metodePembayaran,
                paymentDate,
                shortUrl,
              );
            } else {
              finalMessage = buildMessagePaymentVerified(
                pembayaran.pendaftar.nama_lengkap,
                formattedAmount,
                metodePembayaran,
                paymentDate,
              );
            }
          } else {
            finalMessage = buildMessagePaymentRejected(
              pembayaran.pendaftar.nama_lengkap,
              catatan || "",
            );
          }

          await enqueueWhatsapp({
            pendaftarId: pembayaran.pendaftar_id,
            phone: pembayaran.pendaftar.no_hp,
            jenisNotif: activeJenisNotif as any,
            messageContent: finalMessage,
          });
        }
      }
    } catch (error) {
      console.error("WhatsApp notification enqueue error:", error);
      // Don't fail verification if notification fails
    }

    return NextResponse.json({
      success: true,
      data: pembayaran,
      pendaftar_status: newPendaftarStatus,
    });
  } catch (error) {
    console.error("Error in pembayaran verification update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}


// DELETE: Hapus data pembayaran
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession() as any;
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allowedRoles = ["admin_super", "admin_keuangan", "admin"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID pembayaran diperlukan" }, { status: 400 });
    }

    await prisma.pembayaran.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Berhasil dihapus" });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
