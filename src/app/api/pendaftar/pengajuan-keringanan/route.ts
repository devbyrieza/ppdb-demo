import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const pendaftarId = session.pendaftar_id || session.id;

    if (!pendaftarId || session.role !== "pendaftar") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const jenis = formData.get("jenis") as string;
    const kesanggupan_bayar = formData.get("kesanggupan_bayar") as string || "0";
    const alasan = formData.get("alasan") as string;

    const fileSktm = formData.get("file_sktm") as File | null;
    const fileGaji = formData.get("file_gaji") as File | null;
    const fileKtp = formData.get("file_ktp") as File | null;
    const filePrestasi = formData.get("file_prestasi") as File | null;

    if (!jenis || !alasan || !fileSktm || !fileGaji || !fileKtp) {
      return NextResponse.json({ error: "Data atau file wajib tidak lengkap" }, { status: 400 });
    }

    // Helper to upload file and create Dokumen record
    const uploadAndCreateDokumen = async (file: File, jenisDokumen: string) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name);
      const fileName = `${pendaftarId}_${jenisDokumen}_${crypto.randomBytes(4).toString("hex")}${ext}`;
      const relativePath = `/uploads/dokumen/${fileName}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "dokumen");
      
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      await prisma.dokumen.create({
        data: {
          pendaftar_id: pendaftarId,
          jenis_dokumen: jenisDokumen,
          file_name: file.name,
          file_path: relativePath,
          file_size: file.size,
          file_type: file.type,
        }
      });
      return relativePath;
    };

    // Upload Files
    const sktmPath = await uploadAndCreateDokumen(fileSktm, "keringanan_sktm");
    const gajiPath = await uploadAndCreateDokumen(fileGaji, "keringanan_slip_gaji");
    const ktpPath = await uploadAndCreateDokumen(fileKtp, "keringanan_ktp");
    let prestasiPath = null;
    if (filePrestasi) {
      prestasiPath = await uploadAndCreateDokumen(filePrestasi, "keringanan_prestasi");
    }

    // Update Pendaftar data_lengkap
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: { data_lengkap: true }
    });

    let dataLengkap = pendaftar?.data_lengkap as any || {};
    if (typeof dataLengkap === "string") {
      try { dataLengkap = JSON.parse(dataLengkap); } catch(e) {}
    }

    dataLengkap.pengajuan_keringanan = {
      jenis,
      kesanggupan_bayar: parseInt(kesanggupan_bayar),
      alasan,
      status: "pending",
      nominal_disetujui: 0,
      dokumen: {
        sktm: sktmPath,
        slip_gaji: gajiPath,
        ktp: ktpPath,
        prestasi: prestasiPath
      },
      submitted_at: new Date().toISOString()
    };

    await prisma.pendaftar.update({
      where: { id: pendaftarId },
      data: { data_lengkap: dataLengkap }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error in pengajuan-keringanan API:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
