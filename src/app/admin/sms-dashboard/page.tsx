"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Check, Smartphone, User, Key, FileText, Sparkles, Activity, CheckCircle, Calendar } from "lucide-react";

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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "sent" }) });

      if (response.ok) {
        fetchPendingSMS(); // Refresh list
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    fetchPendingSMS();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary/30 shadow-emerald-500/10 border border-emerald-100 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Smartphone className="w-7 h-7 text-primary-600" />
            Dashboard Admin - SMS Manual
          </h1>
          <p className="text-gray-600 mb-4">
            Sistem dalam{" "}
            <span className="font-bold text-yellow-600">Simulation Mode</span>.
            Kirim SMS manual ke user berikut:
          </p>

          <div className="bg-primary-50 border border-primary-200 rounded-[24px] p-[24px_28px] mb-6">
            <h3 className="font-bold text-primary-800 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Instruksi:
            </h3>
            <ol className="list-decimal list-inside text-primary-700 space-y-1">
              <li>Salin nomor HP dan OTP di bawah</li>
              <li>Kirim SMS dari HP Admin ke nomor tersebut</li>
              <li>Pesan: "PPDB AL-FATH: Kode OTP: [OTP] untuk [NAMA]"</li>
              <li>Klik tombol "Sudah Dikirim" setelah selesai</li>
            </ol>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Daftar SMS yang Perlu Dikirim: {pendingSMS.length}
            </h2>
            <button
              onClick={fetchPendingSMS}
              className="flex items-center gap-2 p-[16px_20px] bg-primary-600 text-white rounded-[24px] hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {pendingSMS.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-600 font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Tidak ada SMS yang perlu dikirim!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Semua OTP sudah terkirim atau belum ada pendaftaran.
              </p>
            </div>
          ) : (
            <div className="grid gap-[24px_28px]">
              {pendingSMS.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-secondary-200 bg-secondary-50/50 rounded-[24px] p-[24px_28px]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px_28px] mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 rounded-[24px]">
                        <Smartphone className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nomor HP</p>
                        <p className="font-bold text-lg">{item.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-[24px]">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nama Santri</p>
                        <p className="font-bold text-lg">{item.nama}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-[24px]">
                        <Key className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Kode OTP</p>
                        <p className="font-bold text-2xl text-red-600">
                          {item.otp}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[24px] p-[24px_28px] mb-4">
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      Pesan yang dikirim:
                    </p>
                    <pre className="bg-gray-900 text-white p-[24px_28px] rounded-[24px] text-sm">
                      {`PPDB AL-FATH
Kode OTP: ${item.otp}
Untuk: ${item.nama}

Jangan bagikan kode ini.
Hubungi 0812-8530-0800 jika ada masalah.`}
                    </pre>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => markAsSent(item.id)}
                      className="flex-1 py-3 bg-green-600 text-white font-bold rounded-[24px] hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check className="w-5 h-5" /> Sudah Dikirim
                    </button>

                    <a
                      href={`sms:${item.phone}&body=PPDB AL-FATH: Kode OTP: ${item.otp} untuk ${item.nama}`}
                      className="p-[16px_20px] bg-primary-600 text-white font-bold rounded-[24px] hover:bg-primary-700 flex items-center gap-2 transition-colors"
                    >
                      <Smartphone className="w-4 h-4" /> Buka Aplikasi SMS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary/30 shadow-emerald-500/10 border border-emerald-100 p-6 md:p-8">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Status Sistem:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[24px_28px]">
            <div className="bg-primary-50/80 p-[24px_28px] rounded-[24px] border border-primary-100">
              <p className="text-sm text-primary-600">SMS Service</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" /> Simulation
              </p>
            </div>
            <div className="bg-green-50/80 p-[24px_28px] rounded-[24px] border border-green-100">
              <p className="text-sm text-green-600">Telegram</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" /> Ready
              </p>
            </div>
            <div className="bg-purple-50/80 p-[24px_28px] rounded-[24px] border border-purple-100">
              <p className="text-sm text-purple-600">Email</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" /> Ready
              </p>
            </div>
            <div className="bg-secondary-50/80 p-[24px_28px] rounded-[24px] border border-secondary-100">
              <p className="text-sm text-secondary-600">Launch Date</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" /> 22 Jan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
