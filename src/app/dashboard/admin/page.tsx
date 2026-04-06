"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  FileCheck,
  GraduationCap,
  Download,
  BarChart3,
  MapPin,
  ArrowUpRight,
  MoreHorizontal,
  Wallet,
  FileText,
  Timer
} from "lucide-react";
import Link from "next/link";
import { getMenuItemsForRole, UserRole } from "@/lib/access-control";

// PPDB Deadline: 30 Mei 2026
const PPDB_DEADLINE = new Date("2026-05-30T23:59:59+07:00");

function getPPDBCountdown() {
  const now = new Date();
  const diff = PPDB_DEADLINE.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days;
}

// Interfaces (Unchanged)
interface JenjangStat {
  jenjang: string;
  pendaftar: number;
  diterima: number;
}

interface ProvinsiStat {
  provinsi: string;
  jumlah: number;
}

interface DashboardStats {
  total_pendaftar: number;
  belum_bayar: number;
  menunggu_verifikasi_pembayaran: number;
  sudah_bayar: number;
  pembayaran_ditolak: number;
  belum_isi_data: number;
  sudah_isi_data: number;
  belum_upload_dokumen: number;
  menunggu_verifikasi_dokumen: number;
  dokumen_terverifikasi: number;
  dokumen_ditolak: number;
  terjadwal_ujian: number;
  belum_ujian: number;
  sudah_ujian: number;
  hasil_ujian: number;
  diterima: number;
  belum_daftar_ulang: number;
  sudah_daftar_ulang: number;
  stats_per_jenjang: JenjangStat[];
  stats_per_provinsi: ProvinsiStat[];
  stats_gender: { "Laki-laki": number; "Perempuan": number };
  pie_chart_status: {
    diterima: number;
    menunggu: number;
    proses: number;
    ditolak: number;
  };
  permintaan_edit_pending: number;
  permintaan_edit_total: number;
  funnel_data?: { label: string; count: number; color: string }[];
}

const JENJANG_LABELS: Record<string, string> = {
  MTs: "MTs Ulul Albaab",
  IL: "I'dad Lughowi (Setara SMA)",
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total_pendaftar: 0,
    belum_bayar: 0,
    menunggu_verifikasi_pembayaran: 0,
    sudah_bayar: 0,
    pembayaran_ditolak: 0,
    belum_isi_data: 0,
    sudah_isi_data: 0,
    belum_upload_dokumen: 0,
    menunggu_verifikasi_dokumen: 0,
    dokumen_terverifikasi: 0,
    dokumen_ditolak: 0,
    terjadwal_ujian: 0,
    belum_ujian: 0,
    sudah_ujian: 0,
    hasil_ujian: 0,
    diterima: 0,
    belum_daftar_ulang: 0,
    sudah_daftar_ulang: 0,
    stats_per_jenjang: [],
    stats_per_provinsi: [],
    stats_gender: { "Laki-laki": 0, "Perempuan": 0 },
    pie_chart_status: { diterima: 0, menunggu: 0, proses: 0, ditolak: 0 },
    permintaan_edit_pending: 0,
    permintaan_edit_total: 0,
  });

  const [tahunAjaranList, setTahunAjaranList] = useState<{ id: string; nama: string; is_active: boolean }[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Session for Role
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.session?.role) {
            const userRole = sessionData.session.role as UserRole;
            setRole(userRole);

            // Redirect IT roles directly to users management
            if (userRole === 'head_of_it' || userRole === 'tim_it') {
              window.location.href = '/dashboard/admin/users';
              return;
            }
          } else if (sessionData.user?.user_metadata?.role) {
            const userRole = sessionData.user.user_metadata.role as UserRole;
            setRole(userRole);

            // Redirect IT roles directly to users management
            if (userRole === 'head_of_it' || userRole === 'tim_it') {
              window.location.href = '/dashboard/admin/users';
              return;
            }
          }
        }

        // 2. Fetch All Tahun Ajaran
        const taResponse = await fetch("/api/admin/tahun-ajaran");
        if (taResponse.ok) {
          const taData = await taResponse.json();
          const list = taData.data || [];
          setTahunAjaranList(list);

          const active = list.find((t: any) => t.is_active);
          if (active) {
            setSelectedTahunAjaranId(active.id);
          } else if (list.length > 0) {
            setSelectedTahunAjaranId(list[0].id);
          }
        }

      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        // Stats will be fetched by the second useEffect
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedTahunAjaranId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/stats?tahun_ajaran_id=${selectedTahunAjaranId}`);
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

    fetchStats();
  }, [selectedTahunAjaranId]);

  const handleExportPembayaran = async (type: "all" | "lunas" | "pending") => {
    try {
      setExporting(type);
      const response = await fetch(`/api/admin/export/pembayaran?type=${type}&format=excel`);
      if (!response.ok) throw new Error("Failed to export");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const typeLabel = type === "all" ? "semua" : type === "lunas" ? "lunas" : "pending";
      a.download = `pembayaran_ppdb_${typeLabel}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Gagal mengekspor data pembayaran");
    } finally {
      setExporting(null);
    }
  };

  // Helper to check if user can view section
  const canViewKeuangan = !role || role === 'admin_keuangan' || role === 'admin_super' || role === 'admin';
  const canViewBerkas = !role || role === 'admin_berkas' || role === 'admin_super' || role === 'admin';
  const canViewSeleksi = !role || role === 'admin_super' || role === 'admin' || role === 'penguji_calsan' || role === 'pewawancara_calsan' || role === 'pewawancara_cawalsan';

  // Specific role checks for exclusive views
  const isKeuanganOnly = role === 'admin_keuangan';
  const isBerkasOnly = role === 'admin_berkas';
  const isPengujiOnly = role === 'penguji_calsan' || role === 'pewawancara_calsan' || role === 'pewawancara_cawalsan';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-blue-600 mx-auto mb-4" />
          <p className="text-ink-400 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  const lunasPersen = stats.total_pendaftar ? Math.round((stats.sudah_bayar / stats.total_pendaftar) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">

      {/* PPDB Deadline Tracker */}
      {(() => {
        const daysLeft = getPPDBCountdown();
        if (daysLeft === null) return null;
        const urgency = daysLeft <= 7 ? "red" : daysLeft <= 30 ? "amber" : "blue";
        const urgencyStyles = {
          red: "bg-red-50 border-red-200 text-red-800",
          amber: "bg-amber-50 border-amber-200 text-amber-800",
          blue: "bg-brand-yellow-50 border-brand-yellow-200 text-brand-blue-900",
        }[urgency];
        return (
          <div className={`rounded-2xl border-2 px-6 py-4 flex flex-wrap items-center justify-between gap-4 ${urgencyStyles}`}>
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-xs font-black uppercase tracking-widest opacity-60">Countdown PPDB</span>
                <p className="font-black text-base leading-tight">
                  {daysLeft <= 0 ? "Pendaftaran TELAH DITUTUP" : (
                    <><span className="text-2xl">{daysLeft}</span> hari lagi • Penutupan 30 Mei 2026</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: urgency === "blue" ? "#0066ff" : urgency === "amber" ? "#f59e0b" : "#ef4444" }} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {daysLeft > 30 ? "Berjalan Normal" : daysLeft > 7 ? "Segera Tutup" : "MENDESAK"}
              </span>
            </div>
          </div>
        );
      })()}

      {/* 4. NOTIFICATION BANNER - For specific roles */}
      {(role === 'admin_super' || role === 'admin' || role === 'admin_berkas' || role === 'head_of_it') && stats.permintaan_edit_pending > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-6 shadow-clay-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-amber-900 leading-tight">Permintaan Perubahan Data</h3>
                <p className="text-amber-700 font-medium">Ada <span className="text-amber-900 font-black">{stats.permintaan_edit_pending}</span> pendaftar yang mengajukan perubahan data yang sudah terkunci.</p>
              </div>
            </div>
            <Link
              href="/dashboard/admin/perubahan-data"
              className="btn-primary bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 px-8 py-3 rounded-2xl whitespace-nowrap"
            >
              Proses Sekarang
              <ArrowUpRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      )}

      {/* 1. Ultra-Clean Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="badge badge-success bg-brand-blue-50 text-brand-blue-700 border-brand-blue-200 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                Tahun Ajaran {tahunAjaranList.find(t => t.id === selectedTahunAjaranId)?.nama || "..."}
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue-600"></span>
              </span>
            </div>

            <div className="h-4 w-px bg-brand-yellow-200"></div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ink-400" />
              <select
                value={selectedTahunAjaranId}
                onChange={(e) => setSelectedTahunAjaranId(e.target.value)}
                className="bg-brand-yellow-50 border border-brand-yellow-200 rounded-lg px-3 py-1 text-sm font-black text-brand-blue-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-600/20 focus:border-brand-blue-600 transition-all cursor-pointer hover:bg-white"
              >
                {tahunAjaranList.map((ta) => (
                  <option key={ta.id} value={ta.id}>
                    Pilih TA: {ta.nama} {ta.is_active ? "(Aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink-900 whitespace-nowrap">
            {role === 'admin_keuangan' ? 'Dashboard Keuangan' :
              role === 'admin_berkas' ? 'Dashboard Berkas' :
                'Dashboard Admin'}
          </h1>
          <p className="text-ink-500 mt-2 text-lg">
            Monitor perkembangan PPDB secara real-time.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/admin/pendaftar" className="btn-primary shadow-brand-blue-glow">
            <Users className="w-5 h-5" />
            <span>Data Pendaftar</span>
          </Link>
          {canViewKeuangan && (
            <button
              onClick={() => handleExportPembayaran("all")}
              className="btn-secondary"
              disabled={exporting !== null}
            >
              {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              <span>Unduh Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Hero KPI Cards - "Clay" Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* TOTAL PENDAFTAR - Default / Super Admin / Berkas */}
        {(!isKeuanganOnly && !isPengujiOnly) && (
          <div className="bg-white rounded-3xl border border-brand-yellow-100 shadow-sm app-card p-5 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-24 h-24 text-brand-blue-700" />
            </div>
            <p className="text-ink-500 font-black tracking-widest uppercase text-[10px] mb-2">Total Pendaftar</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black text-ink-900 tracking-tight">
                {stats.total_pendaftar}
              </h2>
              <span className="text-sm font-black text-brand-blue-700 bg-brand-blue-50 px-2.5 py-1 rounded-full">
                Calon Santri
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-between text-sm">
              <span className="text-ink-400 font-bold">Target: 500</span>
              <div className="w-24 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-blue-600 rounded-full" style={{ width: `${(stats.total_pendaftar / 500) * 100}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* KEUANGAN HERO - Admin Keuangan gets a bigger card or first slot */}
        {canViewKeuangan && (
          <div className={`bg-white rounded-3xl border border-brand-yellow-100 shadow-sm app-card p-5 md:p-6 relative overflow-hidden group hover:border-brand-blue-200 ${isKeuanganOnly ? 'col-span-2 bg-linear-to-br from-brand-blue-50 to-white' : ''}`}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="w-32 h-32 text-brand-blue-700" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-blue-100 rounded-2xl text-brand-blue-700">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="badge badge-neutral">Keuangan</span>
            </div>
            <p className="text-ink-500 text-sm font-medium">Pembayaran Lunas</p>
            <h3 className="text-4xl font-bold text-ink-900 mt-1 mb-1">{stats.sudah_bayar} <span className="text-lg text-ink-400 font-normal">Siswa</span></h3>
            <p className="text-sm text-ink-400 mb-4">{lunasPersen}% dari total pendaftar</p>

            <div className="flex gap-2 relative z-10">
              <Link href="/dashboard/admin/verifikasi-pembayaran" className="flex-1 btn-secondary text-xs">
                Verifikasi Pending ({stats.menunggu_verifikasi_pembayaran})
              </Link>
            </div>
          </div>
        )}

        {/* BERKAS HERO - Admin Berkas Focus */}
        {canViewBerkas && (
          <div className={`bg-white rounded-3xl border border-brand-yellow-100 shadow-sm app-card p-5 md:p-6 relative overflow-hidden group hover:border-brand-yellow-200 ${isBerkasOnly ? 'col-span-2 bg-brand-yellow-50/30' : ''}`}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <FileCheck className="w-32 h-32 text-brand-yellow-600" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-yellow-100 rounded-2xl text-brand-yellow-600">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="badge badge-neutral">Berkas</span>
            </div>
            <p className="text-ink-500 text-sm font-medium">Dokumen Lengkap</p>
            <h3 className="text-4xl font-bold text-ink-900 mt-1 mb-1">{stats.sudah_isi_data} <span className="text-lg text-ink-400 font-normal">Siswa</span></h3>
            <p className="text-sm text-ink-400 mb-4">Siap diverifikasi & seleksi</p>

            <div className="flex gap-2 relative z-10">
              <Link href="/dashboard/admin/verifikasi-dokumen" className="flex-1 btn-secondary text-xs border-brand-yellow-200 text-brand-yellow-800 hover:bg-brand-yellow-50">
                Cek Dokumen ({stats.menunggu_verifikasi_dokumen})
              </Link>
              {isBerkasOnly && (
                <Link href="/dashboard/admin/pendaftar?filter=belum_upload_dokumen" className="btn-ghost bg-white/50 hover:bg-white text-brand-yellow-700">
                  <TrendingUp className="w-4 h-4" /> Cek Data
                </Link>
              )}
            </div>
          </div>
        )}

        {/* SELEKSI CARD - Penguji Focus */}
        {canViewSeleksi && (
          <div className="bg-white rounded-3xl border border-brand-yellow-100 shadow-sm app-card p-5 md:p-6 relative overflow-hidden group hover:border-brand-blue-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="badge badge-neutral">Seleksi</span>
            </div>
            <p className="text-ink-500 text-sm font-medium">Siswa Diterima</p>
            <h3 className="text-3xl font-bold text-ink-900 mt-1 mb-1 text-blue-600">{stats.diterima}</h3>
            <p className="text-sm text-ink-400 mb-4">Dari {stats.sudah_ujian} peserta ujian</p>

            <div className="flex gap-2">
              <Link href="/dashboard/admin/jadwal-ujian" className="flex-1 btn-ghost text-xs bg-ink-50 hover:bg-blue-50 text-blue-700">
                Jadwal Ujian {stats.terjadwal_ujian > 0 && `(${stats.terjadwal_ujian})`}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Content Grid - Floating Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Detailed Program Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-brand-blue-950">Performa Program Studi</h3>
            <button className="text-sm text-brand-blue-700 font-black hover:text-brand-blue-800 uppercase tracking-widest px-2 py-1">Lihat Detail</button>
          </div>

          <div className="bg-white rounded-3xl border border-brand-yellow-100 shadow-sm app-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-ink-100 bg-brand-yellow-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-wider">Jenjang Pendidikan</th>
                    <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-wider text-center">Kuota</th>
                    <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-wider text-center">Pendaftar</th>
                    <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-wider text-center">Diterima</th>
                    <th className="px-6 py-4 text-xs font-bold text-ink-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {(stats.stats_per_jenjang || []).map((item, idx) => (
                    <tr key={idx} className="group hover:bg-brand-yellow-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md
                                   ${item.jenjang === 'MTs' ? 'bg-linear-to-br from-brand-blue-500 to-brand-blue-700' :
                              'bg-linear-to-br from-brand-yellow-400 to-brand-yellow-600'}
                                `}>
                            {item.jenjang.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-ink-900">{JENJANG_LABELS[item.jenjang]}</p>
                            <p className="text-xs text-ink-400 font-medium">Reguler • Putra</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center text-ink-500 font-medium">-</td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-brand-blue-900 font-black bg-brand-yellow-100 px-3 py-1 rounded-lg border border-brand-yellow-200">
                          {item.pendaftar}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-brand-blue-800 font-black bg-brand-blue-50 px-3 py-1 rounded-lg border border-brand-blue-100">
                          {item.diterima}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Buka
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registration Funnel - NEW ENHANCEMENT */}
          <div className="pt-4">
            <h3 className="text-xl font-black text-brand-blue-950 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-blue-700" />
              Tingkat Konversi Pendaftaran (Funnel Pendaftaran)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
              {stats.funnel_data?.map((item, idx) => {
                const percentage = stats.funnel_data ? Math.round((item.count / stats.funnel_data[0].count) * 100) : 0;
                const dropOff = idx > 0 && stats.funnel_data ?
                  Math.round(((stats.funnel_data[idx - 1].count - item.count) / stats.funnel_data[idx - 1].count) * 100) : 0;

                return (
                  <div key={idx} className="relative group">
                    <div className={`h-32 rounded-2xl ${item.color.replace('bg-', 'bg-opacity-40 bg-')} border-2 border-white shadow-clay-sm p-4 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-clay-md group-hover:bg-opacity-100`}>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-ink-400 leading-none mb-1">{item.label}</p>
                        <h4 className="text-2xl font-black text-ink-900">{item.count}</h4>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-xs font-bold text-ink-500">{percentage}%</span>
                        <BarChart3 className="w-4 h-4 text-ink-200" />
                      </div>
                    </div>
                    {idx < 4 && (
                      <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 bg-white rounded-full items-center justify-center shadow-md border border-ink-50">
                        <ArrowUpRight className="w-3 h-3 text-ink-300 rotate-45" />
                      </div>
                    )}
                    {idx > 0 && dropOff > 0 && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-rose-50 text-rose-600 text-[8px] px-1.5 py-0.5 rounded-full font-black border border-rose-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        -{dropOff}% GUGUR
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-ink-400 mt-4 font-medium italic text-center">
              * Persentase dihitung berdasarkan total pendaftar yang masuk. Arahkan kursor untuk melihat tingkat pembatalan (drop-off).
            </p>
          </div>

          {/* Stats Distribution - NEW ENHANCEMENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Status Distribution */}
            <div className="bg-white rounded-3xl border border-brand-yellow-100 shadow-sm app-card p-6">
              <h4 className="text-lg font-black text-brand-blue-950 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-blue-700" />
                Distribusi Status
              </h4>
              <div className="space-y-4">
                {[
                  { label: "Diterima", count: stats.pie_chart_status.diterima, color: "bg-green-500", total: stats.total_pendaftar },
                  { label: "Menunggu Seleksi", count: stats.pie_chart_status.menunggu, color: "bg-blue-500", total: stats.total_pendaftar },
                  { label: "Dalam Proses", count: stats.pie_chart_status.proses, color: "bg-amber-500", total: stats.total_pendaftar },
                  { label: "Ditolak/Batal", count: stats.pie_chart_status.ditolak, color: "bg-rose-500", total: stats.total_pendaftar },
                ].map((item, idx) => {
                  const percentage = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-ink-600">{item.label}</span>
                        <span className="text-ink-900 font-bold">{item.count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-ink-50 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="bg-white rounded-3xl border border-brand-yellow-100 shadow-sm app-card p-6">
              <h4 className="text-lg font-black text-brand-blue-950 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-blue-700" />
                Komposisi Gender
              </h4>
              <div className="flex items-center justify-center py-4">
                <div className="flex w-full max-w-sm gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="h-28 bg-blue-50 rounded-2xl flex flex-col items-center justify-center border-2 border-blue-100 hover:border-blue-300 transition-colors">
                      <p className="text-3xl font-black text-blue-600">{stats.stats_gender["Laki-laki"]}</p>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Putra</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-28 bg-rose-50 rounded-2xl flex flex-col items-center justify-center border-2 border-rose-100 hover:border-rose-300 transition-colors">
                      <p className="text-3xl font-black text-rose-600">{stats.stats_gender["Perempuan"]}</p>
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Putri</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 px-2">
                <p className="text-xs text-ink-500 text-center italic">
                Selamat datang kembali di panel kendali utama PPDB Ulul Albaab. Berikut adalah ikhtisar pendaftaran hari ini.
                </p>
              </div>
            </div>
          </div>

          {/* Regional Stats - Minimalist Map Representation */}
          <div className="flex items-center justify-between pt-4">
            <h3 className="text-xl font-bold text-ink-900">Demografi Pendaftar</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(stats.stats_per_provinsi || []).slice(0, 4).map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-brand-yellow-100 shadow-sm app-card p-4 flex items-center justify-between group hover:border-brand-blue-200 cursor-default transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-yellow-100 text-ink-500 rounded-xl group-hover:bg-brand-blue-50 group-hover:text-brand-blue-700 transition-colors border border-brand-yellow-200">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-ink-700">{item.provinsi}</span>
                </div>
                <span className="text-lg font-bold text-ink-900">{item.jumlah}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Actions & Status Stack */}
        <div className="space-y-6">
          {/* Quick Action Stack */}
          <div className="bg-white rounded-3xl border border-brand-yellow-100 shadow-sm app-card p-6">
            <h3 className="text-lg font-black text-brand-blue-950 mb-4 uppercase tracking-widest text-[10px]">Aksi Cepat</h3>
            <div className="space-y-3">
              {canViewKeuangan && (
                <Link href="/dashboard/admin/verifikasi-pembayaran"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-yellow-50 border border-transparent hover:border-brand-yellow-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-ink-900">Verifikasi Pembayaran</p>
                      <p className="text-xs text-ink-400">{stats.menunggu_verifikasi_pembayaran} menunggu</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-amber-500" />
                </Link>
              )}

              {canViewBerkas && (
                <Link href="/dashboard/admin/verifikasi-dokumen"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-yellow-50 border border-transparent hover:border-brand-yellow-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-ink-900">Verifikasi Dokumen</p>
                      <p className="text-xs text-ink-400">{stats.menunggu_verifikasi_dokumen} menunggu</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-blue-500" />
                </Link>
              )}

              {canViewSeleksi && (
                <Link href="/dashboard/admin/jadwal-ujian"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-yellow-50 border border-transparent hover:border-brand-yellow-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-ink-900">Atur Jadwal Ujian</p>
                      <p className="text-xs text-ink-400">{stats.belum_ujian} siswa belum dapat jadwal</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-purple-500" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
