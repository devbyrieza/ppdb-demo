"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  LogOut,
  AlertCircle,
  Loader2,
  ChevronRight,
  MessageCircle,
  Phone,
  Heart,
  Star,
  Sparkles,
  Trophy,
  Calendar,
  ClipboardList,
  UserCheck,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
  IdCard,
} from "lucide-react";
import BackToHomeButton from "@/components/common/BackToHomeButton";
import { logoutUser } from "@/lib/auth";
import { hasReachedStatus, StatusProses } from "@/lib/access-control";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";

interface PendaftarData {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  jenjang: string;
  status_pendaftaran: StatusProses;
  created_at: string;
}

const STATUS_LABELS: Record<
  string,
  { label: string; color: string; bg: string; border: string; text: string; icon: any; message: string }
> = {
  draft: {
    label: "Belum Lengkap",
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: Clock,
    message: "Mari lengkapi data untuk melanjutkan ke tahap berikutnya!",
  },
  waiting_payment: {
    label: "Menunggu Pembayaran",
    color: "amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: Clock,
    message: "Tinggal satu langkah lagi! Silakan lakukan pembayaran untuk melanjutkan.",
  },
  payment_verification: {
    label: "Verifikasi Pembayaran",
    color: "blue",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: Loader2,
    message: "Pembayaran Anda sedang kami verifikasi. Harap menunggu dengan sabar ya!",
  },
  data_lengkap: {
    label: "Data Lengkap",
    color: "teal",
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    icon: CheckCircle,
    message: "Luar biasa! Semua data sudah lengkap. Menunggu verifikasi admin.",
  },
  verified: {
    label: "Terverifikasi",
    color: "green",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: CheckCircle,
    message: "Alhamdulillah! Pendaftaran Anda telah diverifikasi.",
  },
  tes_tertulis: {
    label: "Tes Tertulis",
    color: "purple",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    icon: FileText,
    message: "Persiapkan diri untuk tes tertulis. Semangat!",
  },
  lulus_tes_tertulis: {
    label: "Lulus Tes Tertulis",
    color: "green",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: CheckCircle,
    message: "Selamat! Anda lulus tes tertulis. Lanjutkan ke tahap berikutnya!",
  },
  tidak_lulus_tes_tertulis: {
    label: "Tidak Lulus",
    color: "red",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: AlertCircle,
    message: "Jangan berkecil hati. Tetap semangat untuk kesempatan berikutnya!",
  },
  scheduled: {
    label: "Dijadwalkan Ujian",
    color: "blue",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: Calendar,
    message: "Ujian Anda telah dijadwalkan. Cek detail jadwal ya!",
  },
  tested: {
    label: "Selesai Ujian",
    color: "teal",
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    icon: CheckCircle,
    message: "Ujian selesai! Menunggu hasil pengumuman. Do'akan yang terbaik!",
  },
  accepted: {
    label: "Diterima",
    color: "green",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: Trophy,
    message: "Alhamdulillah! Selamat, putra/putri Anda diterima di Ponpes Al-Andalus Al-Imam!",
  },
  payment_rejected: {
    label: "Pembayaran Bermasalah",
    color: "red",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: AlertCircle,
    message: "Bukti pembayaran Anda ditolak. Silakan cek catatan admin di bagian bawah atau hubungi panitia untuk informasi lebih lanjut.",
  },
  rejected: {
    label: "Perlu Perbaikan",
    color: "red",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: AlertCircle,
    message: "Mohon maaf, ada kendala pada berkas atau pembayaran Anda. Silakan hubungi panitia atau perbaiki data yang diperlukan.",
  },
};

// ========================================
// SUB-COMPONENTS
// ========================================

const ActionCard = ({
  href,
  icon: Icon,
  title,
  description,
  step,
  color,
  disabled,
  delay = 0
}: {
  href: string,
  icon: any,
  title: string,
  description: string,
  step: string,
  color: string,
  disabled: boolean,
  delay?: number
}) => {
  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={!disabled ? { y: -8, scale: 1.02 } : {}}
      className={`group h-full flex flex-col p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all duration-300 ${disabled
        ? "bg-surface-50 border-surface-100 opacity-60 grayscale cursor-not-allowed"
        : `bg-white border-surface-100 hover:border-${color}-500 hover:shadow-premium-xl`
        }`}
    >
      <div className="flex items-start justify-between mb-8">
        <div className={`w-14 h-14 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600 group-hover:scale-110 transition-transform shadow-premium-xs`}>
          <Icon className="w-7 h-7" />
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-${color}-50 text-${color}-700 border border-${color}-100`}>
          Tahap {step.replace('Step ', '')}
        </span>
      </div>

      <h3 className="text-xl font-display font-black text-ink-950 mb-3 group-hover:text-brown-700 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-ink-500 font-medium leading-relaxed mb-6 flex-grow">
        {description}
      </p>

      {!disabled && (
        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-${color}-600`}>
          <Sparkles className="w-4 h-4" />
          <span>Buka Bagian Ini</span>
        </div>
      )}
    </motion.div>
  );

  return disabled ? CardContent : <Link href={href}>{CardContent}</Link>;
};

// ========================================
// MAIN PAGE
// ========================================

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pendaftar, setPendaftar] = useState<PendaftarData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const response = await fetch("/api/dashboard/pendaftar-data");
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setPendaftar(result.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar?")) return;
    setIsLoggingOut(true);
    const result = await logoutUser();
    if (result.success) {
      router.push("/login");
      router.refresh();
    } else {
      alert("Gagal logout. Silakan coba lagi.");
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-brown-50 border-t-brown-600 rounded-full mx-auto mb-6"
          />
          <p className="text-xl font-display font-black text-ink-950">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!pendaftar) return null;

  const statusInfo = STATUS_LABELS[pendaftar.status_pendaftaran] || {
    label: pendaftar.status_pendaftaran,
    color: "gray",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    icon: Clock,
    message: "Status pendaftaran Anda sedang diproses.",
  };
  const StatusIcon = statusInfo.icon;

  return (
    <main className="min-h-screen bg-white relative overflow-hidden pb-24">
      <BackToHomeButton position="top-left" />

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brown-50/50 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER - PREMIUM & WELCOMING
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative pt-20 pb-12 md:pt-32 md:pb-24 border-b border-surface-100 overflow-hidden">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="w-10 h-10 rounded-xl bg-brown-50 flex items-center justify-center text-brown-600 shadow-premium-xs">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div className="h-0.5 w-12 bg-brown-100 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brown-600">Santri Portal</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-ink-950 mb-6 leading-tight tracking-tight"
              >
                Ahlan wa Sahlan, <br />
                <span className="text-brown-600">{pendaftar.nama_lengkap.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()).split(" ")[0]}!</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-ink-700 font-medium max-w-2xl leading-relaxed"
              >
                Pusat kendali pendaftaran santri baru T.A 2026/2027. Pantau progres dan lengkapi administrasi dengan mudah di sini.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="group flex items-center gap-3 px-8 py-4 bg-white border border-surface-200 rounded-2xl font-black text-xs uppercase tracking-widest text-ink-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-premium-sm active:scale-95 disabled:opacity-50"
              >
                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>{isLoggingOut ? "Memproses..." : "Logout"}</span>
              </button>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN CONTENT
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Container className="pt-16 md:pt-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* LEFT SIDE: FLOW & ACTIONS */}
          <div className="lg:col-span-8 space-y-12">

            {/* STATUS HIGHLIGHT (Airy Banner) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`p-8 sm:p-10 md:p-14 rounded-[3rem] border shadow-premium-lg relative overflow-hidden bg-gradient-to-br ${statusInfo.bg.replace('bg-', 'from-')} to-white ${statusInfo.border}`}
            >
              {/* Animated pulses depending on status */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8">
                  <div className={`w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center ${statusInfo.text} shadow-premium-sm border border-surface-100/50`}>
                    <StatusIcon className={`w-10 h-10 ${pendaftar.status_pendaftaran === 'payment_verification' ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 block">Status Saat Ini</span>
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-display font-black ${statusInfo.text} leading-none`}>
                      {statusInfo.label}
                    </h2>
                  </div>
                </div>

                <p className={`text-lg md:text-xl font-medium ${statusInfo.text} opacity-80 leading-relaxed max-w-2xl`}>
                  {statusInfo.message}
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <div className="px-6 py-2 rounded-full bg-white/40 backdrop-blur-md border border-black/5 text-[10px] font-black uppercase tracking-widest text-ink-700 shadow-sm">
                    ID: {pendaftar.id.substring(0, 8).toUpperCase()}
                  </div>
                  <div className="px-6 py-2 rounded-full bg-white/40 backdrop-blur-md border border-black/5 text-[10px] font-black uppercase tracking-widest text-ink-700 shadow-sm">
                    Registered: {new Date(pendaftar.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ACTION GRID */}
            <div>
              <div className="flex items-center justify-between mb-8 px-4">
                <h3 className="text-2xl font-display font-black text-ink-950">Langkah Pendaftaran</h3>
                <div className="h-0.5 flex-1 mx-8 bg-surface-50 rounded-full" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <ActionCard
                  href="/dashboard/pendaftar/pembayaran-pendaftaran"
                  icon={CreditCard}
                  title="Biaya Pendaftaran"
                  description="Selesaikan pembayaran biaya pendaftaran santri baru T.A 2026/2027 sebesar Rp 200.000."
                  step="Step 01"
                  color="gold"
                  disabled={false}
                  delay={0.5}
                />
                <ActionCard
                  href="/dashboard/pendaftar"
                  icon={User}
                  title="Lengkapi Biodata"
                  description="Isi formulir data diri, kartu keluarga, asatidz rekomendasi, dan riwayat kesehatan santri."
                  step="Step 02"
                  color="teal"
                  disabled={!hasReachedStatus(pendaftar.status_pendaftaran, "verified")}
                  delay={0.6}
                />
                <ActionCard
                  href="/dashboard/pendaftar/upload-berkas"
                  icon={FileText}
                  title="Upload Dokumen"
                  description="Unggah berkas persyaratan seperti Akta Kelahiran, Kartu Keluarga, dan KTP Orang Tua (PNG/JPG/PDF)."
                  step="Step 03"
                  color="brown"
                  disabled={!hasReachedStatus(pendaftar.status_pendaftaran, "data_completed")}
                  delay={0.7}
                />
                <ActionCard
                  href="/dashboard/pendaftar/undangan-seleksi"
                  icon={ClipboardList}
                  title="Undangan Seleksi"
                  description="Tinjau jadwal ujian Al-Qur'an, tes akademik, dan sesi wawancara setelah berkas terverifikasi."
                  step="Step 04"
                  color="purple"
                  disabled={!hasReachedStatus(pendaftar.status_pendaftaran, "docs_verified")}
                  delay={0.8}
                />
                <ActionCard
                  href="/dashboard/pendaftar/pengumuman"
                  icon={Trophy}
                  title="Hasil Kelulusan"
                  description="Cek status akhir seleksi penerimaan santri baru Pondok Pesantren Al-Andalus Al-Imam di sini."
                  step="Step 05"
                  color="blue"
                  disabled={!hasReachedStatus(pendaftar.status_pendaftaran, "tested")}
                  delay={0.9}
                />
                <ActionCard
                  href="/dashboard/pendaftar/daftar-ulang"
                  icon={UserCheck}
                  title="Daftar Ulang"
                  description="Selesaikan proses registrasi akhir dan administrasi biaya pendidikan bagi santri yang diterima."
                  step="Step 06"
                  color="green"
                  disabled={!hasReachedStatus(pendaftar.status_pendaftaran, "accepted")}
                  delay={1.0}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SIDEBAR INFO */}
          <aside className="lg:col-span-4 space-y-8">

            {/* CARD: NOMOR PENDAFTARAN */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-10 rounded-[3rem] shadow-premium-lg border border-surface-100 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brown-400 to-gold-500" />
              <div className="w-16 h-16 rounded-2xl bg-brown-50 flex items-center justify-center text-brown-600 mb-6 shadow-premium-xs">
                <IdCard className="w-8 h-8" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ink-600 mb-2">No. Registrasi</p>
              <h4 className="text-3xl font-display font-black text-ink-950 mb-6">
                {pendaftar.nomor_pendaftaran}
              </h4>
              <div className="w-full h-px bg-surface-50 mb-6" />
              <div className="flex items-center gap-3 text-ink-600">
                <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
                <span className="font-bold text-sm">
                  {pendaftar.jenjang === "MTs" ? "Madrasah Tsanawiyah" : "I'dad Lughowi"}
                </span>
              </div>
            </motion.div>

            {/* CARD: HELP & SUPPORT */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white p-10 rounded-[3rem] shadow-premium-lg border border-surface-100 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-green-500" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mb-8 border border-teal-100 shadow-premium-xs">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-display font-black mb-4 text-ink-950">Butuh Bantuan?</h4>
                <p className="text-sm text-ink-600 font-medium leading-relaxed mb-8">
                  Ada kendala saat pengisian data atau pembayaran? Tim panitia kami siap membantu Anda setiap hari pukul 08:00 - 16:00 WIB.
                </p>

                <div className="space-y-4">
                  <a
                    href="https://wa.me/6285111524441"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-teal-50 border border-teal-100 hover:bg-teal-600 hover:text-white transition-all group/btn shadow-premium-xs"
                  >
                    <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg group-hover/btn:scale-110 group-hover/btn:bg-white group-hover/btn:text-teal-600 transition-all">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 group-hover/btn:text-white/80 leading-none mb-1">WhatsApp CS</p>
                      <p className="font-bold text-base text-teal-900 group-hover/btn:text-white transition-colors">0851-1152-4441</p>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* QUICK LINKS / TOOLS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-surface-50 p-10 rounded-[3rem] border border-surface-100"
            >
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-600 mb-6 px-2">Sistem Akses</h5>
              <div className="space-y-2">
                <Link href="/kalender" className="flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-premium-sm transition-all group">
                  <span className="text-sm font-bold text-ink-600 group-hover:text-ink-950">Kalender Akademik</span>
                  <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-brown-500" />
                </Link>
                <div className="h-px bg-surface-100 mx-4" />
                <button onClick={() => window.location.reload()} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-premium-sm transition-all group text-left">
                  <span className="text-sm font-bold text-ink-600 group-hover:text-ink-950">Refresh Server</span>
                  <RefreshCw className="w-4 h-4 text-ink-300 group-hover:text-brown-500" />
                </button>
              </div>
            </motion.div>

          </aside>
        </div>
      </Container>
    </main>
  );
}
