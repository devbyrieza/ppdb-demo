import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/pembayaran/kwitansi
 * Generate dan download kwitansi pembayaran dalam format HTML/PDF
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Validasi session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("app_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak ditemukan" },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid" },
        { status: 401 }
      );
    }

    if (session.role !== "pendaftar") {
      return NextResponse.json(
        { success: false, error: "Akses tidak diizinkan" },
        { status: 403 }
      );
    }

    const pendaftarId = session.id;

    // 2. Ambil data pendaftar
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      include: {
        tahun_ajaran: true,
      },
    });

    if (!pendaftar) {
      return NextResponse.json(
        { success: false, error: "Data pendaftar tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. Ambil data pembayaran yang sudah verified
    const pembayaran = await prisma.pembayaran.findFirst({
      where: {
        pendaftar_id: pendaftarId,
        status_pembayaran: "verified",
      },
      orderBy: { verified_at: "desc" }
    });

    if (!pembayaran) {
      return NextResponse.json(
        { success: false, error: "Pembayaran belum terverifikasi" },
        { status: 400 }
      );
    }

    // Parse tahun ajaran
    const tahunAjaran = pendaftar.tahun_ajaran;

    // Format tanggal
    const formatDate = (date: Date | string | null) => {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    // Format rupiah
    const formatRupiah = (amount: number | object) => {
      // Handle Decimal type from Prisma
      const val = typeof amount === 'object' ? Number(amount) : amount;
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(val);
    };

    // Generate nomor kwitansi
    const nomorKwitansi = `KWT/${pendaftar.nomor_pendaftaran}/${new Date().getFullYear()}`;

    // 4. Generate HTML Kwitansi
    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kwitansi Pembayaran - ${pendaftar.nomor_pendaftaran}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border: 2px solid #0d9488;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .kwitansi-title {
      background: #f0fdfa;
      padding: 15px 30px;
      border-bottom: 2px dashed #0d9488;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .kwitansi-title h2 {
      color: #0d9488;
      font-size: 20px;
    }
    .kwitansi-title .nomor {
      font-family: monospace;
      font-size: 14px;
      color: #666;
    }
    .content {
      padding: 30px;
    }
    .info-row {
      display: flex;
      border-bottom: 1px solid #e5e5e5;
      padding: 12px 0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      width: 200px;
      color: #666;
      font-size: 14px;
    }
    .info-value {
      flex: 1;
      font-weight: 600;
      color: #333;
    }
    .amount-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .amount-label {
      color: #92400e;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .amount-value {
      color: #78350f;
      font-size: 28px;
      font-weight: bold;
    }
    .status-box {
      background: #dcfce7;
      border: 2px solid #22c55e;
      border-radius: 8px;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
    }
    .status-box .checkmark {
      width: 24px;
      height: 24px;
      background: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    .status-box .text {
      color: #166534;
      font-weight: bold;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px 30px;
      text-align: center;
      border-top: 2px dashed #0d9488;
    }
    .footer p {
      color: #666;
      font-size: 12px;
      margin-bottom: 5px;
    }
    .stamp {
      margin-top: 20px;
      padding: 10px 20px;
      border: 2px solid #0d9488;
      border-radius: 8px;
      display: inline-block;
      color: #0d9488;
      font-weight: bold;
      transform: rotate(-5deg);
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ponpes Al-Andalus Al-Imam</h1>
      <p>Jl. Pelabuhan Ratu II KM 18, Cikembar, Sukabumi, Jawa Barat 43157</p>
      <p>Telp: +62 851-1152-4441 | Email: ppdb.pesantrenalimam@gmail.com</p>
    </div>

    <div class="kwitansi-title">
      <h2>KWITANSI PEMBAYARAN</h2>
      <span class="nomor">No: ${nomorKwitansi}</span>
    </div>

    <div class="content">
      <div class="info-row">
        <div class="info-label">Telah Diterima Dari</div>
        <div class="info-value">${pendaftar.nama_lengkap.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Nomor Pendaftaran</div>
        <div class="info-value">${pendaftar.nomor_pendaftaran}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Jenjang Pendidikan</div>
        <div class="info-value">${pendaftar.jenjang}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Tahun Ajaran</div>
        <div class="info-value">${tahunAjaran?.nama || "-"}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Untuk Pembayaran</div>
        <div class="info-value">Biaya Pendaftaran Santri Baru</div>
      </div>
      <div class="info-row">
        <div class="info-label">Metode Pembayaran</div>
        <div class="info-value">${pembayaran.metode_pembayaran === "manual" ? "Transfer Bank" : "Online (Midtrans)"}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Tanggal Pembayaran</div>
        <div class="info-value">${formatDate(pembayaran.created_at)}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Tanggal Verifikasi</div>
        <div class="info-value">${pembayaran.verified_at ? formatDate(pembayaran.verified_at) : "-"}</div>
      </div>

      <div class="amount-box">
        <div class="amount-label">Jumlah Pembayaran</div>
        <div class="amount-value">${formatRupiah(pembayaran.jumlah)}</div>
      </div>

      <div class="status-box">
        <div class="checkmark">✓</div>
        <div class="text">LUNAS</div>
      </div>
    </div>

    <div class="footer">
      <p>Kwitansi ini sah sebagai bukti pembayaran pendaftaran.</p>
      <p>Dicetak pada: ${formatDate(new Date().toISOString())}</p>
      <div class="stamp">LUNAS</div>
    </div>
  </div>

  <script>
    // Auto print when opened
    // window.onload = function() { window.print(); }
  </script>
</body>
</html>
    `;

    // Return HTML response
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="Kwitansi-${pendaftar.nomor_pendaftaran}.html"`,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/pembayaran/kwitansi:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
