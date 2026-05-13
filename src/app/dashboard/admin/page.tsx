"use client";

import { useState, useEffect } from "react";
import { 
  Users, Wallet, Loader2,
  RefreshCw, 
  Clock, FileCheck, CheckCircle2, ClipboardCheck, 
  TrendingUp, ChevronRight, Activity,
  FileSpreadsheet, FileText, CheckSquare
} from "lucide-react";
import { UserRole } from "@/lib/access-control";
import { motion } from "framer-motion";
import { exportToExcelProfessional, exportToPDF } from "@/lib/utils/export";
import Swal from "sweetalert2";

/**
 * ─── ADMIN DASHBOARD PAGE (TEMPLATE DEMO) ───
 */

const StatWidget = ({ label, value, icon: Icon, color, trend, breakdown, highlighted, onDownload, isDownloading, onPromote, isPromoting }: any) => {
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
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <h3 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter italic ${
                highlighted ? "text-white" : "text-teal-950"
              }`}>{value}</h3>
              <span className={`text-xs font-bold ${
                highlighted ? "text-teal-300" : "text-teal-400"
              }`}>Orang</span>
            </div>

            {onDownload && (
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => { e.stopPropagation(); onDownload("excel"); }}
                  disabled={!!isDownloading}
                  title="Unduh Excel"
                  className={`p-2 rounded-xl border transition-all hover:scale-105 duration-300 ${
                    highlighted 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                      : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  {isDownloading === "excel" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDownload("pdf"); }}
                  disabled={!!isDownloading}
                  title="Unduh PDF"
                  className={`p-2 rounded-xl border transition-all hover:scale-105 duration-300 ${
                    highlighted 
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20" 
                      : "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"
                  }`}
                >
                  {isDownloading === "pdf" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tombol Promosikan Semua — hanya muncul jika ada onPromote & value > 0 */}
        {onPromote && value > 0 && (
          <div className="mb-4">
            <button
              onClick={(e) => { e.stopPropagation(); onPromote(); }}
              disabled={isPromoting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPromoting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  Promosikan Semua → Diterima
                </>
              )}
            </button>
          </div>
        )}

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
    total_pendaftar: 0, sudah_bayar: 0, sedang_seleksi: 0, diterima: 0, 
    daftar_ulang: 0, daftar_ulang_sedang: 0, daftar_ulang_selesai: 0, sudah_isi_data: 0, waiting_payment: 0, 
    waiting_docs: 0, stats_per_jenjang: [], berkas_lengkap: 0, cadangan: 0, ditolak: 0,
    growth_text: "+0% pekan ini"
  });
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [isPromotingCadangan, setIsPromotingCadangan] = useState(false);

  const handleSingleCardExport = async (statusKey: string, cardLabel: string, type: "excel" | "pdf") => {
    try {
      setDownloadingKey(`${statusKey}_${type}`);
      const params = new URLSearchParams();
      if (statusKey) params.append("status", statusKey);
      
      const response = await fetch(`/api/admin/pendaftar/export?${params}`);
      if (!response.ok) throw new Error("Failed to export");

      const result = await response.json();
      const rawData: any[] = result.data;
      const filename = `Data_${cardLabel.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`;

      if (rawData.length === 0) {
        alert("Tidak ada data untuk diunduh");
        return;
      }

      const translateStatus = (st: string) => {
        const map: Record<string, string> = {
          draft: "Draf",
          sudah_bayar: "Bayar Pendaftaran",
          sudah_isi_data: "Data Lengkap",
          docs_verified: "Berkas Lengkap",
          selection: "Sedang Seleksi",
          accepted: "Diterima",
          announced: "Cadangan",
          rejected: "Ditolak",
          enrolled: "Sedang Daftar Ulang",
          enrolled_full: "Selesai",
          sudah_daftar_ulang: "Daftar Ulang"
        };
        return map[st] || st;
      };

      const data = rawData.map((item, idx) => ({
        "No.": idx + 1,
        ...item,
        Status: translateStatus(item.Status || "")
      }));

      if (type === "excel") {
        const header = Object.keys(data[0] || {});
        // Grouping by Jenjang
        const jenjangGroups: Record<string, any[]> = {};
        data.forEach((item) => {
          const j = item["Jenjang"] || "LAINNYA";
          if (!jenjangGroups[j]) jenjangGroups[j] = [];
          jenjangGroups[j].push(item);
        });

        const sheets = [
          {
            name: "SEMUA PENDAFTAR",
            title: `DATA ${cardLabel.toUpperCase()}`,
            subTitle: `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")}`,
            header,
            data: data.map((item) => Object.values(item)),
          },
        ];

        Object.keys(jenjangGroups)
          .sort()
          .forEach((j) => {
            const sheetData = jenjangGroups[j].map((item, idx) => ({
              ...item,
              "No.": idx + 1
            }));
            sheets.push({
              name: j.substring(0, 31),
              title: `DATA ${cardLabel.toUpperCase()} - ${j}`,
              subTitle: `Jenjang: ${j} | Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID")}`,
              header,
              data: sheetData.map((item) => Object.values(item)),
            });
          });

        await exportToExcelProfessional({
          fileName: filename,
          sheets,
        });
      } else {
        const headers = [
          "No.",
          "No. Pendaftaran",
          "Nama Lengkap",
          "JK",
          "Jenjang",
          "Asal Sekolah",
          "No. HP",
          "Email",
          "Status"
        ];
        const rows = data.map((item: any, idx: number) => [
          idx + 1,
          item["Nomor Pendaftaran"] || "-",
          item["Nama Lengkap"] || "-",
          (item["Jenis Kelamin"] || "-") === "Laki-laki" ? "L" : "P",
          item["Jenjang"] || "-",
          item["Asal Sekolah"] || "-",
          String(item["No HP"] || "-").replace(/^'/, ""),
          item["Email"] || "-",
          item["Status"] || "-"
        ]);
        exportToPDF(
          `Data ${cardLabel}`,
          headers,
          rows,
          filename,
          "landscape",
        );
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setDownloadingKey(null);
    }
  };

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

  const handlePromoteAllCadangan = async () => {
    const result = await Swal.fire({
      title: "Promosikan Semua Cadangan",
      html: `<p>Yakin ingin memindahkan <b>semua ${stats.cadangan} Pendaftar Cadangan</b> ke status <b>Diterima</b>?</p><p class="mt-3 text-sm text-stone-500">Tindakan ini akan mengubah status seluruh Pendaftar Cadangan sekaligus dan tidak dapat diurungkan secara massal.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: `Ya, Promosikan Semua ${stats.cadangan}!`,
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setIsPromotingCadangan(true);
      const response = await fetch("/api/admin/pendaftar/promote-cadangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal");

      Swal.fire({
        title: "Berhasil!",
        text: data.message || `${data.updated_count} Pendaftar berhasil dipindahkan ke Diterima.`,
        icon: "success",
        confirmButtonColor: "#059669",
      });
      fetchStats();
    } catch (error: any) {
      Swal.fire("Gagal!", error.message || "Terjadi kesalahan.", "error");
    } finally {
      setIsPromotingCadangan(false);
    }
  };

  const getBreakdown = (type: "total" | "lulus" | "ulang" | "ulang_sedang" | "ulang_selesai" | "cadangan" | "ditolak" | "berkas" | "bayar" | "data" | "seleksi") => {
    const mts = stats.stats_per_jenjang.find((j: any) => j.jenjang === "MTS") || {};
    const il = stats.stats_per_jenjang.find((j: any) => j.jenjang === "IL") || {};

    if (type === "total") return { mts_l: mts.pendaftar_putra || 0, mts_p: mts.pendaftar_putri || 0, il_l: il.pendaftar_putra || 0, il_p: il.pendaftar_putri || 0 };
    if (type === "lulus") return { mts_l: mts.diterima_putra || 0, mts_p: mts.diterima_putri || 0, il_l: il.diterima_putra || 0, il_p: il.diterima_putri || 0 };
    if (type === "ulang") return { mts_l: mts.ulang_putra || 0, mts_p: mts.ulang_putri || 0, il_l: il.ulang_putra || 0, il_p: il.ulang_putri || 0 };
    if (type === "ulang_sedang") return { mts_l: mts.ulang_sedang_putra || 0, mts_p: mts.ulang_sedang_putri || 0, il_l: il.ulang_sedang_putra || 0, il_p: il.ulang_sedang_putri || 0 };
    if (type === "ulang_selesai") return { mts_l: mts.ulang_selesai_putra || 0, mts_p: mts.ulang_selesai_putri || 0, il_l: il.ulang_selesai_putra || 0, il_p: il.ulang_selesai_putri || 0 };
    if (type === "cadangan") return { mts_l: mts.cadangan_putra || 0, mts_p: mts.cadangan_putri || 0, il_l: il.cadangan_putra || 0, il_p: il.cadangan_putri || 0 };
    if (type === "ditolak") return { mts_l: mts.ditolak_putra || 0, mts_p: mts.ditolak_putri || 0, il_l: il.ditolak_putra || 0, il_p: il.ditolak_putri || 0 };
    if (type === "berkas") return { mts_l: mts.berkas_putra || 0, mts_p: mts.berkas_putri || 0, il_l: il.berkas_putra || 0, il_p: il.berkas_putri || 0 };
    if (type === "seleksi") return { mts_l: mts.seleksi_putra || 0, mts_p: mts.seleksi_putri || 0, il_l: il.seleksi_putra || 0, il_p: il.seleksi_putri || 0 };
    if (type === "bayar") return { mts_l: mts.bayar_putra || 0, mts_p: mts.bayar_putri || 0, il_l: il.bayar_putra || 0, il_p: il.bayar_putri || 0 };
    if (type === "data") return { mts_l: mts.data_putra || 0, mts_p: mts.data_putri || 0, il_l: il.data_putra || 0, il_p: il.data_putri || 0 };
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
          <h1 className="text-2xl sm:text-3xl font-black text-teal-950 tracking-tight italic">Dashboard Admin Al Fath</h1>
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
                <p className="text-[10px] sm:text-[11px] font-black text-teal-200 uppercase tracking-widest mt-2">Bayar Pendaftaran</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto">
             <div className="bg-white/5 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 flex flex-col items-center">
                <p className="text-[9px] sm:text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2 sm:mb-4 text-center">Diterima</p>
                <p className="text-2xl sm:text-4xl font-black text-emerald-400 italic">{stats.diterima}</p>
             </div>
             <div className="bg-white/5 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 flex flex-col items-center">
                <p className="text-[9px] sm:text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2 sm:mb-4 text-center">Sedang Daftar Ulang</p>
                <p className="text-2xl sm:text-4xl font-black text-sand-300 italic">{stats.daftar_ulang_sedang}</p>
             </div>
             <div className="bg-white/5 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 flex flex-col items-center">
                <p className="text-[9px] sm:text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2 sm:mb-4 text-center">Selesai</p>
                <p className="text-2xl sm:text-4xl font-black text-emerald-400 italic">{stats.daftar_ulang_selesai}</p>
             </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {isAdminSuper && (<>
          <StatWidget label="Total Pendaftar" value={stats.total_pendaftar} icon={Users} color="blue" trend={stats.growth_text || "+0% pekan ini"} breakdown={getBreakdown("total")} highlighted={false} onDownload={(type: "excel" | "pdf") => handleSingleCardExport("", "Total Pendaftar", type)} isDownloading={downloadingKey?.startsWith("_") ? downloadingKey.split("_")[1] : null} />
          <StatWidget label="Bayar Pendaftaran" value={stats.sudah_bayar} icon={Wallet} color="emerald" breakdown={getBreakdown("bayar")} highlighted={false} onDownload={(type: "excel" | "pdf") => handleSingleCardExport("sudah_bayar", "Bayar Pendaftaran", type)} isDownloading={downloadingKey?.startsWith("sudah_bayar_") ? downloadingKey.split("_")[2] : null} />
          <StatWidget label="Data Lengkap" value={stats.sudah_isi_data} icon={FileCheck} color="purple" breakdown={getBreakdown("data")} highlighted={false} onDownload={(type: "excel" | "pdf") => handleSingleCardExport("sudah_isi_data", "Data Lengkap", type)} isDownloading={downloadingKey?.startsWith("sudah_isi_data_") ? downloadingKey.split("_")[3] : null} />
          <StatWidget label="Berkas Lengkap" value={stats.berkas_lengkap} icon={ClipboardCheck} color="purple" breakdown={getBreakdown("berkas")} highlighted={false} onDownload={(type: "excel" | "pdf") => handleSingleCardExport("dokumen_terverifikasi", "Berkas Lengkap", type)} isDownloading={downloadingKey?.startsWith("dokumen_terverifikasi_") ? downloadingKey.split("_")[2] : null} />
          <StatWidget label="Sedang Seleksi" value={stats.sedang_seleksi} icon={Loader2} color="blue" breakdown={getBreakdown("seleksi")} highlighted={false} onDownload={(type: "excel" | "pdf") => handleSingleCardExport("selection", "Sedang Seleksi", type)} isDownloading={downloadingKey?.startsWith("selection_") ? downloadingKey.split("_")[1] : null} />
          <StatWidget label="Diterima" value={stats.diterima} icon={CheckCircle2} color="emerald" breakdown={getBreakdown("lulus")} highlighted={false} onDownload={(type: "excel" | "pdf") => handleSingleCardExport("diterima", "Diterima", type)} isDownloading={downloadingKey?.startsWith("diterima_") ? downloadingKey.split("_")[1] : null} />
          <StatWidget label="Cadangan" value={stats.cadangan} icon={Clock} color="slate" breakdown={getBreakdown("cadangan")} highlighted={false} onDownload={(type: "excel" | "pdf") => handleSingleCardExport("announced", "Cadangan", type)} isDownloading={downloadingKey?.startsWith("announced_") ? downloadingKey.split("_")[1] : null} onPromote={handlePromoteAllCadangan} isPromoting={isPromotingCadangan} />
          <StatWidget label="Ditolak" value={stats.ditolak} icon={Activity} color="rose" breakdown={getBreakdown("ditolak")} highlighted={false} onDownload={(type: "excel" | "pdf") => handleSingleCardExport("pembayaran_ditolak", "Ditolak", type)} isDownloading={downloadingKey?.startsWith("pembayaran_ditolak_") ? downloadingKey.split("_")[2] : null} />
          <StatWidget label="Sedang Daftar Ulang" value={stats.daftar_ulang_sedang} icon={Wallet} color="amber" breakdown={getBreakdown("ulang_sedang")} highlighted={false} onDownload={(type: "excel" | "pdf") => handleSingleCardExport("enrolled", "Sedang Daftar Ulang", type)} isDownloading={downloadingKey?.startsWith("enrolled_") ? downloadingKey.split("_")[1] : null} />
          <StatWidget label="Selesai" value={stats.daftar_ulang_selesai} icon={CheckCircle2} color="emerald" breakdown={getBreakdown("ulang_selesai")} highlighted={false} onDownload={(type: "excel" | "pdf") => handleSingleCardExport("enrolled_full", "Selesai Daftar Ulang", type)} isDownloading={downloadingKey?.startsWith("enrolled_full_") ? downloadingKey.split("_")[1] : null} />
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

      {/* SUMMARY INSIGHTS - Terbuka untuk semua Admin */}
      {(isAdminSuper || isAdminBerkas || isAdminKeuangan) && (
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
                <div>
                  <p className="text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2">Sedang Daftar Ulang</p>
                  <p className="text-2xl sm:text-4xl font-black text-gold-400 italic">{stats.daftar_ulang_sedang}</p>
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
                <div>
                  <p className="text-[10px] font-black text-teal-200 uppercase tracking-widest mb-2">Selesai</p>
                  <p className="text-2xl sm:text-4xl font-black text-emerald-400 italic">{stats.daftar_ulang_selesai}</p>
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
