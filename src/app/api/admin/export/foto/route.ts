import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import archiver from "archiver";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const STORAGE_DIR = path.join(process.cwd(), "storage_data");

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["admin", "admin_super", "admin_berkas"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ambil semua foto setengah badan milik pendaftar yang valid
    const fotos = await prisma.dokumen.findMany({
      where: {
        jenis_dokumen: "foto_setengah_badan",
        is_verified: true,
        pendaftar: {
          deleted_at: null,
          NOT: [
            { nama_lengkap: { startsWith: "TEST ", mode: "insensitive" } },
            { nama_lengkap: { contains: "BYPASS", mode: "insensitive" } },
          ] } },
      include: {
        pendaftar: {
          select: {
            nama_lengkap: true,
            jenjang: true,
            jenis_kelamin: true } } } });

    if (fotos.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada foto yang ditemukan" },
        { status: 404 }
      );
    }

    // Set headers untuk download ZIP
    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    headers.set("Content-Disposition", `attachment; filename=Foto_Pendaftar_${new Date().toISOString().split("T")[0]}.zip`);

    // Stream the ZIP
    const stream = new ReadableStream({
      start(controller) {
        const archive = archiver("zip", {
          zlib: { level: 9 }, // Maximum compression
        });

        archive.on("data", (chunk) => controller.enqueue(chunk));
        archive.on("end", () => controller.close());
        archive.on("error", (err) => controller.error(err));

        // Add files to archive
        for (const foto of fotos) {
          if (!foto.file_path || !foto.pendaftar) continue;

          // Clean file_path (remove leading slash if any)
          const sanitizedPath = foto.file_path.startsWith("/")
            ? foto.file_path.substring(1)
            : foto.file_path;
          
          const fullPath = path.join(STORAGE_DIR, sanitizedPath);

          if (fs.existsSync(fullPath)) {
            const ext = path.extname(fullPath) || ".jpg";
            
            // Tentukan Putra/Putri
            const jk = foto.pendaftar.jenis_kelamin?.toUpperCase() || "";
            const isPutra = jk === "L" || jk === "LAKI-LAKI" || jk.includes("PUTRA");
            const genderStr = isPutra ? "Putra" : "Putri";
            
            // Nama folder format: [JENJANG] [Putra/Putri]
            const folderName = `${foto.pendaftar.jenjang} ${genderStr}`;
            
            // Nama file format: [JENJANG] - Nama Lengkap.jpg
            const safeName = foto.pendaftar.nama_lengkap.replace(/[^a-zA-Z0-9 ]/g, "").trim();
            const filenameInZip = `${folderName}/${foto.pendaftar.jenjang} - ${safeName}${ext}`;
            
            archive.file(fullPath, { name: filenameInZip });
          }
        }

        archive.finalize();
      } });

    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error("Export Photo Error:", error);
    return NextResponse.json(
      { error: "Gagal mengekspor foto" },
      { status: 500 }
    );
  }
}
