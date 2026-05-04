"use client";

import { useState, useEffect } from "react";
import { Users, Wallet, Loader2, ArrowUpRight, Calendar as CalendarIcon, Download, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * ─── ADMIN DASHBOARD PAGE ───
 */

const StatWidget = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = { emerald: "text-emerald-600 bg-emerald-50", blue: "text-blue-600 bg-blue-50" };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color] || "bg-slate-50"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900">{value}</h3>
    </div>
  );
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ total_pendaftar: 0, sudah_bayar: 0, stats_per_jenjang: [] });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
        <button onClick={fetchStats} className="p-2 bg-white border border-slate-200 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Applicants" value={stats.total_pendaftar} icon={Users} color="blue" />
        <StatWidget label="Verified" value={stats.sudah_bayar} icon={Wallet} color="emerald" />
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
            {stats.stats_per_jenjang?.map((item: any, i: number) => (
              <tr key={i}>
                <td className="px-6 py-4 font-bold">{item.jenjang}</td>
                <td className="px-6 py-4 text-center font-bold">{item.pendaftar}</td>
                <td className="px-6 py-4">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full">
                    <div style={{ width: '50%' }} className="h-full bg-maroon-600" />
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
