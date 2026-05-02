"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      
      // Check session for testing account bypass
      const sessionRes = await fetch("/api/auth/session");
      let currentRegNo = "";
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        if (session.pendaftar_id) {
          const statusRes = await fetch(`/api/pendaftar/status?pendaftar_id=${session.pendaftar_id}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            currentRegNo = statusData.nomor_pendaftaran;
          }
        }
      }

      const response = await fetch("/api/pendaftar/pengumuman");
      if (response.ok) {
        const result = await response.json();
        setPengumuman(result.data);
      } else if (currentRegNo === "ILI2600007") {
        // SPECIAL BYPASS FOR TESTING ACCOUNT: Show mock data if missing
        setPengumuman({
          id: "test-id",
          status_kelulusan: "diterima",
          catatan: "Ini adalah tampilan simulasi khusus untuk Akun Rieza Tes (ILI2600007).",
          tanggal_pengumuman: new Date().toISOString()
        });
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
        await generateSuratKelulusan(currentDocData);
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
    }).replace("Minggu", "Ahad");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-blue-700 mx-auto mb-4" />
          <p className="text-ink-600">Memuat pengumuman...</p>
        </div>
      </div>
    );
  }

  if (!isMounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-brand-blue-800 via-brand-blue-900 to-brand-blue-950 p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-blue-400/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-3xl bg-linear-to-br from-brand-yellow-400 to-brand-yellow-600 flex items-center justify-center shadow-lg border border-white/20 shrink-0"
            >
              <Trophy className="w-10 h-10 text-brand-blue-950" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-white font-display">
                Hasil Seleksi
              </h1>
              <p className="text-brand-yellow-100/80 font-medium text-lg">
                Penerimaan Santri Baru TP 2026/2027
              </p>
            </div>
          </div>
        </div>
      </div>

      {!pengumuman ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-16 shadow-xl border border-brand-blue-100 text-center"
        >
          <div className="w-24 h-24 bg-brand-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-brand-blue-50/50">
            <Calendar className="w-10 h-10 text-brand-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-ink-900 mb-4 font-display">
            Menunggu Pengumuman
          </h3>
          <p className="text-ink-600 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
            Hasil seleksi akan segera diumumkan secara resmi melalui halaman ini. 
            Pastikan Anda terus memantau dashboard untuk informasi terbaru.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-brand-blue-50 text-brand-blue-800 rounded-full font-bold border border-brand-blue-200">
            <Loader2 className="w-5 h-5 animate-spin text-brand-blue-600" />
            <span>Proses Rekapitulasi Data...</span>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Status Card */}
          <div className="lg:col-span-8 space-y-8">
            {pengumuman.status_kelulusan === "diterima" ? (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="group relative bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl shadow-emerald-500/30 overflow-hidden"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                <Trophy className="absolute -bottom-10 -right-10 w-80 h-80 opacity-10 rotate-12 transition-transform duration-700 group-hover:scale-110" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-8">
                    <div className="w-2 h-2 rounded-full bg-brand-yellow-400 animate-pulse" />
                    <span className="text-xs font-black tracking-widest uppercase text-emerald-50">Alhamdulillah</span>
                  </div>
                  
                  <h2 className="text-5xl md:text-6xl font-black font-display tracking-tight text-white mb-6 leading-tight">
                    SELAMAT!<br/>ANDA DITERIMA
                  </h2>
                  
                  <p className="text-emerald-50/90 mb-12 max-w-xl text-xl leading-relaxed font-medium">
                    Kami dengan bangga mengumumkan bahwa berdasarkan hasil seleksi, 
                    Anda dinyatakan <span className="text-brand-yellow-300 font-black underline decoration-brand-yellow-400/50 underline-offset-4">LULUS SELEKSI</span> sebagai santri baru di PP Al Andalus Ulul Albaab.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleDownloadSurat}
                      disabled={isGenerating}
                      className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-brand-blue-950 rounded-2xl font-black hover:bg-brand-yellow-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 group/btn"
                    >
                      {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6 transition-transform group-hover/btn:-translate-y-1" />}
                      Download Surat Kelulusan
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : pengumuman.status_kelulusan === "cadangan" ? (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-linear-to-br from-amber-400 via-amber-500 to-orange-600 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl shadow-amber-500/30 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                <AlertCircle className="absolute -bottom-10 -right-10 w-80 h-80 opacity-10 rotate-12" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-8">
                    <span className="text-xs font-black tracking-widest uppercase text-amber-50">Informasi Penting</span>
                  </div>
                  
                  <h2 className="text-5xl md:text-6xl font-black font-display tracking-tight text-white mb-6 leading-tight">
                    STATUS:<br/>CADANGAN
                  </h2>
                  
                  <p className="text-amber-50/90 mb-12 max-w-xl text-xl leading-relaxed font-medium">
                    Berdasarkan hasil seleksi, Anda menempati posisi <span className="text-brand-blue-950 font-black">CADANGAN</span>. 
                    Anda akan dihubungi oleh panitia jika terdapat kuota yang tersedia di kemudian hari.
                  </p>

                  <button
                    onClick={handleDownloadSurat}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-brand-blue-950 text-white rounded-2xl font-black hover:bg-brand-blue-900 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                    Download Hasil Seleksi
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-linear-to-br from-rose-600 via-red-700 to-red-900 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl shadow-red-600/30 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                <XCircle className="absolute -bottom-10 -right-10 w-80 h-80 opacity-10 rotate-12" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-8">
                    <span className="text-xs font-black tracking-widest uppercase text-red-50">Mohon Maaf</span>
                  </div>
                  
                  <h2 className="text-5xl md:text-6xl font-black font-display tracking-tight text-white mb-6 leading-tight">
                    BELUM DAPAT<br/>DITERIMA
                  </h2>
                  
                  <p className="text-red-50/90 mb-8 max-w-xl text-xl leading-relaxed font-medium">
                    Terima kasih telah berpartisipasi dalam proses seleksi. 
                    Saat ini Anda belum dapat bergabung bersama kami. Tetap semangat dan jangan berkecil hati.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Next Steps / Encouragement */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-brand-blue-100"
            >
              <div className="flex items-start gap-6">
                <div className="p-4 bg-brand-blue-50 rounded-2xl">
                  {pengumuman.status_kelulusan === "diterima" ? (
                    <CheckCircle className="w-8 h-8 text-brand-blue-700" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-brand-blue-700" />
                  )}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-ink-900 mb-4 font-display">
                    {pengumuman.status_kelulusan === "diterima" ? "Langkah Selanjutnya" : "Tetap Semangat"}
                  </h4>
                  {pengumuman.status_kelulusan === "diterima" ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Segera lakukan daftar ulang di tab 'Daftar Ulang'",
                        "Siapkan berkas fisik yang diperlukan",
                        "Pantau terus grup informasi resmi",
                        "Hubungi panitia jika butuh bantuan"
                      ].map((step, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-ink-700 font-medium">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-ink-600 text-lg leading-relaxed font-medium">
                      Anda dapat mencoba kembali pada periode pendaftaran berikutnya. Gunakan waktu ini untuk terus meningkatkan kemampuan dan persiapan diri. Kami mendoakan yang terbaik untuk masa depan pendidikan Anda.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-brand-blue-100 sticky top-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-blue-50 rounded-xl">
                  <FileText className="w-6 h-6 text-brand-blue-700" />
                </div>
                <h3 className="text-xl font-black text-ink-900 font-display">Detail Data</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-brand-blue-400 uppercase tracking-widest block mb-2">Tanggal Rilis</label>
                  <p className="text-lg font-bold text-ink-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-blue-600" />
                    {formatDate(pengumuman.tanggal_pengumuman)}
                  </p>
                </div>

                <div className="h-px bg-linear-to-r from-transparent via-brand-blue-100 to-transparent" />

                <div>
                  <label className="text-xs font-black text-brand-blue-400 uppercase tracking-widest block mb-3">Catatan Panitia</label>
                  <div className="bg-brand-blue-50/50 rounded-2xl p-5 border border-brand-blue-100 italic text-brand-blue-900 leading-relaxed font-medium">
                    "{pengumuman.catatan || "Tidak ada catatan tambahan."}"
                  </div>
                </div>
                
                {pengumuman.status_kelulusan === "diterima" && (
                   <div className="pt-4">
                     <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center">
                        <p className="text-emerald-800 font-bold mb-3">Butuh Bantuan?</p>
                        <a 
                          href="https://wa.me/6281234567890" 
                          target="_blank" 
                          className="inline-flex items-center gap-2 text-sm font-black text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                          Chat Panitia via WhatsApp
                        </a>
                     </div>
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );

}
