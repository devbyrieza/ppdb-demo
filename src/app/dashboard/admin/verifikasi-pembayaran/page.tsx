"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CreditCard,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  User,
  Calendar as CalendarIcon,
  Phone,
  DollarSign,
  FileSpreadsheet,
  FileText,
  UploadCloud,
  Search,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { exportToExcel, exportToPDF } from "@/lib/utils/export";
import Swal from "sweetalert2";

interface Pembayaran {
  id: string;
  jumlah: string;
  metode_pembayaran: string;
  status_pembayaran: string;
  catatan: string | null;
  keringanan_reason: string | null;
  bukti_transfer_url: string | null;
  tanggal_pembayaran: string | null;
  created_at: string;
  updated_at: string;
  pendaftar: {
    id: string;
    nomor_pendaftaran: string;
    nama_lengkap: string;
    jenjang: string;
    no_hp: string | null;
  } | null;
  tipe_cicilan: string;
  jumlah_cicilan: number;
  cicilan_ke: number;
}

function VerifikasiPembayaranContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlStatus = searchParams.get("status") || "pending";
  const urlJenis = searchParams.get("jenis") || "PENDAFTARAN";

  const [pembayaran, setPembayaran] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPembayaran, setSelectedPembayaran] =
    useState<Pembayaran | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [editJumlah, setEditJumlah] = useState("");
  const [processing, setProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploadingProof, setUploadingProof] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"PENDAFTARAN" | "DAFTAR_ULANG">(
    urlJenis as any,
  );
  const [tipeCicilanFilter, setTipeCicilanFilter] = useState<
    "ALL" | "LUNAS" | "CICILAN"
  >("ALL");
  const [editTipeCicilan, setEditTipeCicilan] = useState("LUNAS");
  const [editCicilanKe, setEditCicilanKe] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.session?.role) {
            setUserRole(data.session.role);
          } else if (data.user?.user_metadata?.role) {
            setUserRole(data.user.user_metadata.role);
          }
        }
      } catch (e) {
        console.error("Failed to fetch session", e);
      }
    };
    fetchSession();
  }, []);

  const canVerify =
    userRole === "admin_super" ||
    userRole === "admin" ||
    userRole === "admin_keuangan";

  useEffect(() => {
    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
    }
    if (urlJenis && urlJenis !== activeTab) {
      setActiveTab(urlJenis as any);
    }
  }, [urlStatus, urlJenis]);

  const updateFilters = (newStatus?: string, newJenis?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus) params.set("status", newStatus);
    if (newJenis) params.set("jenis", newJenis);
    router.push(`?${params.toString()}`);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPembayaran();
  }, [statusFilter, activeTab]);

  const fetchPembayaran = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      const response = await fetch(
        `/api/admin/verifikasi/pembayaran?status=${statusFilter}&jenis=${activeTab}`,
      );
      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.json();
      setPembayaran(result.data);
    } catch (error) {
      console.error("Error fetching pembayaran:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredPembayaran = pembayaran.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      item.pendaftar?.nama_lengkap?.toLowerCase().includes(searchLower) ||
      item.pendaftar?.nomor_pendaftaran?.toLowerCase().includes(searchLower);
    const matchTipe =
      tipeCicilanFilter === "ALL" || item.tipe_cicilan === tipeCicilanFilter;
    return matchSearch && matchTipe;
  });

  const handleExport = async (type: "excel" | "pdf") => {
    try {
      setExporting(true);
      const response = await fetch(
        `/api/admin/verifikasi/pembayaran?status=all&jenis=${activeTab}`,
      );
      if (!response.ok) throw new Error("Failed to export");

      const result = await response.json();
      const rawData = result.data;

      const data = rawData.map((item: Pembayaran) => ({
        "Nama Lengkap": item.pendaftar?.nama_lengkap
          ? toTitleCase(item.pendaftar.nama_lengkap)
          : "-",
        "Nomor Pendaftaran": item.pendaftar?.nomor_pendaftaran || "-",
        Jenjang: item.pendaftar?.jenjang || "-",
        Nominal: item.jumlah
          ? parseInt(item.jumlah).toLocaleString("id-ID")
          : "0",
        "Metode Pembayaran": item.metode_pembayaran || "-",
        Status: (item.status_pembayaran === "verified" || item.status_pembayaran === "VERIFIED") ? "Terverifikasi" : ((item.status_pembayaran === "rejected" || item.status_pembayaran === "REJECTED") ? "Ditolak" : "Pending"),
        "Tanggal Bayar": item.tanggal_pembayaran
          ? new Date(item.tanggal_pembayaran).toLocaleDateString("id-ID")
          : "-",
        Catatan: item.catatan || "-",
      }));

      const filename = `data-pembayaran-${activeTab.toLowerCase()}-${new Date().toISOString().split("T")[0]}`;

      if (type === "excel") {
        exportToExcel(
          data,
          filename,
          `Data Pembayaran ${activeTab.replace("_", " ")}`,
        );
      } else {
        const headers = Object.keys(data[0] || {});
        const rows = data.map((item: any) => Object.values(item));
        exportToPDF(
          `Laporan Pembayaran ${activeTab.replace("_", " ")}`,
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

  const handleVerify = async (
    pembayaranId: string,
    status: "verified" | "rejected" | "pending",
  ) => {
    if (!canVerify) {
      Swal.fire(
        "Akses Ditolak",
        "Anda tidak memiliki izin untuk melakukan verifikasi",
        "error",
      );
      return;
    }
    try {
      setProcessing(true);
      const response = await fetch("/api/admin/verifikasi/pembayaran", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pembayaran_id: pembayaranId,
          status_pembayaran: status,
          catatan: catatan.trim() || null,
          jumlah: editJumlah ? parseFloat(editJumlah) : null,
          tipe_cicilan: editTipeCicilan,
          cicilan_ke: editCicilanKe,
        }),
      });

      if (!response.ok) throw new Error("Failed to verify");

      await fetchPembayaran(true);
      setShowModal(false);
      setSelectedPembayaran(null);
      setCatatan("");
    } catch (error) {
      console.error("Error verifying pembayaran:", error);
      Swal.fire("Gagal!", "Gagal memverifikasi pembayaran", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPembayaran) return;

    try {
      setUploadingProof(selectedPembayaran.id);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pembayaran_id", selectedPembayaran.id);

      const response = await fetch("/api/admin/verifikasi/pembayaran/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire(
          "Berhasil!",
          "Bukti pembayaran berhasil diganti dan otomatis diverifikasi",
          "success",
        );
        fetchPembayaran(true);
        setShowModal(false);
      } else {
        Swal.fire(
          "Gagal!",
          data.error || "Gagal mengunggah bukti pembayaran",
          "error",
        );
      }
    } catch (error) {
      console.error("Error replacing payment proof:", error);
      Swal.fire("Error!", "Terjadi kesalahan saat mengunggah", "error");
    } finally {
      setUploadingProof(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
    );
  };

  const openModal = (pay: Pembayaran) => {
    setSelectedPembayaran(pay);
    setCatatan(pay.catatan || "");
    setEditJumlah(pay.jumlah);
    setEditTipeCicilan(pay.tipe_cicilan || "LUNAS");
    setEditCicilanKe(pay.cicilan_ke || 1);
    setShowModal(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRupiah = (amount: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  return (
    <div className="space-y-6 relative">
      {isRefreshing && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-[1px] z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 px-6 py-3 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
            <span className="text-sm font-bold text-stone-700 tracking-tight">
              Memperbarui data...
            </span>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, application/pdf"
      />
      <div className="bg-white rounded-[2rem] shadow-sm p-5 md:p-8 border border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 shrink-0">
              <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-teal-700" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-teal-950 tracking-tight mb-0.5">
                Verifikasi Pembayaran
              </h2>
              <p className="text-stone-500 font-medium text-sm">
                Kelola dan verifikasi bukti pembayaran pendaftar
              </p>
            </div>
          </div>

          <div className="flex bg-stone-100 p-1.5 rounded-[1.25rem] w-fit shadow-inner ring-1 ring-stone-200/50">
            <button
              onClick={() => updateFilters(undefined, "PENDAFTARAN")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === "PENDAFTARAN"
                  ? "bg-white text-teal-700 shadow-clay-sm ring-1 ring-stone-100"
                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
              }`}
            >
              Pendaftaran
            </button>
            <button
              onClick={() => updateFilters(undefined, "DAFTAR_ULANG")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === "DAFTAR_ULANG"
                  ? "bg-white text-teal-700 shadow-clay-sm ring-1 ring-stone-100"
                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
              }`}
            >
              Daftar Ulang
            </button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleExport("excel")}
              disabled={exporting}
              className="flex items-center gap-2 px-3 md:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-sm"
              title="Download Excel"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={exporting}
              className="flex items-center gap-2 px-3 md:px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-sm"
              title="Download PDF"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => fetchPembayaran(true)}
              className="flex items-center gap-2 px-3 md:px-6 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl font-bold transition-all shadow-sm hover:shadow-md text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="mt-5 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-teal-600 transition-colors" />
          <input
            type="text"
            placeholder="Cari nama atau nomor pendaftaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 focus:outline-none transition-all text-sm md:text-base font-bold text-stone-800 placeholder:text-stone-400 shadow-sm"
          />
        </div>

        <div className="mt-5 md:mt-8 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-5 md:pt-6">
          <div className="px-4 py-2 bg-stone-100 rounded-lg text-sm font-bold text-stone-600">
            Total: {filteredPembayaran.length}
          </div>

          <div className="h-8 w-px bg-stone-200 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilters("pending")}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === "pending" ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500/20" : "hover:bg-stone-50 text-stone-500"}`}
              >
                Pending
              </button>
              <button
                onClick={() => updateFilters("verified")}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === "verified" ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20" : "hover:bg-stone-50 text-stone-500"}`}
              >
                Terverifikasi
              </button>
              <button
                onClick={() => updateFilters("rejected")}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === "rejected" ? "bg-red-100 text-red-700 ring-2 ring-red-500/20" : "hover:bg-stone-50 text-stone-500"}`}
              >
                Ditolak
              </button>
            </div>
          </div>

          {activeTab === "DAFTAR_ULANG" && (
            <>
              <div className="h-8 w-px bg-stone-200 mx-1 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                  Tipe:
                </span>
                <div className="flex gap-1">
                  {["ALL", "LUNAS", "CICILAN"].map((tipe) => (
                    <button
                      key={tipe}
                      onClick={() => setTipeCicilanFilter(tipe as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                        tipeCicilanFilter === tipe
                          ? "bg-teal-700 text-white shadow-sm shadow-teal-700/20"
                          : "bg-white text-stone-500 border border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {tipe}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-teal-700 mx-auto mb-4" />
              <p className="text-stone-500 font-medium">
                Memuat data pembayaran...
              </p>
            </div>
          </div>
        ) : filteredPembayaran.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
              <CreditCard className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Tidak ada pembayaran {statusFilter === "pending" ? "pending" : ""}
            </h3>
            <p className="text-stone-500 max-w-sm mx-auto">
              {searchTerm
                ? "Tidak ada hasil untuk pencarian Anda."
                : `Belum ada data pembayaran yang ditemukan untuk filter ini.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredPembayaran.map((pay) => (
              <div
                key={pay.id}
                className="p-6 hover:bg-stone-50/50 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-800 font-black text-lg shrink-0 border border-teal-100">
                        {pay.pendaftar?.nama_lengkap
                          ? pay.pendaftar.nama_lengkap.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-stone-900 group-hover:text-teal-700 transition-colors">
                          {pay.pendaftar?.nama_lengkap
                            ? toTitleCase(pay.pendaftar.nama_lengkap || "")
                            : "Tanpa Nama"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm mt-1">
                          <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-bold">
                            {pay.pendaftar?.nomor_pendaftaran}
                          </span>
                          <span className="text-stone-400 text-xs">|</span>
                          <span className="text-stone-500 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {pay.pendaftar?.no_hp || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-16 bg-stone-50/50 p-4 rounded-xl border border-stone-100">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                          Nominal Transfer
                        </p>
                        <p className="text-xl font-black text-emerald-600">
                          {formatRupiah(pay.jumlah)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                          Info Transfer
                        </p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
                            <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                            {pay.catatan &&
                            pay.catatan.includes("Virtual Account")
                              ? "Midtrans"
                              : "Transfer Manual"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {pay.tanggal_pembayaran
                              ? formatDate(pay.tanggal_pembayaran)
                              : formatDate(pay.created_at)}
                          </div>
                        </div>
                      </div>
                      {pay.tipe_cicilan === "CICILAN" && (
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                            Status Cicilan
                          </p>
                          <span className="px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-violet-200">
                            Cicilan Ke-{pay.cicilan_ke}
                          </span>
                        </div>
                      )}
                      {pay.catatan && (
                        <div className="col-span-1 sm:col-span-2 pt-2 border-t border-stone-200/50 mt-1">
                          <p className="text-xs text-stone-500">
                            <strong className="text-stone-700">Catatan:</strong>{" "}
                            {pay.catatan}
                          </p>
                        </div>
                      )}
                      {pay.keringanan_reason && (
                        <div className="col-span-1 sm:col-span-2 pt-2 border-t border-amber-200/50 mt-1">
                          <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 font-medium">
                            <strong className="text-amber-900 block mb-0.5 uppercase text-[9px] tracking-widest">Alasan Keringanan:</strong>
                            "{pay.keringanan_reason}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-3 sm:w-48 shrink-0">
                    {pay.bukti_transfer_url && (
                      <a
                        href={pay.bukti_transfer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-dashed border-stone-300 hover:border-teal-500 hover:bg-teal-50 text-stone-600 hover:text-teal-800 rounded-xl text-sm font-bold transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        Lihat Bukti
                      </a>
                    )}
                    {canVerify && (
                      <button
                        onClick={() => openModal(pay)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 ${
                          statusFilter === "pending"
                            ? "bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20"
                            : statusFilter === "verified"
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100"
                              : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-100"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {statusFilter === "pending"
                          ? "Verifikasi"
                          : "Lihat Status"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedPembayaran && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  Verifikasi Pembayaran
                </h3>
                <p className="text-sm text-stone-500 font-medium">
                  {selectedPembayaran.pendaftar?.nama_lengkap
                    ? toTitleCase(
                        selectedPembayaran.pendaftar.nama_lengkap || "",
                      )
                    : ""}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex gap-4 p-4 bg-teal-50 rounded-2xl border border-teal-100">
                <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
                  <DollarSign className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <p className="text-xs font-black text-teal-700 uppercase tracking-widest mb-1 shadow-xs">
                    Konfirmasi/Ubah Nominal
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-teal-950">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={editJumlah}
                      onChange={(e) => setEditJumlah(e.target.value)}
                      className="text-2xl font-black text-teal-950 bg-transparent border-b-2 border-teal-200 focus:border-teal-500 outline-none w-full max-w-[200px]"
                    />
                  </div>
                </div>
              </div>

              {activeTab === "DAFTAR_ULANG" && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-violet-50 rounded-2xl border border-violet-100">
                  <div>
                    <label className="block text-[10px] font-black text-violet-700 uppercase tracking-widest mb-2">
                      Tipe Pembayaran
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditTipeCicilan("LUNAS")}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${editTipeCicilan === "LUNAS" ? "bg-violet-600 text-white shadow-md" : "bg-white text-violet-600 border border-violet-200"}`}
                      >
                        LUNAS
                      </button>
                      <button
                        onClick={() => setEditTipeCicilan("CICILAN")}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${editTipeCicilan === "CICILAN" ? "bg-violet-600 text-white shadow-md" : "bg-white text-violet-600 border border-violet-200"}`}
                      >
                        CICILAN
                      </button>
                    </div>
                  </div>
                  {editTipeCicilan === "CICILAN" && (
                    <div>
                      <label className="block text-[10px] font-black text-violet-700 uppercase tracking-widest mb-2">
                        Cicilan Ke-
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={editCicilanKe}
                          onChange={(e) =>
                            setEditCicilanKe(parseInt(e.target.value) || 1)
                          }
                          className="w-full px-4 py-2 bg-white border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-black text-violet-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedPembayaran.keringanan_reason && (
                <div className="p-5 bg-amber-50 border-2 border-amber-100 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-black text-xs uppercase tracking-widest">
                      Permohonan Keringanan Khusus
                    </span>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed font-bold italic bg-white/50 p-4 rounded-xl border border-amber-200/50">
                    "{selectedPembayaran.keringanan_reason}"
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium px-1">
                    * Mohon pertimbangkan alasan di atas sebelum melakukan verifikasi atau penolakan.
                  </p>
                </div>
              )}

              {selectedPembayaran.bukti_transfer_url ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-stone-700">
                      Bukti Transfer:
                    </p>
                    <button
                      onClick={handleUploadClick}
                      disabled={uploadingProof === selectedPembayaran.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {uploadingProof === selectedPembayaran.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5" />
                      )}
                      Ubah Bukti
                    </button>
                  </div>
                  <div className="border-2 border-stone-100 rounded-2xl overflow-hidden bg-stone-50 relative group">
                    {selectedPembayaran.bukti_transfer_url
                      ?.toLowerCase()
                      .endsWith(".pdf") ? (
                      <iframe
                        src={selectedPembayaran.bukti_transfer_url}
                        className="w-full h-[500px] rounded-xl border-none"
                        title="PDF Preview"
                      />
                    ) : (
                      <img
                        src={selectedPembayaran.bukti_transfer_url}
                        alt="Bukti Transfer"
                        className="w-full max-h-[500px] object-contain"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-stone-200 rounded-2xl text-center space-y-4">
                  <p className="text-stone-500 font-medium">
                    Tidak ada bukti transfer yang diupload.
                  </p>
                  <button
                    onClick={handleUploadClick}
                    disabled={uploadingProof === selectedPembayaran.id}
                    className="mx-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {uploadingProof === selectedPembayaran.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    Upload Bukti
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Catatan untuk Pendaftar (Opsional)
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Bukti transfer buram, mohon upload ulang..."
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none resize-none transition-all font-bold text-stone-800"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-3">
                <button
                  onClick={() =>
                    handleVerify(selectedPembayaran.id, "verified")
                  }
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Terima</>
                  )}
                </button>

                <button
                  onClick={() =>
                    handleVerify(selectedPembayaran.id, "rejected")
                  }
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-rose-500/20 disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Tolak</>
                  )}
                </button>
              </div>

              {selectedPembayaran.status_pembayaran !== "pending" && (
                <button
                  onClick={() => handleVerify(selectedPembayaran.id, "pending")}
                  disabled={processing}
                  className="px-6 py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold transition-all disabled:opacity-50 border border-stone-200"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Batalkan Verifikasi"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifikasiPembayaranPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        </div>
      }
    >
      <VerifikasiPembayaranContent />
    </Suspense>
  );
}
