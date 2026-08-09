"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── ICONS ───
import {
  User,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  FileText,
  Target,
} from "lucide-react";

// ─── COMPONENTS & UTILS ───
import ProgressTracker from "./components/ProgressTracker";
import {
  getNextStep,
  formatStatusDisplay,
  StatusProses,
} from "@/lib/access-control";

/**
 * DashboardPendaftarPage
 * Template Demo Version.
 */
export default function DashboardPendaftarPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    nama: "Pendaftar",
    nomorPendaftaran: "-",
    status: "draft" as StatusProses,
    tipePendaftaran: "",
    lastUpdate: new Date().toISOString(),
    schedulesAvailable: false,
    pengumuman: null as any,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) throw new Error("Session invalid");
        const session = await sessionRes.json();

        if (session.pendaftar_id) {
          const statusRes = await fetch(
            `/api/pendaftar/status?pendaftar_id=${session.pendaftar_id}`,
          );
          if (!statusRes.ok) throw new Error("Sync failed");
          const statusData = await statusRes.json();

          setData({
            nama: (statusData.nama_lengkap || "Pendaftar").split(" ")[0],
            nomorPendaftaran: statusData.nomor_pendaftaran || "-",
            status: statusData.status_proses || "draft",
            tipePendaftaran: statusData.tipe_pendaftaran || "",
            lastUpdate: statusData.updated_at || new Date().toISOString(),
            schedulesAvailable: !!statusData.schedules_available,
            pengumuman: statusData.pengumuman || null,
          });
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const statusInfo = formatStatusDisplay(data.status);
  const nextStep = getNextStep(data.status, data.tipePendaftaran);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <ProgressTracker currentStatus={data.status} />

      <HeroBanner
        nama={data.nama}
        nomorPendaftaran={data.nomorPendaftaran}
        lastUpdate={data.lastUpdate}
      />

      {nextStep && <GuidedActionCard nextStep={nextStep} />}

      <StatusGrid
        status={data.status}
        statusLabel={statusInfo.label}
        pengumuman={data.pengumuman}
      />

      <SupportCenter />
    </div>
  );
}

// ─── INTERNAL COMPONENTS ───

function HeroBanner({ nama, nomorPendaftaran, lastUpdate }: any) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3.5rem] bg-linear-to-br from-primary-700 to-primary-900 text-white p-6 sm:p-5 md:p-8 shadow-2xl border border-primary-600/50">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-400/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-10">
        <div className="flex-1 space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[9px] sm:text-[10px] tracking-[0.2em] font-black uppercase border border-white/20 text-secondary-200">
              PENDIDIKAN INTERNASIONAL
            </span>
            <span className="flex items-center gap-2 text-xs font-bold text-primary-100/70">
              <Clock className="w-4 h-4" />
              Pembaruan:{" "}
              {new Date(lastUpdate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl sm:text-3xl md:text-5xl lg:text-7xl font-black leading-[1.1] font-display tracking-tight text-white italic">
            Selamat Datang, <br />
            <span className="text-secondary-400 not-italic uppercase drop-shadow-lg">
              {nama}!
            </span>
          </h1>
          <p className="text-primary-100 text-base md:text-xl font-medium max-w-xl opacity-80 leading-relaxed italic border-l-4 border-secondary-500/50 pl-4 sm:pl-6">
            "Memberdayakan generasi pemimpin Islam global berikutnya."
          </p>
        </div>
        <div className="flex-1 lg:flex-none w-full sm:w-auto bg-black/20 backdrop-blur-xl px-6 sm:px-5 md:px-8 py-5 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 text-center">
          <p className="text-[10px] font-black uppercase text-secondary-200/60 mb-1 tracking-[0.2em]">
            ID PENDAFTARAN
          </p>
          <p className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter">
            {nomorPendaftaran}
          </p>
        </div>
      </div>
    </div>
  );
}

function GuidedActionCard({ nextStep }: any) {
  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border-2 border-primary-100 shadow-xl shadow-primary/5 overflow-hidden group">
      <div className="flex flex-col md:flex-row items-stretch">
        <div className="bg-secondary-400 p-6 sm:p-5 md:p-8 flex flex-col items-center justify-center text-primary-950 min-w-[200px]">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Target className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
            Langkah
          </p>
          <p className="text-2xl sm:text-3xl font-black">BERIKUTNYA</p>
        </div>
        <div className="flex-1 p-6 sm:p-5 md:p-8 space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-primary-950 mb-2">
              Apa yang harus saya lakukan sekarang?
            </h2>
            <p className="text-base sm:text-lg text-ink-600 font-medium italic">
              "Silakan klik tombol untuk{" "}
              <span className="text-primary-700 font-black not-italic">
                {nextStep.action.toLowerCase()}
              </span>
              ."
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href={nextStep.href}
              className="px-6 sm:px-6 md:px-10 py-4 sm:py-5 bg-primary-700 hover:bg-primary-800 text-white rounded-2xl font-black uppercase text-xs sm:text-sm shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 group/btn w-full sm:w-auto justify-center"
            >
              Mulai Sekarang{" "}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusGrid({ status, statusLabel, pengumuman }: any) {
  const isFinalStatus = ["announced", "accepted", "rejected", "enrolled", "enrolled_full"].includes(status);

  const items = [
    {
      label: "Status Saat Ini",
      val: statusLabel,
      desc: "Tahap pendaftaran Anda saat ini",
      icon: ShieldCheck,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Ujian Seleksi",
      val: ["tested", "announced", "accepted", "enrolled"].includes(status)
        ? "Selesai"
        : "Menunggu",
      desc: "Jadwal dan hasil ujian",
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Hasil Akhir",
      val: (pengumuman && isFinalStatus) ? pengumuman.status_kelulusan : "Belum Dirilis",
      desc: "Hasil penerimaan santri",
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
      {items.map((item, id) => (
        <div
          key={id}
          className="bg-white rounded-[1.5rem] border border-surface-200 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-ink-500 uppercase tracking-wider">{item.label}</div>
              <div className="text-xl font-black text-ink-950 mt-1">{item.val}</div>
            </div>
          </div>
          <div className="text-xs text-ink-500 border-t border-surface-100 pt-3">{item.desc}</div>
        </div>
      ))}
    </div>
  );
}

function SupportCenter() {
  return (
    <div className="bg-primary-950 text-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-12 relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-400 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 text-center md:text-left">
        <div className="flex-1 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-secondary-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary-200">
              PUSAT BANTUAN PPDB
            </span>
          </div>
          <h3 className="font-black text-2xl sm:text-3xl md:text-4xl font-display leading-tight">
            Butuh Bantuan? <br />
            <span className="text-secondary-400">Hubungi Tim Kami!</span>
          </h3>
          <p className="text-primary-100 text-sm sm:text-base font-medium opacity-80 max-w-xl">
            Jangan ragu untuk bertanya. Tim kami siap membantu Anda menyelesaikan
            pendaftaran dengan lancar.
          </p>
        </div>
        <div className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
          <a
            href="https://wa.me/6281285300800"
            target="_blank"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-secondary-400 text-primary-950 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-secondary-300 shadow-xl transition-all hover:scale-105 active:scale-95 w-full"
          >
            Chat di WhatsApp
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ───

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-vh-50 p-20">
      <Clock className="w-10 h-10 animate-spin text-primary-600" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-20 text-center text-red-600 font-bold bg-white rounded-4xl border border-red-100 shadow-xl">
      {message}
    </div>
  );
}
