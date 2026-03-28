"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  FileText,
  Download,
} from "lucide-react";
import { generateSuratKelulusan } from "@/lib/utils/pdf-generator";

interface Pengumuman {
  id: string;
  status_kelulusan: string;
  catatan: string | null;
  tanggal_pengumuman: string;
}

export default function PengumumanTab() {
  const [pengumuman, setPengumuman] = useState<Pengumuman | null>(null);
  const [docData, setDocData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pendaftar/pengumuman");
      if (response.ok) {
        const result = await response.json();
        setPengumuman(result.data);
      }
    } catch (error) {
      console.error("Error fetching pengumuman:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSurat = async () => {
    try {
      setIsGenerating(true);

      // If docData not yet fetched, fetch it now
      let currentDocData = docData;
      if (!currentDocData) {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session.pendaftar_id) {
          const res = await fetch(`/api/pendaftar/document-data?pendaftar_id=${session.pendaftar_id}`);
          const result = await res.json();
          currentDocData = result.data;
          setDocData(currentDocData);
        }
      }

      if (currentDocData) {
        generateSuratKelulusan(currentDocData);
      }
    } catch (error) {
      console.error("Error generating surat kelulusan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-maroon-700 mx-auto mb-4" />
          <p className="text-stone-600">Memuat pengumuman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-maroon-700 to-maroon-900 border border-maroon-600 p-8 md:p-10 text-white shadow-lg app-card">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cream-50/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm shrink-0">
              <Trophy className="w-8 h-8 text-cream-100" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-white font-display">Pengumuman</h1>
              <p className="text-cream-100/90 font-medium max-w-xl text-sm md:text-base">
                Hasil seleksi penerimaan santri baru
              </p>
            </div>
          </div>
        </div>
      </div>

      {!pengumuman ? (
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-cream-200 app-card">
          <div className="text-center">
            <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-maroon-700" />
            </div>
            <h3 className="text-xl font-bold text-ink-900 mb-3 font-display">
              Pengumuman Belum Tersedia
            </h3>
            <p className="text-ink-600 max-w-md mx-auto mb-6 leading-relaxed">
              Hasil seleksi akan diumumkan setelah seluruh proses ujian selesai dilakukan oleh panitia.
              Silakan cek kembali halaman ini secara berkala.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-cream-50 text-maroon-800 rounded-pill font-bold border border-cream-200 shadow-sm">
              <Calendar className="w-4 h-4 text-maroon-600" />
              <span className="text-sm">
                Estimasi update: setelah ujian selesai
              </span>
            </div>
          </div>
        </div>
      ) : pengumuman.status_kelulusan === "diterima" ? (
        <div className="space-y-6">
          {/* Success Card */}
          <div className="bg-linear-to-r from-emerald-500 to-emerald-700 rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden app-card">
            <div className="absolute -top-10 -right-10 p-8 opacity-10 transform rotate-12">
              <Trophy className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-5 mb-8">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-[1.5rem] shadow-sm border border-white/20">
                  <CheckCircle className="w-10 h-10 text-emerald-50" />
                </div>
                <div>
                  <p className="text-emerald-100 font-bold tracking-widest uppercase text-sm mb-1">Alhamdulillah</p>
                  <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight text-white">LULUS SELEKSI</h2>
                </div>
              </div>
              <p className="text-emerald-50/90 mb-10 max-w-xl text-lg leading-relaxed">
                Berdasarkan hasil seleksi, Anda dinyatakan <strong>LULUS DITERIMA</strong> sebagai santri baru PP Al-Andalus Al-Imam.
              </p>
 
              <button
                onClick={handleDownloadSurat}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-white text-emerald-700 rounded-pill font-bold hover:bg-emerald-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Download Surat Kelulusan
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                Detail Pengumuman
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-stone-500 mb-1">
                  Tanggal Pengumuman
                </p>
                <p className="font-bold text-stone-900">
                  {formatDate(pengumuman.tanggal_pengumuman)}
                </p>
              </div>

              {pengumuman.catatan && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Catatan:</strong> {pengumuman.catatan}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-amber-700" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-amber-900 mb-2">
                  Langkah Selanjutnya
                </h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Segera lakukan daftar ulang melalui tab "Daftar Ulang"</li>
                  <li>• Siapkan dokumen yang diperlukan untuk daftar ulang</li>
                  <li>• Ikuti petunjuk yang diberikan oleh panitia</li>
                  <li>• Hubungi panitia jika ada pertanyaan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Failed Card */}
          <div className="bg-linear-to-r from-red-600 to-rose-700 rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-red-600/20 app-card overflow-hidden relative">
            <div className="absolute -top-10 -right-10 p-8 opacity-10 transform rotate-12">
              <XCircle className="w-64 h-64" />
            </div>
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-[1.5rem] shadow-sm border border-white/20">
                <XCircle className="w-10 h-10 text-red-50" />
              </div>
              <div>
                <p className="text-red-100 font-bold tracking-widest uppercase text-sm mb-1">Mohon Maaf</p>
                <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight text-white">BELUM BERHASIL</h2>
              </div>
            </div>
            <p className="text-red-50/90 leading-relaxed max-w-xl text-lg relative z-10">
              Berdasarkan hasil seleksi, Anda belum dapat diterima pada periode
              ini. Tetap semangat dan jangan berkecil hati.
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                Detail Pengumuman
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-stone-500 mb-1">
                  Tanggal Pengumuman
                </p>
                <p className="font-bold text-stone-900">
                  {formatDate(pengumuman.tanggal_pengumuman)}
                </p>
              </div>

              {pengumuman.catatan && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Catatan:</strong> {pengumuman.catatan}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Encouragement */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-700" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-2">Tetap Semangat!</h4>
                <p className="text-sm text-blue-800">
                  Anda dapat mendaftar kembali pada periode pendaftaran
                  berikutnya. Gunakan kesempatan ini untuk mempersiapkan diri
                  dengan lebih baik. Jangan ragu untuk bertanya kepada panitia
                  mengenai hal yang perlu ditingkatkan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
