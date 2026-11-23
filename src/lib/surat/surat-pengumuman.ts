/**
 * Surat Pengumuman Hasil Seleksi — penomoran resmi & generator PDF (server-side).
 * Pesantren Al-Imam Al-Islami (Khusus Putri) — Angkatan Pertama (001)
 * Format nomor: 001-<KODE>/SPMB-AIIS/<ROMAWI-BULAN>/<TAHUN>
 * KODE urut: AA..AZ lalu BA, BB, ... (2 huruf A-Z, basis 26).
 */
import { jsPDF } from "jspdf";
import { PDF_BRANDING } from "@/config/pdf-branding";
import { SURAT_PENGUMUMAN_CONFIG as CFG } from "@/config/surat-pengumuman";
import { prisma } from "@/lib/prisma";

const BULAN_ROMAWI = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
] as const;

// ============ PENOMORAN ============

/** Kode berikutnya: AA -> AB ... AZ -> BA ... ZZ -> null (habis). */
export function nextKodeSurat(kode: string): string | null {
  const chars = kode.toUpperCase().split("");
  if (chars.length !== 2 || chars.some((c) => c < "A" || c > "Z")) return null;
  const value = (chars[0].charCodeAt(0) - 65) * 26 + (chars[1].charCodeAt(0) - 65) + 1;
  if (value >= 26 * 26) return null;
  return String.fromCharCode(65 + Math.floor(value / 26)) + String.fromCharCode(65 + (value % 26));
}

export function firstKodeSurat(): string {
  return "AA";
}

export function buildNomorSurat(kode: string, tanggal: Date): string {
  const bulan = BULAN_ROMAWI[tanggal.getMonth()];
  const tahun = tanggal.getFullYear();
  return `${CFG.nomorPrefix}-${kode}/${CFG.nomorSuffix}/${bulan}/${tahun}`;
}

/** Kode dari nomor surat lengkap, atau null jika format beda. */
export function parseKodeSurat(nomor: string): string | null {
  const m = nomor.match(new RegExp(`^${CFG.nomorPrefix}-([A-Z]{2})/${CFG.nomorSuffix}/`));
  return m ? m[1] : null;
}

/** Ambil semua kode surat yang sudah terpakai: dari pengumuman + baseline manual di app_settings. */
export async function getKodeTerpakai(): Promise<string[]> {
  const rows = ((await (prisma.pengumuman as any).findMany?.({
    where: { nomor_surat: { not: null } },
    select: { nomor_surat: true },
  })) || []) as Array<{ nomor_surat?: string | null }>;
  const kodes: string[] = [];
  for (const r of rows) {
    if (r.nomor_surat) {
      const kode = parseKodeSurat(r.nomor_surat);
      if (kode) kodes.push(kode);
    }
  }
  const setting = await prisma.appSetting.findUnique({
    where: { key: "surat_nomor_terakhir" },
  });
  if (setting) {
    const kode = parseKodeSurat(setting.value);
    if (kode) kodes.push(kode);
  }
  return kodes;
}

export function nilaiKode(kode: string): number {
  return (kode.charCodeAt(0) - 65) * 26 + (kode.charCodeAt(1) - 65);
}

export function kodeDariNilai(v: number): string {
  return String.fromCharCode(65 + Math.floor(v / 26)) + String.fromCharCode(65 + (v % 26));
}

/**
 * Nomor surat berikutnya yang belum terpakai (menjalankan urutan AA, AB, ...).
 */
export async function getNextNomorSurat(tanggal: Date): Promise<{ kode: string; nomor: string }> {
  const terpakai = await getKodeTerpakai();
  let nilai = terpakai.length ? Math.max(...terpakai.map(nilaiKode)) + 1 : 0;
  const max = 26 * 26;
  while (nilai < max) {
    const kode = kodeDariNilai(nilai);
    const nomor = buildNomorSurat(kode, tanggal);
    const ada = await (prisma.pengumuman as any).findFirst?.({ where: { nomor_surat: nomor } });
    if (!ada) return { kode, nomor };
    nilai++;
  }
  throw new Error("Nomor surat untuk tahun ajaran ini sudah habis (melebihi ZZ).");
}

// ============ GENERATOR PDF ============

export interface SuratPengumumanData {
  nomorSurat: string;
  tanggalTerbit: Date; // UTC
  namaLengkap: string;
  nomorPendaftaran: string;
  kelasDiterima: string;
}

const imageCache: Record<string, string | null> = {};

async function loadImage(path: string): Promise<string | null> {
  if (!path) return null;
  if (imageCache[path] !== undefined) return imageCache[path];
  try {
    const fs = await import("fs/promises");
    const pathMod = await import("path");
    const filePath = pathMod.join(process.cwd(), "public", path);
    const data = await fs.readFile(filePath);
    const ext = pathMod.extname(path).slice(1).toLowerCase() || "png";
    const mime = ext === "jpg" || ext === "jpeg" ? "jpeg" : "png";
    imageCache[path] = `data:image/${mime};base64,${data.toString("base64")}`;
  } catch {
    imageCache[path] = null;
  }
  return imageCache[path];
}

function tanggalIndo(d: Date): string {
  const wib = new Date(d.getTime() + 7 * 3600 * 1000);
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${wib.getUTCDate()} ${bulan[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`;
}

function paragraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export async function generateSuratPengumumanPdf(
  data: SuratPengumumanData
): Promise<{ buffer: Buffer; filename: string }> {
  // Format Folio / F4: 215.9 x 330.2 mm
  const doc = new jsPDF({
    unit: "mm",
    format: [215.9, 330.2],
    orientation: "portrait",
  });

  const pageWidth = 215.9;
  const pageHeight = 330.2;
  const marginX = 22;
  const width = pageWidth - marginX * 2;

  // 1. Gambar Kop Surat Background (Full page)
  const bgImg =
    (await loadImage("/images/template-surat-pengumuman.jpg")) ||
    (await loadImage("/images/kop-surat-full.jpg"));
  if (bgImg) {
    doc.addImage(bgImg, "JPEG", 0, 0, pageWidth, pageHeight);
  }

  // 2. Teks Konten Surat
  let y = 70;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);

  doc.text(`No   : ${data.nomorSurat}`, marginX, y);
  y += 5.5;
  doc.text(`Hal  : ${CFG.hal}`, marginX, y);
  y += 9;

  for (const t of CFG.tujuan) {
    doc.text(t, marginX, y);
    y += 5;
  }
  y += 4;

  doc.setFont("helvetica", "italic");
  doc.text("Assalamu'alaikum Warahmatullahi Wabarakatuh,", marginX, y);
  y += 6.5;

  doc.setFont("helvetica", "normal");
  y = paragraph(
    doc,
    "Alhamdulillah segala puji bagi Allah Rabb semesta alam. Shalawat dan salam semoga tercurah kepada Rasulullah saw. keluarga, para sahabat, dan pengikutnya hingga akhir zaman.",
    marginX,
    y,
    width
  );
  y = paragraph(
    doc,
    `Kami berharap bapak/ibu wali calon santri ${PDF_BRANDING.institution.name} senantiasa dalam keadaan sehat serta dalam ketaatan yang diridhai Allah swt., amin.`,
    marginX,
    y,
    width
  );
  y = paragraph(
    doc,
    `Selanjutnya, Kami selaku Panitia Penerimaan Santri Baru ${PDF_BRANDING.institution.name} Tahun Pelajaran ${PDF_BRANDING.institution.academic_year} mengucapkan selamat kepada putra/putri Bapak/Ibu yang bernama:`,
    marginX,
    y,
    width
  );
  y += 2;

  // Blok identitas santri
  doc.setFont("helvetica", "bold");
  doc.text("Ananda", marginX + 8, y);
  doc.text(":", marginX + 45, y);
  doc.text(data.namaLengkap.toUpperCase(), marginX + 49, y);
  y += 6.5;
  doc.text("No. Pendaftaran", marginX + 8, y);
  doc.text(":", marginX + 45, y);
  doc.text(data.nomorPendaftaran, marginX + 49, y);
  y += 6.5;

  doc.setFont("helvetica", "bold");
  doc.text("DITERIMA", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    ` Sebagai Santri ${PDF_BRANDING.institution.name} Tahun Pelajaran ${PDF_BRANDING.institution.academic_year} di ${data.kelasDiterima}`,
    marginX + 20,
    y
  );
  y += 7;

  y = paragraph(
    doc,
    "Selanjutnya, diharapkan kepada orangtua/wali untuk melakukan pembayaran UANG PANGKAL.",
    marginX,
    y,
    width
  );
  y = paragraph(
    doc,
    "Demikian informasi ini kami sampaikan, semoga Allah swt. memudahkan kita dalam kebaikan, atas perhatiannya kami ucapkan terima kasih dan jazakumullohu khoiron katsiron.",
    marginX,
    y,
    width
  );
  y += 2;

  doc.setFont("helvetica", "italic");
  doc.text("Wassalamu'alaikum Warahmatullahi Wabarakatuh.", pageWidth / 2, y, { align: "center" });
  y += 12;

  // Tanda tangan (kanan)
  const sigX = pageWidth - 75;
  doc.setFont("helvetica", "normal");
  doc.text(`Sukabumi, ${tanggalIndo(data.tanggalTerbit)}`, sigX, y);
  y += 6;
  doc.text("Ketua Panitia,", sigX, y);

  const ttd = await loadImage("/images/ttd-ketua-panitia.png");
  const stempel = await loadImage(CFG.stampImage || PDF_BRANDING.assets.stamp);
  if (stempel) doc.addImage(stempel, "PNG", sigX - 12, y + 2, 30, 30);
  if (ttd) doc.addImage(ttd, "PNG", sigX + 2, y + 2, 30, 30);

  y += 34;
  doc.setFont("helvetica", "bold");
  doc.text(CFG.ketuaPanitia, sigX, y);

  // NB ketentuan uang pangkal (kiri bawah)
  let ny = Math.max(y - 20, 236);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(CFG.nb.judul, marginX, ny);
  ny += 4.5;
  doc.text(CFG.nb.subJudul, marginX, ny);
  ny += 4.5;
  doc.setFont("helvetica", "normal");
  for (const poin of CFG.nb.poin) {
    const lines = doc.splitTextToSize(poin, width);
    doc.text(lines, marginX, ny);
    ny += lines.length * 4 + 0.5;
  }

  const filename = `Surat Pengumuman Hasil SPMB 2027-2028 ${data.namaLengkap}.pdf`;
  return { buffer: Buffer.from(doc.output("arraybuffer")), filename };
}
