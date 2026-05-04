import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { saveFileLocal } from "@/lib/storage/local";
import { logAdminAction } from "@/lib/audit";
import { Buffer } from "buffer";

export async function POST(request: NextRequest) {
    try {
        // 1. Auth Check
        const session = await getServerSession() as any;
        if (!session) {
            return NextResponse.json({ success: false, error: "Sesi telah berakhir, silakan login kembali" }, { status: 401 });
        }

        const allowedRoles = [
            "admin",
            "admin_super",
            "admin_berkas",
            "admin_keuangan",
            "penguji",
            "penguji_calsan",
            "pewawancara_cawalsan",
            "pewawancara_calsan"
        ];
        
        if (!allowedRoles.includes(session.role)) {
            return NextResponse.json({ success: false, error: "Anda tidak memiliki akses untuk melakukan upload" }, { status: 403 });
        }

        // 2. Parse Form Data
        let formData: FormData;
        try {
            formData = await request.formData();
        } catch (e) {
            console.error("Error parsing form data:", e);
            return NextResponse.json({ success: false, error: "Format data tidak valid" }, { status: 400 });
        }

        const file = formData.get("file") as File | null;
        const pembayaranId = formData.get("pembayaran_id") as string | null;

        if (!file) {
            return NextResponse.json({ success: false, error: "File bukti pembayaran belum dipilih" }, { status: 400 });
        }

        if (!pembayaranId) {
            return NextResponse.json({ success: false, error: "ID Pembayaran tidak ditemukan" }, { status: 400 });
        }

        // 3. Find Payment & Validate
        const pembayaran = await prisma.pembayaran.findUnique({
            where: { id: pembayaranId },
            include: { 
                pendaftar: { 
                    select: { 
                        nomor_pendaftaran: true, 
                        id: true,
                        nama_lengkap: true
                    } 
                } 
            },
        });

        if (!pembayaran) {
            return NextResponse.json({ success: false, error: "Data pembayaran tidak ditemukan di database" }, { status: 404 });
        }

        if (!pembayaran.pendaftar) {
            return NextResponse.json({ success: false, error: "Data pendaftar terkait tidak ditemukan" }, { status: 404 });
        }

        // 4. Save File
        let filePath: string;
        try {
            // Detect Real Mime Type via Magic Bytes
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const hex = buffer.slice(0, 4).toString('hex').toUpperCase();
            let detectedType = file.type;
            
            if (hex.startsWith('FFD8FF')) detectedType = 'image/jpeg';
            else if (hex === '89504E47') detectedType = 'image/png';
            else if (hex === '25504446') detectedType = 'application/pdf';

            const timestamp = Date.now();
            const originalName = file.name || "bukti_transfer";
            const originalExtension = originalName.split('.').pop()?.toLowerCase() || 'bin';
            
            // Correct extension based on detected type
            let fileExtension = originalExtension;
            if (detectedType === 'image/jpeg') fileExtension = 'jpg';
            else if (detectedType === 'image/png') fileExtension = 'png';
            else if (detectedType === 'application/pdf') fileExtension = 'pdf';

            const fileName = `admin-upload-${pembayaran.pendaftar.nomor_pendaftaran}-${timestamp}.${fileExtension}`;
            
            filePath = await saveFileLocal(file, 'bukti-pembayaran', pembayaran.pendaftar.id, fileName);
            
            if (!filePath) {
                throw new Error("saveFileLocal returned null");
            }
        } catch (e: any) {
            console.error("Error saving file local:", e);
            return NextResponse.json({ 
                success: false, 
                error: `Gagal menyimpan file ke server: ${e.message || 'Check storage permissions'}` 
            }, { status: 500 });
        }

        // 5. Update Database
        try {
            await prisma.pembayaran.update({
                where: { id: pembayaranId },
                data: {
                    bukti_transfer_path: filePath,
                    bukti_transfer_filename: file.name,
                    status_pembayaran: "verified",
                    verified_by: session.id,
                    verified_at: new Date(),
                    catatan_verifikasi: "Diunggah dan diverifikasi otomatis oleh Admin",
                    updated_at: new Date(),
                },
            });

            // Also update pendaftar status
            await prisma.pendaftar.update({
                where: { id: pembayaran.pendaftar_id },
                data: {
                    status_pendaftaran: "verified",
                    updated_at: new Date()
                }
            });
        } catch (e: any) {
            console.error("Error updating database:", e);
            return NextResponse.json({ 
                success: false, 
                error: `Gambar berhasil diupload, namun gagal memperbarui status di database: ${e.message}` 
            }, { status: 500 });
        }

        // 6. Logging
        logAdminAction({
            action: 'UPLOAD_PAYMENT_PROOF',
            adminId: session.id || 'system',
            adminName: session.full_name || session.name || 'Admin',
            targetId: pembayaran.pendaftar?.id || pembayaran.pendaftar_id,
            targetName: pembayaran.pendaftar?.nama_lengkap || 'Unknown',
            details: { 
                pembayaran_id: pembayaranId,
                file_path: filePath
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Bukti pembayaran berhasil diunggah dan diverifikasi" 
        });

    } catch (error: any) {
        console.error("Critical error in admin upload:", error);
        return NextResponse.json(
            { success: false, error: `Kesalahan sistem kritis: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
