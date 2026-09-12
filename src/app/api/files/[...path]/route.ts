import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import { getFileLocal } from "@/lib/storage/local";

/**
 * GET /api/files/[...path]
 * Serves files from local storage with authentication check.
 * URL format: /api/files/category/owner_id/filename
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const pathSegments = (await params).path;

    if (!pathSegments || pathSegments.length < 2) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Validate structure: category/ownerId/filename or ownerId/filename
    const ownerId = pathSegments.length === 2 ? pathSegments[0] : pathSegments[1];
    const filename = pathSegments[pathSegments.length - 1];
    const relativePath = path.join(...pathSegments);

    // 1. Auth Check
    const cookieStore = await cookies();
    const sessionCookie =
      cookieStore.get("al_session") || cookieStore.get("app_session");

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
    // Admin can access everything
    // Pendaftar can only access their own files (ownerId must match session.id)
    const adminRoles = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_keuangan",
      "penguji",
      "penguji_quran",
      "penguji_santri",
      "penguji_ortu",
      "penguji_arab",
      "penguji_hafalan",
    ];
    const userRoles = [session.role, ...(session.secondary_roles || [])];
    const isAdmin = userRoles.some((r: string) => adminRoles.includes(r));
    let isOwner = session.role === "pendaftar" && session.id === ownerId;

    // Fallback check for migrated files where path segments do not match ownerId directly
    if (!isAdmin && !isOwner && session.role === "pendaftar") {
      const { prisma } = await import("@/lib/prisma");

      const doc = await prisma.dokumen.findFirst({
        where: {
          pendaftar_id: session.id,
          file_path: {
            contains: filename,
          },
        },
      });

      if (doc) {
        isOwner = true;
      } else {
        const payment = await prisma.pembayaran.findFirst({
          where: {
            pendaftar_id: session.id,
            bukti_transfer_path: {
              contains: filename,
            },
          },
        });
        if (payment) {
          isOwner = true;
        }
      }
    }

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Get File
    console.log(`[File Serve] Requesting: ${relativePath}`);
    let fileData = getFileLocal(relativePath);

    // If not found and path was 2 segments (e.g., ownerId/filename), try with category prefix
    if (!fileData && pathSegments.length === 2) {
      fileData =
        getFileLocal(path.join("dokumen-pendaftaran", relativePath)) ||
        getFileLocal(path.join("bukti-pembayaran", relativePath));
    }

    // Database fallback if file is not found on disk (ephemeral Docker/Vercel support)
    if (!fileData) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const doc = await prisma.dokumen.findFirst({
          where: {
            OR: [
              { file_path: { contains: filename } },
              { file_name: filename },
              { file_path: relativePath },
            ],
          },
          select: {
            file_data: true,
            file_type: true,
            file_name: true,
          },
        });

        if (doc && doc.file_data) {
          console.log(`[File Serve] Found in DB (BYTEA): ${filename}`);
          const buffer = Buffer.from(doc.file_data);
          let mimeType = doc.file_type || "application/octet-stream";
          if (mimeType === "application/octet-stream") {
            const hex = buffer.slice(0, 4).toString("hex").toUpperCase();
            if (hex.startsWith("FFD8FF")) mimeType = "image/jpeg";
            else if (hex === "89504E47") mimeType = "image/png";
            else if (hex === "25504446") mimeType = "application/pdf";
          }
          fileData = { buffer, mimeType };
        }
      } catch (dbErr) {
        console.error("[File Serve] DB fallback query error:", dbErr);
      }
    }

    if (!fileData) {
      console.error(`[File Serve] ❌ NOT FOUND: ${relativePath}`);
      console.log(
        `[File Serve] Full Path Attempted: ${path.join(process.cwd(), "storage_data", relativePath)}`,
      );
      return NextResponse.json(
        {
          error:
            "File tidak ditemukan di server. Kemungkinan file terhapus saat redeploy atau volume storage belum terpasang.",
          path: relativePath,
        },
        { status: 404 },
      );
    }

    // 4. Return File
    // Using Response instead of NextResponse for cleaner binary handling in some environments
    const response = new Response(new Uint8Array(fileData.buffer), {
      headers: {
        "Content-Type": fileData.mimeType,
        "Content-Length": fileData.buffer.length.toString(),
        "Content-Disposition": `inline; filename="${pathSegments[pathSegments.length - 1]}"`,
        "Cache-Control": "private, max-age=3600" } });

    return response;
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
