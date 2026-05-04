"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Timer,
  Wallet,
  FileCheck,
  GraduationCap,
  Loader2,
  BarChart3,
  ArrowUpRight,
  CreditCard,
  Calendar as CalendarIcon,
  ClipboardCheck,
  TrendingUp,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserRole } from "@/lib/access-control";
import Swal from "sweetalert2";

// PPDB Deadline: 30 Mei 2026
const PPDB_DEADLINE = new Date("2026-05-30T23:59:59+07:00");

function getPPDBCountdown() {
  const now = new Date();
  const diff = PPDB_DEADLINE.getTime() - now.getTime();
  if (diff <= 0) return null;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const JENJANG_LABELS: Record<string, string> = {
  MTS: "MTs",
  IL: "IL",
  SMA: "SMA",
};

// ─── HELPER COMPONENTS ───
const StatWidget = ({ label, value, icon: Icon, color, trend }: any) => {
    const colors: any = {
        teal: "text-teal-600 bg-teal-50",
        emerald: "text-emerald-600 bg-emerald-50",
        amber: "text-amber-600 bg-amber-50",
        blue: "text-blue-600 bg-blue-50",
        purple: "text-purple-600 bg-purple-50"
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${colors[color] || colors.teal} transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
        </div>
    );
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [stats, setStats] = useState<any>({
    total_pendaftar: 0,
    sudah_bayar: 0,
    sudah_isi_data: 0,
    diterima: 0,
    cadangan: 0,
    daftar_ulang: 0,
    waiting_payment: 0,
    waiting_docs: 0,
    stats_per_jenjang: [],
  });

  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>("");

  const fetchStats = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/stats?tahun_ajaran_id=${id}`);
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setRole(sessionData.session?.role || sessionData.user?.user_metadata?.role);
        }
        const taRes = await fetch("/api/admin/tahun-ajaran");
        if (taRes.ok) {
          const taData = await taRes.json();
          const list = taData.data || [];
          setTahunAjaranList(list);
          const active = list.find((t: any) => t.is_active);
          if (active) setSelectedTahunAjaranId(active.id);
          else if (list.length > 0) setSelectedTahunAjaranId(list[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (selectedTahunAjaranId) fetchStats(selectedTahunAjaranId);
  }, [selectedTahunAjaranId]);

  if (loading && stats.total_pendaftar === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Menghubungkan ke Pusat Data...</p>
      </div>
    );
  }

  const daysLeft = getPPDBCountdown();
  const isAdminSuper = role === "admin_super" || role === "admin";

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      {/* Header & Filter Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Dashboard Utama</h1>
          <p className="text-sm text-slate-500 font-medium">Selamat datang kembali. Berikut adalah ringkasan PPDB hari ini.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <select 
              value={selectedTahunAjaranId}
              onChange={(e) => setSelectedTahunAjaranId(e.target.value)}
              className="bg-transparent text-[13px] font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              {tahunAjaranList.map((ta: any) => (
                <option key={ta.id} value={ta.id}>TA {ta.nama}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => fetchStats(selectedTahunAjaranId)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Alert & Stats Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Banner Deadline */}
        <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 md:p-10 text-white shadow-xl shadow-slate-950/20 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-md">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-6">
                            <Clock className="w-3.5 h-3.5 text-teal-400" />
                            <span>Status Pendaftaran</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight leading-tight">
                            {daysLeft} Hari Lagi Menuju <span className="text-teal-400">Penutupan</span>
                        </h2>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed mb-6">
                            Pendaftaran gelombang pertama akan berakhir pada 30 Mei 2026. Pastikan semua berkas calon santri telah terverifikasi.
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white">{stats.total_pendaftar}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pendaftar</span>
                            </div>
                            <div className="w-px h-8 bg-slate-800" />
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-teal-400">{stats.sudah_bayar}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sudah Bayar</span>
                            </div>
                        </div>
                    </div>

                    <Link href="/dashboard/admin/pendaftar" className="shrink-0 group/btn">
                        <div className="flex items-center justify-center w-32 h-32 rounded-full border-2 border-white/10 hover:border-teal-500/50 transition-colors relative">
                            <div className="absolute inset-2 rounded-full border border-dashed border-white/20 group-hover/btn:rotate-90 transition-transform duration-1000" />
                            <ArrowUpRight className="w-10 h-10 text-white group-hover/btn:scale-110 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>

        {/* Quick Action Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex-1 bg-teal-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg shadow-teal-900/20">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />
                <h4 className="text-xl font-bold mb-3">Laporan Mingguan</h4>
                <p className="text-teal-50 text-sm font-medium mb-6 leading-relaxed opacity-80">Siapkan data pendaftar untuk rapat evaluasi berkala.</p>
                <button className="w-full bg-white text-teal-900 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Export ke Excel
                </button>
            </div>
            
            <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Quick Access</h4>
                    <Search className="w-4 h-4 text-slate-300" />
                </div>
                <div className="space-y-3">
                    <Link href="/dashboard/admin/verifikasi-pembayaran" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                        <span className="text-xs font-bold text-slate-600 group-hover:text-teal-600">Verifikasi Keuangan</span>
                        <div className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black">{stats.waiting_payment}</div>
                    </Link>
                    <Link href="/dashboard/admin/verifikasi-dokumen" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                        <span className="text-xs font-bold text-slate-600 group-hover:text-teal-600">Cek Dokumen</span>
                        <div className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black">{stats.waiting_docs}</div>
                    </Link>
                </div>
            </div>
        </div>
      </div>

      {/* Main Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatWidget 
            label="Total Pendaftar" 
            value={stats.total_pendaftar} 
            icon={Users} 
            color="blue" 
            trend="+12% bulan ini" 
          />
          <StatWidget 
            label="Diterima" 
            value={stats.diterima} 
            icon={CheckCircle2} 
            color="emerald" 
          />
          <StatWidget 
            label="Cadangan" 
            value={stats.cadangan} 
            icon={Clock} 
            color="amber" 
          />
          <StatWidget 
            label="Daftar Ulang" 
            value={stats.daftar_ulang} 
            icon={Wallet} 
            color="purple" 
            trend="Target: 80%"
          />
      </div>

      {/* Table Section: Performa Jenjang */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Performa Jenjang</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Data Real-time Per TA</p>
              </div>
              <div className="h-8 w-px bg-slate-100 hidden md:block" />
              <div className="flex items-center gap-6 hidden md:flex">
                  <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                      <span className="text-xs font-bold text-slate-500">Putra</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                      <span className="text-xs font-bold text-slate-500">Putri</span>
                  </div>
              </div>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr>
                          <th className="px-8 py-4 border-b border-slate-100">Jenjang</th>
                          <th className="px-4 py-4 border-b border-slate-100 text-center">Kuota (L/P/T)</th>
                          <th className="px-4 py-4 border-b border-slate-100 text-center">Pendaftar (L/P/T)</th>
                          <th className="px-4 py-4 border-b border-slate-100 text-center">Sudah Bayar</th>
                          <th className="px-4 py-4 border-b border-slate-100 text-center">Diterima</th>
                          <th className="px-8 py-4 border-b border-slate-100 text-center">Progress</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {stats.stats_per_jenjang?.map((item: any, idx: number) => {
                          const percentage = Math.min(100, Math.round((item.pendaftar / item.kuota_total) * 100) || 0);
                          return (
                              <tr key={idx} className="hover:bg-slate-50/40 transition-colors group">
                                  <td className="px-8 py-5">
                                      <div className="flex items-center gap-4">
                                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs border border-slate-200">
                                              {item.jenjang.substring(0, 2)}
                                          </div>
                                          <div>
                                              <p className="font-bold text-slate-900">{JENJANG_LABELS[item.jenjang] || item.jenjang}</p>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase">International</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-4 py-5 text-center">
                                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400">
                                          <span>{item.kuota_putra}</span>
                                          <span className="opacity-30">/</span>
                                          <span>{item.kuota_putri}</span>
                                          <span className="opacity-30">/</span>
                                          <span className="text-slate-900">{item.kuota_total}</span>
                                      </div>
                                  </td>
                                  <td className="px-4 py-5 text-center">
                                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                                          <span className="text-teal-600">{item.pendaftar_putra}</span>
                                          <span className="opacity-20 text-slate-400">/</span>
                                          <span className="text-pink-500">{item.pendaftar_putri}</span>
                                          <span className="opacity-20 text-slate-400">/</span>
                                          <span className="text-slate-900">{item.pendaftar}</span>
                                      </div>
                                  </td>
                                  <td className="px-4 py-5 text-center">
                                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[11px] font-black">
                                          {item.bayar_total || 0}
                                      </span>
                                  </td>
                                  <td className="px-4 py-5 text-center">
                                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black">
                                          {item.diterima || 0}
                                      </span>
                                  </td>
                                  <td className="px-8 py-5">
                                      <div className="w-full max-w-[120px] ml-auto">
                                          <div className="flex items-center justify-between mb-1.5">
                                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{percentage}%</span>
                                              <span className="text-[10px] font-bold text-slate-400">Fill</span>
                                          </div>
                                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                              <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={`h-full rounded-full ${percentage > 80 ? 'bg-teal-500' : 'bg-slate-400'}`} 
                                              />
                                          </div>
                                      </div>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
