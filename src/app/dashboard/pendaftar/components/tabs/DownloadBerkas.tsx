"use client";

import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  generateBuktiPendaftaran,
  generateKartuUjian,
  generateSuratKesehatan,
  generatePaktaIntegritas,
  generateSuratPernyataan,
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
          const res = await fetch(
            `/api/pendaftar/document-data?pendaftar_id=${session.pendaftar_id}`,
          );
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
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-ink-600 font-medium">Menyiapkan dokumen...</p>
        </div>
      </div>
    );
  }

  const status = data?.status_proses || "draft";
  const isDataCompleted = [
    "data_completed",
    "docs_uploaded",
    "docs_verified",
    "scheduled",
    "tested",
    "announced",
    "accepted",
    "enrolled",
  ].includes(status);
  const isScheduled = [
    "scheduled",
    "tested",
    "announced",
    "accepted",
    "enrolled",
  ].includes(status);

  const documents = [
    {
      name: "Bukti Pendaftaran",
      description: "Bukti sudah terdaftar di sistem",
      status: isDataCompleted ? "available" : "pending",
      action: async () => await generateBuktiPendaftaran(data),
    },
    {
      name: "kartu seleksi",
      description: "Kartu identitas ujian seleksi",
      status: isScheduled ? "available" : "pending",
      action: async () => await generateKartuUjian(data),
    },
    {
      name: "Template Surat Sehat",
      description: "Format kosong surat keterangan sehat",
      status: "available",
      action: async () => await generateSuratKesehatan(data),
    },
    {
      name: "Pakta Integritas",
      description: "Format kosong pakta integritas santri",
      status: "available",
      action: async () => await generatePaktaIntegritas(data),
    },
    {
      name: "Surat Pernyataan",
      description: "Format kosong pernyataan bebas perilaku negatif",
      status: "available",
      action: async () => await generateSuratPernyataan(data),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-primary-700 to-primary-900 border border-primary-600 p-5 md:p-8 text-white shadow-lg app-card">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary-50/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm shrink-0">
            <Download className="w-8 h-8 text-secondary-100" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-white font-display">
              Download Berkas
            </h1>
            <p className="text-secondary-100/90 font-medium max-w-xl text-sm md:text-base">
              Unduh dokumen penting untuk proses pendaftaran Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Helper Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm mb-6">
        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
        <div>
          <h3 className="font-bold text-amber-900 mb-1 text-sm md:text-base">Mencari Dokumen yang Sudah Diupload?</h3>
          <p className="text-amber-800 text-sm">
            Jika Anda ingin mengunduh berkas yang <strong>sudah Anda upload sebelumnya</strong> (seperti Surat Sehat, KK, Akte, dll), silakan buka menu <span className="font-bold">Upload Berkas</span> lalu klik ikon <span className="font-bold inline-flex items-center gap-1 mx-1"><Download className="w-3.5 h-3.5" /> Download</span> di sebelah dokumen Anda.
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="bg-white rounded-[2rem] shadow-sm p-6 border border-secondary-200 hover:border-primary-300 transition-all duration-300 group app-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-50 rounded-2xl group-hover:bg-primary-100 transition-colors">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{doc.name}</h3>
                  <p className="text-sm text-stone-600">{doc.description}</p>
                </div>
              </div>
              {doc.status === "available" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-secondary-600" />
              )}
            </div>

            {doc.status === "available" ? (
              <button
                onClick={doc.action}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            ) : doc.status === "locked" ? (
              <button
                disabled
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-stone-100 text-stone-400 rounded-lg font-medium cursor-not-allowed text-xs lg:text-sm border border-stone-200"
              >
                <AlertCircle className="w-4 h-4" />
                Belum Tersedia
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
      <div className="bg-primary-50 border border-primary-100 rounded-[2rem] p-5 md:p-8">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-primary-100">
              <AlertCircle className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div>
            <h4 className="font-black text-primary-900 mb-3 text-lg">
              Informasi Penting
            </h4>
            <ul className="text-sm text-primary-800 space-y-2 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-1">●</span>
                <span>
                  Bukti pendaftaran tersedia setelah data diri santri dilengkapi
                  sepenuhnya.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-1">●</span>
                <span>
                  Kartu Peserta Ujian akan muncul otomatis setelah jadwal
                  seleksi dikonfirmasi oleh panitia.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-1">●</span>
                <span>
                  Pastikan browser Anda mengizinkan pop-up untuk mengunduh file
                  PDF secara otomatis.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-1">●</span>
                <span>
                  Simpan semua dokumen yang diunduh dengan baik atau segera
                  cetak untuk keperluan fisik.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
