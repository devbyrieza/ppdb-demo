"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  AlertCircle,
  UploadCloud,
  Download,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/utils/export";
import Link from "next/link";
import Swal from "sweetalert2";
import AdminSearchPendaftarModal from "./AdminSearchPendaftarModal";

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
  tipe_pendaftaran?: string;
  dokumen: DokumenSummary[];
}

function VerifikasiDokumenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlStatus = searchParams.get("status") || "pending";
  const urlSearch = searchParams.get("search") || "";

  const [pendaftarList, setPendaftarList] = useState<PendaftarSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [exporting, setExporting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const canVerify =
    userRole === "admin_super" ||
    userRole === "admin" ||
    userRole === "admin_berkas";

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.session?.role) setUserRole(data.session.role);
          else if (data.user?.user_metadata?.role)
            setUserRole(data.user.user_metadata.role);
        }
      } catch (e) {
        console.error("Failed to fetch session", e);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (urlStatus && urlStatus !== statusFilter) setStatusFilter(urlStatus);
    if (urlSearch && urlSearch !== searchTerm) setSearchTerm(urlSearch);
  }, [urlStatus, urlSearch]);

  const updateFilters = (newStatus?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus !== undefined) params.set("status", newStatus);
    if (newSearch !== undefined) {
      if (newSearch) params.set("search", newSearch);
      else params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const fetchData = useCallback(async () => {
    try {
      if (pendaftarList.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await fetch(
        `/api/admin/verifikasi/dokumen?status=${statusFilter}`,
      );
      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.json();

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
            tipe_pendaftaran: dok.pendaftar.tipe_pendaftaran,
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
      setRefreshing(false);
    }
  }, [statusFilter, pendaftarList.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (type: "excel" | "pdf") => {
    try {
      setExporting(true);
      const response = await fetch(`/api/admin/verifikasi/dokumen?status=all`);
      if (!response.ok) throw new Error("Failed to export");

      const result = await response.json();

      const data = result.data.map(
        (item: {
          pendaftar?: {
            nama_lengkap: string;
            nomor_pendaftaran: string;
            jenjang: string;
            tipe_pendaftaran?: string;
          };
          jenis_dokumen: string;
          is_verified: boolean;
          catatan: string | null;
          created_at: string;
        }) => ({
          "Nama Pendaftar": item.pendaftar?.nama_lengkap
            ? toTitleCase(item.pendaftar.nama_lengkap)
            : "-",
          "Jalur / Tipe": item.pendaftar?.tipe_pendaftaran === "PINDAHAN" ? "Pindahan" : "Reguler",
          "No Pendaftaran": item.pendaftar?.nomor_pendaftaran || "-",
          Jenjang: item.pendaftar?.jenjang || "-",
          "Jenis Dokumen": item.jenis_dokumen || "-",
          Status: item.is_verified
            ? "Terverifikasi"
            : item.catatan
              ? "Ditolak"
              : "Belum Verifikasi",
          Catatan: item.catatan || "-",
          "Tanggal Unggah": new Date(item.created_at).toLocaleDateString(
            "id-ID",
          ),
        }),
      );

      const filename = `data-dokumen-${new Date().toISOString().split("T")[0]}`;

      if (type === "excel") {
        exportToExcel(data, filename, "Data Dokumen");
      } else {
        const headers = Object.keys(data[0] || {});
        const rows = data.map((item: any) => Object.values(item));
        exportToPDF(
          "Laporan Verifikasi Dokumen",
          headers,
          rows,
          filename,
          "landscape",
        );
      }
    } catch (error) {
      console.error("Error exporting:", error);
      Swal.fire("Gagal!", "Gagal export data", "error");
    } finally {
      setExporting(false);
    }
  };

  const filteredList = pendaftarList.filter(
    (p) =>
      p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nomor_pendaftaran.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 border border-primary-100 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="p-2.5 md:p-4 bg-linear-to-br from-primary-600 to-primary-900 rounded-2xl shadow-xl shadow-primary-900/20 flex-shrink-0">
              <FileCheck className="w-6 h-6 md:w-8 md:h-8 text-secondary-100" />
            </div>
            <div>
              <h1 className="text-lg md:text-3xl font-black text-primary-950 tracking-tight leading-none mb-1">
                Verifikasi Dokumen
              </h1>
              <p className="text-sm text-ink-400 font-bold tracking-wide">
                Kelola dan verifikasi berkas pendaftaran santri
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canVerify && (
              <button
                onClick={() => setShowSearchModal(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary-600/20 whitespace-nowrap"
              >
                <UploadCloud className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Atas Nama</span>
              </button>
            )}
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
            <a
              href="/api/admin/export/foto"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Foto ZIP</span>
            </a>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-2 bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white rounded-xl transition-all disabled:opacity-50"
              title="Muat Ulang Data"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:gap-6 pt-6 border-t border-primary-50">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-300 group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama atau nomor pendaftaran..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                updateFilters(undefined, e.target.value);
              }}
              className="w-full pl-12 pr-4 py-4 bg-primary-50/50 border border-primary-100 rounded-2xl focus:border-primary-500 focus:bg-white focus:outline-none transition-all text-sm md:text-base font-bold text-primary-950 placeholder:text-ink-300"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "pending", label: "Menunggu" },
              { id: "verified", label: "Diterima" },
              { id: "rejected", label: "Ditolak" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => updateFilters(s.id)}
                className={`px-4 md:px-8 py-3 rounded-2xl font-black transition-all text-sm md:text-base whitespace-nowrap active:scale-95 ${
                  statusFilter === s.id
                    ? "bg-primary-700 text-white shadow-lg shadow-primary-700/30 ring-2 ring-primary-500/20"
                    : "bg-white border border-primary-100 text-ink-400 hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {refreshing && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-[1px] z-[100] flex items-start md:items-center pt-10 md:pt-0 pb-20 md:pb-0 justify-center pointer-events-none overflow-y-auto overflow-x-hidden p-4">
          <div className="bg-white/80 px-6 py-3 rounded-2xl shadow-xl border border-primary-100 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            <span className="text-sm font-bold text-ink-700 tracking-tight">
              Memperbarui data...
            </span>
          </div>
        </div>
      )}

      {loading && pendaftarList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-primary-100">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
          <p className="text-ink-400 font-bold tracking-wide">
            Mengambil data pendaftar...
          </p>
        </div>
      ) : (
        <>
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-primary-50 text-center">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                <FileCheck className="w-10 h-10 text-primary-300" />
              </div>
              <h3 className="text-xl font-bold text-primary-950 mb-2">
                Tidak Ada Pendaftar
              </h3>
              <p className="text-ink-600">
                Belum ada dokumen yang perlu diverifikasi pada kategori ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((pendaftar) => {
                const verifiedCount = pendaftar.dokumen.filter(
                  (d) => d.is_verified,
                ).length;
                const totalCount = pendaftar.dokumen.length;
                const percentage = Math.round(
                  (verifiedCount / totalCount) * 100,
                );

                return (
                  <Link
                    key={pendaftar.id}
                    href={`/dashboard/admin/verifikasi-dokumen/${pendaftar.id}`}
                    className="group bg-white rounded-3xl border border-primary-100 hover:border-primary-400 p-6 transition-all hover:shadow-xl hover:shadow-primary-900/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary-50 to-secondary-50 -mr-16 -mt-16 rounded-full opacity-50 transition-transform group-hover:scale-110" />

                    <div className="relative">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:from-primary-600 group-hover:to-primary-900 transition-all duration-500 shadow-inner border border-primary-100">
                          <User className="w-6 h-6 text-primary-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-primary-950 truncate group-hover:text-primary-700 transition-colors leading-tight mb-1">
                            {toTitleCase(pendaftar.nama_lengkap)}
                            {pendaftar.tipe_pendaftaran === "PINDAHAN" && (
                              <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-violet-200 align-middle">
                                PINDAHAN
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-primary-400 bg-primary-50 px-2 py-0.5 rounded">
                              {pendaftar.nomor_pendaftaran}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded shadow-xs">
                              {pendaftar.jenjang}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest leading-none">
                          <span className="text-ink-300">
                            Penyelesaian Verifikasi
                          </span>
                          <span className="text-primary-700">
                            {percentage}%
                          </span>
                        </div>
                        <div className="h-2.5 bg-primary-50/50 rounded-full overflow-hidden shadow-inner border border-primary-50">
                          <div
                            className="h-full bg-linear-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                            <span className="text-xs font-bold text-ink-600">
                              {verifiedCount} Terverifikasi
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-secondary-400 shadow-sm shadow-secondary-400/50" />
                            <span className="text-xs font-bold text-ink-600">
                              {totalCount - verifiedCount} Menunggu
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-primary-50 group-hover:border-primary-100 transition-colors">
                        <div className="flex items-center gap-2 text-ink-300 font-black text-[10px] uppercase tracking-widest group-hover:text-primary-600 transition-colors">
                          Proses Verifikasi
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                        {percentage === 100 ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-primary-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      <AdminSearchPendaftarModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </div>
  );
}

export default function VerifikasiDokumenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-primary-100">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
          <p className="text-ink-400 font-bold tracking-wide">
            Memuat halaman...
          </p>
        </div>
      }
    >
      <VerifikasiDokumenContent />
    </Suspense>
  );
}
