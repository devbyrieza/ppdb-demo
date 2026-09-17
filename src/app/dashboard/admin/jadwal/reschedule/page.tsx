"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, Calendar as CalendarIcon, Clock, User, FileText } from "lucide-react";
import Swal from "sweetalert2";

export default function RescheduleRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/jadwal/reschedule");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (jadwalId: string, action: "approve" | "reject") => {
    try {
      setProcessing(jadwalId);
      const actionText = action === "approve" ? "menyetujui" : "menolak";
      
      const confirm = await Swal.fire({
        title: `Konfirmasi`,
        text: `Apakah Anda yakin ingin ${actionText} perubahan jadwal ini?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, lanjutkan",
        cancelButtonText: "Batal",
      });

      if (!confirm.isConfirmed) return;

      const res = await fetch("/api/admin/jadwal/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jadwal_id: jadwalId, action }),
      });
      const data = await res.json();
      
      if (data.success) {
        Swal.fire("Berhasil", data.message, "success");
        fetchRequests();
      } else {
        Swal.fire("Gagal", data.error, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Gagal memproses permohonan", "error");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary-700 animate-spin" />
        <p className="text-ink-500 font-medium">Memuat daftar permintaan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 sm:pb-0">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-clay-lg relative overflow-hidden border border-slate-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-ink-950 mb-3 tracking-tight">
            Permintaan Ubah Jadwal
          </h1>
          <p className="text-ink-600 font-medium max-w-2xl text-sm sm:text-base leading-relaxed">
            Daftar pengajuan perubahan jadwal seleksi yang diajukan oleh Penguji / Pewawancara.
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Semua Bersih!</h3>
          <p className="text-slate-500">Tidak ada pengajuan perubahan jadwal yang menunggu persetujuan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((jadwal) => {
            const req = JSON.parse(jadwal.catatan);
            return (
              <div key={jadwal.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-clay-sm border border-slate-100 flex flex-col h-full hover:shadow-clay-md transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-ink-900 text-lg mb-1">{jadwal.pendaftar.nama_lengkap}</h3>
                    <p className="text-sm font-medium text-ink-500 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> {jadwal.pendaftar.nomor_pendaftaran}
                    </p>
                  </div>
                  <span className="bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-yellow-200">
                    Menunggu
                  </span>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Penguji</p>
                    <p className="text-sm font-bold text-ink-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary-500" />
                      {req.penguji_name || "Penguji"}
                    </p>
                  </div>

                  <div className="bg-primary-50/50 p-4 rounded-2xl border border-primary-100/50">
                    <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-2">Jadwal Baru yang Diajukan</p>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary-500" />
                        {req.proposed_date}
                      </p>
                      <p className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        {req.proposed_start} - {req.proposed_end} WIB
                      </p>
                    </div>
                  </div>

                  <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">Alasan</p>
                    <p className="text-sm text-ink-700 font-medium italic">
                      "{req.reason}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => handleAction(jadwal.id, "reject")}
                    disabled={processing === jadwal.id}
                    className="py-3 sm:py-4 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Tolak
                  </button>
                  <button
                    onClick={() => handleAction(jadwal.id, "approve")}
                    disabled={processing === jadwal.id}
                    className="py-3 sm:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Setujui
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
