"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Check,
  HelpCircle,
  CreditCard,
  Clock,
  Shield,
  Star,
  Copy,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { BRANDING } from "@/config/branding";
import { PPDB_CONFIG } from "@/config/ppdb-config";

// ========================================
// REUSABLE COMPONENTS
// ========================================

const StatCard = ({
  icon: Icon,
  value,
  label,
  delay = 0,
}: {
  icon: any;
  value: string;
  label: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white p-6 sm:p-5 md:p-8 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all text-center group"
  >
    <div className="w-14 h-14 mx-auto bg-emerald-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
      <Icon className="w-7 h-7 text-emerald-700" />
    </div>
    <div className="font-extrabold text-lg sm:text-2xl md:text-3xl text-slate-900 mb-1 leading-tight break-words">
      {value}
    </div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
      {label}
    </div>
  </motion.div>
);

const TimelineItem = ({ item, index }: { item: any; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="relative pl-12 md:pl-20 pb-12 last:pb-0"
  >
    {/* Line */}
    <div className="absolute left-[23px] md:left-[31px] top-0 bottom-0 w-0.5 bg-emerald-100" />

    {/* Dot */}
    <div
      className={`absolute left-0 top-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl border-4 flex items-center justify-center bg-white z-10 shadow-sm transition-all duration-500 ${
        item.status === "active"
          ? "border-emerald-600 text-emerald-700"
          : "border-slate-200 text-slate-400"
      }`}
    >
      <span className="text-xl md:text-2xl font-black">{index + 1}</span>
      {item.status === "active" && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 rounded-full border-2 border-white"
        />
      )}
    </div>

    {/* Card */}
    <div className="bg-white p-6 sm:p-7 md:p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
          {item.phase}
        </h3>
        <span
          className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            item.status === "active"
              ? "bg-emerald-100 text-emerald-900"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {item.date}
        </span>
      </div>
      <p className="text-base text-slate-600 leading-relaxed font-normal text-left">
        {item.desc}
      </p>
    </div>
  </motion.div>
);

export default function SPMBInfoPage() {
  const [copiedBank, setCopiedBank] = useState(false);
  const handleCopyRekening = (rek: string) => {
    navigator.clipboard.writeText(rek);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { label: "Jenjang Pendidikan", value: "SMP & SMA", icon: GraduationCap },
    { label: "Kompleks Asrama", value: "Putra & Putri Terpisah", icon: Users },
    { label: "Kurikulum Terpadu", value: "Nasional & Turots", icon: BookOpen },
    { label: "Tahun Ajaran", value: BRANDING.academicYear, icon: Calendar },
  ];

  const timeline = [
    {
      phase: "Registrasi Online",
      date: "24 Oktober - 20 Desember 2026",
      desc: "Daftar dan buat akun pendaftar secara mudah melalui website resmi SPMB.",
      status: "active",
    },
    {
      phase: "Membayar Biaya Pendaftaran",
      date: "Setelah Registrasi",
      desc: `Lakukan pembayaran biaya pendaftaran sebesar Rp 250.000 via Transfer Bank BSI No. Rek. ${PPDB_CONFIG.bank.nomorRekening} a/n ${PPDB_CONFIG.bank.atasNama}.`,
      status: "upcoming",
    },
    {
      phase: "Isi Formulir Online",
      date: "Setelah Bayar",
      desc: "Lengkapi formulir online dengan data diri calon santri, orang tua/wali, serta informasi riwayat pendidikan.",
      status: "upcoming",
    },
    {
      phase: "Upload Berkas Digital",
      date: "Setelah Formulir",
      desc: "Upload seluruh dokumen persyaratan termasuk pas foto formal latar belakang biru dan format dokumen panitia.",
      status: "upcoming",
    },
    {
      phase: "Undangan & Jadwal Seleksi",
      date: "Jadwal Dipilih",
      desc: "Menerima undangan seleksi: Tes Al-Qur'an (Tahsin & Tahfidz), Kemampuan Dasar Akademik, Identifikasi Kepribadian, Seleksi Kesiapan, dan Wawancara Wali.",
      status: "upcoming",
    },
    {
      phase: "Pengumuman Hasil Seleksi",
      date: "Setelah Tes",
      desc: "Hasil seleksi diumumkan resmi melalui Dashboard Pendaftar dan Notifikasi WhatsApp.",
      status: "upcoming",
    },
    {
      phase: "Pembayaran Uang Pangkal (Daftar Ulang)",
      date: "Setelah Diterima",
      desc: "Uang pangkal Rp 9.900.000 dapat dicicil 3x: cicilan 1 sebesar 50% (Rp 4.950.000) sepekan setelah pengumuman, sisa 2x dapat dicicil hingga Mei 2027.",
      status: "upcoming",
    },
  ];

  const requirements = [
    {
      title: "Dokumen Persyaratan Administrasi",
      icon: FileText,
      items: [
        {
          name: "Pas Foto 3x4 (3 lembar) Latar Belakang Biru Berpakaian Rapi & Sopan",
          type: "Wajib",
        },
        { name: "Scan Kartu Keluarga (KK)", type: "Wajib" },
        { name: "Scan Akta Kelahiran", type: "Wajib" },
        {
          name: "Scan Rapor 2 Semester Terakhir / Ijazah Terakhir",
          type: "Wajib",
        },
        {
          name: "Scan Nomor Induk Siswa Nasional (NISN)",
          type: "Wajib",
        },
      ],
    },
    {
      title: "Dokumen Format Panitia (Download di Dashboard)",
      icon: CheckCircle,
      note: "Dokumen berikut dapat diunduh langsung dari sistem pendaftaran saat tahap upload berkas:",
      items: [
        {
          name: "Surat Keterangan Sehat (Format Panitia / Dokter)",
          type: "Wajib",
        },
        {
          name: "Scan Pakta Integritas Calon Santri (Format Panitia)",
          type: "Wajib",
        },
        {
          name: "Scan Pakta Integritas Calon Orang Tua / Wali (Format Panitia)",
          type: "Wajib",
        },
        {
          name: "Scan Pernyataan Bebas Perilaku Menyimpang & Negatif",
          type: "Wajib",
        },
      ],
    },
  ];

  return (
    <main className="bg-gradient-to-b from-[#F0FDF4] via-[#F8FAFC] to-white min-h-dvh pt-28 pb-24 lg:pt-36">
      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative overflow-hidden pb-14">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNjBoNjBNNjAgMGwwIDYwIi8+PC9nPjwvc3ZnPg==')] opacity-70 pointer-events-none" />

        <Container className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              PORTAL RESMI SPMB {BRANDING.academicYear} • PUTRA &amp; PUTRI
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Penerimaan Santri Baru <br />
            <span className="text-emerald-700">{BRANDING.schoolName}</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Pendaftaran santri baru Tahun Ajaran {BRANDING.academicYear} resmi dibuka untuk jenjang SMP IT, IL, dan SMA IT (Putra &amp; Putri). Membina generasi yang hanif, solutif, dan progresif di kampus representatif putra dan putri yang terpisah.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/daftar"
              className="h-12 px-8 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-lg transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <span>Mulai Pendaftaran Online</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/documents/Brosur-SPMB-Pesantren-Al-Basyir-2027-2028.pdf"
              download="Brosur-SPMB-Pesantren-Al-Basyir-2027-2028.pdf"
              className="h-12 px-8 rounded-xl bg-white text-slate-800 font-extrabold text-sm border border-slate-200 shadow-xs hover:border-emerald-600/40 hover:text-emerald-700 transition-all inline-flex items-center"
            >
              <span>Unduh Brosur PDF</span>
            </a>
          </div>

          {/* Banner Nilai Inti Pesantren Al-Basyir */}
          <div className="max-w-4xl mx-auto mt-8 bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-center gap-5 text-left shadow-xs">
            <div className="w-14 h-14 bg-emerald-700 text-amber-300 rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-emerald-800 mb-1">
                NILAI INTI PENDIDIKAN PESANTREN AL-BASYIR
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                Pendidikan Karakter <span className="text-emerald-700 font-black">Hanif</span>,{" "}
                <span className="text-emerald-700 font-black">Solutif</span>, dan{" "}
                <span className="text-emerald-700 font-black">Progresif</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Pesantren Al-Basyir Islamic Boarding School memadukan kurikulum turots kepesantrenan, tahfidz Al-Qur&apos;an bersanad, dan kurikulum sains modern berstandar internasional untuk mencetak generasi pemimpin ummat yang berakhlak mulia, cerdas, dan adaptif.
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} delay={0.1 + idx * 0.1} />
            ))}
          </div>
        </Container>
      </section>

      {/* ─── 2. 6 KEUNGGULAN PENGASUHAN Pesantren Al-Basyir ─── */}
      <section className="py-16 bg-white border-y border-emerald-100">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-900 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 inline-block">
              Pilar Pendidikan
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              6 Keunggulan Pengasuhan Pesantren Al-Basyir (Putra &amp; Putri)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Komitmen kami dalam mengasuh dan membina setiap santri dengan keteladanan asatidz &amp; asatidzah, pendekatan Islami, humanis, dan penuh kasih sayang.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PPDB_CONFIG.keunggulanPengasuhan.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-emerald-50/50 to-white p-6 rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── 3. INVESTASI PENDIDIKAN (BIAYA RESMI & SKEMA CICILAN) ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-[#F0FDF4]/50 via-white to-white border-y border-emerald-100">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-900 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 inline-block shadow-2xs">
              Investasi Pendidikan Santri
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Informasi Pembiayaan <br />
              <span className="text-emerald-700">Pendidikan T.A {BRANDING.academicYear}</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Transparan, terjangkau, dan berkah dengan skema cicilan fleksibel untuk kemudahan orang tua santri.
            </p>
          </div>

          {/* 3 Main Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-800 mb-6 group-hover:scale-110 transition-transform shadow-2xs">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-2">
                Biaya Pendaftaran
              </h3>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
                Rp 250.000
              </p>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Biaya pendaftaran dan tes seleksi santri baru (Tahsin, Tahfidz, Akademik &amp; Wawancara). Non-refundable.
              </p>
            </div>

            <div className="bg-gradient-to-b from-emerald-50/70 via-white to-white p-7 sm:p-8 rounded-3xl border-2 border-emerald-700 shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center relative group">
              <div className="absolute -top-3.5 px-4 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                Bisa Dicicil 3x
              </div>
              <div className="w-16 h-16 bg-emerald-100/70 rounded-2xl flex items-center justify-center text-emerald-900 mb-6 group-hover:scale-110 transition-transform shadow-2xs">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xs text-emerald-800 font-extrabold uppercase tracking-wider mb-2">
                Uang Pangkal (Daftar Ulang)
              </h3>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-800 mb-3">
                Rp 9.900.000
              </p>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Termasuk sarana prasarana, seragam santri, kasur lemari asrama, buku &amp; modul kurikulum. Cicilan s/d Mei 2027.
              </p>
            </div>

            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 mb-6 group-hover:scale-110 transition-transform shadow-2xs">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-2">
                SPP Bulanan (All-In)
              </h3>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
                Rp 1.100.000
              </p>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Per bulan (Total Rp 13.200.000/tahun All-In sudah termasuk asrama, makan 3x sehari bergizi, laundry &amp; seluruh kegiatan).
              </p>
            </div>
          </div>

          {/* Visual 3-Step Installment Stepper */}
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-10 shadow-sm mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-emerald-100 text-center sm:text-left">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-1">
                  Skema Pembayaran Transparan
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Tahapan Cicilan Uang Pangkal (Rp 9.900.000)
                </h3>
              </div>
              <div className="text-xs font-bold text-slate-500 bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-100">
                Maksimal 3 Kali Pembayaran
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="bg-gradient-to-b from-emerald-50/70 to-white rounded-2xl p-6 border-2 border-emerald-700 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Kunci Kuota
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">Cicilan 1 (50%)</div>
                  <div className="text-2xl font-extrabold text-slate-900">Rp 4.950.000</div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Wajib dibayarkan paling lambat <strong>sepekan (7 hari)</strong> setelah menerima Surat Pengumuman Kelulusan Seleksi sebagai konfirmasi daftar ulang santri.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-200/80 px-2.5 py-1 rounded-full">
                    Fleksibel
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">Cicilan 2 (25%)</div>
                  <div className="text-2xl font-extrabold text-slate-900">Rp 2.475.000</div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Dapat diangsur secara bertahap setelah pembayaran Cicilan 1 untuk memberikan kenyamanan dan kelonggaran bagi orang tua.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                    Batas Akhir Mei 2027
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">Cicilan 3 (Pelunasan 25%)</div>
                  <div className="text-2xl font-extrabold text-slate-900">Rp 2.475.000</div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Pelunasan sisa uang pangkal sebelum santri mulai masuk asrama, dengan batas waktu maksimal <strong>hingga Mei 2027</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Rincian Fasilitas Uang Pangkal & Keterangan SPP */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-6 mb-10">
            {/* Kolom Kiri: 9 Item Fasilitas Uang Pangkal */}
            <div className="md:col-span-7 bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-3 pb-4 border-b border-emerald-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      Keterangan Tambahan Uang Pangkal
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">
                      Uang Pangkal Sudah Termasuk:
                    </h3>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5 pt-4">
                  {[
                    "1. Seragam 3 stel + 1 almamater",
                    "2. Buku paket mapel selama 1 tahun",
                    "3. Kasur, ranjang, bantal dan sprei baru",
                    "4. Lemari asrama baru",
                    "5. Meja kursi belajar di kelas",
                    "6. Uang kegiatan 1 tahun",
                    "7. Fasilitas kebersihan & sanitasi",
                    "8. Fasilitas sarana belajar representatif",
                    "9. Kartu santri & kartu akses",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs font-bold text-slate-700 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning Box */}
              <div className="pt-2">
                <div className="flex items-center gap-3.5 bg-amber-50/90 border-2 border-amber-300 p-4 rounded-2xl shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-amber-900 leading-tight">
                      UANG PANGKAL, TIDAK TERMASUK SPP
                    </div>
                    <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                      *Biaya yang telah dibayarkan tidak dapat dikembalikan.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Keterangan Tambahan SPP */}
            <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center shrink-0 border border-white/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                      Iuran Bulanan Santri
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Keterangan Tambahan SPP
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <div className="text-xs text-emerald-200 font-medium">Total Iuran dalam 1 Tahun:</div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400">
                      Rp 13.200.000 <span className="text-xs font-bold text-white">(All In)</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    Pembayaran dapat dilakukan secara cicilan bulanan sebesar <strong className="text-white font-bold">Rp 1.100.000 / bulan</strong> selama 12 bulan.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>All-In: makan 3x sehari bergizi, asrama, laundry &amp; kegiatan santri.</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300 font-medium">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Bank BSI No. Rek. {PPDB_CONFIG.bank.nomorRekening} a/n {PPDB_CONFIG.bank.atasNama}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rekening Resmi BSI Card with Copy Button */}
          <div className="max-w-5xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300">
                Rekening Resmi Pembayaran SPMB Pesantren Al-Basyir
              </span>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-0.5">
                <span className="text-lg font-bold text-slate-200">Bank Syariah Indonesia (BSI):</span>
                <span className="text-xl sm:text-2xl font-mono font-extrabold text-amber-400">{PPDB_CONFIG.bank.nomorRekening}</span>
              </div>
              <p className="text-xs text-slate-400">
                Atas Nama: <strong className="text-white">{PPDB_CONFIG.bank.atasNama}</strong> • Kode Bank: <span className="font-mono text-slate-300">{PPDB_CONFIG.bank.kodeBank}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyRekening(PPDB_CONFIG.bank.nomorRekening)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95 shadow-sm"
              >
                {copiedBank ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-300" />
                    <span>Salin No. Rekening</span>
                  </>
                )}
              </button>
              <div className="text-[11px] text-slate-400 bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/10 text-center">
                Konfirmasi otomatis di Dashboard
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 4. ALUR SELEKSI (TIMELINE) ─── */}
      <section id="alur" className="py-20 bg-white border-y border-emerald-100">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Sticky Content */}
            <div className="lg:w-2/5 lg:sticky lg:top-36 h-fit text-center lg:text-left space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-900 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 inline-block">
                Tahapan Pendaftaran
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Alur Seleksi <br />
                <span className="text-emerald-700">Lengkap &amp; Transparan</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Setiap tahapan seleksi dilakukan secara objektif untuk memastikan kesiapan calon santri dan keselarasan visi orang tua dengan nilai-nilai pesantren.
              </p>

              <div className="bg-emerald-50/60 p-6 rounded-3xl border border-emerald-200/70 text-left space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                  <span>Siap Mendaftar?</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Proses pendaftaran santri baru dilakukan secara online dan mudah.
                </p>
                <div className="pt-2">
                  <Link
                    href="/daftar"
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-700 hover:underline"
                  >
                    <span>Daftarkan Putra / Putri Anda Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1">
              <div className="max-w-2xl">
                {timeline.map((item, idx) => (
                  <TimelineItem key={idx} item={item} index={idx} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 5. PERSYARATAN BERKAS & DOKUMEN DIGITAL ─── */}
      <section className="py-20 bg-gradient-to-b from-[#F0FDF4]/30 to-white">
        <Container className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-900 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 inline-block">
              Kelengkapan Berkas
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Persyaratan Administrasi Calon Santri
            </h2>
            <p className="text-sm text-slate-600">
              Seluruh berkas diunggah secara digital melalui Dashboard Pendaftar.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {requirements.map((req, idx) => {
              const ReqIcon = req.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-7 sm:p-9 rounded-3xl border border-emerald-100 shadow-sm space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-800 shadow-2xs shrink-0">
                      <ReqIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {req.title}
                      </h3>
                      {req.note && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {req.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {req.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700"
                      >
                        <div className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.5]" />
                          <span>{item.name}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 uppercase shrink-0">
                          {item.type}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Fasilitas & Ekstrakurikuler */}
          <div className="grid lg:grid-cols-2 gap-8 mt-10">
            {/* Fasilitas */}
            <div className="bg-white p-7 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-700" />
                <span>11 Fasilitas Unggulan Pesantren</span>
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {PPDB_CONFIG.fasilitas.map((f, i) => (
                  <span
                    key={i}
                    className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Ekstrakurikuler */}
            <div className="bg-white p-7 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <span>Ekstrakurikuler Santri Putra &amp; Putri</span>
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "Tahfidz Al-Qur'an Intensif",
                  "Kajian Kitab Turots",
                  "Muhadharah (Pidato 3 Bahasa)",
                  "Jurnalistik & Kepenulisan",
                  "Robotik & Coding Santri",
                  "Panahan & Bela Diri",
                  "Futsal & Bulutangkis",
                  "Pramuka Pesantren",
                  "Tata Boga & Wirausaha",
                  "Klinik Bahasa Arab & Inggris",
                ].map((e, i) => (
                  <span
                    key={i}
                    className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 font-bold"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 6. CALL TO ACTION & BANTUAN ─── */}
      <section className="pt-10">
        <Container className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                Penerimaan Santri Baru {BRANDING.academicYear}
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                Wujudkan Masa Depan Santri yang Hanif, Solutif &amp; Progresif
              </h3>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                Pendaftaran dibuka untuk jenjang SMP IT, IL, dan SMA IT (Kampus Putra &amp; Kampus Putri). Segera daftarkan putra/putri Anda.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-4">
                <Link
                  href="/daftar"
                  className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg transition-all inline-flex items-center gap-2 active:scale-95"
                >
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/kontak"
                  className="h-12 px-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm border border-white/20 transition-all inline-flex items-center"
                >
                  <span>Hubungi Panitia SPMB</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
