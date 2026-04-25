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
  ClipboardCheck,
  Bell,
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
  MTS: "Jenjang MTS",
  IL: "Jenjang IL",
  SMA: "Jenjang SMA",
};

import Swal from "sweetalert2";

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

  const handleExportDatabase = async () => {
    try {
      Swal.fire({
        title: "Menyiapkan Data...",
        text: "Sistem sedang mengonversi database ke format Excel.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await fetch(`/api/admin/pendaftar/export?tahun_ajaran_id=${selectedTahunAjaranId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Data_Pendaftar_Demo_${tahunAjaranList.find(t => t.id === selectedTahunAjaranId)?.nama || "Export"}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        Swal.close();
      } else {
        throw new Error("Gagal mengunduh data");
      }
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  const handleSyncMaster = async () => {
    const { value: file } = await Swal.fire({
      title: "Sync Master Data",
      text: "Upload file Excel MASTER untuk sinkronisasi status pendaftaran massal.",
      input: "file",
      inputAttributes: {
        accept: ".xlsx, .xls, .csv",
        "aria-label": "Upload master excel file",
      },
      showCancelButton: true,
      confirmButtonText: "Upload & Sync",
      confirmButtonColor: "#0284c7",
    });

    if (file) {
      Swal.fire({
        title: "Memproses...",
        text: "Harap tunggu sementara sistem menyinkronkan data.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/admin/sync/master", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "Sinkronisasi Berhasil",
            html: `
              <div class="text-left text-sm space-y-1">
                <p>✅ <b>${result.results.updated}</b> Data berhasil di-update.</p>
                <p>❓ <b>${result.results.notFound}</b> Data tidak ditemukan di database.</p>
                <p>Total baris diproses: ${result.results.updated + result.results.notFound}</p>
              </div>
            `,
          }).then(() => {
            if (selectedTahunAjaranId) fetchStats(selectedTahunAjaranId);
          });
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        Swal.fire("Gagal", error.message, "error");
      }
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
          if (active) {
            setSelectedTahunAjaranId(active.id);
          } else if (list.length > 0) {
            setSelectedTahunAjaranId(list[0].id);
          } else {
            fetchStats("");
          }
        }
      } catch (e) {
        console.error(e);
        fetchStats("");
      }
    }
    init();
  }, []);

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
    if (selectedTahunAjaranId) {
      fetchStats(selectedTahunAjaranId);
    }
  }, [selectedTahunAjaranId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue-600" />
      </div>
    );

  const daysLeft = getPPDBCountdown();
  const isAdminSuper = role === "admin_super";
  const isKeuangan = role === "admin_keuangan";
  const isBerkas = role === "admin_berkas";
  
  const canViewKeuangan = isAdminSuper || isKeuangan || role === "admin";
  const canViewBerkas = isAdminSuper || isBerkas || role === "admin";

  return (
    <div className="space-y-8 pb-12">
      {daysLeft !== null && (
        <div
          className={`rounded-3xl border-2 px-8 py-5 flex items-center justify-between shadow-clay-sm animate-in slide-in-from-top duration-500 ${
            daysLeft <= 7
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-brand-yellow-50 border-brand-yellow-200 text-brand-blue-950"
          }`}
        >
          <div className="flex items-center gap-4">
            <Timer className="w-6 h-6" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">
                Pendaftaran Ditutup
              </p>
              <p className="font-black text-xl">{daysLeft} Hari Lagi • 30 Mei 2026</p>
            </div>
          </div>
          <div
            className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              daysLeft <= 7 ? "bg-red-600 text-white" : "bg-brand-blue-900 text-white"
            }`}
          >
            {daysLeft <= 7 ? "Mendesak" : "Berjalan"}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-brand-blue-700 to-brand-blue-900 p-10 md:p-16 text-white shadow-2xl app-card border border-brand-blue-600">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow-400/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                Admin Dashboard
              </span>
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
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight leading-none mb-4 text-white">
              Monitor <br /> Pendaftaran
            </h1>
            <p className="text-brand-blue-100 font-bold opacity-90 text-sm md:text-lg max-w-md italic">
              Ikhtisar real-time calon santri Tahun Ajaran{" "}
              {tahunAjaranList.find((t) => t.id === selectedTahunAjaranId)?.nama || "..."}.
            </p>
          </div>
          <Link
            href="/dashboard/admin/pendaftar"
            className="bg-brand-yellow-400 hover:bg-brand-yellow-300 text-brand-blue-950 px-10 py-5 rounded-3xl font-black uppercase text-xs shadow-xl transition-all flex items-center gap-3"
          >
            <Users className="w-6 h-6" /> Data Pendaftar
          </Link>
        </div>
      </div>

      {/* Role-Specific Action Cards */}
      {(isKeuangan || isBerkas || isAdminSuper) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(isKeuangan || isAdminSuper) && stats.waiting_payment > 0 && (
            <Link
              href="/dashboard/admin/keuangan"
              className="group relative overflow-hidden rounded-3xl bg-amber-50 border border-amber-200 p-6 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Perlu Tindakan</p>
                  <h3 className="text-lg font-black text-amber-900 leading-none">
                    {stats.waiting_payment} Pembayaran
                  </h3>
                  <p className="text-xs text-amber-700 font-medium mt-1">Menunggu verifikasi Anda hari ini</p>
                </div>
                <div className="ml-auto bg-amber-200/50 p-2 rounded-xl group-hover:bg-amber-200 transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-amber-700" />
                </div>
              </div>
            </Link>
          )}

          {(isBerkas || isAdminSuper) && stats.waiting_docs > 0 && (
            <Link
              href="/dashboard/admin/verifikasi-dokumen"
              className="group relative overflow-hidden rounded-3xl bg-brand-blue-50 border border-brand-blue-100 p-6 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-brand-blue-600 uppercase tracking-widest mb-1">Perlu Tindakan</p>
                  <h3 className="text-lg font-black text-brand-blue-950 leading-none">
                    {stats.waiting_docs} Berkas Pendaftar
                  </h3>
                  <p className="text-xs text-brand-blue-800 font-medium mt-1">Siap untuk diverifikasi kelengkapannya</p>
                </div>
                <div className="ml-auto bg-brand-blue-200/50 p-2 rounded-xl group-hover:bg-brand-blue-200 transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-brand-blue-700" />
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {[
          { label: "Total Pendaftar", val: stats.total_pendaftar, icon: Users, color: "blue" },
          { label: "Lolos Utama", val: stats.diterima, icon: GraduationCap, color: "emerald" },
          { label: "Cadangan", val: stats.cadangan, icon: Loader2, color: "yellow" },
          { label: "Sudah Daftar Ulang", val: stats.daftar_ulang, icon: Wallet, color: "indigo" },
        ]
          .map((item, id) => (
            <div
              key={id}
              className="bg-white rounded-4xl p-6 md:p-8 border border-brand-yellow-100 shadow-sm app-card group"
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6 shadow-clay-sm transition-transform group-hover:scale-110 ${
                  item.color === "blue"
                    ? "bg-brand-blue-50 text-brand-blue-600"
                    : item.color === "yellow"
                    ? "bg-brand-yellow-50 text-brand-yellow-600"
                    : item.color === "indigo"
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <item.icon className={`w-6 h-6 md:w-7 md:h-7 ${item.label === "Cadangan" ? "animate-spin-slow" : ""}`} />
              </div>
              <p className="text-[10px] font-black text-ink-300 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-2xl md:text-5xl font-black text-brand-blue-950 font-display tracking-tight leading-none">
                {item.val}
              </p>
            </div>
          ))}
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-4xl border border-brand-yellow-100 shadow-sm overflow-x-auto app-card">
            <div className="p-6 md:p-8 border-b border-brand-yellow-50 bg-brand-yellow-50/20">
              <h3 className="text-lg md:text-xl font-black text-brand-blue-950 uppercase tracking-tight">
                Performa Jenjang
              </h3>
            </div>

            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-stone-50 text-[9px] font-black uppercase tracking-widest text-ink-400">
                <tr className="border-b border-brand-yellow-50">
                  <th rowSpan={2} className="px-6 py-4 border-r border-brand-yellow-50">Jenjang</th>
                  <th colSpan={3} className="px-4 py-3 text-center border-r border-brand-yellow-50 bg-slate-100/50">Kuota</th>
                  <th colSpan={3} className="px-4 py-3 text-center border-r border-brand-yellow-50 bg-blue-50">Pendaftar</th>
                  <th colSpan={3} className="px-4 py-3 text-center border-r border-brand-yellow-50 bg-orange-50">Cadangan</th>
                  <th colSpan={3} className="px-4 py-3 text-center border-r border-brand-yellow-50 bg-emerald-50">Diterima</th>
                  <th colSpan={3} className="px-4 py-3 text-center bg-purple-50">Sudah Daftar Ulang</th>
                </tr>
                <tr className="border-b border-brand-yellow-100">
                  {/* Kuota */}
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50">L</th>
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50">P</th>
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 font-black text-slate-800">T</th>
                  {/* Pendaftar */}
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 text-blue-600">L</th>
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 text-pink-600">P</th>
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 font-black text-blue-800">T</th>
                  {/* Cadangan */}
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 text-orange-600">L</th>
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 text-pink-600">P</th>
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 font-black text-orange-800">T</th>
                  {/* Diterima */}
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 text-emerald-600">L</th>
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 text-pink-600">P</th>
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 font-black text-emerald-800">T</th>
                  {/* Daftar Ulang */}
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 text-purple-600">L</th>
                  <th className="px-2 py-2 text-center border-r border-brand-yellow-50 text-pink-600">P</th>
                  <th className="px-2 py-2 text-center font-black text-purple-800">T</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-yellow-50 text-xs">
                {[...(stats.stats_per_jenjang || [])]
                  .filter((item: any) => item.pendaftar > 0 || item.kuota_total > 0)
                  .sort((a: any, b: any) => {
                    const order: Record<string, number> = { MTS: 1, IL: 2, SMA: 3 };
                    return (order[a.jenjang] || 99) - (order[b.jenjang] || 99);
                  })
                  .map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-brand-yellow-50/20 transition-colors">
                      <td className="px-6 py-4 border-r border-brand-yellow-50">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] ${
                              item.jenjang === "MTS"
                                ? "bg-brand-blue-600"
                                : item.jenjang === "SMA"
                                ? "bg-brand-blue-900"
                                : "bg-brand-yellow-500"
                            }`}
                          >
                            {item.jenjang.substring(0, 2)}
                          </div>
                          <p className="font-extrabold text-slate-800">{JENJANG_LABELS[item.jenjang] || item.jenjang}</p>
                        </div>
                      </td>
                      {/* Kuota */}
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-bold text-slate-400">{item.kuota_putra || "-"}</td>
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-bold text-slate-400">{item.kuota_putri || "-"}</td>
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-slate-600 bg-slate-50/30">{item.kuota_total || "-"}</td>
                      {/* Pendaftar */}
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-blue-600 bg-blue-50/10">{item.pendaftar_putra}</td>
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-pink-600 bg-blue-50/10">{item.pendaftar_putri}</td>
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-blue-900 bg-blue-50/30">{item.pendaftar}</td>
                      {/* Cadangan */}
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-orange-600 bg-orange-50/10">{item.cadangan_putra}</td>
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-pink-600 bg-orange-50/10">{item.cadangan_putri}</td>
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-orange-900 bg-orange-50/30">{item.cadangan}</td>
                      {/* Diterima */}
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-emerald-600 bg-emerald-50/10">{item.diterima_putra}</td>
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-pink-600 bg-emerald-50/10">{item.diterima_putri}</td>
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-emerald-900 bg-emerald-50/30">{item.diterima}</td>
                      {/* Daftar Ulang */}
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-purple-600 bg-purple-50/10">{item.ulang_putra}</td>
                      <td className="px-2 py-4 text-center border-r border-brand-yellow-50 font-black text-pink-600 bg-purple-50/10">{item.ulang_putri}</td>
                      <td className="px-2 py-4 text-center font-black text-purple-900 bg-purple-50/30">{item.daftar_ulang}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-brand-blue-900 rounded-4xl p-10 text-white relative overflow-hidden app-card shadow-2xl">
            <BarChart3 className="w-12 h-12 text-brand-yellow-400 mb-8" />
            <h4 className="text-2xl font-black mb-4 font-display leading-tight text-white">Laporan Excel</h4>
            <p className="text-brand-blue-100 font-bold mb-8 opacity-100">
              Unduh data pendaftaran terbaru untuk keperluan rapat panitia.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleExportDatabase}
                className="w-full bg-white text-brand-blue-900 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-yellow-300 transition-all shadow-xl"
              >
                Export Database
              </button>
              <button 
                onClick={handleSyncMaster}
                className="w-full bg-brand-yellow-400 text-brand-blue-900 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4" /> Sync Master Data
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-4xl border border-brand-yellow-100 shadow-sm p-8 app-card h-full">
            <h3 className="text-[10px] font-black text-ink-300 uppercase tracking-widest mb-6">Navigasi Cepat</h3>
            <div className="space-y-4">
              <Link
                href="/dashboard/admin/perubahan-data"
                className="flex items-center justify-between p-4 bg-brand-yellow-50/50 hover:bg-brand-yellow-100 rounded-2xl transition-all group border border-brand-yellow-100"
              >
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
