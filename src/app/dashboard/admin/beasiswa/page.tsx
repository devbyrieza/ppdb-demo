"use client";

import { useState, useEffect } from "react";
import {
  HandCoins,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  GraduationCap,
  Coins,
  Building2,
  BookOpen,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "SEMUA" | "BEASISWA" | "KERINGANAN";
type FilterStatus = "ALL" | "PENDING" | "DISETUJUI" | "DITOLAK";

interface KeringananJson {
  jenis_bantuan?: "BEASISWA" | "KERINGANAN";
  cakupan?: "UANG_PANGKAL" | "SPP" | "KEDUANYA";
  potongan_uang_pangkal?: number;
  potongan_spp?: number;
  nominal_potongan?: number; // legacy
  catatan?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => (n > 0 ? `Rp ${n.toLocaleString("id-ID")}` : "Rp 0");

const toTitleCase = (str: string) => {
  if (!str) return "-";
  return str
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function getJenisBantuan(item: any): "BEASISWA" | "KERINGANAN" | null {
  // Check from data_lengkap.keringanan_daftar_ulang (new system)
  const dl = item.pendaftar?.data_lengkap;
  if (dl) {
    const parsed = typeof dl === "string" ? JSON.parse(dl) : dl;
    if (parsed?.keringanan_daftar_ulang?.jenis_bantuan) {
      return parsed.keringanan_daftar_ulang.jenis_bantuan;
    }
  }
  // Fallback: from pengajuanBeasiswa.jenis_pengajuan (old system)
  if (item.jenis_pengajuan?.startsWith("BEASISWA")) return "BEASISWA";
  if (item.jenis_pengajuan?.startsWith("KERINGANAN")) return "KERINGANAN";
  return null;
}

function getKeringananJson(item: any): KeringananJson | null {
  const dl = item.pendaftar?.data_lengkap;
  if (!dl) return null;
  try {
    const parsed = typeof dl === "string" ? JSON.parse(dl) : dl;
    return parsed?.keringanan_daftar_ulang || null;
  } catch {
    return null;
  }
}

function cakupanLabel(c?: string) {
  if (c === "UANG_PANGKAL") return "Uang Pangkal";
  if (c === "SPP") return "SPP Bulan Pertama";
  if (c === "KEDUANYA") return "UP + SPP";
  return "-";
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BantuanBiayaPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>("SEMUA");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/admin/beasiswa/export");
      if (!response.ok) throw new Error("Gagal mengunduh laporan");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Laporan_Bantuan_Biaya_Beasiswa_Keringanan.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      Swal.fire({ title: "Berhasil!", text: "Laporan berhasil diunduh.", icon: "success", timer: 2000, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire("Error", "Gagal mengunduh laporan: " + error.message, "error");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/beasiswa");
      const result = await res.json();
      if (result.success) setData(result.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ─── Filtering ───────────────────────────────────────────────────────────────

  const filtered = data.filter((item) => {
    const jenis = getJenisBantuan(item);
    const matchTab =
      filterTab === "SEMUA" ||
      (filterTab === "BEASISWA" && jenis === "BEASISWA") ||
      (filterTab === "KERINGANAN" && jenis === "KERINGANAN");
    const matchStatus = filterStatus === "ALL" || item.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (item.pendaftar?.nama_lengkap || "").toLowerCase().includes(q) ||
      (item.pendaftar?.nomor_pendaftaran || "").toLowerCase().includes(q);
    return matchTab && matchStatus && matchSearch;
  });

  // ─── Stats ────────────────────────────────────────────────────────────────────

  const totalBeasiswa = data.filter((d) => getJenisBantuan(d) === "BEASISWA").length;
  const totalKeringanan = data.filter((d) => getJenisBantuan(d) === "KERINGANAN").length;
  const totalDisetujui = data.filter((d) => d.status === "DISETUJUI").length;
  const totalPending = data.filter((d) => d.status === "PENDING").length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink-950 flex items-center gap-3">
            <HandCoins className="w-8 h-8 text-primary-600" />
            Bantuan Biaya — Beasiswa & Keringanan
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Kelola pemberian beasiswa gratis dan keringanan potongan biaya per pendaftar
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 font-bold text-sm rounded-xl shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Ekspor Excel
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
          <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Total Pengajuan</p>
          <p className="text-2xl font-black text-ink-900">{data.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Beasiswa</p>
          </div>
          <p className="text-2xl font-black text-emerald-900">{totalBeasiswa}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <Coins className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Keringanan</p>
          </div>
          <p className="text-2xl font-black text-amber-900">{totalKeringanan}</p>
        </div>
        <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle className="w-4 h-4 text-primary-600" />
            <p className="text-xs font-black text-primary-600 uppercase tracking-widest">Disetujui</p>
          </div>
          <p className="text-2xl font-black text-primary-900">{totalDisetujui}</p>
          {totalPending > 0 && (
            <p className="text-[10px] text-amber-600 font-bold mt-1">{totalPending} pending</p>
          )}
        </div>
      </div>

      {/* ── Filter Tabs: Beasiswa vs Keringanan ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Jenis tab */}
        <div className="flex items-center bg-white rounded-xl p-1 border border-stone-200 shadow-sm overflow-x-auto max-w-full">
          {(["SEMUA", "BEASISWA", "KERINGANAN"] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilterTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                filterTab === t
                  ? t === "BEASISWA"
                    ? "bg-emerald-100 text-emerald-800"
                    : t === "KERINGANAN"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-primary-50 text-primary-700 shadow-sm"
                  : "text-stone-500 hover:bg-stone-50"
              }`}
            >
              {t === "BEASISWA" && <GraduationCap className="w-3.5 h-3.5" />}
              {t === "KERINGANAN" && <Coins className="w-3.5 h-3.5" />}
              {t === "SEMUA" ? "Semua" : t === "BEASISWA" ? "Beasiswa" : "Keringanan"}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center bg-white rounded-xl p-1 border border-stone-200 shadow-sm overflow-x-auto max-w-full">
          {(["ALL", "PENDING", "DISETUJUI", "DITOLAK"] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                filterStatus === s
                  ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-100"
                  : "text-stone-500 hover:bg-stone-50 border border-transparent"
              }`}
            >
              {s === "ALL" ? "Semua Status" : s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau nomor pendaftaran..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <HandCoins className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Tidak ada data yang sesuai filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Pendaftar</th>
                  <th className="px-6 py-4 font-bold">Jenis Bantuan</th>
                  <th className="px-6 py-4 font-bold">Cakupan</th>
                  <th className="px-6 py-4 font-bold">Uang Pangkal</th>
                  <th className="px-6 py-4 font-bold">SPP Bulan Pertama</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((item) => {
                  const jenis = getJenisBantuan(item);
                  const k = getKeringananJson(item);
                  const isBeasiswa = jenis === "BEASISWA";
                  const pUP = Number(k?.potongan_uang_pangkal ?? k?.nominal_potongan ?? 0);
                  const pSPP = Number(k?.potongan_spp ?? 0);

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                      {/* Pendaftar */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-ink-900">
                          {item.pendaftar?.nama_lengkap ? toTitleCase(item?.pendaftar?.nama_lengkap) : "Tanpa Nama"}
                        </div>
                        <div className="text-stone-500 text-xs">
                          {item.pendaftar?.nomor_pendaftaran} · {item.pendaftar?.jenjang}
                        </div>
                      </td>

                      {/* Jenis Bantuan */}
                      <td className="px-6 py-4">
                        {isBeasiswa ? (
                          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-black w-max">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Beasiswa
                          </span>
                        ) : jenis === "KERINGANAN" ? (
                          <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-black w-max">
                            <Coins className="w-3.5 h-3.5" />
                            Keringanan
                          </span>
                        ) : (
                          <span className="text-stone-400 text-xs font-medium">
                            {item.jenis_pengajuan?.replace("_", " ") || "-"}
                          </span>
                        )}
                      </td>

                      {/* Cakupan */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-ink-800 flex items-center gap-1.5">
                          {k?.cakupan === "UANG_PANGKAL" && <Building2 className="w-4 h-4 text-primary-500" />}
                          {k?.cakupan === "SPP" && <BookOpen className="w-4 h-4 text-violet-500" />}
                          {k?.cakupan === "KEDUANYA" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                          {cakupanLabel(k?.cakupan)}
                        </span>
                      </td>

                      {/* Potongan UP */}
                      <td className="px-6 py-4">
                        {pUP > 0 ? (
                          <span className={`font-bold ${isBeasiswa ? "text-emerald-700" : "text-amber-700"}`}>
                            {isBeasiswa ? "GRATIS" : fmt(pUP)}
                          </span>
                        ) : (
                          <span className="text-stone-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Potongan SPP */}
                      <td className="px-6 py-4">
                        {pSPP > 0 ? (
                          <span className={`font-bold ${isBeasiswa ? "text-emerald-700" : "text-amber-700"}`}>
                            {isBeasiswa ? "GRATIS" : fmt(pSPP)}
                          </span>
                        ) : (
                          <span className="text-stone-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg w-max ${
                            item.status === "DISETUJUI"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : item.status === "DITOLAK"
                              ? "bg-red-50 text-red-700 border border-red-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {item.status === "DISETUJUI" ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : item.status === "DITOLAK" ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {item.status}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/admin/pendaftar/${item.pendaftar_id}`}
                          className="text-primary-600 hover:text-primary-800 font-bold text-xs px-4 py-2 border border-primary-200 hover:border-primary-300 rounded-lg bg-white shadow-sm inline-block transition-colors"
                        >
                          Detail &amp; Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
