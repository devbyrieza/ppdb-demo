"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  ClipboardCheck,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  TrendingUp } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  total_jadwal: number;
  selesai_dinilai: number;
  belum_dinilai: number;
  jadwal_hari_ini: number;
}

export default function PengujiDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_jadwal: 0,
    selesai_dinilai: 0,
    belum_dinilai: 0,
    jadwal_hari_ini: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/penguji/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-ink-600 font-bold tracking-tight">
            Memuat statistik dashboard...
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Jadwal",
      value: stats.total_jadwal,
      icon: Calendar,
      accent: "teal",
      bgColor: "bg-primary-50",
      iconColor: "text-primary-600" },
    {
      title: "Hari Ini",
      value: stats.jadwal_hari_ini,
      icon: Clock,
      accent: "teal",
      bgColor: "bg-primary-50",
      iconColor: "text-primary-600" },
    {
      title: "Selesai",
      value: stats.selesai_dinilai,
      icon: CheckCircle,
      accent: "emerald",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600" },
    {
      title: "Belum Dinilai",
      value: stats.belum_dinilai,
      icon: ClipboardCheck,
      accent: "sand",
      bgColor: "bg-secondary-50",
      iconColor: "text-secondary-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title / Header Banner */}
      <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-primary-700 to-primary-900 border border-primary-600 p-[24px_28px] md:p-8 text-white shadow-2xl shadow-primary-900/30 app-card">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0 text-secondary-300">
              <TrendingUp className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black mb-2 tracking-tight text-white font-display">
                Ikhtisar Dashboard
              </h1>
              <p className="text-primary-100 font-bold max-w-xl text-sm md:text-lg leading-relaxed opacity-90">
                Selamat datang kembali di panel penilaian Seleksi PPDB PPDB.
                Berikut ringkasan tugas Anda hari ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px_28px] md:gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl p-[24px_28px] md:p-8 border border-secondary-100 shadow-xs hover:shadow-2xl shadow-primary/30 hover:shadow-primary-900/5 transition-all duration-500 app-card group"
          >
            <div
              className={`w-14 h-14 ${card.bgColor} rounded-[24px] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
            >
              <card.icon className={`w-7 h-7 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black text-ink-300 mb-1 uppercase tracking-widest">
                {card.title}
              </p>
              <p className="text-2xl md:text-4xl font-black text-primary-950 font-display tracking-tight leading-none">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-4xl p-[24px_28px] md:p-8 border border-secondary-100 shadow-sm app-card">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-primary-950 tracking-tight font-display">
            Aksi Cepat
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/penguji/jadwal"
            className="flex items-center gap-6 p-7 bg-secondary-50/50 hover:bg-secondary-100/50 rounded-4xl transition-all duration-500 border border-secondary-100 hover:shadow-2xl shadow-primary/30 hover:shadow-secondary-400/10 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-[24px_28px] opacity-5 group-hover:opacity-10 transition-opacity">
              <Calendar className="w-20 h-20 text-primary-900" />
            </div>
            <div className="w-16 h-16 bg-secondary-400 rounded-[24px] flex items-center justify-center shadow-2xl shadow-primary/30  shadow-primary/20 shadow-secondary-400/20 group-hover:scale-110 group-hover:-rotate-3 transition-all shrink-0">
              <Calendar className="w-8 h-8 text-primary-950" />
            </div>
            <div>
              <p className="text-xl font-black text-primary-950 font-display">
                Lihat Jadwal
              </p>
              <p className="text-xs font-black text-ink-300 uppercase tracking-widest mt-1">
                Jadwal ujian ditugaskan
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/penguji/input-nilai"
            className="flex items-center gap-6 p-7 bg-primary-700 hover:bg-primary-800 rounded-4xl transition-all duration-500 border border-primary-800 shadow-2xl shadow-primary/30  shadow-primary-900/20 hover:shadow-2xl hover:shadow-primary-900/30 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-[24px_28px] opacity-10 group-hover:opacity-20 transition-opacity">
              <ClipboardCheck className="w-20 h-20 text-white" />
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[24px] flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
              <ClipboardCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-white font-display tracking-tight">
                Input Nilai
              </p>
              <p className="text-xs font-black text-primary-100 uppercase tracking-widest mt-1">
                {stats.belum_dinilai} Tugas Penilaian
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-secondary-50 border-2 border-secondary-100 rounded-3xl p-[24px_28px] md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-[24px_28px] opacity-5">
          <Users className="w-32 h-32 text-secondary-900" />
        </div>
        <div className="flex gap-6 relative z-10">
          <div className="shrink-0">
            <div className="w-14 h-14 bg-secondary-100 rounded-[24px] flex items-center justify-center border border-secondary-200 shadow-sm">
              <Users className="w-7 h-7 text-secondary-700" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-black text-secondary-950 mb-3 tracking-tight font-display">
              Panduan Penilaian
            </h4>
            <ul className="text-sm text-secondary-900/80 font-bold space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-secondary-500">•</span>
                <span>
                  Nilai harus objektif dan sesuai rubrik penilaian yang
                  ditetapkan pesantren.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary-500">•</span>
                <span>
                  Pastikan semua aspek dinilai dengan lengkap sebelum melakukan
                  simpan data.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary-500">•</span>
                <span>
                  Berikan catatan deskriptif jika diperlukan untuk referensi
                  panitia pusat.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary-500">•</span>
                <span>
                  Nilai yang sudah diinput dapat diubah kembali sebelum masa
                  penilaian ditutup.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
