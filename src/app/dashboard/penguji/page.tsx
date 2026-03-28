"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  ClipboardCheck,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  TrendingUp,
} from "lucide-react";
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
    jadwal_hari_ini: 0,
  });

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
          <Loader2 className="w-12 h-12 animate-spin text-maroon-600 mx-auto mb-4" />
          <p className="text-ink-600 font-medium">Memuat statistik dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Jadwal",
      value: stats.total_jadwal,
      icon: Calendar,
      accent: "maroon",
      bgColor: "bg-maroon-50",
      iconColor: "text-maroon-600",
    },
    {
      title: "Hari Ini",
      value: stats.jadwal_hari_ini,
      icon: Clock,
      accent: "maroon",
      bgColor: "bg-maroon-50",
      iconColor: "text-maroon-600",
    },
    {
      title: "Selesai",
      value: stats.selesai_dinilai,
      icon: CheckCircle,
      accent: "emerald",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Belum Dinilai",
      value: stats.belum_dinilai,
      icon: ClipboardCheck,
      accent: "amber",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title / Header Banner */}
      <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-maroon-700 to-maroon-900 border border-maroon-600 p-8 md:p-10 text-white shadow-lg app-card">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cream-50/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm shrink-0">
              <TrendingUp className="w-8 h-8 text-cream-100" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-white font-display">Ikhtisar Dashboard</h1>
              <p className="text-cream-100/90 font-medium max-w-xl text-sm md:text-base leading-relaxed">
                Selamat datang kembali di panel penilaian Seleksi PPDB Al-Imam. Berikut ringkasan tugas Anda hari ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl p-5 md:p-6 border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300 app-card group"
          >
            <div className={`w-12 h-12 ${card.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black text-ink-400 mb-1 uppercase tracking-widest">{card.title}</p>
              <p className="text-2xl md:text-3xl font-black text-ink-950 font-display">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-4xl p-8 border border-cream-200 shadow-sm app-card">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-ink-950 tracking-tight font-display">
            Aksi Cepat
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/dashboard/penguji/jadwal"
            className="flex items-center gap-5 p-6 bg-cream-50 hover:bg-cream-100 rounded-3xl transition-all duration-300 border border-cream-200 hover:shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calendar className="w-16 h-16 text-maroon-900" />
            </div>
            <div className="w-14 h-14 bg-maroon-600 rounded-2xl flex items-center justify-center shadow-lg shadow-maroon-200 group-hover:scale-110 transition-transform shrink-0">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-lg font-black text-ink-950 font-display">Lihat Jadwal</p>
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mt-1">
                Jadwal ujian ditugaskan
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/penguji/input-nilai"
            className="flex items-center gap-5 p-6 bg-maroon-600 hover:bg-maroon-700 rounded-3xl transition-all duration-300 border border-maroon-800 shadow-lg shadow-maroon-200 hover:shadow-xl group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ClipboardCheck className="w-16 h-16 text-white" />
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shrink-0">
              <ClipboardCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-lg font-black text-white font-display">Input Nilai</p>
              <p className="text-xs font-bold text-maroon-100 uppercase tracking-wider mt-1">
                {stats.belum_dinilai} Tugas Penilaian
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Users className="w-32 h-32 text-amber-900" />
        </div>
        <div className="flex gap-6 relative z-10">
          <div className="shrink-0">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center border border-amber-200 shadow-sm">
              <Users className="w-7 h-7 text-amber-700" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-black text-amber-950 mb-3 tracking-tight font-display">
              Panduan Penilaian
            </h4>
            <ul className="text-sm text-amber-900/80 font-bold space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Nilai harus objektif dan sesuai rubrik penilaian yang ditetapkan pesantren.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Pastikan semua aspek dinilai dengan lengkap sebelum melakukan simpan data.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Berikan catatan deskriptif jika diperlukan untuk referensi panitia pusat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Nilai yang sudah diinput dapat diubah kembali sebelum masa penilaian ditutup.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
