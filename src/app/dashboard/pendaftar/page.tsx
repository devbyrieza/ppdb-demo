"use client";

import { useEffect, useState } from "react";
import {
  User,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  FileText,
  Target
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
    nama: "Pendaftar",
    nomorPendaftaran: "-",
    status: "draft" as StatusProses,
    lastUpdate: new Date().toISOString(),
    schedulesAvailable: false,
    pengumuman: null as any
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) throw new Error("Gagal mengambil sesi");
        const session = await sessionRes.json();
        
        if (session.pendaftar_id) {
          const statusRes = await fetch(`/api/pendaftar/status?pendaftar_id=${session.pendaftar_id}`);
          if (!statusRes.ok) throw new Error("Gagal mengambil status");
          const statusData = await statusRes.json();

          setData({
            nama: (statusData.nama_lengkap || "Pendaftar").split(' ')[0],
            nomorPendaftaran: statusData.nomor_pendaftaran || "-",
            status: statusData.status_proses || "draft",
            lastUpdate: statusData.updated_at || new Date().toISOString(),
            schedulesAvailable: !!statusData.schedules_available,
            pengumuman: statusData.pengumuman || null
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

  if (loading) return <div className="flex items-center justify-center min-vh-50 p-20"><Loader2 className="w-10 h-10 animate-spin text-brand-blue-600" /></div>;
  if (error) return <div className="p-20 text-center text-red-600 font-bold bg-white rounded-4xl border border-red-100 shadow-xl">{error}</div>;

  const statusInfo = formatStatusDisplay(data.status);
  const nextStep = getNextStep(data.status);

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-700">
      <ProgressStepper currentStatus={data.status} />

      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl md:rounded-4xl bg-linear-to-br from-brand-blue-700 to-brand-blue-900 text-white p-6 sm:p-8 md:p-16 shadow-2xl app-card border border-brand-blue-600">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-yellow-400/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-8">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] tracking-widest font-black uppercase border border-white/20">PPDB 2026/2027</span>
              <span className="flex items-center gap-2 text-xs font-bold text-brand-yellow-100">
                <Clock className="w-4 h-4" />
                Ditinjau {new Date(data.lastUpdate).toLocaleDateString('id-ID')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-3 md:mb-6 leading-none font-display tracking-tight text-white italic">Ahlan Wa Sahlan, <br /> <span className="text-brand-yellow-300 not-italic uppercase">{data.nama}!</span></h1>
            <p className="text-brand-blue-100 text-sm sm:text-base md:text-xl lg:text-2xl font-bold max-w-xl opacity-90 leading-relaxed italic hidden sm:block">"Berdakwah dengan Akhlak, Belajar dengan Ikhlas."</p>
          </div>
          <div className="flex flex-row md:flex-col gap-3 md:gap-6 w-full md:w-auto">
             <div className="flex-1 md:flex-none bg-white/10 backdrop-blur-md px-5 py-4 md:px-10 md:py-6 rounded-[1.5rem] border border-white/10 text-center shadow-inner">
                <p className="text-[9px] md:text-[10px] font-black uppercase text-brand-yellow-100 opacity-60 mb-1 md:mb-2 tracking-widest">Nomor Pendaftaran</p>
                <p className="font-mono text-xl md:text-4xl font-black text-white">{data.nomorPendaftaran}</p>
             </div>
             {nextStep && (
               <Link href={nextStep.href} className="flex-1 md:flex-none bg-brand-yellow-400 hover:bg-brand-yellow-300 text-brand-blue-950 px-5 py-4 md:px-10 md:py-5 rounded-[1.5rem] font-black uppercase text-xs shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 group">
                 {nextStep.action} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </Link>
             )}
          </div>
        </div>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: "Status Pendaftaran", val: statusInfo.label, icon: ShieldCheck, color: statusInfo.color.split(' ')[1], bg: statusInfo.color.split(' ')[0] },
          { label: "Kelengkapan Berkas", val: ['docs_verified', 'scheduled', 'tested', 'announced', 'accepted'].includes(data.status) ? "Tercatat" : "Proses", icon: FileText, color: "text-brand-blue-600", bg: "bg-brand-yellow-50" },
          { label: "Ujian Seleksi", val: ['tested', 'announced', 'accepted'].includes(data.status) ? "Telah Diikuti" : "Menunggu", icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Hasil Pengumuman", val: data.pengumuman ? data.pengumuman.status_kelulusan : "Belum Rilis", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" }
        ].map((item, id) => (
          <div key={id} className="bg-white p-8 rounded-4xl border border-brand-yellow-100 shadow-sm app-card group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-clay-sm group-hover:scale-110 transition-transform ${item.bg}`}>
              <item.icon className={`w-8 h-8 ${item.color}`} />
            </div>
            <p className="text-[10px] font-black text-ink-300 uppercase tracking-widest mb-2">{item.label}</p>
            <p className={`text-2xl font-black text-brand-blue-950 font-display leading-tight`}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Support Center */}
      <div className="bg-brand-yellow-50 border-2 border-brand-yellow-200 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 app-card relative overflow-hidden group">
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/40 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border border-brand-yellow-300 shadow-xl group-hover:rotate-12 transition-transform">
            <AlertCircle className="w-10 h-10 text-brand-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-ink-950 text-2xl md:text-3xl font-display leading-tight mb-2">Ada Kendala Teknis?</h3>
            <p className="text-ink-600 text-lg md:text-xl font-bold">Tim IT dan Panitia siap melayani Anda setiap jam kerja.</p>
          </div>
        </div>
        <a href="https://wa.me/6281285300800" target="_blank" className="relative z-10 px-12 py-5 bg-brand-yellow-400 text-brand-blue-950 font-black text-sm uppercase tracking-widest rounded-3xl hover:bg-brand-yellow-300 shadow-2xl transition-all hover:scale-105 active:scale-95 text-center w-full md:w-auto font-display">
          Layanan WhatsApp
        </a>
      </div>
    </div>
  );
}

function Loader2(props: any) {
  return <Clock {...props} className={props.className + " animate-spin"} />;
}
