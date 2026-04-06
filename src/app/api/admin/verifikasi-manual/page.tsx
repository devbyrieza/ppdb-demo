// app/admin/verifikasi-manual/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  MessageCircle,
  CheckCircle,
  Copy,
  Phone,
} from "lucide-react";

interface PendingVerifikasi {
  id: string;
  nama_lengkap: string;
  no_hp: string;
  kode_verifikasi: string;
  verifikasi_channel: string;
  verifikasi_status: string;
  created_at: string;
  tahun_ajaran: {
    nama: string;
  };
}

export default function VerifikasiManualPage() {
  const [pending, setPending] = useState<PendingVerifikasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/verifikasi/pending");
      const data = await res.json();
      setPending(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Kode disalin!");
    } catch (error) {
      console.error("Gagal menyalin:", error);
    }
  };

  const markAsSent = async (pendaftarId: string) => {
    try {
      const res = await fetch("/api/admin/verifikasi/mark-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftarId }),
      });

      if (res.ok) {
        fetchPending();
        alert("Status berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Gagal update status:", error);
    }
  };

  const openWhatsApp = (phone: string, kode: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Kode verifikasi PPDB Ponpes Al-Andalus Ulul Albaab: ${kode}`,
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const sendSmsAuto = async (pendaftarId: string, phone: string) => {
    try {
      const res = await fetch("/api/verifikasi/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendaftarId, phone }),
      });

      const data = await res.json();
      if (data.success) {
        alert("SMS berhasil dikirim via Wablas!");
        fetchPending();
      } else {
        alert("Gagal kirim SMS: " + data.error);
      }
    } catch (error) {
      console.error("Error send SMS:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-2">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Verifikasi Manual WhatsApp</h1>
              <p className="text-gray-600">
                Kirim kode verifikasi ke pendaftar via WhatsApp Business App
              </p>
            </div>
            <button
              onClick={fetchPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Daftar Pending */}
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">
                Tidak ada verifikasi pending
              </h3>
            </div>
          ) : (
            pending.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Info Pendaftar */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {item.tahun_ajaran.nama}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {item.verifikasi_channel === "sms_twilio"
                          ? "SMS Auto"
                          : "WhatsApp Manual"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold mb-1">
                      {item.nama_lengkap}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="font-mono">{item.no_hp}</span>
                    </div>
                  </div>

                  {/* Kode OTP */}
                  <div className="bg-blue-50 rounded-lg p-4 min-w-[200px]">
                    <div className="text-sm text-blue-800 mb-1">
                      KODE VERIFIKASI
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold font-mono">
                        {item.kode_verifikasi}
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.kode_verifikasi)}
                        className="p-2 bg-white rounded border"
                        title="Salin kode"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {item.verifikasi_channel === "whatsapp_manual" ? (
                    <>
                      <button
                        onClick={() =>
                          openWhatsApp(item.no_hp, item.kode_verifikasi)
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Buka WhatsApp
                      </button>
                      <button
                        onClick={() => markAsSent(item.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Tandai Sudah Dikirim
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => sendSmsAuto(item.id, item.no_hp)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Kirim via Wablas
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
