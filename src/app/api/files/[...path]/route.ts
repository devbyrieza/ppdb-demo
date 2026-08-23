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

    if (!pathSegments || pathSegments.length < 3) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Validate structure: category/ownerId/filename
    const [, ownerId] = pathSegments;
    const relativePath = path.join(...pathSegments);

    // 1. Auth Check
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

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
    const isAdmin = [
      "admin",
      "admin_super",
      "admin_berkas",
      "admin_keuangan",
      "penguji",
    ].includes(session.role);
    
    let isOwner = session.role === "pendaftar" && session.id === ownerId;

    // Fallback check for migrated files where path segments do not match ownerId directly
    if (!isAdmin && !isOwner && session.role === "pendaftar") {
      const filename = pathSegments[pathSegments.length - 1];
      const { prisma } = await import("@/lib/prisma");

      const doc = await prisma.dokumen.findFirst({
        where: {
          pendaftar_id: session.id,
          file_path: {
            contains: filename } } });

      if (doc) {
        isOwner = true;
      } else {
        const payment = await prisma.pembayaran.findFirst({
          where: {
            pendaftar_id: session.id,
            bukti_transfer_path: {
              contains: filename } } });
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

    // Fallback: Check Database for Base64 image
    if (!fileData && pathSegments[0] === "bukti-pembayaran") {
      const { prisma } = await import("@/lib/prisma");
      const filename = pathSegments[pathSegments.length - 1];
      const pembayaran = await prisma.pembayaran.findFirst({
        where: {
          pendaftar_id: ownerId,
          bukti_transfer_path: {
            contains: filename } } });

      if (pembayaran) {
        if (pembayaran.file_data) {
          const ext = filename.split(".").pop()?.toLowerCase();
          let mime = "image/jpeg";
          if (ext === "png") mime = "image/png";
          else if (ext === "pdf") mime = "application/pdf";
          else if (ext === "webp") mime = "image/webp";

          fileData = {
            buffer: pembayaran.file_data,
            mimeType: mime };
          console.log(`[File Serve] Found file_data in Database for ${filename}`);
        } else if (pembayaran.midtrans_response_json) {
          // Fallback to legacy base64 in midtrans_response_json
          const json = pembayaran.midtrans_response_json as any;
          if (json.base64_image) {
            fileData = {
              buffer: Buffer.from(json.base64_image, "base64"),
              mimeType: json.mime_type || "image/jpeg" };
            console.log(`[File Serve] Found Base64 Image in midtrans_response_json for ${filename}`);
          }
        }
      }
    }

    // Fallback 2: Check Dokumen table for file_data (Vercel Support)
    if (!fileData && pathSegments[0] === "dokumen-pendaftaran") {
      const { prisma } = await import("@/lib/prisma");
      const filename = pathSegments[pathSegments.length - 1];
      const dokumen = await prisma.dokumen.findFirst({
        where: {
          pendaftar_id: ownerId,
          file_name: filename } });

      if (dokumen && dokumen.file_data) {
        fileData = {
          buffer: dokumen.file_data,
          mimeType: dokumen.file_type || "application/octet-stream" };
        console.log(`[File Serve] Found file_data in Database for ${filename}`);
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
          path: relativePath },
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
