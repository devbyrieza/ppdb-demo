"use client";

import { useEffect, useState } from "react";
import {
  User,
  CheckCircle,
  Clock,
  ArrowRight,
  Calendar,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  FileText
} from "lucide-react";
import Link from "next/link";
import ProgressStepper from "@/components/dashboard/ProgressStepper";
import {
  getNextStep,
  formatStatusDisplay,
  type StatusProses
} from "@/lib/access-control";

export default function DashboardPendaftarPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    nama: "",
    nomorPendaftaran: "",
    status: "draft" as StatusProses,
    lastUpdate: new Date().toISOString(),
    pengumuman: null as {
      status_kelulusan: string;
      catatan?: string;
      surat_keputusan_url?: string;
    } | null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) {
          throw new Error(`Gagal mengambil sesi: ${sessionRes.status}`);
        }

        const session = await sessionRes.json();

        if (!session.pendaftar_id) {
          setError("Sesi tidak valid. Silakan login ulang.");
          setLoading(false);
          return;
        }

        const statusRes = await fetch(`/api/pendaftar/status?pendaftar_id=${session.pendaftar_id}`);
        if (!statusRes.ok) {
          const errorText = await statusRes.text();
          throw new Error(`Gagal mengambil status: ${statusRes.status} - ${errorText}`);
        }

        const statusData = await statusRes.json();

        const fullName = statusData.nama_lengkap || session.full_name || session.name || "Pendaftar";
        const firstName = fullName.split(' ')[0]; // Ambil kata pertama saja

        setData({
          nama: firstName,
          nomorPendaftaran: statusData.nomor_pendaftaran || "-",
          status: statusData.status_proses || "draft",
          lastUpdate: statusData.updated_at || new Date().toISOString(),
          pengumuman: statusData.pengumuman || null
        });
      } catch (e: any) {
        console.error("Failed to fetch dashboard data", e);
        setError(e?.message || "Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusInfo = formatStatusDisplay(data.status);
  const nextStep = getNextStep(data.status);

  if (loading) {
    return <div className="animate-pulse flex flex-col gap-4">
      <div className="h-48 bg-stone-200 rounded-3xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-stone-200 rounded-2xl"></div>
        <div className="h-32 bg-stone-200 rounded-2xl"></div>
        <div className="h-32 bg-stone-200 rounded-2xl"></div>
      </div>
    </div>;
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-white/5 border border-surface-200 dark:border-white/10 rounded-3xl p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-ink-950 mb-2">Gagal Memuat Data</h3>
        <p className="text-ink-600 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            Muat Ulang
          </button>
          <Link
            href="/login"
            className="px-6 py-3 bg-surface-100 text-ink-700 font-bold rounded-xl hover:bg-surface-200 transition-colors"
          >
            Login Ulang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Stepper Tracking */}
      <ProgressStepper currentStatus={data.status} />

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-maroon-700 to-maroon-900 text-white shadow-lg border border-maroon-600 app-card">
        {/* Soft decorative blur */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cream-50/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <User className="w-64 h-64" />
        </div>
        <div className="relative z-10 px-8 py-10 md:px-12 md:py-14">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] tracking-widest font-black uppercase border border-white/20 shadow-sm">
                Tahun Ajaran 2026/2027
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-cream-100/90 ml-1">
                <Clock className="w-3.5 h-3.5" />
                Pembaruan: {new Date(data.lastUpdate).toLocaleDateString('id-ID')}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight text-white drop-shadow-sm font-display">
              Ahlan Wa Sahlan, <br />
              <span className="text-cream-300">{data.nama}</span>
            </h1>
            <p className="text-cream-50/80 text-base md:text-lg mb-8 max-w-lg font-medium">
              Selamat datang di dashboard pendaftaran. Pantau status seleksi dan lengkapi berkas Anda di sini.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-[1.5rem] shadow-sm border border-white/20 app-card flex-shrink-0">
                <p className="text-[10px] text-cream-200/80 font-black mb-1.5 uppercase tracking-widest pl-1">No. Pendaftar</p>
                <p className="font-mono text-xl md:text-2xl font-black text-white tracking-wider bg-black/20 px-3 py-1 rounded-lg inline-block">{data.nomorPendaftaran}</p>
              </div>

              {nextStep && (
                <Link
                  href={nextStep.href}
                  className="bg-cream-50 px-6 py-4 rounded-[1.5rem] shadow-lg border border-cream-200 flex items-center gap-4 hover:bg-white hover:scale-[1.02] transition-all cursor-pointer group app-card flex-1"
                >
                  <div className="w-10 h-10 rounded-full bg-maroon-100 flex items-center justify-center border border-maroon-200 group-hover:bg-maroon-600 transition-colors flex-shrink-0">
                     <ArrowRight className="w-5 h-5 text-maroon-700 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-maroon-600/70 mb-0.5">Tugas Anda Selanjutnya</p>
                    <p className="font-black text-base md:text-lg text-maroon-950 group-hover:text-maroon-800 line-clamp-1">{nextStep.action}</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Grid */}
      <div className="pt-6">
        <h2 className="text-lg md:text-xl font-black text-ink-950 flex items-center gap-3 mb-6 uppercase tracking-widest">
          <div className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center border border-cream-200">
            <TrendingUp className="w-4 h-4 text-maroon-700" />
          </div>
          Status Berkelanjutan
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Status Utama */}
          <div className="app-card bg-white p-6 rounded-[1.5rem] shadow-sm border border-cream-200 hover:shadow-md hover:border-maroon-200 transition-all flex flex-col">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm ${statusInfo.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 ')}`}>
              <ShieldCheck className={`w-6 h-6 ${statusInfo.color}`} />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-ink-500 font-bold mb-1">Fase Saat Ini</p>
            <p className={`text-xl font-black ${statusInfo.color} leading-none`}>{statusInfo.label}</p>
          </div>

          {/* Card 2: Pembayaran */}
          <div className="app-card bg-white p-6 rounded-[1.5rem] shadow-sm border border-cream-200 hover:shadow-md hover:border-maroon-200 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-cream-100 border border-cream-200 text-maroon-600 flex items-center justify-center mb-5 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-ink-500 font-bold mb-1">Status Berkas</p>
            <p className="text-xl font-black text-ink-950 leading-none">
              {['docs_verified', 'scheduled', 'tested', 'announced', 'accepted'].includes(data.status)
                ? "Selesai"
                : "Belum Lengkap"}
            </p>
          </div>

          {/* Card 3: Jadwal */}
          <div className="app-card bg-white p-6 rounded-[1.5rem] shadow-sm border border-cream-200 hover:shadow-md hover:border-maroon-200 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-cream-100 border border-cream-200 text-maroon-600 flex items-center justify-center mb-5 shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-ink-500 font-bold mb-1">Status Ujian</p>
            <p className="text-xl font-black text-ink-950 leading-none">
              {['scheduled', 'tested', 'announced', 'accepted'].includes(data.status)
                ? "Telah Hadir"
                : "Belum Ujian"}
            </p>
          </div>

          {/* Card 4: Hasil */}
          <div className="app-card bg-white p-6 rounded-[1.5rem] shadow-sm border border-cream-200 hover:shadow-md hover:border-maroon-200 transition-all flex flex-col">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm ${data.pengumuman?.status_kelulusan === "Lulus" ? "bg-green-100 text-green-700" :
                data.pengumuman?.status_kelulusan === "Cadangan" ? "bg-yellow-100 text-yellow-700" :
                  data.pengumuman?.status_kelulusan === "Tidak Lulus" ? "bg-red-100 text-red-700" :
                    "bg-cream-100 text-maroon-600 border border-cream-200"
              }`}>
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-ink-500 font-bold mb-1">Kelulusan</p>
            <div className="flex flex-col">
              <p className="text-xl font-black text-ink-950 leading-none">
                {data.pengumuman ? data.pengumuman.status_kelulusan :
                  data.status === 'accepted' ? "Diterima" :
                    data.status === 'announced' ? "Diumumkan" :
                      "Menunggu Hasil"}
              </p>
              {data.pengumuman?.surat_keputusan_url && (
                <a
                  href={data.pengumuman.surat_keputusan_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-[10px] font-black uppercase text-maroon-700 hover:text-maroon-900 bg-cream-50 hover:bg-cream-100 py-1.5 px-3 rounded-md transition-colors inline-flex items-center gap-1.5 max-w-max border border-cream-200"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Lihat Info Kelulusan
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Action Callout */}
      <div className="mt-8 bg-cream-50 border border-cream-200 rounded-[2rem] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 app-card relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-cream-100/50 to-transparent pointer-events-none" />
        
        <div className="flex items-start md:items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-cream-200 shadow-sm">
            <AlertCircle className="w-6 h-6 text-maroon-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-ink-950 text-base md:text-lg mb-0.5">Bingung atau Ada Kendala?</h3>
            <p className="text-ink-600 text-xs md:text-sm font-medium">Panitia siap membantu Anda via WhatsApp setiap jam kerja.</p>
          </div>
        </div>
        <a href="https://wa.me/6285111524441" target="_blank" className="w-full md:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-maroon-900 text-white font-black text-sm uppercase tracking-widest rounded-pill hover:bg-cream-100 hover:text-maroon-900 transition-colors shadow-md text-center border border-transparent hover:border-maroon-900 active:scale-95 whitespace-nowrap z-10">
          Chat Panitia
        </a>
      </div>
    </div>
  );
}
