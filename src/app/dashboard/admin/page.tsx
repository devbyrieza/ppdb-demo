"use client";

import { useState, useEffect } from "react";
import { Users, Wallet, Loader2, ArrowUpRight, Calendar as CalendarIcon, Download, RefreshCw, Clock, FileCheck, CheckCircle2, ClipboardCheck, TrendingUp } from "lucide-react";
import { UserRole } from "@/lib/access-control";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * ─── ADMIN DASHBOARD PAGE ───
 */

const StatWidget = ({ label, value, icon: Icon, color, trend, breakdown }: any) => {
  const colors: any = { 
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50" 
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${colors[color] || "bg-slate-50"}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="mb-4">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
      </div>

      {breakdown && (
        <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MTs Putra</span>
            <span className="text-sm font-black text-maroon-700 leading-none">{breakdown.mts_l || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IL Putra</span>
            <span className="text-sm font-black text-maroon-700 leading-none">{breakdown.il_l || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MTs Putri</span>
            <span className="text-sm font-black text-pink-600 leading-none">{breakdown.mts_p || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IL Putri</span>
            <span className="text-sm font-black text-pink-600 leading-none">{breakdown.il_p || 0}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [stats, setStats] = useState<any>({ total_pendaftar: 0, sudah_bayar: 0, diterima: 0, daftar_ulang: 0, sudah_isi_data: 0, waiting_payment: 0, waiting_docs: 0, stats_per_jenjang: [] });

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

  const getBreakdown = (type: "total" | "lulus" | "ulang") => {
    const mts = stats.stats_per_jenjang.find((j: any) => j.jenjang === "MTS") || {};
    const il = stats.stats_per_jenjang.find((j: any) => j.jenjang === "IL") || {};

    if (type === "total") return { mts_l: mts.pendaftar_putra || 0, mts_p: mts.pendaftar_putri || 0, il_l: il.pendaftar_putra || 0, il_p: il.pendaftar_putri || 0 };
    if (type === "lulus") return { mts_l: mts.diterima_putra || 0, mts_p: mts.diterima_putri || 0, il_l: il.diterima_putra || 0, il_p: il.diterima_putri || 0 };
    if (type === "ulang") return { mts_l: mts.ulang_putra || 0, mts_p: mts.ulang_putri || 0, il_l: il.ulang_putra || 0, il_p: il.ulang_putri || 0 };
    return null;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] gap-4"><Loader2 className="animate-spin text-maroon-600" /><p className="text-sm font-bold text-slate-400 tracking-widest animate-pulse uppercase">Sinkronisasi Data...</p></div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Monitoring pendaftaran santri secara real-time.</p>
        </div>
        <button onClick={fetchStats} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-maroon-600 transition-all shadow-sm"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isAdminSuper && (
          <>
            <StatWidget label="Total Pendaftar" value={stats.total_pendaftar} icon={Users} color="blue" trend="+5% week" breakdown={getBreakdown("total")} />
            <StatWidget label="Lulus Seleksi" value={stats.diterima} icon={CheckCircle2} color="emerald" breakdown={getBreakdown("lulus")} />
            <StatWidget label="Sudah Daftar Ulang" value={stats.daftar_ulang} icon={ClipboardCheck} color="amber" breakdown={getBreakdown("ulang")} />
          </>
        )}

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

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4 text-center">Applicants</th>
              <th className="px-6 py-4 text-right">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.stats_per_jenjang?.filter((j: any) => j.jenjang !== "SMA").map((item: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5 font-bold text-slate-900">{item.jenjang === "MTS" ? "MTs" : item.jenjang}</td>
                <td className="px-6 py-5 text-center font-bold text-slate-700">{item.pendaftar}</td>
                <td className="px-6 py-5">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${Math.round((item.pendaftar / (item.kuota_total || 100)) * 100)}%` }} className="h-full bg-maroon-600" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
