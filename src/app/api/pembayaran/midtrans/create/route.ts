import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/pembayaran/midtrans/create
 * Membuat transaksi Midtrans dan mendapatkan Snap Token
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validasi session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("al_session");

    if (!sessionCookie) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesi tidak ditemukan. Silakan login kembali." },
        { status: 401 },
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid" },
        { status: 401 },
      );
    }

    if (session.role !== "pendaftar") {
      return NextResponse.json(
        { success: false, error: "Akses tidak diizinkan" },
        { status: 403 },
      );
    }

    // 2. Validasi environment variables
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY not configured");
      return NextResponse.json(
        {
          success: false,
          error:
            "Pembayaran online belum dikonfigurasi. Silakan gunakan transfer manual." },
        { status: 500 },
      );
    }

    // 3. Ambil data pendaftar
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: session.id },
      include: {
        tahun_ajaran: true } });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Data pendaftar tidak ditemukan" },
        { status: 404 },
      );
    }

    // 4. Cek deadline
    const tahunAjaran = pendaftar.tahun_ajaran;
    const now = new Date();
    // Gunakan tanggal tutup pendaftaran sebagai deadline, atau default 7 hari jika tidak ada
    const deadlineStr = tahunAjaran.tanggal_tutup_pendaftaran;
    const deadline = deadlineStr
      ? new Date(deadlineStr)
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 5. Cek apakah sudah ada pembayaran yang verified
    const existingPayment = await prisma.pembayaran.findFirst({
      where: {
        pendaftar_id: session.id,
        status_pembayaran: "verified" } });

    if (existingPayment) {
      return NextResponse.json(
        {
          success: false,
          error: "Pembayaran Anda sudah terverifikasi sebelumnya" },
        { status: 400 },
      );
    }

    // 6. Generate unique order ID
    const timestamp = Date.now();
    const orderId = `PPDB-${pendaftar.nomor_pendaftaran}-${timestamp}`;
    const grossAmount = Number(tahunAjaran.biaya_pendaftaran);

    // 7. Prepare Midtrans transaction data
    const transactionData = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount },
      item_details: [
        {
          id: "BIAYA_PENDAFTARAN",
          price: grossAmount,
          quantity: 1,
          name: `Biaya Pendaftaran PPDB ${tahunAjaran.nama}` },
      ],
      customer_details: {
        first_name: pendaftar.nama_lengkap,
        email: pendaftar.email || "noemail@ponpesalimam.sch.id",
        phone: pendaftar.no_hp || "" },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/pendaftar/pembayaran-pendaftaran?status=finish`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/pendaftar/pembayaran-pendaftaran?status=error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/pendaftar/pembayaran-pendaftaran?status=pending` },
      expiry: {
        unit: "days",
        duration: Math.max(
          1,
          Math.ceil(
            (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          ),
        ) } };

    // 8. Call Midtrans API to get Snap Token
    const midtransUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const authString = Buffer.from(serverKey + ":").toString("base64");

    const midtransResponse = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}` },
      body: JSON.stringify(transactionData) });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok || !midtransData.token) {
      console.error("Midtrans error:", midtransData);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal membuat transaksi pembayaran. Silakan coba lagi." },
        { status: 500 },
      );
    }

    // 9. Simpan record pembayaran dengan status pending
    const insertedPayment = await prisma.pembayaran.create({
      data: {
        pendaftar_id: session.id,
        tahun_ajaran_id: pendaftar.tahun_ajaran_id,
        metode_pembayaran: "midtrans",
        jumlah: grossAmount,
        midtrans_order_id: orderId,
        midtrans_response_json: midtransData,
        status_pembayaran: "pending",
        expired_at: new Date(
          now.getTime() + transactionData.expiry.duration * 24 * 60 * 60 * 1000,
        ) } });

    // 10. Return snap token
    return NextResponse.json({
      success: true,
      message: "Transaksi berhasil dibuat",
      data: {
        pembayaran_id: insertedPayment.id,
        order_id: orderId,
        snap_token: midtransData.token,
        redirect_url: midtransData.redirect_url,
        gross_amount: grossAmount } });
  } catch (error: any) {
    console.error("Error in POST /api/pembayaran/midtrans/create:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat membuat transaksi pembayaran" },
      { status: 500 },
    );
  }
}
