"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Loader2,
  Lock,
  History
} from "lucide-react";
import { Alert } from "@/components/ui";
import { formatCurrency } from "@/lib/utils"; // Ensure this utils exists or use Intl locally

export default function DaftarUlangTab() {
  const [loading, setLoading] = useState(true);
  const [dataUser, setDataUser] = useState<any>(null);
  const [historyResult, setHistoryResult] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);


  // Form states
  const [nominal, setNominal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pernyataan, setPernyataan] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Get User Status
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();

      const statusRes = await fetch(`/api/pendaftar/status?pendaftar_id=${sessionData.pendaftar_id}`);
      const statusData = await statusRes.json();
      setDataUser(statusData);

      // 2. Get Payment History (Daftar Ulang only)
      // Assuming a generic history endpoint exists or we filter client side
      // Currently allow multiple uploads? API blocks verified but allows pending updates.
      // Let's create a visual for "Sudah Lunas" or "Masih Cicilan".
      // Since API only handles creation, we assume dashboard handles history view?
      // For now, check if "Verified" payment exists.

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTipe = (amount: number) => {
    if (amount >= 9800000) return "LUNAS";
    if (amount >= 4900000) return "CICILAN 50% ATAU LEBIH";
    return "CICILAN DIBAWAH 50%";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pernyataan || !file || !nominal) return;

    const amount = parseInt(nominal.replace(/\D/g, ""));
    if (amount < 4900000) {
      setMessage({ type: "error", text: "Pembayaran cicilan pertama DAFTAR ULANG minimal adalah 50% dari uang pangkal (Minimal Rp 4.900.000)" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("jenis_pembayaran", "DAFTAR_ULANG");
    formData.append("jumlah", amount.toString());
    formData.append("file", file);

    try {
      const res = await fetch("/api/pembayaran/manual/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal upload");

      setMessage({ type: "success", text: "Bukti pembayaran berhasil dikirim! Menunggu verifikasi admin." });
      setFile(null);
      setNominal("");
      setPernyataan(false);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue-600" />
      </div>
    );
  }

  if (!isMounted) return null;

  // Cek Status Kelulusan
  const statusKelulusan = dataUser?.hasil_kelulusan?.status;
  const isTestingAccount = dataUser?.nomor_pendaftaran === "ILI2600007";
  const isEnrolled = dataUser?.status_pendaftaran === "enrolled";

  if (statusKelulusan !== "LULUS" && !isTestingAccount) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto text-center py-20 px-4"
      >
        <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center ring-8 ring-slate-50">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-black text-brand-blue-950 mb-4 font-display">Fitur Terkunci</h2>
        <p className="text-ink-500 text-lg leading-relaxed">
          Menu Daftar Ulang hanya tersedia bagi santri yang dinyatakan <span className="text-emerald-600 font-bold">LULUS</span> seleksi.
          <br />Silakan cek menu <strong>Pengumuman</strong> terlebih dahulu.
        </p>
      </motion.div>
    );
  }

  // ENROLLED / LUNAS STATE
  if (isEnrolled) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="bg-linear-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <CheckCircle className="w-48 h-48" />
           </div>
           <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-white/30">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-black mb-4 font-display">PEMBAYARAN LUNAS</h2>
              <p className="text-emerald-50 text-xl max-w-lg leading-relaxed font-medium">
                Alhamdulillah! Pembayaran Daftar Ulang Anda telah kami terima dan verifikasi sepenuhnya.
              </p>
           </div>
        </div>

        <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-emerald-100 flex items-start gap-6">
           <div className="p-4 bg-emerald-50 rounded-2xl">
              <History className="w-8 h-8 text-emerald-600" />
           </div>
           <div>
              <h3 className="text-2xl font-black text-ink-900 mb-3 font-display">Langkah Selanjutnya</h3>
              <p className="text-ink-600 text-lg leading-relaxed mb-6">
                Status Anda kini resmi sebagai santri baru di PP Al Andalus Ulul Albaab. Silakan lengkapi berkas fisik dan pantau grup WhatsApp resmi untuk informasi jadwal kedatangan.
              </p>
              <div className="flex gap-4">
                 <div className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-black border border-emerald-200">
                    STATUS: ENROLLED
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    );
  }

  const numericNominal = parseInt(nominal.replace(/\D/g, "") || "0");
  const tipeBayar = calculateTipe(numericNominal);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="bg-linear-to-br from-brand-blue-800 to-brand-blue-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CheckCircle className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2 tracking-tight font-display">Daftar Ulang</h1>
          <p className="text-brand-yellow-300 text-xl font-medium">
            Tahap akhir administrasi penerimaan santri baru
          </p>
        </div>
      </div>

      {/* Info Tagihan */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-brand-blue-100 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-blue-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
          <h3 className="text-xs font-black text-brand-blue-400 uppercase tracking-[0.2em] mb-4 relative z-10">Total Biaya Masuk</h3>
          <div className="text-4xl font-black text-brand-blue-950 relative z-10 font-display">Rp 9.800.000</div>
          <p className="text-sm text-ink-500 mt-2 relative z-10 font-medium">Uang Pangkal Pesantren Ulul Albaab</p>
        </div>

        <div className="bg-brand-blue-50 p-8 rounded-[2rem] border border-brand-blue-100 shadow-inner">
          <h3 className="text-sm font-black text-brand-blue-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand-blue-600" /> Rekening Pembayaran
          </h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-sm text-brand-blue-700 font-medium">Bank</span>
                <span className="text-sm font-black text-brand-blue-900">BSI (Bank Syariah Indonesia)</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-sm text-brand-blue-700 font-medium">No. Rekening</span>
                <span className="text-sm font-black text-brand-blue-950 bg-white px-3 py-1 rounded-lg border border-brand-blue-200 shadow-sm">7253701263</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-sm text-brand-blue-700 font-medium">Atas Nama</span>
                <span className="text-sm font-black text-brand-blue-900">Al Andalus Ulul Albaab 1</span>
             </div>
          </div>
        </div>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Alert type={message.type} title={message.type === 'success' ? 'Berhasil' : 'Gagal'}>
            {message.text}
          </Alert>
        </motion.div>
      )}

      {/* Form Upload */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-black text-xl text-brand-blue-950 flex items-center gap-3 font-display">
            <div className="p-2 bg-brand-blue-100 rounded-xl">
               <FileText className="w-6 h-6 text-brand-blue-700" />
            </div>
            Form Konfirmasi Pembayaran
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Input Nominal */}
          <div>
            <label className="block text-sm font-black text-slate-700 mb-3 tracking-wide uppercase">
              Nominal Transfer
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-black">Rp</span>
              <input
                type="text"
                value={nominal}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setNominal(new Intl.NumberFormat("id-ID").format(parseInt(val || "0")));
                }}
                className="w-full pl-16 pr-8 py-5 text-2xl font-black text-brand-blue-950 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-blue-500/10 focus:border-brand-blue-500 transition-all shadow-inner bg-slate-50/30"
                placeholder="0"
              />
            </div>

            {/* Dynamic Status Badge */}
            {numericNominal > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-3"
              >
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status:</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black border-2 ${tipeBayar === 'LUNAS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  tipeBayar.includes('50% ATAU LEBIH') ? 'bg-brand-blue-50 text-brand-blue-700 border-brand-blue-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                  {tipeBayar}
                </span>
              </motion.div>
            )}
          </div>

          {/* Upload File */}
          <div>
            <label className="block text-sm font-black text-slate-700 mb-3 tracking-wide uppercase">
              Bukti Transfer
            </label>
            <div className="group border-3 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-brand-blue-400 hover:bg-brand-blue-50/30 transition-all cursor-pointer relative overflow-hidden">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-4 relative z-0">
                {file ? (
                  <>
                    <div className="p-4 bg-brand-blue-100 rounded-2xl">
                      <FileText className="w-10 h-10 text-brand-blue-700" />
                    </div>
                    <span className="font-black text-xl text-brand-blue-900">{file.name}</span>
                    <span className="text-xs text-brand-blue-400 font-bold">GANTI FILE</span>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-slate-100 rounded-2xl group-hover:bg-brand-blue-100 transition-colors">
                      <Send className="w-10 h-10 text-slate-400 group-hover:text-brand-blue-600" />
                    </div>
                    <span className="font-bold text-slate-600 text-lg">Klik untuk unggah berkas</span>
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-black">JPG, PNG, PDF (Max 5MB)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Pernyataan */}
          <label className="flex items-start gap-5 p-6 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/50 cursor-pointer hover:border-brand-blue-200 transition-all group">
            <input
              type="checkbox"
              checked={pernyataan}
              onChange={(e) => setPernyataan(e.target.checked)}
              className="mt-1.5 w-6 h-6 text-brand-blue-600 rounded-lg border-slate-300 focus:ring-brand-blue-500"
            />
            <div className="text-sm text-slate-600 leading-relaxed">
              <span className="font-black text-brand-blue-950 block mb-1 text-lg">Konfirmasi Pembayaran</span>
              Saya menyatakan bahwa bukti transfer yang saya unggah adalah asli dan nominal yang saya inputkan sudah sesuai. Saya memahami bahwa data ini akan diverifikasi oleh panitia.
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting || !pernyataan || !file || !nominal}
            className="w-full py-5 bg-brand-yellow-400 hover:bg-brand-yellow-300 text-brand-blue-950 font-black text-xl rounded-2xl shadow-2xl shadow-brand-yellow-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-2 border-brand-yellow-500 active:scale-95"
          >
            {submitting ? <Loader2 className="w-7 h-7 animate-spin" /> : <Send className="w-6 h-6" />}
            {submitting ? "MEMPROSES..." : "KIRIM KONFIRMASI"}
          </button>
        </form>
      </div>
    </motion.div>
  );

}
