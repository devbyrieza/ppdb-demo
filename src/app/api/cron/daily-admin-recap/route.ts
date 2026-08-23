import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/wablas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Optional Security: Check auth header if VERCEL_CRON_SECRET is defined
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 1. Get counts
    const unverifiedPaymentsCount = await prisma.pembayaran.count({
      where: {
        status_pembayaran: { notIn: ["verified", "rejected"] } } });

    const unverifiedDocsCount = await prisma.dokumen.count({
      where: {
        is_verified: false,
        catatan: null } });

    const pendingDataRequestsCount = await prisma.dataPerubahanRequest.count({
      where: {
        status: { in: ["pending", "submitted"] } } });

    if (
      unverifiedPaymentsCount === 0 &&
      unverifiedDocsCount === 0 &&
      pendingDataRequestsCount === 0
    ) {
      return NextResponse.json({
        message: "Tidak ada antrean hari ini. Notifikasi tidak dikirim." });
    }

    // 2. Format message
    let messageText = `*Laporan Antrean Verifikasi Harian*\n\nSelamat Pagi Admin. Terdapat data Pendaftar yang menunggu verifikasi di Dashboard Anda:\n\n`;
    if (unverifiedPaymentsCount > 0) {
      messageText += `- 💳 *${unverifiedPaymentsCount}* Pembayaran menunggu verifikasi\n`;
    }
    if (unverifiedDocsCount > 0) {
      messageText += `- 📄 *${unverifiedDocsCount}* Dokumen menunggu verifikasi\n`;
    }
    if (pendingDataRequestsCount > 0) {
      messageText += `- 🔄 *${pendingDataRequestsCount}* Permintaan Edit Data\n`;
    }

    messageText += `\nMohon segera cek *Admin Portal* untuk melakukan verifikasi. Terima kasih & semangat bertugas!`;

    // 3. Find Admins
    // Mencari user yang bukan pendaftar (admin, super_admin, admin_keuangan, dll)
    const admins = await prisma.profile.findMany({
      where: {
        role: {
          not: "pendaftar" } },
      select: { phone: true, full_name: true, role: true } });

    // Send WhatsApp to admins (ensure unique phone numbers)
    const phoneSent = new Set<string>();
    const sendResults = [];
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const admin of admins) {
      if (admin.phone && !phoneSent.has(admin.phone)) {
        phoneSent.add(admin.phone);
        try {
          const res = await sendMessage({
            phone: admin.phone,
            message: messageText });
          sendResults.push({
            name: admin.full_name,
            phone: admin.phone,
            success: res.status });

          // Beri jeda 3 detik antar pengiriman agar tidak terdeteksi spam/ban oleh Wablas
          await delay(3000);
        } catch (err) {
          sendResults.push({
            name: admin.full_name,
            phone: admin.phone,
            success: false,
            error: String(err) });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Daily recap checked and sent if needed.",
      results: sendResults });
  } catch (error) {
    console.error("Daily admin recap cron error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
