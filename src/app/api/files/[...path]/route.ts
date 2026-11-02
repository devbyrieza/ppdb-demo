import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import { verifyFilePath } from "@/lib/storage/file-signing";
import { getFileLocal, saveFileLocal } from "@/lib/storage/local";

/**
 * GET /api/files/[...path]
 * Serves files from local storage with authentication check and resilient DB fallback.
 * URL format: /api/files/category/owner_id/filename or /api/files/category/filename
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathSegments = (await params).path;

    if (!pathSegments || pathSegments.length < 1) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Standardize path and extract identifiers
    const filename = pathSegments[pathSegments.length - 1];
    const category = pathSegments[0] || "files";
    const ownerId =
      pathSegments.length >= 3 ? pathSegments[1] : pathSegments.length === 2 ? pathSegments[0] : "";
    const relativePath = path.join(...pathSegments);
    const normalizedForwardPath = pathSegments.join("/");

    // 1a. Bypass via signed token (server-to-server, mis. Wablas kirim dokumen surat pengumuman)
    const token = request.nextUrl.searchParams.get("k");
    if (token && verifyFilePath(normalizedForwardPath, token)) {
      // lanjut ke penyajian file tanpa sesi
    } else {
      // 1. Auth Check
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("al_session") || cookieStore.get("app_session");

      if (!sessionCookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      let session;
      try {
        session = JSON.parse(sessionCookie.value);
      } catch {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
      }

      // 2. Authorization
      const adminRoles = [
        "admin",
        "admin_super",
        "admin_berkas",
        "admin_keuangan",
        "head_of_it",
        "superadmin",
        "penguji",
        "penguji_quran",
        "penguji_santri",
        "penguji_ortu",
        "penguji_arab",
        "penguji_hafalan",
        "penguji_calsan",
        "pewawancara_cawalsan",
        "pewawancara_calsan",
      ];
      const userRoles = [session.role, ...(session.secondary_roles || []), ...(session.roles || [])]
        .filter(Boolean)
        .map((r: string) => r.toLowerCase());

      const isAdmin = userRoles.some((r: string) => adminRoles.some((ar) => r.includes(ar)));
      let isOwner =
        session.role === "pendaftar" &&
        (session.id === ownerId || session.pendaftar_id === ownerId);

      // Fallback ownership check for pendaftar
      if (!isAdmin && !isOwner && session.role === "pendaftar") {
        try {
          const { prisma } = await import("@/lib/prisma");
          const doc = await prisma.dokumen.findFirst({
            where: {
              pendaftar_id: session.id,
              OR: [{ file_path: { contains: filename } }, { file_name: filename }],
            },
          });

          if (doc) {
            isOwner = true;
          } else {
            const payment = await prisma.pembayaran.findFirst({
              where: {
                pendaftar_id: session.id,
                OR: [
                  { bukti_transfer_path: { contains: filename } },
                  { bukti_transfer_filename: filename },
                ],
              },
            });
            if (payment) {
              isOwner = true;
            }
          }
        } catch (authErr) {
          console.error("[File Serve] Ownership check error:", authErr);
        }
      }

      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } // tutup else auth (bypass token)

    // 3. Get File from Local Disk
    let fileData = getFileLocal(relativePath);

    // If not found and path was 2 segments (e.g., ownerId/filename), try with category prefix
    if (!fileData && pathSegments.length === 2) {
      fileData =
        getFileLocal(path.join("dokumen-pendaftaran", relativePath)) ||
        getFileLocal(path.join("bukti-pembayaran", relativePath)) ||
        getFileLocal(path.join("pengumuman", relativePath));
    }

    // 4. Database fallback (ephemeral Docker/Vercel support)
    if (!fileData) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const lowerFilename = filename.toLowerCase();
        const isPengumuman =
          category === "pengumuman" ||
          lowerFilename.includes("pengumuman") ||
          lowerFilename.includes("surat");
        const isPembayaran =
          category === "bukti-pembayaran" ||
          category === "pembayaran" ||
          lowerFilename.includes("bukti") ||
          lowerFilename.includes("transfer") ||
          lowerFilename.includes("pembayaran");

        // A. Khusus Surat Pengumuman Hasil Kelulusan
        if (isPengumuman) {
          // Cari di tabel Dokumen (prioritas jenis_dokumen: surat_pengumuman)
          const doc = await prisma.dokumen.findFirst({
            where: {
              OR: [
                { file_path: { contains: filename } },
                { file_name: filename },
                { file_path: relativePath },
                { file_path: normalizedForwardPath },
                ...(ownerId && ownerId.includes("-")
                  ? [
                      { pendaftar_id: ownerId, jenis_dokumen: "surat_pengumuman" },
                      { pendaftar_id: ownerId, file_name: filename },
                      { pendaftar_id: ownerId, file_path: { contains: filename } },
                    ]
                  : []),
              ],
            },
            select: {
              file_data: true,
              file_type: true,
              file_name: true,
              pendaftar_id: true,
            },
            orderBy: { updated_at: "desc" },
          });

          if (doc && doc.file_data) {
            console.log(`[File Serve] Found Pengumuman in Dokumen DB (BYTEA): ${filename}`);
            const buffer = Buffer.from(doc.file_data);
            const mimeType = doc.file_type || "application/pdf";
            fileData = { buffer, mimeType };

            // Cache back to disk
            try {
              await saveFileLocal(
                buffer,
                "pengumuman",
                doc.pendaftar_id || ownerId || "cache",
                filename
              );
            } catch (cacheErr) {
              console.warn("[File Serve] Disk cache write failed (non-critical):", cacheErr);
            }
          }

          // Fallback kedua: Cek Pengumuman table lalu cari Dokumen terkait
          if (!fileData && ownerId && ownerId.includes("-")) {
            const pgm = await prisma.pengumuman.findFirst({
              where: {
                OR: [
                  { pendaftar_id: ownerId },
                  { surat_pengumuman_path: { contains: filename } },
                ],
              },
              select: { pendaftar_id: true, surat_pengumuman_path: true },
            });

            if (pgm) {
              const docRel = await prisma.dokumen.findFirst({
                where: {
                  pendaftar_id: pgm.pendaftar_id,
                  jenis_dokumen: "surat_pengumuman",
                },
                select: { file_data: true, file_type: true, file_name: true, pendaftar_id: true },
                orderBy: { updated_at: "desc" },
              });

              if (docRel && docRel.file_data) {
                console.log(`[File Serve] Found Pengumuman via relation in Dokumen DB: ${filename}`);
                const buffer = Buffer.from(docRel.file_data);
                const mimeType = docRel.file_type || "application/pdf";
                fileData = { buffer, mimeType };

                try {
                  await saveFileLocal(
                    buffer,
                    "pengumuman",
                    pgm.pendaftar_id || "cache",
                    filename
                  );
                } catch (cacheErr) {
                  console.warn("[File Serve] Disk cache write failed (non-critical):", cacheErr);
                }
              }
            }
          }

          // DILARANG KERAS fallback ke tabel pembayaran untuk kategori surat pengumuman!
        }

        // B. Dokumen Pendaftaran Santri Umum (KK, KTP, Akta, Ijazah, dll)
        if (!fileData && !isPengumuman && !isPembayaran) {
          const doc = await prisma.dokumen.findFirst({
            where: {
              OR: [
                { file_path: { contains: filename } },
                { file_name: filename },
                { file_path: relativePath },
                { file_path: normalizedForwardPath },
                ...(ownerId && ownerId.includes("-")
                  ? [
                      { pendaftar_id: ownerId, file_name: filename },
                      { pendaftar_id: ownerId, file_path: { contains: filename } },
                    ]
                  : []),
              ],
            },
            select: {
              file_data: true,
              file_type: true,
              file_name: true,
              pendaftar_id: true,
            },
            orderBy: { updated_at: "desc" },
          });

          if (doc && doc.file_data) {
            console.log(`[File Serve] Found in Dokumen DB (BYTEA): ${filename}`);
            const buffer = Buffer.from(doc.file_data);
            let mimeType = doc.file_type || "application/octet-stream";
            if (mimeType === "application/octet-stream") {
              const hex = buffer.slice(0, 4).toString("hex").toUpperCase();
              if (hex.startsWith("FFD8FF")) mimeType = "image/jpeg";
              else if (hex === "89504E47") mimeType = "image/png";
              else if (hex === "25504446") mimeType = "application/pdf";
              else if (hex === "52494646") mimeType = "image/webp";
            }
            fileData = { buffer, mimeType };

            // Cache back to disk
            try {
              await saveFileLocal(
                buffer,
                category || "dokumen-pendaftaran",
                doc.pendaftar_id || "cache",
                filename
              );
            } catch (cacheErr) {
              console.warn("[File Serve] Disk cache write failed (non-critical):", cacheErr);
            }
          }
        }

        // C. Khusus Bukti Pembayaran (Hanya jika diminta bukti bayar / transfer)
        if (!fileData && isPembayaran) {
          const payment = await prisma.pembayaran.findFirst({
            where: {
              OR: [
                { bukti_transfer_path: { contains: filename } },
                { bukti_transfer_filename: filename },
                { bukti_transfer_path: relativePath },
                { bukti_transfer_path: normalizedForwardPath },
                ...(ownerId && ownerId.includes("-")
                  ? [
                      { pendaftar_id: ownerId, bukti_transfer_filename: filename },
                      { pendaftar_id: ownerId, bukti_transfer_path: { contains: filename } },
                      ...(category.includes("bukti") || category.includes("bayar")
                        ? [{ pendaftar_id: ownerId }, { id: ownerId }]
                        : []),
                    ]
                  : []),
              ],
            },
            select: {
              bukti_transfer_path: true,
              bukti_transfer_filename: true,
              midtrans_response_json: true,
              pendaftar_id: true,
            },
            orderBy: { updated_at: "desc" },
          });

          if (payment) {
            // Check Base64 in midtrans_response_json
            const json = payment.midtrans_response_json as any;
            if (json && json.base64_image) {
              console.log(`[File Serve] Found in Pembayaran DB (Base64 JSON): ${filename}`);
              const buffer = Buffer.from(json.base64_image, "base64");
              let mimeType = json.mime_type || "image/jpeg";
              if (!mimeType || mimeType === "application/octet-stream") {
                const hex = buffer.slice(0, 4).toString("hex").toUpperCase();
                if (hex.startsWith("FFD8FF")) mimeType = "image/jpeg";
                else if (hex === "89504E47") mimeType = "image/png";
                else if (hex === "25504446") mimeType = "application/pdf";
                else if (hex === "52494646") mimeType = "image/webp";
              }
              fileData = { buffer, mimeType };

              // Cache back to disk
              try {
                await saveFileLocal(
                  buffer,
                  "bukti-pembayaran",
                  payment.pendaftar_id || "cache",
                  filename
                );
              } catch (cacheErr) {
                console.warn("[File Serve] Payment proof cache write failed:", cacheErr);
              }
            } else if (payment.bukti_transfer_path?.startsWith("data:")) {
              // Direct Data URI
              const match = payment.bukti_transfer_path.match(/^data:([^;]+);base64,(.+)$/);
              if (match) {
                const mimeType = match[1];
                const buffer = Buffer.from(match[2], "base64");
                fileData = { buffer, mimeType };
              }
            } else if (payment.bukti_transfer_path?.startsWith("http")) {
              return NextResponse.redirect(payment.bukti_transfer_path);
            }
          }
        }
      } catch (dbErr) {
        console.error("[File Serve] DB fallback query error:", dbErr);
      }
    }

    if (!fileData) {
      console.error(`[File Serve] ❌ NOT FOUND: ${relativePath}`);
      return NextResponse.json(
        {
          error:
            "File tidak ditemukan di server. Kemungkinan file belum diunggah atau volume storage sedang memuat ulang.",
          path: relativePath,
        },
        { status: 404 }
      );
    }

    // 5. Return File Binary Response
    return new Response(new Uint8Array(fileData.buffer), {
      headers: {
        "Content-Type": fileData.mimeType,
        "Content-Length": fileData.buffer.length.toString(),
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
