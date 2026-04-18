"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  User,
  Calendar,
  Phone,
  DollarSign,
  FileSpreadsheet,
  FileText,
  UploadCloud
} from "lucide-react";
import Link from "next/link";
import { exportToExcel, exportToPDF } from "@/lib/utils/export";

interface Pembayaran {
  id: string;
  jumlah: string;
  metode_pembayaran: string;
  status_pembayaran: string;
  catatan: string | null;
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
}

export default function VerifikasiPembayaranPage() {
  const [pembayaran, setPembayaran] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [processing, setProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploadingProof, setUploadingProof] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPembayaran();
  }, [statusFilter]);

  const fetchPembayaran = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/verifikasi/pembayaran?status=${statusFilter}`
      );
      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.json();
      setPembayaran(result.data);
    } catch (error) {
      console.error("Error fetching pembayaran:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: "excel" | "pdf") => {
    try {
      setExporting(true);
      // Fetch ALL data for export
      const response = await fetch(`/api/admin/verifikasi/pembayaran?status=all`);
      if (!response.ok) throw new Error("Failed to export");

      const result = await response.json();
      const rawData = result.data;

      // Format data for export
      const data = rawData.map((item: any) => ({
        "Nama Lengkap": item.pendaftar?.nama_lengkap ? toTitleCase(item.pendaftar.nama_lengkap) : "-",
        "Nomor Pendaftaran": item.pendaftar?.nomor_pendaftaran || "-",
        "Jenjang": item.pendaftar?.jenjang || "-",
        "Nominal": item.jumlah ? parseInt(item.jumlah).toLocaleString('id-ID') : "0",
        "Metode Pembayaran": item.metode_pembayaran || "-",
        "Status": item.status_pembayaran || "-",
        "Tanggal Bayar": item.tanggal_pembayaran ? new Date(item.tanggal_pembayaran).toLocaleDateString("id-ID") : "-",
        "Catatan": item.catatan || "-"
      }));

      const filename = `data-pembayaran-${new Date().toISOString().split("T")[0]}`;

      if (type === "excel") {
        exportToExcel(data, filename, "Data Pembayaran");
      } else {
        const headers = Object.keys(data[0] || {});
        const rows = data.map((item: any) => Object.values(item));
        exportToPDF("Laporan Pembayaran Masuk", headers, rows, filename, "landscape");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Gagal export data");
    } finally {
      setExporting(false);
    }
  };

  const handleVerify = async (
    pembayaranId: string,
    status: "verified" | "rejected"
  ) => {
    try {
      setProcessing(true);
      const response = await fetch("/api/admin/verifikasi/pembayaran", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pembayaran_id: pembayaranId,
          status_pembayaran: status,
          catatan: catatan.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to verify");

      await fetchPembayaran();
      setShowModal(false);
      setSelectedPembayaran(null);
      setCatatan("");
    } catch (error) {
      console.error("Error verifying pembayaran:", error);
      alert("Gagal memverifikasi pembayaran");
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
        alert("Bukti pembayaran berhasil diganti dan otomatis diverifikasi");
        fetchPembayaran(); // Refresh the list
        setShowModal(false); // Close modal
      } else {
        alert(data.error || "Gagal mengunggah bukti pembayaran");
      }
    } catch (error) {
      console.error("Error replacing payment proof:", error);
      alert("Terjadi kesalahan saat mengunggah");
    } finally {
      setUploadingProof(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  };

  const openModal = (pay: Pembayaran) => {
    setSelectedPembayaran(pay);
    setCatatan(pay.catatan || "");
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
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, application/pdf"
      />
      {/* Header */}
      <div className="bg-white rounded-[2rem] shadow-sm p-5 md:p-8 border border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-blue-50 rounded-2xl flex items-center justify-center border border-brand-blue-100 shrink-0">
              <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-brand-blue-700" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-brand-blue-950 tracking-tight mb-0.5">
                Verifikasi Pembayaran
              </h2>
              <p className="text-stone-500 font-medium text-sm">
                Kelola dan verifikasi bukti pembayaran pendaftar
              </p>
            </div>
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
              onClick={fetchPembayaran}
              className="flex items-center gap-2 px-3 md:px-6 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl font-bold transition-all shadow-sm hover:shadow-md text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats / Filter Bar */}
        <div className="mt-5 md:mt-8 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-5 md:pt-6">
          <div className="px-4 py-2 bg-stone-100 rounded-lg text-sm font-bold text-stone-600">
            Total: {pembayaran.length}
          </div>

          <div className="h-8 w-px bg-stone-200 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === "pending" ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500/20" : "hover:bg-stone-50 text-stone-500"}`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("verified")}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === "verified" ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20" : "hover:bg-stone-50 text-stone-500"}`}
              >
                Terverifikasi
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === "rejected" ? "bg-red-100 text-red-700 ring-2 ring-red-500/20" : "hover:bg-stone-50 text-stone-500"}`}
              >
                Ditolak
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-brand-blue-700 mx-auto mb-4" />
              <p className="text-stone-500 font-medium">Memuat data pembayaran...</p>
            </div>
          </div>
        ) : pembayaran.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
              <CreditCard className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Tidak ada pembayaran {statusFilter === "pending" ? "pending" : ""}
            </h3>
            <p className="text-stone-500 max-w-sm mx-auto">
              Belum ada data pembayaran yang ditemukan untuk filter ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {pembayaran.map((pay) => (
              <div
                key={pay.id}
                className="p-6 hover:bg-stone-50/50 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="flex-1">
                    {/* Header Row */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-blue-50 flex items-center justify-center text-brand-blue-800 font-black text-lg shrink-0 border border-brand-blue-100">
                        {pay.pendaftar?.nama_lengkap ? pay.pendaftar.nama_lengkap.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-stone-900 group-hover:text-brand-blue-700 transition-colors">
                          {pay.pendaftar?.nama_lengkap ? toTitleCase(pay.pendaftar.nama_lengkap || "") : "Tanpa Nama"}
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

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-16 bg-stone-50/50 p-4 rounded-xl border border-stone-100">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Nominal Transfer</p>
                        <p className="text-xl font-black text-emerald-600">{formatRupiah(pay.jumlah)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Info Transfer</p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
                            <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                            {pay.catatan && pay.catatan.includes("Virtual Account") ? "Midtrans" : "Transfer Manual"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {pay.tanggal_pembayaran ? formatDate(pay.tanggal_pembayaran) : formatDate(pay.created_at)}
                          </div>
                        </div>
                      </div>
                      {pay.catatan && (
                        <div className="col-span-1 sm:col-span-2 pt-2 border-t border-stone-200/50 mt-1">
                          <p className="text-xs text-stone-500">
                            <strong className="text-stone-700">Catatan:</strong> {pay.catatan}
                          </p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col gap-3 sm:w-48 shrink-0">
                    {pay.bukti_transfer_url && (
                      <a
                        href={pay.bukti_transfer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-dashed border-stone-300 hover:border-brand-blue-500 hover:bg-brand-blue-50 text-stone-600 hover:text-brand-blue-800 rounded-xl text-sm font-bold transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        Lihat Bukti
                      </a>
                    )}

                    {statusFilter === "pending" && (
                      <button
                        onClick={() => openModal(pay)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-brand-blue-700 hover:bg-brand-blue-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-blue-700/20 transition-all hover:-translate-y-0.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verifikasi
                      </button>
                    )}

                    {statusFilter === "verified" && (
                      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-100">
                        <CheckCircle className="w-4 h-4" />
                        Sudah Valid
                      </div>
                    )}
                    {statusFilter === "rejected" && (
                      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl font-bold text-sm border border-red-100">
                        <XCircle className="w-4 h-4" />
                        Ditolak
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedPembayaran && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header - Fixed */}
            <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  Verifikasi Pembayaran
                </h3>
                <p className="text-sm text-stone-500 font-medium">{selectedPembayaran.pendaftar?.nama_lengkap ? toTitleCase(selectedPembayaran.pendaftar.nama_lengkap || "") : ""}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

             <div className="flex gap-4 p-4 bg-brand-blue-50 rounded-2xl border border-brand-blue-100">
                <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
                  <DollarSign className="w-6 h-6 text-brand-blue-700" />
                </div>
                <div>
                  <p className="text-xs font-black text-brand-blue-700 uppercase tracking-widest mb-1 shadow-xs">Konfirmasi Nominal</p>
                  <p className="text-2xl font-black text-brand-blue-950">{formatRupiah(selectedPembayaran.jumlah)}</p>
                  <p className="text-sm text-brand-blue-800 mt-1 font-medium italic">Pastikan bukti transfer sesuai dengan nominal ini.</p>
                </div>
              </div>

              {selectedPembayaran.bukti_transfer_url ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-stone-700">Bukti Transfer:</p>
                    <button
                      onClick={handleUploadClick}
                      disabled={uploadingProof === selectedPembayaran.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {uploadingProof === selectedPembayaran.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                      Ubah Bukti
                    </button>
                  </div>
                  <div className="border-2 border-stone-100 rounded-2xl overflow-hidden bg-stone-50 relative group">
                    <img
                      src={selectedPembayaran.bukti_transfer_url}
                      alt="Bukti Transfer"
                      className="w-full max-h-[400px] object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={selectedPembayaran.bukti_transfer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-white rounded-full font-bold text-stone-900 shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Lihat Full Size
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-stone-200 rounded-2xl text-center space-y-4">
                  <p className="text-stone-500 font-medium">Tidak ada bukti transfer yang diupload.</p>
                  <button
                    onClick={handleUploadClick}
                    disabled={uploadingProof === selectedPembayaran.id}
                    className="mx-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {uploadingProof === selectedPembayaran.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
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
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-brand-blue-600 focus:ring-2 focus:ring-brand-blue-600/20 focus:outline-none resize-none transition-all font-bold text-stone-800"
                  rows={3}
                />
              </div>
            </div>

            {/* Footer with Actions - Fixed */}
            <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex gap-3">
              <button
                onClick={() =>
                  handleVerify(selectedPembayaran.id, "verified")
                }
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Terima Pembayaran
                  </>
                )}
              </button>

              <button
                onClick={() =>
                  handleVerify(selectedPembayaran.id, "rejected")
                }
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Tolak
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
