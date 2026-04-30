import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const BRAND_NAME = "Pesantren Sistem PPDB Modern";
const BRAND_SUBTITLE = "Penerimaan Santri Baru (PPDB)";
const BRAND_ADDRESS = "Jl. Karamat No. 123, Gunungpuyuh, Kota Sukabumi, Jawa Barat";

const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const drawHeader = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Box Decor
    doc.setFillColor(126, 27, 34); // Maroon-700 (#7E1B22)
    doc.rect(0, 0, pageWidth, 40, "F");

    // Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(BRAND_NAME, pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(BRAND_SUBTITLE, pageWidth / 2, 26, { align: "center" });

    doc.setFontSize(8);
    doc.text(BRAND_ADDRESS, pageWidth / 2, 33, { align: "center" });

    doc.setTextColor(0, 0, 0); // Reset text color
};

const drawFooter = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Dicetak secara sistem melalui website PPDB PPDB pada: ${new Date().toLocaleString("id-ID")}`, pageWidth / 2, pageHeight - 10, { align: "center" });
};

/**
 * Generate Bukti Pendaftaran PDF
 */
export const generateBuktiPendaftaran = (data: PendaftarPdfData) => {
    const doc = new jsPDF();
    drawHeader(doc);

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("BUKTI PENDAFTARAN", pageWidth / 2, 55, { align: "center" });

    const tableData = [
        ["Nomor Pendaftaran", `: ${data.nomor_pendaftaran}`],
        ["Nama Lengkap", `: ${toTitleCase(data.nama_lengkap)}`],
        ["NIK", `: ${data.nik}`],
        ["Jenjang Pendidikan", `: ${data.jenjang}`],
        ["Tempat, Tgl Lahir", `: ${data.tempat_lahir || "-"}, ${data.tanggal_lahir || "-"}`],
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

    // Instructions
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Petunjuk Selanjutnya:", 14, finalY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const instructions = [
        "1. Simpan dokumen ini sebagai bukti pendaftaran resmi.",
        "2. Lakukan pelunasan biaya pendaftaran jika belum dilakukan.",
        "3. Lengkapi seluruh biodata dan unggah berkas wajib di dashboard.",
        "4. Pantau dashboard secara berkala untuk jadwal ujian seleksi.",
        "5. Hubungi Panitia via WhatsApp jika ada kendala.",
    ];

    doc.text(instructions, 14, finalY + 8);

    drawFooter(doc);
    doc.save(`PPDB_BuktiPendaftaran_${data.nomor_pendaftaran}.pdf`);
};

/**
 * Generate Kartu Ujian PDF
 */
export const generateKartuUjian = (data: PendaftarPdfData) => {
    const doc = new jsPDF();
    drawHeader(doc);

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
        ["Jadwal Ujian", `: ${data.jadwal_ujian || "Menunggu Konfirmasi"}`],
        ["Lokasi", `: ${data.lokasi_ujian || "Kampus PPDB"}`],
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

    // Admin Signature Space
    doc.setFontSize(10);
    doc.text("Panitia PPDB,", pageWidth - 60, finalY);
    doc.text("Ponpes Sistem PPDB Modern", pageWidth - 60, finalY + 5);
    doc.text("(............................)", pageWidth - 60, finalY + 30);

    drawFooter(doc);
    doc.save(`PPDB_KartuUjian_${data.nomor_pendaftaran}.pdf`);
};

const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        if (blob.type !== 'image/png' && blob.type !== 'image/jpeg') return null;
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
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
    
    // Try to load Kop Surat
    const kopSurat = await fetchImageAsBase64('/images/kop-surat.png');
    if (kopSurat) {
        // Adjust height accordingly for your actual proportional kop surat
        doc.addImage(kopSurat, 'PNG', 0, 0, pageWidth, 40);
    } else {
        drawHeader(doc);
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("SURAT KETERANGAN HASIL SELEKSI", pageWidth / 2, 60, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Nomor: ${data.nomor_pendaftaran}/SKL-PPDB/${new Date().getFullYear()}`, pageWidth / 2, 66, { align: "center" });

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
    
    // Support for Cadangan / Ditolak if needed, though this is primarily for LULUS
    let statusText = "LULUS / DITERIMA";
    if (data.status_kelulusan === "cadangan") statusText = "CADANGAN";
    if (data.status_kelulusan === "ditolak" || data.status_kelulusan === "rejected") statusText = "BELUM DITERIMA";
    
    doc.text(`DINYATAKAN: ${statusText}`, pageWidth / 2, finalY + 10, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    let closing = "Selamat bergabung menjadi keluarga besar Pesantren Sistem PPDB Modern. Silakan segera melakukan proses daftar ulang sesuai jadwal yang ditentukan.";
    if (statusText === "CADANGAN") closing = "Anda masuk dalam daftar cadangan. Panitia akan menghubungi Anda jika terdapat kuota yang kosong.";
    if (statusText === "BELUM DITERIMA") closing = "Tetap semangat dan jangan berkecil hati. Anda dapat kembali mendaftar pada gelombang atau periode berikutnya.";
    
    doc.text(doc.splitTextToSize(closing, pageWidth - 40), 20, finalY + 25);
    
    // Add Enrollment Info for Accepted Candidates
    if (statusText === "LULUS / DITERIMA") {
        const daftarUlangInfo = "Pembayaran daftar ulang harus segera dibayarkan minimal 50% paling lambat sepekan setelah pengumuman hasil. Bagi yang membutuhkan keringanan, silakan menghubungi bagian Finance di 0812-2063-6945.";
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(doc.splitTextToSize(daftarUlangInfo, pageWidth - 40), 20, finalY + 40);
    }

    // Signature and Stamp Area
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Mudir Pondok Pesantren,", pageWidth - 80, finalY + 65);

    const stempel = await fetchImageAsBase64('/images/stempel-pesantren.png') || await fetchImageAsBase64('/images/stempel-pesantren.jpg');
    const ttd = await fetchImageAsBase64('/images/ttd-mudir.png') || await fetchImageAsBase64('/images/ttd-mudir.jpg');

    if (stempel) {
        doc.addImage(stempel, 'PNG', pageWidth - 100, finalY + 70, 30, 30);
    }
    if (ttd) {
        doc.addImage(ttd, 'PNG', pageWidth - 70, finalY + 70, 30, 30);
    }

    doc.setFont("helvetica", "bold");
    doc.text("Mudir PPDB", pageWidth - 80, finalY + 105);

    drawFooter(doc);
    doc.save(`PPDB_SuratHasilSeleksi_${data.nomor_pendaftaran}.pdf`);
};
