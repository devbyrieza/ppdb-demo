"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileCheck,
  Filter,
  Loader2,
  RefreshCw,
  User,
  Search,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/utils/export";
import Link from "next/link";

interface DokumenSummary {
  id: string;
  is_verified: boolean;
  catatan: string | null;
}

interface PendaftarSummary {
  id: string;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenjang: string;
  no_hp: string | null;
  dokumen: DokumenSummary[];
}

export default function VerifikasiDokumenPage() {
  const [pendaftarList, setPendaftarList] = useState<PendaftarSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // We fetch based on status but we want to group by pendaftar
      const response = await fetch(
        `/api/admin/verifikasi/dokumen?status=${statusFilter}`
      );
      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.json();

      // Group by pendaftar
      const grouped: Record<string, PendaftarSummary> = {};

      for (const dok of result.data || []) {
        if (!dok.pendaftar) continue;

        const pendaftarId = dok.pendaftar.id;
        if (!grouped[pendaftarId]) {
          grouped[pendaftarId] = {
            id: dok.pendaftar.id,
            nomor_pendaftaran: dok.pendaftar.nomor_pendaftaran,
            nama_lengkap: dok.pendaftar.nama_lengkap,
            jenjang: dok.pendaftar.jenjang,
            no_hp: dok.pendaftar.no_hp,
            dokumen: [],
          };
        }
        grouped[pendaftarId].dokumen.push({
          id: dok.id,
          is_verified: dok.is_verified,
          catatan: dok.catatan,
        });
      }

      setPendaftarList(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (type: "excel" | "pdf") => {
    try {
      setExporting(true);
      const response = await fetch(`/api/admin/verifikasi/dokumen?status=all`);
      if (!response.ok) throw new Error("Failed to export");

      const result = await response.json();

      const data = result.data.map((item: any) => ({
        "Nama Pendaftar": item.pendaftar?.nama_lengkap ? toTitleCase(item.pendaftar.nama_lengkap) : "-",
        "No Pendaftaran": item.pendaftar?.nomor_pendaftaran || "-",
        "Jenjang": item.pendaftar?.jenjang || "-",
        "Jenis Dokumen": item.jenis_dokumen || "-",
        "Status": item.is_verified ? "Terverifikasi" : (item.catatan ? "Ditolak" : "Belum Verifikasi"),
        "Catatan": item.catatan || "-",
        "Tanggal Unggah": new Date(item.created_at).toLocaleDateString("id-ID")
      }));

      const filename = `data-dokumen-${new Date().toISOString().split("T")[0]}`;

      if (type === "excel") {
        exportToExcel(data, filename, "Data Dokumen");
      } else {
        const headers = Object.keys(data[0] || {});
        const rows = data.map((item: any) => Object.values(item));
        exportToPDF("Laporan Verifikasi Dokumen", headers, rows, filename, "landscape");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Gagal export data");
    } finally {
      setExporting(false);
    }
  };

  const filteredList = pendaftarList.filter(p =>
    p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nomor_pendaftaran.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 border border-brand-yellow-100 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="p-2.5 md:p-4 bg-linear-to-br from-brand-blue-600 to-brand-blue-900 rounded-2xl shadow-xl shadow-brand-blue-900/20 flex-shrink-0">
              <FileCheck className="w-6 h-6 md:w-8 md:h-8 text-brand-yellow-100" />
            </div>
            <div>
              <h1 className="text-lg md:text-3xl font-black text-brand-blue-950 tracking-tight leading-none mb-1">Verifikasi Dokumen</h1>
              <p className="text-sm text-ink-400 font-bold tracking-wide">Kelola dan verifikasi berkas pendaftaran santri</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleExport("excel")}
              disabled={exporting}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50 text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={exporting}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50 text-sm"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={fetchData}
              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
              title="Muat Ulang Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-col gap-3 md:gap-6 pt-6 border-t border-brand-yellow-50">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300 group-focus-within:text-brand-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama atau nomor pendaftaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-brand-yellow-50/50 border border-brand-yellow-100 rounded-2xl focus:border-brand-blue-500 focus:bg-white focus:outline-none transition-all text-sm md:text-base font-bold text-brand-blue-950 placeholder:text-ink-300"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "pending", label: "Menunggu" },
              { id: "verified", label: "Diterima" },
              { id: "rejected", label: "Ditolak" }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-4 md:px-8 py-3 rounded-2xl font-black transition-all text-sm md:text-base whitespace-nowrap active:scale-95 ${statusFilter === s.id
                  ? "bg-brand-blue-700 text-white shadow-lg shadow-brand-blue-700/30 ring-2 ring-brand-blue-500/20"
                  : "bg-white border border-brand-yellow-200 text-ink-400 hover:bg-brand-yellow-50 hover:text-brand-blue-700"
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-brand-yellow-100">
          <Loader2 className="w-12 h-12 animate-spin text-brand-blue-600 mb-4" />
          <p className="text-ink-400 font-bold tracking-wide">Mengambil data pendaftar...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-stone-100 text-center">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
            <FileCheck className="w-10 h-10 text-stone-300" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-2">Tidak Ada Pendaftar</h3>
          <p className="text-stone-500">Belum ada dokumen yang perlu diverifikasi pada kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((pendaftar) => {
            const verifiedCount = pendaftar.dokumen.filter(d => d.is_verified).length;
            const totalCount = pendaftar.dokumen.length;
            const percentage = Math.round((verifiedCount / totalCount) * 100);

            return (
              <Link
                key={pendaftar.id}
                href={`/dashboard/admin/verifikasi-dokumen/${pendaftar.id}`}
                className="group bg-white rounded-3xl border border-brand-yellow-100 hover:border-brand-blue-400 p-6 transition-all hover:shadow-xl hover:shadow-brand-blue-900/5 relative overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-brand-blue-50 to-brand-yellow-50 -mr-16 -mt-16 rounded-full opacity-50 transition-transform group-hover:scale-110" />

                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-brand-yellow-100 rounded-2xl flex items-center justify-center group-hover:from-brand-blue-600 group-hover:to-brand-blue-900 transition-all duration-500 shadow-inner border border-brand-yellow-200">
                      <User className="w-6 h-6 text-brand-blue-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-brand-blue-950 truncate group-hover:text-brand-blue-700 transition-colors leading-tight mb-1">
                        {toTitleCase(pendaftar.nama_lengkap)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-brand-blue-400 bg-brand-blue-50 px-2 py-0.5 rounded">
                          {pendaftar.nomor_pendaftaran}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue-700 bg-brand-yellow-100 border border-brand-yellow-200 px-2 py-0.5 rounded shadow-xs">
                          {pendaftar.jenjang}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest leading-none">
                      <span className="text-ink-300">Penyelesaian Verifikasi</span>
                      <span className="text-brand-blue-700">{percentage}%</span>
                    </div>
                    <div className="h-2.5 bg-brand-yellow-100/50 rounded-full overflow-hidden shadow-inner border border-brand-yellow-50">
                      <div
                        className="h-full bg-linear-to-r from-brand-blue-500 to-brand-blue-700 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                        <span className="text-xs font-bold text-stone-600">{verifiedCount} Terverifikasi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                        <span className="text-xs font-bold text-stone-600">{totalCount - verifiedCount} Menunggu</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-brand-yellow-50 group-hover:border-brand-blue-100 transition-colors">
                    <div className="flex items-center gap-2 text-ink-300 font-black text-[10px] uppercase tracking-widest group-hover:text-brand-blue-600 transition-colors">
                      Proses Verifikasi
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                    {percentage === 100 ? (
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-brand-blue-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
