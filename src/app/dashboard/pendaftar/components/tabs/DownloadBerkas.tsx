"use client";

import { useState, useEffect } from "react";
import { Download, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import {
  generateBuktiPendaftaran,
  generateKartuUjian
} from "@/lib/utils/pdf-generator";

export default function DownloadBerkasTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocData = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session.pendaftar_id) {
          const res = await fetch(`/api/pendaftar/document-data?pendaftar_id=${session.pendaftar_id}`);
          const result = await res.json();
          setData(result.data);
        }
      } catch (e) {
        console.error("Error fetching doc data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-stone-600">Menyiapkan dokumen...</p>
        </div>
      </div>
    );
  }

  const status = data?.status_proses || "draft";
  const isDataCompleted = ["data_completed", "docs_uploaded", "docs_verified", "scheduled", "tested", "announced", "accepted", "enrolled"].includes(status);
  const isScheduled = ["scheduled", "tested", "announced", "accepted", "enrolled"].includes(status);

  const documents = [
    {
      name: "Bukti Pendaftaran",
      description: "Bukti sudah terdaftar di sistem",
      status: isDataCompleted ? "available" : "pending",
      action: async () => await generateBuktiPendaftaran(data),
    },
    {
      name: "Kartu Ujian",
      description: "Kartu identitas ujian seleksi",
      status: isScheduled ? "available" : "pending",
      action: async () => await generateKartuUjian(data),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-black mb-2">Download Berkas</h1>
        <p className="text-indigo-100">
          Unduh dokumen penting untuk proses pendaftaran
        </p>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-100 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{doc.name}</h3>
                  <p className="text-sm text-stone-600">{doc.description}</p>
                </div>
              </div>
              {doc.status === "available" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              )}
            </div>

            {doc.status === "available" ? (
              <button
                onClick={doc.action}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-stone-200 text-stone-500 rounded-lg font-medium cursor-not-allowed text-xs lg:text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                Disediakan Sesuai Tahapan
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="p-2 bg-blue-200 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-2">Informasi</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Bukti pendaftaran tersedia setelah data diri santri dilengkapi.</li>
              <li>• Kartu Peserta Ujian akan muncul otomatis setelah jadwal ujian dikonfirmasi panitia.</li>
              <li>• Pastikan browser Anda mengizinkan pop-up untuk mengunduh file PDF.</li>
              <li>• Simpan semua dokumen yang diunduh dengan baik atau segera cetak.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
