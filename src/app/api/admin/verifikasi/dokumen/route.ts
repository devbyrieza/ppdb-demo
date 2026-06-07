import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyDocumentVerified } from "@/lib/wablas";
import { getServerSession } from "@/lib/session";
import { logAdminAction } from "@/lib/audit";
import {
  enqueueWhatsapp,
  buildMessageJadwalLangsungTersedia,
  buildMessageJadwalBelum,
  buildMessageDocumentVerified,
  buildMessageDocumentRejected,
} from "@/lib/whatsapp-queue";

export const dynamic = 'force-dynamic';

const REQUIRED_DOC_TYPES = [
  "kartu_keluarga",
  "akta_kelahiran",
  "rapor_sem1",
  "rapor_sem2",
  "nisn",
  "foto_setengah_badan",
  "surat_kesehatan",
  "pakta_integritas_santri",
  "pakta_integritas_ortu",
  "pernyataan_bebas_negatif",
];

// GET: List dokumen yang perlu diverifikasi
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status") || "pending";
    const pendaftarId = searchParams.get("pendaftar_id");

    // Build filter
    const { getAdminWhereClause } = await import("@/lib/utils/admin");
    const where: any = {
      pendaftar: {
        is: getAdminWhereClause(),
      },
    };
    
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
            tipe_pendaftaran: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Transform to include file_url
    const transformedData = data.map((dok) => {
      const timestamp = dok.updated_at
        ? new Date(dok.updated_at).getTime()
        : Date.now();
      return {
        ...dok,
        file_url: `/api/files/${dok.file_path}?t=${timestamp}`,
      };
    });

    let pendaftarInfo = null;
    if (pendaftarId) {
      pendaftarInfo = await prisma.pendaftar.findUnique({
        where: { id: pendaftarId },
        select: {
          id: true,
          nomor_pendaftaran: true,
          nama_lengkap: true,
          jenjang: true,
          no_hp: true,
          tipe_pendaftaran: true,
        }
      });
    }

    return NextResponse.json({ data: transformedData || [], pendaftar: pendaftarInfo });
  } catch (error) {
    console.error("Error in dokumen verification API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH: Verify or reject dokumen
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check custom role: ONLY Admin and Berkas can verify
    const allowedRoles = ["admin", "admin_super", "admin_berkas"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Only Document Admin or Super Admin can verify documents",
        },
        { status: 403 },
      );
    }

    // Get request body
    const body = await request.json();
    const { dokumen_id, status_verifikasi, catatan } = body;

    if (!dokumen_id || !status_verifikasi) {
      return NextResponse.json(
        { error: "dokumen_id and status_verifikasi are required" },
        { status: 400 },
      );
    }

    if (!["verified", "rejected"].includes(status_verifikasi)) {
      return NextResponse.json(
        { error: "status_verifikasi must be verified or rejected" },
        { status: 400 },
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
            status_pendaftaran: true,
            user: {
              select: {
                phone: true,
              },
            },
          },
        },
      },
    });

    // Logging audit action
    logAdminAction({
      action: "VERIFY_DOCUMENT",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: dokumen.pendaftar_id,
      targetName: dokumen.pendaftar.nama_lengkap,
      details: {
        jenis_dokumen: dokumen.jenis_dokumen,
        status_verifikasi,
        dokumen_id,
      },
    });

    // Send WhatsApp notification
    // BATCH NOTIFICATION LOGIC
    // Check if ALL documents for this pendaftar have been processed (verified or rejected)
    if (dokumen.pendaftar_id) {
      const allDocs = await prisma.dokumen.findMany({
        where: { pendaftar_id: dokumen.pendaftar_id },
      });

      // Check if all MANDATORY documents for this pendaftar have been processed
      const mandatoryDocs = allDocs.filter((d) =>
        REQUIRED_DOC_TYPES.includes(d.jenis_dokumen),
      );
      const pendingMandatory = mandatoryDocs.filter(
        (d) => !d.is_verified && !d.catatan,
      );

      // We notify if all mandatory docs are processed, OR if we have at least one rejection (to notify ASAP)
      const rejectedDocs = allDocs.filter((d) => !d.is_verified && d.catatan);
      const isSomeRejected = rejectedDocs.length > 0;

      const verifiedTypes = new Set(
        allDocs.filter((d) => d.is_verified).map((d) => d.jenis_dokumen),
      );
      const hasAllRequired = REQUIRED_DOC_TYPES.every((type) =>
        verifiedTypes.has(type),
      );
      const isAllVerifiedAndComplete = !isSomeRejected && hasAllRequired;

      // Logic: Notify if (All Mandatory Processed) OR (Something is Rejected)
      if (pendingMandatory.length === 0 || isSomeRejected) {
        const recipientPhone =
          dokumen.pendaftar.no_hp || (dokumen.pendaftar as any).user?.phone;

        if (isSomeRejected || isAllVerifiedAndComplete) {
          try {
            if (recipientPhone) {
              let docListStr = "";
              if (isAllVerifiedAndComplete) {
                docListStr = `Lengkap (${REQUIRED_DOC_TYPES.length}/${REQUIRED_DOC_TYPES.length} Dokumen Terverifikasi)`;
              } else {
                docListStr = rejectedDocs
                  .map((d) => `• ${d.jenis_dokumen}`)
                  .join("\n");
              }

              const isVerifiedBatch = isAllVerifiedAndComplete;
              await enqueueWhatsapp({
                pendaftarId: dokumen.pendaftar_id,
                phone: recipientPhone,
                jenisNotif: isVerifiedBatch
                  ? "document_verified"
                  : "document_rejected",
                messageContent: isVerifiedBatch
                  ? buildMessageDocumentVerified(
                      dokumen.pendaftar.nama_lengkap,
                      docListStr,
                    )
                  : buildMessageDocumentRejected(
                      dokumen.pendaftar.nama_lengkap,
                      docListStr,
                      isAllVerifiedAndComplete
                        ? ""
                        : "Terdapat dokumen yang perlu diperbaiki. Silakan cek dashboard.",
                    ),
              });
            } else {
              console.warn(
                `[VERIF] Cannot send notification for ${dokumen.pendaftar_id}: No phone number found in Pendaftar or User profile.`,
              );
            }
          } catch (error) {
            console.error("WhatsApp batch notification error:", error);
          }
        } else {
          // All currently uploaded are verified, but they haven't uploaded all 9 yet!
          // We WAIT. Do not send "Verified" message yet.
          const missingTypes = REQUIRED_DOC_TYPES.filter(
            (type) => !verifiedTypes.has(type),
          );
          console.log(
            `[VERIF] Pendaftar ${dokumen.pendaftar_id} has ${verifiedTypes.size}/${REQUIRED_DOC_TYPES.length} verified docs. Missing: ${missingTypes.join(", ")}. Waiting for completion before notify.`,
          );
        }
      }
    }

    // CHECK STATUS PROGRESSION / REVERSION
    if (dokumen.pendaftar_id) {
      const currentPendaftar = await prisma.pendaftar.findUnique({
        where: { id: dokumen.pendaftar_id },
        select: { status_pendaftaran: true },
      });

      if (isVerified) {
        // 1. Get all documents for this pendaftar
        const allDocs = await prisma.dokumen.findMany({
          where: { pendaftar_id: dokumen.pendaftar_id },
        });

        // 2. check if every required doc is present and verified
        const verifiedTypes = new Set(
          allDocs.filter((d) => d.is_verified).map((d) => d.jenis_dokumen),
        );
        const allRequiredVerified = REQUIRED_DOC_TYPES.every((type) =>
          verifiedTypes.has(type),
        );

        const { getStatusIndex } = await import("@/lib/access-control");
        const currentStatusIndex = getStatusIndex(currentPendaftar?.status_pendaftaran || "draft");
        const targetIndex = getStatusIndex("docs_verified");

        if (
          allRequiredVerified &&
          currentStatusIndex < targetIndex
        ) {
          await prisma.pendaftar.update({
            where: { id: dokumen.pendaftar_id },
            data: { status_pendaftaran: "docs_verified" },
          });

          // --- AUTOMATED NOTIFICATION LOGIC ---
          try {
            const existingSchedulesCount = await prisma.jadwalUjian.count({
              where: { pendaftar_id: dokumen.pendaftar_id },
            });

            // EXTRA GUARD: Only notify if status is 'paid', 'docs_verified', or 'docs_uploaded' (the pre-transition state)
            const isEligibleForNotif = [
              "paid",
              "docs_verified",
              "docs_uploaded",
            ].includes(dokumen.pendaftar.status_pendaftaran);

            if (existingSchedulesCount === 0 && isEligibleForNotif) {
              // Check available slots
              const sessions = await prisma.examSession.findMany({
                where: { is_active: true, start_time: { gte: new Date() } },
                include: { _count: { select: { bookings: true } } },
              });

              const totalAvailableSlots = sessions.reduce(
                (acc, s) => acc + Math.max(0, s.quota - s._count.bookings),
                0,
              );

              if (dokumen.pendaftar?.no_hp) {
                if (totalAvailableSlots > 0) {
                  // Skenario A: Jadwal Langsung Tersedia
                  await enqueueWhatsapp({
                    pendaftarId: dokumen.pendaftar_id,
                    phone: dokumen.pendaftar.no_hp!,
                    jenisNotif: "jadwal_langsung_tersedia",
                    messageContent: buildMessageJadwalLangsungTersedia(
                      dokumen.pendaftar.nama_lengkap,
                    ),
                  });
                  // Mark flag so they don't get double notified by manual broadcast later (unless reset)
                  await prisma.pendaftar.update({
                    where: { id: dokumen.pendaftar_id },
                    data: { notif_jadwal_tersedia_terkirim: true },
                  });
                } else {
                  // Skenario B: Jadwal Belum Ada (Tapi Verifikasi Berhasil)
                  await enqueueWhatsapp({
                    pendaftarId: dokumen.pendaftar_id,
                    phone: dokumen.pendaftar.no_hp!,
                    jenisNotif: "jadwal_belum",
                    messageContent: buildMessageJadwalBelum(
                      dokumen.pendaftar.nama_lengkap,
                    ),
                  });
                }
              }
            } else {
              console.log(
                `[VERIF] Pendaftar ${dokumen.pendaftar_id} transition suppressed: already has ${existingSchedulesCount} schedule(s).`,
              );
            }
          } catch (notifErr) {
            console.error("Automated notification error:", notifErr);
          }
        }
      } else {
        // REJECTED: Revert status if it was 'docs_verified'
        if (currentPendaftar?.status_pendaftaran === "docs_verified") {
          await prisma.pendaftar.update({
            where: { id: dokumen.pendaftar_id },
            data: { status_pendaftaran: "docs_uploaded" },
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: dokumen });
  } catch (error) {
    console.error("Error in dokumen verification update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
