"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Check, Smartphone, User, Key } from "lucide-react";

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
        body: JSON.stringify({ id, status: "sent" }),
      });

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Memuat data SMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📱 Dashboard Admin - SMS Manual
          </h1>
          <p className="text-gray-600 mb-4">
            Sistem dalam{" "}
            <span className="font-bold text-yellow-600">Simulation Mode</span>.
            Kirim SMS manual ke user berikut:
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-2">📋 Instruksi:</h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Salin nomor HP dan OTP di bawah</li>
              <li>Kirim SMS dari HP Admin ke nomor tersebut</li>
              <li>Pesan: "PPDB AL-IMAM: Kode OTP: [OTP] untuk [NAMA]"</li>
              <li>Klik tombol "✓ Sudah Dikirim" setelah selesai</li>
            </ol>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              📋 Daftar SMS yang Perlu Dikirim: {pendingSMS.length}
            </h2>
            <button
              onClick={fetchPendingSMS}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {pendingSMS.length === 0 ? (
            <div className="text-center py-10">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">
                🎉 Tidak ada SMS yang perlu dikirim!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Semua OTP sudah terkirim atau belum ada pendaftaran.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingSMS.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-amber-200 bg-amber-50 rounded-xl p-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nomor HP</p>
                        <p className="font-bold text-lg">{item.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nama Santri</p>
                        <p className="font-bold text-lg">{item.nama}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
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

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      📝 Pesan yang dikirim:
                    </p>
                    <pre className="bg-gray-900 text-white p-4 rounded-lg text-sm">
                      {`PPDB AL-IMAM
Kode OTP: ${item.otp}
Untuk: ${item.nama}

Jangan bagikan kode ini.
Hubungi 0812-85-300800 jika ada masalah.`}
                    </pre>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => markAsSent(item.id)}
                      className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />✓ Sudah Dikirim
                    </button>

                    <a
                      href={`sms:${item.phone}&body=PPDB AL-IMAM: Kode OTP: ${item.otp} untuk ${item.nama}`}
                      className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                    >
                      📱 Buka Aplikasi SMS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">📊 Status Sistem:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">SMS Service</p>
              <p className="text-2xl font-bold">🔄 Simulation</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Telegram</p>
              <p className="text-2xl font-bold">✅ Ready</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Email</p>
              <p className="text-2xl font-bold">✅ Ready</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-600">Launch Date</p>
              <p className="text-2xl font-bold">📅 22 Jan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
