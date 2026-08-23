import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { recalculateNilaiUjian } from "@/lib/scoring";

export async function POST(req: Request) {
  try {
    const session = (await getServerSession()) as any;
    if (!session || !["admin_super", "admin"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminId = session.id;
    const body = await req.json();
    const {
      pendaftar_id,
      score_akademik,
      score_quran,
      score_wawancara_santri,
      score_wawancara_ortu,
      score_kepribadian,
      score_kesiapan,
      override_status,
      catatan_bypass } = body;

    if (!pendaftar_id) {
      return NextResponse.json({ message: "ID Pendaftar wajib diisi" }, { status: 400 });
    }

    const parseSafeFloat = (val: any) => {
      if (val === undefined || val === null || val === "") return null;
      const parsed = parseFloat(val.toString());
      return isNaN(parsed) ? null : parsed;
    };

    // Parse the numbers safely
    const akademik = parseSafeFloat(score_akademik);
    const quran = parseSafeFloat(score_quran);
    const w_santri = parseSafeFloat(score_wawancara_santri);
    const w_ortu = parseSafeFloat(score_wawancara_ortu);
    const kepribadian = parseSafeFloat(score_kepribadian);
    const kesiapan = parseSafeFloat(score_kesiapan);

    // Create or update existing NilaiUjian record with priority on the newest one
    const existings = await prisma.nilaiUjian.findMany({
      where: { pendaftar_id },
      orderBy: { updated_at: "desc" } });

    let targetId = "";
    if (existings.length > 0) {
      targetId = existings[0].id;
      // Update existing main record
      await prisma.nilaiUjian.update({
        where: { id: targetId },
        data: {
          score_akademik: akademik,
          nilai_tes_tertulis_total: akademik, // Keep in sync for recalculate
          score_quran: quran,
          nilai_tes_quran: quran, // Keep in sync
          nilai_wawancara_santri: w_santri,
          nilai_wawancara_ortu: w_ortu,
          score_kepribadian: kepribadian,
          score_kesiapan: kesiapan,
          input_by_santri: adminId,
          input_by_ortu: adminId,
          input_by_quran: adminId,
          catatan_umum: catatan_bypass ? `Bypass Admin Super: ${catatan_bypass}` : "Input Manual oleh Admin Super",
          updated_at: new Date() } });
    } else {
      // Create new
      const created = await prisma.nilaiUjian.create({
        data: {
          pendaftar_id,
          score_akademik: akademik,
          nilai_tes_tertulis_total: akademik,
          score_quran: quran,
          nilai_tes_quran: quran,
          nilai_wawancara_santri: w_santri,
          nilai_wawancara_ortu: w_ortu,
          score_kepribadian: kepribadian,
          score_kesiapan: kesiapan,
          input_by_santri: adminId,
          input_by_ortu: adminId,
          input_by_quran: adminId,
          catatan_umum: catatan_bypass ? `Bypass Admin Super: ${catatan_bypass}` : "Input Manual oleh Admin Super" } });
      targetId = created.id;
    }

    // Clean up interviews if any (prevent them from showing up as pending)
    await prisma.jadwalUjian.updateMany({
      where: { pendaftar_id },
      data: { status_santri: "completed", status_ortu: "completed" } });

    // Run recalculation to get total_score, status_kelulusan and update Pendaftar status
    await recalculateNilaiUjian(pendaftar_id, override_status || undefined);

    return NextResponse.json({
      success: true,
      message: "Nilai berhasil disimpan dan dikalkulasi" });
  } catch (error: any) {
    console.error("Error in POST /api/admin/nilai/manual:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
