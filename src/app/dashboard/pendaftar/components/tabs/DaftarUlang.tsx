"use client";

import { useState, useEffect } from "react";
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

  // Form states
  const [nominal, setNominal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pernyataan, setPernyataan] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
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
    if (amount >= 8500000) return "LUNAS";
    if (amount >= 4250000) return "CICILAN 50% ATAU LEBIH";
    return "CICILAN DIBAWAH 50%";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pernyataan || !file || !nominal) return;

    const amount = parseInt(nominal.replace(/\D/g, ""));
    if (amount < 1000000) {
      setMessage({ type: "error", text: "Minimal pembayaran adalah Rp 1.000.000" });
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

  // Cek Status Kelulusan
  const statusKelulusan = dataUser?.hasil_kelulusan?.status;
  if (statusKelulusan !== "LULUS") {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4">
        <div className="bg-slate-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-brand-blue-950 mb-2">Belum Tersedia</h2>
        <p className="text-ink-500">
          Menu Daftar Ulang hanya tersedia bagi santri yang dinyatakan <strong>LULUS</strong> seleksi.
          <br />Silakan cek menu <strong>Pengumuman</strong> terlebih dahulu.
        </p>
      </div>
    );
  }

  const numericNominal = parseInt(nominal.replace(/\D/g, "") || "0");
  const tipeBayar = calculateTipe(numericNominal);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-linear-to-br from-brand-blue-700 to-brand-blue-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CheckCircle className="w-32 h-32" />
        </div>
        <h1 className="text-3xl font-black mb-2 relative z-10">Daftar Ulang Santri Baru</h1>
        <p className="text-brand-yellow-100 relative z-10 text-lg font-medium">
          Tahap akhir administrasi penerimaan santri baru
        </p>
      </div>

      {/* Info Tagihan */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-brand-blue-100 shadow-sm">
          <h3 className="text-sm font-black text-brand-blue-900 uppercase tracking-wider mb-2">Total Biaya Masuk</h3>
          <div className="text-3xl font-black text-brand-blue-600">Rp 8.500.000</div>
          <p className="text-xs text-ink-400 mt-1">Uang Pangkal (7.5jt) + SPP Bulan Pertama (1jt)</p>
        </div>

        <div className="bg-brand-blue-50 p-6 rounded-xl border border-brand-blue-100">
          <h3 className="text-sm font-black text-brand-blue-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Info Pembayaran
          </h3>
          <ul className="text-sm text-brand-blue-700 space-y-1 list-disc list-inside font-medium">
            <li>Transfer ke Rekening <strong>BSI 7171717171</strong></li>
            <li>a.n <strong>PP Al-Andalus Ulul Albaab</strong></li>
            <li>Wajib bayar cicilan pertama min. <strong>Rp 1.000.000</strong></li>
            <li>Pelunasan maksimal bulan <strong>Juli 2026</strong> (3x Cicilan)</li>
          </ul>
        </div>
      </div>

      {message && (
        <Alert type={message.type} title={message.type === 'success' ? 'Berhasil' : 'Gagal'}>
          {message.text}
        </Alert>
      )}

      {/* Form Upload */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-ink-100 bg-surface-50 flex justify-between items-center">
          <h3 className="font-black text-lg text-ink-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-blue-600" />
            Form Pembayaran & Konfirmasi
          </h3>
          {/* Badge Status Pembayaran User bisa ditaruh sini jika fetch history */}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Input Nominal */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nominal yang Dibayarkan (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
              <input
                type="text"
                value={nominal}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setNominal(new Intl.NumberFormat("id-ID").format(parseInt(val || "0")));
                }}
                className="w-full pl-12 pr-4 py-3 text-lg font-black text-ink-900 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 transition-all shadow-inner"
                placeholder="0"
              />
            </div>

            {/* Dynamic Status Badge */}
            {numericNominal > 0 && (
              <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span className="text-xs text-ink-500 font-medium">Status Pembayaran Anda akan tercatat sebagai:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${tipeBayar === 'LUNAS' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  tipeBayar.includes('50% ATAU LEBIH') ? 'bg-brand-blue-100 text-brand-blue-700 border-brand-blue-200' :
                    'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                  {tipeBayar}
                </span>
              </div>
            )}
          </div>

          {/* Upload File */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Upload Bukti Transfer
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                {file ? (
                  <>
                    <FileText className="w-8 h-8 text-brand-blue-600" />
                    <span className="font-black text-brand-blue-700">{file.name}</span>
                    <span className="text-xs text-ink-400">Klik untuk ganti file</span>
                  </>
                ) : (
                  <>
                    <Send className="w-8 h-8 text-slate-400" />
                    <span className="font-medium text-slate-600">Klik atau tarik file ke sini</span>
                    <span className="text-xs text-slate-400">Format: JPG, PNG, PDF (Max 5MB)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Pernyataan */}
          <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={pernyataan}
              onChange={(e) => setPernyataan(e.target.checked)}
              className="mt-1 w-5 h-5 text-brand-blue-600 rounded border-ink-300 focus:ring-brand-blue-500"
            />
            <div className="text-sm text-slate-600">
              <span className="font-bold text-slate-800 block mb-1">Konfirmasi Kebenaran Data</span>
              Saya menyatakan bukti transfer yang saya unggah adalah benar dan nominal sesuai dengan yang saya inputkan. Saya bersedia mengikuti aturan pembayaran yang berlaku.
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting || !pernyataan || !file || !nominal}
            className="w-full py-4 bg-brand-yellow-400 hover:bg-brand-yellow-300 text-brand-blue-950 font-black rounded-xl shadow-xl shadow-brand-yellow-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-brand-yellow-500"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
            {submitting ? "Mengirim Data..." : "Kirim Konfirmasi Daftar Ulang"}
          </button>

        </form>
      </div>
    </div>
  );
}
