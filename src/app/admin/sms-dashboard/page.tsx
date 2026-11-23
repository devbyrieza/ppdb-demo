"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Check,
  Smartphone,
  User,
  Key,
  ClipboardList,
  CheckCircle2, MessageCircle,
  MessageSquare,
  BarChart3,
  Calendar,
  Sparkles,
  Send,
  AlertCircle } from "lucide-react";

interface PendingSMS {
  id: string;
  phone: string;
  otp: string;
  nama: string;
  status: string;
  created_at: string;
}

export default function AdminSMSDashboard() {
  const [pendingSMS, setPendingSMS] = useState<PendingSMS[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingSMS = async () => {
    try {
      const response = await fetch("/api/admin/pending-sms?status=pending");
      const data = await response.json();
      if (data.success) {
        setPendingSMS(data.data);
      }
    } catch (error) {
      console.error("Error fetching pending SMS:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsSent = async (id: string) => {
    try {
      const response = await fetch("/api/admin/pending-sms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "sent" }) });

      if (response.ok) {
        fetchPendingSMS(); // Refresh list
      }
    } catch (error) {
      console.error("Error marking as sent:", error);
    }
  };

  useEffect(() => {
    fetchPendingSMS();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingSMS, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-50/50 flex items-center justify-center p-6 md:p-10">
        <div className="text-center p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-[#9D174D] mb-4" />
          <p className="text-slate-700 font-bold text-base">Memuat data SMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100 relative overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#9D174D] border border-emerald-100 flex items-center justify-center shadow-xs">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Dashboard Admin SMS Manual
                </h1>
                <p className="text-slate-500 font-medium text-sm mt-0.5">
                  Sistem dalam{" "}
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-2xl border border-amber-200/60 inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Simulation Mode
                  </span>
                  . Kirim SMS manual ke pendaftar berikut:
                </p>
              </div>
            </div>

            <button
              onClick={fetchPendingSMS}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#9D174D] hover:bg-[#9D174D] text-white font-bold rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>

          {/* Instructions Banner */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-6 mb-8">
            <h3 className="font-black text-[#9D174D] text-base mb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#9D174D]" />
              Instruksi Pengiriman:
            </h3>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-medium text-[#9D174D]">
              <li className="flex items-start gap-2.5 bg-white/80 p-3 rounded-2xl border border-emerald-100/50">
                <span className="w-6 h-6 rounded-full bg-[#9D174D] text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <span>Salin nomor HP dan kode OTP dari daftar di bawah</span>
              </li>
              <li className="flex items-start gap-2.5 bg-white/80 p-3 rounded-2xl border border-emerald-100/50">
                <span className="w-6 h-6 rounded-full bg-[#9D174D] text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <span>Kirim SMS dari HP Admin ke nomor tujuan</span>
              </li>
              <li className="flex items-start gap-2.5 bg-white/80 p-3 rounded-2xl border border-emerald-100/50">
                <span className="w-6 h-6 rounded-full bg-[#9D174D] text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <span>Format: "SPMB PESANTREN: Kode OTP: [OTP] untuk [NAMA]"</span>
              </li>
              <li className="flex items-start gap-2.5 bg-white/80 p-3 rounded-2xl border border-emerald-100/50">
                <span className="w-6 h-6 rounded-full bg-[#9D174D] text-white font-bold text-xs flex items-center justify-center shrink-0">4</span>
                <span>Klik tombol "Sudah Dikirim" untuk memperbarui status</span>
              </li>
            </ol>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#9D174D]" />
              Daftar SMS Antrean ({pendingSMS.length})
            </h2>
          </div>

          {/* SMS List */}
          {pendingSMS.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#9D174D] flex items-center justify-center mx-auto mb-4 border border-emerald-200 whitespace-nowrap shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-1">
                Tidak ada SMS yang perlu dikirim
              </h4>
              <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
                Semua kode OTP telah berhasil diproses atau belum ada antrean pendaftaran baru.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {pendingSMS.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200/80 bg-slate-50/30 rounded-3xl p-6 shadow-2xl hover:shadow-xl transition-all space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3.5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs">
                      <div className="p-3 bg-emerald-50 text-[#9D174D] rounded-3xl">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nomor HP</p>
                        <p className="font-black text-slate-900 text-base">{item.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs">
                      <div className="p-3 bg-teal-50 text-teal-600 rounded-3xl">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nama Santri</p>
                        <p className="font-black text-slate-900 text-base">{item.nama}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs">
                      <div className="p-3 bg-rose-50 text-rose-600 rounded-3xl">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kode OTP</p>
                        <p className="font-black text-2xl text-rose-600 tracking-wider">
                          {item.otp}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-inner">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Pratinjau Pesan:
                    </p>
                    <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {`SPMB PESANTREN
Kode OTP: ${item.otp}
Untuk: ${item.nama}

Jangan bagikan kode ini.
Hubungi panitia jika ada masalah.`}
                    </pre>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => markAsSent(item.id)}
                      className="flex-1 py-3.5 px-6 bg-[#9D174D] hover:bg-[#9D174D] text-white font-bold rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Tandai Sudah Dikirim
                    </button>

                    <a
                      href={`sms:${item.phone}&body=SPMB PESANTREN: Kode OTP: ${item.otp} untuk ${item.nama}`}
                      className="py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Buka Aplikasi SMS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status Section */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
          <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#9D174D]" /> Status Layanan & Integrasi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
              <p className="text-xs text-[#9D174D] font-bold uppercase tracking-wider mb-1">SMS Service</p>
              <p className="text-xl font-black text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#9D174D]" /> Simulation
              </p>
            </div>
            <div className="bg-teal-50/50 border border-teal-100 p-5 rounded-2xl">
              <p className="text-xs text-teal-700 font-bold uppercase tracking-wider mb-1">Telegram</p>
              <p className="text-xl font-black text-teal-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Ready
              </p>
            </div>
            <div className="bg-sky-50/50 border border-sky-100 p-5 rounded-2xl">
              <p className="text-xs text-sky-700 font-bold uppercase tracking-wider mb-1">Email</p>
              <p className="text-xl font-black text-sky-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" /> Ready
              </p>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl">
              <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">Jadwal Launch</p>
              <p className="text-xl font-black text-amber-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" /> 22 Jan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


