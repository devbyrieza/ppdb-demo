import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PDF_BRANDING } from "@/config/pdf-branding";

export interface PendaftarPdfData {
  nomor_pendaftaran: string;
  nama_lengkap: string;
  nik: string;
  jenjang: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  alamat?: string;
  no_hp?: string;
  tahun_ajaran: string;
  tanggal_cetak?: string;
  status_kelulusan?: string;
  jadwal_ujian?: string;
  lokasi_ujian?: string;
}

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};

// ============================================================
// IMAGE CACHE SYSTEM
// ============================================================
const imageCache: Record<string, string | null> = {};

const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
  if (!url) return null;
  if (imageCache[url] !== undefined) {
    return imageCache[url];
  }

  const base64 = await (async () => {
    const isServer = typeof window === "undefined";
    if (isServer) {
      try {
        if (url.startsWith("/")) {
          const fs = await import("fs/promises");
          const path = await import("path");
          const filePath = path.join(process.cwd(), "public", url);
          const data = await fs.readFile(filePath);
          const ext = path.extname(url).slice(1) || "png";
          return `data:image/${ext};base64,${data.toString("base64")}`;
        } else {
          const response = await fetch(url);
          if (!response.ok) return null;
          const buffer = Buffer.from(await response.arrayBuffer());
          const contentType = response.headers.get("content-type") || "image/png";
          return `data:${contentType};base64,${buffer.toString("base64")}`;
        }
      } catch (err) {
        console.error(`Server error fetchImageAsBase64 (${url}):`, err);
        return null;
      }
    }

    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  })();

  imageCache[url] = base64;
  return base64;
};

// ============================================================
// TEMPLATE: FULL IMAGE (Kop Surat Resmi sebagai Background)
// ============================================================

/**
 * Menggambar kop surat penuh dari gambar letterhead resmi secara sinkron (memakai cache).
 */
const drawFullImageBackgroundSync = (doc: jsPDF) => {
  const { assets } = PDF_BRANDING;
  if (!assets.kop_full) return;
  const kopBase64 = imageCache[assets.kop_full];
  if (kopBase64) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.addImage(kopBase64, "JPEG", 0, 0, pageWidth, pageHeight);
  }
};

const drawFullImageBackground = async (doc: jsPDF) => {
  const { assets } = PDF_BRANDING;
  if (!assets.kop_full) return;
  try {
    await fetchImageAsBase64(assets.kop_full);
    drawFullImageBackgroundSync(doc);
  } catch (e) {
    console.warn("Kop surat full image tidak dapat dimuat:", e);
  }
};

// ============================================================
// TEMPLATE: PROGRAMMATIC (Kop Generik — jsPDF Elements)
// ============================================================

/**
 * Menggambar kop surat secara programatik secara sinkron (memakai cache).
 */
const drawProgrammaticHeaderSync = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { coords, assets, institution } = PDF_BRANDING;

  // 1. Logo
  const logoBase64 = imageCache[assets.logo];
  if (logoBase64) {
    doc.addImage(
      logoBase64,
      "PNG",
      coords.header.logo.x,
      coords.header.logo.y,
      coords.header.logo.w,
      coords.header.logo.h,
    );
  }

  // 2. Garis Vertikal Pemisah
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(coords.header.vertical_bar.width);
  doc.line(
    coords.header.vertical_bar.x1,
    coords.header.vertical_bar.y1,
    coords.header.vertical_bar.x2,
    coords.header.vertical_bar.y2,
  );

  // 3. Info Institusi
  const textX = coords.header.text_x;
  doc.setTextColor(40, 40, 40);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(institution.subtitle, textX, 16);

  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text(institution.committee, textX, 24);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Tahun Ajaran ${institution.academic_year}`, textX, 31);

  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text(institution.address, textX, 36);
  doc.text(`${institution.contact} | ${institution.phones}`, textX, 40);

  // 4. Garis Horizontal Pemisah (double line)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(coords.header.horizontal_sep.thickness_thick);
  doc.line(18, coords.header.horizontal_sep.y_thick, pageWidth - 18, coords.header.horizontal_sep.y_thick);
  doc.setLineWidth(coords.header.horizontal_sep.thickness_thin);
  doc.line(18, coords.header.horizontal_sep.y_thin, pageWidth - 18, coords.header.horizontal_sep.y_thin);

  doc.setTextColor(0, 0, 0);
};

const drawProgrammaticHeader = async (doc: jsPDF) => {
  const { assets } = PDF_BRANDING;
  try {
    await fetchImageAsBase64(assets.logo);
    drawProgrammaticHeaderSync(doc);
  } catch (e) {
    console.warn("Logo tidak dapat dimuat:", e);
  }
};

// ============================================================
// UNIFIED HEADER / FOOTER / SIGNATURE — otomatis pilih template
// ============================================================

/**
 * Menggambar header secara sinkron (memakai cache).
 */
const drawHeaderSync = (doc: jsPDF) => {
  if (PDF_BRANDING.template === "full_image" && PDF_BRANDING.assets.kop_full) {
    drawFullImageBackgroundSync(doc);
  } else {
    drawProgrammaticHeaderSync(doc);
  }
};

/**
 * Menggambar header sesuai konfigurasi template di PDF_BRANDING.
 */
const drawHeader = async (doc: jsPDF) => {
  const { assets } = PDF_BRANDING;
  if (PDF_BRANDING.template === "full_image" && assets.kop_full) {
    await fetchImageAsBase64(assets.kop_full);
    drawFullImageBackgroundSync(doc);
  } else {
    await fetchImageAsBase64(assets.logo);
    drawProgrammaticHeaderSync(doc);
  }
};

/**
 * Footer: teks cetak otomatis (sinkron).
 */
const drawFooterSync = (doc: jsPDF, institutionName?: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const name = institutionName || PDF_BRANDING.institution.name;

  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);

  // Jika menggunakan full_image, naikkan sedikit Y agar tidak menabrak bar coklat footer di background
  const yPos = (PDF_BRANDING.template === "full_image" && PDF_BRANDING.assets.kop_full) 
    ? pageHeight - 14 
    : pageHeight - 5;

  doc.text(
    `Dicetak secara sistem melalui website PPDB ${name} pada: ${new Date().toLocaleString("id-ID")}`,
    pageWidth / 2,
    yPos,
    { align: "center" },
  );
  doc.setTextColor(0, 0, 0);
};

const drawFooter = (doc: jsPDF, institutionName?: string) => {
  drawFooterSync(doc, institutionName);
};

/**
 * Area konten yang tersedia (mulai Y, akhir Y).
 * - full_image: menggunakan content_area dari PDF_BRANDING
 * - programmatic: mulai dari y=50 (setelah kop programatik)
 */
const getContentStartY = () => {
  if (PDF_BRANDING.template === "full_image" && PDF_BRANDING.assets.kop_full) {
    return PDF_BRANDING.content_area.y_start;
  }
  return 50;
};

/**
 * Menggambar blok TTD formal (Ketua Panitia) di sebelah kanan.
 */
const drawFormalSignature = async (doc: jsPDF, y: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { authority, assets, coords } = PDF_BRANDING;
  
  // Reposisi tanda tangan: jika full_image (seperti Al-Imam), geser ke kiri agar tidak menabrak Kemenkumham.
  // Jika programmatic (generik), tetap di kanan bawah seperti biasa.
  const isFullImage = PDF_BRANDING.template === "full_image";
  const xBase = isFullImage ? 28 : pageWidth - coords.signature.margin_right;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(
    `${authority.city}, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    xBase,
    y,
  );
  doc.text(authority.role + ",", xBase, y + 6);

  const stempel = await fetchImageAsBase64(assets.stamp);
  const ttd = await fetchImageAsBase64(assets.signature);

  if (isFullImage) {
    if (stempel) {
      doc.addImage(stempel, "JPEG", xBase - 10, y + 10, coords.signature.stamp.w, coords.signature.stamp.h);
    }
    if (ttd) {
      doc.addImage(ttd, "PNG", xBase + 5, y + 10, coords.signature.ttd.w, coords.signature.ttd.h);
    }
  } else {
    if (stempel) {
      doc.addImage(stempel, "JPEG", xBase - 20, y + 10, coords.signature.stamp.w, coords.signature.stamp.h);
    }
    if (ttd) {
      doc.addImage(ttd, "PNG", xBase + 10, y + 10, coords.signature.ttd.w, coords.signature.ttd.h);
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(authority.name, xBase, y + 45);
};

// ============================================================
// GENERATE BUKTI PENDAFTARAN
// ============================================================

/**
 * Generate Bukti Pendaftaran PDF
 */
export const generateBuktiPendaftaran = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  await drawHeader(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const startY = getContentStartY();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BUKTI PENDAFTARAN", pageWidth / 2, startY + 5, { align: "center" });

  const tableData = [
    ["Nomor Pendaftaran", `: ${data.nomor_pendaftaran}`],
    ["Nama Lengkap", `: ${toTitleCase(data.nama_lengkap)}`],
    ["NIK", `: ${data.nik}`],
    ["Jenjang Pendidikan", `: ${data.jenjang}`],
    [
      "Tempat, Tgl Lahir",
      `: ${data.tempat_lahir || "-"}, ${data.tanggal_lahir || "-"}`,
    ],
    ["Tahun Ajaran", `: ${data.tahun_ajaran}`],
    ["Status Akun", ": AKTIF / TERDAFTAR"],
  ];

  autoTable(doc, {
    startY: startY + 15,
    body: tableData,
    theme: "plain",
    styles: { fontSize: 11, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Petunjuk Selanjutnya:", 14, finalY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const instructions = [
    "1. Simpan dokumen ini sebagai bukti pendaftaran resmi.",
    "2. Lakukan pelunasan biaya pendaftaran jika belum dilakukan.",
    "3. Lengkapi seluruh biodata dan unggah berkas wajib di dashboard.",
    "4. Pantau dashboard secara berkala untuk ujian seleksi.",
  ];
  doc.text(instructions, 14, finalY + 8);

  drawFooter(doc);
  if (typeof window !== "undefined") {
    doc.save(`PPDB_BuktiPendaftaran_${data.nomor_pendaftaran}.pdf`);
  }
  return doc;
};

// ============================================================
// GENERATE KARTU UJIAN
// ============================================================

/**
 * Generate Kartu Peserta Ujian PDF
 */
export const generateKartuUjian = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  await drawHeader(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const startY = getContentStartY();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("KARTU PESERTA UJIAN", pageWidth / 2, startY + 5, { align: "center" });

  // Photo Box
  doc.setDrawColor(200, 200, 200);
  doc.rect(pageWidth - 54, startY + 15, 40, 50);
  doc.setFontSize(8);
  doc.text("FOTO 3x4", pageWidth - 34, startY + 40, { align: "center" });

  const tableData = [
    ["No. Peserta", `: ${data.nomor_pendaftaran}`],
    ["Nama Lengkap", `: ${toTitleCase(data.nama_lengkap)}`],
    ["NIK", `: ${data.nik}`],
    ["Jenjang", `: ${data.jenjang}`],
    ["Jadwal Seleksi", `: ${data.jadwal_ujian || "Menunggu Konfirmasi"}`],
    ["Lokasi", `: ${data.lokasi_ujian || "Pesantren Al Imam Al Islami"}`],
  ];

  autoTable(doc, {
    startY: startY + 15,
    body: tableData,
    theme: "plain",
    margin: { right: 65 },
    styles: { fontSize: 11, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  await drawFormalSignature(doc, finalY);

  drawFooter(doc);
  if (typeof window !== "undefined") {
    doc.save(`PPDB_KartuUjian_${data.nomor_pendaftaran}.pdf`);
  }
  return doc;
};

// ============================================================
// GENERATE SURAT KELULUSAN
// ============================================================

/**
 * Generate Surat Keterangan Hasil Seleksi
 */
export const generateSuratKelulusan = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const startY = getContentStartY();

  await drawHeader(doc);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SURAT KETERANGAN HASIL SELEKSI", pageWidth / 2, startY + 10, {
    align: "center",
  });
  doc.setFontSize(10);
  doc.text(
    `Nomor: ${data.nomor_pendaftaran}/SKL-PPDB/${new Date().getFullYear()}`,
    pageWidth / 2,
    startY + 17,
    { align: "center" },
  );

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const content = `Berdasarkan hasil seleksi Penerimaan Santri Baru (PPDB) Tahun Ajaran ${data.tahun_ajaran}, dengan ini Panitia menyatakan bahwa:`;
  doc.text(doc.splitTextToSize(content, pageWidth - 40), 20, startY + 30);

  const tableData = [
    ["Nomor Pendaftaran", `: ${data.nomor_pendaftaran}`],
    ["Nama Lengkap", `: ${toTitleCase(data.nama_lengkap)}`],
    ["NIK", `: ${data.nik}`],
    ["Jenjang Pendidikan", `: ${data.jenjang}`],
  ];

  autoTable(doc, {
    startY: startY + 40,
    body: tableData,
    theme: "plain",
    margin: { left: 25 },
    styles: { fontSize: 11, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);

  let statusText = "LULUS / DITERIMA";
  if (data.status_kelulusan === "cadangan") statusText = "CADANGAN";
  if (
    data.status_kelulusan === "ditolak" ||
    data.status_kelulusan === "rejected"
  )
    statusText = "BELUM DITERIMA";

  doc.text(`DINYATAKAN: ${statusText}`, pageWidth / 2, finalY + 10, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let closing =
    "Selamat bergabung menjadi keluarga besar Pesantren Al Imam Al Islami. Silakan segera melakukan proses daftar ulang sesuai jadwal yang ditentukan.";
  if (statusText === "CADANGAN")
    closing =
      "Anda masuk dalam daftar cadangan. Panitia akan menghubungi Anda jika terdapat kuota yang kosong.";
  if (statusText === "BELUM DITERIMA")
    closing =
      "Tetap semangat dan jangan berkecil hati. Anda dapat kembali mendaftar pada gelombang atau periode berikutnya.";

  doc.text(doc.splitTextToSize(closing, pageWidth - 40), 20, finalY + 25);

  if (statusText === "LULUS / DITERIMA") {
    const daftarUlangInfo =
      "Pembayaran daftar ulang harus segera dibayarkan minimal 50% paling lambat sepekan setelah pengumuman hasil. Bagi yang membutuhkan keringanan, silakan menghubungi bagian Finance di 0812-2063-6945.";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      doc.splitTextToSize(daftarUlangInfo, pageWidth - 40),
      20,
      finalY + 40,
    );
  }

  await drawFormalSignature(doc, finalY + 65);

  drawFooter(doc);
  if (typeof window !== "undefined") {
    doc.save(`PPDB_SuratHasilSeleksi_${data.nomor_pendaftaran}.pdf`);
  }
  return doc;
};

// ============================================================
// HELPER: FORM ROW (label + garis isian)
// ============================================================

const drawFormRow = (
  doc: jsPDF,
  label: string,
  x: number,
  y: number,
  lineWidth: number,
) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(label, x, y);
  doc.text(":", x + 48, y);
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.2);
  doc.line(x + 52, y + 1, x + 52 + lineWidth, y + 1);
};

// ============================================================
// GENERATE SURAT KETERANGAN KESEHATAN
// ============================================================

/**
 * Generate Surat Pengantar Pemeriksaan Kesehatan + Formulir (2 halaman)
 * Mengacu pada dokumen: AIIS-Surat-Kesehatan-PSB-26-27-REVISED
 */
export const generateSuratKesehatan = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const { institution, authority } = PDF_BRANDING;
  const margin = 18;
  const contentW = pageWidth - margin * 2;
  const startY = getContentStartY();

  // === HALAMAN 1: SURAT PENGANTAR ===
  await drawHeader(doc);

  let y = startY + 2;
  doc.setFontSize(9.5); // Diubah dari 10.5 ke 9.5 untuk menghemat ruang
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);

  // Lampiran & Hal
  const leftColX = margin;
  const colonX = margin + 20;
  doc.text("Lamp.", leftColX, y);
  doc.text(":", colonX, y);
  doc.text("1 Lembar", colonX + 4, y);
  y += 5; // Diubah dari 6 ke 5
  doc.text("Hal", leftColX, y);
  doc.text(":", colonX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  const halText = `Pemeriksaan Kesehatan Calon Santri Baru\n${institution.name}`;
  doc.text(halText, colonX + 4, y);
  doc.setFont("helvetica", "normal");

  y += 10; // Diubah dari 18 ke 10 untuk menghemat ruang vertikal
  doc.setTextColor(50, 50, 50);
  doc.text("Kepada Yth.", leftColX, y);
  y += 5; // Diubah dari 6 ke 5
  doc.text("Petugas Kesehatan Puskesmas/Rumah Sakit", leftColX, y);
  y += 5;
  doc.text(".............................................", leftColX, y);
  y += 5;
  doc.text("Di Tempat", leftColX, y);

  y += 8; // Diubah dari 12 ke 8
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "italic");
  doc.text("Dengan hormat,", leftColX, y);
  doc.setFont("helvetica", "normal");

  y += 6; // Diubah dari 8 ke 6
  const intro = `Sehubungan dengan kegiatan penerimaan calon santri baru ${institution.name} Tahun Pelajaran 2026/2027, kami selaku panitia membutuhkan pemeriksaan kesehatan bagi para calon santri sebagai salah satu bagian dari rangkaian proses seleksi.`;
  const introLines = doc.splitTextToSize(intro, contentW);
  doc.text(introLines, leftColX, y);
  y += introLines.length * 5 + 3; // Diubah dari 5.5 + 4 ke 5 + 3

  const intro2 =
    "Untuk itu, kami mohon kesediaan Bapak/Ibu untuk melakukan pemeriksaan kesehatan bagi calon santri dengan identitas berikut:";
  const intro2Lines = doc.splitTextToSize(intro2, contentW);
  doc.text(intro2Lines, leftColX, y);
  y += intro2Lines.length * 5 + 3;

  // Data calon santri
  const fields1: [string, string][] = [
    ["Nama", data.nama_lengkap ? toTitleCase(data.nama_lengkap) : ".................................................................................."],
    ["Nomor Pendaftaran", data.nomor_pendaftaran || ".................................................................................."],
    ["Tempat, Tanggal Lahir", (data.tempat_lahir && data.tanggal_lahir) ? `${toTitleCase(data.tempat_lahir)}, ${data.tanggal_lahir}` : ".................................................................................."],
    ["Alamat", data.alamat || ".................................................................................."],
  ];
  for (const [label, value] of fields1) {
    doc.setFont("helvetica", "bold");
    doc.text(label, leftColX + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(":", leftColX + 54, y);
    doc.text(value, leftColX + 57, y);
    y += 5.2; // Diubah dari 6 ke 5.2
  }

  y += 3; // Diubah dari 5 ke 3
  doc.text("Jenis pemeriksaan kesehatan yang dibutuhkan adalah:", leftColX, y);
  y += 5; // Diubah dari 7 ke 5
  const checks = [
    "Riwayat Penyakit (Anamnesis)",
    "Pemeriksaan Fisik (Physical Test)",
    "Pemeriksaan Tajam Penglihatan (Visus) dan Buta Warna",
  ];
  for (const item of checks) {
    doc.setFillColor(80, 80, 80);
    // Menggambar bulatan bullet point kecil menggunakan metode lingkaran vector
    doc.circle(leftColX + 7, y - 1.2, 0.7, "F"); // Bulatan sedikit lebih kecil
    doc.text(item, leftColX + 11, y);
    y += 5.2; // Diubah dari 6 ke 5.2
  }

  y += 2; // Diubah dari 4 ke 2
  const note =
    "Catatan: Bila visus tidak normal, mohon dilengkapi dengan nilai negatif, positif, atau nilai silindrisnya (contoh: V.OD/V.OS: -1/-0,5).";
  const noteLines = doc.splitTextToSize(note, contentW - 5);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5); // Ukuran catatan diperkecil sedikit
  doc.text(noteLines, leftColX + 5, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5); // Kembalikan ke 9.5
  y += noteLines.length * 4.5 + 3;

  const closing1 =
    "Hasil pemeriksaan dapat diisikan pada formulir terlampir. Seluruh biaya pemeriksaan kesehatan dibebankan kepada calon santri yang bersangkutan, dengan mekanisme yang ditentukan oleh pihak Rumah Sakit/Puskesmas.";
  const closing1Lines = doc.splitTextToSize(closing1, contentW);
  doc.text(closing1Lines, leftColX, y);
  y += closing1Lines.length * 5 + 4;

  doc.setFont("helvetica", "italic");
  doc.text(
    "Demikian yang dapat kami sampaikan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.",
    leftColX,
    y,
  );
  doc.setFont("helvetica", "normal");

  await drawFormalSignature(doc, y + 8); // Diubah dari 12 ke 8 untuk memajukan TTD Mudir
  drawFooter(doc);

  // === HALAMAN 2: FORMULIR PEMERIKSAAN ===
  doc.addPage();
  await drawHeader(doc);

  y = startY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("FORMULIR HASIL PEMERIKSAAN KESEHATAN", pageWidth / 2, y, {
    align: "center",
  });
  y += 7;
  doc.setFontSize(11);
  doc.text(
    `CALON SANTRI BARU ${institution.name.toUpperCase()}`,
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 6;
  doc.text("Tahun Pelajaran 2026/2027", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(
    "Dengan hormat, bersama ini kami sampaikan hasil pemeriksaan medis dari:",
    leftColX,
    y,
  );
  y += 8;

  for (const [label, value] of fields1) {
    doc.setFont("helvetica", "bold");
    doc.text(label, leftColX + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(":", leftColX + 54, y);
    doc.text(value, leftColX + 57, y);
    y += 6;
  }

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("A. Riwayat Kesehatan Pribadi", leftColX, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Pertanyaan Riwayat Penyakit", "Jawaban", "Keterangan"]],
    body: [
      [
        "Apakah pernah menderita asma?",
        "Tidak / Ya",
        "Ket: Ringan \u2013 Sedang \u2013 Berat",
      ],
      [
        "Apakah pernah menderita TBC?",
        "Tidak / Ya",
        "Ket: Sembuh \u2013 Proses Pengobatan",
      ],
      [
        "Apakah pernah menderita hepatitis?",
        "Tidak / Ya",
        "Ket: Sembuh \u2013 Proses Pengobatan",
      ],
      [
        "Apakah ada riwayat epilepsi?",
        "Tidak / Ya",
        "Ket: Sembuh \u2013 Proses Pengobatan",
      ],
      ["Apakah cocok tinggal di daerah dingin?", "Tidak / Ya", ""],
    ],
    styles: { fontSize: 9, cellPadding: 2.2 },
    headStyles: { fillColor: [139, 0, 0], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 64 },
    },
    margin: { top: getContentStartY() + 5, bottom: 48, left: margin, right: margin },
    didDrawPage: (data) => {
      // Menggambar kop dan footer secara sinkron di halaman luapan (page break)
      if (data.pageNumber > 1) {
        drawHeaderSync(doc);
        drawFooterSync(doc);
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("B. Hasil Pemeriksaan Fisik", leftColX, y);
  y += 4;

  const originalAddPage = doc.addPage.bind(doc);
  doc.addPage = function (...args: any[]) {
    originalAddPage(...args);
    drawHeaderSync(doc);
    drawFooterSync(doc);
    return this;
  };

  autoTable(doc, {
    startY: y,
    head: [["Pemeriksaan", "Hasil", "Ket.", "Pemeriksaan", "Hasil", "Ket."]],
    body: [
      ["1. Keadaan Umum", "", "", "3. Leher", "", ""],
      ["   Tinggi Badan", "...... cm", "", "   - Kelenjar Gondok", "Normal / Ada kelainan", ""],
      ["   Berat Badan", "...... kg", "", "4. Dada", "", ""],
      ["   Tekanan Darah", "...... mmHg", "", "   - Jantung", "Normal / Ada kelainan", ""],
      ["2. Kepala", "", "", "   - Paru-Paru", "Normal / Ada kelainan", ""],
      ["   a. Mata", "", "", "5. Perut", "", ""],
      ["      - Visus Kanan", ".......", "", "   - Hepar", "Normal / Ada kelainan", ""],
      ["      - Visus Kiri", ".......", "", "   - Limpa", "Normal / Ada kelainan", ""],
      ["      - Pakai Kacamata", "Ya / Tidak", "", "   - Hernia", "Normal / Ada kelainan", ""],
      ["      - Buta Warna", "Ya / Tidak", "", "6. Anus & Rektum", "", ""],
      ["   b. Telinga", "", "", "   - Hemoroid", "Ada / Tidak ada", ""],
      ["      - Membran Timpani", "Normal / Ada kelainan", "", "7. Ekstremitas", "", ""],
      ["      - Serumen", "Ada / Tidak ada", "", "   - Atas", "Normal / Ada kelainan", ""],
      ["      - Bekas Tindik", "Normal / Ada kelainan", "", "   - Bawah", "Normal / Ada kelainan", ""],
      ["   c. Hidung", "", "", "8. Kulit", "", ""],
      ["      - Polip", "Normal / Ada kelainan", "", "   - Penyakit Kulit", "Ada / Tidak ada", ""],
      ["   d. Tenggorokan", "", "", "   - Varises", "Ada / Tidak ada", ""],
      ["      - Tonsil", "Normal / Ada kelainan", "", "", "", ""],
      ["      - Faring", "Normal / Ada kelainan", "", "", "", ""],
    ],
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [139, 0, 0], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 43 },
      1: { cellWidth: 27 },
      2: { cellWidth: 10 },
      3: { cellWidth: 43 },
      4: { cellWidth: 41 },
      5: { cellWidth: 10 },
    },
    margin: { top: getContentStartY() + 5, bottom: 48, left: margin, right: margin },
  });

  let finalY2 = (doc as any).lastAutoTable.finalY + 8; // Memberikan jarak nafas yang lebih lega antara tabel dan teks
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (finalY2 + 60 > pageHeight - 40) {
    doc.addPage();
    drawHeaderSync(doc);
    finalY2 = getContentStartY() + 8;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const closingText = "Telah melakukan pemeriksaan dengan benar, dan data yang kami lampirkan adalah sesuai dengan hasil pemeriksaan.";
  
  // Menggunakan perataan "justify" dan maxWidth agar rata kiri-kanan sejajar dengan tabel
  doc.text(closingText, leftColX, finalY2, { align: "justify", maxWidth: contentW });
 
  // TTD Dokter — diposisikan di kanan bawah (right-aligned block) dan digeser naik
  const xRightSig = pageWidth - margin - 65; // Bergeser ke sisi kanan
  // Jika teks berbungkus, biasanya akan mengambil 2 baris (kurang lebih 5-6 unit per baris)
  const sigY = finalY2 + 10; 
  doc.setFontSize(10.5);
  doc.text("................., ...................... 2026", xRightSig, sigY);
  doc.text("Dokter Pemeriksa,", xRightSig, sigY + 5); // Diubah dari 6 ke 5
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.rect(xRightSig, sigY + 7, 60, 24); // Diubah dari tinggi 30 ke 24 untuk menghemat ruang
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("(Tanda Tangan & Stempel)", xRightSig + 7, sigY + 21); // Diubah dari 25 ke 21
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10.5);
  doc.text("dr. .................................", xRightSig, sigY + 37); // Diubah dari 44 ke 37
  doc.text("NIP. ................................", xRightSig, sigY + 42); // Diubah dari 50 ke 42 untuk menghemat ruang

  drawFooter(doc);
  if (typeof window !== "undefined") {
    doc.save(`AIIS_SuratKesehatan_${data.nomor_pendaftaran}.pdf`);
  }
  return doc;
};

// ============================================================
// GENERATE SURAT PERNYATAAN ORANGTUA/WALI
// ============================================================

/**
 * Generate Surat Pernyataan Orangtua/Wali Santri (Template)
 * Mengacu pada dokumen: Surat_Pernyataan_Orangtua_Wali
 */
export const generateSuratPernyataan = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const { authority } = PDF_BRANDING;
  const margin = 20;
  const contentW = pageWidth - margin * 2;
  const startY = getContentStartY();

  await drawHeader(doc);

  let y = startY + 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SURAT PERNYATAAN ORANGTUA/WALI SANTRI", pageWidth / 2, y, {
    align: "center",
  });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text("Saya yang bertanda tangan di bawah ini:", margin, y);
  y += 6;

  // Data orangtua/wali
  const col1X = margin + 5;
  const col1Colon = col1X + 20;
  const col1Line = col1Colon + 3;
  
  const col2X = col1Line + 60;
  const col2Colon = col2X + 22;
  const col2Line = col2Colon + 3;
  
  doc.setFont("helvetica", "bold");
  doc.text("Nama", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col1Colon, y);
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.2);
  doc.line(col1Line, y + 1, col2X - 5, y + 1);

  doc.setFont("helvetica", "bold");
  doc.text("Pekerjaan", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col2Colon, y);
  doc.line(col2Line, y + 1, pageWidth - margin, y + 1);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Alamat", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col1Colon, y);
  doc.line(col1Line, y + 1, col2X - 5, y + 1);

  doc.setFont("helvetica", "bold");
  doc.text("No. HP", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col2Colon, y);
  doc.line(col2Line, y + 1, pageWidth - margin, y + 1);
  y += 8;

  doc.text("Sebagai orangtua/wali dari calon santri/santriwati:", margin, y);
  y += 6;

  // Data santri
  doc.setFont("helvetica", "bold");
  doc.text("Nama", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col1Colon, y);
  doc.setFont("helvetica", "bold");
  doc.text(toTitleCase(data.nama_lengkap || ""), col1Line, y);
  doc.setFont("helvetica", "normal");

  doc.setFont("helvetica", "bold");
  doc.text("Jenjang", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col2Colon, y);
  doc.text("MTs / I'dad Lughawiy / MA", col2Line, y);
  y += 4;
  doc.setFontSize(8);
  doc.text("*) coret yang tidak perlu", col2Line, y);
  doc.setFontSize(10.5);
  y += 6;

  y += 3;
  const mainText =
    "Dengan ini menyatakan bahwa apabila di kemudian hari diketahui putra/putri kami melakukan atau terlibat dalam salah satu perilaku berikut:";
  doc.text(doc.splitTextToSize(mainText, contentW), margin, y);
  y += 8;

  const violations = [
    "Merokok",
    "LGBT atau hubungan sesama jenis",
    "Mengonsumsi narkoba atau zat adiktif terlarang",
    "Pacaran yang menjurus pada perzinaan",
    "Menonton atau kecanduan pornografi",
    "Melakukan tindakan kekerasan (penganiayaan) terhadap santri lain, baik terencana maupun tidak terencana",
    "Mencuri barang milik orang lain yang terjadi lebih dari dua kali",
    "Pemerasan dan perampasan yang dilakukan dua kali berturut-turut",
    "Provokasi terhadap santri lain atau asatidzah dengan tujuan merusak kerukunan warga pesantren",
  ];
  for (let i = 0; i < violations.length; i++) {
    const lines = doc
      .setFontSize(10.5)
      .splitTextToSize(`${i + 1}. ${violations[i]}`, contentW - 8);
    doc.text(lines, margin + 5, y);
    y += lines.length * 4.5;
  }

  y += 3;
  const consequence =
    "Maka kami menyatakan bersedia dengan ikhlas apabila putra/putri kami dikembalikan kepada kami hingga benar-benar dinyatakan pulih dan layak untuk kembali tinggal di lingkungan Pesantren, yang dibuktikan dengan surat keterangan dari psikolog atau tenaga ahli yang berwenang.";
  const consequenceLines = doc.splitTextToSize(consequence, contentW);
  doc.text(consequenceLines, margin, y);
  y += consequenceLines.length * 4.5 + 4;

  // Hapus page break agar tetap 1 halaman
  y += 2;

  const bottomY = y; // Simpan Y untuk menggambar catatan dan TTD secara bersebelahan

  // Kiri: Catatan Kesehatan
  doc.setFont("helvetica", "bold");
  doc.text("Catatan mengenai kondisi kesehatan:", margin, y);
  doc.setFont("helvetica", "normal");
  const healthNote =
    "Apabila putra/putri kami diketahui menderita penyakit kronis (antara lain: jantung, ginjal, HIV/AIDS, TBC, infeksi selaput otak, difteri, kanker, diabetes, atau epilepsi), kami bersedia segera dihubungi oleh pihak Pesantren untuk bersama-sama menentukan langkah terbaik demi keselamatan dan kenyamanan putra/putri kami serta seluruh warga Pesantren.";
  // Batasi lebar teks agar tidak menabrak area tanda tangan (sisakan 75 unit untuk TTD di kanan)
  const healthNoteLines = doc.splitTextToSize(healthNote, contentW - 75);
  doc.text(healthNoteLines, margin, y + 5);

  // Kanan: TTD Orangtua bermaterai (sejajar dengan Catatan Kesehatan)
  const dateStr = `${authority.city}, ......................... 2026`;
  doc.setFontSize(10.5);
  const sigX = pageWidth - margin - 70;
  // Gunakan bottomY yang sama agar sejajar
  doc.text(dateStr, sigX, bottomY);
  doc.text("Pembuat Pernyataan,", sigX, bottomY + 7);
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(sigX, bottomY + 10, 35, 22);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Materai Rp10.000,-", sigX + 2, bottomY + 22);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10.5);
  doc.setLineWidth(0.2);
  doc.line(sigX, bottomY + 40, sigX + 70, bottomY + 40);
  doc.text("(Orangtua/Wali)", sigX + 15, bottomY + 46);

  drawFooter(doc);
  if (typeof window !== "undefined") {
    doc.save(`AIIS_SuratPernyataan_${data.nomor_pendaftaran}.pdf`);
  }
  return doc;
};

// ============================================================
// GENERATE PAKTA INTEGRITAS (SANTRI + ORANGTUA, 2 Halaman)
// ============================================================

/**
 * Generate Pakta Integritas Santri (Hal. 1) dan Orangtua/Wali (Hal. 2)
 * Mengacu pada dokumen: Pakta_Integritas_Santri_dan_Orangtua
 */
export const generatePaktaIntegritas = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const { authority, institution } = PDF_BRANDING;
  const margin = 20;
  const contentW = pageWidth - margin * 2;
  const startY = getContentStartY();

  // ============================
  // HALAMAN 1: PAKTA INTEGRITAS SANTRI
  // ============================
  await drawHeader(doc);

  let y = startY + 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PAKTA INTEGRITAS SANTRI", pageWidth / 2, y, { align: "center" });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text("Saya yang bertanda tangan di bawah ini:", margin, y);
  y += 8;

  const santriFields2: [string, string][] = [
    ["Nama Lengkap", toTitleCase(data.nama_lengkap || "")],
    ["Jenjang", "MTs / I'dad Lughawiy / MA  *) coret yang tidak perlu"],
    ["Tahun Pelajaran", data.tahun_ajaran || "2026/2027"],
    ["Alamat Lengkap", data.alamat || ""],
  ];
  for (const [label, value] of santriFields2) {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(":", margin + 50, y);
    if (value) {
      doc.text(value, margin + 53, y);
    } else {
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.2);
      doc.line(margin + 53, y + 1, pageWidth - margin, y + 1);
    }
    y += 7;
  }

  y += 5;
  const preamble1 =
    `Dengan sungguh-sungguh dan penuh kesadaran, selama saya menjadi santri di ${institution.name}, menyatakan bahwa saya akan:`;
  doc.text(doc.splitTextToSize(preamble1, contentW), margin, y);
  y += 13;

  const santriCommitments = [
    "Berupaya dengan sungguh-sungguh untuk senantiasa melaksanakan tuntunan syariat Islam dalam kehidupan sehari-hari.",
    "Belajar dengan tekun dan penuh semangat, disertai rasa tanggung jawab sebagai santri.",
    "Menjaga nama baik diri sendiri dan Pesantren.",
    "Menaati semua peraturan dan tata tertib Pesantren.",
    "Bersedia menerima sanksi yang berlaku apabila saya melakukan pelanggaran terhadap tata tertib Pesantren.",
  ];
  for (let i = 0; i < santriCommitments.length; i++) {
    const lines = doc
      .setFontSize(10.5)
      .splitTextToSize(`${i + 1}. ${santriCommitments[i]}`, contentW - 8);
    doc.text(lines, margin + 5, y);
    y += lines.length * 5.5 + 1;
  }

  y += 5;

  const pageHeight2 = doc.internal.pageSize.getHeight();
  if (y + 70 > pageHeight2 - 40) { // Increased threshold slightly to account for the closing text
    doc.addPage();
    drawHeaderSync(doc);
    y = getContentStartY();
  }

  const closing2 =
    "Surat pernyataan ini saya buat dengan sebenar-benarnya dan atas persetujuan orangtua/wali.";
  doc.text(doc.splitTextToSize(closing2, contentW), margin, y);
  y += 12;

  // TTD Santri (Kanan) bermaterai
  const sigDateStr = `${authority.city}, ......................... 2026`;
  doc.setFontSize(10.5);
  const sigX1 = pageWidth - margin - 70;
  doc.text(sigDateStr, sigX1, y);
  doc.text("Pembuat Pernyataan,", sigX1, y + 7);
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(sigX1, y + 10, 35, 22);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Materai Rp10.000,-", sigX1 + 2, y + 22);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10.5);
  doc.setLineWidth(0.2);
  doc.line(sigX1, y + 40, sigX1 + 70, y + 40);
  doc.text("(Santri/Ananda)", sigX1 + 15, y + 46);

  drawFooter(doc);

  // ============================
  // HALAMAN 2: PAKTA INTEGRITAS ORANGTUA/WALI
  // ============================
  doc.addPage();
  await drawHeader(doc);

  y = startY + 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PAKTA INTEGRITAS ORANGTUA/WALI SANTRI", pageWidth / 2, y, {
    align: "center",
  });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text("Kami yang bertanda tangan di bawah ini:", margin, y);
  y += 8;

  const col1X = margin + 5;
  const col1Colon = col1X + 32;
  const col1Line = col1Colon + 3;
  
  const col2X = col1Line + 45;
  const col2Colon = col2X + 22;
  const col2Line = col2Colon + 3;
  
  doc.setFont("helvetica", "bold");
  doc.text("Nama Lengkap", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col1Colon, y);
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.2);
  doc.line(col1Line, y + 1, col2X - 5, y + 1);

  doc.setFont("helvetica", "bold");
  doc.text("Pekerjaan", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col2Colon, y);
  doc.line(col2Line, y + 1, pageWidth - margin, y + 1);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("Alamat Lengkap", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col1Colon, y);
  doc.line(col1Line, y + 1, col2X - 5, y + 1);

  doc.setFont("helvetica", "bold");
  doc.text("No. HP", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col2Colon, y);
  doc.line(col2Line, y + 1, pageWidth - margin, y + 1);
  y += 6;

  doc.text("Sebagai orangtua/wali dari santri/santriwati:", margin, y);
  y += 4.5;
  doc.setFont("helvetica", "bold");
  doc.text("Nama Santri", col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col1Colon, y);
  doc.text(toTitleCase(data.nama_lengkap || ""), col1Line, y);

  doc.setFont("helvetica", "bold");
  doc.text("Jenjang", col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", col2Colon, y);
  doc.text("MTs / I'dad Lughawiy / MA", col2Line, y);
  y += 3.5;
  doc.setFontSize(8);
  doc.text("*) coret yang tidak perlu", col2Line, y);
  doc.setFontSize(10.5);
  y += 4.5;

  const preamble2 =
    "Dengan sungguh-sungguh dan penuh kesadaran, menyatakan bahwa kami akan:";
  doc.text(doc.splitTextToSize(preamble2, contentW), margin, y);
  y += 7;

  const ortuCommitments = [
    "Berupaya menjadi teladan yang baik sesuai ketentuan syariat Islam.",
    "Berperan aktif dalam membimbing dan mengawasi putra/putri kami agar menaati semua peraturan dan tata tertib Pesantren.",
    "Membiayai pendidikan putra/putri kami selama masa pendidikan dengan penuh rasa tanggung jawab.",
    `Tidak mengajukan tuntutan hukum kepada pihak ${institution.name} atau tenaga pendidik Pesantren terkait tindakan edukatif yang dilakukan kepada putra/putri kami, sebagaimana diatur dalam PP No. 74 Tahun 2008 sebagaimana telah diubah dengan PP No. 19 Tahun 2017 tentang Guru, serta Permendikbud No. 10 Tahun 2017 tentang Perlindungan Bagi Pendidik dan Tenaga Kependidikan.`,
    "Bersedia mengikuti mekanisme dan aturan yang telah ditetapkan oleh Pesantren, baik dalam penyelenggaraan pendidikan di dalam kelas, pendidikan di luar kelas, maupun dalam hal-hal yang berkaitan dengan administrasi.",
    "Apabila kami dan putra/putri kami melanggar ketentuan yang telah ditetapkan oleh Pesantren, maka kami bersedia menerima sanksi yang berlaku, sesuai dengan Buku Pedoman Tata Tertib Santri.",
  ];
  for (let i = 0; i < ortuCommitments.length; i++) {
    const lines = doc
      .setFontSize(10.5)
      .splitTextToSize(`${i + 1}. ${ortuCommitments[i]}`, contentW - 8);
    doc.text(lines, margin + 5, y);
    y += lines.length * 4.6;
  }

  y += 2;

  const pageHeight3 = doc.internal.pageSize.getHeight();
  if (y + 60 > pageHeight3 - 40) { // Changed threshold from 70 to 60 because we compressed it and it safely fits
    doc.addPage();
    drawHeaderSync(doc);
    y = getContentStartY();
  }

  const closing3 =
    "Surat pernyataan ini kami buat dengan sebenar-benarnya dan tanpa ada paksaan dari pihak mana pun.";
  doc.text(doc.splitTextToSize(closing3, contentW), margin, y);
  y += 6;

  // TTD Orangtua (Kanan) bermaterai
  doc.setFontSize(10.5);
  const sigX2 = pageWidth - margin - 70;
  doc.text(sigDateStr, sigX2, y);
  doc.text("Pembuat Pernyataan,", sigX2, y + 7);
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(sigX2, y + 10, 35, 22);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Materai Rp10.000,-", sigX2 + 2, y + 22);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10.5);
  doc.setLineWidth(0.2);
  doc.line(sigX2, y + 40, sigX2 + 70, y + 40);
  doc.text("(Orangtua/Wali)", sigX2 + 15, y + 46);

  drawFooter(doc);
  if (typeof window !== "undefined") {
    doc.save(`AIIS_PaktaIntegritas_${data.nomor_pendaftaran}.pdf`);
  }
  return doc;
};
