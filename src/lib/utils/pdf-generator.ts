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

/**
 * Standard Header for all Institutional Documents
 */
const drawHeader = async (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { coords, assets, institution } = PDF_BRANDING;

  // 1. Logo
  try {
    const logoBase64 = await fetchImageAsBase64(assets.logo);
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
  } catch (e) {
    console.warn("Logo not loaded in header:", e);
  }

  // 2. Vertical Separator Bar
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(coords.header.vertical_bar.width);
  doc.line(
    coords.header.vertical_bar.x1,
    coords.header.vertical_bar.y1,
    coords.header.vertical_bar.x2,
    coords.header.vertical_bar.y2,
  );

  // 3. Institution Info
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

  // 4. Horizontal Separator
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(coords.header.horizontal_sep.thickness_thick);
  doc.line(
    18,
    coords.header.horizontal_sep.y_thick,
    pageWidth - 18,
    coords.header.horizontal_sep.y_thick,
  );
  doc.setLineWidth(coords.header.horizontal_sep.thickness_thin);
  doc.line(
    18,
    coords.header.horizontal_sep.y_thin,
    pageWidth - 18,
    coords.header.horizontal_sep.y_thin,
  );

  doc.setTextColor(0, 0, 0);
};

/**
 * Standard Footer for all Institutional Documents
 */
const drawFooter = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Dicetak secara sistem melalui website PPDB Al Imam pada: ${new Date().toLocaleString("id-ID")}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" },
  );
};

/**
 * Standard Formal Signature Section (TTD + Stempel)
 */
const drawFormalSignature = async (doc: jsPDF, y: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { authority, assets, coords } = PDF_BRANDING;
  const xBase = pageWidth - coords.signature.margin_right;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    `${authority.city}, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    xBase,
    y,
  );
  doc.text(authority.role + ",", xBase, y + 6);

  // Load and add images
  const stempel = await fetchImageAsBase64(assets.stamp);
  const ttd = await fetchImageAsBase64(assets.signature);

  if (stempel) {
    doc.addImage(
      stempel,
      "PNG",
      xBase - 20,
      y + 10,
      coords.signature.stamp.w,
      coords.signature.stamp.h,
    );
  }
  if (ttd) {
    doc.addImage(
      ttd,
      "PNG",
      xBase + 10,
      y + 10,
      coords.signature.ttd.w,
      coords.signature.ttd.h,
    );
  }

  doc.setFont("helvetica", "bold");
  doc.text(authority.name, xBase, y + 45);
};

/**
 * Generate Bukti Pendaftaran PDF
 */
export const generateBuktiPendaftaran = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  await drawHeader(doc);

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BUKTI PENDAFTARAN", pageWidth / 2, 55, { align: "center" });

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
    startY: 65,
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
  doc.save(`PPDB_BuktiPendaftaran_${data.nomor_pendaftaran}.pdf`);
  return doc;
};

/**
 * Generate kartu seleksi PDF
 */
export const generateKartuUjian = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  await drawHeader(doc);

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("KARTU PESERTA UJIAN", pageWidth / 2, 55, { align: "center" });

  // Photo Box
  doc.setDrawColor(200, 200, 200);
  doc.rect(pageWidth - 54, 65, 40, 50);
  doc.setFontSize(8);
  doc.text("FOTO 3x4", pageWidth - 34, 90, { align: "center" });

  const tableData = [
    ["No. Peserta", `: ${data.nomor_pendaftaran}`],
    ["Nama Lengkap", `: ${toTitleCase(data.nama_lengkap)}`],
    ["NIK", `: ${data.nik}`],
    ["Jenjang", `: ${data.jenjang}`],
    ["Jadwal Seleksi", `: ${data.jadwal_ujian || "Menunggu Konfirmasi"}`],
    ["Lokasi", `: ${data.lokasi_ujian || "Kampus Al Imam"}`],
  ];

  autoTable(doc, {
    startY: 65,
    body: tableData,
    theme: "plain",
    margin: { right: 65 },
    styles: { fontSize: 11, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // Use official signature area
  await drawFormalSignature(doc, finalY);

  drawFooter(doc);
  doc.save(`PPDB_KartuUjian_${data.nomor_pendaftaran}.pdf`);
  return doc;
};

const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
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
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/**
 * Generate Surat Kelulusan
 */
export const generateSuratKelulusan = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  await drawHeader(doc);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SURAT KETERANGAN HASIL SELEKSI", pageWidth / 2, 60, {
    align: "center",
  });
  doc.setFontSize(10);
  doc.text(
    `Nomor: ${data.nomor_pendaftaran}/SKL-PPDB/${new Date().getFullYear()}`,
    pageWidth / 2,
    66,
    { align: "center" },
  );

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const content = `Berdasarkan hasil seleksi Penerimaan Santri Baru (PPDB) Tahun Ajaran ${data.tahun_ajaran}, dengan ini Panitia menyatakan bahwa:`;
  doc.text(doc.splitTextToSize(content, pageWidth - 40), 20, 80);

  const tableData = [
    ["Nomor Pendaftaran", `: ${data.nomor_pendaftaran}`],
    ["Nama Lengkap", `: ${toTitleCase(data.nama_lengkap)}`],
    ["NIK", `: ${data.nik}`],
    ["Jenjang Pendidikan", `: ${data.jenjang}`],
  ];

  autoTable(doc, {
    startY: 90,
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
    "Selamat bergabung menjadi keluarga besar Pesantren Al Andalus Al Imam. Silakan segera melakukan proses daftar ulang sesuai jadwal yang ditentukan.";
  if (statusText === "CADANGAN")
    closing =
      "Anda masuk dalam daftar cadangan. Panitia akan menghubungi Anda jika terdapat kuota yang kosong.";
  if (statusText === "BELUM DITERIMA")
    closing =
      "Tetap semangat dan jangan berkecil hati. Anda dapat kembali mendaftar pada gelombang atau periode berikutnya.";

  doc.text(doc.splitTextToSize(closing, pageWidth - 40), 20, finalY + 25);

  // Add Enrollment Info for Accepted Candidates
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

  // Signature Area
  await drawFormalSignature(doc, finalY + 65);

  drawFooter(doc);
  doc.save(`PPDB_SuratHasilSeleksi_${data.nomor_pendaftaran}.pdf`);
  return doc;
};

// ============================================================
// DOKUMEN TEMPLATE UNTUK CALON SANTRI
// ============================================================

/**
 * Helper untuk menggambar tabel isian (formulir) dengan kolom label dan garis kosong
 */
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
  // Draw dotted line for fill-in
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.2);
  doc.line(x + 52, y + 1, x + 52 + lineWidth, y + 1);
};

/**
 * Generate Surat Pengantar Pemeriksaan Kesehatan (Template)
 */
export const generateSuratKesehatan = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const { institution, authority } = PDF_BRANDING;
  const margin = 18;
  const contentW = pageWidth - margin * 2;

  // === HALAMAN 1: SURAT PENGANTAR ===
  await drawHeader(doc);

  // Reference info
  let y = 56;
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);

  // Lampiran & Hal
  const leftColX = margin;
  const colonX = margin + 20;
  doc.text("Lamp.", leftColX, y);
  doc.text(":", colonX, y);
  doc.text("1 Lembar", colonX + 4, y);
  y += 6;
  doc.text("Hal", leftColX, y);
  doc.text(":", colonX, y);
  doc.setFont("helvetica", "bold");
  const halText = `Pemeriksaan Kesehatan Calon Santri Baru\n${institution.name} ${authority.city}`;
  doc.text(halText, colonX + 4, y);
  doc.setFont("helvetica", "normal");

  y += 18;
  doc.text("Kepada Yth.", leftColX, y);
  y += 6;
  doc.text("Petugas Kesehatan Puskesmas/Rumah Sakit", leftColX, y);
  y += 6;
  doc.text(".............................................", leftColX, y);
  y += 6;
  doc.text("Di Tempat", leftColX, y);

  y += 12;
  doc.setFont("helvetica", "italic");
  doc.text("Dengan hormat,", leftColX, y);
  doc.setFont("helvetica", "normal");

  y += 8;
  const intro = `Sehubungan dengan kegiatan penerimaan calon santri baru ${institution.name} ${authority.city} Tahun Pelajaran 2026/2027, kami selaku panitia membutuhkan pemeriksaan kesehatan bagi para calon santri sebagai salah satu bagian dari rangkaian proses seleksi.`;
  const introLines = doc.splitTextToSize(intro, contentW);
  doc.text(introLines, leftColX, y);
  y += introLines.length * 5.5 + 4;

  const intro2 =
    "Untuk itu, kami mohon kesediaan Bapak/Ibu untuk melakukan pemeriksaan kesehatan bagi calon santri dengan identitas berikut:";
  const intro2Lines = doc.splitTextToSize(intro2, contentW);
  doc.text(intro2Lines, leftColX, y);
  y += intro2Lines.length * 5.5 + 4;

  // Data calon santri
  const fields1 = [
    [
      "Nama",
      data.nama_lengkap
        ? toTitleCase(data.nama_lengkap)
        : "..................................................",
    ],
    [
      "Nomor Pendaftaran",
      data.nomor_pendaftaran ||
        "..................................................",
    ],
    [
      "Tempat, Tanggal Lahir",
      data.tempat_lahir && data.tanggal_lahir
        ? `${data.tempat_lahir}, ${data.tanggal_lahir}`
        : "..................................................",
    ],
    [
      "Alamat",
      data.alamat || "..................................................",
    ],
  ];
  for (const [label, value] of fields1) {
    doc.setFont("helvetica", "bold");
    doc.text(label, leftColX + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(":", leftColX + 54, y);
    doc.text(value, leftColX + 57, y);
    y += 6;
  }

  y += 6;
  doc.text("Jenis pemeriksaan kesehatan yang dibutuhkan adalah:", leftColX, y);
  y += 7;
  const checks = [
    "Riwayat Penyakit (Anamnesis)",
    "Pemeriksaan Fisik (Physical Test)",
    "Pemeriksaan Tajam Penglihatan (Visus) dan Buta Warna",
  ];
  for (const item of checks) {
    doc.text(`${item}`, leftColX + 5, y);
    y += 6;
  }

  y += 4;
  const note =
    "Catatan: Bila visus tidak normal, mohon dilengkapi dengan nilai negatif, positif, atau nilai silindrisnya (contoh: V.OD/V.OS: -1/-0,5).";
  const noteLines = doc.splitTextToSize(note, contentW - 5);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.text(noteLines, leftColX + 5, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  y += noteLines.length * 5 + 5;

  const closing1 =
    "Hasil pemeriksaan dapat diisikan pada formulir terlampir. Seluruh biaya pemeriksaan kesehatan dibebankan kepada calon santri yang bersangkutan, dengan mekanisme yang ditentukan oleh pihak Rumah Sakit/Puskesmas.";
  const closing1Lines = doc.splitTextToSize(closing1, contentW);
  doc.text(closing1Lines, leftColX, y);
  y += closing1Lines.length * 5.5 + 6;

  doc.setFont("helvetica", "italic");
  doc.text(
    "Demikian yang dapat kami sampaikan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.",
    leftColX,
    y,
  );
  doc.setFont("helvetica", "normal");

  // Signature kiri MUDIR (Ketua Panitia)
  await drawFormalSignature(doc, y + 12);

  drawFooter(doc);

  // === HALAMAN 2: FORMULIR PEMERIKSAAN ===
  doc.addPage();
  await drawHeader(doc);

  y = 56;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("FORMULIR HASIL PEMERIKSAAN KESEHATAN", pageWidth / 2, y, {
    align: "center",
  });
  y += 7;
  doc.setFontSize(11);
  doc.text(
    `CALON SANTRI BARU ${institution.name} ${authority.city.toUpperCase()}`,
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

  // Identitas
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
        "Ket: Ringan – Sedang – Berat",
      ],
      [
        "Apakah pernah menderita TBC?",
        "Tidak / Ya",
        "Ket: Sembuh – Proses Pengobatan",
      ],
      [
        "Apakah pernah menderita hepatitis?",
        "Tidak / Ya",
        "Ket: Sembuh – Proses Pengobatan",
      ],
      [
        "Apakah ada riwayat epilepsi?",
        "Tidak / Ya",
        "Ket: Sembuh – Proses Pengobatan",
      ],
      ["Apakah cocok tinggal di daerah dingin?", "Tidak / Ya", ""],
    ],
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [30, 60, 120], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 65 },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("B. Hasil Pemeriksaan Fisik", leftColX, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Pemeriksaan", "Hasil", "Ket.", "Pemeriksaan", "Hasil", "Ket."]],
    body: [
      ["Keadaan Umum", "", "", "Leher", "", ""],
      [
        "Tinggi Badan",
        "...... cm",
        "",
        "Kelenjar Gondok",
        "Normal / Ada kelainan",
        "",
      ],
      ["Berat Badan", "...... kg", "", "Dada", "", ""],
      [
        "Tekanan Darah",
        "...... mmHg",
        "",
        "Jantung",
        "Normal / Ada kelainan",
        "",
      ],
      ["Kepala", "", "", "Paru-Paru", "Normal / Ada kelainan", ""],
      [
        "Mata / Visus Kanan",
        ".......",
        "",
        "Perut / Hepar",
        "Normal / Ada kelainan",
        "",
      ],
      ["Visus Kiri", ".......", "", "Limpa", "Normal / Ada kelainan", ""],
      [
        "Pakai Kacamata",
        "Ya / Tidak",
        "",
        "Hernia",
        "Normal / Ada kelainan",
        "",
      ],
      [
        "Buta Warna",
        "Ya / Tidak",
        "",
        "Anus & Rektum / Hemoroid",
        "Ada / Tidak ada",
        "",
      ],
      [
        "Telinga / Membran Timpani",
        "Normal / Ada kelainan",
        "",
        "Ekstremitas Atas",
        "Normal / Ada kelainan",
        "",
      ],
      [
        "Serumen",
        "Ada / Tidak ada",
        "",
        "Ekstremitas Bawah",
        "Normal / Ada kelainan",
        "",
      ],
      [
        "Bekas Tindik",
        "Normal / Ada kelainan",
        "",
        "Kulit / Penyakit Kulit",
        "Ada / Tidak ada",
        "",
      ],
      [
        "Hidung / Polip",
        "Normal / Ada kelainan",
        "",
        "Varises",
        "Ada / Tidak ada",
        "",
      ],
      ["Tenggorokan / Tonsil", "Normal / Ada kelainan", "", "", "", ""],
      ["Faring", "Normal / Ada kelainan", "", "", "", ""],
    ],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 60, 120], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 22 },
      2: { cellWidth: 10 },
      3: { cellWidth: 40 },
      4: { cellWidth: 38 },
      5: { cellWidth: 10 },
    },
    margin: { left: margin, right: margin },
  });

  const finalY2 = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Telah melakukan pemeriksaan dengan benar, dan data yang kami lampirkan adalah sesuai dengan hasil pemeriksaan.",
    leftColX,
    finalY2,
  );

  // TTD Dokter - di sebelah kiri bawah
  const sigY = finalY2 + 10;
  doc.setFontSize(10.5);
  doc.text("................., ...................... 2026", leftColX, sigY);
  doc.text("Dokter Pemeriksa,", leftColX, sigY + 6);
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  // Box TTD dokter
  doc.rect(leftColX, sigY + 8, 60, 30);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("(Tanda Tangan & Stempel)", leftColX + 7, sigY + 25);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10.5);
  doc.text("dr. .................................", leftColX, sigY + 44);
  doc.text("NIP. ................................", leftColX, sigY + 50);

  drawFooter(doc);
  doc.save(`AIIS_SuratKesehatan_${data.nomor_pendaftaran}.pdf`);
  return doc;
};

/**
 * Generate Surat Pernyataan Orangtua/Wali (Template)
 */
export const generateSuratPernyataan = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const { authority } = PDF_BRANDING;
  const margin = 20;
  const contentW = pageWidth - margin * 2;

  await drawHeader(doc);

  let y = 56;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SURAT PERNYATAAN ORANGTUA/WALI SANTRI", pageWidth / 2, y, {
    align: "center",
  });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text("Saya yang bertanda tangan di bawah ini:", margin, y);
  y += 8;

  const parentFields = [
    ["Nama", ""],
    ["Pekerjaan", ""],
    ["Alamat", ""],
    ["No. HP", ""],
  ];
  for (const [label] of parentFields) {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(":", margin + 40, y);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.line(margin + 43, y + 1, pageWidth - margin, y + 1);
    y += 7;
  }

  y += 5;
  doc.text("Sebagai orangtua/wali dari calon santri/santriwati:", margin, y);
  y += 8;

  const santriFields = [
    ["Nama", data.nama_lengkap ? toTitleCase(data.nama_lengkap) : ""],
    ["Jenjang", "MTs / I'dad Lughawiy / SMA  *) coret yang tidak perlu"],
  ];
  for (const [label, value] of santriFields) {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(":", margin + 40, y);
    if (value) {
      doc.text(value, margin + 43, y);
    } else {
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.2);
      doc.line(margin + 43, y + 1, pageWidth - margin, y + 1);
    }
    y += 7;
  }

  y += 5;
  const mainText =
    "Dengan ini menyatakan bahwa apabila di kemudian hari diketahui putra/putri kami melakukan atau terlibat dalam salah satu perilaku berikut:";
  doc.text(doc.splitTextToSize(mainText, contentW), margin, y);
  y += 14;

  const violations = [
    "LGBT atau hubungan sesama jenis",
    "Merokok",
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
    y += lines.length * 5.5;
  }

  y += 5;
  const consequence =
    "Maka kami menyatakan bersedia dengan ikhlas apabila putra/putri kami dikembalikan kepada kami hingga benar-benar dinyatakan pulih dan layak untuk kembali tinggal di lingkungan Pesantren, yang dibuktikan dengan surat keterangan dari psikolog atau tenaga ahli yang berwenang.";
  const consequenceLines = doc.splitTextToSize(consequence, contentW);
  doc.text(consequenceLines, margin, y);
  y += consequenceLines.length * 5.5 + 6;

  doc.setFont("helvetica", "bold");
  doc.text("Catatan mengenai kondisi kesehatan:", margin, y);
  doc.setFont("helvetica", "normal");
  y += 7;
  const healthNote =
    "Apabila putra/putri kami diketahui menderita penyakit kronis (antara lain: jantung, ginjal, HIV/AIDS, TBC, infeksi selaput otak, difteri, kanker, diabetes, atau epilepsi), kami bersedia segera dihubungi oleh pihak Pesantren untuk bersama-sama menentukan langkah terbaik demi keselamatan dan kenyamanan putra/putri kami serta seluruh warga Pesantren.";
  const healthNoteLines = doc.splitTextToSize(healthNote, contentW);
  doc.text(healthNoteLines, margin, y);
  y += healthNoteLines.length * 5.5 + 8;

  // TTD Orangtua (kiri) + TTD Mudir (kanan)
  const dateStr = `${authority.city}, ......................... 2026`;
  // Orangtua (kiri)
  doc.setFontSize(10.5);
  doc.text(dateStr, margin, y);
  doc.text("Pembuat Pernyataan,", margin, y + 7);
  // Materai box
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(margin, y + 10, 35, 22);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Materai Rp10.000,-", margin + 2, y + 22);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10.5);
  // Name line
  doc.setLineWidth(0.2);
  doc.line(margin, y + 40, margin + 70, y + 40);
  doc.text("(Orangtua/Wali)", margin + 10, y + 46);

  drawFooter(doc);
  doc.save(`AIIS_SuratPernyataan_${data.nomor_pendaftaran}.pdf`);
  return doc;
};

/**
 * Generate Pakta Integritas Santri dan Orangtua/Wali (Template, 2 Halaman)
 */
export const generatePaktaIntegritas = async (data: PendaftarPdfData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const { authority } = PDF_BRANDING;
  const margin = 20;
  const contentW = pageWidth - margin * 2;

  // === HALAMAN 1: PAKTA INTEGRITAS SANTRI ===
  await drawHeader(doc);

  let y = 56;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PAKTA INTEGRITAS SANTRI", pageWidth / 2, y, { align: "center" });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text("Saya yang bertanda tangan di bawah ini:", margin, y);
  y += 8;

  const santriFields2 = [
    ["Nama Lengkap", data.nama_lengkap ? toTitleCase(data.nama_lengkap) : ""],
    ["Jenjang", "MTs / I'dad Lughawiy / SMA  *) coret yang tidak perlu"],
    ["Tahun Pelajaran", "2026/2027"],
    ["Alamat Lengkap", ""],
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
    "Dengan sungguh-sungguh dan penuh kesadaran, selama saya menjadi santri di Pesantren Al Andalus Al Imam, menyatakan bahwa saya akan:";
  doc.text(doc.splitTextToSize(preamble1, contentW), margin, y);
  y += 13;

  const santriCommitments = [
    "Melaksanakan tuntunan syariat Islam.",
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
  const closing2 =
    "Surat pernyataan ini saya buat dengan sebenar-benarnya dan atas persetujuan orangtua/wali.";
  doc.text(doc.splitTextToSize(closing2, contentW), margin, y);
  y += 12;

  // TTD Santri (kiri) + TTD Mudir (kanan)
  const sigDateStr = `${authority.city}, ......................... 2026`;
  // Santri (kiri)
  doc.setFontSize(10.5);
  doc.text(sigDateStr, margin, y);
  doc.text("Pembuat Pernyataan,", margin, y + 7);
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(margin, y + 10, 35, 22);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Materai Rp10.000,-", margin + 2, y + 22);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10.5);
  doc.setLineWidth(0.2);
  doc.line(margin, y + 40, margin + 75, y + 40);
  doc.text("(Santri/Ananda)", margin + 12, y + 46);

  drawFooter(doc);

  // === HALAMAN 2: PAKTA INTEGRITAS ORANGTUA ===
  doc.addPage();
  await drawHeader(doc);

  y = 56;
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

  const ortuFields = [
    ["Nama Lengkap", ""],
    ["Alamat Lengkap", ""],
    ["No. HP / WhatsApp", ""],
    ["Pekerjaan", ""],
  ];
  for (const [label] of ortuFields) {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(":", margin + 50, y);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.line(margin + 53, y + 1, pageWidth - margin, y + 1);
    y += 7;
  }

  y += 5;
  doc.text("Sebagai orangtua/wali dari santri/santriwati:", margin, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Nama Santri", margin + 5, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", margin + 50, y);
  doc.text(
    data.nama_lengkap
      ? toTitleCase(data.nama_lengkap)
      : ".................................",
    margin + 53,
    y,
  );
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Jenjang", margin + 5, y);
  doc.setFont("helvetica", "normal");
  doc.text(":", margin + 50, y);
  doc.text(
    "MTs / I'dad Lughawiy / SMA  *) coret yang tidak perlu",
    margin + 53,
    y,
  );
  y += 10;

  const preamble2 =
    "Dengan sungguh-sungguh dan penuh kesadaran, menyatakan bahwa kami akan:";
  doc.text(doc.splitTextToSize(preamble2, contentW), margin, y);
  y += 9;

  const ortuCommitments = [
    "Berupaya menjadi teladan yang baik sesuai ketentuan syariat Islam.",
    "Berperan aktif dalam membimbing dan mengawasi putra/putri kami agar menaati semua peraturan dan tata tertib Pesantren.",
    "Membiayai pendidikan putra/putri kami selama masa pendidikan dengan penuh rasa tanggung jawab.",
    "Tidak mengajukan tuntutan hukum kepada pihak Pesantren Al Andalus Al Imam Sukabumi atau tenaga pendidik Pesantren terkait tindakan edukatif yang dilakukan kepada putra/putri kami, sebagaimana diatur dalam PP No. 74 Tahun 2008 sebagaimana telah diubah dengan PP No. 19 Tahun 2017 tentang Guru, serta Permendikbud No. 10 Tahun 2017 tentang Perlindungan Bagi Pendidik dan Tenaga Kependidikan.",
    "Bersedia mengikuti mekanisme dan aturan yang telah ditetapkan oleh Pesantren, baik dalam penyelenggaraan pendidikan di dalam kelas, pendidikan di luar kelas, maupun dalam hal-hal yang berkaitan dengan administrasi.",
    "Apabila kami dan putra/putri kami melanggar ketentuan yang telah ditetapkan oleh Pesantren, maka kami bersedia menerima sanksi yang berlaku, sesuai dengan Buku Pedoman Tata Tertib Santri.",
  ];
  for (let i = 0; i < ortuCommitments.length; i++) {
    const lines = doc
      .setFontSize(10.5)
      .splitTextToSize(`${i + 1}. ${ortuCommitments[i]}`, contentW - 8);
    doc.text(lines, margin + 5, y);
    y += lines.length * 5.5 + 1;
  }

  y += 5;
  const closing3 =
    "Surat pernyataan ini kami buat dengan sebenar-benarnya dan tanpa ada paksaan dari pihak mana pun.";
  doc.text(doc.splitTextToSize(closing3, contentW), margin, y);
  y += 12;

  // TTD Orangtua (kiri) bermaterai
  doc.setFontSize(10.5);
  doc.text(sigDateStr, margin, y);
  doc.text("Pembuat Pernyataan,", margin, y + 7);
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(margin, y + 10, 35, 22);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Materai Rp10.000,-", margin + 2, y + 22);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10.5);
  doc.setLineWidth(0.2);
  doc.line(margin, y + 40, margin + 75, y + 40);
  doc.text("(Orangtua/Wali)", margin + 12, y + 46);

  drawFooter(doc);
  doc.save(`AIIS_PaktaIntegritas_${data.nomor_pendaftaran}.pdf`);
  return doc;
};
