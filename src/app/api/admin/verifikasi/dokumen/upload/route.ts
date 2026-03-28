import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { saveFileLocal } from "@/lib/storage/local";
import { notifyDocumentVerified } from "@/lib/wablas";


// Konfigurasi dokumen
const DOKUMEN_CONFIG: Record<string, {
    label: string;
    maxSize: number;
    allowedTypes: string[];
}> = {
    kartu_keluarga: { label: "Scan Kartu Keluarga", maxSize: 5 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/png", "application/pdf"] },
    akta_kelahiran: { label: "Scan Akte Kelahiran", maxSize: 5 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/png", "application/pdf"] },
    rapor_sem1: { label: "Scan Rapor 2 Semester Terakhir (1)", maxSize: 5 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/png", "application/pdf"] },
    rapor_sem2: { label: "Scan Rapor 2 Semester Terakhir (2)", maxSize: 5 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/png", "application/pdf"] },
    nisn: { label: "Scan NISN", maxSize: 5 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/png", "application/pdf"] },
    foto_setengah_badan: { label: "Foto Setengah Badan", maxSize: 5 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/png"] },
    surat_kesehatan: { label: "Surat Keterangan Sehat", maxSize: 5 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/png", "application/pdf"] },
    pakta_integritas: { label: "Scan Pakta Integritas", maxSize: 5 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/png", "application/pdf"] },
    pernyataan_bebas_negatif: { label: "Scan Pernyataan Bebas Perilaku Negatif", maxSize: 5 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/png", "application/pdf"] },
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

        // Hanya admin yang bisa akses endpoint ini
        const allowedRoles = ["admin_berkas", "admin", "admin_super"];
        if (!allowedRoles.includes(session.role)) {
            return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const jenisDokumen = formData.get("jenis_dokumen") as string | null;
        const pendaftarId = formData.get("pendaftar_id") as string | null;

        if (!file || !jenisDokumen || !pendaftarId) {
            return NextResponse.json(
                { success: false, error: "File, jenis dokumen, dan pendaftar ID wajib diisi" },
                { status: 400 }
            );
        }

        const config = DOKUMEN_CONFIG[jenisDokumen];
        if (!config) {
            return NextResponse.json({ success: false, error: "Jenis dokumen tidak valid" }, { status: 400 });
        }

        if (file.size > config.maxSize) {
            return NextResponse.json(
                { success: false, error: `Ukuran file terlalu besar! Maksimal ${formatFileSize(config.maxSize)}` },
                { status: 400 }
            );
        }

        if (!config.allowedTypes.includes(file.type)) {
            return NextResponse.json({ success: false, error: "Format file tidak didukung" }, { status: 400 });
        }

        const pendaftar = await prisma.pendaftar.findUnique({
            where: { id: pendaftarId },
            select: { nomor_pendaftaran: true },
        });

        if (!pendaftar) {
            return NextResponse.json({ success: false, error: "Pendaftar tidak ditemukan" }, { status: 404 });
        }

        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "bin";
        const timestamp = Date.now();
        const fileName = `${pendaftar.nomor_pendaftaran}_${jenisDokumen}_admin_${timestamp}.${fileExtension}`;

        // Upload via helper function local storage
        const filePath = await saveFileLocal(file, 'dokumen-pendaftaran', pendaftarId, fileName);

        const existingDokumen = await prisma.dokumen.findFirst({
            where: {
                pendaftar_id: pendaftarId,
                jenis_dokumen: jenisDokumen,
            }
        });

        if (existingDokumen) {
            await prisma.dokumen.update({
                where: { id: existingDokumen.id },
                data: {
                    file_name: fileName,
                    file_path: filePath,
                    file_size: file.size,
                    file_type: file.type,
                    is_verified: true, // admin mengupload otomatis verified
                    verified_by: session.id,
                    verified_at: new Date(),
                    catatan: "Diubah dan disetujui oleh Admin",
                    updated_at: new Date(),
                }
            });
        } else {
            await prisma.dokumen.create({
                data: {
                    pendaftar_id: pendaftarId,
                    jenis_dokumen: jenisDokumen,
                    file_name: fileName,
                    file_path: filePath,
                    file_size: file.size,
                    file_type: file.type,
                    is_verified: true,
                    verified_by: session.id,
                    catatan: "Diunggah oleh Admin",
                }
            });
        }

        const updatedFilePath = filePath;

        // ============================================================
        // AUTO-UNLOCK: Check if all required documents are now verified
        // ============================================================
        const REQUIRED_DOCS = [
            'kartu_keluarga', 'akta_kelahiran', 'rapor_sem1', 'rapor_sem2',
            'nisn', 'foto_setengah_badan', 'surat_kesehatan', 'pakta_integritas', 'pernyataan_bebas_negatif'
        ];

        const allDocs = await prisma.dokumen.findMany({
            where: { pendaftar_id: pendaftarId }
        });

        const verifiedTypes = new Set(allDocs.filter(d => d.is_verified).map(d => d.jenis_dokumen));
        const allRequiredVerified = REQUIRED_DOCS.every(type => verifiedTypes.has(type));

        if (allRequiredVerified) {
            const currentPendaftar = await prisma.pendaftar.findUnique({
                where: { id: pendaftarId },
                select: { status_pendaftaran: true, no_hp: true, nama_lengkap: true }
            });

            // Update status only if still in docs_uploaded (not yet advanced)
            if (currentPendaftar?.status_pendaftaran === 'docs_uploaded') {
                await prisma.pendaftar.update({
                    where: { id: pendaftarId },
                    data: { status_pendaftaran: 'docs_verified' }
                });
                console.log(`✅ [Admin Upload] Auto-unlocked pendaftar ${pendaftarId} to docs_verified`);

                // Send WhatsApp notification
                if (currentPendaftar.no_hp) {
                    try {
                        await notifyDocumentVerified({
                            phone: currentPendaftar.no_hp,
                            nama: currentPendaftar.nama_lengkap,
                            dokumen_list: "Semua Dokumen Lengkap",
                            status: "verified",
                        });
                    } catch (waError) {
                        console.error("WhatsApp notification error after admin upload:", waError);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `${config.label} berhasil diubah oleh Admin`,
            data: { file_path: updatedFilePath },
        });

    } catch (error: any) {
        console.error("Admin upload dokumen error:", error);
        return NextResponse.json(
            { success: false, error: "Terjadi kesalahan sistem saat mengubah file" },
            { status: 500 }
        );
    }
}
