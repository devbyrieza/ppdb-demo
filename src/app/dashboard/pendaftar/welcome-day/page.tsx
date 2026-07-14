"use client";

import {
  Loader2,
  Calendar,
  CheckCircle2,
  Save,
  Users,
  AlertCircle,
  Edit,
  Clock,
  MapPin,
  Package,
  MessageCircle,
  Phone,
  Shirt,
  ChevronDown,
  ChevronUp,
  Star,
  Info,
  CheckSquare,
  Square,
  PartyPopper,
  Bus,
  UtensilsCrossed,
  BookOpen,
  Heart,
  Home,
  Tent,
  Mic,
  Presentation,
  School,
  Utensils,
  Handshake,
  HeartHandshake,
  XCircle,
  X,
  FileCheck,
  ChevronRight,
  Download
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const JADWAL_ACARA = [
  { jam: "06.30", label: "Kedatangan Santri & Wali", desc: "Begitu tiba di pesantren, barang bawaan diturunkan dan mobil diarahkan to area parkir.", icon: Tent },
  { jam: "07.00", label: "Registrasi & Pembukaan", desc: "Melakukan registrasi di meja panitia dan mengumpulkan berkas persyaratan.", icon: CheckCircle2 },
  { jam: "07.20", label: "Welcome Day (Acara Utama)", desc: "Sambutan dari Mudir 'Am, Pembina Yayasan, Mudir Ma'had, Camat, serta Serah Terima Simbolis dan Ramah Tamah.", icon: Handshake },
  { jam: "08.40", label: "Sarasehan & Pengenalan Program", desc: "Sosialisasi peraturan pesantren, mekanisme pengasuhan, kurikulum, dan administrasi keuangan.", icon: Presentation },
  { jam: "12.00", label: "Pembagian Makan Siang", desc: "Makan siang dibagikan di depan ruang acara dengan menukarkan kupon.", icon: Utensils },
  { jam: "13.00", label: "Santri Memasuki Asrama", desc: "Setelah acara berakhir, santri memasuki asrama dan mengkondisikan barang bawaan dibantu oleh para ustadz.", icon: School },
  { jam: "17.00", label: "Batas Waktu Kunjungan Wali", desc: "Orang tua/wali hanya diperkenankan membersamai santri hingga sore hari pukul 17.00 WIB.", icon: HeartHandshake },
];

const BERKAS_PERSYARATAN = [
  { item: "Foto setengah badan (latar merah, 4x6 cm)", qty: "4 lembar" },
  { item: "Fotokopi Kartu Keluarga (KK)", qty: "1 lembar" },
  { item: "Fotokopi Akta Kelahiran", qty: "1 lembar" },
  { item: "Fotokopi rapor semester ganjil terakhir", qty: "1 lembar" },
  { item: "Fotokopi rapor semester genap terakhir", qty: "1 lembar" },
  { item: "Print-out bukti NISN", qty: "1 lembar" },
  { item: "Surat Keterangan Sehat (Format Panitia)", qty: "ASLI" },
  { item: "Surat Pernyataan Bebas dari Perilaku Buruk", qty: "ASLI" },
  { item: "Pakta Integritas Calon Santri", qty: "ASLI" },
  { item: "Pakta Integritas Calon Orang Tua/Wali", qty: "ASLI" },
];

const DAFTAR_PERLENGKAPAN = [
  {
    kategori: "A. Pakaian Sehari-Hari",
    items: [
      { nama: "Kaos", qty: "7 pcs", note: "Termasuk 1 kaos olahraga. Diutamakan kaos polos." },
      { nama: "Celana 3/4", qty: "5 pcs", note: "Panjang menutupi lutut hingga pertengahan betis." },
      { nama: "Baju / Kemeja", qty: "3 pcs", note: "Lengan panjang/pendek (rapi)." },
      { nama: "Celana Panjang", qty: "3 pcs", note: "Kain bahan (formal). Tidak isbal dan tidak ketat." },
      { nama: "Sandal Jepit", qty: "1 psg", note: "Digunakan aktivitas harian asrama." },
      { nama: "Jaket", qty: "2 pcs", note: "Tanpa gambar makhluk hidup." },
      { nama: "Kaos Kaki", qty: "-", note: "Panjang minimal sampai atas betis." },
      { nama: "Pakaian Dalam", qty: "-", note: "Secukupnya." },
    ]
  },
  {
    kategori: "B. Pakaian Shalat",
    items: [
      { nama: "Gamis", qty: "2 pcs", note: "Wajib berwarna putih bersih." },
      { nama: "Baju Takwa/Koko", qty: "3 pcs", note: "Minimal 2 putih." },
      { nama: "Sarung", qty: "2 pcs", note: "-" },
      { nama: "Peci", qty: "3 pcs", note: "Minimal 1 putih." },
      { nama: "Minyak Wangi", qty: "-", note: "Non-alkohol (sunnah)." },
      { nama: "Sajadah", qty: "1 pcs", note: "Ketebalan standar, mudah dilipat." },
    ]
  },
  {
    kategori: "C. Penyimpanan & Mandi",
    items: [
      { nama: "Kontainer Box", qty: "1 pcs", note: "Tinggi 25-40 cm (maks 60 liter)." },
      { nama: "Alat Mandi Lengkap", qty: "1 set", note: "Sabun cair (500ml), sikat/pasta gigi, sampo, keranjang." },
      { nama: "Handuk", qty: "1 pcs", note: "Warna abu-abu polos." },
      { nama: "Ember & Detergen", qty: "1 set", note: "Detergen secukupnya, ember 1 pcs, sikat baju." },
    ]
  },
  {
    kategori: "D. Perlengkapan Sekolah",
    items: [
      { nama: "Sepatu & Kaos Kaki", qty: "1 psg", note: "Sepatu wajib hitam, Kaos kaki 3 psg hitam." },
      { nama: "Tas & Ikat Pinggang", qty: "1 pcs", note: "Ikat pinggang hitam polos." },
      { nama: "Songkok", qty: "2 pcs", note: "Warna hitam nasional." },
      { nama: "Mushaf Al-Qur'an", qty: "2 pcs", note: "A5. Diutamakan Rasm Utsmani Madinah." },
      { nama: "Buku & Alat Tulis", qty: "1 set", note: "1 pack buku, alat tulis, penggaris, stabilo." },
      { nama: "Kamus Bahasa Arab", qty: "1 pcs", note: "Mahmud Yunus." },
    ]
  },
  {
    kategori: "E. Tidur & Lainnya",
    items: [
      { nama: "Bantal, Guling, Sprei", qty: "1 set", note: "Sprei 200x80x15 (Biru Navy Polos). Sarung Hijau Stabilo/Biru Navy." },
      { nama: "Selimut & Sapu Lidi", qty: "1 pcs", note: "Selimut polos." },
      { nama: "Alat Makan & Minum", qty: "1 set", note: "Piring, gelas (melamin/aluminium), botol minum, sabun cuci piring." },
      { nama: "Obat-obatan Pribadi", qty: "-", note: "Multivitamin, madu, obat bapil, keseleo (opsional)." },
      { nama: "Payung Lipat & Senter", qty: "1 pcs", note: "Bukan senter listrik." },
    ]
  }
];

const BARANG_DILARANG = [
  "HP, Laptop, Alat Elektronik Komunikasi",
  "Senjata tajam, Senjata api, Rokok, Minuman keras, Narkotika",
  "Pakaian ketat, Barang mewah (> Rp 500.000)",
  "Bahan bacaan/novel/komik fiksi, Majalah non-Islami",
  "Barang/Pakaian yang bergambar makhluk hidup",
  "Alat musik & Perhiasan (selain jam tangan)",
  "Penutup kepala gaul (selain songkok/peci)"
];

const FAQ = [
  {
    q: "Apakah saya harus hadir di acara Welcome Day ini?",
    a: "Ya, kehadiran sangat dianjurkan. Welcome Day adalah saat resmi serah terima santri dari orang tua/wali kepada pihak pesantren. Ada sesi sarasehan penting yang berisi informasi yang perlu diketahui wali.",
  },
  {
    q: "Berapa orang yang boleh menemani santri?",
    a: "Untuk ruang sarasehan & kupon makan: MAKSIMAL 3 orang (1 santri + 2 wali/pendamping terdekat). Pengantar lain boleh ikut ke area pesantren, namun tidak masuk ruang sarasehan dan tidak mendapat kupon makan.",
  },
  {
    q: "Apakah ada tempat parkir?",
    a: "Ya, tersedia area parkir di lingkungan pesantren. Kami mohon datang tepat waktu agar parkir tidak terlalu penuh. Untuk rombongan besar (bus/minibus), harap informasikan melalui kolom catatan di form konfirmasi.",
  },
  {
    q: "Bagaimana jika tidak bisa hadir pada tanggal tersebut?",
    a: "Harap konfirmasi ketidakhadiran melalui form di bawah ini dan hubungi panitia sesegera mungkin. Ada proses tersendiri jika tidak dapat hadir pada hari H.",
  },
  {
    q: "Apakah santri boleh pulang setelah acara?",
    a: "Tidak. Setelah Welcome Day, santri resmi menetap di pesantren. Orang tua dipersilakan pamit pada sesi perpisahan (sekitar pukul 14.30).",
  },
  {
    q: "Apa yang harus dibawa santri pada hari itu?",
    a: "Lihat checklist barang bawaan yang sudah kami sediakan di halaman ini. Pastikan semua perlengkapan sudah disiapkan dari rumah.",
  },
];

export default function WelcomeDayPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [seragamStatus, setSeragamStatus] = useState({ sudahIsi: false, baju: "", celana: "", almamater: "" });
  const [formData, setFormData] = useState({
    statusKehadiran: "HADIR",
    jumlahPendamping: 2,
    totalPengantar: 3,
    catatanTambahan: "",
    jumlahMobil: 0,
    jumlahMotor: 0,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openKategori, setOpenKategori] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch welcome day data
      const res = await fetch(`/api/pendaftar/welcome-day?t=${Date.now()}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const dataJson = result.data.data_penginap;
          if (dataJson) {
            setFormData({
              statusKehadiran: dataJson.statusKehadiran || "HADIR",
              jumlahPendamping: dataJson.jumlahPendamping !== undefined ? Number(dataJson.jumlahPendamping) : 2,
              totalPengantar: dataJson.totalPengantar !== undefined ? Number(dataJson.totalPengantar) : 3,
              catatanTambahan: dataJson.catatanTambahan || "",
              jumlahMobil: dataJson.jumlahMobil !== undefined ? Number(dataJson.jumlahMobil) : 0,
              jumlahMotor: dataJson.jumlahMotor !== undefined ? Number(dataJson.jumlahMotor) : 0,
            });
            setIsEditing(false);
          }
        }
      }

      // Fetch seragam status
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const pendaftarId = sessionData.pendaftar_id || sessionData.session?.id;
        if (pendaftarId) {
          const statusRes = await fetch(`/api/pendaftar/status?pendaftar_id=${pendaftarId}&t=${Date.now()}`);
          if (statusRes.ok) {
            const userData = await statusRes.json();
            setSeragamStatus({
              sudahIsi: !!(userData.ukuran_seragam_baju && userData.ukuran_seragam_celana && userData.ukuran_seragam_almamater),
              baju: userData.ukuran_seragam_baju || "",
              celana: userData.ukuran_seragam_celana || "",
              almamater: userData.ukuran_seragam_almamater || "",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching welcome day status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/pendaftar/welcome-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menyimpan konfirmasi");

      setMessage({ type: "success", text: "✅ Konfirmasi kehadiran Welcome Day berhasil disimpan! Terima kasih." });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Terjadi kesalahan. Silakan coba lagi." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        <p className="text-sm text-ink-400 font-bold">Memuat data Welcome Day...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ─── HERO BANNER ─── */}
      <div className="relative bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 p-6 md:p-8 rounded-3xl overflow-hidden text-white shadow-xl">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-4 right-4 w-16 h-16 bg-gold-400/20 rounded-2xl rotate-12" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-black mb-4 text-gold-300">
            <PartyPopper className="w-3.5 h-3.5" />
            INFORMASI RESMI PESANTREN
          </div>

          <h1 className="text-2xl md:text-3xl font-black leading-tight mb-2 text-white drop-shadow-md">
            <span className="flex items-center gap-3">
              <PartyPopper className="w-8 h-8 md:w-10 md:h-10 text-gold-400 drop-shadow-sm" />
              Welcome Day & Serah Terima
            </span>
            <span className="text-gold-300 block mt-2 text-xl md:text-2xl">Santri Baru 2026/2027</span>
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
              <Calendar className="w-5 h-5 text-gold-300 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Hari & Tanggal</p>
                <p className="text-sm font-black text-white">Sabtu, 18 Juli 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
              <Clock className="w-5 h-5 text-gold-300 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Jam Mulai</p>
                <p className="text-sm font-black text-white">Pukul 06.30 WIB</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
              <MapPin className="w-5 h-5 text-gold-300 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">Lokasi</p>
                <p className="text-sm font-black text-white">Area Pesantren Al-Imam</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── INFO PENGINAPAN ─── */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-600">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-blue-950 flex items-center gap-2">
              Informasi Penginapan
              <span className="px-2.5 py-0.5 bg-blue-200 text-blue-800 text-[10px] uppercase tracking-widest rounded-lg">Rekomendasi</span>
            </h3>
            <p className="text-sm text-blue-800 mt-2 leading-relaxed">
              Bagi Bapak/Ibu Wali Santri yang berasal dari luar daerah atau jaraknya jauh, acara dimulai <strong>Pukul 06.30 WIB</strong>. 
              <br className="hidden sm:block" />
              Terdapat penginapan rekomendasi terdekat yang berlokasi di <strong>seberang Masjid Jami Cikembar</strong>. 
              Fasilitas kamar ber-AC dan bersih dengan tarif sekitar <strong>Rp 175.000 / malam</strong> (banyak pilihan kamar lain).
            </p>
            <p className="text-xs text-blue-600/80 mt-3 font-bold italic">
              *Catatan: Insya Allah ke depannya pesantren akan membangun Guest House khusus untuk wali santri.
            </p>
          </div>
        </div>
      </div>

      {/* ─── DOKUMEN RESMI (DOWNLOAD) ─── */}
      <div className="grid grid-cols-1 gap-4">
        <a
          href="/documents/Surat Pemberitahuan Kedatangan Santri Baru 2026-2027.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white hover:bg-emerald-50 rounded-2xl p-4 border border-ink-100 hover:border-emerald-200 transition-all shadow-sm group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="font-black text-ink-900 text-sm group-hover:text-emerald-800 transition-colors">Surat Pemberitahuan</p>
            <p className="text-xs text-ink-500 font-medium">Informasi & tata tertib kedatangan</p>
          </div>
        </a>
      </div>

      {/* ─── PESAN SUKSES/ERROR ─── */}
      {message.text && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-sm font-bold ${
          message.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.type === "success"
            ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ─── REMINDER SERAGAM (jika belum isi) ─── */}
      {!seragamStatus.sudahIsi && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-300 rounded-2xl px-4 py-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-orange-900">⚠️ Ukuran Seragam Belum Diisi!</p>
            <p className="text-xs text-orange-700 leading-snug mt-1">
              Sebelum Welcome Day, pastikan Anda sudah mengisi ukuran seragam santri agar dapat disiapkan tepat waktu.
            </p>
          </div>
          <Link
            href="/dashboard/pendaftar/seragam"
            className="flex-shrink-0 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-3 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            <Shirt className="w-3.5 h-3.5" />
            Isi Sekarang
          </Link>
        </div>
      )}

      {/* ─── STATUS SERAGAM (jika sudah isi) ─── */}
      {seragamStatus.sudahIsi && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-black text-green-800">✅ Ukuran Seragam Sudah Terisi</p>
            <p className="text-xs text-green-600 mt-0.5">
              Baju: <strong>{seragamStatus.baju}</strong> · Celana/Rok: <strong>{seragamStatus.celana}</strong> · Almamater: <strong>{seragamStatus.almamater}</strong>
            </p>
          </div>
          <Link
            href="/dashboard/pendaftar/seragam"
            className="text-xs text-green-700 font-black hover:underline flex-shrink-0"
          >
            Ubah
          </Link>
        </div>
      )}

      {/* ─── FORM KONFIRMASI ─── */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-ink-100/50 overflow-hidden relative">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="px-6 py-5 border-b border-ink-100/50 bg-gradient-to-r from-primary-50/50 to-transparent flex items-center gap-4 relative">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-primary-100">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="font-black text-ink-950 text-lg">Form Konfirmasi Kehadiran</h2>
            <p className="text-xs text-ink-500 font-bold mt-0.5">Wajib diisi oleh setiap orang tua/wali santri</p>
          </div>

          {/* Status badge jika sudah submit */}
          {!isEditing && (
            <div className="ml-auto hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 text-xs font-black px-4 py-2 rounded-xl border border-emerald-200/50 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              Sudah Dikonfirmasi
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="p-6 relative">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-blue-700" />
              </div>
              <p className="text-sm text-blue-900 font-medium leading-relaxed pt-1">
                <strong>Panduan Pengisian:</strong> Pilih status kehadiran Anda, kemudian isi jumlah wali yang masuk ke ruang sarasehan (maks. 2 orang selain santri), dan total seluruh rombongan yang ikut mengantar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status Kehadiran */}
              <div className="space-y-3">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest block flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center text-[10px]">1</span>
                  Apakah Anda akan hadir pada Welcome Day? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, statusKehadiran: "HADIR" })}
                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 group ${
                      formData.statusKehadiran === "HADIR"
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]"
                        : "bg-white border-ink-200 hover:border-emerald-300 hover:shadow-md hover:bg-emerald-50/30"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.statusKehadiran === "HADIR" ? "bg-white/20" : "bg-emerald-100 group-hover:bg-emerald-200"}`}>
                      <CheckCircle2 className={`w-6 h-6 ${formData.statusKehadiran === "HADIR" ? "text-white" : "text-emerald-600"}`} />
                    </div>
                    <div>
                      <p className={`font-black text-base ${formData.statusKehadiran === "HADIR" ? "text-white" : "text-ink-900"}`}>Ya, Kami Akan Hadir</p>
                      <p className={`text-xs font-medium mt-1 ${formData.statusKehadiran === "HADIR" ? "text-emerald-50" : "text-ink-500"}`}>
                        Kami siap hadir pada 18 Juli 2026
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, statusKehadiran: "TIDAK_HADIR" })}
                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 group ${
                      formData.statusKehadiran === "TIDAK_HADIR"
                        ? "bg-gradient-to-br from-rose-500 to-rose-600 border-rose-500 text-white shadow-lg shadow-rose-500/25 scale-[1.02]"
                        : "bg-white border-ink-200 hover:border-rose-300 hover:shadow-md hover:bg-rose-50/30"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.statusKehadiran === "TIDAK_HADIR" ? "bg-white/20" : "bg-rose-100 group-hover:bg-rose-200"}`}>
                      <XCircle className={`w-6 h-6 ${formData.statusKehadiran === "TIDAK_HADIR" ? "text-white" : "text-rose-600"}`} />
                    </div>
                    <div>
                      <p className={`font-black text-base ${formData.statusKehadiran === "TIDAK_HADIR" ? "text-white" : "text-ink-900"}`}>Berhalangan Hadir</p>
                      <p className={`text-xs font-medium mt-1 ${formData.statusKehadiran === "TIDAK_HADIR" ? "text-rose-50" : "text-ink-500"}`}>
                        Ada halangan & tidak bisa hadir
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {formData.statusKehadiran === "HADIR" && (
                <>
                  {/* Jumlah Pendamping di Acara Utama */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-ink-500 uppercase tracking-widest block flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center text-[10px]">2</span>
                      Wali Masuk Ruang Sarasehan & Kupon Makan *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.jumlahPendamping}
                        onChange={(e) => setFormData({ ...formData, jumlahPendamping: Number(e.target.value) })}
                        className="w-full bg-white border-2 border-ink-200 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none font-bold text-ink-900 text-sm appearance-none transition-all shadow-sm"
                        required
                      >
                        <option value={1}>1 Pendamping — Total 2 orang (1 Santri + 1 Wali)</option>
                        <option value={2}>2 Pendamping — Total 3 orang (1 Santri + 2 Wali) ← MAKSIMAL</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none bg-white pl-2">
                        <div className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center">
                          <ChevronDown className="w-4 h-4 text-ink-500" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mt-2 bg-blue-50/50 rounded-xl px-4 py-2.5 border border-blue-100">
                      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800 font-medium">
                        Kursi dan kupon makan akan disiapkan sesuai dengan pilihan Anda di atas.
                      </p>
                    </div>
                  </div>

                  {/* Total Pengantar ke Area Pesantren */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-ink-500 uppercase tracking-widest block flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center text-[10px]">3</span>
                      Total Seluruh Rombongan Ke Pesantren *
                    </label>
                    <p className="text-xs text-ink-500 font-medium -mt-2">
                      Jumlah total semua orang (termasuk santri & seluruh pengantar).
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, totalPengantar: Math.max(formData.jumlahPendamping + 1, formData.totalPengantar - 1) })}
                        className="w-14 h-14 rounded-2xl bg-white border-2 border-ink-200 hover:border-primary-300 hover:bg-primary-50 text-ink-700 font-black text-2xl flex items-center justify-center transition-all shadow-sm active:scale-95"
                      >
                        −
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min={formData.jumlahPendamping + 1}
                          value={formData.totalPengantar}
                          onChange={(e) => setFormData({ ...formData, totalPengantar: Math.max(formData.jumlahPendamping + 1, Number(e.target.value)) })}
                          className="w-full bg-white border-2 border-ink-200 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none font-black text-center text-ink-900 text-xl shadow-sm transition-all"
                          required
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-ink-400 font-bold bg-white pl-2">Orang</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, totalPengantar: formData.totalPengantar + 1 })}
                        className="w-14 h-14 rounded-2xl bg-white border-2 border-ink-200 hover:border-primary-300 hover:bg-primary-50 text-ink-700 font-black text-2xl flex items-center justify-center transition-all shadow-sm active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Kendaraan (Mobil & Motor) */}
                  <div className="space-y-3 pt-3">
                    <label className="text-xs font-black text-ink-500 uppercase tracking-widest block flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center text-[10px]">4</span>
                      Informasi Kendaraan (Manajemen Parkir) *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mobil */}
                      <div className="bg-white border-2 border-ink-200 rounded-2xl p-5 relative flex items-center justify-between shadow-sm hover:border-primary-300 transition-colors">
                        <div>
                          <p className="font-black text-ink-900 text-base">Mobil</p>
                          <p className="text-xs text-ink-500 font-medium">Yang akan diparkir</p>
                        </div>
                        <div className="flex items-center gap-2 bg-ink-50 rounded-xl p-1 border border-ink-100">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, jumlahMobil: Math.max(0, formData.jumlahMobil - 1) })}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm hover:bg-ink-100 text-ink-700 font-black flex items-center justify-center transition-all active:scale-95"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahMobil}
                            onChange={(e) => setFormData({ ...formData, jumlahMobil: Math.max(0, Number(e.target.value)) })}
                            className="w-10 bg-transparent border-none text-center font-black text-ink-900 text-lg outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, jumlahMobil: formData.jumlahMobil + 1 })}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm hover:bg-ink-100 text-ink-700 font-black flex items-center justify-center transition-all active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Motor */}
                      <div className="bg-white border-2 border-ink-200 rounded-2xl p-5 relative flex items-center justify-between shadow-sm hover:border-primary-300 transition-colors">
                        <div>
                          <p className="font-black text-ink-900 text-base">Motor</p>
                          <p className="text-xs text-ink-500 font-medium">Yang akan diparkir</p>
                        </div>
                        <div className="flex items-center gap-2 bg-ink-50 rounded-xl p-1 border border-ink-100">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, jumlahMotor: Math.max(0, formData.jumlahMotor - 1) })}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm hover:bg-ink-100 text-ink-700 font-black flex items-center justify-center transition-all active:scale-95"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahMotor}
                            onChange={(e) => setFormData({ ...formData, jumlahMotor: Math.max(0, Number(e.target.value)) })}
                            className="w-10 bg-transparent border-none text-center font-black text-ink-900 text-lg outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, jumlahMotor: formData.jumlahMotor + 1 })}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm hover:bg-ink-100 text-ink-700 font-black flex items-center justify-center transition-all active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Catatan Tambahan */}
              <div className="space-y-3 pt-3">
                <label className="text-xs font-black text-ink-500 uppercase tracking-widest block flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center text-[10px]">
                    {formData.statusKehadiran === "HADIR" ? "5" : "2"}
                  </span>
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  value={formData.catatanTambahan}
                  onChange={(e) => setFormData({ ...formData, catatanTambahan: e.target.value })}
                  placeholder="Misal: Rombongan kami menggunakan 1 unit bus..."
                  className="w-full bg-white border-2 border-ink-200 px-5 py-4 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 outline-none font-medium text-sm min-h-[120px] resize-none shadow-sm transition-all"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black px-6 py-4 rounded-2xl transition-all shadow-[0_8px_20px_rgb(0,0,0,0.12)] shadow-primary-700/30 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Menyimpan Konfirmasi...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Simpan Konfirmasi Kehadiran</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-ink-400 font-bold text-center mt-4">
                  Data Anda akan tersimpan secara aman dan dapat diubah kembali kapan saja sebelum hari-H.
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* ─── SUMMARY CARD SETELAH KONFIRMASI ─── */
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-2xl">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="font-black text-green-900 text-base">Konfirmasi Berhasil Terkirim!</p>
                <p className="text-xs text-green-700 font-medium mt-1">
                  Terima kasih. Data kehadiran Anda telah kami terima dan tersimpan. Tim panitia akan mempersiapkan sesuai konfirmasi ini.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-ink-50 rounded-2xl border border-ink-100">
                <p className="text-[10px] uppercase tracking-widest font-black text-ink-400 mb-2">Status Kehadiran</p>
                <div className={`flex items-center gap-2 ${formData.statusKehadiran === "HADIR" ? "text-green-700" : "text-red-700"}`}>
                  {formData.statusKehadiran === "HADIR" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <span className="font-black">{formData.statusKehadiran === "HADIR" ? "Hadir" : "Berhalangan"}</span>
                </div>
              </div>

              {formData.statusKehadiran === "HADIR" && (
                <>
                  <div className="p-4 bg-ink-50 rounded-2xl border border-ink-100">
                    <p className="text-[10px] uppercase tracking-widest font-black text-ink-400 mb-2">Wali di Ruang Sarasehan</p>
                    <p className="font-black text-sm text-ink-900">
                      {formData.jumlahPendamping} Pendamping
                    </p>
                    <p className="text-xs text-ink-500 font-medium">
                      Total {Number(formData.jumlahPendamping) + 1} orang mendapat kursi & kupon
                    </p>
                  </div>

                  <div className="p-4 bg-ink-50 rounded-2xl border border-ink-100">
                    <p className="text-[10px] uppercase tracking-widest font-black text-ink-400 mb-2">Total Rombongan</p>
                    <p className="font-black text-sm text-ink-900">{formData.totalPengantar} Orang</p>
                    <p className="text-xs text-ink-500 font-medium">Termasuk santri & seluruh pengantar</p>
                  </div>

                  <div className="p-4 bg-ink-50 rounded-2xl border border-ink-100">
                    <p className="text-[10px] uppercase tracking-widest font-black text-ink-400 mb-2">Kendaraan</p>
                    <p className="font-black text-sm text-ink-900">
                      {formData.jumlahMobil} Mobil, {formData.jumlahMotor} Motor
                    </p>
                    <p className="text-xs text-ink-500 font-medium">Info area parkir</p>
                  </div>
                </>
              )}

              {formData.catatanTambahan && (
                <div className="p-4 bg-ink-50 rounded-2xl border border-ink-100 sm:col-span-2">
                  <p className="text-[10px] uppercase tracking-widest font-black text-ink-400 mb-2">Catatan Tambahan</p>
                  <p className="font-medium text-sm text-ink-900 whitespace-pre-wrap">{formData.catatanTambahan}</p>
                </div>
              )}
            </div>

            {/* Warning Banner for Users who haven't updated vehicles */}
            {formData.statusKehadiran === "HADIR" && formData.jumlahMobil === 0 && formData.jumlahMotor === 0 && (
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white p-5 rounded-2xl shadow-lg shadow-orange-500/25 flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mt-6">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-black text-white">Mohon Update Jumlah Kendaraan Anda</p>
                    <p className="text-sm text-white/90 mt-1 leading-relaxed">
                      Kami membutuhkan data jumlah mobil atau motor yang Anda bawa untuk keperluan kelancaran manajemen area parkir pesantren.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-shrink-0 flex items-center justify-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-black px-5 py-3 rounded-xl transition-all shadow-sm w-full md:w-auto hover:scale-105 active:scale-95"
                >
                  <Edit className="w-4 h-4" />
                  Ubah Sekarang
                </button>
              </div>
            )}

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white hover:bg-primary-50 text-primary-700 border-2 border-primary-200 hover:border-primary-300 font-black px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer text-sm"
              >
                <Edit className="w-4 h-4" />
                Ubah Data Konfirmasi
              </button>
            </div>
          </div>
        )}
      </div>

      
      {/* ─── KETENTUAN PENTING ─── */}
      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-4">
        <h3 className="font-black text-amber-900 flex items-center gap-2 text-base">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          Ketentuan Penting Tata Cara & Alur
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-amber-100 flex gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shirt className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900">Seragam Kedatangan</p>
              <p className="text-xs text-amber-700 mt-1">Santri wajib memakai <strong>Baju Koko/Kemeja putih</strong>, <strong>celana kain hitam</strong>, and <strong>songkok nasional hitam</strong>.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-100 flex gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900">Batas Wali di Ruang Utama</p>
              <p className="text-xs text-amber-700 mt-1">Kursi & kupon makan hanya untuk <strong>3 orang</strong> (1 santri + 2 pendamping). Pengantar lain <strong>tidak</strong> diperkenankan masuk ruang sarasehan.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-100 flex gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900">Bongkar Muat Barang</p>
              <p className="text-xs text-amber-700 mt-1">Begitu tiba di pesantren, santri dan wali santri <strong>langsung menurunkan barang bawaan</strong>, kemudian mobil diarahkan ke area parkir.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-100 flex gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900">Batas Waktu Mengantar</p>
              <p className="text-xs text-amber-700 mt-1">Acara berakhir pukul 12.00 WIB. Orang tua hanya diperkenankan membersamai santri hingga sore hari maksimal pukul <strong>17.00 WIB</strong>.</p>
            </div>
          </div>
        </div>
      </div>

      
      {/* ─── INFOGRAFIS & PANDUAN VISUAL ─── */}
      <div className="bg-white rounded-3xl border border-ink-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="font-black text-emerald-950 text-base">Infografis & Panduan Visual</h2>
            <p className="text-xs text-emerald-600 font-bold">Panduan lengkap pelaksanaan Welcome Day</p>
          </div>
        </div>
        <div className="p-5 space-y-6">
          {/* Alur Kedatangan */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shadow-sm">
                1
              </div>
              <h3 className="font-black text-ink-900 text-sm">Alur Kedatangan</h3>
            </div>
            <div 
              className="relative w-full aspect-[1/1.4] bg-ink-50 rounded-2xl border border-ink-100 overflow-hidden cursor-zoom-in group shadow-sm"
              onClick={() => setLightbox('/documents/alur.jpeg')}
            >
              <Image 
                src="/documents/alur.jpeg" 
                alt="Alur Kedatangan" 
                fill 
                className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <div className="mt-4 flex justify-center">
              <a 
                href="/images/welcome-day/alur_kedatangan_banner.png" 
                target="_blank" 
                rel="noopener noreferrer" 
                download
                className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                <Download className="w-4 h-4" /> Lihat Resolusi Penuh (Banner)
              </a>
            </div>
          </div>

          {/* Rundown Acara */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shadow-sm">
                2
              </div>
              <h3 className="font-black text-ink-900 text-sm">Rundown Acara</h3>
            </div>
            <div 
              className="relative w-full aspect-[1/1.4] bg-ink-50 rounded-2xl border border-ink-100 overflow-hidden cursor-zoom-in group shadow-sm"
              onClick={() => setLightbox('/documents/roundown-ke-pendaftar.jpeg')}
            >
              <Image 
                src="/documents/roundown-ke-pendaftar.jpeg" 
                alt="Rundown Acara" 
                fill 
                className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>
      {/* ─── JADWAL ACARA ─── */}
      <div className="bg-white rounded-3xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100 bg-primary-50 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-700" />
          </div>
          <div>
            <h2 className="font-black text-primary-950 text-base">Jadwal Acara Welcome Day</h2>
            <p className="text-xs text-primary-600 font-bold">Sabtu, 18 Juli 2026</p>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-2">
            {JADWAL_ACARA.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                {/* Timeline line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-16 text-center">
                    <span className="text-xs font-black text-primary-700 bg-primary-50 border border-primary-200 px-2 py-1 rounded-lg block">
                      {item.jam}
                    </span>
                  </div>
                  {idx < JADWAL_ACARA.length - 1 && (
                    <div className="w-0.5 h-6 bg-ink-200 mt-1" />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-primary-100 flex items-center justify-center flex-shrink-0 shadow-sm text-primary-600">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="mt-0.5">
                      <p className="text-sm font-black text-ink-900">{item.label}</p>
                      <p className="text-xs text-ink-500 font-medium mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-400 font-bold mt-4 pt-4 border-t border-ink-100 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Jadwal dapat berubah. Panitia akan menginformasikan jika ada perubahan melalui pengumuman resmi.
          </p>
        </div>
      </div>

      {/* ─── BERKAS PERSYARATAN ─── */}
      <div className="bg-white rounded-3xl border border-ink-100 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-ink-100 bg-blue-50 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="font-black text-blue-950 text-base">Berkas Persyaratan (Wajib Dibawa)</h2>
            <p className="text-xs text-blue-600 font-bold">Dimasukkan dalam 1 map saat registrasi</p>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BERKAS_PERSYARATAN.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-ink-50 border border-ink-100">
                <div className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center text-primary-600">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-800">{item.item}</p>
                  <p className="text-xs text-primary-700 font-black mt-0.5">{item.qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── BERKAS PERSYARATAN ─── */}
      <div className="bg-white rounded-3xl border border-ink-100 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-ink-100 bg-blue-50 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="font-black text-blue-950 text-base">Berkas Persyaratan (Wajib Dibawa)</h2>
            <p className="text-xs text-blue-600 font-bold">Dimasukkan dalam 1 map saat registrasi</p>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BERKAS_PERSYARATAN.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-ink-50 border border-ink-100">
                <div className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center text-primary-600">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-800">{item.item}</p>
                  <p className="text-xs text-primary-700 font-black mt-0.5">{item.qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CHECKLIST BARANG BAWAAN ─── */}
      <div className="bg-white rounded-3xl border border-ink-100 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-ink-100 bg-emerald-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-black text-emerald-950 text-base">Daftar Perlengkapan Santri</h2>
              <p className="text-xs text-emerald-600 font-bold">Ketuk kategori untuk melihat rincian</p>
            </div>
          </div>
          <a
            href="https://ppdb.pesantren-alimam.com/berkas/Daftar%20Perlengkapan%20Santri%20Baru.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Unduh PDF Resmi
          </a>
        </div>
        
        {/* Accordions */}
        <div className="divide-y divide-ink-100">
          {DAFTAR_PERLENGKAPAN.map((kategori, idx) => (
            <div key={idx}>
              <button
                onClick={() => setOpenKategori(openKategori === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-ink-50 transition-colors"
              >
                <p className="font-black text-ink-900">{kategori.kategori}</p>
                {openKategori === idx ? <ChevronUp className="w-5 h-5 text-ink-400" /> : <ChevronDown className="w-5 h-5 text-ink-400" />}
              </button>
              {openKategori === idx && (
                <div className="px-6 pb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {kategori.items.map((item, i) => (
                      <div key={i} className="bg-ink-50 rounded-xl p-3 border border-ink-100">
                        <div className="flex justify-between items-start gap-2 flex-wrap">
                          <p className="text-sm font-bold text-ink-900">{item.nama}</p>
                          <span className="text-[10px] font-black bg-ink-200 text-ink-700 px-2 py-0.5 rounded-md whitespace-nowrap">{item.qty}</span>
                        </div>
                        {item.note !== "-" && (
                          <p className="text-xs text-ink-500 mt-1 font-medium">{item.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Barang Dilarang */}
          <div>
            <button
              onClick={() => setOpenKategori(99)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-red-50 bg-red-50/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="font-black text-red-900">Barang yang DILARANG KERAS Dibawa</p>
              </div>
              {openKategori === 99 ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
            </button>
            {openKategori === 99 && (
              <div className="px-6 pb-5 pt-2 bg-red-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BARANG_DILARANG.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-red-100">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-red-900">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── FAQ ─── */}
      <div className="bg-white rounded-3xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100 bg-blue-50 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="font-black text-blue-950 text-base">Pertanyaan Umum Orang Tua / Wali</h2>
            <p className="text-xs text-blue-600 font-bold">Ketuk pertanyaan untuk melihat jawaban</p>
          </div>
        </div>
        <div className="divide-y divide-ink-100">
          {FAQ.map((faq, idx) => (
            <div key={idx}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-ink-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 font-black text-xs mt-0.5">
                  {idx + 1}
                </div>
                <p className="flex-1 text-sm font-bold text-ink-900 leading-snug">{faq.q}</p>
                {openFaq === idx
                  ? <ChevronUp className="w-4 h-4 text-ink-400 flex-shrink-0 mt-0.5" />
                  : <ChevronDown className="w-4 h-4 text-ink-400 flex-shrink-0 mt-0.5" />
                }
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 pl-14">
                  <p className="text-sm text-ink-600 font-medium leading-relaxed bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── KONTAK PANITIA ─── */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-5">
        <h3 className="font-black text-primary-900 text-sm mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Ada Pertanyaan? Hubungi Panitia
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://wa.me/6281251971250"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white rounded-xl p-3 border border-primary-200 hover:shadow-md transition-shadow"
          >
            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-ink-400 font-bold">Ketua Panitia Welcome Day</p>
              <p className="text-sm font-black text-ink-900">0812-5197-1250 (Ustadz Agus Cahyono)</p>
            </div>
          </a>
          <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-primary-200">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-ink-400 font-bold">Jam Layanan</p>
              <p className="text-sm font-black text-ink-900">Senin–Sabtu 08.00–16.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER INFO ─── */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Heart className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-primary-700 font-medium leading-relaxed">
          Kami sangat antusias menyambut kehadiran Ananda tercinta di Pesantren kami. 
          Semoga proses adaptasi berjalan lancar dan santri baru dapat segera nyaman di lingkungan pesantren. 
          Jika ada kendala atau pertanyaan, jangan ragu untuk menghubungi panitia kami.
        </p>
      </div>


      {/* Lightbox Modal */}
      {lightbox && (
        <div 
          className="fixed inset-0 z-[100] bg-ink-950/95 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 md:top-6 md:right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-5xl max-h-[85vh] flex-1">
            <Image 
              src={lightbox} 
              alt="Preview" 
              fill 
              className="object-contain" 
            />
          </div>
          <a 
            href={lightbox} 
            download 
            onClick={(e) => e.stopPropagation()}
            className="mt-6 flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-500 transition-colors shadow-lg active:scale-95"
          >
            <Download className="w-5 h-5" /> Download Gambar
          </a>
        </div>
      )}
    </div>
  );
}
