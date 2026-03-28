import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { saveFileLocal } from "@/lib/storage/local";

const UPLOAD_CONFIG = {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("app_session");

        if (!sessionCookie) {
            return NextResponse.json({ success: false, error: "Sesi tidak ditemukan" }, { status: 401 });
        }

        let session;
        try {
            session = JSON.parse(sessionCookie.value);
        } catch {
            return NextResponse.json({ success: false, error: "Sesi tidak valid" }, { status: 401 });
        }

        const allowedRoles = ["admin_keuangan", "admin", "admin_super"];
        if (!allowedRoles.includes(session.role)) {
            return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const pembayaranId = formData.get("pembayaran_id") as string | null;

        if (!file || !pembayaranId) {
            return NextResponse.json(
                { success: false, error: "File dan pembayaran ID wajib diisi" },
                { status: 400 }
            );
        }

        if (file.size > UPLOAD_CONFIG.maxSize) {
            return NextResponse.json(
                { success: false, error: `Ukuran file terlalu besar! Maksimal ${formatFileSize(UPLOAD_CONFIG.maxSize)}` },
                { status: 400 }
            );
        }

        if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
            return NextResponse.json({ success: false, error: "Format file tidak didukung" }, { status: 400 });
        }

        const pembayaran = await prisma.pembayaran.findUnique({
            where: { id: pembayaranId },
            include: { pendaftar: { select: { nomor_pendaftaran: true, id: true } } },
        });

        if (!pembayaran || !pembayaran.pendaftar) {
            return NextResponse.json({ success: false, error: "Data pembayaran tidak ditemukan" }, { status: 404 });
        }

        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "bin";
        const timestamp = Date.now();
        const fileName = `bukti_admin_${pembayaran.pendaftar.nomor_pendaftaran}_${timestamp}.${fileExtension}`;

        const filePath = await saveFileLocal(file, 'bukti-pembayaran', pembayaran.pendaftar.id, fileName);

        await prisma.pembayaran.update({
            where: { id: pembayaranId },
            data: {
                bukti_transfer_filename: fileName,
                bukti_transfer_path: filePath,
                status_pembayaran: "verified",
                catatan_verifikasi: "Bukti diubah dan disetujui oleh Admin Keuangan",
                updated_at: new Date(),
            }
        });

        return NextResponse.json({
            success: true,
            message: "Bukti pembayaran berhasil diubah",
            data: { file_path: filePath },
        });

    } catch (error: any) {
        console.error("Admin upload bukti pembayaran error:", error);
        return NextResponse.json(
            { success: false, error: "Terjadi kesalahan sistem saat mengubah bukti pembayaran" },
            { status: 500 }
        );
    }
}
