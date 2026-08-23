import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { saveFileLocal } from "@/lib/storage/local";
import { logAdminAction } from "@/lib/audit";

// Konfigurasi upload bukti pembayaran
const UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB (lebih besar untuk admin)
  allowedTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf",
  ] };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/**
 * POST /api/admin/pembayaran/upload-for-pendaftar
 *
 * Fitur: Admin mengupload bukti pembayaran ATAS NAMA pendaftar.
 * Berguna ketika pendaftar mengirimkan bukti transfer via WhatsApp ke CS.
 *
 * Role yang diizinkan: admin_super, admin_keuangan, admin
 *
 * Body (multipart/form-data):
 * - file: File bukti transfer
 * - pendaftar_id: string (ID pendaftar)
 * - jenis_pembayaran: "PENDAFTARAN" | "DAFTAR_ULANG"
 * - jumlah: number (nominal pembayaran dalam rupiah)
 * - tipe_cicilan?: "LUNAS" | "CICILAN" (default LUNAS)
 * - cicilan_ke?: number (jika cicilan)
 * - catatan?: string (catatan opsional)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Auth Check — hanya admin_super, admin_keuangan, admin
    const session = (await getServerSession()) as any;
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sesi telah berakhir, silakan login kembali" },
        { status: 401 },
      );
    }

    const allowedRoles = ["admin_super", "admin_keuangan", "admin"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Akses ditolak. Hanya Admin Super dan Admin Keuangan yang dapat mengupload pembayaran atas nama pendaftar." },
        { status: 403 },
      );
    }

    // 2. Parse form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: "Format data tidak valid" },
        { status: 400 },
      );
    }

    const file = formData.get("file") as File | null;
    const pendaftarId = formData.get("pendaftar_id") as string | null;
    const jenisPembayaran =
      (formData.get("jenis_pembayaran") as string) || "PENDAFTARAN";
    const jumlahRaw = formData.get("jumlah") as string | null;
    const tipeCicilanRaw =
      (formData.get("tipe_cicilan") as string) || "LUNAS";
    const cicilanKeRaw = formData.get("cicilan_ke") as string | null;
    const catatan = (formData.get("catatan") as string) || null;

    // 3. Validasi field wajib
    if (!file) {
      return NextResponse.json(
        { success: false, error: "File bukti pembayaran belum dipilih" },
        { status: 400 },
      );
    }

    if (!pendaftarId) {
      return NextResponse.json(
        { success: false, error: "ID Pendaftar wajib diisi" },
        { status: 400 },
      );
    }

    const jumlah = jumlahRaw ? Number(jumlahRaw) : 0;
    if (!jumlah || jumlah < 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Nominal pembayaran tidak valid (minimum Rp 1.000)" },
        { status: 400 },
      );
    }

    if (!["PENDAFTARAN", "DAFTAR_ULANG", "SPP"].includes(jenisPembayaran)) {
      return NextResponse.json(
        { success: false, error: "Jenis pembayaran tidak valid" },
        { status: 400 },
      );
    }

    // 4. Validasi ukuran file
    if (file.size > UPLOAD_CONFIG.maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Ukuran file terlalu besar! Maksimal ${formatFileSize(UPLOAD_CONFIG.maxSize)}` },
        { status: 400 },
      );
    }

    // 5. Validasi tipe file
    const safeFileType = file.type || "";
    const isAllowedType =
      UPLOAD_CONFIG.allowedTypes.includes(safeFileType) ||
      safeFileType.startsWith("image/");
    if (!isAllowedType) {
      return NextResponse.json(
        {
          success: false,
          error: `Format file tidak didukung! Gunakan JPG, PNG, PDF, atau WebP. (File Anda: ${safeFileType || "tidak dikenali"})` },
        { status: 400 },
      );
    }

    // 6. Ambil data pendaftar & validasi
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId, deleted_at: null },
      include: {
        tahun_ajaran: true } });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Data pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    // 7. Validasi status untuk DAFTAR_ULANG
    if (jenisPembayaran === "DAFTAR_ULANG") {
      const ELIGIBLE_STATUSES = [
        "accepted",
        "enrolled",
        "sudah_daftar_ulang",
        "Sudah Daftar Ulang",
      ];
      const statusOk = ELIGIBLE_STATUSES.includes(
        pendaftar.status_pendaftaran ?? "",
      );
      if (!statusOk) {
        return NextResponse.json(
          {
            success: false,
            error: `Pendaftar ${pendaftar.nama_lengkap} belum dinyatakan DITERIMA, tidak bisa melakukan daftar ulang. Status saat ini: ${pendaftar.status_pendaftaran}` },
          { status: 400 },
        );
      }
    }

    // 8. Detect Real MIME type via Magic Bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hex = buffer.slice(0, 4).toString("hex").toUpperCase();
    let detectedType = file.type;

    if (hex.startsWith("FFD8FF")) detectedType = "image/jpeg";
    else if (hex === "89504E47") detectedType = "image/png";
    else if (hex === "25504446") detectedType = "application/pdf";

    // 9. Generate nama file & simpan
    const timestamp = Date.now();
    const safeFileName = file.name || "bukti_admin_upload.bin";
    const originalExtension =
      safeFileName.split(".").pop()?.toLowerCase() || "bin";

    let fileExtension = originalExtension;
    if (detectedType === "image/jpeg") fileExtension = "jpg";
    else if (detectedType === "image/png") fileExtension = "png";
    else if (detectedType === "application/pdf") fileExtension = "pdf";

    const fileName = `admin-upload-${jenisPembayaran.toLowerCase()}-${pendaftar.nomor_pendaftaran}-${timestamp}.${fileExtension}`;

    const filePath = await saveFileLocal(
      buffer,
      "bukti-pembayaran",
      pendaftarId,
      fileName,
    );

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan file ke server" },
        { status: 500 },
      );
    }

    // 10. Tentukan tipe cicilan
    const tipeCicilan = tipeCicilanRaw || "LUNAS";
    const cicilanKe = cicilanKeRaw ? parseInt(cicilanKeRaw) : null;

    // 11. Cek apakah sudah ada record pembayaran pending/rejected untuk jenis yang sama
    const existingPending = await prisma.pembayaran.findFirst({
      where: {
        pendaftar_id: pendaftarId,
        status_pembayaran: { in: ["pending", "rejected"] },
        jenis_pembayaran: jenisPembayaran as any,
        metode_pembayaran: "manual" } });

    let pembayaranResult;

    if (existingPending) {
      // Update record yang ada
      pembayaranResult = await prisma.pembayaran.update({
        where: { id: existingPending.id },
        data: {
          jumlah: jumlah,
          tipe_cicilan: tipeCicilan as any,
          cicilan_ke: cicilanKe,
          bukti_transfer_path: filePath,
          bukti_transfer_filename: safeFileName,
          status_pembayaran: "verified",
          catatan_verifikasi: catatan
            ? `Admin upload (Auto-Verified): ${catatan}`
            : "Diunggah dan diverifikasi otomatis oleh Admin",
          updated_at: new Date() } as any });
    } else {
      // Cek keringanan dari data_lengkap
      let expectedTagihanDaftarUlang = 8500000;
      let dataLengkap = pendaftar.data_lengkap as any || {};
      if (typeof dataLengkap === "string") {
        try { dataLengkap = JSON.parse(dataLengkap); } catch(e) {}
      }
      const keringanan = dataLengkap.keringanan_daftar_ulang;
      if (keringanan && typeof keringanan.nominal_potongan === "number") {
        expectedTagihanDaftarUlang -= keringanan.nominal_potongan;
      }

      // Tentukan tipe cicilan
      let finalTipeCicilan = tipeCicilan;
      if (jenisPembayaran === "DAFTAR_ULANG") {
        if (jumlah >= expectedTagihanDaftarUlang) {
          finalTipeCicilan = "LUNAS";
        } else if (jumlah >= (expectedTagihanDaftarUlang / 2)) {
          finalTipeCicilan = "CICIL_50_LEBIH";
        } else {
          finalTipeCicilan = "CICIL_DIBAWAH_50";
        }
      }
      
      // Buat record baru
      const totalTagihan =
        jenisPembayaran === "DAFTAR_ULANG"
          ? expectedTagihanDaftarUlang
          : Number(pendaftar.tahun_ajaran?.biaya_pendaftaran || jumlah);

      pembayaranResult = await prisma.pembayaran.create({
        data: {
          pendaftar_id: pendaftarId,
          tahun_ajaran_id: pendaftar.tahun_ajaran_id,
          metode_pembayaran: "manual",
          jenis_pembayaran: jenisPembayaran as any,
          tipe_cicilan: finalTipeCicilan as any,
          cicilan_ke: cicilanKe,
          jumlah: jumlah,
          total_tagihan: totalTagihan,
          bukti_transfer_path: filePath,
          bukti_transfer_filename: safeFileName,
          status_pembayaran: "verified",
          catatan_verifikasi: catatan
            ? `Admin upload (Auto-Verified): ${catatan}`
            : "Diunggah dan diverifikasi otomatis oleh Admin" } as any });
    }

    // 12. Update status pendaftar
    const { getStatusIndex } = await import("@/lib/access-control");
    let newPendaftarStatus = pendaftar.status_pendaftaran;

    if (jenisPembayaran === "DAFTAR_ULANG") {
      const allVerified = await prisma.pembayaran.findMany({
        where: {
          pendaftar_id: pendaftarId,
          jenis_pembayaran: "DAFTAR_ULANG",
          status_pembayaran: "verified",
          id: { not: pembayaranResult.id } // Exclude the one we just updated/created to avoid double counting if it was already in DB
        } });
      const totalPaid = allVerified.reduce((acc, p) => acc + Number(p.jumlah), 0) + jumlah;
      
      let expectedTagihanDaftarUlang = 8500000;
      let dataLengkap = pendaftar.data_lengkap as any || {};
      if (typeof dataLengkap === "string") {
        try { dataLengkap = JSON.parse(dataLengkap); } catch(e) {}
      }
      const keringanan = dataLengkap.keringanan_daftar_ulang;
      if (keringanan && typeof keringanan.nominal_potongan === "number") {
        expectedTagihanDaftarUlang -= keringanan.nominal_potongan;
      }
      
      const threshold = expectedTagihanDaftarUlang;
      if (totalPaid >= threshold) {
        newPendaftarStatus = "enrolled_full";
      } else {
        newPendaftarStatus = "enrolled";
      }
    } else {
      if (
        getStatusIndex(newPendaftarStatus as any) <
        getStatusIndex("verified" as any)
      ) {
        newPendaftarStatus = "verified";
      }
    }

    if (newPendaftarStatus !== pendaftar.status_pendaftaran) {
      await prisma.pendaftar.update({
        where: { id: pendaftarId },
        data: {
          status_pendaftaran: newPendaftarStatus,
          updated_at: new Date() } });
    }

    // 12b. Kirim Notifikasi WhatsApp
    try {
      if (pendaftar.no_hp) {
        const isDaftarUlang = jenisPembayaran === "DAFTAR_ULANG";
        const activeJenisNotif = isDaftarUlang ? "daftar_ulang_verified" : "payment_verified";

        const formattedAmount = `Rp ${jumlah.toLocaleString("id-ID")}`;
        const paymentDate = new Date().toLocaleDateString("id-ID");
        const metodePembayaran = "Transfer (Admin)";

        let finalMessage = "";
        if (isDaftarUlang) {
          const { createHmac } = await import("crypto");
          const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "fallback-secret-for-dev";
          const nomorPendaftaran = pendaftar.nomor_pendaftaran || "";
          const expectedHash = createHmac("sha256", MAGIC_LINK_SECRET)
            .update(nomorPendaftaran)
            .digest("hex")
            .slice(0, 8);
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const longUrl = `${baseUrl}/s/${nomorPendaftaran}-${expectedHash}?t=seragam`;
          
          const { generateShortLink } = await import("@/lib/utils/magic-link");
          const shortUrl = await generateShortLink(longUrl);

          const { buildMessageDaftarUlangVerified } = await import("@/lib/whatsapp-queue");
          finalMessage = buildMessageDaftarUlangVerified(
            pendaftar.nama_lengkap,
            formattedAmount,
            metodePembayaran,
            paymentDate,
            shortUrl,
          );
        } else {
          const { buildMessagePaymentVerified } = await import("@/lib/whatsapp-queue");
          finalMessage = buildMessagePaymentVerified(
            pendaftar.nama_lengkap,
            formattedAmount,
            metodePembayaran,
            paymentDate,
          );
        }

        const { enqueueWhatsapp } = await import("@/lib/whatsapp-queue");
        await enqueueWhatsapp({
          pendaftarId: pendaftarId,
          phone: pendaftar.no_hp,
          jenisNotif: activeJenisNotif as any,
          messageContent: finalMessage });
      }
    } catch (waError) {
      console.error("WhatsApp notification error:", waError);
    }

    // 13. Audit log
    logAdminAction({
      action: "ADMIN_UPLOAD_PAYMENT_FOR_PENDAFTAR",
      adminId: session.id || "system",
      adminName: session.full_name || session.name || "Admin",
      targetId: pendaftarId,
      targetName: pendaftar.nama_lengkap,
      details: {
        pembayaran_id: pembayaranResult.id,
        jenis_pembayaran: jenisPembayaran,
        jumlah: jumlah,
        file_path: filePath,
        nomor_pendaftaran: pendaftar.nomor_pendaftaran } });

    return NextResponse.json({
      success: true,
      message: `Bukti pembayaran ${jenisPembayaran === "DAFTAR_ULANG" ? "Daftar Ulang" : "Pendaftaran"} untuk ${pendaftar.nama_lengkap} berhasil diupload dan otomatis Terverifikasi.`,
      data: {
        pembayaran_id: pembayaranResult.id,
        pendaftar_nama: pendaftar.nama_lengkap,
        nomor_pendaftaran: pendaftar.nomor_pendaftaran,
        file_path: filePath,
        status: "verified" } });
  } catch (error: any) {
    console.error(
      "Critical error in admin upload-for-pendaftar payment:",
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error: `Kesalahan sistem: ${error.message || "Unknown error"}` },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/pembayaran/upload-for-pendaftar?q=nama_atau_nomor
 *
 * Cari pendaftar untuk keperluan modal upload admin.
 * Mengembalikan daftar pendaftar yang cocok dengan query.
 */
export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession()) as any;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["admin_super", "admin_keuangan", "admin", "admin_berkas"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Ketik minimal 2 karakter untuk mencari" });
    }

    const pendaftarList = await prisma.pendaftar.findMany({
      where: {
        deleted_at: null,
        OR: [
          { nama_lengkap: { contains: q, mode: "insensitive" } },
          { nomor_pendaftaran: { contains: q, mode: "insensitive" } },
          { no_hp: { contains: q } },
        ] },
      select: {
        id: true,
        nomor_pendaftaran: true,
        nama_lengkap: true,
        jenjang: true,
        no_hp: true,
        status_pendaftaran: true,
        jenis_kelamin: true,
        pembayaran: {
          select: {
            id: true,
            jenis_pembayaran: true,
            status_pembayaran: true,
            jumlah: true } },
        tahun_ajaran: {
          select: {
            nama: true,
            biaya_pendaftaran: true } } },
      orderBy: { created_at: "desc" },
      take: 10 });

    return NextResponse.json({
      success: true,
      data: pendaftarList });
  } catch (error: any) {
    console.error("Error searching pendaftar:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mencari pendaftar" },
      { status: 500 },
    );
  }
}
