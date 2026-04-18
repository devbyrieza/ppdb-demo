import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        // Find Rieza Tes
        const pendaftar = await prisma.pendaftar.findFirst({
            where: { nama_lengkap: { contains: "Rieza Tes" } },
            orderBy: { created_at: "desc" }
        });

        if (!pendaftar) {
            return NextResponse.json({ error: "Rieza Tes tidak ditemukan" });
        }

        // 1. Update status to 'passed'
        await prisma.pendaftar.update({
            where: { id: pendaftar.id },
            data: { status_pendaftaran: "passed" }
        });

        // 2. Create high dummy scores if none exist
        await prisma.nilaiUjian.create({
            data: {
                pendaftar_id: pendaftar.id,
                score_akademik: 95,
                score_quran: 90,
                score_kepribadian: 90,
                score_kesiapan: 90,
                score_wawancara: 90,
                nilai_wawancara_ortu: 90,
                nilai_wawancara_santri: 90,
                nilai_tes_quran: 90,
                total_score: 95,
                nilai_total: 95,
                status_kelulusan: "LULUS",
                detail_akademik: { skor: 95 },
                detail_quran: { skor: 90 }
            }
        });

        // 3. Create HasilSeleksi
        await prisma.hasilSeleksi.upsert({
            where: { pendaftar_id: pendaftar.id },
            update: {
                status_seleksi: "DITERIMA",
                nilai_akhir: 95,
                catatan_admin: "Lulus by DEV bypass"
            },
            create: {
                pendaftar_id: pendaftar.id,
                tahun_ajaran_id: pendaftar.tahun_ajaran_id,
                status_seleksi: "DITERIMA",
                nilai_akhir: 95,
                catatan_admin: "Lulus by DEV bypass",
                ditentukan_pada: new Date()
            }
        });

        // 4. Create Pengumuman
        await prisma.pengumuman.upsert({
            where: { pendaftar_id: pendaftar.id },
            update: {
                status_kelulusan: "DITERIMA",
                is_published: true,
                published_at: new Date()
            },
            create: {
                pendaftar_id: pendaftar.id,
                tahun_ajaran_id: pendaftar.tahun_ajaran_id,
                status_kelulusan: "DITERIMA",
                is_published: true,
                published_at: new Date()
            }
        });

        // Delete Jadwal Ujian if exists (optional, but let's keep it clean)
        // Set everything ready so when user visits their dashboard, they see Pengumuman & Daftar Ulang.

        return NextResponse.json({
            success: true,
            message: `Rieza Tes berhasil diluluskan secara instan! Silakan buka dashboard Pendaftar sekarang.`
        });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
