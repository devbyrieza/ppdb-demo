"use client";

import { useState, useEffect } from "react";
import { 
  Users, Wallet, Loader2,
  RefreshCw, 
  Clock, FileCheck, CheckCircle2, ClipboardCheck, 
  TrendingUp, ChevronRight, Activity
} from "lucide-react";
import { UserRole } from "@/lib/access-control";
import { motion } from "framer-motion";

/**
 * ─── ADMIN DASHBOARD PAGE (TEMPLATE DEMO) ───
 */

const StatWidget = ({ label, value, icon: Icon, color, trend, breakdown, highlighted }: any) => {
  const colorMap: any = {
    blue:    "from-teal-600 to-teal-800 shadow-teal",
    emerald: "from-emerald-600 to-emerald-700",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-600 to-purple-700",
    rose: "from-rose-600 to-rose-700",
    slate: "from-slate-600 to-slate-700",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border transition-all group relative overflow-hidden duration-300 ${
        highlighted 
          ? "bg-linear-to-br from-teal-900 via-teal-950 to-teal-900 text-white border-teal-850 shadow-premium-lg hover:shadow-premium-xl hover:scale-102" 
          : "bg-white text-teal-950 border-teal-100 shadow-premium-sm hover:shadow-premium-lg hover:scale-101"
      }`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors duration-500 ${
        highlighted 
          ? "bg-white/10 group-hover:bg-teal-500/10" 
          : "bg-teal-50 group-hover:bg-sand-100"
      }`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${colorMap[color] || colorMap.blue} flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full border ${
              highlighted
                ? "text-emerald-400 bg-white/5 border-white/10"
                : "text-emerald-600 bg-emerald-50 border-emerald-100"
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">{trend}</span>
            </div>
          )}
        </div>
        
        <div className="mb-6 lg:mb-8">
          <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] mb-2 ${
            highlighted ? "text-teal-300" : "text-teal-500"
          }`}>{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter italic ${
              highlighted ? "text-white" : "text-teal-950"
            }`}>{value}</h3>
            <span className={`text-xs font-bold ${
              highlighted ? "text-teal-300" : "text-teal-400"
            }`}>Orang</span>
          </div>
        </div>

        {breakdown && (
          <div className={`grid grid-cols-2 gap-4 pt-6 border-t ${
            highlighted ? "border-white/10" : "border-teal-100"
          }`}>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                  highlighted ? "text-teal-300" : "text-teal-500"
                }`}>MTs Putra</span>
                <span className={`text-base font-black leading-none ${
                  highlighted ? "text-white" : "text-teal-700"
                }`}>{breakdown.mts_l || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                  highlighted ? "text-teal-300" : "text-teal-500"
                }`}>MTs Putri</span>
                <span className={`text-base font-black leading-none ${
                  highlighted ? "text-pink-300" : "text-pink-500"
                }`}>{breakdown.mts_p || 0}</span>
              </div>
            </div>
            <div className={`space-y-4 border-l pl-4 ${
              highlighted ? "border-white/10" : "border-teal-100"
            }`}>
              <div className="flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                  highlighted ? "text-teal-300" : "text-teal-500"
                }`}>IL Putra</span>
                <span className={`text-base font-black leading-none ${
                  highlighted ? "text-white" : "text-teal-700"
                }`}>{breakdown.il_l || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                  highlighted ? "text-teal-300" : "text-teal-500"
                }`}>IL Putri</span>
                <span className={`text-base font-black leading-none ${
                  highlighted ? "text-pink-300" : "text-pink-500"
                }`}>{breakdown.il_p || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [stats, setStats] = useState<any>({ 
    total_pendaftar: 0, sudah_bayar: 0, diterima: 0, 
    daftar_ulang: 0, sudah_isi_data: 0, waiting_payment: 0, 
    waiting_docs: 0, stats_per_jenjang: [], berkas_lengkap: 0, cadangan: 0, ditolak: 0
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, sessionRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/auth/session")
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setRole(sData.session?.role);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const isAdminSuper = role === "admin_super" || role === "admin";
  const isAdminKeuangan = role === "admin_keuangan";
  const isAdminBerkas = role === "admin_berkas";

  const getBreakdown = (type: "total" | "lulus" | "ulang" | "cadangan" | "ditolak" | "berkas" | "bayar" | "data") => {
    const mts = stats.stats_per_jenjang.find((j: any) => j.jenjang === "MTS") || {};
    const il = stats.stats_per_jenjang.find((j: any) => j.jenjang === "IL") || {};

    if (type === "total") return { mts_l: mts.pendaftar_putra || 0, mts_p: mts.pendaftar_putri || 0, il_l: il.pendaftar_putra || 0, il_p: il.pendaftar_putri || 0 };
    if (type === "lulus") return { mts_l: mts.diterima_putra || 0, mts_p: mts.diterima_putri || 0, il_l: il.diterima_putra || 0, il_p: il.diterima_putri || 0 };
    if (type === "ulang") return { mts_l: mts.ulang_putra || 0, mts_p: mts.ulang_putri || 0, il_l: il.ulang_putra || 0, il_p: il.ulang_putri || 0 };
    if (type === "cadangan") return { mts_l: mts.cadangan_putra || 0, mts_p: mts.cadangan_putri || 0, il_l: il.cadangan_putra || 0, il_p: il.cadangan_putri || 0 };
    if (type === "ditolak") return { mts_l: mts.ditolak_putra || 0, mts_p: mts.ditolak_putri || 0, il_l: il.ditolak_putra || 0, il_p: il.ditolak_putri || 0 };
    if (type === "berkas") return { mts_l: mts.berkas_putra || 0, mts_p: mts.berkas_putri || 0, il_l: il.berkas_putra || 0, il_p: il.berkas_putri || 0 };
    if (type === "bayar") return { mts_l: mts.bayar_putra || 0, mts_p: mts.bayar_putri || 0, il_l: il.bayar_putra || 0, il_p: il.bayar_putri || 0 };
    return null;
  };

  if (loading && stats.total_pendaftar === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      <p className="text-sm font-bold text-teal-400 tracking-widest animate-pulse uppercase">Sinkronisasi Data...</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 pb-20 px-1">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-teal-950 tracking-tight italic">Dasbor Admin Al Fath</h1>
          <p className="text-xs sm:text-sm text-teal-600 font-medium mt-1">Pantau perkembangan pendaftaran santri secara langsung.</p>
        </div>
        <button onClick={fetchStats} className="p-3 bg-white border border-teal-100 rounded-2xl text-teal-600 hover:text-teal-600 transition-all shadow-premium-sm self-start sm:self-auto">
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* HERO SECTION */}
      <div className="bg-teal-900 rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <div className="max-w-xl w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest mb-6 lg:mb-8 border border-white/10">
              <Activity className="w-4 h-4 text-teal-300" />
              <span>Sistem Siap Saji: Live Demo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tighter leading-tight italic text-white">
              Pantau <span className="text-teal-300">Pendaftaran</span>
            </h2>
            <div className="flex items-center gap-8 sm:gap-12 mt-8 lg:mt-12">
              <div>
                <span className="text-3xl sm:text-5xl font-black text-white italic">{stats.total_pendaftar}</span>
                <p className="text-[10px] sm:text-[11px] font-black text-teal-200 uppercase tracking-widest mt-2">Pendaftar</p>
              </div>
              <div className="w-px h-12 sm:h-16 bg-white/20" />
              <div>
                <span className="text-3xl sm:text-5xl font-black text-teal-300 italic">{stats.sudah_bayar}</span>
                <p className="text-[10px] sm:text-[11px] font-black text-teal-200 uppercase tracking-widest mt-2">Tervalidasi</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto">
             <div className="bg-white/5 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 flex flex-col items-center">
                <p className="text-[9px] sm:text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2 sm:mb-4 text-center">Lulus Seleksi</p>
                <p className="text-2xl sm:text-4xl font-black text-emerald-400 italic">{stats.diterima}</p>
             </div>
             <div className="bg-white/5 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 flex flex-col items-center">
                <p className="text-[9px] sm:text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2 sm:mb-4 text-center">Daftar Ulang</p>
                <p className="text-2xl sm:text-4xl font-black text-sand-300 italic">{stats.daftar_ulang}</p>
             </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {isAdminSuper && (<>
          <StatWidget label="Total Pendaftar" value={stats.total_pendaftar} icon={Users} color="blue" trend="+5% minggu ini" breakdown={getBreakdown("total")} highlighted={false} />
          <StatWidget label="Sudah Bayar Pendaftaran" value={stats.sudah_bayar} icon={Wallet} color="emerald" breakdown={getBreakdown("bayar")} highlighted={false} />
          <StatWidget label="Data Lengkap" value={stats.sudah_isi_data} icon={FileCheck} color="purple" highlighted={false} />
          <StatWidget label="Berkas Lengkap" value={stats.berkas_lengkap} icon={ClipboardCheck} color="purple" breakdown={getBreakdown("berkas")} highlighted={false} />
          <StatWidget label="Diterima" value={stats.diterima} icon={CheckCircle2} color="emerald" breakdown={getBreakdown("lulus")} highlighted={false} />
          <StatWidget label="Cadangan" value={stats.cadangan} icon={Clock} color="slate" breakdown={getBreakdown("cadangan")} highlighted={false} />
          <StatWidget label="Ditolak" value={stats.ditolak} icon={Activity} color="rose" breakdown={getBreakdown("ditolak")} highlighted={false} />
          <StatWidget label="Sudah Daftar Ulang" value={stats.daftar_ulang} icon={Wallet} color="amber" breakdown={getBreakdown("ulang")} highlighted={false} />
        </>)}

        {isAdminBerkas && (
          <>
            <StatWidget label="Total Pendaftar" value={stats.total_pendaftar} icon={Users} color="blue" />
            <StatWidget label="Lengkap Berkas" value={stats.sudah_isi_data} icon={FileCheck} color="purple" />
            <StatWidget label="Menunggu Verifikasi" value={stats.waiting_docs} icon={Clock} color="amber" />
          </>
        )}

        {isAdminKeuangan && (
          <>
            <StatWidget label="Total Pendaftar" value={stats.total_pendaftar} icon={Users} color="blue" />
            <StatWidget label="Sudah Bayar" value={stats.sudah_bayar} icon={Wallet} color="emerald" />
            <StatWidget label="Menunggu Verifikasi" value={stats.waiting_payment} icon={Clock} color="amber" />
          </>
        )}
      </div>

      {/* SUMMARY INSIGHTS - Hanya untuk Admin Operasional */}
      {!isAdminSuper && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Statistik card — bg teal-800 (valid & dark enough for white text) */}
        <div className="bg-teal-800 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
            <TrendingUp className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-black mb-6 sm:mb-8 tracking-tight flex items-center gap-3 italic text-white">
              <div className="w-2 h-8 bg-emerald-400 rounded-full" />
              Statistik Pendaftaran
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <p className="text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2">Total Lunas</p>
                  <p className="text-2xl sm:text-4xl font-black text-white italic">{stats.sudah_bayar}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2">Data Komplit</p>
                  <p className="text-2xl sm:text-4xl font-black text-sand-300 italic">{stats.sudah_isi_data}</p>
                </div>
              </div>
              <div className="space-y-6 sm:space-y-8 pl-4 sm:pl-10 border-l border-white/20">
                <div>
                  <p className="text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2">Antrean Aktif</p>
                  <p className="text-2xl sm:text-4xl font-black text-amber-300 italic">{stats.waiting_payment + stats.waiting_docs}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2">Tingkat Kelulusan</p>
                  <p className="text-2xl sm:text-4xl font-black text-emerald-400 italic">
                    {stats.total_pendaftar > 0 ? Math.round((stats.diterima / stats.total_pendaftar) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border border-sand-100 p-5 sm:p-8 lg:p-10 shadow-premium-sm relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-black text-ink-900 mb-6 sm:mb-8 tracking-tight flex items-center gap-3 italic">
              <div className="w-2 h-8 bg-teal-600 rounded-full" />
              Aksi Cepat
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-sand-50 rounded-2xl sm:rounded-3xl border border-sand-100 hover:border-teal-200 transition-all cursor-default group/item gap-4">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-teal-600 transition-transform group-hover/item:scale-110 shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-ink-900 uppercase tracking-tighter leading-none mb-1">Audit Dokumen</p>
                    <p className="text-[11px] text-ink-400 font-bold">Verifikasi berkas santri baru</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 border-sand-200/60">
                  <span className="text-xl sm:text-2xl font-black text-ink-900 italic">{stats.waiting_docs}</span>
                  <ChevronRight className="w-5 h-5 text-ink-300 hidden sm:block" />
                </div>
              </div>
 
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-sand-50 rounded-2xl sm:rounded-3xl border border-sand-100 hover:border-emerald-200 transition-all cursor-default group/item gap-4">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 transition-transform group-hover/item:scale-110 shrink-0">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-ink-900 uppercase tracking-tighter leading-none mb-1">Audit Keuangan</p>
                    <p className="text-[11px] text-ink-400 font-bold">Konfirmasi bukti transfer</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 border-sand-200/60">
                  <span className="text-xl sm:text-2xl font-black text-ink-900 italic">{stats.waiting_payment}</span>
                  <ChevronRight className="w-5 h-5 text-ink-300 hidden sm:block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
