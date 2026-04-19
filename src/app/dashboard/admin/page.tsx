"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
  FileCheck,
  GraduationCap,
  Download,
  BarChart3,
  ArrowUpRight,
  Wallet,
  Timer
} from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/lib/access-control";

// PPDB Deadline: 30 Mei 2026
const PPDB_DEADLINE = new Date("2026-05-30T23:59:59+07:00");

function getPPDBCountdown() {
  const now = new Date();
  const diff = PPDB_DEADLINE.getTime() - now.getTime();
  if (diff <= 0) return null;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const JENJANG_LABELS: Record<string, string> = {
  MTs: "MTs PPDB",
  IL: "I'dad Lughowi (Setara SMA)",
};

const JENJANG_QUOTAS: Record<string, number> = {
  MTs: 25,
  IL: 25,
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [stats, setStats] = useState<any>({
    total_pendaftar: 0,
    sudah_bayar: 0,
    sudah_isi_data: 0,
    diterima: 0,
    stats_per_jenjang: [],
  });

  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>("");

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
          if (active) {
            setSelectedTahunAjaranId(active.id);
          } else if (list.length > 0) {
            // Fallback to first year if no active found
            setSelectedTahunAjaranId(list[0].id);
          } else {
            // If truly no years exist, trigger fetch once anyway
            fetchStats("");
          }
        }
      } catch (e) {
        console.error(e);
        fetchStats(""); // Final fallback
      }
    }
    init();
  }, []);

  const fetchStats = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/stats?tahun_ajaran_id=${id}`);
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedTahunAjaranId) {
      fetchStats(selectedTahunAjaranId);
    }
  }, [selectedTahunAjaranId]);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-brand-blue-600" /></div>;

  const daysLeft = getPPDBCountdown();
  const canViewKeuangan = !role || ['admin_keuangan', 'admin_super', 'admin'].includes(role);
  const canViewBerkas = !role || ['admin_berkas', 'admin_super', 'admin'].includes(role);

  return (
    <div className="space-y-8 pb-12">
      {daysLeft !== null && (
        <div className={`rounded-3xl border-2 px-8 py-5 flex items-center justify-between shadow-clay-sm animate-in slide-in-from-top duration-500 ${daysLeft <= 7 ? "bg-red-50 border-red-200 text-red-900" : "bg-brand-yellow-50 border-brand-yellow-200 text-brand-blue-950"}`}>
          <div className="flex items-center gap-4">
            <Timer className="w-6 h-6" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">Pendaftaran Ditutup</p>
              <p className="font-black text-xl">{daysLeft} Hari Lagi • 30 Mei 2026</p>
            </div>
          </div>
          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${daysLeft <= 7 ? "bg-red-600 text-white" : "bg-brand-blue-900 text-white"}`}>
            {daysLeft <= 7 ? "Mendesak" : "Berjalan"}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-brand-blue-700 to-brand-blue-900 p-10 md:p-16 text-white shadow-2xl app-card border border-brand-blue-600">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow-400/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Admin Dashboard</span>
              
              {tahunAjaranList.length > 0 && (
                <select
                  value={selectedTahunAjaranId}
                  onChange={(e) => setSelectedTahunAjaranId(e.target.value)}
                  className="bg-brand-blue-800/50 text-white text-[10px] font-black uppercase tracking-widest border border-white/20 rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-brand-yellow-400 cursor-pointer hover:bg-brand-blue-800 transition-colors"
                >
                  {tahunAjaranList.map((ta: any) => (
                    <option key={ta.id} value={ta.id} className="bg-brand-blue-900 text-white">
                      TA {ta.nama}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight leading-none mb-4 text-white">Monitor <br /> Pendaftaran</h1>
            <p className="text-brand-blue-100 font-bold opacity-90 text-sm md:text-lg max-w-md italic">
              Ikhtisar real-time calon santri Tahun Ajaran {tahunAjaranList.find(t => t.id === selectedTahunAjaranId)?.nama || "..."}.
            </p>
          </div>
          <Link href="/dashboard/admin/pendaftar" className="bg-brand-yellow-400 hover:bg-brand-yellow-300 text-brand-blue-950 px-10 py-5 rounded-3xl font-black uppercase text-xs shadow-xl transition-all flex items-center gap-3">
            <Users className="w-6 h-6" /> Data Pendaftar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {[
          { label: "Total Calon", val: stats.total_pendaftar, icon: Users, color: "blue" },
          { label: "Lunas", val: stats.sudah_bayar, icon: Wallet, color: "yellow", show: canViewKeuangan },
          { label: "Berkas Ok", val: stats.sudah_isi_data, icon: FileCheck, color: "emerald", show: canViewBerkas },
          { label: "Diterima", val: stats.diterima, icon: GraduationCap, color: "purple" }
        ].filter(i => i.show !== false).map((item, id) => (
          <div key={id} className="bg-white rounded-4xl p-8 border border-brand-yellow-100 shadow-sm app-card group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-clay-sm transition-transform group-hover:scale-110 ${item.color === 'blue' ? 'bg-brand-blue-50 text-brand-blue-600' : item.color === 'yellow' ? 'bg-brand-yellow-50 text-brand-yellow-600' : item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
              <item.icon className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-ink-300 uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-3xl md:text-5xl font-black text-brand-blue-950 font-display tracking-tight leading-none">{item.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-4xl border border-brand-yellow-100 shadow-sm overflow-hidden app-card">
            <div className="p-6 md:p-8 border-b border-brand-yellow-50 bg-brand-yellow-50/20">
              <h3 className="text-lg md:text-xl font-black text-brand-blue-950 uppercase tracking-tight">Performa Jenjang</h3>
            </div>
            
            {/* Mobile View: Cards */}
            <div className="md:hidden divide-y divide-brand-yellow-50">
              {stats.stats_per_jenjang?.map((item: any, idx: number) => (
                <div key={idx} className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 ${item.jenjang === 'MTs' ? 'bg-brand-blue-600' : 'bg-brand-yellow-500'}`}>
                      {item.jenjang.substring(0, 2)}
                    </div>
                    <p className="font-extrabold text-slate-800 leading-tight">{JENJANG_LABELS[item.jenjang] || item.jenjang}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kuota</span>
                      <span className="text-sm font-bold text-slate-600">{JENJANG_QUOTAS[item.jenjang] || "-"}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Calon Santri</span>
                      <span className="px-4 py-1.5 bg-brand-yellow-100 text-brand-yellow-700 font-bold rounded-xl border border-brand-yellow-200 text-sm">{item.pendaftar}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <table className="hidden md:table w-full text-left">
              <thead className="bg-stone-50 text-[10px] font-black uppercase tracking-widest text-ink-400">
                <tr>
                  <th className="px-8 py-5">Jenjang</th>
                  <th className="px-8 py-5 text-center">Kuota</th>
                  <th className="px-8 py-5 text-center">Calon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-yellow-50 text-sm">
                {stats.stats_per_jenjang?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-brand-yellow-50/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs ${item.jenjang === 'MTs' ? 'bg-brand-blue-600' : 'bg-brand-yellow-500'}`}>
                          {item.jenjang.substring(0, 2)}
                        </div>
                        <p className="font-bold text-slate-800">{JENJANG_LABELS[item.jenjang] || item.jenjang}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-400">{JENJANG_QUOTAS[item.jenjang] || "-"}</td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-4 py-2 bg-brand-yellow-100 text-brand-yellow-700 font-bold rounded-xl border border-brand-yellow-200">{item.pendaftar}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-blue-900 rounded-4xl p-10 text-white relative overflow-hidden app-card shadow-2xl">
            <BarChart3 className="w-12 h-12 text-brand-yellow-400 mb-8" />
            <h4 className="text-2xl font-black mb-4 font-display leading-tight text-white">Laporan Excel</h4>
            <p className="text-brand-blue-100 font-bold mb-8 opacity-100">Unduh data pendaftaran terbaru untuk keperluan rapat panitia.</p>
            <button className="w-full bg-white text-brand-blue-900 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-yellow-300 transition-all shadow-xl">
              Export Database
            </button>
          </div>
          <div className="bg-white rounded-4xl border border-brand-yellow-100 shadow-sm p-8 app-card">
            <h3 className="text-[10px] font-black text-ink-300 uppercase tracking-widest mb-6">Navigasi Cepat</h3>
            <div className="space-y-4">
              <Link href="/dashboard/admin/perubahan-data" className="flex items-center justify-between p-4 bg-brand-yellow-50/50 hover:bg-brand-yellow-100 rounded-2xl transition-all group border border-brand-yellow-100">
                 <span className="font-black text-ink-900 text-sm">Permintaan Edit</span>
                 <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-brand-yellow-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
