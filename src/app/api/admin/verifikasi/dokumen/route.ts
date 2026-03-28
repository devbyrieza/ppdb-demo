import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyDocumentVerified } from "@/lib/wablas";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";

// GET: List dokumen yang perlu diverifikasi
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status") || "pending";
    const pendaftarId = searchParams.get("pendaftar_id");

    // Build filter
    const where: any = {};
    if (pendaftarId) {
      where.pendaftar_id = pendaftarId;
    }

    if (statusParam === "pending") {
      where.is_verified = false;
      where.catatan = null;
    } else if (statusParam === "verified") {
      where.is_verified = true;
    } else if (statusParam === "rejected") {
      where.is_verified = false;
      where.NOT = { catatan: null };
    }

    // Fetch dokumen
    const data = await prisma.dokumen.findMany({
      where,
      select: {
        id: true,
        jenis_dokumen: true,
        is_verified: true,
        catatan: true,
        file_path: true,
        file_type: true,
        created_at: true,
        updated_at: true,
        pendaftar: {
          select: {
            id: true,
            nomor_pendaftaran: true,
            nama_lengkap: true,
            jenjang: true,
            no_hp: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Transform to include file_url
    const transformedData = data.map((dok) => {
      const timestamp = dok.updated_at ? new Date(dok.updated_at).getTime() : Date.now();
      return {
        ...dok,
        file_url: `/api/files/${dok.file_path}?t=${timestamp}`,
      };
    });

    return NextResponse.json({ data: transformedData || [] });
  } catch (error) {
    console.error("Error in dokumen verification API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Verify or reject dokumen
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check custom role
    const allowedRoles = ["admin", "admin_berkas", "admin_keuangan", "penguji", "admin_super"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { dokumen_id, status_verifikasi, catatan } = body;

    if (!dokumen_id || !status_verifikasi) {
      return NextResponse.json(
        { error: "dokumen_id and status_verifikasi are required" },
        { status: 400 }
      );
    }

    if (!["verified", "rejected"].includes(status_verifikasi)) {
      return NextResponse.json(
        { error: "status_verifikasi must be verified or rejected" },
        { status: 400 }
      );
    }

    const isVerified = status_verifikasi === "verified";

    // Update dokumen
    const dokumen = await prisma.dokumen.update({
      where: { id: dokumen_id },
      data: {
        is_verified: isVerified,
        catatan: isVerified ? null : catatan,
      },
      include: {
        pendaftar: {
          select: {
            id: true,
            nama_lengkap: true,
            no_hp: true,
          },
        },
      },
    });

    // Logging audit action
    logAdminAction({
      action: 'VERIFY_DOCUMENT',
      adminId: session.id || 'system',
      adminName: session.full_name || session.name || 'Admin',
      targetId: dokumen.pendaftar_id,
      targetName: dokumen.pendaftar.nama_lengkap,
      details: { jenis_dokumen: dokumen.jenis_dokumen, status_verifikasi, dokumen_id }
    });

    // Send WhatsApp notification
    // BATCH NOTIFICATION LOGIC
    // Check if ALL documents for this pendaftar have been processed (verified or rejected)
    if (dokumen.pendaftar_id) {
      const allDocs = await prisma.dokumen.findMany({
        where: { pendaftar_id: dokumen.pendaftar_id }
      });

      // Pending = Not Verified AND No Note (Rejected usually implies Note)
      // Adjust logic if "Rejected" state is defined differently.
      // Based on GET implementation: blocked if is_verified=false & catatan=null
      const pendingDocs = allDocs.filter(d => !d.is_verified && !d.catatan);

      if (pendingDocs.length === 0) {
        // All documents processed! Send Summary Notification.
        try {
          const rejectedDocs = allDocs.filter(d => !d.is_verified && d.catatan);
          const isAllVerified = rejectedDocs.length === 0;

          if (dokumen.pendaftar?.no_hp) {
            let docListStr = "";
            if (isAllVerified) {
              docListStr = "Semua Dokumen Lengkap";
            } else {
              docListStr = rejectedDocs.map(d => `• ${d.jenis_dokumen}`).join("\n");
            }

            await notifyDocumentVerified({
              phone: dokumen.pendaftar.no_hp,
              nama: dokumen.pendaftar.nama_lengkap,
              dokumen_list: docListStr,
              status: isAllVerified ? "verified" : "rejected",
              catatan: isAllVerified ? undefined : "Terdapat dokumen yang perlu diperbaiki. Silakan cek dashboard.",
            });
          }
        } catch (error) {
          console.error("WhatsApp batch notification error:", error);
        }
      }
    }

    // CHECK STATUS PROGRESSION / REVERSION
    if (dokumen.pendaftar_id) {
      const currentPendaftar = await prisma.pendaftar.findUnique({
        where: { id: dokumen.pendaftar_id },
        select: { status_pendaftaran: true }
      });

      if (isVerified) {
        // 1. Get all documents for this pendaftar
        const allDocs = await prisma.dokumen.findMany({
          where: { pendaftar_id: dokumen.pendaftar_id }
        });

        // 2. Define required docs
        const REQUIRED_DOCS = [
          'kartu_keluarga', 'akta_kelahiran', 'rapor_sem1', 'rapor_sem2',
          'nisn', 'foto_setengah_badan', 'surat_kesehatan', 'pakta_integritas', 'pernyataan_bebas_negatif'
        ];

        // 3. check if every required doc is present and verified
        const verifiedTypes = new Set(allDocs.filter(d => d.is_verified).map(d => d.jenis_dokumen));
        const allRequiredVerified = REQUIRED_DOCS.every(type => verifiedTypes.has(type));

        if (allRequiredVerified && currentPendaftar?.status_pendaftaran === 'docs_uploaded') {
          await prisma.pendaftar.update({
            where: { id: dokumen.pendaftar_id },
            data: { status_pendaftaran: 'docs_verified' }
          });
        }
      } else {
        // REJECTED: Revert status if it was 'docs_verified'
        if (currentPendaftar?.status_pendaftaran === 'docs_verified') {
          await prisma.pendaftar.update({
            where: { id: dokumen.pendaftar_id },
            data: { status_pendaftaran: 'docs_uploaded' }
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: dokumen });
  } catch (error) {
    console.error("Error in dokumen verification update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
