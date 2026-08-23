"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Search,
  Loader2,
  Check,
  X,
  MessageSquare,
  Eye } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function PerubahanDataPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending"); // pending, all
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      if (requests.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const res = await fetch("/api/admin/perubahan-data");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (
    requestId: string,
    action: "approve" | "reject" | "complete",
  ) => {
    try {
      setProcessing(requestId);
      const res = await fetch("/api/admin/perubahan-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          admin_note:
            action === "approve"
              ? "Silakan perbaiki data Anda."
              : "Permintaan ditolak." }) });
      const result = await res.json();
      if (result.success) {
        fetchRequests();
      } else {
        Swal.fire(
          "Gagal!",
          result.error || "Gagal memproses permintaan",
          "error",
        );
      }
    } catch (error) {
      Swal.fire("Error!", "Terjadi kesalahan koneksi", "error");
    } finally {
      setProcessing(null);
    }
  };

  const filtreredRequests = requests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary-700 animate-spin" />
        <p className="text-ink-500 font-medium">
          Memuat permintaan perubahan data...
        </p>
      </div>
    );
  }

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-4xl font-black text-ink-900 tracking-tight">
              Permintaan Edit Data
            </h1>
            {refreshing && (
              <Loader2 className="w-6 h-6 text-primary-700 animate-spin" />
            )}
          </div>
          <p className="text-ink-500 mt-2 text-lg">
            Kelola izin perubahan data pendaftar yang sudah terkunci.
          </p>
        </div>

        <div className="flex bg-secondary-100 p-1.5 rounded-[24px] gap-1">
          <button
            onClick={() => setFilter("pending")}
            className={`p-[16px_20px] rounded-[24px] text-sm font-bold transition-all ${filter === "pending" ? "bg-white shadow-sm text-primary-700" : "text-ink-500"}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("submitted")}
            className={`p-[16px_20px] rounded-[24px] text-sm font-bold transition-all ${filter === "submitted" ? "bg-white shadow-sm text-primary-700" : "text-ink-500"}`}
          >
            Butuh Verifikasi
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`p-[16px_20px] rounded-[24px] text-sm font-bold transition-all ${filter === "all" ? "bg-white shadow-sm text-primary-700" : "text-ink-500"}`}
          >
            Semua
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[24px_28px]">
        {filtreredRequests.length > 0 ? (
          filtreredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-secondary-200 shadow-sm app-card p-6 group hover:border-primary-200 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Profile Info */}
                <div className="flex items-center gap-[24px_28px] min-w-[250px]">
                  <div className="w-14 h-14 bg-primary-50 rounded-[24px] flex items-center justify-center text-primary-700">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-ink-900 truncate tracking-tight">
                      {toTitleCase(req?.pendaftar?.nama_lengkap)}
                    </h4>
                    <p className="text-xs text-ink-400 font-bold uppercase">
                      {req.pendaftar.no_hp}
                    </p>
                    <div className="mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm
                                            ${
                                              req.status === "pending"
                                                ? "bg-secondary-100 text-secondary-700"
                                                : req.status ===
                                                    "approved_to_edit"
                                                  ? "bg-amber-100 text-amber-700"
                                                  : req.status === "submitted"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                            }
                                        `}
                      >
                        {req.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="flex-1 bg-secondary-50 p-[24px_28px] rounded-[24px] border border-ink-100">
                  <div className="flex items-center gap-2 mb-2 text-ink-400">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Alasan Perubahan:
                    </span>
                  </div>
                  <p className="text-ink-700 text-sm font-medium leading-relaxed italic">
                    "{req.reason || "Tidak ada alasan spesifik"}"
                  </p>
                  <p className="text-[10px] text-ink-400 mt-2 font-bold uppercase tracking-tighter">
                    Diajukan pada:{" "}
                    {new Date(req.created_at).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full md:w-auto">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction(req.id, "approve")}
                        disabled={processing === req.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 p-[16px_20px] bg-primary-700 text-white rounded-[24px] text-sm font-bold shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary-600/20 hover:bg-primary-800 transition-all disabled:opacity-50"
                      >
                        {processing === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Ijinkan Edit
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "reject")}
                        disabled={processing === req.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 p-[16px_20px] bg-red-50 text-red-600 rounded-[24px] text-sm font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </>
                  )}

                  {req.status === "submitted" && (
                    <div className="flex gap-2 w-full">
                      <Link
                        href={`/dashboard/admin/pendaftar/${req.pendaftar_id}`}
                        className="flex-1 flex items-center justify-center gap-2 p-[16px_20px] bg-primary-600 text-white rounded-[24px] text-sm font-bold shadow-2xl shadow-primary/30  shadow-primary/20  shadow-primary-500/20 hover:bg-primary-700 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        Cek Perubahan
                      </Link>
                      <button
                        onClick={() => handleAction(req.id, "complete")}
                        disabled={processing === req.id}
                        className="flex-1 flex items-center justify-center gap-2 p-[16px_20px] bg-emerald-600 text-white rounded-[24px] text-sm font-bold shadow-2xl shadow-primary/30  shadow-primary/20 shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
                      >
                        {processing === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Selesai & Kunci
                      </button>
                    </div>
                  )}

                  {(req.status === "completed" ||
                    req.status === "rejected") && (
                    <div className="text-ink-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-12 px-4 italic">
                      <CheckCircle
                        className={`w-4 h-4 ${req.status === "completed" ? "text-emerald-500" : "text-red-500"}`}
                      />
                      Sudah Diproses
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-secondary-200 shadow-sm app-card p-20 text-center">
            <div className="w-20 h-20 bg-secondary-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-ink-300" />
            </div>
            <h3 className="text-xl font-bold text-ink-900 mb-2">
              Tidak ada permintaan
            </h3>
            <p className="text-ink-500">
              Semua data pendaftaran dalam keadaan aman dan terkunci.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
