import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enqueueWhatsapp, buildMessagePaymentVerified, buildMessagePaymentRejected } from "@/lib/whatsapp-queue";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import { getAdminWhereClause } from "@/lib/utils/admin";

// GET: List pembayaran yang perlu diverifikasi
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check custom role
    const allowedRoles = ["admin", "admin_super", "admin_berkas", "admin_keuangan", "penguji"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending";
    const jenis = searchParams.get("jenis"); // PENDAFTARAN or DAFTAR_ULANG

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
          }
        }
      },
      orderBy: { created_at: "desc" },
    });

    // Generate URLs (Mock for now as we removed Supabase Storage)
    // TODO: Implement proper storage URL generation for local files or S3
    const dataWithUrls = data.map((pembayaran) => {
      let bukti_transfer_url: string | null = null;
      if (pembayaran.bukti_transfer_path) {
        // Construct URL for the /api/files/[...path] route
        bukti_transfer_url = `/api/files/${pembayaran.bukti_transfer_path}`;
      }

      return {
        id: pembayaran.id,
        jumlah: pembayaran.jumlah,
        metode_pembayaran: pembayaran.metode_pembayaran,
        status_pembayaran: pembayaran.status_pembayaran,
        catatan: pembayaran.catatan_verifikasi,
        bukti_transfer_url,
        tanggal_pembayaran: pembayaran.created_at,
        created_at: pembayaran.created_at,
        updated_at: pembayaran.updated_at,
        pendaftar: pembayaran.pendaftar,
        tipe_cicilan: pembayaran.tipe_cicilan,
        cicilan_ke: pembayaran.cicilan_ke,
        total_tagihan: pembayaran.total_tagihan,
      };
    });

    return NextResponse.json({ data: dataWithUrls });
  } catch (error) {
    console.error("Error in pembayaran verification API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Verify or reject pembayaran
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check custom role
    const allowedRoles = ["admin", "admin_super", "admin_berkas", "admin_keuangan", "penguji"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { pembayaran_id, status_pembayaran, catatan, jumlah, tipe_cicilan } = body;

    if (!pembayaran_id || !status_pembayaran) {
      return NextResponse.json(
        { error: "pembayaran_id and status_pembayaran are required" },
        { status: 400 }
      );
    }

    if (!["verified", "rejected", "pending"].includes(status_pembayaran)) {
      return NextResponse.json(
        { error: "status_pembayaran must be verified, rejected or pending" },
        { status: 400 }
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
      },
      include: {
        pendaftar: {
          select: {
            nama_lengkap: true,
            no_hp: true,
            status_pendaftaran: true,
          },
        },
      },
    });

    // Also update pendaftar status
    const { getStatusIndex } = await import("@/lib/access-control");
    let newPendaftarStatus = pembayaran.pendaftar.status_pendaftaran;
    
    if (status_pembayaran === "verified") {
       if (getStatusIndex(newPendaftarStatus as any) < getStatusIndex('verified' as any)) {
           newPendaftarStatus = 'verified';
       }
    } else if (status_pembayaran === "rejected") {
       if (getStatusIndex(newPendaftarStatus as any) <= getStatusIndex('payment_verification' as any)) {
           newPendaftarStatus = 'payment_rejected';
       }
    }

    if (newPendaftarStatus !== pembayaran.pendaftar.status_pendaftaran) {
      await prisma.pendaftar.update({
        where: { id: pembayaran.pendaftar_id },
        data: {
          status_pendaftaran: newPendaftarStatus,
          updated_at: new Date()
        }
      });
    }

    // Logging audit action
    logAdminAction({
      action: 'VERIFY_PAYMENT',
      adminId: session.id || 'system',
      adminName: session.full_name || session.name || 'Admin',
      targetId: pembayaran.pendaftar_id,
      targetName: pembayaran.pendaftar.nama_lengkap,
      details: { status_pembayaran, payment_id: pembayaran_id }
    });

    // Send WhatsApp notification via Queue
    try {
      if (pembayaran.pendaftar?.no_hp && status_pembayaran !== "pending") {
        const isVerifiedPayment = status_pembayaran === "verified";
        
        // Prevent duplicate 'payment_verified' notifications
        let shouldSendNotif = true;
        if (isVerifiedPayment) {
          const existingVerifiedNotif = await prisma.whatsappLog.findFirst({
            where: {
              pendaftar_id: pembayaran.pendaftar_id,
              jenis_notif: "payment_verified"
            }
          });
          if (existingVerifiedNotif) {
            shouldSendNotif = false;
          }
        }

        if (shouldSendNotif) {
          const formattedAmount = `Rp ${parseInt(pembayaran.jumlah.toString()).toLocaleString('id-ID')}`;
          const paymentDate = new Date(pembayaran.created_at).toLocaleDateString('id-ID');

          await enqueueWhatsapp({
            pendaftarId: pembayaran.pendaftar_id,
            phone: pembayaran.pendaftar.no_hp,
            jenisNotif: isVerifiedPayment ? "payment_verified" : "payment_rejected",
            messageContent: isVerifiedPayment
              ? buildMessagePaymentVerified(pembayaran.pendaftar.nama_lengkap, formattedAmount, pembayaran.metode_pembayaran, paymentDate)
              : buildMessagePaymentRejected(pembayaran.pendaftar.nama_lengkap, catatan || ""),
          });
        }
      }
    } catch (error) {
      console.error("WhatsApp notification enqueue error:", error);
      // Don't fail verification if notification fails
    }

    return NextResponse.json({ success: true, data: pembayaran, pendaftar_status: newPendaftarStatus });
  } catch (error) {
    console.error("Error in pembayaran verification update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
