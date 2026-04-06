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
    color: "brand-yellow",
    bg: "bg-brand-yellow-50",
    border: "border-brand-yellow-200",
    text: "text-brand-yellow-700",
    icon: Clock,
    message: "Mari lengkapi data untuk melanjutkan ke tahap berikutnya!",
  },
  waiting_payment: {
    label: "Menunggu Pembayaran",
    color: "brand-yellow",
    bg: "bg-brand-yellow-50",
    border: "border-brand-yellow-200",
    text: "text-brand-yellow-700",
    icon: Clock,
    message: "Tinggal satu langkah lagi! Silakan lakukan pembayaran untuk melanjutkan.",
  },
  payment_verification: {
    label: "Verifikasi Pembayaran",
    color: "brand-blue",
    bg: "bg-brand-blue-50",
    border: "border-brand-blue-200",
    text: "text-brand-blue-700",
    icon: Loader2,
    message: "Pembayaran Anda sedang kami verifikasi. Harap menunggu dengan sabar ya!",
  },
  data_lengkap: {
    label: "Data Lengkap",
    color: "emerald",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: CheckCircle,
    message: "Luar biasa! Semua data sudah lengkap. Menunggu verifikasi admin.",
  },
  verified: {
    label: "Terverifikasi",
    color: "emerald",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: CheckCircle,
    message: "Alhamdulillah! Pendaftaran Anda telah diverifikasi.",
  },
  tes_tertulis: {
    label: "Tes Tertulis",
    color: "brand-blue",
    bg: "bg-brand-blue-50",
    border: "border-brand-blue-200",
    text: "text-brand-blue-700",
    icon: FileText,
    message: "Persiapkan diri untuk tes tertulis. Semangat!",
  },
  lulus_tes_tertulis: {
    label: "Lulus Tes Tertulis",
    color: "emerald",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
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
    color: "brand-blue",
    bg: "bg-brand-blue-50",
    border: "border-brand-blue-200",
    text: "text-brand-blue-700",
    icon: Calendar,
    message: "Ujian Anda telah dijadwalkan. Cek detail jadwal ya!",
  },
  tested: {
    label: "Selesai Ujian",
    color: "emerald",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: CheckCircle,
    message: "Ujian selesai! Menunggu hasil pengumuman. Do'akan yang terbaik!",
  },
  accepted: {
    label: "Diterima",
    color: "emerald",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: Trophy,
    message: "Alhamdulillah! Selamat, putra/putri Anda diterima di Pesantren Al-Andalus Ulul Albaab!",
  },
  payment_rejected: {
    label: "Pembayaran Bermasalah",
    color: "red",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: AlertCircle,
    message: "Bukti pembayaran Anda ditolak. Silakan cek catatan admin atau hubungi panitia.",
  },
  rejected: {
    label: "Perlu Perbaikan",
    color: "red",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: AlertCircle,
    message: "Mohon maaf, ada kendala pada berkas atau pembayaran Anda. Silakan hubungi panitia.",
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
      className={`group h-full flex flex-col p-6 sm:p-8 rounded-[2.5rem] border-2 transition-all duration-300 ${disabled
        ? "bg-ink-50/50 border-ink-100 opacity-60 grayscale cursor-not-allowed"
        : `bg-white border-ink-50 hover:border-brand-blue-500 hover:shadow-2xl hover:shadow-brand-blue-900/10`
        }`}
    >
      <div className="flex items-start justify-between mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-premium-xs transition-transform group-hover:scale-110 ${disabled ? "bg-ink-100 text-ink-300" : `bg-brand-blue-50 text-brand-blue-600`}`}>
          <Icon className="w-7 h-7" />
        </div>
        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${disabled ? "bg-ink-100 text-ink-400" : "bg-brand-yellow-400 text-brand-blue-950 shadow-sm"}`}>
          Tahap {step.replace('Step ', '')}
        </span>
      </div>

      <h3 className={`text-xl font-display font-black mb-3 transition-colors ${disabled ? "text-ink-300" : "text-brand-blue-950 group-hover:text-brand-blue-700"}`}>
        {title}
      </h3>
      <p className={`text-sm font-bold leading-relaxed mb-6 flex-grow ${disabled ? "text-ink-200" : "text-ink-400"}`}>
        {description}
      </p>

      {!disabled && (
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue-600 group-hover:translate-x-2 transition-transform">
          <span>Buka Bagian Ini</span>
          <ArrowRight className="w-4 h-4" />
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
            className="w-16 h-16 border-4 border-brand-blue-50 border-t-brand-blue-600 rounded-full mx-auto mb-6"
          />
          <p className="text-xl font-display font-black text-brand-blue-950 uppercase tracking-tighter">Memuat Portal Santri...</p>
        </div>
      </div>
    );
  }

  if (!pendaftar) return null;

  const statusInfo = STATUS_LABELS[pendaftar.status_pendaftaran] || {
    label: pendaftar.status_pendaftaran,
    color: "brand-blue",
    bg: "bg-brand-blue-50",
    border: "border-brand-blue-200",
    text: "text-brand-blue-700",
    icon: Clock,
    message: "Status pendaftaran Anda sedang diproses.",
  };
  const StatusIcon = statusInfo.icon;

  return (
    <main className="min-h-screen bg-white relative overflow-hidden pb-24">
      <BackToHomeButton position="top-left" />

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue-50/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />

      {/* HEADER */}
      <section className="relative pt-20 pb-12 md:pt-32 md:pb-24 border-b border-ink-50 overflow-hidden">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-blue-50 flex items-center justify-center text-brand-blue-600 border border-brand-blue-100 shadow-sm">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div className="h-0.5 w-12 bg-brand-blue-100 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue-600">Santri Portal</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-brand-blue-950 mb-6 leading-none tracking-tight"
              >
                Ahlan wa Sahlan, <br />
                <span className="text-brand-blue-700 bg-brand-blue-50 px-4 py-1 rounded-3xl inline-block mt-2">{pendaftar.nama_lengkap.split(" ")[0]}!</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-ink-300 font-bold max-w-2xl leading-relaxed tracking-tight"
              >
                T.A 2026/2027 • Pantau progres pendaftaranmu secara berkala di sini dengan mudah.
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
                className="group flex items-center gap-3 px-10 py-5 bg-white border border-ink-100 rounded-[2rem] font-black text-xs uppercase tracking-widest text-ink-300 hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-all shadow-xl shadow-ink-900/5 active:scale-95 disabled:opacity-50"
              >
                <LogOut className="w-5 h-5 transition-transform group-hover:rotate-12" />
                <span>{isLoggingOut ? "Keluar..." : "Logout"}</span>
              </button>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* MAIN CONTENT */}
      <Container className="pt-16 md:pt-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* LEFT SIDE: FLOW & ACTIONS */}
          <div className="lg:col-span-8 space-y-16">

            {/* STATUS HIGHLIGHT (Portal Card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`p-10 sm:p-14 md:p-16 rounded-[4rem] border-2 shadow-2xl relative overflow-hidden bg-gradient-to-br from-white to-ink-50/30 ${statusInfo.border}`}
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-10 mb-10">
                  <div className={`w-24 h-24 rounded-[2.5rem] bg-white flex items-center justify-center ${statusInfo.text} shadow-xl border border-ink-50`}>
                    <StatusIcon className={`w-12 h-12 ${pendaftar.status_pendaftaran === 'payment_verification' ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-ink-300 mb-2 block">Status Pendaftaran</span>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-display font-black leading-none tracking-tight ${statusInfo.text}`}>
                      {statusInfo.label}
                    </h2>
                  </div>
                </div>

                <p className={`text-xl md:text-2xl font-bold leading-relaxed max-w-2xl text-brand-blue-950`}>
                  {statusInfo.message}
                </p>

                <div className="mt-12 flex flex-wrap gap-4">
                  <div className="px-8 py-3 rounded-2xl bg-brand-blue-50 border border-brand-blue-100 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue-700 shadow-sm">
                    ID: {pendaftar.id.substring(0, 8).toUpperCase()}
                  </div>
                  <div className="px-8 py-3 rounded-2xl bg-brand-blue-50 border border-brand-blue-100 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue-700 shadow-sm">
                    Tgl: {new Date(pendaftar.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ACTION GRID */}
            <div>
              <div className="flex items-center justify-between mb-10 px-4">
                <h3 className="text-3xl font-display font-black text-brand-blue-950 tracking-tight">Alur Pendaftaran</h3>
                <div className="h-0.5 flex-1 mx-10 bg-ink-50 rounded-full" />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <ActionCard
                  href="/dashboard/pendaftar/pembayaran-pendaftaran"
                  icon={CreditCard}
                  title="Biaya Pendaftaran"
                  description="Selesaikan pembayaran administrasi sebesar Rp 200.000 untuk mengaktifkan formulir."
                  step="Step 01"
                  color="brand-blue"
                  disabled={false}
                  delay={0.5}
                />
                <ActionCard
                  href="/dashboard/pendaftar"
                  icon={User}
                  title="Lengkapi Biodata"
                  description="Isi formulir lengkap mulai dari data diri, keluarga, hingga riwayat kesehatan santri."
                  step="Step 02"
                  color="brand-blue"
                  disabled={!hasReachedStatus(pendaftar.status_pendaftaran, "verified")}
                  delay={0.6}
                />
                <ActionCard
                  href="/dashboard/pendaftar/upload-berkas"
                  icon={FileText}
                  title="Upload Dokumen"
                  description="Unggah dokumen persyaratan (Akte, KK, KTP) untuk diverifikasi oleh tim panitia."
                  step="Step 03"
                  color="brand-blue"
                  disabled={!hasReachedStatus(pendaftar.status_pendaftaran, "data_completed")}
                  delay={0.7}
                />
                <ActionCard
                  href="/dashboard/pendaftar/undangan-seleksi"
                  icon={ClipboardList}
                  title="Undangan Seleksi"
                  description="Lihat jadwal ujian Al-Qur'an dan wawancara setelah berkasmu dinyatakan lengkap."
                  step="Step 04"
                  color="brand-blue"
                  disabled={!hasReachedStatus(pendaftar.status_pendaftaran, "docs_verified")}
                  delay={0.8}
                />
                <ActionCard
                  href="/dashboard/pendaftar/pengumuman"
                  icon={Trophy}
                  title="Hasil Kelulusan"
                  description="Pengumuman hasil akhir seleksi penerimaan santri baru T.A 2026/2027."
                  step="Step 05"
                  color="brand-blue"
                  disabled={!hasReachedStatus(pendaftar.status_pendaftaran, "tested")}
                  delay={0.9}
                />
                <ActionCard
                  href="/dashboard/pendaftar/daftar-ulang"
                  icon={UserCheck}
                  title="Daftar Ulang"
                  description="Konfirmasi kedatangan dan penyelesaian administrasi bagi santri yang dinyatakan lulus."
                  step="Step 06"
                  color="brand-blue"
                  disabled={!hasReachedStatus(pendaftar.status_pendaftaran, "accepted")}
                  delay={1.0}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SIDEBAR */}
          <aside className="lg:col-span-4 space-y-10">

            {/* REG CARD */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-brand-blue-900/5 border border-ink-50 flex flex-col items-center text-center relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-blue-600 to-brand-yellow-500" />
              <div className="w-20 h-20 rounded-[2rem] bg-brand-blue-50 flex items-center justify-center text-brand-blue-600 mb-8 border border-brand-blue-100 shadow-sm transition-transform group-hover:scale-110">
                <IdCard className="w-10 h-10" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-ink-300 mb-2">No. Registrasi</p>
              <h4 className="text-4xl font-display font-black text-brand-blue-950 mb-8 leading-none tracking-tight">
                {pendaftar.nomor_pendaftaran}
              </h4>
              <div className="w-full h-px bg-ink-50 mb-8" />
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-brand-yellow-500 fill-brand-yellow-500 animate-pulse" />
                <span className="font-black text-sm text-brand-blue-700 uppercase tracking-widest leading-none">
                  {pendaftar.jenjang === "MTs" ? "Madrasah Tsanawiyah" : "I'dad Lughowi"}
                </span>
              </div>
            </motion.div>

            {/* SUPPORT CARD */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-brand-blue-950 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-yellow-400" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-blue-500/10 rounded-full blur-[60px] translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-brand-blue-900 flex items-center justify-center text-white mb-8 border border-brand-blue-800 shadow-lg">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h4 className="text-3xl font-display font-black mb-4 text-white leading-tight tracking-tight">Butuh <br />Bantuan?</h4>
                <p className="text-sm text-brand-blue-200 font-bold leading-relaxed mb-10 opacity-80">
                  Tim panitia kami siap membantu Bapak/Ibu setiap hari melalui layanan WhatsApp operasional.
                </p>

                <a
                  href="https://wa.me/6281285300800"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 p-6 rounded-[2rem] bg-white hover:bg-brand-yellow-400 transition-all group/btn shadow-xl active:scale-95"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-blue-600 text-white flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform">
                    <Phone className="w-7 h-7" />
                  </div>
                  <div className="text-left leading-none">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue-600 mb-2">WhatsApp CS</p>
                    <p className="font-black text-lg text-brand-blue-950">0812-85-300800</p>
                  </div>
                </a>
              </div>
            </motion.div>

          </aside>
        </div>
      </Container>
    </main>
  );
}
